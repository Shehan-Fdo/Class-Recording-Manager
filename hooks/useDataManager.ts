import { useState, useEffect, useCallback } from 'react';
import type { Subject, Lesson, Video } from '../types';
import { fetchVideoDetails } from '../services/youtubeService';
import { db } from '../services/db';

export const useDataManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await db.subjects.toArray();
      setSubjects(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const addSubject = useCallback(async (name: string) => {
    if (!name.trim()) return;
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      lessons: [],
    };
    await db.subjects.add(newSubject);
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const deleteSubject = useCallback(async (subjectId: string) => {
    await db.subjects.delete(subjectId);
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  const renameSubject = useCallback(async (subjectId: string, newName: string) => {
    if (!newName.trim()) return;
    await db.subjects.update(subjectId, { name: newName.trim() });
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId ? { ...subject, name: newName.trim() } : subject
      )
    );
  }, []);

  const addLesson = useCallback(async (subjectId: string, name: string) => {
    if (!name.trim()) return;
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      name,
      videos: [],
    };
    const subject = await db.subjects.get(subjectId);
    if (subject) {
        const updatedLessons = [...subject.lessons, newLesson];
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev =>
          prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s)
        );
    }
  }, []);

  const deleteLesson = useCallback(async (subjectId: string, lessonId: string) => {
    const subject = await db.subjects.get(subjectId);
    if (subject) {
        const updatedLessons = subject.lessons.filter(l => l.id !== lessonId);
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev => 
            prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s)
        );
    }
  }, []);

  const renameLesson = useCallback(async (subjectId: string, lessonId: string, newName: string) => {
    if (!newName.trim()) return;
    const subject = await db.subjects.get(subjectId);
    if (subject) {
        const updatedLessons = subject.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, name: newName.trim() } : lesson
        );
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev => 
            prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s)
        );
    }
  }, []);

  const addVideo = useCallback(async (subjectId: string, lessonId: string, url: string) => {
    const details = await fetchVideoDetails(url);
    const newVideo: Video = {
        id: crypto.randomUUID(),
        url,
        title: details.title,
        thumbnailUrl: details.thumbnail_url,
        authorName: details.author_name,
        watched: false,
    };
    
    const subject = await db.subjects.get(subjectId);
    if(subject) {
        const updatedLessons = subject.lessons.map(lesson => {
            if (lesson.id === lessonId) {
                return { ...lesson, videos: [...lesson.videos, newVideo] };
            }
            return lesson;
        });
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev =>
            prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s)
        );
    }
  }, []);

    const addBulkVideos = useCallback(async (subjectId: string, lessonName: string, urls: string[]): Promise<number> => {
    const subject = await db.subjects.get(subjectId);
    if (!subject) throw new Error("Subject not found");

    const newVideos: Video[] = [];
    const detailPromises = urls.map(url => fetchVideoDetails(url).catch(e => {
        console.warn(`Skipping video, could not fetch details for URL: ${url}`, e);
        return null;
    }));

    const results = await Promise.all(detailPromises);

    results.forEach((details, index) => {
        if (details) {
            newVideos.push({
                id: crypto.randomUUID(),
                url: urls[index],
                title: details.title,
                thumbnailUrl: details.thumbnail_url,
                authorName: details.author_name,
                watched: false,
            });
        }
    });

    if (newVideos.length === 0) return 0;
    
    const newLessons = [...subject.lessons];
    let targetLessonIndex = newLessons.findIndex(l => l.name.toLowerCase() === lessonName.toLowerCase());
    
    if (targetLessonIndex > -1) {
        newLessons[targetLessonIndex] = {
            ...newLessons[targetLessonIndex],
            videos: [...newLessons[targetLessonIndex].videos, ...newVideos]
        };
    } else {
        const newLesson: Lesson = {
            id: crypto.randomUUID(),
            name: lessonName,
            videos: newVideos,
        };
        newLessons.push(newLesson);
    }

    await db.subjects.update(subjectId, { lessons: newLessons });
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, lessons: newLessons } : s));
    
    return newVideos.length;
  }, []);


  const deleteVideo = useCallback(async (subjectId: string, lessonId: string, videoId: string) => {
    const subject = await db.subjects.get(subjectId);
    if (subject) {
        const updatedLessons = subject.lessons.map(lesson => {
            if (lesson.id === lessonId) {
                return { ...lesson, videos: lesson.videos.filter(v => v.id !== videoId) };
            }
            return lesson;
        });
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s));
    }
  }, []);

  const toggleVideoWatched = useCallback(async (subjectId: string, lessonId: string, videoId: string) => {
    const subject = await db.subjects.get(subjectId);
    if (subject) {
        const updatedLessons = subject.lessons.map(lesson => {
            if (lesson.id === lessonId) {
                return { 
                    ...lesson, 
                    videos: lesson.videos.map(video =>
                        video.id === videoId ? { ...video, watched: !video.watched } : video
                    ) 
                };
            }
            return lesson;
        });
        await db.subjects.update(subjectId, { lessons: updatedLessons });
        setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, lessons: updatedLessons } : s));
    }
  }, []);
  
  const moveVideo = useCallback(async (
    sourceSubjectId: string, 
    sourceLessonId: string, 
    videoId: string, 
    destinationSubjectId: string, 
    destinationLessonId: string
  ) => {
    if (sourceLessonId === destinationLessonId && sourceSubjectId === destinationSubjectId) return;

    // A transaction ensures both read and write operations succeed or fail together.
    await db.transaction('rw', db.subjects, async () => {
        const sourceSubject = await db.subjects.get(sourceSubjectId);
        const destinationSubject = sourceSubjectId === destinationSubjectId ? sourceSubject : await db.subjects.get(destinationSubjectId);

        if (!sourceSubject || !destinationSubject) {
            console.error("Could not find source or destination subject.");
            return;
        }

        let videoToMove: Video | undefined;
        let finalSourceLessons: Lesson[] | undefined;
        
        // Find and remove video from source
        const sourceLessons = [...sourceSubject.lessons];
        const sourceLessonIndex = sourceLessons.findIndex(l => l.id === sourceLessonId);
        if (sourceLessonIndex > -1) {
            const videos = [...sourceLessons[sourceLessonIndex].videos];
            const videoIndex = videos.findIndex(v => v.id === videoId);
            if (videoIndex > -1) {
                [videoToMove] = videos.splice(videoIndex, 1);
                sourceLessons[sourceLessonIndex] = { ...sourceLessons[sourceLessonIndex], videos };
                finalSourceLessons = sourceLessons;
            }
        }
        
        if (!videoToMove || !finalSourceLessons) {
            console.error("Could not find video to move.");
            return;
        }

        // Add video to destination
        let finalDestinationLessons: Lesson[] | undefined;
        if (sourceSubjectId === destinationSubjectId) {
             finalDestinationLessons = [...finalSourceLessons];
        } else {
             finalDestinationLessons = [...destinationSubject.lessons];
        }

        const destinationLessonIndex = finalDestinationLessons.findIndex(l => l.id === destinationLessonId);
        if (destinationLessonIndex > -1) {
            const destVideos = [...finalDestinationLessons[destinationLessonIndex].videos];
            destVideos.push(videoToMove);
            finalDestinationLessons[destinationLessonIndex] = { ...finalDestinationLessons[destinationLessonIndex], videos: destVideos };
        } else {
            console.error("Could not find destination lesson.");
            return; // Abort transaction
        }

        // Perform DB updates
        if (sourceSubjectId === destinationSubjectId) {
            await db.subjects.update(sourceSubjectId, { lessons: finalDestinationLessons });
        } else {
            await db.subjects.update(sourceSubjectId, { lessons: finalSourceLessons });
            await db.subjects.update(destinationSubjectId, { lessons: finalDestinationLessons });
        }
    });

    // Re-fetch all data to ensure UI consistency after complex transaction
    const data = await db.subjects.toArray();
    setSubjects(data);
  }, []);

  return { subjects, loading, addSubject, deleteSubject, renameSubject, addLesson, deleteLesson, renameLesson, addVideo, addBulkVideos, deleteVideo, toggleVideoWatched, moveVideo };
};
