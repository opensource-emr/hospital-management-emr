import { Component } from "@angular/core";
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

@Component({
      templateUrl: "./phrm-store-requisition-list.component.html"
})
export class PHRMStoreRequisitionListComponent {
      public deptRequisitionList: Array<PHRMStoreRequisition> = null;
      public innerDispatchdetails: PHRMStoreDispatchItems = new PHRMStoreDispatchItems();
      public dispatchListbyId: Array<PHRMStoreDispatchItems> = new Array<PHRMStoreDispatchItems>();
      public requisitionItemsDetails: Array<PHRMStoreRequisitionItems> = new Array<PHRMStoreRequisitionItems>();
      public deptwiseGridColumns: Array<any> = null;
      public dispatchList: Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }> = new Array<{ CreatedByName, CreatedOn, RequisitionId, DispatchId, ReceivedBy, DispatchedByName, DepartmentName }>();
      DispatchListGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
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

      constructor(public coreService: CoreService,
            public PharmacyBLService: PharmacyBLService,
            public PharmacyService: PharmacyService,
            public router: Router,
            public routeFrom: RouteFromService,
            public messageBoxService: MessageboxService) {
            this.deptwiseGridColumns = GridColumnSettings.PHRMStoreRequisitionList;
            this.DispatchListGridColumns = GridColumnSettings.PHRMDispatchList;
            this.LoadDeptwiseList("all");
            this.GetPharmacyBillingHeaderParameter()
      }


      BackToGrid() {
            this.showItemwise = false;
            this.LoadDeptwiseList("pending");
      }

      LoadDeptwiseList(status): void {
            this.showItemwise = false;
            //
            var Status = "";
            if (status == "pending") {
                  Status = "active,partial";
            }
            else if (status == "complete") {
                  Status = "complete";
            }
            else if (status == "all") {
                  Status = "active,partial,complete,initiated";
            }
            else {
                  Status = "initiated"
            }
            this.PharmacyBLService.GetDeptwiseRequisitionList(Status)
                  .subscribe(res => {
                        if (res.Status == "OK") {
                              this.deptRequisitionList = res.Results
                              this.deptRequisitionList.forEach(i => {
                                    i.canDispatchItem = true
                              });
                        }
                        else {
                              this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
                              ;
                              console.log(res.ErrorMessage);
                        }
                  });
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
                              this.requisitionId = data.RequistionId;
                              this.departmentName = data.DepartmentName;
                              this.requisitionDate = data.RequisitionDate;
                              this.PharmacyBLService.GetDispatchDetails(this.requisitionId)
                                    .subscribe(res => this.ShoWDispatchbyRequisitionId(res));
                              this.showDispatchList = true;
                              break;;
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
                  this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);

            }

      }

      DispatchDetailsGridAction($event: GridEmitModel) {
            switch ($event.Action) {
                  case "view": {
                        if ($event.Data != null) {
                              var tempDispatchId = $event.Data.DispatchId;
                              this.innerDispatchdetails = $event.Data;
                              this.ShowbyDispatchId(tempDispatchId);
                              this.showDispatchList = false;
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
                              this.showDetailsbyDispatchId = true;
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
            this.PharmacyService.Id = data.RequistionId;
            this.PharmacyService.Name = data.DepartmentName;
            this.router.navigate(['/Pharmacy/Store/StoreDispatch']);
      }
      RouteToViewDetail(data) {
            //pass the Requisition Id to RequisitionView page for List of Details about requisition
            this.PharmacyService.Id = data.RequistionId;
            this.PharmacyService.Name = data.DepartmentName;
            this.router.navigate(['/Pharmacy/Store/StoreRequisitionDetails']);
      }
      gridExportOptions = {
            fileName: 'DispatchLists_' + moment().format('YYYY-MM-DD') + '.xls',
      };

      Close() {
            this.showDispatchList = false;
            this.showDetailsbyDispatchId = false;
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
            var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
            if (paramValue)
                  this.headerDetail = JSON.parse(paramValue);
            else
                  this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
      }
}
