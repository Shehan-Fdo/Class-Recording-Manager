import { useState, useEffect, useCallback } from 'react';
import type { Subject, Lesson, Video } from '../types';
import { fetchVideoDetails } from '../services/youtubeService';

const LOCAL_STORAGE_KEY = 'youtubeClassManagerData';

const getInitialData = (): Subject[] => {
    try {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error('Error reading from localStorage', error);
    }
    return []; // Return empty array if nothing in localStorage or if there's an error
};


export const useDataManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>(getInitialData);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSubjects(getInitialData());
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subjects));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [subjects]);

  const addSubject = useCallback((name: string) => {
    if (!name.trim()) return;
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      lessons: [],
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  const addLesson = useCallback((subjectId: string, name: string) => {
    if (!name.trim()) return;
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      name,
      videos: [],
    };
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, lessons: [...s.lessons, newLesson] } : s));
  }, []);

  const deleteLesson = useCallback((subjectId: string, lessonId: string) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId 
        ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } 
        : s
    ));
  }, []);

  const addVideo = useCallback(async (subjectId: string, lessonId: string, url: string) => {
    if (!url.trim()) throw new Error("URL cannot be empty.");
    
    const details = await fetchVideoDetails(url);
    const newVideo: Video = {
      id: crypto.randomUUID(),
      url,
      title: details.title,
      thumbnailUrl: details.thumbnail_url,
      authorName: details.author_name,
      watched: false,
    };

    setSubjects(prev => prev.map(s => 
      s.id === subjectId 
        ? { 
            ...s, 
            lessons: s.lessons.map(l => 
              l.id === lessonId 
                ? { ...l, videos: [...l.videos, newVideo] } 
                : l
            ) 
          } 
        : s
    ));
  }, []);

  const addBulkVideos = useCallback(async (subjectId: string, lessonName: string, urls: string[]): Promise<number> => {
    const videoPromises = urls.map(async (url) => {
      try {
        const details = await fetchVideoDetails(url);
        const newVideo: Video = {
          id: crypto.randomUUID(),
          url,
          title: details.title,
          thumbnailUrl: details.thumbnail_url,
          authorName: details.author_name,
          watched: false,
        };
        return newVideo;
      } catch (e) {
        console.error(`Failed to fetch details for ${url}`, e);
        return null; // Return null for failed fetches, they will be filtered out
      }
    });

    const newVideosWithNulls = await Promise.all(videoPromises);
    const newVideos = newVideosWithNulls.filter((v): v is Video => v !== null);

    if (newVideos.length === 0) {
      throw new Error("Could not process any of the provided video URLs.");
    }
    
    setSubjects(prevSubjects => {
        return prevSubjects.map(subject => {
            if (subject.id === subjectId) {
                const existingLesson = subject.lessons.find(l => l.name.toLowerCase() === lessonName.toLowerCase());
                let newLessons: Lesson[];

                if (existingLesson) {
                    // Add videos to the existing lesson
                    newLessons = subject.lessons.map(lesson => 
                        lesson.id === existingLesson.id
                            ? { ...lesson, videos: [...lesson.videos, ...newVideos] }
                            : lesson
                    );
                } else {
                    // Create a new lesson
                    const newLesson: Lesson = {
                        id: crypto.randomUUID(),
                        name: lessonName,
                        videos: newVideos,
                    };
                    newLessons = [...subject.lessons, newLesson];
                }
                return { ...subject, lessons: newLessons };
            }
            return subject;
        });
    });
    return newVideos.length;
  }, []);

  const deleteVideo = useCallback((subjectId: string, lessonId: string, videoId: string) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId 
        ? { 
            ...s, 
            lessons: s.lessons.map(l => 
              l.id === lessonId 
                ? { ...l, videos: l.videos.filter(v => v.id !== videoId) } 
                : l
            ) 
          } 
        : s
    ));
  }, []);
  
  const toggleVideoWatched = useCallback((subjectId: string, lessonId: string, videoId: string) => {
      setSubjects(prev => prev.map(s => 
        s.id === subjectId 
          ? { 
              ...s, 
              lessons: s.lessons.map(l => 
                l.id === lessonId 
                  ? { ...l, videos: l.videos.map(v => v.id === videoId ? {...v, watched: !v.watched} : v) } 
                  : l
              ) 
            } 
          : s
      ));
  }, []);

  return { 
      subjects, 
      loading, 
      addSubject, 
      deleteSubject, 
      addLesson, 
      deleteLesson, 
      addVideo, 
      addBulkVideos,
      deleteVideo,
      toggleVideoWatched 
    };
};