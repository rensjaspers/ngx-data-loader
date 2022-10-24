export interface LoadingState<T> {
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  data: T | null | undefined;
}
