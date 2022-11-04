import { LoadingStateTemplatePipe } from './loading-state-template.pipe';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { of, throwError, timer } from 'rxjs';
import { DataComponent } from './data/data.component';
import { ErrorComponent } from './error/error.component';
import { NgxDataLoaderComponent } from './ngx-data-loader.component';
import { SkeletonComponent } from './skeleton/skeleton.component';

describe('NgxDataLoaderComponent', () => {
  let component: NgxDataLoaderComponent;
  let fixture: ComponentFixture<NgxDataLoaderComponent>;
  let getDataFnSpy: jasmine.Spy;

  const testData = { data: 'data' };
  const customValue = 'custom value';
  const getSkeletonEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-skeleton');
  const getDataEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-data');
  const getErrorEl = () =>
    fixture.nativeElement.querySelector('ngx-data-loader-error');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        NgxDataLoaderComponent,
        DataComponent,
        SkeletonComponent,
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

    it('should not call getDataFn before ngOnChanges', () => {
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      expect(getDataFnSpy).not.toHaveBeenCalled();
      component.ngOnChanges({});
      expect(getDataFnSpy).toHaveBeenCalled();
    });

    it('should render only a skeleton component when loading first time', () => {
      component.getDataFn = () => new Promise(() => {});
      component.reload();
      expect(getSkeletonEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    });

    it('should render only the data when initial loading is done', fakeAsync(() => {
      component.getDataFn = () => of(testData);
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getSkeletonEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));

    it('should render only an error when loading fails', fakeAsync(() => {
      component.getDataFn = () => throwError(() => new Error('test error'));
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getErrorEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getSkeletonEl()).toBeNull();
    }));

    it('should render only the data template when reloading in stale data display mode', fakeAsync(() => {
      component.getDataFn = () => of(testData);
      component.showStaleData = true;
      component.reload();
      tick();
      component.getDataFn = () => new Promise(() => {});
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeTruthy();
      expect(getSkeletonEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    }));

    it('should render a skeleton when reloading and showing stale data is not allowed', fakeAsync(() => {
      component.getDataFn = () => of(testData);
      component.showStaleData = false;
      component.reload();
      tick();
      component.getDataFn = () => new Promise(() => {});
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeNull();
      expect(getSkeletonEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));

    it('should render an error when loading does not complete before the timeout', fakeAsync(() => {
      component.getDataFn = () => timer(100);
      component.timeout = 10;
      component.reload();
      tick(20);
      fixture.detectChanges();
      expect(getErrorEl()).toBeTruthy();
      flush();
    }));

    it('should not render an error when loading completes before the timeout', fakeAsync(() => {
      component.getDataFn = () => timer(100);
      component.timeout = 200;
      component.reload();
      tick(150);
      fixture.detectChanges();
      expect(getErrorEl()).toBeNull();
      flush();
    }));

    it('should not call getDataFn after ngOnChanges when initialData input is set', () => {
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      component.ngOnChanges({
        initialData: {
          previousValue: undefined,
          currentValue: 'custom data',
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(getDataFnSpy).not.toHaveBeenCalled();
    });

    it('should call getDataFn with new arguments when changed', () => {
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      component.reload();
      expect(getDataFnSpy).toHaveBeenCalledWith(undefined);
      component.getDataFnArgs = 1;
      component.ngOnChanges({});
      expect(getDataFnSpy).toHaveBeenCalledWith(1);
    });

    it('should debounce getDataFn calls when debounceTime is set', fakeAsync(() => {
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      component.debounceTime = 100;
      component.reload();
      component.reload();
      tick(50);
      expect(getDataFnSpy).not.toHaveBeenCalled();
      tick(50);
      expect(getDataFnSpy).toHaveBeenCalledTimes(1);
      flush();
      getDataFnSpy.calls.reset();
      component.debounceTime = 0;
      component.reload();
      component.reload();
      tick();
      expect(getDataFnSpy).toHaveBeenCalledTimes(2);
    }));
  });

  describe('setData', () => {
    beforeEach(() => {
      spyOn(component.dataLoaded, 'emit');
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      component.setData(customValue);
    });

    it('should prevent the original getDataFn from being called', () => {
      expect(getDataFnSpy).not.toHaveBeenCalled();
    });

    it('should load and emit custom data', () => {
      expect(component.dataLoaded.emit).toHaveBeenCalledWith(customValue);
    });

    it('should restore the original getDataFn afterwards', () => {
      component.reload();
      expect(getDataFnSpy).toHaveBeenCalled();
    });
  });

  describe('setError', () => {
    const customError = new Error('custom error');
    beforeEach(() => {
      spyOn(component.error, 'emit');
      getDataFnSpy = jasmine.createSpy();
      component.getDataFn = getDataFnSpy.and.returnValue(of(testData));
      component.setError(customError);
    });

    it('should prevent the original getDataFn from being called', () => {
      expect(getDataFnSpy).not.toHaveBeenCalled();
    });

    it('should load and emit custom error', () => {
      expect(component.error.emit).toHaveBeenCalledWith(customError);
    });

    it('should restore the original getDataFn afterwards', () => {
      component.reload();
      expect(getDataFnSpy).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should prevent getDataFn from completing', fakeAsync(() => {
      component.getDataFn = () => timer(100);
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
