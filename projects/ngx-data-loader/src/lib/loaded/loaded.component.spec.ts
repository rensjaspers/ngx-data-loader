import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadedComponent } from './loaded.component';

describe('LoadedComponent', () => {
  let component: LoadedComponent;
  let fixture: ComponentFixture<LoadedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
