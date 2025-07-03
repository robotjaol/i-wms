# Deployment Guide - i-WMS

This guide covers deploying the i-WMS system to various platforms and environments.

## 🚀 Quick Deployment Options

### 1. Vercel (Recommended)

#### Frontend Deployment
1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```env
   FASTAPI_URL=https://your-backend-url.com
   GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Custom Domain** (Optional)
   - Go to Vercel dashboard
   - Navigate to your project
   - Add custom domain in Settings > Domains

#### Backend Deployment Options

##### Option A: Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Create app
fly apps create i-wms-backend

# Deploy
fly deploy
```

##### Option B: Railway
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically on push

##### Option C: Render
1. Create new Web Service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn api_process:app --host 0.0.0.0 --port $PORT`

## 🔧 Production Configuration

### Environment Variables

#### Frontend (.env.local)
```env
# Backend Configuration
FASTAPI_URL=https://your-backend-url.com

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
LANGCHAIN_API_KEY=your_langchain_key

# Security
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Performance
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Backend (Environment Variables)
```env
# Server Configuration
HOST=0.0.0.0
PORT=8000

# Security
CORS_ORIGINS=https://your-domain.com
API_KEY=your_api_key

# File Processing
MAX_FILE_SIZE=10485760
TEMP_DIR=./temp_files

# Logging
LOG_LEVEL=info
LOG_FILE=app.log
```

### Security Configuration

#### CORS Setup
```python
# In FastAPI backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Rate Limiting
```python
# Add rate limiting to FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/process-file/")
@limiter.limit("10/minute")
async def process_file(request: Request, file: UploadFile = File(...)):
    # Your processing logic
    pass
```

## 📊 Monitoring & Logging

### Frontend Monitoring
```javascript
// Add error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### Backend Logging
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('app.log', maxBytes=10000000, backupCount=5),
        logging.StreamHandler()
    ]
)
```

## 🔄 CI/CD Pipeline

### GitHub Actions

#### Frontend Deployment
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          FASTAPI_URL: ${{ secrets.FASTAPI_URL }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

#### Backend Deployment
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['reference/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd reference
          pip install -r requirements.txt
      
      - name: Deploy to Fly.io
        run: |
          cd reference
          fly deploy
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## 🐳 Docker Deployment

### Frontend Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Backend Dockerfile
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp_files

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "api_process:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - FASTAPI_URL=http://backend:8000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - backend

  backend:
    build: ./reference
    ports:
      - "8000:8000"
    volumes:
      - ./temp_files:/app/temp_files
    environment:
      - HOST=0.0.0.0
      - PORT=8000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt with Nginx
```nginx
# nginx.conf
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📈 Performance Optimization

### Frontend Optimization
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Backend Optimization
```python
# Add caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache

# Add compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in allowed origins

2. **File Upload Failures**
   - Check file size limits
   - Verify file type validation
   - Ensure temp directory permissions

3. **AI Assistant Not Working**
   - Verify API keys are set correctly
   - Check network connectivity to AI services
   - Review rate limits

4. **Performance Issues**
   - Monitor memory usage
   - Check database connections
   - Review caching configuration

### Debug Mode
```bash
# Frontend debug
NODE_ENV=development npm run dev

# Backend debug
LOG_LEVEL=debug python api_process.py
```

## 📞 Support

For deployment issues:
1. Check logs in your hosting platform
2. Verify environment variables
3. Test locally first
4. Review this documentation
5. Create an issue in the repository

---

**Happy Deploying! 🚀** 