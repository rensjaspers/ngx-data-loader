import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  getDataFn = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('hello world');
      }, 2000);
    });
  };
}
