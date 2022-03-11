import { AfterViewChecked, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { RequisitionItems } from "../shared/requisition-items.model";
import { ItemMaster } from "../shared/item-master.model";
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { InventoryService } from '../shared/inventory.service';
import { CoreService } from "../../core/shared/core.service"
import * as moment from 'moment/moment';
@Component({
    templateUrl: "./dispatch-receipt-details.component.html"
})
export class DispatchReceiptDetailsComponent implements OnInit {
    public requisitionItemsDetails: Array<RequisitionItems> = new Array<RequisitionItems>();
    public requisitionId: number = 0;
    public requisitionDate: string = null;
    public requisitionNo: number = null;
    public ShowOutput: number = 0;
    public header: any = null;
    public createdby: string = "";
    public dispatchedby: string = "";
    public receivedby: string = "";
    public dispatchRemarks: string = "";
    public showNepaliReceipt: boolean;
    public DispatchId: number;
    sourceStoreName: string;
    targetStoreName: string;


    constructor(
        public InventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public messageBoxService: MessageboxService,
        public router: Router,
        public routeFrom: RouteFromService,
        public coreservice: CoreService) {
        this.requisitionId = this.inventoryService.RequisitionId;
        this.CheckReceiptSettings();
        this.DispatchId = this.inventoryService.DispatchId;
        // if (this.showNepaliReceipt == false) {
        //     this.LoadRDispatchDetails(this.inventoryService.DispatchId);
        // }
        this.GetInventoryBillingHeaderParameter();;
    }
    ngOnInit(): void {
        //check for english or nepali receipt style
        let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
        this.showNepaliReceipt = (receipt == "true");
        if (this.showNepaliReceipt == false) {
            this.LoadRDispatchDetails(this.DispatchId);
        }
    }

    LoadRDispatchDetails(DispatchId: number) {
        if (DispatchId > 0) {
            this.InventoryBLService.GetDispatchItemByDispatchId(DispatchId)
                .subscribe(res => this.ShowRequisitionDetails(res));
            this.inventoryService.DispatchId = 0;
        }
        else {
            this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
            // this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
            this.requisitionList();
        }
    }
    CheckReceiptSettings() {
        //check for english or nepali receipt style
        let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
        this.showNepaliReceipt = (receipt == "true");
    }
    ShowRequisitionDetails(res) {
        if (res.Status == "OK") {
            this.setFocusById('printBtn');
            this.requisitionItemsDetails = res.Results;

            //Check if there is requisition created without any Requisition Item then simply go to requisition List 
            //Because If there is no Items then we can't show anything.
            if (this.requisitionItemsDetails.length > 0) {
                this.sourceStoreName = this.requisitionItemsDetails[0].SourceStoreName;
                this.targetStoreName = this.requisitionItemsDetails[0].TargetStoreName;
                this.requisitionDate = this.requisitionItemsDetails[0].RequisitionDate;
                this.createdby = this.requisitionItemsDetails[0].RequestedByName;
                this.requisitionNo = this.requisitionItemsDetails[0].RequisitionNo;
                this.dispatchedby = this.requisitionItemsDetails[0].DispatchedByName;
                this.receivedby = this.requisitionItemsDetails[0].ReceivedBy;
                this.dispatchRemarks = this.requisitionItemsDetails[0].Remarks;
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
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;}</style><body onload="window.print()">' + printContents + '</html>');
        popupWinindow.document.close();
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
            this.messageBoxService.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }

    setFocusById(targetId: string, waitingTimeinMS: number = 10) {
        var timer = window.setTimeout(function () {
            let htmlObject = document.getElementById(targetId);
            if (htmlObject) {
                htmlObject.focus();
            }
            clearTimeout(timer);
        }, waitingTimeinMS);
    }
}
