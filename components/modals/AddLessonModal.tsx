
import React, { useState } from 'react';
import Modal from '../common/Modal';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (name: string) => void;
  subjectName: string;
}

const AddLessonModal: React.FC<AddLessonModalProps> = ({ isOpen, onClose, onAddLesson, subjectName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddLesson(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Lesson to ${subjectName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="lesson-name" className="block text-sm font-medium text-gray-300 mb-1">
            Lesson Name
          </label>
          <input
            type="text"
            id="lesson-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Operating Systems"
            autoFocus
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
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
