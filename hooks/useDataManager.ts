import { useState, useEffect, useCallback } from 'react';
import type { Subject, Lesson, Video } from '../types';
import { fetchVideoDetails, type YouTubeVideoDetails } from '../services/youtubeService';

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

  const renameSubject = useCallback((subjectId: string, newName: string) => {
    if (!newName.trim()) return;
    setSubjects(prev =>
      prev.map(subject =>
        subject.id === subjectId ? { ...subject, name: newName.trim() } : subject
      )
    );
  }, []);

  const addLesson = useCallback((subjectId: string, name: string) => {
    if (!name.trim()) return;
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      name,
      videos: [],
    };
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: [...subject.lessons, newLesson],
          };
        }
        return subject;
      })
    );
  }, []);

  const deleteLesson = useCallback((subjectId: string, lessonId: string) => {
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: subject.lessons.filter(l => l.id !== lessonId),
          };
        }
        return subject;
      })
    );
  }, []);

  const renameLesson = useCallback((subjectId: string, lessonId: string, newName: string) => {
    if (!newName.trim()) return;
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: subject.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, name: newName.trim() } : lesson
            ),
          };
        }
        return subject;
      })
    );
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
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: subject.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  videos: [...lesson.videos, newVideo],
                };
              }
              return lesson;
            }),
          };
        }
        return subject;
      })
    );
  }, []);

  const addBulkVideos = useCallback(async (subjectId: string, lessonName: string, urls: string[]): Promise<number> => {
    let subject = subjects.find(s => s.id === subjectId);
    if (!subject) throw new Error("Subject not found");
    
    const newVideos: Video[] = [];
    // Use Promise.all to fetch details in parallel for better performance
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
    
    setSubjects(prev => {
        return prev.map(s => {
            if (s.id === subjectId) {
                const newLessons = [...s.lessons];
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
                return { ...s, lessons: newLessons };
            }
            return s;
        });
    });

    return newVideos.length;
  }, [subjects]);


  const deleteVideo = useCallback((subjectId: string, lessonId: string, videoId: string) => {
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: subject.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  videos: lesson.videos.filter(v => v.id !== videoId),
                };
              }
              return lesson;
            }),
          };
        }
        return subject;
      })
    );
  }, []);

  const toggleVideoWatched = useCallback((subjectId: string, lessonId: string, videoId: string) => {
    setSubjects(prev =>
      prev.map(subject => {
        if (subject.id === subjectId) {
          return {
            ...subject,
            lessons: subject.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  videos: lesson.videos.map(video =>
                    video.id === videoId ? { ...video, watched: !video.watched } : video
                  ),
                };
              }
              return lesson;
            }),
          };
        }
        return subject;
      })
    );
  }, []);
  
  const moveVideo = useCallback((
    sourceSubjectId: string, 
    sourceLessonId: string, 
    videoId: string, 
    destinationSubjectId: string, 
    destinationLessonId: string
  ) => {
    if (sourceLessonId === destinationLessonId && sourceSubjectId === destinationSubjectId) {
      return; // No move necessary
    }

    setSubjects(prev => {
      const allSubjects = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation issues
      
      let videoToMove: Video | undefined;

      // Find and remove video from source
      const sourceSubject = allSubjects.find((s: Subject) => s.id === sourceSubjectId);
      if (sourceSubject) {
        const sourceLesson = sourceSubject.lessons.find((l: Lesson) => l.id === sourceLessonId);
        if (sourceLesson) {
          const videoIndex = sourceLesson.videos.findIndex((v: Video) => v.id === videoId);
          if (videoIndex > -1) {
            [videoToMove] = sourceLesson.videos.splice(videoIndex, 1);
          }
        }
      }

      if (!videoToMove) {
        console.error("Could not find video to move.");
        return prev; // Return original state if video not found
      }

      // Add video to destination
      const destinationSubject = allSubjects.find((s: Subject) => s.id === destinationSubjectId);
      if (destinationSubject) {
        const destinationLesson = destinationSubject.lessons.find((l: Lesson) => l.id === destinationLessonId);
        if (destinationLesson) {
          destinationLesson.videos.push(videoToMove);
        }
      } else {
        console.error("Could not find destination to move video to.");
        // Re-add the video to its original location to prevent data loss
        sourceSubject?.lessons.find((l: Lesson) => l.id === sourceLessonId)?.videos.push(videoToMove);
        return prev;
      }

      return allSubjects;
    });
  }, []);

  return { subjects, loading, addSubject, deleteSubject, renameSubject, addLesson, deleteLesson, renameLesson, addVideo, addBulkVideos, deleteVideo, toggleVideoWatched, moveVideo };
};