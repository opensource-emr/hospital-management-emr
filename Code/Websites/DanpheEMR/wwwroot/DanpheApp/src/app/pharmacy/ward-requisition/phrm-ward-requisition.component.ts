import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import * as moment from "moment";
import { CoreService } from "../../core/shared/core.service";
import { DispensaryRequisitionService } from "../../dispensary/dispensary-main/stock-main/requisition/dispensary-requisition.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import { PharmacyService } from "../shared/pharmacy.service";
import { PHRMStoreDispatchItems } from "../shared/phrm-store-dispatch-items.model";
import { PHRMStoreRequisitionItems } from "../shared/phrm-store-requisition-items.model";
import { PHRMStoreRequisition } from "../shared/phrm-store-requisition.model";
import { DispatchItemDto, DispatchItemModel, RequisitionForDispatchModel } from "../substore-requisition-dispatch/dispensary-dispatch/phrm-requisition-for-dispatch-vm.model";
import { CancellRequisitionDTO, GetRequisitionViewDto } from "../substore-requisition-dispatch/dispensary-request/phrm-store-requisition-details.component";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";
@Component({
  templateUrl: "./phrm-ward-requisition.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class WardRequisitionItems implements OnInit {
  public requisitionList: Array<PHRMStoreRequisition> = null;
  public filterRequisitionList: PHRMStoreRequisition[] = [];
  public innerDispatchdetails: PHRMStoreDispatchItems = new PHRMStoreDispatchItems();
  public dispatchListbyId: Array<PHRMStoreDispatchItems> = new Array<PHRMStoreDispatchItems>();
  public requisitionItemsDetails: Array<PHRMStoreRequisitionItems> = new Array<PHRMStoreRequisitionItems>();
  public requisitionGridColumns: Array<any> = null;
  public dispatchList: Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }> = new Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }>();
  DispatchListGridColumns: Array<any> = null;
  //({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
  public itemchecked: boolean = true;
  public showItemwise: boolean = false;
  public index: number = 0;
  public itemId: number = 0;
  public showDispatchList: boolean = false;
  public showDetailsbyDispatchId: boolean = false;
  public itemName: string = null;
  public requisitionId: number = 0;
  public requisitionDate: string = null;
  public ShowOutput: number = 0;
  public header: any = null;
  public createdby: string = "";
  public dispatchedby: string = "";
  public DispatchId: number = 0;
  public receivedby: string = "";
  departmentName: any;
  msgBoxServ: any;
  changeDetector: any;
  CoreService: any;
  Amount: any;
  DispatchedQuantity: any;
  StandardRate: any;
  TotalAmount: any;
  Sum: number = 0;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public NepaliDateInRequisitionGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public NepaliDateInDispatchListGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public showNepaliReceipt: boolean;
  showRequisitionDetails: boolean = false;
  requisition: GetRequisitionViewDto = new GetRequisitionViewDto();
  public showCancelButton: boolean = false;
  cancelRemarks: string = '';

  requisitionToDispatch: RequisitionForDispatchModel = new RequisitionForDispatchModel();
  selectAllRequisition: boolean = true;
  showDispatchPage: boolean = false;

  ReceivedBy: string = '';
  loading: boolean = false;
  showDispatchDetailPage: boolean = false;

  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(public coreService: CoreService, public dispensaryRequisitionService: DispensaryRequisitionService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public router: Router,
    public routeFrom: RouteFromService,
    public messageBoxService: MessageboxService) {
    this.dateRange = 'last1Week';
    this.GetPharmacyBillingHeaderParameter()

    this.NepaliDateInRequisitionGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
    this.requisitionGridColumns = GridColumnSettings.PHRMStoreRequisitionList;
    this.CheckReceiptSettings();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
  }
  ngOnInit() {
    this.DispatchListGridColumns = GridColumnSettings.PHRMDispatchList;
    this.NepaliDateInDispatchListGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadRequisitionList();
      } else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please enter valid From date and To date']);
      }
    }
  }

  LoadRequisitionList(): void {
    this.pharmacyBLService.GetWardRequestedItemList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.requisitionList = res.Results;
          this.filterRequisitionList = res.Results;
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['failed to get Requisitions.....please check log for details.']);
          ;
        }
      });
  }
  FilterRequisitionList(status: string) {
    var Status = [];
    if (status === "pending") {
      Status = ["active", "partial"];
    }
    else if (status === "complete") {
      Status = ["complete"];
    }
    else {
      Status = ["active", "partial", "complete", "initiated", "cancelled"];
    }
    this.filterRequisitionList = this.requisitionList.filter(a => Status.includes(a.RequisitionStatus));
  }
  DeptGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "requisitionDispatch":
        {
          this.requisitionId = $event.Data.RequisitionId;
          this.Load($event.Data.RequisitionId);
          this.showDispatchPage = true;
          break;
        }
      case "view":
        {
          this.LoadRequisitionDetails($event.Data.RequisitionId)
          this.showRequisitionDetails = true;
          break;
        }
      case "dispatchList":
        {
          var data = $event.Data;
          this.requisitionId = data.RequisitionId;
          this.departmentName = data.DepartmentName;
          this.requisitionDate = data.RequisitionDate;
          this.pharmacyBLService.GetDispatchDetails(this.requisitionId)
            .subscribe(res => this.ShoWDispatchbyRequisitionId(res));
          this.showDispatchList = true;
          break;;
        }
      case "approveTransfer":
        {
          var data = $event.Data;
          this.requisitionId = data.RequisitionId;
          this.dispensaryRequisitionService.ApproveRequisition(this.requisitionId)
            .subscribe(res => {
              if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, [`Requisition ${data.RequisitionNo} is approved successfully.`]);
                let selectedRequisition = this.filterRequisitionList.find(r => r.RequisitionId == this.requisitionId);
                selectedRequisition.RequisitionStatus = "complete";
                selectedRequisition.CanApproveTransfer = false;
                this.filterRequisitionList = this.filterRequisitionList.slice();
              }
              else {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Requisition ${data.RequisitionNo} approval failed.`]);
              }
            },
              err => {
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [`Requisition ${data.RequisitionNo} approval failed.`]);
              });
        }
      default:
        break;

    }
  }

  ShoWDispatchbyRequisitionId(res) {
    if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results.length !== 0) {
      this.dispatchList = res.Results;
    }
    else {
      this.showDispatchList = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no Requisition details !"]);

    }

  }

  DispatchDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
          var tempDispatchId = $event.Data.DispatchId;
          this.innerDispatchdetails = $event.Data;
          this.DispatchId = $event.Data.DispatchId;
          this.CheckReceiptSettings()
          this.pharmacyService.DispatchId = $event.Data.DispatchId
          if (this.showNepaliReceipt == false) {
            this.ShowbyDispatchId(tempDispatchId);
          }
          this.showDetailsbyDispatchId = true;
        }
        break;
      }
      default:
        break;
    }
  }
  ShowbyDispatchId(DispatchId) {
    this.pharmacyBLService.GetDispatchItemByDispatchId(DispatchId)
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.dispatchListbyId = res.Results;
          for (var i = 0; i < this.dispatchListbyId.length; i++) {
            this.Sum += (this.dispatchListbyId[i].StandardRate * this.dispatchListbyId[i].DispatchedQuantity);

          }
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['failed to get Dispatch List. ' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['failed to get Dispatch List. ' + err.ErrorMessage]);
        }
      );
  }



  gridExportOptions = {
    fileName: 'DispatchLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Close() {
    this.showDetailsbyDispatchId = false;
    this.showNepaliReceipt = false;
    this.Sum = 0;
    this.showRequisitionDetails = false;
    this.showDispatchPage = false;
    this.showDispatchDetailPage = false;
    this.dispatchList.splice(0);
  }
  CloseDispatchList() {
    this.showDispatchList = false;

  }
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><style>.img-responsive{max-height: 70px; position: relative;left: -62px;top: 12px;} </style><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
    popupWinindow.document.close();
  }

  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  GetPharmacyBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  CheckReceiptSettings() {
    //check for english or nepali receipt style
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }

  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.dispensaryRequisitionService.GetRequisitionView(RequisitionId)
        .subscribe(res => this.ShowRequisitionDetails(res));
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select Requisition for Details.']);
    }
  }

  ShowRequisitionDetails(res) {
    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
      this.requisition = res.Results.requisition;
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select Requisition for Details.']);
    }
  }

  ShowCancelButtonOnCkboxChange() {
    this.showCancelButton = this.requisition.RequisitionItems.filter(a => a.IsSelected == true).length > 0;
  }
  CancelSelectedItems() {
    if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Remarks is Compulsory for cancelling items."]);
    }
    else {
      let cancelledRequisitionItemIds: number[] = this.requisition.RequisitionItems.filter(a => a.IsSelected).map(s => s.RequisitionItemId);
      let cancelRequisitionItemDto: CancellRequisitionDTO = new CancellRequisitionDTO(this.requisitionId, cancelledRequisitionItemIds, this.cancelRemarks);
      this.dispensaryRequisitionService.CancelRequisitionItems(cancelRequisitionItemDto).
        subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
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
  }

  toogleAllDispatchItems() {
    this.requisitionToDispatch.RequisitionItems.forEach(a => {
      if (a.IsDispatchForbidden == false) {
        a.IsDispatchingNow = this.selectAllRequisition;
      }
    });
  }

  Load(RequisitionId: number) {
    if (RequisitionId != null && RequisitionId != 0) {
      this.pharmacyBLService.GetRequisitionDetailsForDispatch(RequisitionId)
        .subscribe(res => {
          if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
            this.requisitionToDispatch = res.Results.Requisition;
            this.showDispatchPage = true;
            this.checkIfAllSelected();
            this.checkIfDispatchIsAllowed();
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Requisition is not Authorized or Created !"]);

          }
        });
    }
  }

  checkIfAllSelected() {
    const dispatchableRequisition = this.requisitionToDispatch.RequisitionItems.filter(a => a.IsDispatchForbidden == false);
    this.selectAllRequisition = dispatchableRequisition.length > 0 && dispatchableRequisition.every(a => a.IsDispatchingNow == true);
  }
  public checkIfDispatchIsAllowed() {
    let IsDispatchForbidden = this.requisitionToDispatch.RequisitionItems.every(a => a.IsDispatchForbidden == true);
    if (IsDispatchForbidden == true) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No items to dispatch."]);
    }
  }

  AddDispatchRow(requisitionItemsIndex: number) {
    //check if the all the available stock lists are already selected. if yes, do not add more row.
    if (this.requisitionToDispatch.RequisitionItems[requisitionItemsIndex].AvailableStockList.length == this.requisitionToDispatch.RequisitionItems[requisitionItemsIndex].DispatchedItems.length) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["No other batch to dispatch from"]);
    }
    else {
      var newDispatchItem = new DispatchItemDto()
      this.requisitionToDispatch.RequisitionItems[requisitionItemsIndex].DispatchedItems.push(newDispatchItem);
    }
  }

  RemoveDispatchRow(requisitionItemsIndex: number, dispatchItemsIndex: number) {
    this.requisitionToDispatch.RequisitionItems[requisitionItemsIndex].DispatchedItems.splice(dispatchItemsIndex, 1);
    if (this.requisitionToDispatch.RequisitionItems[requisitionItemsIndex].DispatchedItems.length == 0)
      this.AddDispatchRow(requisitionItemsIndex)
  }
  SaveDispatchItems() {
    this.loading = true;
    var requisitionToSend = new RequisitionForDispatchModel();
    Object.assign(requisitionToSend, this.requisitionToDispatch);
    requisitionToSend.RequisitionItems = requisitionToSend.RequisitionItems.filter(r => r.IsDispatchingNow == true);
    requisitionToSend.RequisitionItems.forEach(r => r.DispatchedItems = r.DispatchedItems.filter(d => d.DispatchedQuantity > 0));
    if (requisitionToSend.RequisitionItems.length == 0 || requisitionToSend.RequisitionItems.every(r => r.DispatchedItems.length == 0)) {
      this.messageBoxService.showMessage("Failed", ["No items to dispatch."]);
      this.loading = false;
    }
    else if (requisitionToSend.RequisitionItems.some(r => r.DispatchedItems.some(d => d.DispatchedQuantity > d.AvailableQuantity))) {
      this.messageBoxService.showMessage("Failed", ["Dispatched Quantity can not be greater than Available Quantity"]);
    }
    else {
      var dispatchItemList: DispatchItemModel[] = [];
      requisitionToSend.RequisitionItems.forEach(r => {
        r.DispatchedItems.forEach(d => {
          var dispatchedItem = new DispatchItemModel();
          dispatchedItem.RequisitionId = requisitionToSend.RequisitionId;
          dispatchedItem.RequisitionItemId = r.RequisitionItemId;
          dispatchedItem.BatchNo = d.BatchNo;
          dispatchedItem.ExpiryDate = d.ExpiryDate;
          dispatchedItem.SalePrice = d.SalePrice;
          dispatchedItem.CostPrice = d.CostPrice;
          dispatchedItem.DispatchedQuantity = d.DispatchedQuantity;
          dispatchedItem.DispensaryId = requisitionToSend.RequestingDispensaryId;
          dispatchedItem.ItemId = r.ItemId;
          dispatchedItem.ReceivedBy = this.ReceivedBy;
          dispatchItemList.push(dispatchedItem);
        });
      });
      this.pharmacyBLService.PostSubStoreDispatch(dispatchItemList).finally(() => this.loading = false)
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
              this.messageBoxService.showMessage("success", ["Dispatch Items detail Saved."]);
              this.showDispatchDetailPage = true;
              this.LoadRequisitionDispatchDetails(this.requisitionId);
              // this.RouteToDispatchDetailPage();
            }
            else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["failed to add result.. please check log for details."]);
            }
          });
    }
  }


  LoadRequisitionDispatchDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.pharmacyBLService.GetRequisitionItemsByRID(RequisitionId)
        .subscribe(res => this.ShowRequisitionDispatchDetails(res));
    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please, Select Requisition for Details.']);
      this.Close();
    }
  }

  ShowRequisitionDispatchDetails(res) {
    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
      this.requisitionItemsDetails = res.Results;

      if (this.requisitionItemsDetails.length > 0) {
        this.requisitionItemsDetails.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
        });
        this.requisitionDate = this.requisitionItemsDetails[0].CreatedOn;
        this.createdby = this.requisitionItemsDetails[0].CreatedByName;
        this.dispatchedby = this.requisitionItemsDetails[0].DispatchedByName;
        this.receivedby = this.requisitionItemsDetails.find(a => a.ReceivedBy != null).ReceivedBy;
        var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);

      }
      else {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Selected Requisition is without Items"]);
        this.Close();
      }


    }
    else {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["There is no Requisition details !"]);
      this.Close();

    }
  }



}

