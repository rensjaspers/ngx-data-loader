import {
  Component,
  ContentChild,
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
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  retry,
  scan,
  switchMap,
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
  @ContentChild('dataTemplate') dataTemplate?: TemplateRef<any>;
  @ContentChild('errorTemplate') errorTemplate?: TemplateRef<any>;
  @ContentChild('skeletonTemplate') skeletonTemplate?: TemplateRef<any>;
  @Input() getDataFn!: () => Observable<T> | Promise<T>;
  @Input() retries = 0;
  @Input() retryDelay = 1000;
  @Input() showStaleData = false;
  @Input() skeletonDelay = 0;
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
    return this.loadTrigger$.pipe(switchMap(() => this.getData()));
  }

  private getData() {
    this.loadAttemptStarted.emit();
    return combineLatest([
      from(this.getDataFn()),
      timer(this.skeletonDelay),
    ]).pipe(
      map(([data]) => ({ data, loaded: true, loading: false })),
      tap((state) => this.dataLoaded.emit(state.data)),
      timeout(this.timeout),
      retry({ count: this.retries, delay: this.retryDelay }),
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
}
