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
  identity,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  debounce,
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
   * Number of milliseconds to wait for `loadFn` to emit before throwing an error.
   */
  @Input() timeout?: number;

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
  loadingState$!: Observable<LoadingState<T>>;
  private loadTriggerSource = new ReplaySubject<void>();
  private loadTrigger$ = this.loadTriggerSource.asObservable();
  private cancelSource = new Subject<void>();

  ngOnInit(): void {
    this.loadingState$ = this.getLoadingState().pipe(
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
   *  Resets the loading state and calls `loadFn`.
   */
  reload() {
    this.loadTriggerSource.next();
  }

  /**
   * Cancels `loadFn`. Loading state will remain unchanged.
   */
  cancel() {
    this.cancelSource.next();
  }

  /**
   * Updates the loading state as if the passed data were loaded through `loadFn`.
   */
  setData(data: T) {
    this.runCustomLoadFn(() => of(data));
  }

  /**
   * Updates the loading state as if the passed error were thrown by `loadFn`.
   */
  setError(error: Error) {
    this.runCustomLoadFn(() => throwError(() => error));
  }

  private getLoadingState() {
    const initialState = this.getInitialState();
    const loadingUpdate$ = this.getLoadings();
    const resultUpdate$ = this.getResults();
    return concat(of(initialState), merge(loadingUpdate$, resultUpdate$)).pipe(
      scan(
        (state, update) => ({
          ...state,
          ...update,
        }),
        initialState
      )
    ) as Observable<LoadingState<T>>;
  }

  private getLoadings() {
    return this.loadTrigger$.pipe(map(() => ({ loading: true, error: null })));
  }

  private getResults() {
    return this.getDebouncedLoadTrigger().pipe(
      switchMap(() => this.getLoadResult())
    );
  }

  private getLoadResult() {
    this.loadAttemptStarted.emit();
    return this.loadFn(this.loadFnArgs).pipe(
      map((data) => ({ data, loaded: true, loading: false })),
      tap((state) => this.dataLoaded.emit(state.data)),
      this.timeout ? timeout(this.timeout) : identity,
      retry({ count: this.retries, delay: this.retryDelay }),
      catchError((error) => this.onError(error)),
      takeUntil(this.cancelSource),
      finalize(() => this.loadAttemptFinished.emit())
    );
  }

  private onError(error: Error) {
    this.loadAttemptFailed.emit(error);
    return of({ error, data: null, loaded: false, loading: false });
  }

  private runCustomLoadFn(customLoadFn: () => Observable<T>) {
    const originalFn = this.loadFn;
    this.loadFn = customLoadFn;
    this.reload();
    this.loadFn = originalFn;
  }

  private getInitialState(): LoadingState<T> {
    const hasInitialData = Object.prototype.hasOwnProperty.call(
      this,
      'initialData'
    );
    return {
      data: this.initialData,
      loaded: hasInitialData,
      loading: false,
      error: null,
    };
  }

  private getDebouncedLoadTrigger() {
    return this.loadTrigger$.pipe(
      debounce((value) =>
        this.debounceTime > 0 ? timer(this.debounceTime) : of(value)
      )
    );
  }
}
