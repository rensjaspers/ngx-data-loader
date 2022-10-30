# NgxDataLoader

Lightweight Angular component that loads async data, handles errors and switches templates based on loading state.

[![Build status](https://img.shields.io/github/workflow/status/rensjaspers/ngx-data-loader/Tests)](https://github.com/rensjaspers/ngx-data-loader/actions/workflows/main.yml)
[![NPM version](https://img.shields.io/npm/v/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![NPM downloads](https://img.shields.io/npm/dm/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![MIT license](https://img.shields.io/github/license/rensjaspers/ngx-data-loader)](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ngx-data-loader)](https://bundlephobia.com/result?p=ngx-data-loader)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/rensjaspers/ngx-data-loader)](https://www.codefactor.io/repository/github/rensjaspers/ngx-data-loader)

## Description

The `NgxDataLoaderComponent` lets you easily load any kind of async data, without having to worry about error handling, reloading and UI logic.

You only need to provide a `getDataFn` that returns an `Observable` of the data, and an `ng-template` for each of the loading states.

## Features

- Bring your own template for each loading state
- Provides `cancel` and `reload` methods
- Automatic cancellation of ongoing http requests on reload/destroy[^note]
- Configure auto retry and timeouts
- Supports server-side rendering through `initialData` input
- Supports optimistic updates through `setData` method

## Demo

[View demo on StackBlitz](https://stackblitz.com/edit/ngx-data-loader-demo?file=src%2Fapp%2Fapp.component.html)

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
  <!-- showing once data has finished loading-->
  <ng-template #dataTemplate let-todo>
    Title: {{ todo.title }} <br />
    Completed: {{ todo.completed ? 'Yes' : 'No' }}
  </ng-template>

  <!-- showing during initial loading phase -->
  <ng-template #skeletonTemplate> Loading... </ng-template>

  <!-- showing when error occurs -->
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

## Template slots

| Name                                                                              | Description                                            | Local variables                                                                                                                                 |
| --------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ContentChild('dataTemplate')`<br />`dataTemplate?: TemplateRef<unknown>`        | Template to be displayed when the data is loaded.      | `$implicit: T`: the resolved data.<br />`loading: boolean`: whether the data is reloading (only available if `showStaleData` is set to `true`). |
| `@ContentChild('skeletonTemplate)`<br />`skeletonTemplate?: TemplateRef<unknown>` | Template to be displayed when the data is loading.     | _(none)_                                                                                                                                        |
| `@ContentChild('errorTemplate')`<br />`errorTemplate?: TemplateRef<unknown>`      | Template to be displayed when the data failed to load. | `$implicit: Error<unknown>`: the error object.<br />`reloadFn: () => void`: can be called to trigger a retry.                                   |

## Properties

| Name                                             | Description                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@Input()`<br />`getDataFn: () => Observable<T>` | Function that returns an `Observable` of the data to be loaded. Called on init and on reload.                                        |
| `@Input()`<br />`initialData: T`                 | Optional. Data to be rendered on init. When set, `getDataFn` will not be invoked on init. The loading state will be set to `loaded`. |
| `@Input()`<br />`retries: number`                | Optional. Number of times to retry loading the data. Default: `0`                                                                    |
| `@Input()`<br />`retryDelay: number`             | Optional. Delay in milliseconds between retries. Default: `1000`                                                                     |
| `@Input()`<br />`showStaleData: boolean`         | Optional. Whether to show stale data while reloading. Default: `false`                                                               |
| `@Input()`<br />`skeletonDelay: number`          | Optional. Delay in milliseconds before showing the skeleton. Default: `0`                                                            |
| `@Input()`<br />`timeout: number`                | Optional. Number of milliseconds to wait for `getDataFn` to emit before throwing an error.                                           |

## Events

| Name                                                                 | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `@Output()`<br />`dataLoaded: EventEmitter<T>`                       | Emitted when the data is loaded.                                     |
| `@Output()`<br />`loadAttemptStarted: EventEmitter<void>`            | Emitted when the data loading is started.                            |
| `@Output()`<br />`error: EventEmitter<Error>`                        | Emitted when the data failed to load.                                |
| `@Output()`<br />`loadAttemptFinished: EventEmitter<void>`           | Emitted when the data has either loaded or failed to load.           |
| `@Output()`<br />`loadingStateChange: EventEmitter<LoadingState<T>>` | Emits entire loading state when any of the above events are emitted. |

## Methods

| Name                               | Description                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `reload: () => void`               | Resets the loading state and calls the `getDataFn` that you provided.            |
| `cancel: () => void`               | Cancels the pending `getDataFn` and aborts any related http requests[^note].     |
| `setData: (data: T) => void`       | Updates the loading state as if the passed data were loaded through `getDataFn`. |
| `setError: (error: Error) => void` | Updates the loading state as if the passed error were thrown by `getDataFn`.     |

[^note]: You must use Angular's `HttpClient` for http request cancellation to work.

## Interfaces

```typescript
interface LoadingState<T> {
  loading: boolean;
  loaded: boolean;
  error?: Error;
  data?: T;
}
```

## License

The MIT License (MIT). Please see [License File](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE) for more information.
