import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { TodoService } from '../services/todo.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  protected readonly todo = inject(TodoService);
  private readonly alertController = inject(AlertController);

  protected taskCount(categoryId: string): number {
    return this.todo.taskCountByCategory().get(categoryId) ?? 0;
  }

  protected async createCategory(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'category-alert',
      header: 'Nueva categoría',
      inputs: [{ name: 'name', type: 'text', placeholder: 'Nombre', cssClass: 'category-name-input' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          role: 'confirm',
          handler: (value: { name?: string }) => {
            void this.todo.addCategory(value.name ?? '');
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  protected async renameCategory(categoryId: string, currentName: string): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'category-alert',
      header: 'Renombrar categoría',
      inputs: [{ name: 'name', type: 'text', value: currentName, cssClass: 'category-name-input' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          role: 'confirm',
          handler: async (value: { name?: string }) =>
            this.todo.renameCategory(categoryId, value.name ?? ''),
        },
      ],
    });
    await alert.present();
  }

  protected async removeCategory(categoryId: string, categoryName: string): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'category-alert',
      header: 'Eliminar categoría',
      message: `¿Seguro que deseas eliminar "${categoryName}"? Sus tareas pasarán a General.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.todo.removeCategory(categoryId);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }
}
