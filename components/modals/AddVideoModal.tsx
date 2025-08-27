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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <div className="flex space-x-3">
            <input
              type="url"
              id="video-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="https://www.youtube.com/watch?v=..."
              autoFocus
            />
            <button
              type="button"
              onClick={handleFetchDetails}
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-100 text-blue-700 font-medium rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-wait"
            >
              {isLoading ? 'Fetching...' : 'Fetch'}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        {videoDetails && (
            <div className="border border-gray-200 rounded-xl p-4 bg-slate-50">
                <h4 className="font-medium text-gray-800 mb-3">Video Preview</h4>
                <div className="flex items-start space-x-4">
                    <img src={videoDetails.thumbnail_url} alt="Video thumbnail" className="w-40 h-auto rounded-lg shadow-sm" />
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">{videoDetails.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{videoDetails.author_name}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
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