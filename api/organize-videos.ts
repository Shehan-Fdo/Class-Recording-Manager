import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text content is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          lessonName: {
            type: Type.STRING,
            description: "A suitable name for the lesson based on the provided text. e.g., 'Operating Systems'",
          },
          videoUrls: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "An array of all the YouTube video URLs found in the text.",
          },
        },
        required: ["lessonName", "videoUrls"],
    };

    const prompt = `
      Analyze the following text to identify a suitable title for a lesson or playlist.
      Then, extract all unique YouTube video URLs. URLs can be in various formats (e.g., youtu.be, youtube.com/watch).
      Provide the result in the specified JSON format.

      Text to analyze:
      ---
      ${text}
      ---
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsedData = JSON.parse(response.text.trim());

    if (!parsedData.lessonName || !Array.isArray(parsedData.videoUrls)) {
        throw new Error("AI response is missing required fields.");
    }
    
    return new Response(JSON.stringify(parsedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/organize-videos:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: "Failed to process text with the AI service.", details: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
