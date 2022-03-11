import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';

import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMStoreRequisition } from "../../shared/phrm-store-requisition.model"
import { PHRMStoreRequisitionItems } from "../../shared/phrm-store-requisition-items.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { PharmacyService } from '../../shared/pharmacy.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../shared/routefrom.service';
import * as moment from 'moment/moment';
import { PHRMStoreDispatchItems } from "../../shared/phrm-store-dispatch-items.model";
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryRequisitionService } from "../../../dispensary/dispensary-main/stock-main/requisition/dispensary-requisition.service";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";

@Component({
      templateUrl: "./phrm-store-requisition-list.component.html",
      host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMStoreRequisitionListComponent implements OnInit {
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

      constructor(public coreService: CoreService, public dispensaryRequisitionService: DispensaryRequisitionService,
            public PharmacyBLService: PharmacyBLService,
            public PharmacyService: PharmacyService,
            public router: Router,
            public routeFrom: RouteFromService,
            public messageBoxService: MessageboxService) {
            this.dateRange = 'last1Week';
            this.GetPharmacyBillingHeaderParameter()

            this.NepaliDateInRequisitionGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RequisitionDate', false));
            this.requisitionGridColumns = GridColumnSettings.PHRMStoreRequisitionList;

            this.CheckReceiptSettings();
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
                        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
                  }
            }
      }

      LoadRequisitionList(): void {
            this.dispensaryRequisitionService.GetAllRequisitionList(this.fromDate, this.toDate)
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.requisitionList = res.Results.requisitionList;
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
      DeptGridAction($event: GridEmitModel) {
            switch ($event.Action) {
                  case "requisitionDispatch":
                        {
                              var data = $event.Data;
                              this.RouteToDispatch(data);
                              break;
                        }
                  case "view":
                        {
                              var data = $event.Data;
                              this.RouteToViewDetail(data);
                              break;
                        }
                  case "dispatchList":
                        {
                              var data = $event.Data;
                              this.requisitionId = data.RequisitionId;
                              this.departmentName = data.DepartmentName;
                              this.requisitionDate = data.RequisitionDate;
                              this.PharmacyBLService.GetDispatchDetails(this.requisitionId)
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
                                          if (res.Status == "OK") {
                                                this.messageBoxService.showMessage("Success", [`Requisition ${data.RequisitionNo} is approved successfully.`]);
                                                let selectedRequisition = this.filterRequisitionList.find(r => r.RequisitionId == this.requisitionId);
                                                selectedRequisition.RequisitionStatus = "complete";
                                                selectedRequisition.CanApproveTransfer = false;
                                                this.filterRequisitionList = this.filterRequisitionList.slice();
                                          }
                                          else {
                                                this.messageBoxService.showMessage("Failed", [`Requisition ${data.RequisitionNo} approval failed.`]);
                                          }
                                    },
                                          err => {
                                                this.messageBoxService.showMessage("Failed", [`Requisition ${data.RequisitionNo} approval failed.`]);
                                          });
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
                              this.innerDispatchdetails = $event.Data;
                              this.DispatchId = $event.Data.DispatchId;
                              this.CheckReceiptSettings()
                              this.PharmacyService.DispatchId = $event.Data.DispatchId
                              if (this.showNepaliReceipt == false) {
                                    this.ShowbyDispatchId(tempDispatchId);
                              }

                              this.showDispatchList = false;
                              this.showDetailsbyDispatchId = true;
                        }
                        break;
                  }
                  default:
                        break;
            }
      }
      ShowbyDispatchId(DispatchId) {
            this.PharmacyBLService.GetDispatchItemByDispatchId(DispatchId)
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.dispatchListbyId = res.Results;
                              for (var i = 0; i < this.dispatchListbyId.length; i++) {
                                    this.Sum += (this.dispatchListbyId[i].StandardRate * this.dispatchListbyId[i].DispatchedQuantity);

                              }
                        }
                        else {
                              this.msgBoxServ.showMessage("failed", ['failed to get Dispatch List. ' + res.ErrorMessage]);
                        }
                  },
                        err => {
                              this.msgBoxServ.showMessage("error", ['failed to get Dispatch List. ' + err.ErrorMessage]);
                        }
                  );
      }

      RouteToDispatch(data) {
            //Pass the RequistionId and DepartmentName to Next page for getting DispatchItems using pharmacyService
            this.PharmacyService.Id = data.RequisitionId;
            this.PharmacyService.Name = data.DepartmentName;
            this.router.navigate(['/Pharmacy/Store/StoreDispatch']);
      }
      RouteToViewDetail(data) {
            //pass the Requisition Id to RequisitionView page for List of Details about requisition
            this.PharmacyService.Id = data.RequisitionId;
            this.PharmacyService.Name = data.DepartmentName;
            this.router.navigate(['/Pharmacy/Store/StoreRequisitionDetails']);
      }
      gridExportOptions = {
            fileName: 'DispatchLists_' + moment().format('YYYY-MM-DD') + '.xls',
      };

      Close() {
            this.showDispatchList = false;
            this.showDetailsbyDispatchId = false;
            this.showNepaliReceipt = false;
            this.Sum = 0;
            this.dispatchList.splice(0);
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

      //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
      GetPharmacyBillingHeaderParameter() {
            var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
            if (paramValue)
                  this.headerDetail = JSON.parse(paramValue);
            else
                  this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
      }
      //route to create Requisition page
      DirectDispatch() {
            this.router.navigate(['/Pharmacy/Store/DirectDispatch']);
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

}
