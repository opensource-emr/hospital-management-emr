import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyPatientMorbidityReportComponent } from './emergency-patient-morbidity-report.component';

describe('EmergencyPatientMorbidityReportComponent', () => {
  let component: EmergencyPatientMorbidityReportComponent;
  let fixture: ComponentFixture<EmergencyPatientMorbidityReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyPatientMorbidityReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyPatientMorbidityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
