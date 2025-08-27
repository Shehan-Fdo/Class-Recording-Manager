import React, { useState, useMemo } from 'react';
import type { Subject, Lesson, Video } from './types';
import { useDataManager } from './hooks/useDataManager';
import VideoCard from './components/VideoCard';
import AddSubjectModal from './components/modals/AddSubjectModal';
import AddLessonModal from './components/modals/AddLessonModal';
import AddVideoModal from './components/modals/AddVideoModal';
import AddBulkVideosModal from './components/modals/AddBulkVideosModal';
import MoveVideoModal from './components/modals/MoveVideoModal';
import RenameModal from './components/modals/RenameModal';
import { PlusIcon, TrashIcon, VideoCameraIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon, PencilIcon } from './components/Icons';

export default function App() {
  const { subjects, loading, addSubject, deleteSubject, renameSubject, addLesson, deleteLesson, renameLesson, addVideo, addBulkVideos, deleteVideo, toggleVideoWatched, moveVideo } = useDataManager();
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [isAddLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [isAddVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [isAddBulkVideosModalOpen, setAddBulkVideosModalOpen] = useState(false);
  const [isMoveVideoModalOpen, setMoveVideoModalOpen] = useState(false);
  const [videoToMove, setVideoToMove] = useState<{ video: Video; subjectId: string; lessonId: string } | null>(null);

  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{ id: string; name: string; type: 'subject' | 'lesson'; subjectId?: string } | null>(null);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const selectedLesson = useMemo(() => selectedSubject?.lessons.find(l => l.id === selectedLessonId), [selectedSubject, selectedLessonId]);

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    // Auto-select the first lesson if it exists, otherwise null
    setSelectedLessonId(subject?.lessons[0]?.id || null);
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleOpenMoveVideoModal = (video: Video, subjectId: string, lessonId: string) => {
    setVideoToMove({ video, subjectId, lessonId });
    setMoveVideoModalOpen(true);
  };

  const handleMoveVideo = (destinationSubjectId: string, destinationLessonId: string) => {
      if (videoToMove) {
          moveVideo(
              videoToMove.subjectId,
              videoToMove.lessonId,
              videoToMove.video.id,
              destinationSubjectId,
              destinationLessonId
          );
          setMoveVideoModalOpen(false);
          setVideoToMove(null);
      }
  };
  
  const handleOpenRenameModal = (id: string, name: string, type: 'subject' | 'lesson', subjectId?: string) => {
    setItemToRename({ id, name, type, subjectId });
    setRenameModalOpen(true);
  };

  const handleRename = (newName: string) => {
    if (itemToRename) {
      if (itemToRename.type === 'subject') {
        renameSubject(itemToRename.id, newName);
      } else if (itemToRename.type === 'lesson' && itemToRename.subjectId) {
        renameLesson(itemToRename.subjectId, itemToRename.id, newName);
      }
      setRenameModalOpen(false);
      setItemToRename(null);
    }
  };

  const handleDeleteSubject = (e: React.MouseEvent, subjectId: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this subject and all its content?')) {
      deleteSubject(subjectId);
      if(selectedSubjectId === subjectId) {
        setSelectedSubjectId(null);
        setSelectedLessonId(null);
      }
    }
  };

  const handleDeleteLesson = (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    if (selectedSubjectId && window.confirm('Are you sure you want to delete this lesson?')) {
      deleteLesson(selectedSubjectId, lessonId);
      if(selectedLessonId === lessonId) {
        // Find the index of the deleted lesson
        const lessonIndex = selectedSubject?.lessons.findIndex(l => l.id === lessonId);
        // If there's another lesson, select it. Otherwise, select null.
        const nextLesson = selectedSubject?.lessons[lessonIndex === 0 ? 1 : (lessonIndex ?? 1) - 1];
        setSelectedLessonId(nextLesson?.id || null);
      }
    }
  };

  const filteredVideos = useMemo(() => {
    if (!searchTerm) {
      return (selectedLesson?.videos || []);
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const allVideos: (Video & { subjectName: string; lessonName: string, subjectId: string, lessonId: string })[] = [];
    subjects.forEach(subject => {
      subject.lessons.forEach(lesson => {
        lesson.videos.forEach(video => {
          allVideos.push({
            ...video,
            subjectName: subject.name,
            lessonName: lesson.name,
            subjectId: subject.id,
            lessonId: lesson.id,
          });
        });
      });
    });
    return allVideos.filter(video => 
      video.title.toLowerCase().includes(lowercasedFilter) ||
      video.lessonName.toLowerCase().includes(lowercasedFilter) ||
      video.subjectName.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, subjects, selectedLesson]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-medium text-gray-700">Loading your recordings...</div>;
  }
  
  const renderEmptyState = () => (
    <div className="text-center text-gray-500 col-span-full py-20 flex flex-col items-center">
      <VideoCameraIcon className="mx-auto h-16 w-16 text-gray-300" />
      <h3 className="mt-4 text-xl font-medium text-gray-800">No Videos Here</h3>
      <p className="mt-2 text-base text-gray-600 max-w-md">
        {selectedLesson ? `This is a fresh start! Add the first video to your "${selectedLesson.name}" lesson to get things rolling.` : 'Select a lesson from the sidebar to view your videos, or add a new one to begin organizing.'}
      </p>
      {selectedLesson && (
         <button
          onClick={() => setAddVideoModalOpen(true)}
          className="mt-8 inline-flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-blue-500 transition-colors"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add First Video
        </button>
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-gray-900 font-sans">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            Class Recorder
          </h1>
          <div className="w-full max-w-xl">
            <input
              type="text"
              placeholder="Search all videos, lessons, or subjects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 border-2 border-transparent rounded-full px-5 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        {/* Subjects Column */}
        <div className="w-72 flex-shrink-0 bg-white/70 border-r border-gray-200 flex flex-col">
          <div className="p-4 h-20 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800"><BookOpenIcon className="w-6 h-6"/> Subjects</h2>
            <button onClick={() => setAddSubjectModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><PlusIcon className="w-6 h-6"/></button>
          </div>
          <ul className="flex-grow overflow-y-auto p-3 space-y-2">
            {subjects.map(subject => (
              <li key={subject.id} 
                  onClick={() => handleSelectSubject(subject.id)}
                  className={`group flex justify-between items-center px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${selectedSubjectId === subject.id ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-blue-50 text-gray-700'}`}>
                <span className="truncate">{subject.name}</span>
                <div className="flex items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(subject.id, subject.name, 'subject'); }} className={`p-1.5 rounded-full transition-opacity ${selectedSubjectId === subject.id ? 'text-white/70 hover:text-white hover:bg-white/20 opacity-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200 opacity-0 group-hover:opacity-100'}`}>
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDeleteSubject(e, subject.id)} className={`p-1.5 rounded-full transition-opacity ${selectedSubjectId === subject.id ? 'text-white/70 hover:text-white hover:bg-white/20 opacity-100' : 'text-gray-500 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100'}`}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </li>
            ))}
             {subjects.length === 0 && <p className="text-center text-gray-500 p-4 text-sm">No subjects yet. Add one!</p>}
          </ul>
        </div>

        {/* Lessons Column */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 h-20 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold truncate text-gray-800">
              {selectedSubject ? selectedSubject.name : 'Lessons'}
            </h2>
            {selectedSubject && <button onClick={() => setAddLessonModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 transition-colors"><PlusIcon className="w-6 h-6"/></button>}
          </div>
          <ul className="flex-grow overflow-y-auto p-3 space-y-2">
            {selectedSubject?.lessons.map(lesson => (
              <li key={lesson.id} 
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`group flex justify-between items-center px-4 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${selectedLessonId === lesson.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-gray-700'}`}>
                <span className="truncate">{lesson.name}</span>
                <div className="flex items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenRenameModal(lesson.id, lesson.name, 'lesson', selectedSubject.id); }} className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => handleDeleteLesson(e, lesson.id)} className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </li>
            ))}
            {selectedSubject && selectedSubject.lessons.length === 0 && <p className="text-center text-gray-500 p-4 text-sm">No lessons in this subject.</p>}
            {!selectedSubject && <p className="text-center text-gray-500 p-4 text-sm">Select a subject to see lessons.</p>}
          </ul>
        </div>
        
        {/* Videos Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="p-4 h-20 border-b border-gray-200 flex-shrink-0 flex justify-between items-center bg-white/30 backdrop-blur-md">
            <h2 className="text-xl font-bold truncate text-gray-800">
              {searchTerm ? `Search Results for "${searchTerm}"` : (selectedLesson ? selectedLesson.name : (selectedSubject ? 'Select a Lesson' : 'Videos'))}
            </h2>
            <div className="flex items-center gap-3">
              {selectedSubject && !searchTerm && (
                <button
                  onClick={() => setAddBulkVideosModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-sm font-medium"
                  aria-label="Bulk add videos with AI"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Bulk Add</span>
                </button>
              )}
              {selectedLesson && !searchTerm && (
                <button
                  onClick={() => setAddVideoModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  aria-label="Add a single video"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Video</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
            {filteredVideos.length > 0 ? (
                <div className="flex flex-col gap-5">
                {filteredVideos.map(video => {
                    const sId = searchTerm ? (video as any).subjectId : selectedSubjectId;
                    const lId = searchTerm ? (video as any).lessonId : selectedLessonId;
                    return (
                        <VideoCard 
                            key={video.id} 
                            video={video}
                            onDelete={() => sId && lId && deleteVideo(sId, lId, video.id)}
                            onToggleWatched={() => sId && lId && toggleVideoWatched(sId, lId, video.id)}
                            onMove={() => sId && lId && handleOpenMoveVideoModal(video, sId, lId)}
                        />
                    );
                })}
                </div>
            ) : (
                !searchTerm && renderEmptyState()
            )}
             {searchTerm && filteredVideos.length === 0 && <p className="text-center text-gray-500 p-4">No videos found for your search.</p>}
          </div>
        </div>
      </main>

      {isAddSubjectModalOpen && <AddSubjectModal isOpen={isAddSubjectModalOpen} onClose={() => setAddSubjectModalOpen(false)} onAddSubject={addSubject} />}
      {isAddLessonModalOpen && selectedSubject && <AddLessonModal isOpen={isAddLessonModalOpen} onClose={() => setAddLessonModalOpen(false)} onAddLesson={(name) => addLesson(selectedSubject.id, name)} subjectName={selectedSubject.name} />}
      {isAddVideoModalOpen && selectedSubjectId && selectedLessonId && selectedLesson && <AddVideoModal isOpen={isAddVideoModalOpen} onClose={() => setAddVideoModalOpen(false)} onAddVideo={(url) => addVideo(selectedSubjectId, selectedLessonId, url)} lessonName={selectedLesson.name} />}
      {isAddBulkVideosModalOpen && selectedSubject && <AddBulkVideosModal isOpen={isAddBulkVideosModalOpen} onClose={() => setAddBulkVideosModalOpen(false)} onAddBulkVideos={(lessonName, urls) => addBulkVideos(selectedSubject.id, lessonName, urls)} subjectName={selectedSubject.name} />}
      {isMoveVideoModalOpen && videoToMove && (
        <MoveVideoModal
            isOpen={isMoveVideoModalOpen}
            onClose={() => setMoveVideoModalOpen(false)}
            onMoveVideo={handleMoveVideo}
            subjects={subjects}
            currentSubjectId={videoToMove.subjectId}
            currentLessonId={videoToMove.lessonId}
            videoTitle={videoToMove.video.title}
        />
      )}
      {isRenameModalOpen && itemToRename && (
        <RenameModal
            isOpen={isRenameModalOpen}
            onClose={() => setRenameModalOpen(false)}
            onRename={handleRename}
            itemType={itemToRename.type}
            currentName={itemToRename.name}
        />
      )}
    </div>
  );
}