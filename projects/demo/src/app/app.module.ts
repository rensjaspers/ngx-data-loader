import { NgxDataLoaderModule } from 'ngx-data-loader';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxDataLoaderModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
