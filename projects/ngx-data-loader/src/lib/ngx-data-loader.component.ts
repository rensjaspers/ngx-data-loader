import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { LoadingState, NgxLoadWithDirective } from 'ngx-load-with';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngx-data-loader',
  templateUrl: './ngx-data-loader.component.html',
  styleUrls: ['./ngx-data-loader.component.scss'],
})
export class NgxDataLoaderComponent<T = unknown> {
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

  @ViewChild('loader', { static: true }) loader!: NgxLoadWithDirective<T>;

  setData(data: T): void {
    this.loader.setData(data);
  }

  setError(error: Error): void {
    this.loader.setError(error);
  }

  reload(): void {
    this.loader.load();
  }

  cancel(): void {
    this.loader.cancel();
  }
}
