import { Injectable, computed, inject, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {
  Category,
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  DEFAULT_CATEGORY_NAME,
  LegacyTodo,
  Todo,
} from '../models/todo.model';

const TASKS_STORAGE_KEY = 'todoapp_tasks_v1';
const CATEGORIES_STORAGE_KEY = 'todoapp_categories_v1';

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly list = signal<Todo[]>([]);
  private readonly categoriesList = signal<Category[]>([]);

  /** Filtro de categoría: 'all' o id de categoría. */
  readonly categoryFilter = signal<string>('all');

  readonly todos = this.list.asReadonly();
  readonly categories = this.categoriesList.asReadonly();

  readonly filteredTodos = computed(() => {
    const todos = this.list();
    const filter = this.categoryFilter();
    if (filter === 'all') {
      return todos;
    }
    return todos.filter((t) => t.categoryId === filter);
  });

  readonly totalCount = computed(() => this.list().length);
  readonly completedCount = computed(
    () => this.list().filter((todo) => todo.completed).length,
  );
  readonly pendingCount = computed(
    () => this.list().filter((todo) => !todo.completed).length,
  );
  readonly completionRate = computed(() => {
    const total = this.totalCount();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.completedCount() / total) * 100);
  });

  readonly categoriesById = computed(() => {
    const map = new Map<string, Category>();
    for (const category of this.categoriesList()) {
      map.set(category.id, category);
    }
    return map;
  });

  readonly categoriesInUse = computed(() => {
    const ids = new Set<string>();
    for (const t of this.list()) {
      ids.add(t.categoryId || DEFAULT_CATEGORY_ID);
    }
    const byId = this.categoriesById();
    return Array.from(ids)
      .map((id) => byId.get(id))
      .filter((category): category is Category => Boolean(category))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filterOptions = computed(() => {
    return [...this.categoriesList()].sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly taskCountByCategory = computed(() => {
    const count = new Map<string, number>();
    for (const item of this.list()) {
      count.set(item.categoryId, (count.get(item.categoryId) ?? 0) + 1);
    }
    return count;
  });

  private readonly storage = inject(Storage);

  async ensureReady(): Promise<void> {
    await this.storage.create();
  }

  async loadFromStorage(): Promise<void> {
    const rawCategories = (await this.storage.get(CATEGORIES_STORAGE_KEY)) as
      | Category[]
      | null
      | undefined;
    const categories = this.normalizeCategories(rawCategories);

    const rawTodos = (await this.storage.get(TASKS_STORAGE_KEY)) as
      | LegacyTodo[]
      | null
      | undefined;
    const todos = this.normalizeTodos(rawTodos, categories);

    this.categoriesList.set(categories);
    this.list.set(todos);
    await this.persist();
  }

  async addTodo(title: string, categoryId: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    const nextCategoryId = this.resolveCategoryId(categoryId);
    const next: Todo = {
      id: randomId(),
      title: trimmed,
      completed: false,
      categoryId: nextCategoryId,
    };
    this.list.update((items) => [...items, next]);
    await this.persist();
  }

  async toggleComplete(id: string): Promise<void> {
    this.list.update((items) =>
      items.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    await this.persist();
  }

  async removeTodo(id: string): Promise<void> {
    this.list.update((items) => items.filter((t) => t.id !== id));
    await this.persist();
  }

  async restoreTodo(todo: Todo, index?: number): Promise<void> {
    if (!todo || typeof todo.id !== 'string' || !todo.id.trim()) {
      return;
    }

    const safeTodo: Todo = {
      id: todo.id.trim(),
      title: todo.title?.trim() || 'Tarea recuperada',
      completed: Boolean(todo.completed),
      categoryId: this.resolveCategoryId(todo.categoryId),
    };

    this.list.update((items) => {
      if (items.some((item) => item.id === safeTodo.id)) {
        return items;
      }
      if (index === undefined || index < 0 || index > items.length) {
        return [...items, safeTodo];
      }
      return [...items.slice(0, index), safeTodo, ...items.slice(index)];
    });

    await this.persist();
  }

  async updateTodoCategory(id: string, categoryId: string): Promise<void> {
    const nextCategoryId = this.resolveCategoryId(categoryId);
    this.list.update((items) =>
      items.map((t) => (t.id === id ? { ...t, categoryId: nextCategoryId } : t)),
    );
    await this.persist();
  }

  async addCategory(name: string): Promise<boolean> {
    const normalized = this.normalizeCategoryName(name);
    if (!normalized) {
      return false;
    }
    const duplicated = this.categoriesList().some(
      (category) => category.name.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
    );
    if (duplicated) {
      return false;
    }
    const id = this.slugifyCategoryName(normalized);
    const next = [...this.categoriesList(), { id, name: normalized }];
    this.categoriesList.set(next);
    await this.persist();
    return true;
  }

  async renameCategory(id: string, nextName: string): Promise<boolean> {
    if (id === DEFAULT_CATEGORY_ID) {
      return false;
    }
    const normalized = this.normalizeCategoryName(nextName);
    if (!normalized) {
      return false;
    }
    const duplicated = this.categoriesList().some(
      (category) =>
        category.id !== id &&
        category.name.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
    );
    if (duplicated) {
      return false;
    }
    this.categoriesList.update((items) =>
      items.map((category) =>
        category.id === id ? { ...category, name: normalized } : category,
      ),
    );
    await this.persist();
    return true;
  }

  async removeCategory(id: string): Promise<boolean> {
    if (id === DEFAULT_CATEGORY_ID) {
      return false;
    }
    const exists = this.categoriesList().some((category) => category.id === id);
    if (!exists) {
      return false;
    }
    this.categoriesList.update((items) => items.filter((category) => category.id !== id));
    this.list.update((items) =>
      items.map((todo) =>
        todo.categoryId === id ? { ...todo, categoryId: DEFAULT_CATEGORY_ID } : todo,
      ),
    );
    if (this.categoryFilter() === id) {
      this.categoryFilter.set('all');
    }
    await this.persist();
    return true;
  }

  setCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
  }

  private async persist(): Promise<void> {
    await Promise.all([
      this.storage.set(TASKS_STORAGE_KEY, this.list()),
      this.storage.set(CATEGORIES_STORAGE_KEY, this.categoriesList()),
    ]);
  }

  private normalizeCategories(raw: Category[] | null | undefined): Category[] {
    const result = new Map<string, Category>();
    for (const fallback of DEFAULT_CATEGORIES) {
      result.set(fallback.id, fallback);
    }
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') {
          continue;
        }
        const id = item.id.trim();
        const name = this.normalizeCategoryName(item.name);
        if (!id || !name) {
          continue;
        }
        result.set(id, { id, name });
      }
    }
    if (!result.has(DEFAULT_CATEGORY_ID)) {
      result.set(DEFAULT_CATEGORY_ID, {
        id: DEFAULT_CATEGORY_ID,
        name: DEFAULT_CATEGORY_NAME,
      });
    }
    return Array.from(result.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  private normalizeTodos(
    raw: LegacyTodo[] | null | undefined,
    categories: Category[],
  ): Todo[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    const categoryNames = new Map<string, string>();
    for (const category of categories) {
      categoryNames.set(category.name.toLocaleLowerCase(), category.id);
    }
    return raw
      .filter(
        (item): item is LegacyTodo =>
          Boolean(item) && typeof item.id === 'string' && typeof item.title === 'string',
      )
      .map((item) => {
        const categoryId = this.resolveLegacyCategoryId(item, categoryNames);
        return {
          id: item.id,
          title: item.title,
          completed: Boolean(item.completed),
          categoryId,
        };
      });
  }

  private resolveLegacyCategoryId(
    item: LegacyTodo,
    categoryNames: Map<string, string>,
  ): string {
    if (item.categoryId && this.categoryExists(item.categoryId)) {
      return item.categoryId;
    }
    if (item.category) {
      const id = categoryNames.get(item.category.toLocaleLowerCase());
      if (id) {
        return id;
      }
    }
    return DEFAULT_CATEGORY_ID;
  }

  private resolveCategoryId(categoryId: string): string {
    return this.categoryExists(categoryId) ? categoryId : DEFAULT_CATEGORY_ID;
  }

  private categoryExists(categoryId: string): boolean {
    return this.categoriesList().some((category) => category.id === categoryId);
  }

  private normalizeCategoryName(value: string): string {
    return value.trim();
  }

  private slugifyCategoryName(value: string): string {
    const base = value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let next = base || randomId();
    let index = 2;
    while (this.categoryExists(next)) {
      next = `${base}-${index}`;
      index += 1;
    }
    return next;
  }
}
