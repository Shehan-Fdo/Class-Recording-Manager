import React from 'react';
import Modal from '../common/Modal';
import { SparklesIcon } from '../Icons';

interface VideoSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

const VideoSummaryModal: React.FC<VideoSummaryModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  summary,
  isLoading,
  error,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Video Summary">
      <div className="space-y-4">
        <h4 className="font-medium text-lg text-gray-800">{videoTitle}</h4>
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3 text-gray-600">
            <SparklesIcon className="w-10 h-10 animate-pulse text-blue-500" />
            <p className="font-medium">Generating summary...</p>
            <p className="text-sm text-center">Our AI assistant is thinking. This might take a moment.</p>
          </div>
        )}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                </div>
            </div>
        )}
        {summary && !isLoading && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
        )}
      </div>
    </Modal>
  );
};

export default VideoSummaryModal;
