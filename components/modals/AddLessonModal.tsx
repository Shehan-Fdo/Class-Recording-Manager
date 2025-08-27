import React, { useState } from 'react';
import Modal from '../common/Modal';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (name: string) => Promise<void>;
  subjectName: string;
}

const AddLessonModal: React.FC<AddLessonModalProps> = ({ isOpen, onClose, onAddLesson, subjectName }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await onAddLesson(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Lesson to ${subjectName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="lesson-name" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Name
          </label>
          <input
            type="text"
            id="lesson-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., Operating Systems"
            autoFocus
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Add Lesson
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLessonModal;
