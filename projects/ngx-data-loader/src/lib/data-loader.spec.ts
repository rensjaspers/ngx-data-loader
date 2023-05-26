import { Observable, of, throwError } from 'rxjs';
import { delay, skip, take } from 'rxjs/operators';
import { DataLoader } from './data-loader';
import { LoadingState } from './loading-state.interface';

describe('DataLoader', () => {
  let dataLoader: DataLoader<string>;
  let firstStateUpdate: Observable<LoadingState<string>>;

  beforeEach(() => {
    dataLoader = new DataLoader<string>(() => of('test'));
    firstStateUpdate = dataLoader.loadingState$.pipe(skip(1), take(1));
  });

  afterEach(() => {
    dataLoader.cancel();
  });

  it('should create', () => {
    expect(dataLoader).toBeTruthy();
  });

  it('should emit initial state', (done) => {
    dataLoader.loadingState$
      .pipe(take(1))
      .subscribe((state: LoadingState<string>) => {
        expect(state).toEqual({
          data: undefined,
          loaded: false,
          loading: false,
          error: null,
        });
        done();
      });
  });

  it('should emit loading state when reload is called', (done) => {
    firstStateUpdate.subscribe((state: LoadingState<string>) => {
      expect(state.loading).toBeTrue();
      done();
    });
    dataLoader.load();
  });

  it('should emit loaded state when data is loaded', (done) => {
    dataLoader.loadFn = () => of('test').pipe(delay(100));
    dataLoader.loadingState$
      .pipe(skip(2), take(1))
      .subscribe((state: LoadingState<string>) => {
        expect(state.loaded).toBeTrue();
        expect(state.loading).toBeFalse();
        expect(state.data).toEqual('test');
        done();
      });
    dataLoader.load();
  });

  it('should emit error state when data loading fails', (done) => {
    const error = new Error('test error');
    dataLoader.loadFn = () => throwError(() => error);
    dataLoader.loadingState$
      .pipe(skip(2), take(1))
      .subscribe((state: LoadingState<string>) => {
        expect(state.loaded).toBeFalse();
        expect(state.loading).toBeFalse();
        expect(state.error).toEqual(error);

        done();
      });
    dataLoader.load();
  });

  it('should emit data override', (done) => {
    const testData = 'test data';
    dataLoader.loadingState$
      .pipe(skip(1), take(1))
      .subscribe((state: LoadingState<string>) => {
        expect(state.loaded).toBeTrue();
        expect(state.loading).toBeFalse();
        expect(state.data).toEqual(testData);
        done();
      });
    dataLoader.setData(testData);
  });

  it('should emit error override', (done) => {
    const error = new Error('test error');
    firstStateUpdate.subscribe((state: LoadingState<string>) => {
      expect(state.loaded).toBeFalse();
      expect(state.loading).toBeFalse();
      expect(state.error).toEqual(error);
      done();
    });
    dataLoader.setError(error);
  });

  it('should cancel loading', (done) => {
    firstStateUpdate.subscribe((state: LoadingState<string>) => {
      expect(state.loading).toBeTrue();
      done();
    });
    dataLoader.load();
    dataLoader.cancel();
  });

  it('should debounce load calls', (done) => {
    const loadFn = jasmine
      .createSpy('loadFn')
      .and.returnValue(of('test').pipe(delay(1000)));
    dataLoader.loadFn = loadFn;
    dataLoader.config.debounceTime = 100;
    dataLoader.loadingState$.subscribe();
    dataLoader.load();
    dataLoader.load();
    dataLoader.load();
    setTimeout(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });
});
