# i-WMS - Intelligent Warehouse Management System

A comprehensive warehouse management system built with Next.js, featuring AI-powered analytics, Excel processing, and real-time monitoring capabilities.

## 🚀 Features

### 1. Web Architecture & Frameworks
- **Next.js 14** with App Router for optimal performance and SEO
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for atomic styling and responsive design
- **Framer Motion** for smooth animations and transitions
- **Serverless deployment** ready for Vercel

### 2. UI/UX Design & Animations
- **Futuristic and professional** interface designed for warehouse operations
- **High information density** with clean typography and intuitive navigation
- **Fluid micro-animations** using Framer Motion
- **Responsive design** optimized for all screen sizes
- **Glass morphism effects** and modern visual elements

### 3. Excel Processing Logic
- **FastAPI backend** integration for Excel file processing
- **RMS algorithm** implementation for pallet movement analysis
- **Shift-based performance** calculations and time-bucket aggregation
- **Real-time file upload** with progress tracking
- **Automated Excel report generation** with formulas and formatting

### 4. Statistical Visualization
- **Recharts integration** for interactive data visualization
- **Looker Studio-inspired** dashboards and charts
- **Real-time KPI monitoring** with trend indicators
- **Exportable reports** and data visualization
- **Responsive chart layouts** with animated tooltips

### 5. AI Integration
- **LangChain.js** for AI-powered analytics
- **Gemini API** integration for natural language processing
- **Context-aware AI assistant** for warehouse queries
- **Retrieval-augmented generation** capabilities
- **Real-time AI insights** and recommendations

### 6. Deployment & Operationalization
- **Vercel deployment** with edge functions
- **Environment variable management** for secure configuration
- **API rate limiting** and error handling
- **Logging and monitoring** capabilities
- **Scalable architecture** for production use

## 📁 Project Structure

```
i-wms/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── analyze-excel/        # Excel processing endpoint
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main dashboard
├── components/                   # React components
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Dashboard.tsx            # Main dashboard
│   ├── ExcelProcessor.tsx       # Excel upload/processing
│   ├── AIAssistant.tsx          # AI chat interface
│   └── Analytics.tsx            # Advanced analytics
├── reference/                    # Backend reference
│   └── api_process.py           # FastAPI backend
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── next.config.js               # Next.js configuration
└── README.md                    # Project documentation
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Chart library
- **Lucide React** - Icon library
- **React Dropzone** - File upload handling
- **React Hot Toast** - Toast notifications

### Backend Integration
- **FastAPI** - Python backend for Excel processing
- **Pandas** - Data manipulation and analysis
- **OpenPyXL** - Excel file handling
- **XlsxWriter** - Excel report generation

### AI & Analytics
- **LangChain.js** - AI framework
- **Google Gemini API** - Large language model
- **ChromaDB** - Vector database (optional)
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+ (for FastAPI backend)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd i-wms
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd reference
   pip install fastapi uvicorn pandas openpyxl xlsxwriter
   ```

4. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   FASTAPI_URL=http://localhost:8000
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Start the FastAPI backend**
   ```bash
   cd reference
   python api_process.py
   ```

6. **Start the Next.js development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Features Overview

### Dashboard
- **Real-time KPI monitoring** with trend indicators
- **Interactive charts** for performance visualization
- **System status** and alert monitoring
- **Quick action buttons** for common tasks

### Excel Processor
- **Drag & drop file upload** with validation
- **Real-time processing status** with progress tracking
- **RMS algorithm integration** for pallet analysis
- **Automated report generation** with Excel formulas
- **Download processed files** with custom naming

### AI Assistant
- **Natural language queries** for warehouse data
- **Context-aware responses** based on system data
- **Quick query templates** for common questions
- **Real-time chat interface** with typing indicators
- **AI-powered insights** and recommendations

### Analytics
- **Advanced data visualization** with multiple chart types
- **Time-based filtering** and date range selection
- **Equipment status monitoring** with real-time updates
- **Performance trend analysis** with historical data
- **Export capabilities** for reports and data

## 🔧 Configuration

### Environment Variables
```env
# Backend Configuration
FASTAPI_URL=http://localhost:8000

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
LANGCHAIN_API_KEY=your_langchain_key

# Database (Optional)
CHROMA_DB_PATH=./chroma_db

# Deployment
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- **Custom color palette** for warehouse themes
- **Custom animations** for smooth transitions
- **Responsive breakpoints** for all devices
- **Custom utilities** for common patterns

### API Configuration
- **CORS handling** for cross-origin requests
- **Rate limiting** to prevent abuse
- **Error handling** with detailed logging
- **File upload limits** and validation

## 🚀 Deployment

### Vercel Deployment
1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on git push
4. **Configure custom domain** (optional)

### Backend Deployment
The FastAPI backend can be deployed to:
- **Fly.io** - Simple container deployment
- **Railway** - Easy Python deployment
- **AWS Lambda** - Serverless functions
- **Docker** - Containerized deployment

## 📈 Performance Optimization

### Frontend
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** and optimization
- **Lazy loading** for non-critical components

### Backend
- **Async processing** for large files
- **Caching strategies** for repeated queries
- **Database optimization** for large datasets
- **Memory management** for Excel processing

## 🔒 Security

### Frontend Security
- **Input validation** and sanitization
- **CSRF protection** with Next.js
- **Content Security Policy** headers
- **Secure file upload** validation

### Backend Security
- **API key management** for external services
- **File type validation** for uploads
- **Rate limiting** to prevent abuse
- **Error handling** without sensitive data exposure

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for questions

## 🔄 Version History

### v2.0.0 (Current)
- Complete UI redesign with modern components
- AI assistant integration with LangChain
- Advanced analytics with Recharts
- Excel processing with FastAPI backend
- Real-time dashboard with live data

### v1.0.0
- Initial release with basic functionality
- Excel upload and processing
- Simple dashboard interface

## 📊 System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0+
- **npm**: 8.0.0+
- **Python**: 3.8+
- **RAM**: 4GB+
- **Storage**: 2GB+

### Recommended Requirements
- **Node.js**: 20.0.0+
- **npm**: 10.0.0+
- **Python**: 3.11+
- **RAM**: 8GB+
- **Storage**: 5GB+

## 🎯 Roadmap

### Upcoming Features
- [ ] **Real-time notifications** with WebSocket
- [ ] **Mobile app** with React Native
- [ ] **Advanced AI models** integration
- [ ] **Multi-warehouse support**
- [ ] **Advanced reporting** with custom templates
- [ ] **Integration APIs** for third-party systems

### Planned Improvements
- [ ] **Performance optimization** for large datasets
- [ ] **Enhanced security** features
- [ ] **Better error handling** and recovery
- [ ] **Comprehensive testing** suite
- [ ] **Documentation improvements**

---

**@Robotjaol @Kambingturbo** 