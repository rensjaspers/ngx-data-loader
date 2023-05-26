import { LoadingState } from './loading-state.interface';

export interface DataLoaderConfig<T = unknown> {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  loadFnArgs?: any;
  initialData?: T;
  debounceTime?: number;
  onLoadAttemptStart?: () => void;
  onDataLoad?: (data: T) => void;
  onLoadAttemptEnd?: () => void;
  onLoadAttemptFail?: (error: Error) => void;
  onLoadingStateChange?: (state: LoadingState<T>) => void;
}
