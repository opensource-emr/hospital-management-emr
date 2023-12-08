import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from "../../core/shared/core.service";
import { InventoryFieldCustomizationService } from '../../shared/inventory-field-customization.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses } from '../../shared/shared-enums';
import { RequisitionDispatchItem_DTO } from '../shared/dtos/requisition-dispatch-item.dto';
import { RequisitionDispatch_DTO } from '../shared/dtos/requisition-dispatch.dto';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { InventoryService } from '../shared/inventory.service';
import { GeneralFieldLabels } from '../../shared/DTOs/general-field-label.dto';
@Component({
    selector: 'dispatch-receipt-details',
    templateUrl: "./dispatch-receipt-details.component.html"
})
export class DispatchReceiptDetailsComponent implements OnInit {
    public requisitionItemsDetails: Array<RequisitionDispatchItem_DTO> = new Array<RequisitionDispatchItem_DTO>();
    public requisitionId: number = 0;
    public requisitionDate: string = null;
    public requisitionNo: number = null;
    public showNepaliReceipt: boolean;
    requisitionDispatch: RequisitionDispatch_DTO = new RequisitionDispatch_DTO();
    DispatchId: number;
    showSpecification: boolean = false;
    showBarcode: boolean = false;
    showDispatchRequisitionPopup: boolean = false;
    @Output('call-back-dispatch-detail-popup-close')
    callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();

    public GeneralFieldLabel = new GeneralFieldLabels();


    constructor(
        public InventoryBLService: InventoryBLService,
        public inventoryService: InventoryService,
        public messageBoxService: MessageboxService,
        public router: Router,
        public routeFrom: RouteFromService,
        public coreservice: CoreService, public inventoryFieldCustomizationService: InventoryFieldCustomizationService) {
        this.requisitionId = this.inventoryService.RequisitionId;
        this.CheckReceiptSettings();
        this.DispatchId = this.inventoryService.DispatchId;
        // if (this.showNepaliReceipt == false) {
        //     this.LoadRDispatchDetails(this.inventoryService.DispatchId);
        // }
        this.GetInventoryBillingHeaderParameter();
        this.GetInventoryFieldCustomization();
        this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
    }
    ngOnInit(): void {
        //check for english or nepali receipt style
        let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
        this.showNepaliReceipt = (receipt == "true");
        if (this.showNepaliReceipt == false) {
            this.LoadRequsitionDispatchDetails(this.DispatchId, this.requisitionId, this.inventoryService.CreatedOn);
        }
    }

    ngOnDestroy() {
        this.inventoryService.DispatchId = 0;
        this.inventoryService.RequisitionId = 0;

    }

    LoadRequsitionDispatchDetails(DispatchId: number, RequisitionId: number, CreatedDate?: string) {
        if (DispatchId > 0) {
            this.InventoryBLService.GetDispatchItemByDispatchId(DispatchId, RequisitionId, CreatedDate)
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
        if (res.Status == ENUM_DanpheHTTPResponses.OK) {
            this.setFocusById('printBtn');
            this.requisitionDispatch = res.Results.RequisitionDispatch;
            this.requisitionItemsDetails = res.Results.RequisitionDispatchItems;
            this.showDispatchRequisitionPopup = true;
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
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><style>.printStyle {border: dotted 1px;margin: 10px 100px;}.print-border-top {border-top: dotted 1px;}.print-border-bottom {border-bottom: dotted 1px;}.print-border {border: dotted 1px;}.center-style {text-align: center;}.border-up-down {border-top: dotted 1px;border-bottom: dotted 1px;} td.td--break-text{ width: 30rem;  line-break: anywhere;} .no-print {display:none;} table,td {border: solid 1px;} </style><body onload="window.print()">' + printContents + '</html>');
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
    GetInventoryFieldCustomization(): void {
        let parameter = this.inventoryFieldCustomizationService.GetInventoryFieldCustomization();
        this.showSpecification = parameter.showSpecification;
        this.showBarcode = parameter.showBarcode;

    }

    Close(): void {
        this.showDispatchRequisitionPopup = false;
        this.router.navigate(['/Inventory/InternalMain/Requisition/RequisitionList']);
        this.callBackPopupClose.emit();
    }
}
