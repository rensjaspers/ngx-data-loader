# NgxDataLoader

Data loader component for Angular 14+.

Most async data loading in Angular is done the same way: show a loading indicator while the data is loading, then show the data when it's loaded, or show an error message or a retry button if the data failed to load.

The NgxDataLoader component makes this easy. You only need to provide a `getDataFn` that returns an observable with the data, and a `dataTemplate` that renders the data.
The component will handle the rest.

## Demo

[View demo at https://ngx-data-loader.netlify.app](https://ngx-data-loader.netlify.app)

## Getting started

Install the package

```bash
npm install ngx-data-loader
```

Import the module

```typescript
import { NgxDataLoaderModule } from 'ngx-data-loader';

@NgModule({
  imports: [
    NgxDataLoaderModule,
    ...
  ],
  ...
})
export class AppModule {}
```

Use the component

```html
<!-- app.component.html -->
<ngx-data-loader [loading]="loading" [dataTemplate]="getTodo">
  <ng-template #dataTemplate let-todo>
    Title: {{ todo.title }} <br />
    Completed: {{ todo.completed ? 'Yes' : 'No' }}
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  ...
})
export class AppComponent {
  getTodo = () => this.http.get('https://jsonplaceholder.typicode.com/todos/1');

  constructor(private http: HttpClient) {}
}
```

## Properties

| Name                                                           | Description                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@Input()`<br />`getDataFn: () => Observable<T> \| Promise<T>` | Function that returns the data to be loaded.                                                      |
| `@Input()`<br />`dataTemplate?: TemplateRef<any>`              | Template to be displayed when the data is loaded.                                                 |
| `@Input()`<br />`skeletonTemplate?: TemplateRef<any>`          | Template to be displayed when the data is loading.                                                |
| `@Input()`<br />`errorTemplate?: TemplateRef<any>`             | Template to be displayed when the data failed to load.                                            |
| `@Input()`<br />`retries: number`                              | Number of times to retry loading the data. Default: `0`                                           |
| `@Input()`<br />`retryDelay: number`                           | Delay in milliseconds between retries. Default: `1000`                                            |
| `@Input()`<br />`showStaleData: boolean`                       | Whether to show stale data while reloading. Default: `false`                                      |
| `@Input()`<br />`skeletonDelay: number`                        | Delay in milliseconds before showing the skeleton. Default: `0`                                   |
| `@Input()`<br />`timeout: number`                              | Number of milliseconds to wait for `getDataFn` to emit before throwing an error. Default: `30000` |

## Events

| Name                                                                 | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `@Output()`<br />`dataLoaded: EventEmitter<T>`                       | Emitted when the data is loaded.                                     |
| `@Output()`<br />`loadAttemptStarted: EventEmitter<void>`            | Emitted when the data loading is started.                            |
| `@Output()`<br />`error: EventEmitter<Error>`                        | Emitted when the data failed to load.                                |
| `@Output()`<br />`loadAttemptFinished: EventEmitter<void>`           | Emitted when the data has either loaded or failed to load.           |
| `@Output()`<br />`loadingStateChange: EventEmitter<LoadingState<T>>` | Emits entire loading state when any of the above events are emitted. |

## Methods

| Name     | Description                                                           |
| -------- | --------------------------------------------------------------------- |
| `reload` | Resets the loading state and calls the `getDataFn` that you provided. |
