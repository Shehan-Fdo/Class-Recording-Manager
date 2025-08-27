export interface YouTubeVideoDetails {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const fetchVideoDetails = async (url: string): Promise<YouTubeVideoDetails> => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    // Use noembed.com as a more reliable service to bypass CORS issues for oEmbed.
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`);
    
    if (!response.ok) {
        // This case might not be hit if noembed always returns 200, but it's good practice.
        throw new Error(`Failed to fetch video details. Service responded with status: ${response.status}`);
    }
    
    const data = await response.json();

    // noembed.com returns an 'error' property in the JSON for failed lookups (e.g., video not found).
    if (data.error) {
        throw new Error(data.error);
    }
    
    // Ensure the response contains the data we need.
    if (!data.title || !data.author_name || !data.thumbnail_url) {
        throw new Error('Incomplete video details received from the service.');
    }

    const videoDetails: YouTubeVideoDetails = {
        title: data.title,
        author_name: data.author_name,
        thumbnail_url: data.thumbnail_url,
    };
    
    return videoDetails;
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    // Re-throw the error to be caught by the UI component.
    if (error instanceof Error) {
        throw new Error(error.message || 'Could not fetch video details. Please check the URL and your network connection.');
    }
    throw new Error('An unknown error occurred while fetching video details.');
  }
};