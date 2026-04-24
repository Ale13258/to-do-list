import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { computed, signal } from '@angular/core';

import { HomePage } from './home.page';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { TodoService } from '../services/todo.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    const list = signal<
      { id: string; title: string; completed: boolean; category: string }[]
    >([]);
    const filter = signal('all');

    const todoMock: Partial<TodoService> = {
      ensureReady: jasmine.createSpy().and.returnValue(Promise.resolve()),
      loadFromStorage: jasmine.createSpy().and.returnValue(Promise.resolve()),
      addTodo: jasmine.createSpy().and.returnValue(Promise.resolve()),
      toggleComplete: jasmine.createSpy().and.returnValue(Promise.resolve()),
      removeTodo: jasmine.createSpy().and.returnValue(Promise.resolve()),
      setCategoryFilter: jasmine.createSpy(),
      filteredTodos: computed(() => list()),
      categoriesInUse: computed(() => []),
      categoryFilter: filter,
    };

    const rcReady = signal(true);
    const catsOn = signal(true);
    const flagsMock: Partial<FeatureFlagsService> = {
      initialize: jasmine.createSpy().and.returnValue(Promise.resolve()),
      remoteConfigReady: rcReady,
      categoriesEnabled: catsOn,
    };

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: TodoService, useValue: todoMock },
        { provide: FeatureFlagsService, useValue: flagsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
