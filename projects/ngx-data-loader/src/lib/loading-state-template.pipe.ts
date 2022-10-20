import { Pipe, PipeTransform } from '@angular/core';
import { LoadingState } from './loading-state.interface';

type templateName = 'skeleton' | 'error' | 'data';

@Pipe({
  name: 'loadingStateTemplate',
})
export class LoadingStateTemplatePipe implements PipeTransform {
  transform(state: LoadingState<any>, showStaleData: boolean): templateName {
    if (state.error) {
      return 'error';
    }
    if (state.loaded) {
      if (!state.loading) {
        return 'data';
      }
      if (showStaleData === true) {
        return 'data';
      }
    }
    return 'skeleton';
  }
}
