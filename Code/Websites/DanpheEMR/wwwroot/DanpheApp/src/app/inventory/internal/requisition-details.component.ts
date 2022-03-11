import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { RequisitionItems } from "../shared/requisition-items.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { InventoryService } from '../shared/inventory.service';
import { CoreService } from "../../core/shared/core.service"
import * as moment from 'moment/moment';
import { Requisition } from '../shared/requisition.model';
import { SecurityService } from '../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { CommonFunctions } from '../../shared/common.functions';
import { trigger, transition, style, animate } from '@angular/animations';
import { VerificationActor } from '../../verification/inventory/requisition-details/inventory-requisition-details.component';
@Component({
  animations: [
    trigger(
      'enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(0)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateY(10%)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(10%)', opacity: 1 }),
        animate('500ms', style({ transform: 'translateY(0)', opacity: 0 }))
      ])
    ]
    )
  ],
  templateUrl: "./requisition-details.html"
})
export class RequisitionDetailsComponent implements OnInit {
  //public requisitionItemsDetails: Array<RequisitionItems> = new Array<RequisitionItems>();
  public requisition: Requisition = new Requisition();

  public requisitionId: number = 0;
  public requisitionDate: string = null;
  public requisitionNo: number = null;
  public issueNo: number = null;
  public ShowOutput: number = 0;
  public header: any = null;
  public createdby: string = "";
  public dispatchedby: string = "";
  public receivedby: string = "";
  public cancelRemarks: string = "";
  public mainRemarks: string = ""; //for the whole requisition
  msgBoxServ: any;
  // checkboxes: boolean[];
  public showCancelButton: boolean = false;

  public isVerificationProcess: boolean = false;
  public CurrentVerificationLevel = 0;

  public requestingStoreName: string = null;
  public requestingQRCodeInfo: string = "";
  public showNepaliReceipt: boolean;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;



  constructor(
    public InventoryBLService: InventoryBLService,
    public securityService: SecurityService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public routeFrom: RouteFromService,
    public coreservice: CoreService) {

    //this.GetDepartmentdetail(this.inventoryService.RequisitionId);//sud:3Mar'20

    this.requestingStoreName = this.inventoryService.StoreName;
    //set properties to requisition variable from service.// These should mandatorily be assigned from earlier page.
    this.requisition.RequisitionId = this.inventoryService.RequisitionId;
    this.requisition.RequestFromStoreId = this.inventoryService.StoreId;



    this.GetInventoryBillingHeaderParameter();;
  }
  ngOnInit() {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.requisitionId = this.inventoryService.RequisitionId;
    if (this.showNepaliReceipt == false) {
      this.LoadRequisitionDetails(this.inventoryService.RequisitionId);//sud:3Mar'20
    }
    document.getElementById('printButton').focus();


  }
  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      this.InventoryBLService.GetRequisitionItemsForViewByReqId(RequisitionId) //sud:19Feb'20
        .subscribe(res => {
          this.ShowRequisitionDetails(res);
          this.SetValueForQR();
        }
        );
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      // this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
      this.requisitionList();
    }
  }

  //sud:19Feb'20-for separating requisition items and dispatch
  public reqItemsDetail: RequisitionItemInfoVM = new RequisitionItemInfoVM();


  private SetValueForQR() {
    this.requestingQRCodeInfo = `Requisition No: ` + this.requisitionNo + `
Request From : ` + this.requestingStoreName;
  }

  ShowRequisitionDetails(res: DanpheHTTPResponse) {
    if (res.Status == "OK") {

      this.reqItemsDetail = res.Results;

      if (this.reqItemsDetail && this.reqItemsDetail.RequisitionItemsInfo && this.reqItemsDetail.RequisitionItemsInfo.length > 0) {

        this.reqItemsDetail.RequisitionItemsInfo.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
        });

        this.requisitionDate = this.reqItemsDetail.RequisitionItemsInfo[0].CreatedOn;
        this.requisitionNo = this.reqItemsDetail.RequisitionItemsInfo[0].RequisitionNo;
        this.issueNo = this.reqItemsDetail.RequisitionItemsInfo[0].IssueNo;
        this.createdby = this.reqItemsDetail.RequisitionItemsInfo[0].CreatedByName;
        this.mainRemarks = this.reqItemsDetail.RequisitionItemsInfo[0].Remarks;
        this.receivedby = null;
        // we may have multiple dispatch, we have to handle differently.. 
        if (this.reqItemsDetail.DispatchInfo && this.reqItemsDetail.DispatchInfo.length > 0) {
          let allDispatchedByArray = this.reqItemsDetail.DispatchInfo.map(dis => {
            return dis.DispatchedByName;
          })
          let allReceivedByArray = this.reqItemsDetail.DispatchInfo.map(dis => {
            return dis.ReceivedBy;
          })

          let uniqueDispatchByNameArr = CommonFunctions.GetUniqueItemsFromArray(allDispatchedByArray);
          let uniqueReceivedByNameArr = CommonFunctions.GetUniqueItemsFromArray(allReceivedByArray);

          this.dispatchedby = uniqueDispatchByNameArr.join(";");
          this.receivedby = uniqueReceivedByNameArr.join(";");

          //this.dispatchedby = this.reqItemsDetail.DispatchInfo[0].DispatchedByName
        }

        //var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);
        //var updatedstatus = status.RequisitionItemStatus;

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
        this.requisitionList();
      }

      ////this.requisitionItemsDetails = res.Results;

      ////Check if there is requisition created without any Requisition Item then simply go to requisition List 
      ////Because If there is no Items then we can't show anything.
      //if (this.requisitionItemsDetails.length > 0) {
      //  this.requisitionItemsDetails.forEach(itm => {
      //    itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
      //  });
      //  this.requisitionDate = this.requisitionItemsDetails[0].CreatedOn;
      //  this.requisitionNo = this.requisitionItemsDetails[0].RequisitionNo;
      //  this.createdby = this.requisitionItemsDetails[0].CreatedByName;
      //  this.dispatchedby = this.requisitionItemsDetails[0].DispatchedByName;
      //  this.receivedby = this.requisitionItemsDetails.find(a => a.ReceivedBy != null).ReceivedBy;
      //  var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);
      //  var updatedstatus = status.RequisitionItemStatus;

      //}
      //else {
      //  this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
      //  this.requisitionList();
      //}

    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);
      this.requisitionList();

    }
  }

  //this is used to print the receipt
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  //route back
  requisitionList() {
    this.routeFrom.RouteFrom = "RequisitionDetails"
    this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
  }

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
  ShowCancelButtonOnCkboxChange() {
    this.showCancelButton = this.reqItemsDetail.RequisitionItemsInfo.filter(a => a.IsSelected == true).length > 0;
    //this.isSelectAll = this.finalFilteredList.every(a => a.IsSelected == true);
  }

  CancelSelectedItems() {
    if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
      this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for cancelling items."]);
    }
    else {
      let cancelItmsArr: RequisitionItems[] = this.reqItemsDetail.RequisitionItemsInfo.filter(a => a.IsSelected);
      cancelItmsArr.forEach(t => {
        t.CancelQuantity = (t.IsSelected == true) ? t.PendingQuantity : 0;
        t.PendingQuantity = (t.IsSelected == true) ? 0 : t.PendingQuantity;
        t.CancelBy = this.securityService.GetLoggedInUser().EmployeeId;
        t.CancelRemarks = this.cancelRemarks;
      });
      this.requisition.CancelledItems = cancelItmsArr;
      this.InventoryBLService.CancelRequisitionItems(this.requisition).
        subscribe(res => {
          if (res.Status == 'OK') {
            this.messageBoxService.showMessage("success", ["Requisition is Cancel and Saved"]);
            this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
          }
          else {
            this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
          }
        },
          err => {
            this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
            this.logError(err.ErrorMessage);
          });
    }
  }
  logError(err: any) {
    console.log(err);
  }

  //GetDepartmentdetail(reqId:number) {
  //  //pass the Requisition Id to RequisitionView page for List of Details about requisition
  //  // this.inventoryService.Id = data;
  //  this.InventoryBLService.GetDepartmentDetailByRequisitionId(reqId).
  //    subscribe(res => {
  //      if (res.Status == 'OK') {
  //        this.inventoryService.DepartmentName = res.Results.DepartmentName;
  //        this.inventoryService.DepartmentId = res.Results.DepartmentId;//sud:3Mar'20--not sure what's the use of this.

  //        // this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionDetails']);
  //      }
  //      else {
  //        this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
  //      }
  //    },
  //      err => {
  //        this.messageBoxService.showMessage("failed", ['failed to get Requisitions.....please check log for details.']);
  //      });
  //}

}



//sud: 19Feb'20--for complex property returning from server. 
class RequisitionItemInfoVM {
  public RequisitionItemsInfo: Array<RequisitionItems> = [];
  public DispatchInfo: Array<any> = [];
  public Verifiers: VerificationActor[] = null; // by default, this will be null
  public Dispatchers: VerificationActor[] = []; // by default, this will be empty array.
}
