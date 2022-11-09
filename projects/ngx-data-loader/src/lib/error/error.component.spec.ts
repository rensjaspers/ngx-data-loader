import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('retry', () => {
    it('should emit an error when called', () => {
      spyOn(component.reload, 'emit');
      expect(component.reload.emit).not.toHaveBeenCalled();
      component.retry();
      expect(component.reload.emit).toHaveBeenCalled();
    });
  });
});
