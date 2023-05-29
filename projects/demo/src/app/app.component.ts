import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { interval } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import { GetUsersResponse } from './get-users-response.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  showStaleData = false;
  loadingTemplateDelay = 0;
  userId = '1';
  debounceTime = 500;
  fakeError = new Error('Fake error');

  getTime = () =>
    interval(1000).pipe(map(() => ({ time: new Date().toLocaleTimeString() })));

  getUser = (userId: string) =>
    this.http
      .get<GetUsersResponse>('https://reqres.in/api/users/' + (userId || ''))
      .pipe(
        map((response) => response.data),
        delay(500),
        switchMap((data) =>
          interval(1000).pipe(map((count) => ({ ...data, count })))
        )
      );

  constructor(private http: HttpClient) {}

  getError(message: string) {
    return new Error(message);
  }
}
