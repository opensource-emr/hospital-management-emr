import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutpatientMainComponent } from './outpatient-main.component';

describe('OutpatientMainComponent', () => {
  let component: OutpatientMainComponent;
  let fixture: ComponentFixture<OutpatientMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutpatientMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutpatientMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
