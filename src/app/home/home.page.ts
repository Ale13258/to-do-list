import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { DEFAULT_CATEGORY_ID, Todo } from '../models/todo.model';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  protected readonly todo = inject(TodoService);
  protected readonly flags = inject(FeatureFlagsService);
  private readonly router = inject(Router);
  @ViewChild(IonModal) private createTaskModal?: IonModal;
  protected readonly categorySelectOptions = { cssClass: 'todo-select-popover' };

  protected newTitle = '';
  protected newCategoryId = DEFAULT_CATEGORY_ID;
  protected createModalOpen = false;

  async ngOnInit(): Promise<void> {
    await Promise.all([this.todo.ensureReady(), this.flags.initialize()]);
    await this.todo.loadFromStorage();
  }

  protected async addTodo(): Promise<void> {
    const categoryId =
      this.flags.categoriesEnabled() ? this.newCategoryId : DEFAULT_CATEGORY_ID;
    this.createModalOpen = false;
    await this.todo.addTodo(this.newTitle, categoryId);
    this.resetCreateTaskForm();
  }

  protected openCreateTaskModal(): void {
    this.createModalOpen = true;
  }

  protected closeCreateTaskModal(): void {
    this.createModalOpen = false;
    void this.createTaskModal?.dismiss();
  }

  protected onCreateTaskDidDismiss(): void {
    this.createModalOpen = false;
    this.resetCreateTaskForm();
  }

  private resetCreateTaskForm(): void {
    this.newTitle = '';
    this.newCategoryId = DEFAULT_CATEGORY_ID;
  }

  protected openCategoriesFromModal(): void {
    this.createModalOpen = false;
    void this.createTaskModal?.dismiss();
    void this.router.navigateByUrl('/categories');
  }

  protected async onToggle(todo: Todo): Promise<void> {
    await this.todo.toggleComplete(todo.id);
  }

  protected async onRemove(todo: Todo): Promise<void> {
    await this.todo.removeTodo(todo.id);
  }

  protected async onTodoCategoryChange(
    todo: Todo,
    event: CustomEvent<{ value: string }>,
  ): Promise<void> {
    const value = event.detail?.value;
    if (value === undefined || value === null) {
      return;
    }
    await this.todo.updateTodoCategory(todo.id, String(value));
  }

  protected onFilterChange(event: CustomEvent<{ value: string }>): void {
    const v = event.detail?.value;
    if (v !== undefined && v !== null) {
      this.todo.setCategoryFilter(String(v));
    }
  }

  protected pendingTasks(): Todo[] {
    return this.todo.filteredTodos().filter((item) => !item.completed);
  }

  protected completedTasks(): Todo[] {
    return this.todo.filteredTodos().filter((item) => item.completed);
  }

  protected categoryName(categoryId: string): string {
    return this.todo.categoriesById().get(categoryId)?.name ?? 'General';
  }

  protected trackById(_index: number, item: Todo): string {
    return item.id;
  }
}
