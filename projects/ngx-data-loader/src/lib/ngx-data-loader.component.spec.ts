/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbeddedViewRef } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { map, of, throwError, timer } from 'rxjs';
import { ErrorComponent } from './error/error.component';
import { LoadedComponent } from './loaded/loaded.component';
import { LoadingComponent } from './loading/loading.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { LoadingState, NgxLoadWithDirective } from './ngx-load-with.directive';

describe('NgxDataLoaderComponent', () => {
  let component: NgxDataLoaderComponent;
  let fixture: ComponentFixture<NgxDataLoaderComponent>;

  const testData = { data: 'data' };
  const getLoadingEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-loading');
  const getDataEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-loaded');
  const getErrorEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-error');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NgxDataLoaderComponent,
        NgxLoadWithDirective,
        LoadedComponent,
        LoadingComponent,
        ErrorComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDataLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.loadFn = () => of(testData);
  });

  describe('component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display loading state', fakeAsync(() => {
      component.loadFn = () => timer(1000).pipe(map(() => testData));
      fixture.detectChanges();
      component.reload();
      fixture.detectChanges();
      tick();
      expect(getLoadingEl()).toBeTruthy();
      expect(getDataEl()).toBeFalsy();
      expect(getErrorEl()).toBeFalsy();
      discardPeriodicTasks();
    }));
  });

  it('should display loaded state after loading', fakeAsync(() => {
    component.loadFn = () => timer(1000).pipe(map(() => testData));
    fixture.detectChanges();
    component.reload();
    fixture.detectChanges();
    tick(1000); // Advance time by 1s to complete the loading
    fixture.detectChanges();
    expect(getLoadingEl()).toBeFalsy();
    expect(getDataEl()).toBeTruthy();
    expect(getErrorEl()).toBeFalsy();
    discardPeriodicTasks();
  }));

  it('should display error state when loading fails', fakeAsync(() => {
    const error = new Error('Test error');
    component.loadFn = () => throwError(() => error);
    fixture.detectChanges();
    component.reload();
    fixture.detectChanges();
    tick();
    expect(getLoadingEl()).toBeFalsy();
    expect(getDataEl()).toBeFalsy();
    expect(getErrorEl()).toBeTruthy();
    discardPeriodicTasks();
  }));

  it('should reload when reload is called', fakeAsync(() => {
    component.loadFn = jasmine.createSpy().and.returnValue(of(testData));
    fixture.detectChanges();
    component.reload();
    fixture.detectChanges();
    tick();
    expect(component.loadFn).toHaveBeenCalledTimes(1);
    component.reload();
    tick();
    expect(component.loadFn).toHaveBeenCalledTimes(2);
    discardPeriodicTasks();
  }));

  it('should use debounce time before loading data', fakeAsync(() => {
    const debounceTime = 500;
    component.debounceTime = debounceTime;
    component.loadFn = () => timer(1000).pipe(map(() => testData));

    // Spy on loadFn function
    const spy = spyOn(component, 'loadFn').and.callThrough();

    // Initial reload
    component.reload();
    fixture.detectChanges();
    tick(400); // tick less than debounceTime
    fixture.detectChanges();
    expect(spy.calls.count()).toEqual(0); // loadFn should not be called yet

    tick(200); // total time more than debounceTime now
    fixture.detectChanges();
    expect(spy.calls.count()).toEqual(1); // loadFn should have been called once after debounceTime

    discardPeriodicTasks();
  }));

  it('should call loader.setData when setData is called', () => {
    spyOn(component.loader, 'setData');
    component.setData(testData);
    expect(component.loader.setData).toHaveBeenCalledWith(testData);
  });

  it('should call loader.setError when setError is called', () => {
    spyOn(component.loader, 'setError');
    const testError = new Error('Test error');
    component.setError(testError);
    expect(component.loader.setError).toHaveBeenCalledWith(testError);
  });

  it('should call loader.cancel when cancel is called', () => {
    spyOn(component.loader, 'cancel');
    component.cancel();
    expect(component.loader.cancel).toHaveBeenCalled();
  });

  it('should update loadedViewRef context when onLoaded is called and loadedViewRef exists', () => {
    // Arrange: Create a fake ViewRef
    const fakeViewRef: EmbeddedViewRef<any> = {
      context: { $implicit: null, ngxLoadWith: null, loading: null },
    } as any;

    // Manually assign loadedViewRef
    component.loader['loadedViewRef'] = fakeViewRef;

    const data = testData;

    const loadingState: LoadingState<any> = {
      data,
      loading: false,
      loaded: true,
    };

    // Act: Call the onLoaded method
    component.loader['onLoaded'](loadingState);

    // Assert: Check if context was updated correctly
    expect(fakeViewRef.context.$implicit).toEqual(data);
    expect(fakeViewRef.context.ngxLoadWith).toEqual(data);
    expect(fakeViewRef.context.loading).toBe(false);
  });

  /* eslint-enable @typescript-eslint/no-explicit-any */
  /* eslint-enable */

  it('should call setError on the loader when setError is called', () => {
    // Arrange: Spy on the setError method
    spyOn(component.loader, 'setError');

    const testError = new Error('Test error');

    // Act: Call the setError method
    component.setError(testError);

    // Assert: Check if setError was called correctly
    expect(component.loader.setError).toHaveBeenCalledWith(testError);
  });

  it('should call setData on the loader when setData is called', () => {
    // Arrange: Spy on the setData method
    spyOn(component.loader, 'setData');

    const testData = { data: 'data' };

    // Act: Call the setData method
    component.setData(testData);

    // Assert: Check if setData was called correctly
    expect(component.loader.setData).toHaveBeenCalledWith(testData);
  });
});
