import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankReconciliationComponent } from '../bank-reconciliation/bank-reconciliation.component';

describe('BanckReconcillationComponent', () => {
  let component: BankReconciliationComponent;
  let fixture: ComponentFixture<BankReconciliationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankReconciliationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});