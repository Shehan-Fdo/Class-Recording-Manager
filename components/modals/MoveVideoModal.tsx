import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import type { Subject } from '../../types';

interface MoveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMoveVideo: (destinationSubjectId: string, destinationLessonId: string) => void;
  subjects: Subject[];
  currentSubjectId: string;
  currentLessonId: string;
  videoTitle: string;
}

const MoveVideoModal: React.FC<MoveVideoModalProps> = ({
  isOpen,
  onClose,
  onMoveVideo,
  subjects,
  currentSubjectId,
  currentLessonId,
  videoTitle,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentSubjectId);
  const [selectedLessonId, setSelectedLessonId] = useState(currentLessonId);

  useEffect(() => {
    // Reset state if modal is reopened for a different video
    setSelectedSubjectId(currentSubjectId);
    setSelectedLessonId(currentLessonId);
  }, [isOpen, currentSubjectId, currentLessonId]);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubjectId = e.target.value;
    setSelectedSubjectId(newSubjectId);
    // Auto-select the first lesson of the new subject, or nothing if no lessons
    const newSubject = subjects.find(s => s.id === newSubjectId);
    setSelectedLessonId(newSubject?.lessons[0]?.id || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectId && selectedLessonId) {
      onMoveVideo(selectedSubjectId, selectedLessonId);
    }
  };

  const isMoveDisabled = !selectedLessonId || (selectedSubjectId === currentSubjectId && selectedLessonId === currentLessonId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Move Video`}>
       <p className="text-gray-600 mb-6">Move "<span className="font-medium text-gray-800">{videoTitle}</span>" to a new lesson.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            id="subject-select"
            value={selectedSubjectId}
            onChange={handleSubjectChange}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson Selection */}
        <div>
          <label htmlFor="lesson-select" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson
          </label>
          <select
            id="lesson-select"
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            disabled={!selectedSubject || selectedSubject.lessons.length === 0}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {selectedSubject && selectedSubject.lessons.length > 0 ? (
              selectedSubject.lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))
            ) : (
              <option value="">No lessons in this subject</option>
            )}
          </select>
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isMoveDisabled}
          >
            Move Video
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MoveVideoModal;
