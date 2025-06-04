export interface Folder {
  _id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  folderId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  email: string;
  name: string;
  image?: string;
}

export interface Session {
  user: User;
  expires: string;
}
