import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from '@angular/router';
import * as moment from "moment";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status, ENUM_OrderStatus, ENUM_PHRMPurchaseOrderStatus } from "../../../shared/shared-enums";
import { PharmacyPurchaseOrderVerifierSignatoty_DTO } from "../../shared/dtos/pharmacy-purchase-order-verifier-signatory.dto";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from "../../shared/pharmacy.service";
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { PHRMPurchaseOrderItems } from "../../shared/phrm-purchase-order-items.model";
import { PHRMPurchaseOrder } from "../../shared/phrm-purchase-order.model";
import { PHRMSupplierModel } from "../../shared/phrm-supplier.model";
import { PharmacyPOService } from "../pharmacy-po.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
@Component({
    templateUrl: "./phrm-purchase-order-list.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMPurchaseOrderListComponent {
    ////variable to store All PoList
    public PHRMPurchaseOrderList: any;
    ////variable to Bind All POItemsList
    public PHRMPOItemsList: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    ///variable to show-hide Popup box
    public showPHRMPOItemsbyPOId: boolean = false;
    /////variable to store Grid column of POList
    public PHRMpurchaseOrdersGridColumns: Array<any> = null;
    ///Varible to bind Supplier Data to View
    public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    ///variable to push PoItemsList to this variable because we have to minimize server call 
    public localDatalist: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    ///final stored List to bind by locally stored data to view
    public selectedDatalist: Array<PHRMPurchaseOrderItems> = new Array<PHRMPurchaseOrderItems>();
    showPopUp: boolean;
    public IsNepali: boolean;
    public currentPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    public fromDate: string;
    public toDate: string;
    public dateRange: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    printDetaiils: HTMLElement;
    showPrint: boolean;
    showPurchaseOrderAddEditPage: boolean = false;
    PHRMPO: PHRMPurchaseOrder = new PHRMPurchaseOrder();
    statusComplete: string = ENUM_OrderStatus.Complete;
    statusCancelPurchaseOrder: string = ENUM_OrderStatus.Cancel;
    public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
    PurchaseOrderId: number = 0;
    showGoodReceiptAddEditPage: boolean = false;
    Verifiers: PharmacyPurchaseOrderVerifierSignatoty_DTO[] = [];
    PharmacyChiefVerificationDetails: PharmacyPurchaseOrderVerifierSignatoty_DTO;
    FinanceHeadVerificationDetails: PharmacyPurchaseOrderVerifierSignatoty_DTO;
    HospitalDirectorVerificationDetails: PharmacyPurchaseOrderVerifierSignatoty_DTO;
    CeoDeanVerificationDetails: PharmacyPurchaseOrderVerifierSignatoty_DTO;

    public GeneralFieldLabel = new GeneralFieldLabels();
    constructor(public pharmacyBLService: PharmacyBLService,
        public pharmacyService: PharmacyService,
        public pharmacyPOService: PharmacyPOService,
        public msgserv: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public router: Router,
        public coreService: CoreService) {
        this.PHRMpurchaseOrdersGridColumns = PHRMGridColumns.PHRMPOList;
        this.dateRange = 'last1Week';
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PODate', false), new NepaliDateInGridColumnDetail('DeliveryDate', false));
        this.ShowReceiptInNepali();
        this.GetPharmacyHeaderParameter();
        this.GetSigningPanelConfiguration();
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }
    ShowReceiptInNepali() {
        let receipt = this.coreService.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
        this.IsNepali = (receipt == "true");
    }

    LoadPHRMPOListByStatus(status) {
        //there is if condition because we have to check diferent and multiple status in one action ....
        //like in pending we have to check the active and partial both...
        var Status = "";
        if (status == "pending") {
            Status = "pending,active,partial";
        }
        else if (status == "complete") {
            Status = "complete";
        }
        else if (status == "cancel") {
            Status = "cancel";
        }
        else if (status == "all") {
            Status = "pending,active,partial,complete,initiated";
        }
        else {
            Status = "initiated"
        }

        this.pharmacyBLService.GetPHRMPurchaseOrderList(Status, this.fromDate, this.toDate)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.PHRMPurchaseOrderList = res.Results
                    this.PHRMPurchaseOrderList = this.PHRMPurchaseOrderList.slice();
                } else {
                    this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + err.ErrorMessage]);
                }
            );
    }
    onDateChange($event) {
        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
            if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
                this.LoadPHRMPOListByStatus("pending");
            } else {
                this.msgserv.showMessage('failed', ['Please enter valid From date and To date']);
            }
        }
    }

    PHRMPurchaseOrderGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "genReceipt":
                {
                    var data = $event.Data;
                    this.ShowGRDetails(data.PurchaseOrderId);
                }
                break;
            case "view":
                {
                    var data = $event.Data;
                    this.currentSupplier = $event.Data;
                    this.currentPO.PurchaseOrderId = $event.Data.PurchaseOrderId;
                    this.ShowPOItemsDetailsByPOId(data.PurchaseOrderId);
                }
                break;
            default:
                break;
        }
    }

    ShowGRDetails(PurchaseOrderId) {
        //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
        this.pharmacyService.Id = PurchaseOrderId;
        // this.router.navigate(['/Pharmacy/Order/GoodsReceiptItems']);
        this.showGoodReceiptAddEditPage = true;
    }

    ShowPOItemsDetailsByPOId(purchaseOrderId) {
        if (this.IsNepali) {
            this.currentPO.PurchaseOrderId = purchaseOrderId;
            this.showPopUp = true;
        }
        else {
            this.pharmacyBLService.GetPHRMPOItemsByPOId(purchaseOrderId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == ENUM_DanpheHTTPResponses.OK) {
                        this.PHRMPOItemsList = res.Results.OrderItems;
                        this.PHRMPO = res.Results.Order;
                        this.Verifiers = res.Results.Signatories;
                        this.showPHRMPOItemsbyPOId = true;
                        this.SetVerifyDetails();
                        this.SetFocusById("printButton");
                    } else {
                        this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + res.ErrorMessage]);
                    }
                },
                    err => {
                        this.msgserv.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get OrderList.' + err.ErrorMessage]);
                    }
                );
        }

    }
    EditPO() {
        this.pharmacyPOService._PurchaseOrderId = this.currentPO.PurchaseOrderId;
        this.showPHRMPOItemsbyPOId = false;
        this.showPurchaseOrderAddEditPage = true;
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
    Close() {
        this.showPHRMPOItemsbyPOId = false;
        this.LoadPHRMPOListByStatus(ENUM_PHRMPurchaseOrderStatus.Pending);
    }
    OnPOViewPopUpClose() {
        this.LoadPHRMPOListByStatus(ENUM_PHRMPurchaseOrderStatus.Pending)
        this.showPopUp = false;
    }
    hotkeys(event) {
        //ESC Key Handling
        if (event.keyCode == 27) {
            this.Close();
        }
    }
    SetFocusById(IdToBeFocused: string) {
        window.setTimeout(function () {
            let elemToFocus = document.getElementById(IdToBeFocused);
            if (elemToFocus != null && elemToFocus != undefined) {
                elemToFocus.focus();
            }
        }, 20);
    }
    ShowPurchaseOrderAddEditPage() {
        this.showPurchaseOrderAddEditPage = true;
    }
    ClosePurchaseOrderAddEditPage(event) {
        this.showPurchaseOrderAddEditPage = false;
        this.ShowPOItemsDetailsByPOId(event);
        this.currentPO.PurchaseOrderId = event;

    }
    ClosePurchaseOrderAddEditPopupPage() {
        this.showPurchaseOrderAddEditPage = false;
    }
    GetPharmacyHeaderParameter() {
        var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.msgserv.showMessage("error", ["Please enter parameter values for BillingHeader"]);
    }

    CloseGoodReceiptItemAddEditPage() {
        this.showGoodReceiptAddEditPage = false;
        this.LoadPHRMPOListByStatus("pending");
    }

    SetVerifyDetails() {
        if (this.Verifiers.length > 0) {
            this.Verifiers.forEach(a => {
                if (a.CurrentVerificationLevel === 1) {
                    this.PharmacyChiefVerificationDetails = a;
                }
                if (a.CurrentVerificationLevel === 2) {
                    this.FinanceHeadVerificationDetails = a;
                }
                if (a.CurrentVerificationLevel === 3) {
                    this.HospitalDirectorVerificationDetails = a;
                }
                if (a.CurrentVerificationLevel === 4) {
                    this.CeoDeanVerificationDetails = a;
                }
            });
        }
    }

    GetVerifierDetails(index: number) {
        return this.Verifiers.find(a => a.CurrentVerificationLevel === index);
    }

    public VerifierSignatories: [] = [];
    public VerificationLevel: number = 0;
    public SignatoriesWithTheirColSpan: SignatoryObject[] = [];
    GetSigningPanelConfiguration() {
        this.SignatoriesWithTheirColSpan = [];
        var signingPanelConfigurationParameter = this.coreService.Parameters.find(param => param.ParameterGroupName === 'Pharmacy' && param.ParameterName == "SigningPanelConfiguration")
        if (signingPanelConfigurationParameter) {
            let signingPanelConfigurationParameterValue = JSON.parse(signingPanelConfigurationParameter.ParameterValue);
            let signatoriesWithColSpan = signingPanelConfigurationParameterValue.VerifierSignatories_ColSpan;

            for (const item of signatoriesWithColSpan) {
                const [signatory, colSpanStr] = item.split('_');
                const colSpan = parseInt(colSpanStr, 10);
                this.SignatoriesWithTheirColSpan.push({ signatory: signatory, colSpan });
            }
            this.VerificationLevel = signingPanelConfigurationParameterValue.VerificationLevel;
        }


    }

}

interface SignatoryObject {
    signatory: string;
    colSpan: number;
}
