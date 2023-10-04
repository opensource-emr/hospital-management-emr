import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RankWiseDischargeListComponent } from './rank-wise-discharge-list.component';

describe('RankwisedischargelistComponent', () => {
  let component: RankWiseDischargeListComponent;
  let fixture: ComponentFixture<RankWiseDischargeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RankWiseDischargeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RankWiseDischargeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
