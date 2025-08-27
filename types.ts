
export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
  authorName: string;
  watched: boolean;
}

export interface Lesson {
  id: string;
  name: string;
  videos: Video[];
}

export interface Subject {
  id: string;
  name: string;
  lessons: Lesson[];
}
