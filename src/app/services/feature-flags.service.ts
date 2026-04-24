import { Injectable, computed, inject, signal } from '@angular/core';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';

/** Parámetro Remote Config que habilita categorías y filtrado en la UI. */
export const REMOTE_CONFIG_FEATURE_CATEGORIES = 'feature_todo_categories';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly loaded = signal(false);

  readonly remoteConfigReady = computed(() => this.loaded());

  private readonly categoriesFeature = signal(true);

  /** Feature flag: categorías y filtro por categoría visibles en la app. */
  readonly categoriesEnabled = this.categoriesFeature.asReadonly();

  private readonly remoteConfig = inject(AngularFireRemoteConfig);

  /**
   * Descarga Remote Config y activa valores; ante error de red se usan DEFAULTS del módulo.
   */
  async initialize(): Promise<void> {
    try {
      await this.remoteConfig.fetchAndActivate();
    } catch {
      // Defaults del provider DEFAULTS en AppModule
    }
    try {
      const raw = await this.remoteConfig.getValue(REMOTE_CONFIG_FEATURE_CATEGORIES);
      const value = raw.asString().toLowerCase().trim();
      // Mantener categorías activas por defecto; solo apagar si viene false/0 explícito.
      if (value === 'false' || value === '0') {
        this.categoriesFeature.set(false);
      } else if (value === 'true' || value === '1') {
        this.categoriesFeature.set(true);
      }
    } finally {
      this.loaded.set(true);
    }
  }
}
