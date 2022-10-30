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
  @Input() getDataFn!: () => Observable<T> | Promise<T>;
  @Input() initialData?: T;
  @Input() retries = 0;
  @Input() retryDelay = 1000;
  @Input() showStaleData = false;
  @Input() skeletonDelay = 0;
  @Input() timeout?: number;
  @Output() dataLoaded = new EventEmitter<T>();
  @Output() error = new EventEmitter<Error>();
  @Output() loadAttemptFinished = new EventEmitter<void>();
  @Output() loadAttemptStarted = new EventEmitter<void>();
  @Output() loadingStateChange = new EventEmitter<LoadingState<T>>();
  loadingState$!: Observable<LoadingState<T>>;
  private loadSource = new ReplaySubject<void>();
  private cancelSource = new Subject<void>();
  private initialState!: LoadingState<T>;

  constructor() {}

  ngOnInit(): void {
    this.initialState = this.getInitialState();

    this.loadingState$ = this.getLoadingStateChanges().pipe(
      scan((state, changes) => ({
        ...state,
        ...changes,
      })),
      tap((state) => this.loadingStateChange.emit(state))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']) {
      return;
    }
    this.loadSource.next();
  }

  reload() {
    this.loadSource.next();
  }

  cancel() {
    this.cancelSource.next();
  }

  setData(data: T) {
    this.runCustomGetDataFn(() => of(data));
  }

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
    this.loadSource.next();
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
