import { LoadingState } from './loading-state.interface';

export interface DataLoaderConfig<T = unknown> {
  loadFnArgs?: any;
  initialData?: T;
  debounceTime?: number;
  onLoadAttemptStart?: () => void;
  onDataLoad?: (data: T) => void;
  onLoadAttemptEnd?: () => void;
  onLoadAttemptFail?: (error: Error) => void;
  onLoadingStateChange?: (state: LoadingState<T>) => void;
}
