
import { Component } from "@angular/core";
import { Router } from '@angular/router';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { BillingService } from '../shared/billing.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { PatientService } from '../../patients/shared/patient.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";
import { BillItemRequisition } from "../shared/bill-item-requisition.model";
import { SecurityService } from '../../security/shared/security.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { CallbackService } from '../../shared/callback.service';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  templateUrl: "./bill-cancellation-request.html", //"/BillingView/BillCancellationRequest"
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class BillCancellationRequestComponent {
    public ProvisionalItemsGridColumns: Array<any> = [];
    public currCounterId: number = 0;  
    public provisionalItemList: Array<any> = [];
    public fromDate: string = '';
    public toDate: string = '';
    public cancelRemarks: string = null;
    public selectedBillForCancel: any;
    public selIndexForCancel: number;
    public showConfirmationBox: boolean = false;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    public dateRange:any ;

    constructor(public BillingBLService: BillingBLService,
        public visitService: VisitService,
        public billingService: BillingService,
        public securityService: SecurityService,
        public routeFromService: RouteFromService,
        public patientService: PatientService,
        public callbackservice: CallbackService,
        public router: Router,
        public msgBoxServ: MessageboxService) {

        this.currCounterId = this.securityService.getLoggedInCounter().CounterId;
        //go back to counter activation page if none of the counter is activated.
        if (this.currCounterId < 1) {
            this.callbackservice.CallbackRoute = '/Billing/BillCancellationRequest';
            this.router.navigate(['/Billing/CounterActivate']);
        }
        else {
          this.ProvisionalItemsGridColumns = GridColumnSettings.ProvisionalCancelSearch;
        }

        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', true));
    }

    //-----------------------------------to cancel the credit bills----------------------------------------
    //LoadCreditBills(): void {
    //    this.BillingBLService.GetUnpaidTotalBills()
    //        .subscribe(res => {
    //            if (res.Status == "OK") {
    //                this.creditlist = res.Results
    //            }
    //            else {
    //                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //                console.log(res.ErrorMessage);
    //            }

    //        });
    //}

    LoadProvisionalBills(fromDate,toDate): void {
      this.BillingBLService.LoadAllProvisionalBills(fromDate, toDate)
        .subscribe(res => {
            if (res.Status == "OK") {
              this.provisionalItemList = res.Results
            }
            else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                console.log(res.ErrorMessage);
            }

        });
    }


  onGridDateChange($event) {
    console.log("called");
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.LoadProvisionalBills(this.fromDate, this.toDate);
  }

//Cancel Grid Actions - Anjana 08-19-2020 
CancelGridActions($event: GridEmitModel){
  switch ($event.Action){
    case "showCreditDetails":{
      this.cancelRemarks = "";
      this.selectedBillForCancel = $event.Data;
      this.selIndexForCancel = this.provisionalItemList.findIndex(
        (p) => 
          p.BillingTransactionItemId == this.selectedBillForCancel.BillingTransactionItemId
        );
        if(this.selectedBillForCancel && this.selIndexForCancel > -1){
          this.showConfirmationBox = true;
        }
      
    }    
    
  }
}

cancelRequest(billTransactionItem, index: number){
  billTransactionItem.CancelRemarks = this.cancelRemarks.trim();
  if(billTransactionItem.CancelRemarks && billTransactionItem.CancelRemarks.length){
    var cancelItemOfCurrentPatient = window.confirm("Are you sure you want to cancel this item for this Patient?");

    if(cancelItemOfCurrentPatient){
      billTransactionItem.CounterId = this.currCounterId;
      billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
      if(billTransactionItem.ItemIntegrationName && billTransactionItem.ItemIntegrationName.toLowerCase() == "radiology"){
        this.BillingBLService.CancelItemRequest(billTransactionItem).subscribe((res) => {
          if(res.Status == "OK"){
            this.provisionalItemList.splice(index, 1);
            this.provisionalItemList.slice();
            this.msgBoxServ.showMessage("success", ["The selected item has been canceled."]);
            this.showConfirmationBox = false;
            this.LoadProvisionalBills(this.fromDate, this.toDate);

          }else {
            this.msgBoxServ.showMessage("failed", ["Please try again later"]);
          }
          
        });
      }else if(billTransactionItem.ItemIntegrationName && billTransactionItem.ItemIntegrationName.toLowerCase() == "lab"){
        this.BillingBLService.CancelItemRequest(billTransactionItem).subscribe((res) => {
          if(res.Status == "OK"){
            this.provisionalItemList.splice(index, 1);
            this.provisionalItemList.slice();
            this.msgBoxServ.showMessage("success", ["The selected item has been canceled."]);
            this.showConfirmationBox = false;
            this.LoadProvisionalBills(this.fromDate, this.toDate);
          }else{
            this.msgBoxServ.showMessage("failed", ["Please try again later"]);
          }         
          
        });
      }else {
        this.BillingBLService.CancelBillRequest(billTransactionItem).subscribe((res) => {
          if(res.Status == "OK"){
            this.provisionalItemList.splice(index, 1);
            this.provisionalItemList.slice();
            this.msgBoxServ.showMessage("success", ["The selected item has been canceled."]);
            this.showConfirmationBox = false;
            this.LoadProvisionalBills(this.fromDate, this.toDate);
          }else{
            this.msgBoxServ.showMessage("failed", ["Please try again later"]);
          } 
        });
      }
    }
  }else {
    this.msgBoxServ.showMessage("failed", ["Please Write Cancellation Remarks"]);
  }
}

public hotkeys(event) {
  if (event.keyCode == 27) {//key->ESC
    this.showConfirmationBox=false;
  }
}

}
