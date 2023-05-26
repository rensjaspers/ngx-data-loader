import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { DataLoader } from './data-loader';
import { DataLoaderConfig } from './data-loader-config.interface';
import { LoadingState } from './loading-state.interface';

@Component({
  selector: 'ngx-data-loader',
  templateUrl: './ngx-data-loader.component.html',
  styleUrls: ['./ngx-data-loader.component.scss'],
})
export class NgxDataLoaderComponent<T = unknown> implements OnChanges {
  @ContentChild('loaded') loadedTemplate?: TemplateRef<unknown>;
  @ContentChild('error') errorTemplate?: TemplateRef<unknown>;
  @ContentChild('loading') loadingTemplate?: TemplateRef<unknown>;

  /**
   * Function that returns an `Observable` of the data to be loaded.
   * Called on init and on reload.
   *
   * @example
   * loadFn = () => this.http.get('https://example.com/api/data')
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  @Input() loadFn!: (args?: any) => Observable<T>;

  /**
   * Arguments to pass to `loadFn`. Changes to this property will trigger a reload.
   *
   * @example
   * loadFn = () => this.http.get('https://example.com/api/data')
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  @Input() loadFnArgs?: any;

  /**
   * Data to be rendered on init. When set, `loadFn` will not be invoked on init.
   * The loading state will be set to `loaded`.
   */
  @Input() initialData?: T;

  /**
   * Number of milliseconds to debounce reloads.
   * @defaultValue `0`                                                                    |
   */
  @Input() debounceTime = 0;

  /**
   * Whether to keep displaying previously loaded data while reloading.
   * @defaultValue `false`
   */
  @Input() showStaleData = false;

  /**
   * Delay in milliseconds before showing the loading template.
   * @defaultValue `0`
   */
  @Input() loadingTemplateDelay = 0;

  /**
   * Emits the data when loaded.
   */
  @Output() dataLoaded = new EventEmitter<T>();

  /**
   * Emits the error when the data fails to load.
   */
  @Output() loadAttemptFailed = new EventEmitter<Error>();

  /**
   * Emits when the data loading completes (either successfully or unsuccessfully).
   */
  @Output() loadAttemptFinished = new EventEmitter<void>();

  /**
   * Emits when the data loading starts.
   */
  @Output() loadAttemptStarted = new EventEmitter<void>();

  /**
   * Emits the loading state when it changes.
   */
  @Output() loadingStateChange = new EventEmitter<LoadingState<T>>();
  dataLoader!: DataLoader<T>;

  ngOnChanges(changes: SimpleChanges): void {
    this.createOrUpdateLoader();
    if (this.shouldTriggerReload(changes)) {
      this.reload();
    }
  }

  /**
   *  Resets the loading state and calls `loadFn`.
   */
  reload() {
    this.dataLoader.load();
  }

  /**
   * Cancels `loadFn`. Loading state will remain unchanged.
   */
  cancel() {
    this.dataLoader.cancel();
  }

  /**
   * Updates the loading state as if the passed data were loaded through `loadFn`.
   */
  setData(data: T) {
    this.dataLoader.setData(data);
  }

  /**
   * Updates the loading state as if the passed error were thrown by `loadFn`.
   */
  setError(error: Error) {
    this.dataLoader.setError(error);
  }

  private createLoader() {
    this.dataLoader = new DataLoader<T>(this.loadFn, this.getConfig());
  }

  private getConfig(): DataLoaderConfig<T> {
    return {
      loadFnArgs: this.loadFnArgs,
      initialData: this.initialData,
      debounceTime: this.debounceTime,
      onLoadAttemptStart: () => this.loadAttemptStarted.emit(),
      onLoadAttemptEnd: () => this.loadAttemptFinished.emit(),
      onLoadAttemptFail: (error) => this.loadAttemptFailed.emit(error),
      onDataLoad: (data) => this.dataLoaded.emit(data),
      onLoadingStateChange: (state) => this.loadingStateChange.emit(state),
    };
  }

  private updateLoader() {
    this.dataLoader.loadFn = this.loadFn;
    this.dataLoader.config = this.getConfig();
  }

  private shouldTriggerReload(changes: SimpleChanges): boolean {
    if (changes['initialData']?.firstChange) {
      return false;
    }
    return true;
  }

  private createOrUpdateLoader() {
    if (!this.dataLoader) {
      this.createLoader();
    } else {
      this.updateLoader();
    }
  }
}
