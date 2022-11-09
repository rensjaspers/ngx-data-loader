import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import { LoadingState } from './loading-state.interface';

describe('LoadingStateTemplatePipe', () => {
  const pipe = new LoadingStateTemplatePipe();
  const initialState: LoadingState<unknown> = {
    loading: true,
    loaded: false,
    error: null,
    data: null,
  };

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return error if there is an error', () => {
    const errored = { ...initialState, error: new Error('test error') };
    expect(pipe.transform(errored, true)).toBe('error');
  });

  it('should return loading while loading for the first time', () => {
    const firstTimeLoading = { ...initialState, loaded: false, loading: true };
    expect(pipe.transform(firstTimeLoading, true)).toBe('loading');
  });

  it('should return loading if reloading and not showing stale data', () => {
    const reloading = { ...initialState, loaded: true, loading: true };
    const showStaleData = false;
    expect(pipe.transform(reloading, showStaleData)).toBe('loading');
  });

  it('should return data if reloading and showing stale data', () => {
    const reloading = { ...initialState, loaded: true, loading: true };
    const showStaleData = true;
    expect(pipe.transform(reloading, showStaleData)).toBe('data');
  });

  it('should return data if loaded and not reloading', () => {
    const loaded = { ...initialState, loaded: true, loading: false };
    expect(pipe.transform(loaded, true)).toBe('data');
  });
});
