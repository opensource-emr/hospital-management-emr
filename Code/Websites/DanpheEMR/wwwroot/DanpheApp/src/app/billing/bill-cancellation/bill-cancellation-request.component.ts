
import { Component } from "@angular/core";
import { VisitService } from '../../appointments/shared/visit.service';
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from '../../patients/shared/patient.service';
import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';
import { BillingProvisionalCancellation_DTO } from "../shared/dto/bill-provisional-cancellation.dto";

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
  public dateRange: any;
  public patientDetails: Patient = new Patient();
  public showprovisionalcancelreceipt: boolean = false;
  public patientId: number = 0;
  public billCancellation: BillingProvisionalCancellation_DTO = new BillingProvisionalCancellation_DTO();
  ReturnedResult: any;
  ReturnedData: any;
  constructor(public BillingBLService: BillingBLService,
    public visitService: VisitService,
    public billingService: BillingService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public patientService: PatientService,
    public callbackService: CallbackService,
    public mesageBoxService: MessageboxService) {

    this.currCounterId = this.securityService.getLoggedInCounter().CounterId;
    //go back to counter activation page if none of the counter is activated.
    if (this.currCounterId < 1) {
      this.callbackService.CallbackRoute = '/Billing/BillCancellationRequest';
    }
    else {
      this.ProvisionalItemsGridColumns = GridColumnSettings.ProvisionalCancelSearch;
    }
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', true));
  }
  LoadProvisionalBills(fromDate, toDate): void {
    this.BillingBLService.LoadAllProvisionalBills(fromDate, toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.provisionalItemList = res.Results
          this.provisionalItemList.map(itm => itm.ProvisionalReceiptNoFormatted = `PR/${itm.ProvisionalReceiptNo}`);
        }
        else {
          this.mesageBoxService.showMessage("error", [res.ErrorMessage]);
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
  CancelGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "showCreditDetails": {
        this.selectedBillForCancel = $event.Data;
        this.patientId = $event.Data.PatientId;
        this.selIndexForCancel = this.provisionalItemList.findIndex(
          (p) =>
            p.BillingTransactionItemId == this.selectedBillForCancel.BillingTransactionItemId
        );
        if (this.selectedBillForCancel && this.selIndexForCancel > -1) {
          //this.showprovisionalcancelreceipt = true;
          this.showConfirmationBox = true;
        }

      }

    }
  }

  public provisionalReturnItemId: number = null;
  cancelRequest(billTransactionItem, index: number) {
    if (this.cancelRemarks && this.cancelRemarks.trim()) {
      billTransactionItem.CancelRemarks = this.cancelRemarks.trim();
      if (billTransactionItem.CancelRemarks && billTransactionItem.CancelRemarks.length) {
        let cancelItemOfCurrentPatient = window.confirm("Are you sure you want to cancel this item for this Patient?");

        if (cancelItemOfCurrentPatient) {
          billTransactionItem.CounterId = this.currCounterId;
          billTransactionItem.ItemIntegrationName = billTransactionItem.IntegrationName;
          if (billTransactionItem.ItemIntegrationName && billTransactionItem.ItemIntegrationName.toLowerCase() == "radiology") {
            this.BillingBLService.CancelBillRequest(billTransactionItem).subscribe((res) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
                this.provisionalItemList.splice(index, 1);
                this.provisionalItemList.slice();
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["The selected item has been canceled."]);
                this.showConfirmationBox = false;
                this.provisionalReturnItemId = res.Results;
                this.showprovisionalcancelreceipt = true;
                this.LoadProvisionalBills(this.fromDate, this.toDate);

              } else {
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
              }

            });
          } else if (billTransactionItem.ItemIntegrationName && billTransactionItem.ItemIntegrationName.toLowerCase() == "lab") {
            this.BillingBLService.CancelBillRequest(billTransactionItem).subscribe((res) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.provisionalItemList.splice(index, 1);
                this.provisionalItemList.slice();
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["The selected item has been canceled."]);
                this.showConfirmationBox = false;
                this.provisionalReturnItemId = res.Results;
                this.showprovisionalcancelreceipt = true;
                this.LoadProvisionalBills(this.fromDate, this.toDate);
              } else {
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [res.ErrorMessage]);
              }

            });
          } else {
            this.BillingBLService.CancelBillRequest(billTransactionItem).subscribe((res) => {
              if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.ReturnedData = res.Results;
                this.provisionalItemList.splice(index, 1);
                this.provisionalItemList.slice();
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["The selected item has been canceled."]);
                this.showConfirmationBox = false;
                this.provisionalReturnItemId = res.Results;
                this.showprovisionalcancelreceipt = true;
                this.LoadProvisionalBills(this.fromDate, this.toDate);
              } else {
                this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please try again later"]);
              }
            });
          }
          this.cancelRemarks = "";
        }
      } else {
        this.mesageBoxService.showMessage("failed", ["Please Write Cancellation Remarks"]);
      }
    } else {
      this.mesageBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["Please Write Cancellation Remarks"]);
    }
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {//key->ESC
      this.showConfirmationBox = false;
    }
  }
  public CloseInvoicePrint() {
    this.showprovisionalcancelreceipt = false;
    //this.BackToGrid();
  }

}
