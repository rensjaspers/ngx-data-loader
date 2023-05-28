import {
  ChangeDetectorRef,
  Directive,
  EmbeddedViewRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  concat,
  debounce,
  finalize,
  map,
  merge,
  of,
  scan,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';

export interface LoadingState<T = unknown> {
  loading: boolean;
  loaded: boolean;
  error?: Error | null;
  data?: T;
}

export interface LoadedTemplateContext<T = unknown> {
  $implicit: T;
  ngxLoadWith: T;
  loading: boolean;
}

export interface ErrorTemplateContext {
  $implicit: Error;
  retry: () => void;
}

type LoadingPhase = 'loading' | 'loaded' | 'error';

type loadingPhaseHandlers<T> = {
  [K in LoadingPhase]: (state: LoadingState<T>) => void;
};

@Directive({
  selector: '[ngxLoadWith]',
  exportAs: 'ngxLoadWith',
})
export class NgxLoadWithDirective<T = unknown>
  implements OnInit, OnChanges, OnDestroy
{
  /**
   * A function that returns an Observable of the data to be loaded. The function can optionally take an argument of any type.
   * The Observable should emit the data to be loaded, and complete when the data has been fully loaded.
   * If an error occurs while loading the data, the Observable should emit an error.
   */
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  @Input('ngxLoadWith') loadFn!: (args?: any) => Observable<T>;

  /**
   * An optional argument to be passed to the `loadFn` function. Changes to this argument will trigger a reload.
   */
  @Input('ngxLoadWithArgs') args: unknown;

  /**
   * An optional template to be displayed while the data is being loaded.
   * The template can access the `debouncing` property of the `LoadingTemplateContext` interface.
   */
  @Input('ngxLoadWithLoadingTemplate')
  loadingTemplate?: TemplateRef<unknown>;

  /**
   * An optional template to be displayed when an error occurs while loading the data.
   * The template can access the `$implicit` property of the `ErrorTemplateContext` interface, which contains the error object.
   * The template can also access the `retry` function, which can be called to retry loading the data.
   */
  @Input('ngxLoadWithErrorTemplate')
  errorTemplate?: TemplateRef<ErrorTemplateContext>;

  /**
   * The amount of time in milliseconds to wait before triggering a reload when the `ngxLoadWithArgs` input changes.
   * If set to 0, the reload will be triggered immediately.
   */
  @Input('ngxLoadWithDebounceTime') debounceTime = 0;

  /**
   * A boolean indicating whether to use stale data when reloading.
   * If set to true, the directive will use the previously loaded data while reloading.
   * If set to false (default), the directive will clear the previously loaded data before reloading.
   */
  @Input('ngxLoadWithStaleData') staleData = false;

  /**
   * An event emitted when the data loading process starts.
   */
  @Output() loadStart = new EventEmitter<void>();

  /**
   * An event emitted when the data loading process is successful.
   * The event payload is the loaded data of type `T`.
   */
  @Output() loadSuccess = new EventEmitter<T>();

  /**
   * An event emitted when an error occurs while loading the data.
   * The event payload is the error object of type `Error`.
   */
  @Output() loadError = new EventEmitter<Error>();

  /**
   * An event emitted when the data loading process finishes, regardless of whether it was successful or not.
   */
  @Output() loadFinish = new EventEmitter<void>();

  /**
   * An event emitted when the loading state changes.
   * The event payload is the current loading state of type `LoadingState<T>`.
   */
  @Output() loadingStateChange = new EventEmitter<LoadingState<T>>();

  private loadedViewRef?: EmbeddedViewRef<LoadedTemplateContext<T>>;

  private readonly loadTrigger = new Subject<void>();
  private readonly cancelTrigger = new Subject<void>();
  private readonly destroyed = new Subject<void>();
  private readonly stateOverride = new Subject<Partial<LoadingState<T>>>();
  private readonly stop$ = merge(this.cancelTrigger, this.stateOverride);

  private readonly initialState: LoadingState<T> = {
    loading: false,
    loaded: false,
  };

  private readonly loadingPhaseHandlers: loadingPhaseHandlers<T> = {
    loading: () => this.onLoading(),
    loaded: (state) => this.onLoaded(state),
    error: (state) => this.onError(state),
  };

  private readonly loadingState$: Observable<LoadingState<T>> = concat(
    of(this.initialState),
    merge(
      this.stateOverride,
      this.loadTrigger.pipe(map(() => ({ loading: true, error: null }))),
      this.loadTrigger.pipe(
        debounce(() =>
          timer(this.debounceTime || 0).pipe(takeUntil(this.stop$))
        ),
        tap(() => {
          this.loadStart.emit();
        }),
        switchMap(() =>
          this.loadFn(this.args).pipe(
            tap((data) => {
              this.loadSuccess.emit(data);
            }),
            map((data) => ({ loading: false, loaded: true, data })),
            catchError((error) =>
              of({ loading: false, error }).pipe(
                tap(() => {
                  this.loadError.emit(error);
                })
              )
            ),
            finalize(() => {
              this.loadFinish.emit();
            }),
            takeUntil(this.stop$)
          )
        )
      )
    )
  ).pipe(scan((state, update) => ({ ...state, ...update }), this.initialState));

  constructor(
    private templateRef: TemplateRef<LoadedTemplateContext<T>>,
    private viewContainer: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadingState$
      .pipe(
        tap((state) => {
          const phase = this.getLoadingPhase(state);
          this.loadingPhaseHandlers[phase](state);
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.destroyed)
      )
      .subscribe();
    this.load();
  }

  ngOnChanges(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  /**
   * Triggers a reload of the data. Previous load requests are cancelled.
   */
  load(): void {
    this.cancel();
    this.loadTrigger.next();
  }

  /**
   * Cancels any pending load requests.
   */
  cancel(): void {
    this.cancelTrigger.next();
  }

  /**
   * Updates the loading state as if the passed data were loaded through the `loadWith` function.
   */
  setData(data: T): void {
    this.cancel();
    this.stateOverride.next({
      loaded: true,
      loading: false,
      data,
      error: null,
    });
  }

  /**
   * Updates the loading state as if the passed error were thrown by `loadWith` function.
   */
  setError(error: Error): void {
    this.stateOverride.next({ error });
  }

  private getLoadingPhase(state: LoadingState<T>): LoadingPhase {
    if (state.error) {
      return 'error';
    }
    if (state.loaded && (!state.loading || this.staleData)) {
      return 'loaded';
    }
    return 'loading';
  }

  private onError(state: LoadingState<T>): void {
    this.clearViewContainer();
    if (this.errorTemplate) {
      this.viewContainer.createEmbeddedView(this.errorTemplate, {
        $implicit: state.error as Error,
        retry: () => this.load(),
      });
    }
  }

  private onLoading(): void {
    this.clearViewContainer();
    if (this.loadingTemplate) {
      this.viewContainer.createEmbeddedView(this.loadingTemplate);
    }
  }

  private onLoaded(state: LoadingState<T>): void {
    const data = state.data as T;
    const loading = state.loading;
    if (this.loadedViewRef) {
      this.loadedViewRef.context.$implicit = data;
      this.loadedViewRef.context.ngxLoadWith = data;
    } else {
      this.clearViewContainer();
      this.loadedViewRef = this.viewContainer.createEmbeddedView(
        this.templateRef,
        { $implicit: data, ngxLoadWith: data, loading }
      );
    }
  }

  private clearViewContainer() {
    this.viewContainer.clear();
    this.loadedViewRef = undefined;
  }

  static ngTemplateContextGuard<T>(
    _dir: NgxLoadWithDirective<T>,
    _ctx: unknown
  ): _ctx is LoadedTemplateContext<T> {
    return true;
  }
}
