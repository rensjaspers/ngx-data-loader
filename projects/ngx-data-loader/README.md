# NgxDataLoader

Async data container component for Angular 14+.

<hr>

[![NPM version](https://img.shields.io/npm/v/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![NPM downloads](https://img.shields.io/npm/dm/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![MIT license](https://img.shields.io/github/license/rensjaspers/ngx-data-loader)](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ngx-data-loader)](https://bundlephobia.com/result?p=ngx-data-loader)

Most async data loading in Angular is done the same way: show a loading indicator while the data is loading, then show the data when it's loaded, or show an error message or a retry button if the data failed to load.

The NgxDataLoader component makes this easy. You only need to provide a `getDataFn` that returns an `Observable` or `Promise` with the data, and the `data`, `skeleton` and `error` templates. The component will handle the rest.

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
<ngx-data-loader [getDataFn]="getTodo">
  <!-- template for showing loaded data -->
  <ng-template #dataTemplate let-todo>
    Title: {{ todo.title }} <br />
    Completed: {{ todo.completed ? 'Yes' : 'No' }}
  </ng-template>

  <!-- template while loading -->
  <ng-template #skeletonTemplate> Loading... </ng-template>

  <!-- template when error occurs -->
  <ng-template #errorTemplate let-error let-retry="reloadFn">
    Oops, something went wrong! Details: {{ error.message }}
    <button (click)="retry()">Retry</button>
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

## Templates

| Name                                                                          | Description                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| `@ContentChild('dataTemplate')`<br />`dataTemplate?: TemplateRef<any>`        | Template to be displayed when the data is loaded.      |
| `@ContentChild('skeletonTemplate)`<br />`skeletonTemplate?: TemplateRef<any>` | Template to be displayed when the data is loading.     |
| `@ContentChild('errorTemplate')`<br />`errorTemplate?: TemplateRef<any>`      | Template to be displayed when the data failed to load. |

## Properties

| Name                                                           | Description                                                                      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `@Input()`<br />`getDataFn: () => Observable<T> \| Promise<T>` | Function that returns the data to be loaded.                                     |
| `@Input()`<br />`retries: number`                              | Number of times to retry loading the data. Default: `0`                          |
| `@Input()`<br />`retryDelay: number`                           | Delay in milliseconds between retries. Default: `1000`                           |
| `@Input()`<br />`showStaleData: boolean`                       | Whether to show stale data while reloading. Default: `false`                     |
| `@Input()`<br />`skeletonDelay: number`                        | Delay in milliseconds before showing the skeleton. Default: `0`                  |
| `@Input()`<br />`timeout: number`                              | Number of milliseconds to wait for `getDataFn` to emit before throwing an error. |

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
