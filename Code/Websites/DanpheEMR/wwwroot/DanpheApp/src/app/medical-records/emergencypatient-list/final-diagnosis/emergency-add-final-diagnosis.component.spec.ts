import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyAddFinalDiagnosisComponent } from './emergency-add-final-diagnosis.component';

describe('EmergencyAddFinalDiagnosisComponent', () => {
  let component: EmergencyAddFinalDiagnosisComponent;
  let fixture: ComponentFixture<EmergencyAddFinalDiagnosisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyAddFinalDiagnosisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyAddFinalDiagnosisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
