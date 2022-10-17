import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataComponent } from './data/data.component';
import { ErrorComponent } from './error/error.component';
import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { SkeletonComponent } from './skeleton/skeleton.component';

@NgModule({
  declarations: [
    NgxDataLoaderComponent,
    SkeletonComponent,
    ErrorComponent,
    DataComponent,
    LoadingStateTemplatePipe,
  ],
  exports: [NgxDataLoaderComponent],
  imports: [CommonModule],
})
export class NgxDataLoaderModule {}
