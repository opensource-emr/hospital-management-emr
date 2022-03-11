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
import { GoodsReceipt } from '../../../inventory/shared/goods-receipt.model';

@Component({
  templateUrl: './goods-receipt-list.html',
  styles: []
})
export class GoodsReceiptListComponent implements OnInit {
  public GRGridData: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public GRGridDataFiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public GRGridColumn: any;
  public VerificationStatus: string = "pending";
  public GRStatus: string = "all";
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
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('GoodsReceiptDate', false), new NepaliDateInGridColumnDetail('VendorBillDate',false)]);
    this.GRGridColumn = VerificationGridColumns.GRList;
  }

  ngOnInit() {
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetGRsBasedOnUser();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }
  GetGRsBasedOnUser() {
    this.verificationBLService
      .GetInventoryGRBasedOnUser(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.GRGridData = res.Results;
          //sud:7June'20--  (something).length crashes if the data is null. so Checking for Null before the length.
          if (!this.GRGridData || this.GRGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", [
              "No GR to Verify.",
              "Please Come Back Later."
            ]);
          }
          else{
          this.LoadGRListByStatus();
          }
        }
      });
  }
  GRGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "verify": {
        var selectedGR = $event.Data;
        this.RouteToGRDetail(selectedGR);
        break;
      }
      default:
        break;
    }
  }
  private RouteToGRDetail(selectedGR: GoodsReceipt) {
    this.verificationService.GoodsReceipt = selectedGR;
    this.routeFromService.RouteFrom = "/Verification/Inventory/GoodsReceipt"
    this.router.navigate(["Verification/Inventory/GoodsReceipt/GoodsReceiptVerify"]);
  }
  public LoadGRListByStatus(){
    this.GRGridDataFiltered = new Array<GoodsReceipt>();
    if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.pending) {
      this.GRGridDataFiltered = this.GRGridData.filter(s => s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.IsVerificationAllowed == true);
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.approved) {
      this.GRGridDataFiltered = this.GRGridData.filter(s => s.VerificationStatus == "approved");
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.rejected) {
      this.GRGridDataFiltered = this.GRGridData.filter(s => s.VerificationStatus == "rejected");
    } else {
      this.GRGridDataFiltered = this.GRGridData;
    }
  }
}

