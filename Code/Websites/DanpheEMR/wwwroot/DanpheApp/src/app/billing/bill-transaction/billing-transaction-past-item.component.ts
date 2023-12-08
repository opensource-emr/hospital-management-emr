import { Component, OnChanges, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { CoreService } from "../../core/shared/core.service";

@Component({
  selector: "past-test-list",
  templateUrl: "./billing-transaction-past-test.html" //"/BillingView/BillingTransaction"
})

export class BillPastTestListComponent {
  @Input() patientId: number;
  @Output("past-tests")
  pastTests: EventEmitter<object> = new EventEmitter<object>();

  public IsLocalDate = true;

  public allTests: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();

  constructor(public patientService: PatientService, public msgBoxServ: MessageboxService,
    public BillingBLService: BillingBLService, public coreService: CoreService) {

  }

  ngOnInit() {
    if (this.patientId) {
      this.GetAllPastTestList();
    }
  }

  GetAllPastTestList() {
    this.BillingBLService.GetPastTestList(this.patientId).subscribe(res => {
      if (res.Status == "OK") {
        this.allTests = res.Results;
        this.pastTests.emit(this.allTests);//pratik :16April'20 neeed in transaction component
      }
    });
  }

  ChangeDateFormate() {
    this.IsLocalDate = !this.IsLocalDate;
  }
}
