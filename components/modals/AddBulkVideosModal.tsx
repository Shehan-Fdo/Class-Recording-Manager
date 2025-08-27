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
    if (!parsedData || !parsedData.lessonName.trim()) {
      setError("Lesson name cannot be empty.");
      return;
    };
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
      <div className="space-y-6">
        <div>
          <label htmlFor="bulk-video-text" className="block text-sm font-medium text-gray-700 mb-2">
            Paste Video List
          </label>
          <textarea
            id="bulk-video-text"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Paste text containing a lesson name and multiple YouTube URLs..."
            disabled={isParsing || !!parsedData}
          />
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        {!parsedData && (
          <div className="flex justify-end">
            <button
              onClick={handleParseText}
              disabled={isParsing || !text.trim()}
              className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-wait"
            >
              <SparklesIcon className="w-5 h-5 mr-2 -ml-1" />
              {isParsing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>
        )}
        
        {parsedData && (
            <div className="border border-gray-200 rounded-xl p-5 bg-slate-50 space-y-5">
                <h4 className="font-medium text-lg text-gray-800">Analysis Result</h4>
                <div>
                    <label htmlFor="lesson-name-edit" className="block text-sm font-medium text-gray-700 mb-2">Lesson Name (Editable)</label>
                    <input
                        type="text"
                        id="lesson-name-edit"
                        value={parsedData.lessonName}
                        onChange={(e) => setParsedData({ ...parsedData, lessonName: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <p className="text-sm text-gray-600">
                    Found <span className="font-bold text-gray-900">{parsedData.videoUrls.length}</span> video(s) to add.
                </p>
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        onClick={() => { setParsedData(null); setError(null); setText(''); }}
                        className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 font-medium rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleAddVideos}
                        disabled={isAdding}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {isAdding ? 'Adding...' : 'Add Videos'}
                    </button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default AddBulkVideosModal;