import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  combineLatest,
  concat,
  from,
  merge,
  Observable,
  of,
  ReplaySubject,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  exhaustMap,
  map,
  retryWhen,
  scan,
  tap,
  timeout,
} from 'rxjs/operators';

interface LoadingState<T> {
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  data: T | null;
}

@Component({
  selector: 'ngx-data-loader',
  templateUrl: './ngx-data-loader.component.html',
  styleUrls: ['./ngx-data-loader.component.scss'],
})
export class NgxDataLoaderComponent<T = any> implements OnInit, OnChanges {
  @Input() dataTemplate?: TemplateRef<any>;
  @Input() errorTemplate?: TemplateRef<any>;
  @Input() getDataFn!: () => Observable<T> | Promise<T>;
  @Input() retries = 0;
  @Input() retryDelay = 1000;
  @Input() showStaleData = false;
  @Input() skeletonDelay = 0;
  @Input() skeletonMinDuration = 0;
  @Input() skeletonTemplate?: TemplateRef<any>;
  @Input() timeout = 30000;
  @Output() dataLoaded = new EventEmitter<T>();
  @Output() error = new EventEmitter<Error>();
  @Output() loadAttemptFinished = new EventEmitter<void>();
  @Output() loadAttemptStarted = new EventEmitter<void>();
  @Output() loadingStateChange = new EventEmitter<LoadingState<T>>();
  vm$!: Observable<LoadingState<T>>;
  private loadTrigger$ = new ReplaySubject<void>();
  private readonly initialState: LoadingState<T> = {
    loading: true,
    loaded: false,
    data: null,
    error: null,
  };

  constructor() {}

  ngOnInit(): void {
    this.vm$ = this.getLoadingStateChanges().pipe(
      scan((state, changes) => ({
        ...state,
        ...changes,
      })),
      distinctUntilChanged((a, b) => this.stateHasChanged(a, b)),
      tap((state) => this.loadingStateChange.emit(state))
    );
  }

  ngOnChanges(): void {
    this.loadTrigger$.next();
  }

  reload() {
    this.loadTrigger$.next();
  }

  private getLoadingStateChanges() {
    return concat(
      of(this.initialState),
      merge(this.beforeLoad(), this.afterLoad())
    ) as Observable<LoadingState<T>>;
  }

  private beforeLoad() {
    return this.loadTrigger$.pipe(map(() => ({ loading: true, error: null })));
  }

  private afterLoad() {
    return this.loadTrigger$.pipe(exhaustMap(() => this.getData()));
  }

  private getData() {
    this.loadAttemptStarted.emit();
    const skeletonDuration = this.skeletonDelay + this.skeletonMinDuration;
    return combineLatest([
      from(this.getDataFn()),
      timer(skeletonDuration),
    ]).pipe(
      map(([data]) => ({ data, loaded: true, loading: false })),
      tap((state) => this.dataLoaded.emit(state.data)),
      timeout(this.timeout),
      retryWhen((error$) => this.retry(error$)),
      catchError((error) => this.onError(error)),
      tap(() => this.loadAttemptFinished.emit())
    );
  }

  private onError(error: any) {
    this.error.emit(error);
    return of({ error, loading: false });
  }

  private stateHasChanged(a: LoadingState<T>, b: LoadingState<T>): boolean {
    return (
      a.data === b.data &&
      a.loading === b.loading &&
      a.error === b.error &&
      a.loaded === b.loaded
    );
  }

  private retry(error$: Observable<any>) {
    return error$.pipe(
      exhaustMap((error, count) =>
        count >= this.retries ? throwError(() => error) : timer(this.retryDelay)
      )
    );
  }
}
