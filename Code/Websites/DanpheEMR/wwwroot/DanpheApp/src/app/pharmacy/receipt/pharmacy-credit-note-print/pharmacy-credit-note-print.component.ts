import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { PrinterSettingsModel } from "../../../settings-new/printers/printer-settings.model";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyCreditNotePrint_DTO } from "./pharmacy-credit-note-print.dto";

@Component({
    selector: "pharmacy-credit-note-print",
    templateUrl: "./pharmacy-credit-note-print.component.html"
})

export class PharmacyCreditNotePrintComponent {

    public receipt: PharmacyCreditNotePrint_DTO = new PharmacyCreditNotePrint_DTO();
    @Input("return-invoice-id") public ReturnInvoiceId: number = 0;
    IsItemLevelVATApplicable: boolean = false;
    IsMainVATApplicable: boolean = false;
    IsItemLevelDiscountApplicable: boolean = false;
    IsMainDiscountAvailable: boolean = false;
    showFooter: boolean = false;
    showEnglish: boolean = false;
    englishText: string = '';
    showNepali: boolean = false;
    nepaliText: string = '';
    showGenericName: boolean = false;
    showItemName: boolean = false;
    showGenNameAfterItemName: false;
    LeadingSeparator: string = '';
    public headerDetail: { hospitalName, address, email, PANno, tel, DDA };
    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public openBrowserPrintWindow: boolean = false;
    public browserPrintContentObj: any = { innerHTML: '' };
    public GeneralFieldLabel = new GeneralFieldLabels();
    @Output("call-back-print") callBackPrint: EventEmitter<object> = new EventEmitter();


    constructor(public coreService: CoreService,
        public pharmacyBLService: PharmacyBLService,
        public messageBoxService: MessageboxService,
        public _dispensaryService: DispensaryService,
        private changeDetector: ChangeDetectorRef
    ) {
        this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    }

    ngOnInit() {
        this.CheckSalesCustomization();
        this.GetPharmacyInvoiceFooterParameter();
        this.GetPharmacyBillingHeaderParameter();
        this.GetPharmacyItemNameDisplaySettings();

        if (this.ReturnInvoiceId) {
            this.GetCreditNoteInfo(this.ReturnInvoiceId);
        }
    }

    CheckSalesCustomization() {
        let salesParameterString = this.coreService.Parameters.find(p => p.ParameterName == "SalesFormCustomization" && p.ParameterGroupName == "Pharmacy");
        if (salesParameterString != null) {
            let SalesParameter = JSON.parse(salesParameterString.ParameterValue);
            this.IsItemLevelVATApplicable = (SalesParameter.EnableItemLevelVAT == true);
            this.IsMainVATApplicable = (SalesParameter.EnableMainVAT == true);
            this.IsItemLevelDiscountApplicable = (SalesParameter.EnableItemLevelDiscount == true);
            this.IsMainDiscountAvailable = (SalesParameter.EnableMainDiscount == true);

        }
    }

    GetPharmacyInvoiceFooterParameter() {
        let InvFooterParameterStr = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyInvoiceFooterNoteSettings" && p.ParameterGroupName == "Pharmacy");
        if (InvFooterParameterStr != null) {
            let FooterParameter = JSON.parse(InvFooterParameterStr.ParameterValue);
            if (FooterParameter.ShowFooter == true) {
                this.showFooter = true;
                if (FooterParameter.ShowEnglish == true) {
                    this.showEnglish = true;
                    this.englishText = FooterParameter.EnglishText;
                }
                if (FooterParameter.ShowNepali == true) {
                    this.showNepali = true;
                    this.nepaliText = FooterParameter.NepaliText;
                }
            }
        }
    }

    GetPharmacyBillingHeaderParameter() {
        const storeBillHeader = this._dispensaryService.getDispensaryHeader(this.receipt.StoreId)
        if (storeBillHeader != null) {
            this.headerDetail = {
                hospitalName: storeBillHeader.StoreLabel,
                address: storeBillHeader.Address,
                email: storeBillHeader.Email,
                PANno: storeBillHeader.PanNo,
                tel: storeBillHeader.ContactNo,
                DDA: ''
            }
        }
        else {
            var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy BillingHeader').ParameterValue;
            if (paramValue)
                this.headerDetail = JSON.parse(paramValue);
            else
                this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please enter parameter values for BillingHeader"]);
        }
    }

    GetPharmacyItemNameDisplaySettings() {
        let checkGeneric = this.coreService.Parameters.find(p => p.ParameterName == "PharmacyItemNameDisplaySettings" && p.ParameterGroupName == "Pharmacy");
        if (checkGeneric != null) {
            let phrmItemNameSettingValue = JSON.parse(checkGeneric.ParameterValue);
            this.showGenericName = phrmItemNameSettingValue.Show_GenericName
            this.showItemName = phrmItemNameSettingValue.Show_ItemName;
            this.showGenNameAfterItemName = phrmItemNameSettingValue.Show_GenericName_After_ItemName;
            this.LeadingSeparator = phrmItemNameSettingValue.Separator.trim();
        }
    }


    GetCreditNoteInfo(InvoiceIdReturnId) {
        if (InvoiceIdReturnId > 0) {
            this.pharmacyBLService.GetSaleReturnInvoiceItemsByInvoiceRetId(InvoiceIdReturnId).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.receipt = res.Results;
                    this.UpdateItemDisplayName(this.showGenericName, this.showItemName, this.LeadingSeparator, this.showGenNameAfterItemName);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrieve credit note information']);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to credit note information' + err.ErrorMessage]);
                });
        }
    }

    /**
    * Display the ItemName in the receipts based on core cfg parameter "PharmacyItemNameDisplaySettings"
    * @param showGenericName true if generic name should be seen
    * @param showItemName true if item name should be seen
    * @param separator string that separates itemname and genericname, wild card value "brackets" uses '()' to separate item name and generic name
    * @param showGenericNameAfterItemName true if itemname should be seen first and genericname should be seen after
    * @returns void
    * @default Shows only ItemName
    * @description created by Rohit on 4th Oct, 2021
    */
    public UpdateItemDisplayName(showGenericName: boolean, showItemName: boolean, separator: string = '', showGenericNameAfterItemName: boolean) {
        for (var i = 0; i < this.receipt.InvoiceItems.length; i++) {
            var item = this.receipt.InvoiceItems[i];
            if (showGenericName == true && showItemName == false) {
                item.ItemDisplayName = item.GenericName;
            }
            else if (showGenericName == false && showItemName == true) {
                item.ItemDisplayName = item.ItemName;
            }
            else if (showGenericName == true && showItemName == true) {
                if (showGenericNameAfterItemName == true) {
                    if (separator == "" || separator.toLowerCase() == "brackets") {
                        item.ItemDisplayName = `${item.ItemName}(${item.GenericName})`;
                    }
                    else {
                        item.ItemDisplayName = item.ItemName + separator + item.GenericName;
                    }
                }
                else {
                    if (separator == "" || separator.toLowerCase() == "brackets") {
                        item.ItemDisplayName = `${item.GenericName}(${item.ItemName})`;
                    }
                    else {
                        item.ItemDisplayName = item.GenericName + separator + item.ItemName;
                    }
                }
            }
            else {
                item.ItemDisplayName = item.ItemName;
            }
        }
    }

    OnPrinterChanged($event) {
        this.selectedPrinter = $event;
    }

    public Print(idToBePrinted: string = 'credit-note') {
        this.browserPrintContentObj.innerHTML = document.getElementById(idToBePrinted).innerHTML;
        this.openBrowserPrintWindow = false;
        this.changeDetector.detectChanges();
        this.openBrowserPrintWindow = true;
    }

    CallBackBillPrint($event) {
        let printCount = this.receipt.PrintCount + 1;
        let InvoiceReturnId = this.receipt.InvoiceReturnId;
        this.pharmacyBLService.PutPrintCount(printCount, InvoiceReturnId).subscribe();
        this.callBackPrint.emit();
    }

}