import React from 'react';
import type { Video } from '../types';
import { TrashIcon, CheckCircleIcon, ArrowsRightLeftIcon } from './Icons';

interface VideoCardProps {
  video: Video;
  onDelete: () => void;
  onToggleWatched: () => void;
  onMove: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDelete, onToggleWatched, onMove }) => {
  return (
    <div className={`relative group bg-white border border-transparent rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex p-4 gap-5 ${video.watched ? 'opacity-60 bg-slate-100' : ''}`}>
      {/* Thumbnail */}
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 w-48 h-27 block rounded-lg overflow-hidden shadow-md">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        {video.watched && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-white" />
            </div>
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded">
            ▶ WATCH
         </div>
      </a>

      {/* Content */}
      <div className="flex-grow flex flex-col min-w-0">
        <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors duration-200">
                {video.title}
            </a>
        </h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{video.authorName}</p>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-1 mt-auto">
            <button
                onClick={onToggleWatched}
                aria-label={video.watched ? 'Mark as unwatched' : 'Mark as watched'}
                className={`p-2 rounded-full transition-colors duration-200 ${video.watched ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:bg-gray-200'}`}
            >
                <CheckCircleIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onMove}
                aria-label="Move video"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
            >
                <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onDelete}
                aria-label="Delete video"
                className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
