import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ErrorComponent } from './error/error.component';
import { LoadedComponent } from './loaded/loaded.component';
import { LoadingComponent } from './loading/loading.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { NgxLoadWithDirective } from './ngx-load-with.directive';

@NgModule({
  declarations: [
    NgxLoadWithDirective,
    NgxDataLoaderComponent,
    LoadingComponent,
    ErrorComponent,
    LoadedComponent,
  ],
  exports: [NgxDataLoaderComponent, NgxLoadWithDirective],
  imports: [CommonModule],
})
export class NgxDataLoaderModule {}
