export async function vectorizeDoc(file: File): Promise<any> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_VECTORIZE_API_URL || 'http://localhost:8000/api/vectorize';
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || `Backend error: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || 'Failed to vectorize document');
  }
} 