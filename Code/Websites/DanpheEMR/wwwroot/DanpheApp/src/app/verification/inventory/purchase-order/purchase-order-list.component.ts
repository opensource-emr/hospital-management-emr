import { Component, OnInit } from '@angular/core';
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import VerificationGridColumns from '../../shared/verification-grid-column';
import * as moment from 'moment';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { ENUM_Requisition_VerificationStatus } from '../../../shared/shared-enums';
import { PurchaseOrder } from '../../../inventory/shared/purchase-order.model';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.html'
})
export class PurchaseOrderListComponent implements OnInit {
  public PurchaseOrderGridData: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public PurchaseOrderGridDataFiltered: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public PurchaseOrderGridColumn: any;
  public VerificationStatus: string = "pending";
  public PurchaseOrderStatus: string = "all";
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
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PoDate', false));
    this.PurchaseOrderGridColumn = VerificationGridColumns.PurchaseOrderList;
  }

  ngOnInit() {
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPurchaseOrdersBasedOnUser();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  GetPurchaseOrdersBasedOnUser() {
    this.verificationBLService
      .GetInventoryPurchaseOrdersBasedOnUser(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.PurchaseOrderGridData = res.Results;
          //sud:7June'20--  (something).length crashes if the data is null. so Checking for Null before the length.
          if (!this.PurchaseOrderGridData || this.PurchaseOrderGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", [
              "No Requisition to Verify.",
              "Please Come Back Later."
            ]);
          }
          else{
          this.LoadPurchaseOrderListByStatus();
          }
        }
      });
  }
  PurchaseOrderGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "verify": {
        var selectedPurchaseOrder = $event.Data;
        this.RouteToPurchaseOrderDetail(selectedPurchaseOrder);
        break;
      }
      default:
        break;
    }
  }
  private RouteToPurchaseOrderDetail(selectedPO: PurchaseOrder) {
    this.verificationService.PurchaseOrder = selectedPO;
    this.routeFromService.RouteFrom = "/Verification/Inventory/PurchaseOrder"
    this.router.navigate(["Verification/Inventory/PurchaseOrder/PurchaseOrderVerify"]);
  }
  public LoadPurchaseOrderListByStatus(){
    this.PurchaseOrderGridDataFiltered = new Array<PurchaseOrder>();
    if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.pending) {
      this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.IsVerificationAllowed == true);
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.approved) {
      this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.VerificationStatus == "approved");
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.rejected) {
      this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData.filter(s => s.VerificationStatus == "rejected");
    } else {
      this.PurchaseOrderGridDataFiltered = this.PurchaseOrderGridData;
    }
  }
}
