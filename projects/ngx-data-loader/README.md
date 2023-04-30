# NgxDataLoader

Simplify async data loading in Angular with NgxDataLoaderComponent.

[![Build status](https://img.shields.io/github/actions/workflow/status/rensjaspers/ngx-data-loader/main.yml?branch=main)](https://github.com/rensjaspers/ngx-data-loader/actions/workflows/main.yml)
[![NPM version](https://img.shields.io/npm/v/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![NPM downloads](https://img.shields.io/npm/dm/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![MIT license](https://img.shields.io/github/license/rensjaspers/ngx-data-loader)](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ngx-data-loader)](https://bundlephobia.com/result?p=ngx-data-loader)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/rensjaspers/ngx-data-loader)](https://www.codefactor.io/repository/github/rensjaspers/ngx-data-loader)
[![Codecov](https://img.shields.io/codecov/c/github/rensjaspers/ngx-data-loader)](https://app.codecov.io/gh/rensjaspers/ngx-data-loader)

## Description

`NgxDataLoaderComponent` streamlines asynchronous data loading in Angular by abstracting away tasks such as error handling, cancel/reload strategies,
Observable (un)subscriptions, and template display logic.

To use the component, provide a `loadFn` that returns an `Observable` of the data, along with optional templates for each loading phase.
The component will then automatically handle the loading logic and display the appropriate template.

A noteworthy feature of `NgxDataLoaderComponent` is its ability to process dynamic arguments via `loadFnArgs`. This feature permits
dynamic arguments to be passed into `loadFn`, and whenever the `loadFnArgs` input value changes, `loadFn` is executed with the new arguments.
This simplifies data loading based on route parameters or input field values.

## Features

- Declarative syntax that handles display and loading logic behind the scenes
- Automatic reload on input changes
- Provides `reload` and `cancel` methods
- Automatic cancellation of ongoing http requests on cancel/reload/destroy[^note]
- Configurable retry and timeout

## Demo

[View demo on StackBlitz](https://stackblitz.com/edit/ngx-data-loader-demo?file=src%2Fapp%2Fapp.component.html)

## Installation

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

## Usage

### Basic example:

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodos">
  <ng-template #loading> Loading todos... </ng-template>
  <ng-template #error> Failed to load todos. </ng-template>
  <ng-template #loaded let-todos>
    <div *ngFor="let todo of todos">
      Title: {{ todo.title }} <br />
      Completed: {{ todo.completed ? 'Yes' : 'No' }}
    </div>
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  ...
})
export class AppComponent {
  getTodos = () => this.http.get('https://jsonplaceholder.typicode.com/todos');

  constructor(private http: HttpClient) {}
}
```

### Loading data based on route parameters:

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodo" [loadFnArgs]="route.params | async">
  <ng-template #loading> Loading todo... </ng-template>
  <ng-template #error> Failed to load todo. </ng-template>
  <ng-template #loaded let-todo>
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
  getTodo = ({id: string}) => this.http.get(`https://jsonplaceholder.typicode.com/todos/${id}`);

  constructor(private http: HttpClient, public route: ActivatedRoute) {}
}
```

### Loading data based on search input:

[Open on StackBlitz](https://stackblitz.com/edit/angular-8zg236?file=src/main.ts)

[View advanced demo on StackBlitz](https://stackblitz.com/edit/angular-qfl9sp?file=src%2Fmain.ts)

```html
<!-- app.component.html -->
<h1>Search</h1>
<input ngModel #searchbox placeholder="Search" />
<ngx-data-loader *ngIf="searchbox.value as keywords" [loadFn]="searchProducts" [loadFnArgs]="keywords" [debounceTime]="300">
  <ng-template #loading> Searching... </ng-template>
  <ng-template #error> Error </ng-template>
  <ng-template #loaded let-results>
    <h2>{{results.total}} search results for "{{ keywords }}"</h2>
    <div *ngFor="let product of results.products">
      <h3>{{product.title}}</h3>
      <p>{{product.description}}</p>
    </div>
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  ...
})
export class AppComponent {
  searchProducts = (keywords: string) =>
    this.http.get('https://dummyjson.com/products/search', {
      params: { q: keywords },
    });

  constructor(private http: HttpClient) {}
}
```

## Template slots

| Name                                                                     | Description                                            | Template outlet context                                                                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@ContentChild('loaded')`<br />`loadedTemplate?: TemplateRef<unknown>`   | Template to be displayed when the data has loaded.     | `$implicit: T`: the resolved data.<br />`loading: boolean`: whether the data is reloading (only available if `showStaleData` is set to `true`). |
| `@ContentChild('loading')`<br />`loadingTemplate?: TemplateRef<unknown>` | Template to be displayed when the data is loading.     | _(none)_                                                                                                                                        |
| `@ContentChild('error')`<br />`errorTemplate?: TemplateRef<unknown>`     | Template to be displayed when the data failed to load. | `$implicit: Error<unknown>`: the error object.<br />`retry: () => void`: can be called to trigger a retry.                                      |

## Properties

| Name                                           | Description                                                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `@Input()`<br />`loadFn!: () => Observable<T>` | Function that returns an `Observable` of the data to be loaded. Called on init and on reload.                           |
| `@Input()`<br />`loadFnArgs?: any`             | Arguments to pass to `loadFn`. Changes to this property will trigger a reload.                                          |
| `@Input()`<br />`initialData?: T`              | Data to be rendered on init. When set, `loadFn` will not be invoked on init. The loading state will be set to `loaded`. |
| `@Input()`<br />`debounceTime: number`         | Number of milliseconds to debounce reloads.                                                                             |
| `@Input()`<br />`retries: number`              | Number of times to retry loading the data. Default: `0`                                                                 |
| `@Input()`<br />`retryDelay: number`           | Delay in milliseconds between retries. Default: `1000`                                                                  |
| `@Input()`<br />`showStaleData: boolean`       | Whether to keep displaying previously loaded data while reloading. Default: `false`                                     |
| `@Input()`<br />`loadingTemplateDelay: number` | Delay in milliseconds before showing the loading template. Default: `0`                                                 |
| `@Input()`<br />`timeout?: number`             | Number of milliseconds to wait for `loadFn` to emit before throwing an error.                                           |

## Events

| Name                                                                 | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `@Output()`<br />`dataLoaded: EventEmitter<T>`                       | Emits when the data is loaded.                                       |
| `@Output()`<br />`loadAttemptStarted: EventEmitter<void>`            | Emits when the data loading is started.                              |
| `@Output()`<br />`loadAttemptFailed: EventEmitter<Error>`            | Emits when the data fails to load.                                   |
| `@Output()`<br />`loadAttemptFinished: EventEmitter<void>`           | Emits when the data has either loaded or failed to load.             |
| `@Output()`<br />`loadingStateChange: EventEmitter<LoadingState<T>>` | Emits entire loading state when any of the above events are emitted. |

## Methods

| Name                               | Description                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `reload: () => void`               | Resets the loading state and calls the `loadFn` that you provided.            |
| `cancel: () => void`               | Cancels the pending `loadFn` and aborts any related http requests[^note].     |
| `setData: (data: T) => void`       | Updates the loading state as if the passed data were loaded through `loadFn`. |
| `setError: (error: Error) => void` | Updates the loading state as if the passed error were thrown by `loadFn`.     |

[^note]: Automatic cancellation of http requests requires support from the underlying http library. It works out of the box with Angular's HttpClient, but may require additional configuration if using a different library

## Interfaces

```typescript
interface LoadingState<T> {
  loading: boolean;
  loaded: boolean;
  error?: Error;
  data?: T;
}
```

## FAQ

### How to get type safety for the data loaded by `NgxDataLoaderComponent`?

Angular currently does not support type inference for template variables. This means that the type of the data loaded by `NgxDataLoader` cannot be inferred from the template. A good workaround is to use a presentational component inside the `#loaded` template that takes the loaded data as a typed input.

For example:

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodos">
  ...
  <ng-template #loaded let-todos>
    <app-todo-list [todos]="todos"></app-todo-list>
  </ng-template>
</ngx-data-loader>
```

```typescript
// todo-list.component.ts
@Component({
  ...
})
export class TodoListComponent {
  @Input() todos: Todo[];
}
```

By doing this, you can ensure type safety in your presentational component's template while still taking advantage of the convenience provided by ngx-data-loader.

## License

The MIT License (MIT). Please see [License File](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE) for more information.
