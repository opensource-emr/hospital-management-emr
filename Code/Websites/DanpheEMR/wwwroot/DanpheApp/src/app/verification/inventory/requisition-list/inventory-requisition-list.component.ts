import { Component, OnInit } from "@angular/core";
import { VerificationBLService } from "../../shared/verification.bl.service";
import { Requisition } from "../../../inventory/shared/requisition.model";
import VerificationGridColumns from "../../shared/verification-grid-column";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { VerificationService } from "../../shared/verification.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { ENUM_Requisition_VerificationStatus } from "../../../shared/shared-enums";
import * as moment from 'moment/moment';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
  selector: "app-inventory-requisition-list",
  templateUrl: "./inventory-requisition-list.html"
})
export class VER_INV_RequisitionListComponent implements OnInit {
  public RequisitionGridData: Array<Requisition> = new Array<Requisition>();
  public RequisitionGridDataFiltered: Array<Requisition> = new Array<Requisition>();
  public RequisitionGridColumn: any;
  public VerificationStatus: string = "pending";
  public RequisitionStatus: string = "all";
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
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
    this.RequisitionGridColumn = VerificationGridColumns.RequisitionList;
  }

  ngOnInit() { }

  GetRequisitionListBasedOnUser() {
    this.verificationBLService
      .GetInventoryRequisitionListBasedOnUser(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.RequisitionGridData = res.Results;
          if (this.RequisitionGridData.length == 0) {
            this.messageBoxService.showMessage("Notice", [
              "No Requisition to Verify.",
              "Please Come Back Later."
            ]);
          }
          else{
          this.LoadRequisitionListByStatus();
          }
        }
      });
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetRequisitionListBasedOnUser();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }
  RequisitionGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        var selectedRequisition = $event.Data;
        this.RouteToRequisitionDetail(selectedRequisition);
        break;
      }
      default:
        break;
    }
  }

  private RouteToRequisitionDetail(selectedRequisition: Requisition) {
    this.verificationService.Requisition = selectedRequisition;
    this.routeFromService.RouteFrom = "/Verification/Inventory/Requisition"
    this.router.navigate(["Verification/Inventory/Requisition/RequisitionDetails"]);
  }

  LoadRequisitionListByStatus() {
    let temporaryFilteredList = new Array<Requisition>();
    if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.pending) {
      temporaryFilteredList = this.RequisitionGridData.filter(s =>s.RequisitionStatus == "active" && s.CurrentVerificationLevelCount < s.MaxVerificationLevel && s.isVerificationAllowed == true);
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.approved) {
      temporaryFilteredList = this.RequisitionGridData.filter(s => s.VerificationStatus == "approved");
    } else if (this.VerificationStatus == ENUM_Requisition_VerificationStatus.rejected) {
      temporaryFilteredList = this.RequisitionGridData.filter(s => s.VerificationStatus == "rejected");
    } else {
      temporaryFilteredList = this.RequisitionGridData;
    }

    //Filter for Requisition Id
    switch (this.RequisitionStatus) {
      case "active": {
        this.RequisitionGridDataFiltered = temporaryFilteredList.filter(R=>R.RequisitionStatus == "active");
        break;
      }
      case "partial": {
        this.RequisitionGridDataFiltered = temporaryFilteredList.filter(R=>R.RequisitionStatus == "partial");
        break;
      }
      case "complete": {
        this.RequisitionGridDataFiltered = temporaryFilteredList.filter(R=>R.RequisitionStatus == "complete");
        break;
      }
      case "cancelled": {
        this.RequisitionGridDataFiltered = temporaryFilteredList.filter(R=>R.RequisitionStatus == "cancelled");
        break;
      }
      default: {
        this.RequisitionGridDataFiltered = temporaryFilteredList
      }
    }
  }
}