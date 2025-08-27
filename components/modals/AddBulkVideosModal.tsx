import React, { useState } from 'react';
import Modal from '../common/Modal';
import { organizeVideosWithGemini, type OrganizedVideos } from '../../services/geminiService';
import { SparklesIcon } from '../Icons';

interface AddBulkVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBulkVideos: (lessonName: string, urls: string[]) => Promise<number>;
  subjectName: string;
}

const AddBulkVideosModal: React.FC<AddBulkVideosModalProps> = ({ isOpen, onClose, onAddBulkVideos, subjectName }) => {
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState<OrganizedVideos | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setText('');
    setParsedData(null);
    setIsParsing(false);
    setIsAdding(false);
    setError(null);
  };
  
  const handleClose = () => {
      resetState();
      onClose();
  };

  const handleParseText = async () => {
    if (!text.trim()) {
      setError('Please paste some text with YouTube links.');
      return;
    }
    setIsParsing(true);
    setError(null);
    setParsedData(null);
    try {
      const result = await organizeVideosWithGemini(text);
      if (result.videoUrls.length === 0) {
        setError('No YouTube video URLs were found in the text.');
      } else {
        setParsedData(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse text with AI.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddVideos = async () => {
    if (!parsedData) return;
    setIsAdding(true);
    setError(null);
    try {
      const count = await onAddBulkVideos(parsedData.lessonName, parsedData.videoUrls);
      console.log(`Successfully added ${count} videos.`);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while adding the videos.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Add Videos to ${subjectName}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="bulk-video-text" className="block text-sm font-medium text-gray-300 mb-1">
            Paste Video List
          </label>
          <textarea
            id="bulk-video-text"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Paste text containing a lesson name and multiple YouTube URLs..."
            disabled={isParsing || !!parsedData}
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!parsedData && (
          <div className="flex justify-end">
            <button
              onClick={handleParseText}
              disabled={isParsing || !text.trim()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-wait"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              {isParsing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>
        )}
        
        {parsedData && (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 space-y-4">
                <h4 className="font-semibold text-white">Analysis Result</h4>
                <div>
                    <label htmlFor="lesson-name-edit" className="block text-sm font-medium text-gray-300 mb-1">Lesson Name (Editable)</label>
                    <input
                        type="text"
                        id="lesson-name-edit"
                        value={parsedData.lessonName}
                        onChange={(e) => setParsedData({ ...parsedData, lessonName: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                </div>
                <p className="text-sm text-gray-300">
                    Found <span className="font-bold text-white">{parsedData.videoUrls.length}</span> video(s) to add.
                </p>
                <div className="flex justify-end space-x-2 pt-2">
                    <button
                        onClick={() => { setParsedData(null); setError(null); }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleAddVideos}
                        disabled={isAdding || !parsedData.lessonName.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-wait"
                    >
                        {isAdding ? 'Adding Videos...' : 'Confirm & Add'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AddBulkVideosModal;
