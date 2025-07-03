import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file.' },
        { status: 400 }
      );
    }

    // Forward the request to the FastAPI backend
    const backendUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(`${backendUrl}/api/analyze-excel`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        'Authorization': request.headers.get('authorization') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Backend processing failed' },
        { status: response.status }
      );
    }

    // Expect JSON result from backend
    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Excel Analysis API',
    status: 'operational',
    endpoints: {
      POST: '/api/analyze-excel - Upload and process Excel files',
    },
  });
} 