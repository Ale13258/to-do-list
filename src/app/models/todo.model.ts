export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string;
}

export interface LegacyTodo {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export const DEFAULT_CATEGORY_ID = 'general';
export const DEFAULT_CATEGORY_NAME = 'General';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: DEFAULT_CATEGORY_ID, name: DEFAULT_CATEGORY_NAME },
  { id: 'trabajo', name: 'Trabajo' },
  { id: 'personal', name: 'Personal' },
  { id: 'estudio', name: 'Estudio' },
];
