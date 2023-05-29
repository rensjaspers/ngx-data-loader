import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxLoadWithModule } from 'ngx-load-with';
import { ErrorComponent } from './error/error.component';
import { LoadedComponent } from './loaded/loaded.component';
import { LoadingComponent } from './loading/loading.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';

@NgModule({
  declarations: [
    NgxDataLoaderComponent,
    LoadingComponent,
    ErrorComponent,
    LoadedComponent,
  ],
  exports: [NgxDataLoaderComponent],
  imports: [CommonModule, NgxLoadWithModule],
})
export class NgxDataLoaderModule {}
