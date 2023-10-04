import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalMortalityComponent } from './hospital-mortality.component';

describe('HospitalMortalityComponent', () => {
  let component: HospitalMortalityComponent;
  let fixture: ComponentFixture<HospitalMortalityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HospitalMortalityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HospitalMortalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
