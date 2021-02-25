import { Component, OnInit } from '@angular/core';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { PurchaseRequestModel } from '../../../inventory/shared/purchase-request.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import VerificationGridColumns from '../../shared/verification-grid-column';
import * as moment from 'moment';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { ENUM_Requisition_VerificationStatus } from '../../../shared/shared-enums';

@Component({
  templateUrl: './purchase-request-list.html'
})
export class VER_INV_PurchaseRequestListComponent implements OnInit {

  public PurchaseRequestGridData: Array<PurchaseRequestModel> = new Array<PurchaseRequestModel>();
  public PurchaseRequestGridDataFiltered: Array<PurchaseRequestModel> = new Array<PurchaseRequestModel>();
  public PurchaseRequestGridColumn: any;
  public VerificationStatus: string = "pending";
  public PurchaseRequestStatus: string = "all";
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  constructor(
    public verificationBLService: VerificationBLService,
    public messageBoxService: MessageboxService,
    public verificationService: VerificationService,
    public router: Router,
    public routeFromService: RouteFromService
  ) {
    this.dateRange = 'last1Week';
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequestDate', false));
    this.PurchaseRequestGridColumn = VerificationGridColumns.PurchaseRequestList;
  }

  ngOnInit() {
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPurchaseRequestsBasedOnUser();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  GetPurchaseRequestsBasedOnUser() {
    this.verificationBLService
      .GetInventoryPurchaseRequestsBasedOnUser(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PurchaseRequestGridData = res.Results;
          //sud:7June'20--  (something).length crashes if the data is null. so Checking for Null before the length.
          if (!this.PurchaseRequestGridData || this.PurchaseRequestGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", [
              "No Requisition to Verify.",
              "Please Come Back Later."
            ]);
          }
          else{
          this.LoadPurchaseRequestListByStatus();
          }
        }
      });
  }
  PurchaseRequestGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var selectedPurchaseRequest = $event.Data;
        this.RouteToPurchaseRequestDetail(selectedPurchaseRequest);
        break;
      }
      default:
        break;
    }
  }
  private RouteToPurchaseRequestDetail(selectedRequisition: PurchaseRequestModel) {
    this.verificationService.PurchaseRequest = selectedRequisition;
    this.routeFromService.RouteFrom = "/Verification/Inventory/PurchaseRequest"
    this.router.navigate(["Verification/Inventory/PurchaseRequest/PurchaseRequestDetail"]);
  }
  public LoadPurchaseRequestListByStatus(){
    this.PurchaseRequestGridDataFiltered = new Array<PurchaseRequestModel>();
    if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.pending) {
      this.PurchaseRequestGridDataFiltered = this.PurchaseRequestGridData.filter(s => s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.isVerificationAllowed == true);
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.approved) {
      this.PurchaseRequestGridDataFiltered = this.PurchaseRequestGridData.filter(s => s.VerificationStatus == "approved");
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.rejected) {
      this.PurchaseRequestGridDataFiltered = this.PurchaseRequestGridData.filter(s => s.VerificationStatus == "rejected");
    } else {
      this.PurchaseRequestGridDataFiltered = this.PurchaseRequestGridData;
    }
  }
}
