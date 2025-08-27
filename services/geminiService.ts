export interface OrganizedVideos {
  lessonName: string;
  videoUrls: string[];
}

/**
 * Uses a secure backend endpoint to parse a block of text and extract video data.
 * @param text The unstructured text containing video links and context.
 * @returns A promise that resolves to an OrganizedVideos object.
 */
export const organizeVideosWithGemini = async (text: string): Promise<OrganizedVideos> => {
  try {
    const response = await fetch('/api/organize-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error organizing videos:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to process text. Please check your network connection.");
  }
};

/**
 * Uses a secure backend endpoint to generate a video summary.
 * @param title The title of the YouTube video.
 * @param author The author/channel of the YouTube video.
 * @returns A promise that resolves to a string containing the summary.
 */
export const summarizeVideoWithGemini = async (title: string, author: string): Promise<string> => {
    try {
        const response = await fetch('/api/summarize-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, author }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.error("Error summarizing video:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate summary. Please check your network connection.");
    }
};
