
import React, { useState } from 'react';
import Modal from '../common/Modal';
import { fetchVideoDetails, type YouTubeVideoDetails } from '../../services/youtubeService';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (url: string) => Promise<void>;
  lessonName: string;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ isOpen, onClose, onAddVideo, lessonName }) => {
  const [url, setUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState<YouTubeVideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setUrl('');
    setVideoDetails(null);
    setIsLoading(false);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFetchDetails = async () => {
    if (!url.trim()) {
        setError('Please enter a YouTube URL.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setVideoDetails(null);
    try {
      const details = await fetchVideoDetails(url);
      setVideoDetails(details);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoDetails) {
        setError("Please fetch video details before adding.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        await onAddVideo(url);
        handleClose();
    } catch (err: any) {
        setError(err.message || "Failed to add video.");
        setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Video to ${lessonName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="video-url" className="block text-sm font-medium text-gray-300 mb-1">
            YouTube Video URL
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.youtube.com/watch?v=..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleFetchDetails}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400 transition-colors disabled:bg-gray-700 disabled:cursor-wait"
            >
              {isLoading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        {videoDetails && (
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-900/50">
                <h4 className="font-semibold text-white mb-2">Video Preview</h4>
                <div className="flex items-start space-x-3">
                    <img src={videoDetails.thumbnail_url} alt="Video thumbnail" className="w-32 h-auto rounded-md" />
                    <div className="flex-1">
                        <p className="font-medium text-gray-100">{videoDetails.title}</p>
                        <p className="text-sm text-gray-400">{videoDetails.author_name}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
            disabled={!videoDetails || isLoading}
          >
            {isLoading && videoDetails ? 'Adding...' : 'Add Video'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVideoModal;
