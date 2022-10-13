import { GetUsersResponse } from './get-users-response.interface';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showStaleData = false;
  timeout = 30000;
  skeletonDelay = 0;
  retries = 0;
  retryDelay = 1000;

  getUsers = () =>
    this.http.get<GetUsersResponse>('https://reqres.in/api/users').pipe(
      map((response) => response.data),
      delay(3000)
    );

  constructor(private http: HttpClient) {}

  logChange(event: any) {
    console.log(event);
  }
}
