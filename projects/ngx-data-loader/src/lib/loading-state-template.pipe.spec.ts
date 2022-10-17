import { LoadingState } from './../../../../dist/ngx-data-loader/lib/loading-state.interface.d';
import { LoadingStateTemplatePipe } from './loading-state-template.pipe';

describe('LoadingStateTemplatePipe', () => {
  const pipe = new LoadingStateTemplatePipe();
  const initialState: LoadingState<any> = {
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
    expect(pipe.transform(errored)).toBe('error');
  });

  it('should return skeleton while loading for the first time', () => {
    const firstTimeLoading = { ...initialState, loaded: false, loading: true };
    expect(pipe.transform(firstTimeLoading)).toBe('skeleton');
  });

  it('should return skeleton if reloading and not showing stale data', () => {
    const reloading = { ...initialState, loaded: true, loading: true };
    const showStaleData = false;
    expect(pipe.transform(reloading, showStaleData)).toBe('skeleton');
  });

  it('should return data if reloading and showing stale data', () => {
    const reloading = { ...initialState, loaded: true, loading: true };
    const showStaleData = true;
    expect(pipe.transform(reloading, showStaleData)).toBe('data');
  });

  it('should return data if loaded and not reloading', () => {
    const loaded = { ...initialState, loaded: true, loading: false };
    expect(pipe.transform(loaded)).toBe('data');
  });
});
