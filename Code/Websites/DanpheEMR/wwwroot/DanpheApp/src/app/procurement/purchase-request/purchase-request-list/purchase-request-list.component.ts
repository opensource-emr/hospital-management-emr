import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../core/shared/core.service';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { PurchaseRequestModel } from '../../../inventory/shared/purchase-request.model';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { ProcurementBLService } from '../../shared/procurement.bl.service';

@Component({
  selector: 'app-purchase-request-list',
  templateUrl: './purchase-request-list.component.html',
  styles: []
})
export class PurchaseRequestListComponent implements OnInit {

  public PurchaseRequestList: Array<PurchaseRequestModel> = new Array<PurchaseRequestModel>();
  public PurchaseRequestColumn: Array<any> = null;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public rowIndex: number;
  public PurchsaeRequestListFiltered: Array<PurchaseRequestModel> = new Array<PurchaseRequestModel>();
  public currentPurchaseRequest: PurchaseRequestModel;
  public isShowRequisitionDetail: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  
  constructor(
    public procBLService: ProcurementBLService,
    public messageBoxService: MessageboxService,
    public inventoryService: InventoryService,
    public router: Router, public routeFromService: RouteFromService,
    public coreService: CoreService,
  ) {
    this.dateRange = "None";
    this.PurchaseRequestColumn = ProcurementGridColumns.PurchaseRequestList;
    this.GetInventoryBillingHeaderParameter();
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequestDate', false));
  }
  ngOnInit(): void {
   

  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPORequisition();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  GetPORequisition() {
    this.procBLService.GetPORequisition(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results.length > 0) {
          this.PurchaseRequestList = res.Results;
          this.FilterRequisitionList();
        }
        else {
          this.messageBoxService.showMessage("Notice", ["There is no requisition available"]);
        }
      })
  }
  PurchaseRequestGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "edit": {
        this.inventoryService.PurchaseRequestId = $event.Data.PurchaseRequestId;
        this.router.navigate(["/ProcurementMain/PurchaseRequest/PurchaseRequestAdd"]);
        break;
      }
      case "view": {
        this.inventoryService.PurchaseRequestId = $event.Data.PurchaseRequestId;
        this.routeFromService.RouteFrom = "/ProcurementMain/PurchaseRequest/PurchaseRequestList";
        this.router.navigate(["/ProcurementMain/PurchaseRequest/PurchaseRequestView"]);
        break;
      }
      case "addPO": {
        var purchaseRequest = $event.Data;
        if (this.CheckForAddPoApplicable(purchaseRequest)) {
          this.inventoryService.PurchaseRequestId = purchaseRequest.PurchaseRequestId;
          this.inventoryService.POId = 0;
          this.inventoryService.POIdforCopy = 0;
          this.router.navigate(["/ProcurementMain/PurchaseOrder/PurchaseOrderAdd"]);
        }
        break;
      }
      default:
        break;
    }
  }

  public FilterRequisitionList() {
    //This function will be used for filtering later on.
    this.PurchsaeRequestListFiltered = this.PurchaseRequestList.filter(PR => PR.RequestStatus != 'withdrawn');
  }
  Close() {
    this.isShowRequisitionDetail = false;
    this.currentPurchaseRequest = new PurchaseRequestModel();
  }
  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  private CheckForAddPoApplicable(purchaseRequest: PurchaseRequestModel): boolean {
    if (purchaseRequest.IsPOCreated == true) {
      return false;
    }
    else {
      if (purchaseRequest.MaxVerificationLevel == 0) {
        return true;
      }
      else {
        //conditions when verification exists.
        //if current verification level is less than max, then check for core cfg parameters and show result accordingly.
        if (purchaseRequest.CurrentVerificationLevelCount < purchaseRequest.MaxVerificationLevel) {
          //check the parameter and decide whether to reject add po or allow with mandatory remarks.
          var allowPObeforeVerification = this.coreService.Parameters.find(p => p.ParameterGroupName == "Inventory" && p.ParameterName == "AllowPOFromPurchaseRequestWithoutVerification").ParameterValue;
          if (allowPObeforeVerification == true || (typeof (allowPObeforeVerification) == "string" && allowPObeforeVerification == "true")) {
            this.messageBoxService.showMessage("notice-message", ["This request has not been verified."]);
            return true;
          }
          else {
            this.messageBoxService.showMessage("Failed", ['This purchase request is not verified.', 'You cannot add Purchase Order.']);
            return false;
          }
        }
        //if current verification level is equal to max, then allow add po
        if (purchaseRequest.CurrentVerificationLevelCount == purchaseRequest.MaxVerificationLevel) {
          return true;
        }
      }
    }
  }
  CreateNewPurchaseRequest() {
    this.inventoryService.PurchaseRequestId = 0;
    this.router.navigate(["/ProcurementMain/PurchaseRequest/PurchaseRequestAdd"]);
  }
}
