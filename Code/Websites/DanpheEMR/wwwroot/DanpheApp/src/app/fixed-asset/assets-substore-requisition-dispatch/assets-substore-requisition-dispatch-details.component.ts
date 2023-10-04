import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Requisition } from "../../inventory/shared/requisition.model"
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { CoreService } from "../../core/shared/core.service"
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { DispatchVerificationActor } from '../../inventory/shared/track-requisition-vm.model';
import { VerificationActor } from '../../verification/inventory/requisition-details/inventory-requisition-details.component';
import { wardsupplyService } from "../../wardsupply/shared/wardsupply.service";
import { FixedAssetBLService } from '../shared/fixed-asset.bl.service';
import { WardSupplyAssetRequisitionItemsModel } from '../../wardsupply/shared/wardsupply-asset-requisitionItems.model';
import { FixedAssetService } from '../shared/fixed-asset.service';
@Component({
  selector: 'assets-substore-requisition-dispatch-details',
  templateUrl: "./assets-substore-requisition-dispatch-details.component.html"
})
export class AssetSubstoreRequisitionDispatchDetailsComponent implements OnInit {
  public CurrentStoreId: number = 0;
  public requisitionItemsDetails: Array<WardSupplyAssetRequisitionItemsModel> = new Array<WardSupplyAssetRequisitionItemsModel>();
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
  public subStoreName: string;
  showNepaliReceipt: boolean;
  constructor(
    public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public routeFrom: RouteFromService,
    public coreservice: CoreService,
    public fixedAssetBLService: FixedAssetBLService,
    public fixedAssetService: FixedAssetService) {
  }
  ngOnInit() {
    this.requisitionId = this.fixedAssetService.RequisitionId;
    this.CheckReceiptSettings();
    if (this.showNepaliReceipt == false) {
      this.LoadRequisitionDetails(this.requisitionId)
    }
  }
  CheckReceiptSettings() {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.requisitionId = this.fixedAssetService.RequisitionId

  }
  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      // this.CheckIfModificationApplicable();    
      this.fixedAssetBLService.GetSubstoreAssetRequistionItemsById(this.requisitionId)
        .subscribe(res => this.ShowRequisitionDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      // this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
      this.requisitionList();
    }
  }


  ShowRequisitionDetails(res) {
    if (res.Status == "OK") {
      this.requisitionItemsDetails = res.Results;
      this.dispatchers = res.Results.Dispatchers;
      this.verifiers = res.Results.Verifiers;
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
        var updatedstatus = this.requisitionItemsDetails[0].RequisitionItemStatus;
        this.subStoreName = this.requisitionItemsDetails[0].SubstoreName;

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

  //this is used to print the receipt
  print() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write(`
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" />
      </head>
      <style>
        .printStyle {border: dotted 1px;margin: 10px 100px;}
        .print-border-top {border-top: dotted 1px;}
        .print-border-bottom {border-bottom: dotted 1px;}
        .print-border {border: dotted 1px;}
        .center-style {text-align: center;}
        .border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}
        .hidden-in-print { display:none !important}
      </style>
      <body onload="window.print()">`
      + printContents
      + "</html>");
    popupWinindow.document.close();
  }
  @Output("callback-details")
  callbackDetails: EventEmitter<Object> = new EventEmitter<Object>();

  requisitionList() {
    this.requisitionId = 0;
    this.fixedAssetService.RequisitionId = 0;
    this.callbackDetails.emit({ showDetails: false });
  }
}
