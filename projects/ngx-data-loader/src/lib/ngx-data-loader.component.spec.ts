import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from "@angular/core/testing";
import { map, of, throwError, timer } from "rxjs";
import { ErrorComponent } from "./error/error.component";
import { LoadedComponent } from "./loaded/loaded.component";
import { LoadingStateTemplatePipe } from "./loading-state-template.pipe";
import { LoadingComponent } from "./loading/loading.component";
import { NgxDataLoaderComponent } from "./ngx-data-loader.component";

describe("NgxDataLoaderComponent", () => {
  let component: NgxDataLoaderComponent;
  let fixture: ComponentFixture<NgxDataLoaderComponent>;
  let loadFnSpy: jasmine.Spy;

  const testData = { data: "data" };
  const customValue = "custom value";
  const getLoadingEl = () =>
    fixture.nativeElement.querySelector("ngx-data-loader-loading");
  const getDataEl = () =>
    fixture.nativeElement.querySelector("ngx-data-loader-loaded");
  const getErrorEl = () =>
    fixture.nativeElement.querySelector("ngx-data-loader-error");

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

  describe("component", () => {
    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should not call loadFn before ngOnChanges", () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      expect(loadFnSpy).not.toHaveBeenCalled();
      component.ngOnChanges({});
      expect(loadFnSpy).toHaveBeenCalled();
    });

    it("should render only a loading component when loading first time", () => {
      component.loadFn = () => of({});
      component.reload();
      expect(getLoadingEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    });

    it("should render only the data when initial loading is done", fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));

    it("should render only an error when loading fails", fakeAsync(() => {
      component.loadFn = () => throwError(() => new Error("test error"));
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getErrorEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      expect(getLoadingEl()).toBeNull();
    }));

    it("should render only the data template when reloading in stale data display mode", fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.showStaleData = true;
      component.reload();
      tick();
      component.loadFn = () => of({});
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeTruthy();
      expect(getLoadingEl()).toBeNull();
      expect(getErrorEl()).toBeNull();
    }));

    it("should render a loading template when reloading and showing stale data is not allowed", fakeAsync(() => {
      component.loadFn = () => of(testData);
      component.showStaleData = false;
      component.reload();
      tick();
      component.loadFn = () => timer(10);
      component.reload();
      tick();
      fixture.detectChanges();
      expect(getDataEl()).toBeNull();
      expect(getLoadingEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
      discardPeriodicTasks();
    }));

    it("should not call loadFn after ngOnChanges when initialData input is set", () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.ngOnChanges({
        initialData: {
          previousValue: undefined,
          currentValue: "custom data",
          firstChange: true,
          isFirstChange: () => true,
        },
      });
      expect(loadFnSpy).not.toHaveBeenCalled();
    });

    it("should call loadFn with new arguments when changed", () => {
      loadFnSpy = jasmine.createSpy();
      component.loadFn = loadFnSpy.and.returnValue(of(testData));
      component.reload();
      expect(loadFnSpy).toHaveBeenCalledWith(undefined);
      component.loadFnArgs = 1;
      component.ngOnChanges({});
      expect(loadFnSpy).toHaveBeenCalledWith(1);
    });

    describe("debounceTime", () => {
      it("should debounce loadFn calls when set", fakeAsync(() => {
        loadFnSpy = jasmine.createSpy();
        component.loadFn = loadFnSpy.and.returnValue(of(testData));
        component.debounceTime = 100;
        component.reload();
        component.reload();
        tick(50);
        expect(loadFnSpy).not.toHaveBeenCalled();
        tick(50);
        expect(loadFnSpy).toHaveBeenCalledTimes(1);
        loadFnSpy.calls.reset();
        component.debounceTime = 0;
        component.reload();
        component.reload();
        tick();
        expect(loadFnSpy).toHaveBeenCalledTimes(2);
      }));

      it("should not debounce displaying the loader", fakeAsync(() => {
        component.loadFn = () => of(testData);
        component.debounceTime = 100;
        component.reload();
        tick(50);
        fixture.detectChanges();
        expect(getLoadingEl()).toBeTruthy();
        tick(50);
        fixture.detectChanges();
        expect(getLoadingEl()).toBeNull();
        component.reload();
        tick(50);
        fixture.detectChanges();
        expect(getLoadingEl()).toBeTruthy();
        tick(50);
        fixture.detectChanges();
        expect(getLoadingEl()).toBeNull();
      }));
    });
  });

  describe("setData", () => {
    it("should render the custom data", fakeAsync(() => {
      component.setData(customValue);
      tick();
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
    }));

    it("should render the custom data when debounceTime is set", fakeAsync(() => {
      component.loadFn = () => timer(1000).pipe(map(() => testData));
      component.debounceTime = 100;
      fixture.detectChanges();
      expect(getLoadingEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      component.setData(customValue);
      tick(50);
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
    }));

    it("should pause loading on override and resume on reload", fakeAsync(() => {
      component.loadFn = () => timer(1000).pipe(map(() => testData));
      component.debounceTime = 100;
      fixture.detectChanges();
      expect(getLoadingEl()).toBeTruthy();
      expect(getDataEl()).toBeNull();
      component.setData(customValue);
      tick(50);
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      tick(20000);
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
      component.reload();
      tick(1100);
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeTruthy();
    }));
  });

  describe("setError", () => {
    it("render the custom error", fakeAsync(() => {
      const customError = new Error("custom error");
      component.setError(customError);
      tick();
      fixture.detectChanges();
      expect(getLoadingEl()).toBeNull();
      expect(getDataEl()).toBeNull();
      expect(getErrorEl()).toBeTruthy();
    }));
  });

  describe("cancel", () => {
    it("should prevent loadFn from completing", fakeAsync(() => {
      component.loadFn = () => timer(100);
      component.reload();
      component.cancel();
      tick(200);
      fixture.detectChanges();
      expect(getDataEl()).toBeNull();
      expect(getLoadingEl()).toBeTruthy();
      expect(getErrorEl()).toBeNull();
      discardPeriodicTasks();
    }));
  });
});
