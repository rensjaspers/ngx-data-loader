import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ErrorComponent } from './error/error.component';
import { LoadedComponent } from './loaded/loaded.component';
import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import { LoadingComponent } from './loading/loading.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';

@NgModule({
  declarations: [
    NgxDataLoaderComponent,
    LoadingComponent,
    ErrorComponent,
    LoadedComponent,
    LoadingStateTemplatePipe,
  ],
  exports: [NgxDataLoaderComponent],
  imports: [CommonModule],
})
export class NgxDataLoaderModule {}
