import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../core/shared/core.service';
import { PharmacyBLService } from '../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../pharmacy/shared/pharmacy.service';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { PHRMSubStoreItemMasterModel } from '../shared/phrm-substore-item-master.model';
import { PHRMSubStoreRequisitionItems } from '../shared/phrm-substore-requisition-items.model';
import { PHRMSubStoreRequisition } from '../shared/phrm-substore-requisition.model';
import WARDGridColumns from '../shared/ward-grid-cloumns';
import { WardSupplyBLService } from '../shared/wardsupply.bl.service';
import { PHRMSubStoreRequisitionDispatchToReceive_DTO } from './shared/phrm-substore-requisition-dispatch-to-receive.dto';
import { PharmacyWardRequisitionVerifier_DTO } from './shared/phrm-ward-requisition-verifier.dto';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
@Component({
  selector: 'app-requisition-add',
  templateUrl: './phrm-substore-requisition-add.component.html',
  styleUrls: ['./phrm-substore-requisition-add.component.css']
})
export class PHRMSubStoreRequisitionAddComponent implements OnInit {
  public currentRequItem: PHRMSubStoreRequisitionItems = new PHRMSubStoreRequisitionItems();
  public requisition: PHRMSubStoreRequisition = new PHRMSubStoreRequisition();
  public ItemList: Array<any> = [];
  public checkIsItemPresent: boolean = false;
  ItemListForReq: PHRMSubStoreItemMasterModel[] = [];
  public PHRMWardRequisitionGridColumns: Array<any> = null;
  public RequisitionGridDataFiltered: any;
  showWardReqItem: boolean;
  CurrentStoreId: number = 0;
  RequisitionGridData: any;
  public RequisitionStatusFilter: string = "all";

  showAddRequisitionPage: boolean = false;
  showRequisitionDetails: boolean = false;

  requisitionToView: GetSubStoreRequisitionViewDto = new GetSubStoreRequisitionViewDto();
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };
  showCancelButton: boolean = false;
  cancelRemarks: string = '';
  showPrint: boolean = false;
  printDetaiils: any;
  requisitionId: number = 0;
  loading: boolean = false;
  PHRMSubStoreRequisitionDispatchToReceive: PHRMSubStoreRequisitionDispatchToReceive_DTO = new PHRMSubStoreRequisitionDispatchToReceive_DTO();
  IsVerificationActivated: boolean = false;
  VerifierList: PharmacyWardRequisitionVerifier_DTO[] = [];

  public GeneralFieldLabel = new GeneralFieldLabels();
  constructor(
    public phrmBLService: PharmacyBLService,
    public phrmService: PharmacyService,
    public securityService: SecurityService,
    public router: Router,
    public messageBoxService: MessageboxService,
    public wardsupplyBLService: WardSupplyBLService,
    public coreService: CoreService) {
    this.CurrentStoreId = this.securityService.getActiveStore().StoreId;
    this.LoadItemTypeList();
    this.GetAllRequisitionByStoreId();
    this.GetPharmacyBillingHeaderParameter();
    this.PHRMWardRequisitionGridColumns = WARDGridColumns.WARDRequestList;
    this.LoadVerifiersForRequisition();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
  }
  ngOnInit(): void {
    this.setFocusById(`itemName${0}`);
  }
  AddRowRequest(): void {
    for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
      for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
        this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
      }
    }
    this.currentRequItem = new PHRMSubStoreRequisitionItems();
    this.currentRequItem.Quantity = 1;
    this.requisition.RequisitionItems.push(this.currentRequItem);
  }
  DeleteRow(index): void {
    this.requisition.RequisitionItems.splice(index, 1);
    if (index == 0) {
      this.AddRowRequest();
    }
  }

  OnItemSelected(Item: any, index): void {
    if (typeof Item === "string" && !Array.isArray(Item) && Item !== null) {
      Item = this.ItemList.find(a => a.ItemName == Item);
      if (Item != undefined) this.requisition.RequisitionItems[index].SelectedItem = Item;
    }
    if (typeof Item === "object" && !Array.isArray(Item) && Item !== null) {
      for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
        if (this.requisition.RequisitionItems[i].ItemId == Item.ItemId && i != index) {
          this.checkIsItemPresent = true;
        }
      }
      if (this.checkIsItemPresent == true) {
        this.messageBoxService.showMessage("notice-message", [Item.ItemName + " is already added..Please Check!!!"]);
        this.checkIsItemPresent = false;
        this.requisition.RequisitionItems.splice(index, 1);
        this.AddRowRequest();
      }
      else {
        this.requisition.RequisitionItems[index].ItemId = Item.ItemId;
      }
    }
    else {
      this.requisition.RequisitionItems[index].ItemId = null;
    }
  }

  itemListFormatter(data: any): string {
    let html = `<font color='blue'; size=03 >${data["ItemName"]}</font> (<i>${data["GenericName"]}</i>)`;
    return html;
  }
  AddRequisition(): void {
    var CheckIsValid = true;
    var errorMessages: string[] = [];
    if (this.requisition.IsValidCheck(undefined, undefined) == false) {
      for (var a in this.requisition.RequisitionValidator.controls) {
        this.requisition.RequisitionValidator.controls[a].markAsDirty();
        this.requisition.RequisitionValidator.controls[a].updateValueAndValidity();
      }
      CheckIsValid = false;
    }

    for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
      if (this.requisition.RequisitionItems[i].IsValidCheck(undefined, undefined) == false) {

        for (var a in this.requisition.RequisitionItems[i].RequisitionItemValidator.controls) {
          this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].markAsDirty();
          this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].updateValueAndValidity();
          if (this.requisition.RequisitionItems[i].RequisitionItemValidator.controls[a].invalid) {
            errorMessages.push(`${a} is not valid for item ${i + 1}.`)
          }
        }
        CheckIsValid = false;
      }

      if (this.requisition.RequisitionItems[i].ItemId == null) {
        CheckIsValid = false;
        errorMessages.push(`Item ${i + 1} is not a valid item.`);
      }
    }

    if (CheckIsValid == true && this.requisition.RequisitionItems != null) {
      this.requisition.RequisitionStatus = "active";
      this.requisition.CreatedOn = moment().format('YYYY-MM-DD');
      this.requisition.RequisitionDate = moment(this.requisition.RequisitionDate).format('YYYY-MM-DD') + ' ' + moment().format('HH:mm:ss.SSS')
      this.requisition.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
      this.requisition.StoreId = this.CurrentStoreId;
      for (var i = 0; i < this.requisition.RequisitionItems.length; i++) {
        this.requisition.RequisitionItems[i].RequisitionItemStatus = "active";
        this.requisition.RequisitionItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.requisition.RequisitionItems[i].AuthorizedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.requisition.RequisitionItems[i].CreatedOn = moment().format('YYYY-MM-DD');
        this.requisition.RequisitionItems[i].Item = null;
      }
      if (this.requisition.RequisitionItems.length === 0) {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Please Add Item First"]);
        return;
      }
      this.loading = true;
      this.wardsupplyBLService.AddRequisition(this.requisition)
        .finally(() => this.loading = false)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition is Generated and Saved"]);
            this.GetRequisitionDetailView(res.Results);
            this.requisition = new PHRMSubStoreRequisition();

          }
          else {
            err => {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to add Requisition.. please check log for details.']);
              this.logError(err.ErrorMessage);
            }
          }
        });
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, errorMessages);
    }

  }
  GetRequisitionDetailView(requisitionId): void {
    this.wardsupplyBLService.GetRequisitionDetailView(requisitionId).subscribe(res => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.requisitionToView = res.Results.requisition;
        this.showAddRequisitionPage = false;
        this.showRequisitionDetails = true;
      }
    }
    );
  }

  logError(err: any): void {
    console.log(err);
  }

  OnPressedEnterKeyInItemField(index): void {
    if (this.requisition.RequisitionItems[index].SelectedItem != null && this.requisition.RequisitionItems[index].ItemId != null) {
      this.setFocusById(`req_qty${index}`);
    }
    else {
      if (this.requisition.RequisitionItems.length == 1) {
        this.SetFocusOnItemName(index)
      }
      else {
        this.requisition.RequisitionItems.splice(index, 1);
        this.setFocusById('btn_Add');
      }
    }
  }
  private SetFocusOnItemName(index: number): void {
    this.setFocusById("itemName" + index);
  }
  onPressedEnterKeyInRemarkField(index): void {
    if (index == (this.requisition.RequisitionItems.length - 1)) {
      this.AddRowRequest();
    }
    this.SetFocusOnItemName(index + 1);
  }
  O
  setFocusById(id: string): void {
    var Timer = setTimeout(() => {
      if (document.getElementById(id)) {
        let nextEl = <HTMLInputElement>document.getElementById(id);
        nextEl.focus();
        clearTimeout(Timer);
      }
    }, 100)
  }
  LoadItemTypeList(): void {
    try {
      this.wardsupplyBLService.GetItemTypeListWithItems()
        .subscribe(res => this.CallBackGetItemTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CallBackGetItemTypeList(res): void {
    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
      if (res.Results) {
        this.ItemListForReq = res.Results;


      }
    }

  }
  ShowCatchErrMessage(exception): void {
    if (exception) {
      let ex: Error = exception;
      this.messageBoxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);

    }
  }
  PHRMWardRequestListGridAction($event: GridEmitModel): void {
    switch ($event.Action) {
      case "view":
        {
          var data = $event.Data;
          this.showWardReqItem = true;
          this.GetRequisitionDetailView($event.Data.RequisitionId);

          // this.ShowWardRequisitionItemsDetailsById(data.RequisitionId);
        }
        break;
      case "receiveDispatchedItems": {
        this.requisitionId = $event.Data.RequisitionId;
        this.GetDispatchedItemToReceive($event.Data.RequisitionId);
      }
        break;
      case "dispatchList": {
        var data = $event.Data;
      }
      default:
        break;
    }
  }

  GetAllRequisitionByStoreId(): void {
    var Status = "pending,partial,active,complete";
    this.wardsupplyBLService.GetWardRequisitionList(Status, this.CurrentStoreId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.RequisitionGridData = res.Results;
          this.LoadRequisitionListByStatus()
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get OrderList.' + err.ErrorMessage]);
        }
      );
  }
  LoadRequisitionListByStatus(): void {
    switch (this.RequisitionStatusFilter) {
      case "pending": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => ["active", "partial", "pending"].includes(R.Status));
        break;
      }
      case "complete": {
        this.RequisitionGridDataFiltered = this.RequisitionGridData.filter(R => R.Status == "complete");
        break;
      }
      default: {
        this.RequisitionGridDataFiltered = this.RequisitionGridData;
      }
    }
  }
  CreateRequisition(): void {
    this.showAddRequisitionPage = true;
    this.AddRowRequest();
  }
  Close(): void {
    this.showAddRequisitionPage = false;
    this.showRequisitionDetails = false;
    this.showDispatchedItemReceivePage = false;
    // this.requisition.RequisitionItems = [];
    this.requisition.RequisitionItems = [];
    this.GetAllRequisitionByStoreId();

  }
  GetPharmacyBillingHeaderParameter(): void {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please enter parameter values for BillingHeader"]);
  }
  ShowCancelButtonOnCkboxChange(): void {
    this.showCancelButton = this.requisitionToView.RequisitionItems.filter(a => a.IsSelected == true).length > 0;
  }

  CancelSelectedItems(): void {
    if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Remarks is Compulsory for cancelling items."]);
      return;
    }
    const selectedRequisitionItems = this.requisitionToView.RequisitionItems.filter(a => a.IsSelected);
    if (!selectedRequisitionItems && !selectedRequisitionItems.length) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please select items to cancel."]);
      return;
    }
    let requisitionId = selectedRequisitionItems[0].RequisitionId;
    let cancelledRequisitionItemIds: number[] = selectedRequisitionItems.map(s => s.RequisitionItemId);
    let cancelRequisitionItemDto: CancellSubStoreRequisitionDTO = new CancellSubStoreRequisitionDTO(requisitionId, cancelledRequisitionItemIds, this.cancelRemarks);
    this.wardsupplyBLService.CancelRequisitionItem(cancelRequisitionItemDto).
      subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ["Requisition is Cancel and Saved"]);
          this.Close();
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to cancel items.. please check log for details.']);
        }
      },
        err => {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to cancel items.. please check log for details.']);
        });

  }

  Requisition: any;
  DispatchList: [];
  showDispatchedItemReceivePage: boolean = false;
  GetDispatchedItemToReceive(RequisionId): void {
    this.wardsupplyBLService.GetDispatchedItemToReceive(RequisionId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
        this.PHRMSubStoreRequisitionDispatchToReceive = res.Results;
        this.showDispatchedItemReceivePage = true;
      }
    })
  }

  ReceivedDispatchedItem(DispatchId: number, Remarks: string): void {
    this.loading = true;
    this.wardsupplyBLService.ReceiveDispatchedItem(DispatchId, Remarks).finally(() => { this.loading = false }).subscribe(res => {
      if (res.Status == ENUM_DanpheHTTPResponseText.OK) {
        this.GetDispatchedItemToReceive(this.requisitionId);
      }
    })
  }

  print(): void {
    this.showPrint = false;
    this.printDetaiils = null;
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }


  VerifierListFormatter(data: any): string {
    return `${data["Name"]} (${data["Type"]})`;
  }

  ShowVerifiers() {
    if (this.requisition.IsVerificationEnabled == true) {
      this.AddVerifier();
    }
    else {
      this.requisition.VerifierList = [];
    }
  }
  DeleteVerifier(index: number) {
    this.requisition.VerifierList.splice(index, 1);
  }

  AddVerifier() {
    this.requisition.VerifierList.push(new PharmacyWardRequisitionVerifier_DTO())
  }

  AssignVerifier($event, index) {
    if (typeof $event == "object") {
      this.requisition.VerifierList[index] = $event;
    }
  }

  CheckIfDeleteVerifierAllowed() {
    return this.requisition.VerifierList.length <= 1;
  }
  CheckIfAddVerifierAllowed() {
    return this.requisition.VerifierList.some(V => V.Id == undefined) || this.requisition.VerifierList.length >= 4;
  }

  GetSignatotyName(index: number): string {
    let signatory = "";
    switch (index) {
      case 0:
        signatory = 'Chief Pharmaceutical Services';
        break;
      case 1:
        signatory = 'Finance Head';
        break;
      case 2:
        signatory = 'Hospital Director';
        break;
      case 3:
        signatory = 'CEO/Dean';
        break;
    }
    return signatory;
  }


  public SetDefaultVerifier() {
    let SubStoreRequisitionVerificationSetting = this.coreService.Parameters.find(param => param.ParameterGroupName == "Pharmacy" && param.ParameterName == "SubStoreRequisitionVerificationSetting").ParameterValue;
    let SubStoreRequisitionVerificationSettingParsed = JSON.parse(SubStoreRequisitionVerificationSetting);
    if (SubStoreRequisitionVerificationSettingParsed != null) {
      if (SubStoreRequisitionVerificationSettingParsed.EnableVerification == true) {
        this.IsVerificationActivated = true;
        this.requisition.IsVerificationEnabled = true;
        this.SetVerifiersFromVerifierIdsObj(SubStoreRequisitionVerificationSettingParsed.VerifierIds);
      }
      else {
        this.IsVerificationActivated = false;
      }
    }
  }

  private SetVerifiersFromVerifierIdsObj(VerifierIds: any) {
    if (this.requisition.IsVerificationEnabled == true && this.VerifierList != null) {
      this.requisition.VerifierList = [];
      var VerifierIdsParsed: any[] = (typeof (VerifierIds) == "string") ? JSON.parse(VerifierIds) : VerifierIds;
      if (VerifierIdsParsed == null || VerifierIdsParsed.length == 0) {
        this.AddVerifier();
      }
      else {
        VerifierIdsParsed.forEach(a => this.requisition.VerifierList.push(this.VerifierList.find(v => v.Id == a.Id && v.Type == a.Type)));
      }
    }
  }

  public LoadVerifiersForRequisition() {
    this.wardsupplyBLService.GetVerifiers()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.VerifierList = res.Results;
          this.SetDefaultVerifier();
        }
      }, err => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [err.error.ErrorMessage]);
      })
  }


}

export class GetSubStoreRequisitionViewDto {
  RequisitionNo: number;
  RequisitionDate: string;
  RequisitionStatus: string;
  RequestedBy: string;
  DispatchedBy: string;
  ReceivedBy: string;
  RequestedStoreName: string;
  RequisitionItems: GetSubStoreRequisitionItemViewDto[] = [];

}
export class GetSubStoreRequisitionItemViewDto {
  RequisitionId: number;
  RequisitionItemId: number;
  ItemName: string;
  GenericName: string;
  RequestedQuantity: number;
  ReceivedQuantity: number;
  PendingQuantity: number;
  RequestedItemStatus: string;
  Remarks: string;
  //for cancel selected item
  IsSelected: boolean;
  //for Cancelled item and remarks
  public CancelQuantity: number = 0;
  public CancelledBy: number = null;
  public CancelledOn: string = "";
  public CancelRemarks: string = "";
}

export class CancellSubStoreRequisitionDTO {
  RequisitionId: number;
  RequisitionItemIdList: number[] = [];
  CancelRemarks: string = "";
  constructor(requisitionId, requisitionItemIdList, cancelRemarks) {
    this.RequisitionId = requisitionId;
    this.RequisitionItemIdList = requisitionItemIdList;
    this.CancelRemarks = cancelRemarks;
  }
}
