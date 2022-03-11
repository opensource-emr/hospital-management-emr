import { CoreService } from "../../../core/shared/core.service";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";

@Component({
    selector: 'app-quotation-analysis-np',
    templateUrl: './quotation-analysis-np.component.html'
})
export class QuotationAnalysisNpComponent {
    @Input('active-fiscal-year') activeFiscalYear: string = '';
    @Input('quotation-items') QuotItemList: any[] = [];
    @Input('vendor-list') VendorList: any[] = [];
    @Input('total-amount-list') TotalAmountList: any[] = [];
    @Output('call-back-selected-vendor') selectedVendorEvent: EventEmitter<Object> = new EventEmitter<Object>();
    @Output('call-back-selected-date') selectedDateEvent: EventEmitter<Object> = new EventEmitter<Object>();
    noOfVendors: number = 0;
    public issuedDate = "";
    public selectedVendor: string = "";
    public selectedVendorForQuotation: any[] = [];
    headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };


    constructor(public coreservice: CoreService, public msgBox: MessageboxService) {
        this.GetInventoryBillingHeaderParameter();
    }
    ngOnInit() {
        this.noOfVendors = this.VendorList.length;
    }
    public ToggleItemSelection(i: number) {
        try {
            this.selectedVendor = this.VendorList[i].VendorName;
            if (this.VendorList[i].IsSelected) {
                this.selectedVendorForQuotation = this.VendorList[i];
                let otherSelectedVendors: any[] = this.VendorList.filter((vendor, index) => vendor.IsSelected == true && index != i);
                otherSelectedVendors.forEach(vendor => vendor.IsSelected = false);
                this.selectedVendorEvent.emit({ issuedDate: this.issuedDate, selectedVendor: this.selectedVendorForQuotation });
            }
            else {
                this.selectedVendorEvent.emit({ selectedVendor: null })

            }
        } catch (ex) {
        }
    }
    public ToogleDateSelection() {
        this.selectedDateEvent.emit({ issuedDate: this.issuedDate })
    }

    GetInventoryBillingHeaderParameter() {
        var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
        if (paramValue)
            this.headerDetail = JSON.parse(paramValue);
        else
            this.msgBox.showMessage("error", ["Please enter parameter values for Inventory Receipt Header"]);
    }
}