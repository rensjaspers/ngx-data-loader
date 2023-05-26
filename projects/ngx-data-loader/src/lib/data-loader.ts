import { Observable, ReplaySubject, Subject, merge, of, timer } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  scan,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { LoadingState } from './loading-state.interface';
import { DataLoaderConfig } from './data-loader-config.interface';

export class DataLoader<T = unknown> {
  loadingState$!: Observable<LoadingState<T>>;

  private loadTriggerSource = new ReplaySubject<void>(1);
  private loadTrigger$ = this.loadTriggerSource.asObservable();
  private cancelSource = new Subject<void>();
  private stateOverrideSource = new Subject<LoadingState<T>>();

  private stop$ = merge(this.cancelSource, this.stateOverrideSource);

  constructor(
    public loadFn: (...args: any[]) => Observable<T>,
    public config: DataLoaderConfig<T> = {}
  ) {
    this.loadingState$ = this.getLoadingState();
  }

  load() {
    this.loadTriggerSource.next();
  }

  cancel() {
    this.cancelSource.next();
  }

  setData(data: T) {
    this.stateOverrideSource.next({
      data,
      loaded: true,
      loading: false,
      error: null,
    });
  }

  setError(error: Error) {
    this.stateOverrideSource.next({
      data: null,
      loaded: false,
      loading: false,
      error,
    });
  }

  private getLoadingState() {
    const initialState = this.getInitialState();
    const loadingUpdate$ = this.getLoadingStateUpdates();
    const resultUpdate$ = this.getResultStateUpdates();
    return merge(loadingUpdate$, resultUpdate$, this.stateOverrideSource).pipe(
      startWith(initialState),
      scan(
        (state, update) => ({
          ...state,
          ...update,
        }),
        initialState
      )
    );
  }

  private getLoadingStateUpdates() {
    return this.loadTrigger$.pipe(map(() => ({ loading: true, error: null })));
  }

  private getResultStateUpdates() {
    return this.getDebouncedLoadTrigger().pipe(
      switchMap(() => this.getLoadResult())
    );
  }

  private getLoadResult() {
    this.config.onLoadAttemptStart?.();
    return this.loadFn(this.config.loadFnArgs).pipe(
      map((data) => ({ data, loaded: true, loading: false })),
      tap((state) => this.config.onDataLoad?.(state.data)),
      catchError((error) => this.onError(error)),
      takeUntil(this.stop$),
      finalize(() => this.config.onLoadAttemptEnd?.())
    );
  }

  private onError(error: Error) {
    this.config.onLoadAttemptFail?.(error);
    return of({ error, data: null, loaded: false, loading: false });
  }

  private getInitialState(): LoadingState<T> {
    const hasInitialData = Object.prototype.hasOwnProperty.call(
      this.config,
      'initialData'
    );
    return {
      data: this.config.initialData,
      loaded: hasInitialData,
      loading: false,
      error: null,
    };
  }

  private getDebouncedLoadTrigger() {
    return this.loadTrigger$.pipe(
      switchMap(() =>
        this.config.debounceTime
          ? timer(this.config.debounceTime).pipe(takeUntil(this.stop$))
          : of(null)
      )
    );
  }
}
