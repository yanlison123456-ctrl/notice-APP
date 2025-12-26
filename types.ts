
export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  author: string;
}

export type AppView = 'home' | 'detail' | 'login' | 'admin' | 'create' | 'settings';

export interface User {
  username: string;
  isAdmin: boolean;
}
