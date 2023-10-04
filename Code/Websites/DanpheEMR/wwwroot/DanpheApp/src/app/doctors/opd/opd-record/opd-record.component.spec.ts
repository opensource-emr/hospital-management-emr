import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdRecordComponent } from './opd-record.component';

describe('OpdRecordComponent', () => {
  let component: OpdRecordComponent;
  let fixture: ComponentFixture<OpdRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpdRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpdRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
