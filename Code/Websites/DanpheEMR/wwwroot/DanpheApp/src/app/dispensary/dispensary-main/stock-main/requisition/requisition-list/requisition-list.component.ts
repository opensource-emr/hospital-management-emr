import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../../../../core/shared/core.service';
import { PharmacyBLService } from '../../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../../pharmacy/shared/pharmacy.service';
import { PHRMStoreDispatchItems } from '../../../../../pharmacy/shared/phrm-store-dispatch-items.model';
import { PHRMStoreRequisitionItems } from '../../../../../pharmacy/shared/phrm-store-requisition-items.model';
import { PHRMStoreRequisition } from '../../../../../pharmacy/shared/phrm-store-requisition.model';
import { PHRMStoreModel } from '../../../../../pharmacy/shared/phrm-store.model';
import { GridEmitModel } from '../../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../../shared/routefrom.service';
import DispensaryGridColumns from '../../../../shared/dispensary-grid.column';
import { DispensaryService } from '../../../../shared/dispensary.service';
import { DispensaryRequisitionService } from '../dispensary-requisition.service';

@Component({
  selector: 'app-requisition-list',
  templateUrl: './requisition-list.component.html',
  styles: [],
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class RequisitionListComponent implements OnInit {
  public requisitionList: Array<PHRMStoreRequisition> = null;
  public filterRequisitionList: PHRMStoreRequisition[] = [];
  public innerDispatchdetails: PHRMStoreDispatchItems = new PHRMStoreDispatchItems();
  public dispatchListbyId: Array<PHRMStoreDispatchItems> = new Array<PHRMStoreDispatchItems>();
  public requisitionItemsDetails: Array<PHRMStoreRequisitionItems> = new Array<PHRMStoreRequisitionItems>();
  public requisitionGridColumns: Array<any> = null;
  public dispatchList: Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }> = new Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }>();

  public DispatchListGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
  public itemchecked: boolean = true;
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
  public departmentName: any;
  public Amount: any;
  public DispatchedQuantity: any;
  public StandardRate: any;
  public TotalAmount: any;
  public Sum: number = 0;
  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };
  public currentActiveDispensary: PHRMStoreModel; public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public RequisitionNepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public DispatchNepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public showNepaliReceipt: boolean;

  constructor(public coreService: CoreService, private _dispensaryService: DispensaryService, public dispensaryRequistionService: DispensaryRequisitionService,
    public pharmacyBLService: PharmacyBLService,
    public pharmacyService: PharmacyService,
    public router: Router,
    public routeFrom: RouteFromService,
    public messageBoxService: MessageboxService) {
    this.requisitionGridColumns = DispensaryGridColumns.PHRMStoreRequisitionList;
    this.DispatchListGridColumns = DispensaryGridColumns.PHRMDispatchList;
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;
    this.dateRange = 'last1Week';
    this.RequisitionNepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
    this.DispatchNepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));
    this.GetPharmacyBillingHeaderParameter()
    

  }
  ngOnInit(): void {
    
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadRequisitionList();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  CheckReceiptSettings() {
    //check for english or nepali receipt style
    let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
  }
  LoadRequisitionList(): void {
    this.dispensaryRequistionService.GetAllRequisitionListByDispensaryId(this.currentActiveDispensary.StoreId, this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.requisitionList = res.Results.requisitionList
          this.filterRequisitionList = res.Results.requisitionList;
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
          ;
          console.log(res.ErrorMessage);
        }
      });
  }
  FilterRequisitionList(status: string) {
    var Status = [];
    if (status == "pending") {
      Status = ["active", "partial"];
    }
    else if (status == "complete") {
      Status = ["complete"];
    }
    else {
      Status = ["active", "partial", "complete", "initiated", "cancelled"];
    }
    this.filterRequisitionList = this.requisitionList.filter(a => Status.includes(a.RequisitionStatus));
  }
  RequisitionGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view":
        {
          var data = $event.Data;
          this.requisitionId = data.RequisitionId;
          this.RouteToViewDetail(data);
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
      case "receiveDispatchedItems": {
        var requisitionId = $event.Data.RequisitionId;
        this.dispensaryRequistionService.RequisitionId = requisitionId;
        this.router.navigate(['/Dispensary/Stock/Requisition/ReceiveStock']);
        break;
      }
      default:
        break;

    }
  }

  ShoWDispatchbyRequisitionId(res) {
    if (res.Status == "OK" && res.Results.length != 0) {
      this.dispatchList = res.Results;
    }
    else {
      this.showDispatchList = false;
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);

    }

  }

  DispatchDetailsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
          var tempDispatchId = $event.Data.DispatchId;
          this.DispatchId = tempDispatchId;
          this.innerDispatchdetails = $event.Data;
          this.CheckReceiptSettings();
          if (this.showNepaliReceipt == false) {
            this.ShowbyDispatchId(tempDispatchId);
          }
          this.showDispatchList = false;
          this.showDetailsbyDispatchId = true
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
        if (res.Status == "OK") {
          this.dispatchListbyId = res.Results;
          this.showDetailsbyDispatchId = true;
          for (var i = 0; i < this.dispatchListbyId.length; i++) {
            this.Sum += (this.dispatchListbyId[i].StandardRate * this.dispatchListbyId[i].DispatchedQuantity);

          }
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Dispatch List. ' + res.ErrorMessage]);
        }
      },
        err => {
          this.messageBoxService.showMessage("error", ['failed to get Dispatch List. ' + err.ErrorMessage]);
        }
      );
  }

  RouteToViewDetail(data) {
    //pass the Requisition Id to RequisitionView page for List of Details about requisition
    this.pharmacyService.Id = data.RequisitionId;
    this.pharmacyService.Name = data.DepartmentName;
    this.router.navigate(['/Dispensary/Stock/Requisition/View']);
  }
  //route to create Requisition page
  CreateRequisition() {
    this.router.navigate(['/Dispensary/Stock/Requisition/Add']);
  }
  gridExportOptions = {
    fileName: 'DispatchLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Close() {
    this.showDispatchList = false;
    this.showDetailsbyDispatchId = false;
    this.Sum = 0;
  }
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><style>.img-responsive{max-height: 70px; position: relative;left: -62px;top: 12px;} </style><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
    popupWinindow.document.close();
  }

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetPharmacyBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  public hotkeys(event) {
    //For ESC key => close the pop up
    if (event.keyCode == 27) {
      this.Close();
    }
  }
}
