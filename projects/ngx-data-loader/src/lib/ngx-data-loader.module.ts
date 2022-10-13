import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { SkeletonComponent } from './skeleton/skeleton.component';
import { ErrorComponent } from './error/error.component';
import { DataComponent } from './data/data.component';

@NgModule({
  declarations: [
    NgxDataLoaderComponent,
    SkeletonComponent,
    ErrorComponent,
    DataComponent,
  ],
  exports: [NgxDataLoaderComponent],
  imports: [CommonModule],
})
export class DataLoaderModule {}
