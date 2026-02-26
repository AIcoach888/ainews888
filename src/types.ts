export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  likes: string;
  isFavorite?: boolean;
  content?: string;
}

export type View = 'login' | 'register' | 'home' | 'detail' | 'profile' | 'favorites' | 'history' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  isPro: boolean;
}
