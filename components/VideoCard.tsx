import React from 'react';
import type { Video } from '../types';
import { TrashIcon, CheckCircleIcon } from './Icons';

interface VideoCardProps {
  video: Video;
  onDelete: () => void;
  onToggleWatched: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDelete, onToggleWatched }) => {
  return (
    <div className={`relative group bg-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-indigo-500/30 flex p-4 gap-4 ${video.watched ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-48 h-27 block rounded-md overflow-hidden">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        {video.watched && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
            </div>
        )}
      </a>

      {/* Content */}
      <div className="flex-grow flex flex-col min-w-0">
        <h3 className="font-bold text-lg text-gray-100 mb-1">
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors duration-200">
                {video.title}
            </a>
        </h3>
        <p className="text-sm text-gray-400 mb-4 flex-grow">{video.authorName}</p>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={video.watched}
                    onChange={onToggleWatched}
                    className="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 cursor-pointer"
                    id={`watched-${video.id}`}
                />
                <label htmlFor={`watched-${video.id}`} className="ml-2 text-sm text-gray-300 select-none cursor-pointer">
                    Mark as Watched
                </label>
            </div>

            <button
              onClick={onDelete}
              className="p-2 text-gray-400 rounded-full hover:bg-red-500/80 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete video"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;