import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { Requisition } from "../../../inventory/shared/requisition.model"
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../../shared/routefrom.service";
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { CoreService } from "../../../core/shared/core.service"
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { DispatchVerificationActor } from '../../../inventory/shared/track-requisition-vm.model';
import { VerificationActor } from '../../../verification/inventory/requisition-details/inventory-requisition-details.component';
@Component({
  templateUrl: "./inventory-ward-requisition-details.html"  // "/InventoryView/RequisitionDetails"
})
export class InventoryRequisitionDetailsComponent {
  public CurrentStoreId: number = 0;
  public requisitionItemsDetails: Array<RequisitionItems> = new Array<RequisitionItems>();
  public departmentName: string = "";
  public requisitionId: number = 0;
  public requisitionNo: number = 0;
  public issueNo: number = null;
  public requisitionDate: string = null;
  public ShowOutput: number = 0;
  //public header: any = null;
  public createdby: string = "";
  public dispatchers: DispatchVerificationActor[] = []; //this can come as empty array
  public verifiers: VerificationActor[] = null; // by default, this wil be null
  public receivedby: string = "";
  public requisition: Requisition = new Requisition();
  public showCancelRequisitonPopUp: boolean = false;
  public IsCancel: boolean = false;
  public isModificationAllowed: boolean = true;
  public mainRemarks: string;
  public showNepaliReceipt: boolean;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;
  constructor(public securityService: SecurityService,
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public routeFrom: RouteFromService,
    public coreservice: CoreService) {
    this.SetFocusById('print');
    this.CheckReceiptSettings();
    this.CheckForSubstoreActivation();
  }
  CheckReceiptSettings() {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.requisitionId = this.inventoryService.RequisitionId

  }
  CheckForSubstoreActivation() {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    try {
      if (!this.CurrentStoreId) {
        //routeback to substore selection page.
        this.router.navigate(['/WardSupply']);
      }
      else {
        //write whatever is need to be initialise in constructor here.
        if (this.showNepaliReceipt == false) {
          this.LoadRequisitionDetails(this.inventoryService.RequisitionId);
        }
        //sud:3Mar'20-Property Rename in InventoryService
        //this.header = JSON.parse(this.coreservice.Parameters[1].ParameterValue);//sud:3Mar'20-Removed-not used anywhere.
      }
    } catch (exception) {
      this.messageBoxService.showMessage("Error", [exception]);
    }
  }
  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.CheckIfModificationApplicable();

      //this.departmentName = this.inventoryService.Name;
      this.InventoryBLService.GetRequisitionItemsByRID(RequisitionId)
        .subscribe(res => this.ShowRequisitionDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      // this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
      this.requisitionList();
    }
  }

  private CheckIfModificationApplicable() {
    this.isModificationAllowed = this.inventoryService.isModificationAllowed;
    if (this.isModificationAllowed == false) {
      this.messageBoxService.showMessage("Notice", ["Editing or Withdrawing this requisition is not allowed.", "Check for the status of Requisition"]);
    }
  }

  ShowRequisitionDetails(res) {
    if (res.Status == "OK") {
      this.requisitionItemsDetails = res.Results.requestDetails;
      this.dispatchers = res.Results.Dispatchers;
      this.verifiers = res.Results.Verifiers;
      //Check if there is requisition created without any Requisition Item then simply go to requisition List 
      //Because If there is no Items then we can't show anything.
      if (this.requisitionItemsDetails.length > 0) {
        this.requisitionItemsDetails.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
        });
        this.requisitionDate = this.requisitionItemsDetails[0].CreatedOn;
        this.requisitionNo = this.requisitionItemsDetails[0].RequisitionNo;
        this.issueNo = this.requisitionItemsDetails[0].IssueNo;
        this.createdby = this.requisitionItemsDetails[0].CreatedByName;
        this.receivedby = this.requisitionItemsDetails[0].ReceivedBy;
        this.mainRemarks = this.requisitionItemsDetails[0].Remarks;
        var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);
        var updatedstatus = status.RequisitionItemStatus;

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
        this.requisitionList();
      }


    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);
      this.requisitionList();

    }
  }

  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  //edit requisition
  EditRequistion(status) {
    if (status == "complete" || status == "partial") {
      this.messageBoxService.showMessage("Access Denied", ["Requisition has already been created.", "Further editing is forbidden."]);
    }
    else {
      this.inventoryService.RequisitionId = this.requisitionId;
      this.router.navigate(['WardSupply/Inventory/InventoryRequisitionItem']);
    }
  }

  // caancel requisition

  WithdrawRequisition() {

    this.showCancelRequisitonPopUp = true;
    this.requisition.CancelRemarks = '';
  }

  WithdrawRequisitionByRequisitionId() {

    if (this.requisition.CancelRemarks && this.requisition.CancelRemarks.trim() != "") {
      this.InventoryBLService.WithdrawRequisitionById(this.requisitionId, this.requisition.CancelRemarks)
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.requisitionList();
              this.messageBoxService.showMessage("Success", ["Requisition " + this.requisitionId + " Withdrawn"]);
            } else {
              this.messageBoxService.showMessage("Error", ["Requisition Withdrawal Failed"]);
            }
          },
          err => {
            this.messageBoxService.showMessage("Error", [err.ErrorMessage]);
          });
    }
    else {
      this.msgBoxServ.showMessage("failed", [" Remarks is mandatory."]);
    }

  }
  //route back
  requisitionList() {
    this.routeFrom.RouteFrom = "RequisitionDetails"
    this.router.navigate(['/WardSupply/Inventory/InventoryRequisitionList']);
  }
  public SetFocusById(id: string) {
    window.setTimeout(function () {
        let elementToBeFocused = document.getElementById(id);
        if (elementToBeFocused) {
            elementToBeFocused.focus();
        }
    }, 600);
}
}
