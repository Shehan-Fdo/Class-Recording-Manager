import React, { useState, useMemo } from 'react';
import type { Subject, Lesson, Video } from './types';
import { useDataManager } from './hooks/useDataManager';
import VideoCard from './components/VideoCard';
import AddSubjectModal from './components/modals/AddSubjectModal';
import AddLessonModal from './components/modals/AddLessonModal';
import AddVideoModal from './components/modals/AddVideoModal';
import AddBulkVideosModal from './components/modals/AddBulkVideosModal';
import { PlusIcon, TrashIcon, VideoCameraIcon, BookOpenIcon, AcademicCapIcon, SparklesIcon } from './components/Icons';

export default function App() {
  const { subjects, loading, addSubject, deleteSubject, addLesson, deleteLesson, addVideo, addBulkVideos, deleteVideo, toggleVideoWatched } = useDataManager();
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [isAddLessonModalOpen, setAddLessonModalOpen] = useState(false);
  const [isAddVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [isAddBulkVideosModalOpen, setAddBulkVideosModalOpen] = useState(false);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);
  const selectedLesson = useMemo(() => selectedSubject?.lessons.find(l => l.id === selectedLessonId), [selectedSubject, selectedLessonId]);

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedLessonId(null); 
    const firstLesson = subjects.find(s => s.id === subjectId)?.lessons[0];
    if (firstLesson) {
      setSelectedLessonId(firstLesson.id);
    }
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
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
        setSelectedLessonId(null);
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
    return <div className="flex items-center justify-center h-screen text-xl">Loading...</div>;
  }
  
  const renderEmptyState = () => (
    <div className="text-center text-gray-400 col-span-full py-20">
      <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-500" />
      <h3 className="mt-2 text-lg font-medium text-white">No videos yet</h3>
      <p className="mt-1 text-sm">
        {selectedLesson ? `Add a video to the "${selectedLesson.name}" lesson.` : 'Select a lesson to see videos.'}
      </p>
      {selectedLesson && (
         <button
          onClick={() => setAddVideoModalOpen(true)}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add First Video
        </button>
      )}
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <header className="flex-shrink-0 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-lg z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AcademicCapIcon className="w-6 h-6 text-indigo-400" />
            Class Recording Manager
          </h1>
          <div className="w-full max-w-lg">
            <input
              type="text"
              placeholder="Search all videos, lessons, or subjects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </header>

      <main className="flex-grow flex overflow-hidden">
        {/* Subjects Column */}
        <div className="w-64 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpenIcon className="w-5 h-5"/> Subjects</h2>
            <button onClick={() => setAddSubjectModalOpen(true)} className="p-1 rounded-full hover:bg-gray-700 transition-colors"><PlusIcon className="w-5 h-5"/></button>
          </div>
          <ul className="flex-grow overflow-y-auto p-2 space-y-1">
            {subjects.map(subject => (
              <li key={subject.id} 
                  onClick={() => handleSelectSubject(subject.id)}
                  className={`group flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${selectedSubjectId === subject.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                <span className="truncate">{subject.name}</span>
                <button onClick={(e) => handleDeleteSubject(e, subject.id)} className={`p-1 rounded-full text-gray-400 hover:text-white hover:bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity ${selectedSubjectId === subject.id ? 'opacity-100' : ''}`}>
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
             {subjects.length === 0 && <p className="text-center text-gray-500 p-4 text-sm">No subjects yet. Add one!</p>}
          </ul>
        </div>

        {/* Lessons Column */}
        <div className="w-72 flex-shrink-0 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold truncate">
              {selectedSubject ? selectedSubject.name : 'Lessons'}
            </h2>
            {selectedSubject && <button onClick={() => setAddLessonModalOpen(true)} className="p-1 rounded-full hover:bg-gray-700 transition-colors"><PlusIcon className="w-5 h-5"/></button>}
          </div>
          <ul className="flex-grow overflow-y-auto p-2 space-y-1">
            {selectedSubject?.lessons.map(lesson => (
              <li key={lesson.id} 
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`group flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-indigo-500/50 text-white' : 'hover:bg-gray-700'}`}>
                <span className="truncate">{lesson.name}</span>
                <button onClick={(e) => handleDeleteLesson(e, lesson.id)} className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            ))}
            {selectedSubject && selectedSubject.lessons.length === 0 && <p className="text-center text-gray-500 p-4 text-sm">No lessons in this subject.</p>}
            {!selectedSubject && <p className="text-center text-gray-500 p-4 text-sm">Select a subject to see lessons.</p>}
          </ul>
        </div>
        
        {/* Videos Area */}
        <div className="flex-grow flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex-shrink-0 flex justify-between items-center bg-gray-900/50">
            <h2 className="text-lg font-semibold truncate">
              {searchTerm ? `Search Results for "${searchTerm}"` : (selectedLesson ? selectedLesson.name : (selectedSubject ? selectedSubject.name : 'Videos'))}
            </h2>
            <div className="flex items-center gap-2">
              {selectedSubject && !searchTerm && (
                <button
                  onClick={() => setAddBulkVideosModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  aria-label="Bulk add videos with AI"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Bulk Add</span>
                </button>
              )}
              {selectedLesson && !searchTerm && (
                <button
                  onClick={() => setAddVideoModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                  aria-label="Add a single video"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Video</span>
                </button>
              )}
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-6 bg-gray-900">
            {filteredVideos.length > 0 ? (
                <div className="flex flex-col gap-4">
                {filteredVideos.map(video => {
                    const sId = searchTerm ? (video as any).subjectId : selectedSubjectId;
                    const lId = searchTerm ? (video as any).lessonId : selectedLessonId;
                    return (
                        <VideoCard 
                            key={video.id} 
                            video={video}
                            onDelete={() => sId && lId && deleteVideo(sId, lId, video.id)}
                            onToggleWatched={() => sId && lId && toggleVideoWatched(sId, lId, video.id)}
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
    </div>
  );
}