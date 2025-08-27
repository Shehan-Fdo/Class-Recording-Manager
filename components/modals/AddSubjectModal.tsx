
import React, { useState } from 'react';
import Modal from '../common/Modal';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubject: (name: string) => void;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ isOpen, onClose, onAddSubject }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddSubject(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Subject">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="subject-name" className="block text-sm font-medium text-gray-300 mb-1">
            Subject Name
          </label>
          <input
            type="text"
            id="subject-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Information Technology"
            autoFocus
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
            disabled={!name.trim()}
          >
            Add Subject
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubjectModal;
