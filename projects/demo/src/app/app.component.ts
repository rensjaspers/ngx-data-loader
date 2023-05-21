import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { LoadingState } from './../../../ngx-data-loader/src/lib/loading-state.interface';
import { GetUsersResponse, User } from './get-users-response.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showStaleData = false;
  loadingTemplateDelay = 0;
  userId = '1';
  debounceTime = 500;

  getUser = (userId: string) =>
    this.http
      .get<GetUsersResponse>('https://reqres.in/api/users/' + (userId || ''))
      .pipe(
        map((response) => response.data),
        delay(500)
      );

  constructor(private http: HttpClient) {}

  logChange(event: LoadingState<User>) {
    console.log(event);
  }

  getError(message: string) {
    return new Error(message);
  }
}
