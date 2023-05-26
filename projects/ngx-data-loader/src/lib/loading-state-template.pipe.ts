import { Pipe, PipeTransform } from '@angular/core';
import { LoadingState } from './loading-state.interface';

type TemplateName = 'loading' | 'error' | 'data';

@Pipe({
  name: 'loadingStateTemplate',
})
export class LoadingStateTemplatePipe implements PipeTransform {
  transform(
    state: LoadingState<unknown>,
    showStaleData: boolean
  ): TemplateName {
    if (state.error) {
      return 'error';
    }
    if (state.loaded && (!state.loading || showStaleData)) {
      return 'data';
    }
    return 'loading';
  }
}
