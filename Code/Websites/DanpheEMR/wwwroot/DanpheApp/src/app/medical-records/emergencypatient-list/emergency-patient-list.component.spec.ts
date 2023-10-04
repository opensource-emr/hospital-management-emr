import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyPatientListComponent } from './emergency-patient-list.component';

describe('EmergencyPatientListComponent', () => {
  let component: EmergencyPatientListComponent;
  let fixture: ComponentFixture<EmergencyPatientListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyPatientListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyPatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
