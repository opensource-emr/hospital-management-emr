import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillDetailComponent } from './bill-detail.component';

describe('BillDetailComponent', () => {
  let component: BillDetailComponent;
  let fixture: ComponentFixture<BillDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
