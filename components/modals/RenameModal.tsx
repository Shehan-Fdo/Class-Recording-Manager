import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  itemType: string;
  currentName: string;
}

const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onRename, itemType, currentName }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== currentName) {
      onRename(name.trim());
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rename ${itemType}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-2">
            New Name for "{currentName}"
          </label>
          <input
            type="text"
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={!name.trim() || name.trim() === currentName}
          >
            Rename
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameModal;
