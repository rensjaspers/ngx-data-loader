import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import {
  concat,
  from,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  retry,
  scan,
  switchMap,
  takeUntil,
  tap,
  timeout,
} from 'rxjs/operators';
import { LoadingState } from './loading-state.interface';

@Component({
  selector: 'ngx-data-loader',
  templateUrl: './ngx-data-loader.component.html',
  styleUrls: ['./ngx-data-loader.component.scss'],
})
export class NgxDataLoaderComponent<T = unknown> implements OnInit, OnChanges {
  @ContentChild('dataTemplate') dataTemplate?: TemplateRef<unknown>;
  @ContentChild('errorTemplate') errorTemplate?: TemplateRef<unknown>;
  @ContentChild('skeletonTemplate') skeletonTemplate?: TemplateRef<unknown>;

  /**
   * Function that returns an `Observable` of the data to be loaded.
   * Called on init and on reload.
   *
   * @example
   * getDataFn = () => this.http.get('https://example.com/api/data')
   */
  @Input() getDataFn!: () => Observable<T> | Promise<T>;

  /**
   * Data to be rendered on init. When set, `getDataFn` will not be invoked on init.
   * The loading state will be set to `loaded`.
   */
  @Input() initialData?: T;

  /**
   * Number of times to retry loading the data.
   * @defaultValue `0`                                                                    |
   */
  @Input() retries = 0;

  /**
   * Delay in milliseconds between retries.
   * @defaultValue `1000`
   */
  @Input() retryDelay = 1000;

  /**
   * Whether to show stale data while reloading.
   * @defaultValue `false`
   */
  @Input() showStaleData = false;

  /**
   * Delay in milliseconds before showing the skeleton.
   * @defaultValue `0`
   */
  @Input() skeletonDelay = 0;

  /**
   * Number of milliseconds to wait for `getDataFn` to emit before throwing an error.
   */
  @Input() timeout?: number;

  /**
   * Emits the data when loaded.
   */
  @Output() dataLoaded = new EventEmitter<T>();

  /**
   * Emits the error when the data fails to load.
   */
  @Output() error = new EventEmitter<Error>();

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
  loadingState$!: Observable<LoadingState<T>>;
  private loadSource = new ReplaySubject<void>();
  private cancelSource = new Subject<void>();
  private initialState!: LoadingState<T>;

  constructor() {}

  ngOnInit(): void {
    this.initialState = this.getInitialState();

    this.loadingState$ = this.getLoadingStateChanges().pipe(
      scan((state, change) => ({
        ...state,
        ...change,
      })),
      tap((state) => this.loadingStateChange.emit(state))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']) {
      return;
    }
    this.reload();
  }

  /**
   *  Resets the loading state and calls `getDataFn`.
   */
  reload() {
    this.loadSource.next();
  }

  /**
   * Cancels `getDataFn`. Loading state will remain unchanged.
   */
  cancel() {
    this.cancelSource.next();
  }

  /**
   * Updates the loading state as if the passed data were loaded through `getDataFn`.
   */
  setData(data: T) {
    this.runCustomGetDataFn(() => of(data));
  }

  /**
   * Updates the loading state as if the passed error were thrown by `getDataFn`.
   */
  setError(error: Error) {
    this.runCustomGetDataFn(() => throwError(() => error));
  }

  private getLoadingStateChanges() {
    return concat(
      of(this.initialState),
      merge(this.beforeLoad(), this.afterLoad())
    ) as Observable<LoadingState<T>>;
  }

  private beforeLoad() {
    return this.loadSource.pipe(map(() => ({ loading: true, error: null })));
  }

  private afterLoad() {
    return this.loadSource.pipe(switchMap(() => this.getData()));
  }

  private getData() {
    this.loadAttemptStarted.emit();
    return from(this.getDataFn()).pipe(
      map((data) => ({ data, loaded: true, loading: false })),
      tap((state) => this.dataLoaded.emit(state.data)),
      this.timeout ? timeout(this.timeout) : tap(),
      retry({ count: this.retries, delay: this.retryDelay }),
      catchError((error) => this.onError(error)),
      takeUntil(this.cancelSource),
      finalize(() => this.loadAttemptFinished.emit())
    );
  }

  private onError(error: Error) {
    this.error.emit(error);
    return of({ error, data: null, loaded: false, loading: false });
  }

  private runCustomGetDataFn(customGetDataFn: () => Observable<T>) {
    const originalGetDataFn = this.getDataFn;
    this.getDataFn = customGetDataFn;
    this.reload();
    this.getDataFn = originalGetDataFn;
  }

  private getInitialState(): LoadingState<T> {
    const hasInitialData = this.hasOwnProperty('initialData');
    return {
      data: this.initialData,
      loaded: hasInitialData,
      loading: false,
      error: null,
    };
  }
}
