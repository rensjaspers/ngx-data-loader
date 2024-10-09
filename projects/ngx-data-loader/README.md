# NgxDataLoader

Lightweight Angular component to simplify asynchronous data loading.

[![Build status](https://img.shields.io/github/actions/workflow/status/rensjaspers/ngx-data-loader/main.yml?branch=main)](https://github.com/rensjaspers/ngx-data-loader/actions/workflows/main.yml)
[![NPM version](https://img.shields.io/npm/v/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![NPM downloads](https://img.shields.io/npm/dm/ngx-data-loader.svg)](https://www.npmjs.com/package/ngx-data-loader)
[![MIT license](https://img.shields.io/github/license/rensjaspers/ngx-data-loader)](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE)
[![Minzipped size](https://img.shields.io/bundlephobia/minzip/ngx-data-loader)](https://bundlephobia.com/result?p=ngx-data-loader)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/rensjaspers/ngx-data-loader)](https://www.codefactor.io/repository/github/rensjaspers/ngx-data-loader)
[![Codecov](https://img.shields.io/codecov/c/github/rensjaspers/ngx-data-loader)](https://app.codecov.io/gh/rensjaspers/ngx-data-loader)

## Demo

⚡️ [View demo on StackBlitz](https://stackblitz.com/edit/ngx-data-loader-demo?file=src%2Fapp%2Fapp.component.html)

## Installation

Install the package:

```bash
npm install ngx-data-loader
```

Import the module:

```typescript
import { NgxDataLoaderModule } from "ngx-data-loader";

@NgModule({
  imports: [
    NgxDataLoaderModule,
    // ...
  ],
  // ...
})
export class AppModule {}
```

## Usage

### Basic Example

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodos">
  <ng-template #loading>Loading todos...</ng-template>
  <ng-template #error let-error
    >Failed to load todos. {{ error.message }}</ng-template
  >
  <ng-template #loaded let-todos>
    @for (todo of todos; track todo.id) {
      <div>
        Title: {{ todo.title }}<br />
        Completed: {{ todo.completed ? "Yes" : "No" }}
      </div>
    }
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  // ...
})
export class AppComponent {
  getTodos = () => this.http.get("https://jsonplaceholder.typicode.com/todos");

  constructor(private http: HttpClient) {}
}
```

### Reloading Data

```html
<!-- app.component.html -->
<button (click)="todosLoader.reload()">Reload Todos</button>

<ngx-data-loader [loadFn]="getTodos" #todosLoader>
  <!-- Loading and Error templates -->
  <!-- ... -->
  <ng-template #loaded let-todos>
    <!-- Content here -->
    <!-- ... -->
  </ng-template>
</ngx-data-loader>
```

### Loading Data Based on Route Parameters

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodo" [loadFnArgs]="route.params | async">
  <ng-template #loading>Loading todo...</ng-template>
  <ng-template #error>Failed to load todo.</ng-template>
  <ng-template #loaded let-todo>
    Title: {{ todo.title }}<br />
    Completed: {{ todo.completed ? 'Yes' : 'No' }}
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  // ...
})
export class AppComponent {
  getTodo = ({ id }: { id: string }) =>
    this.http.get(`https://jsonplaceholder.typicode.com/todos/${id}`);

  constructor(
    private http: HttpClient,
    public route: ActivatedRoute,
  ) {}
}
```

### Loading Data Based on Search Input

⚡️ [Open on StackBlitz](https://stackblitz.com/edit/angular-8zg236?file=src/main.ts)

⚡️ [View advanced demo on StackBlitz](https://stackblitz.com/edit/angular-qfl9sp?file=src%2Fmain.ts)

```html
<!-- app.component.html -->
<h1>Search</h1>
<input ngModel #searchbox placeholder="Search" />
<ngx-data-loader
  [loadFn]="searchProducts"
  [loadFnArgs]="searchbox.value"
  [debounceTime]="300"
>
  <ng-template #loading>Searching...</ng-template>
  <ng-template #error>Error</ng-template>
  <ng-template #loaded let-results>
    <h2>{{ results.total }} search results for "{{ searchbox.value }}"</h2>
    @for (product of results.products; track product.id) {
      <div>
        <h3>{{ product.title }}</h3>
        <p>{{ product.description }}</p>
      </div>
    }
  </ng-template>
</ngx-data-loader>
```

```typescript
/* app.component.ts */
@Component({
  // ...
})
export class AppComponent {
  searchProducts = (keywords: string) =>
    this.http.get("https://dummyjson.com/products/search", {
      params: { q: keywords },
    });

  constructor(private http: HttpClient) {}
}
```

## Template Slots

| Name              | Description                                        | Template Context                                                                                                         |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `loadedTemplate`  | Template shown when data has loaded (`#loaded`)    | `$implicit: T` - the loaded data<br>`loading: boolean` - `true` if data is reloading (only if `showStaleData` is `true`) |
| `loadingTemplate` | Template shown when data is loading (`#loading`)   | _(none)_                                                                                                                 |
| `errorTemplate`   | Template shown when data failed to load (`#error`) | `$implicit: Error` - the error object<br>`retry: () => void` - function to retry loading data                            |

## Properties

| Name                           | Description                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `loadFn: () => Observable<T>`  | Function that returns an Observable of the data to load. Called on init and on reload. |
| `loadFnArgs?: any`             | Arguments to pass to `loadFn`. Changes trigger a reload.                               |
| `initialData?: T`              | Data to display on init. If set, `loadFn` is not called on init.                       |
| `debounceTime: number`         | Milliseconds to debounce reloads.                                                      |
| `showStaleData: boolean`       | Keep displaying previous data while reloading. Default is `false`.                     |
| `loadingTemplateDelay: number` | Delay before showing the loading template (in milliseconds). Default is `0`.           |

## Methods

| Name                     | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `reload()`               | Resets the loading state and calls `loadFn`.                   |
| `cancel()`               | Cancels the pending `loadFn` and aborts related HTTP requests. |
| `setData(data: T)`       | Updates the state as if data was loaded through `loadFn`.      |
| `setError(error: Error)` | Updates the state as if an error occurred in `loadFn`.         |

## Events

| Name                  | Description                                       |
| --------------------- | ------------------------------------------------- |
| `dataLoaded`          | Emits when data loads successfully.               |
| `loadAttemptStarted`  | Emits when data loading starts.                   |
| `loadAttemptFailed`   | Emits when data fails to load.                    |
| `loadAttemptFinished` | Emits when loading finishes (success or failure). |
| `loadingStateChange`  | Emits the entire loading state when it changes.   |

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

Angular doesn't currently support type inference for template variables. To get type safety, you can use a presentational component inside the `#loaded` template that takes the data as a typed input.

Example:

```html
<!-- app.component.html -->
<ngx-data-loader [loadFn]="getTodos">
  <!-- ... -->
  <ng-template #loaded let-todos>
    <app-todo-list [todos]="todos"></app-todo-list>
  </ng-template>
</ngx-data-loader>
```

```typescript
// todo-list.component.ts
@Component({
  // ...
})
export class TodoListComponent {
  @Input() todos: Todo[];
}
```

This ensures type safety within your component's template.

If you need template type inference, consider using **[`ngx-load-with`](https://github.com/rensjaspers/ngx-load-with)**. Its API is similar and supports type inference.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/rensjaspers/ngx-data-loader/blob/main/CONTRIBUTING.md).

## License

The MIT License (MIT). See [License File](https://github.com/rensjaspers/ngx-data-loader/blob/main/LICENSE) for details.

## Contact

For issues or questions, please use the [GitHub issues page](https://github.com/rensjaspers/ngx-data-loader/issues).
