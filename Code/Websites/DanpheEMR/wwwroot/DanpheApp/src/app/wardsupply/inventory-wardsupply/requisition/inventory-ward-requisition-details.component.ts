import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
import { SubStoreRequisitionItems_DTO } from '../../../inventory/shared/dtos/substore-requisition-item.dto';
import { SubStoreRequisition_DTO } from '../../../inventory/shared/dtos/substore-requisition.dto';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
@Component({
  selector: 'inventory-ward-requisition-details',
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
  public showCancelRequisitionPopUp: boolean = false;
  public IsCancel: boolean = false;
  public isModificationAllowed: boolean = true;
  public mainRemarks: string;
  public showNepaliReceipt: boolean;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;

  public Requisition: SubStoreRequisition_DTO = new SubStoreRequisition_DTO();
  public Verifiers: VerificationActor[] = [];
  public Dispatchers: VerificationActor[] = [];
  @Output('call-back-inventory-requisition-details-popup-close') callBackInventoryRequisitionDetailsPopupClose: EventEmitter<Object> = new EventEmitter<Object>();
  loading: boolean = false;


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

  ngOnDestroy() {
    this.inventoryService.isModificationAllowed = false;
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
      this.InventoryBLService.GetRequisitionItemsByRID(RequisitionId)
        .subscribe(
          res => this.ShowRequisitionDetails(res),
          err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrieve requisition details' + err]);
          });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select Requisition for Details.']);
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
    if (res.Status === ENUM_DanpheHTTPResponses.OK) {
      this.Requisition = res.Results.Requisition;
      this.Verifiers = res.Results.Verifiers;
      this.Dispatchers = res.Results.Dispatchers;
      if (!this.Requisition && !this.Requisition.RequisitionItems && !this.Requisition.RequisitionItems.length) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Selected Requisition is without Items"]);
        this.requisitionList();
      }
      else {
        this.receivedby = res.Results.Requisition.RequisitionItems[0].ReceivedBy;
      }
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no Requisition details !"]);
      this.requisitionList();
    }
  }

  print() {
    this.printDetaiils = document.getElementById("printpage");
    const style = document.createElement('style');
    style.textContent = `<style>
          .printStyle {
    border: dotted 1px;
    margin: 10px 100px;
  }

  .print-border-top {
    border-top: dotted 1px;
  }

  .print-border-bottom {
    border-bottom: dotted 1px;
  }

  .print-border {
    border: dotted 1px;
  }

  .center-style {
    text-align: center;
  }

  .border-up-down {
    border-top: dotted 1px;
    border-bottom: dotted 1px;
  }
          </style>`
    document.getElementById('printpage').appendChild(style)
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

    this.showCancelRequisitionPopUp = true;
    this.requisition.CancelRemarks = '';
  }

  WithdrawRequisitionByRequisitionId() {

    if (this.requisition.CancelRemarks && this.requisition.CancelRemarks.trim() != "") {
      this.loading = true;
      this.InventoryBLService.WithdrawRequisitionById(this.requisitionId, this.requisition.CancelRemarks)
        .finally(() => this.loading = false)
        .subscribe(
          res => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition " + this.requisitionId + " Withdrawn"]);
              this.showCancelRequisitionPopUp = false;
              this.callBackInventoryRequisitionDetailsPopupClose.emit({ context: 'requisitionWidthDrawn' });
            } else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Requisition Withdrawal Failed"]);
            }
          },
          err => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [err.ErrorMessage]);
          });
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [" Remarks is mandatory."]);
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

  Close() {
    this.callBackInventoryRequisitionDetailsPopupClose.emit();
  }
}
