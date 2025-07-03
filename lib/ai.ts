/**
 * queryAI - Sends a user message (and optional files) to your backend for RAG/vector search/LLM response.
 *
 * @param {Object} params
 * @param {string} params.message - The user's message or question.
 * @param {File[]} [params.files] - Optional files to include for vectorization/context.
 * @returns {Promise<string>} - The AI/LLM response from your backend.
 *
 * ---
 * TODO:
 * - Set your backend URL (FastAPI, Node, etc.)
 * - Add authentication (API key, JWT, etc.) if needed
 * - Adjust payload for your backend's expected format
 * - Handle file uploads if your backend supports it
 */
export async function queryAI({ message, files }: { message: string; files?: File[] }): Promise<string> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:8000/api/query';
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const formData = new FormData();
  formData.append('query', message);
  if (files && files.length > 0) {
    files.forEach((file, idx) => {
      formData.append(`file${idx + 1}`, file);
    });
  }
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
    const data = await res.json();
    return data.answer || data.response || JSON.stringify(data);
  } catch (err: any) {
    throw new Error(err.message || 'Failed to fetch AI response');
  }
} 