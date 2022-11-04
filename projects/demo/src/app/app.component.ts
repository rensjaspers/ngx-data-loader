import { LoadingState } from './../../../ngx-data-loader/src/lib/loading-state.interface';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { GetUsersResponse, User } from './get-users-response.interface';

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
  userId = '1';
  debounceTime = 0;

  getUser = (userId: string) =>
    this.http
      .get<GetUsersResponse>('https://reqres.in/api/users/' + userId || '')
      .pipe(
        map((response) => response.data),
        delay(1000)
      );

  constructor(private http: HttpClient) {}

  logChange(event: LoadingState<User>) {
    console.log(event);
  }

  getError(message: string) {
    return new Error(message);
  }
}
