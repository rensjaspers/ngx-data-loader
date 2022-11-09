import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataComponent } from './data/data.component';
import { ErrorComponent } from './error/error.component';
import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [
    NgxDataLoaderComponent,
    LoadingComponent,
    ErrorComponent,
    DataComponent,
    LoadingStateTemplatePipe,
  ],
  exports: [NgxDataLoaderComponent],
  imports: [CommonModule],
})
export class NgxDataLoaderModule {}
