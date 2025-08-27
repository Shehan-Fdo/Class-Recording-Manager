import { GoogleGenAI } from "@google/genai";

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const { title, author } = await req.json();

    if (!title || !author) {
      return new Response(JSON.stringify({ error: 'Title and author are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        As a helpful learning assistant, please provide a concise, one-paragraph summary of the likely content of the following YouTube video.
        Base your summary on the video's title and author. Explain what a student might learn from it.

        Video Title: "${title}"
        Author/Channel: "${author}"
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return new Response(JSON.stringify({ summary: response.text.trim() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/summarize-video:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to generate video summary.", details: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
