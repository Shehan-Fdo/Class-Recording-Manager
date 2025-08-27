import { GoogleGenAI, Type } from "@google/genai";

// This service assumes process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface OrganizedVideos {
  lessonName: string;
  videoUrls: string[];
}

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

/**
 * Uses the Gemini API to parse a block of text and extract a lesson name and YouTube video URLs.
 * @param text The unstructured text containing video links and context.
 * @returns A promise that resolves to an OrganizedVideos object.
 */
export const organizeVideosWithGemini = async (text: string): Promise<OrganizedVideos> => {
  if (!process.env.API_KEY) {
    // In a real app, you might want a more user-friendly notification.
    // For this context, throwing an error is fine to indicate a config issue.
    console.error("API_KEY environment variable not set.");
    throw new Error("Gemini API key is not configured. Please contact support.");
  }

  try {
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

    const jsonString = response.text.trim();
    // A secondary check to ensure the response is valid JSON before parsing
    if (!jsonString.startsWith('{') && !jsonString.endsWith('}')) {
       throw new Error("AI response was not valid JSON.");
    }

    const parsedData = JSON.parse(jsonString);

    if (!parsedData.lessonName || !Array.isArray(parsedData.videoUrls)) {
        throw new Error("AI response is missing required 'lessonName' or 'videoUrls' fields.");
    }
    
    // Filter out any non-string or empty values from the URLs array
    parsedData.videoUrls = parsedData.videoUrls.filter((url: any) => typeof url === 'string' && url.trim() !== '');

    return parsedData;

  } catch (error) {
    console.error("Error organizing videos with Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('Invalid request')) {
             throw new Error("Invalid request to the AI service. The API key might be invalid or the service may be unavailable.");
        }
    }
    throw new Error("Failed to process text with the AI service. Please try again later.");
  }
};
