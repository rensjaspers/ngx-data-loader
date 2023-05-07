import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { LoadedComponent } from './loaded/loaded.component';
import { ErrorComponent } from './error/error.component';
import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import { LoadingComponent } from './loading/loading.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';

describe('NgxDataLoaderComponent', () => {
  let component: NgxDataLoaderComponent;
  let fixture: ComponentFixture<NgxDataLoaderComponent>;
  let loadFnSpy: jasmine.Spy;

  const testData = { data: 'data' };
  const customValue = 'custom value';
  const getSkeletonEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-loading');
  const getDataEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-loaded');
  const getErrorEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-error');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NgxDataLoaderComponent,
        LoadedComponent,
        LoadingComponent,
        ErrorComponent,
        LoadingStateTemplatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDataLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('component', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should not call loadFn before ngOnChanges', () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      expect(loadFnSpy).not.toHaveBeenCalled();
      component.ngOnChanges({});
      expect(loadFnSpy).toHaveBeenCalled();
    });

    it('should render only a loading component when loading first time', () => {
      component.loadFn = () => of({});
      component.reload();
      expect(getSkeletonEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    });

    it('should render only the data when initial loading is done', fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getSkeletonEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));

    it('should render only an error when loading fails', fakeAsync(() => {
      component.loadFn = () => throwError(() => new Error('test error'));
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getErrorEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getSkeletonEl()).toBeNull();
    }));

    it('should render only the data template when reloading in stale data display mode', fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.showStaleData = true;
      component.reload();
      tick();
      component.loadFn = () => of({});
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeTruthy();
      expect(getSkeletonEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    }));

    it('should render a loading template when reloading and showing stale data is not allowed', fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.showStaleData = false;
      component.reload();
      tick();
      component.loadFn = () => timer(10);
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeNull();
      expect(getSkeletonEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
      flush();
      discardPeriodicTasks();
    }));

    it('should render an error when loading does not complete before the timeout', fakeAsync(() => {
      component.loadFn = () => timer(100);
      component.timeout = 10;
      component.reload();
      tick(20);
      fixture.detectChanges();
      expect(getErrorEl()).toBeTruthy();
      flush();
    }));

    it('should not render an error when loading completes before the timeout', fakeAsync(() => {
      component.loadFn = () => timer(100);
      component.timeout = 200;
      component.reload();
      tick(150);
      fixture.detectChanges();
      expect(getErrorEl()).toBeNull();
      flush();
    }));

    it('should not call loadFn after ngOnChanges when initialData input is set', () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.ngOnChanges({
        initialData: {
          previousValue: undefined,
          currentValue: 'custom data',
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(loadFnSpy).not.toHaveBeenCalled();
    });

    it('should call loadFn with new arguments when changed', () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.reload();
      expect(loadFnSpy).toHaveBeenCalledWith(undefined);
      component.loadFnArgs = 1;
      component.ngOnChanges({});
      expect(loadFnSpy).toHaveBeenCalledWith(1);
    });

    describe('debounceTime', () => {
      it('should debounce loadFn calls when set', fakeAsync(() => {
        loadFnSpy = jasmine.createSpy();
        component.loadFn = loadFnSpy.and.returnValue(of(testData));
        component.debounceTime = 100;
        component.reload();
        component.reload();
        tick(50);
        expect(loadFnSpy).not.toHaveBeenCalled();
        tick(50);
        expect(loadFnSpy).toHaveBeenCalledTimes(1);
        flush();
        loadFnSpy.calls.reset();
        component.debounceTime = 0;
        component.reload();
        component.reload();
        tick();
        expect(loadFnSpy).toHaveBeenCalledTimes(2);
      }));

      it('should not debounce displaying the loader', fakeAsync(() => {
        component.loadFn = () => of(testData);
        component.debounceTime = 100;
        component.reload();
        tick(50);
        fixture.detectChanges();
        expect(getSkeletonEl()).toBeTruthy();
        tick(50);
        fixture.detectChanges();
        expect(getSkeletonEl()).toBeNull();
        component.reload();
        tick(50);
        fixture.detectChanges();
        expect(getSkeletonEl()).toBeTruthy();
        tick(50);
        fixture.detectChanges();
        expect(getSkeletonEl()).toBeNull();
        flush();
      }));
    });
  });

  describe('setData', () => {
    beforeEach(() => {
      spyOn(component.dataLoaded, 'emit');
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.setData(customValue);
    });

    it('should prevent the original loadFn from being called', () => {
      expect(loadFnSpy).not.toHaveBeenCalled();
    });

    it('should load and emit custom data', () => {
      expect(component.dataLoaded.emit).toHaveBeenCalledWith(customValue);
    });

    it('should restore the original loadFn afterwards', () => {
      component.reload();
      expect(loadFnSpy).toHaveBeenCalled();
    });
  });

  describe('setError', () => {
    const customError = new Error('custom error');
    beforeEach(() => {
      spyOn(component.loadAttemptFailed, 'emit');
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.setError(customError);
    });

    it('should prevent the original loadFn from being called', () => {
      expect(loadFnSpy).not.toHaveBeenCalled();
    });

    it('should load and emit custom error', () => {
      expect(component.loadAttemptFailed.emit).toHaveBeenCalledWith(
        customError
      );
    });

    it('should restore the original loadFn afterwards', () => {
      component.reload();
      expect(loadFnSpy).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should prevent loadFn from completing', fakeAsync(() => {
      component.loadFn = () => timer(100);
      component.reload();
      component.cancel();
      tick(200);
      fixture.detectChanges();
      expect(getDataEl()).toBeNull();
      expect(getSkeletonEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));
  });
});
