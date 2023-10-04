import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMStoreModel } from "../../shared/phrm-store.model";
import { PHRMPatientConsumptionItem } from "../shared/phrm-patient-consumption-item.model";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";
import { WardSubStoreMap_DTO } from "../shared/ward-substores-map.dto";

@Component({
    selector: 'phrm-return-consumption-items',
    templateUrl: "./return-consumption-items.html",
})
export class PHRMReturnPatientConsumptionComponent {

    @Input()
    showReturnPatientConsumption: boolean = false;
    @Input('patient-consumption-items') PatientConsumptionItems: Array<PHRMPatientConsumptionItem> = new Array<PHRMPatientConsumptionItem>();
    @Output('call-back-popup-close') callBackClose: EventEmitter<Object> = new EventEmitter<Object>();
    showPrintPage: boolean = false;
    @Output("callback-close") callbackClose: EventEmitter<Object> = new EventEmitter<Object>();

    PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
    selectAllItems: boolean = false;
    PatientConsumptionReturnReceiptNo: number = null;
    @Input('ward-id') WardId: number = 0;
    currentActiveDispensary: PHRMStoreModel = new PHRMStoreModel();
    WardSubStoreMapList: WardSubStoreMap_DTO[] = [];
    SelectedStore: WardSubStoreMap_DTO = new WardSubStoreMap_DTO();
    StoreId: number = 0;
    confirmationTitle: string = "Confirm !";
    confirmationMessage: string = "Are you sure you want to Proceed ?";
    loading: boolean;

    constructor(public messageBoxService: MessageboxService,
        public pharmacyBLService: PharmacyBLService,
        public DispensaryService: DispensaryService,
        public coreService: CoreService) {
        this.currentActiveDispensary = this.DispensaryService.activeDispensary;
    }

    ngOnInit() {
        this.GetDefaultStore();
        this.ClearPreviousData();
        this.coreService.FocusInputById('return-qty0')
    }

    OnQuantityChange(index: number) {
        const item = this.PatientConsumptionItems[index];

        if (item.ReturningQuantity > 0) {
            item.IsChecked = true;
            item.SubTotal = CommonFunctions.parseAmount((item.ReturningQuantity * item.SalePrice), 4);
            item.DiscountAmount = CommonFunctions.parseAmount((item.SubTotal * item.DiscountPercentage) / 100, 4);
            item.VatPercentage = 0;
            item.VatAmount = CommonFunctions.parseAmount(((item.SubTotal - item.DiscountAmount) * item.VatPercentage) / 100, 4);
            item.TotalAmount = CommonFunctions.parseAmount((item.SubTotal - item.DiscountAmount + item.VatAmount), 4);
            if (item.ReturningQuantity > (item.Quantity - item.ReturnedQuantity)) {
                item.IsInvalidQuantity = true;
            }
            else {
                item.IsInvalidQuantity = false;
            }
        }
        else if (item.ReturningQuantity === null || item.ReturningQuantity === 0) {
            item.IsChecked = false;
            item.IsInvalidQuantity = false;
        }
        else {
            item.IsChecked = false;
            item.IsInvalidQuantity = true;
            item.RemainingQuantity = item.Quantity - item.ReturnedQuantity;
        }
        this.CalculateTotalAmount();
        this.SelectItemChkOnChange();
    }

    CalculateTotalAmount() {
        this.PatientConsumption.PatientConsumptionItems = this.PatientConsumptionItems.filter(item => item.IsChecked === true);
        this.PatientConsumption.TotalAmount = CommonFunctions.parseAmount((this.PatientConsumption.PatientConsumptionItems.reduce((acc, item) => acc + item.TotalAmount, 0)), 4);
    }
    SaveReturnConsumption() {
        this.PatientConsumption.PatientConsumptionItems = this.PatientConsumptionItems.filter(item => item.IsChecked === true);
        if (!this.PatientConsumption.PatientConsumptionItems.length) {
            return this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['No items found to return.', 'Please checked at least one item to return.']);
        }

        if (this.PatientConsumption.PatientConsumptionItems.some(item =>
            item.RemainingQuantity < 0 || item.ReturningQuantity === null)) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Please Provide Valid Return Qty']);
            return;
        }
        if (this.PatientConsumption.PatientConsumptionItems.some(item => item.IsInvalidQuantity)) {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Return quantity cannot be more than consumption quantity']);
            return;
        }

        this.loading = true;
        this.PatientConsumption.PatientConsumptionItems.forEach(item => {
            item.Quantity = item.ReturningQuantity;
            item.ReturningStoreId = this.StoreId;

        });

        this.pharmacyBLService.SavePatientConsumptionReturn(this.PatientConsumption.PatientConsumptionItems)
            .finally(() => this.loading = false)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.PatientConsumptionReturnReceiptNo = res.Results;
                    this.showPrintPage = true;
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Return Successfully']);
                }
                else {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Please Insert Valid Return Quantity']);
                }
            },
                err => {
                    this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to Return. See console for more information']);
                    console.log(err);
                });

    }
    ClosePrintPage() {
        this.showPrintPage = false;
        this.PatientConsumptionReturnReceiptNo = null;
        this.callBackClose.emit();
    }


    DiscardChanges() {
        this.callbackClose.emit();
    }
    SelectAllChkOnChange() {

        if (this.selectAllItems) {

            this.PatientConsumptionItems.forEach((itm) => {
                itm.IsChecked = true;
            }
            );
            this.PatientConsumption.PatientConsumptionItems = this.PatientConsumptionItems;

        }
        else {
            this.PatientConsumption.PatientConsumptionItems.forEach((itm) => {
                itm.IsChecked = false;
            });
        }

    }
    SelectItemChkOnChange() {
        this.selectAllItems = this.PatientConsumptionItems.every((itm) => itm.IsChecked == true);
    }

    GetDefaultStore() {
        if (this.WardId) {
            this.pharmacyBLService.GetWardSubStoreMapDetails(this.WardId).subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.WardSubStoreMapList = res.Results;
                    let WardDefaultSubStore = this.WardSubStoreMapList.find(a => a.IsDefault === true);
                    this.SelectedStore = WardDefaultSubStore;
                    if (WardDefaultSubStore) {
                        this.StoreId = WardDefaultSubStore.StoreId;
                    }
                    else {
                        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Default store not found for this Ward']);
                    }
                }
            })
        }
        else {
            this.StoreId = this.currentActiveDispensary.StoreId;
        }
    }

    StoreListFormatter(data): string {
        let html = "";
        if (data["StoreId"]) {
            html = `<font color='blue'; size=03 >${data["StoreName"]}</font>`;
        }
        return html;
    }
    OnStoreChanged() {
        if (this.SelectedStore && this.SelectedStore.StoreId) {
            this.StoreId = this.SelectedStore.StoreId;
        }
    }

    ClearPreviousData() {
        this.PatientConsumptionItems.forEach(item => {
            item.ReturningQuantity = 0;
            item.IsChecked = false;
        });
        this.PatientConsumption.TotalAmount = 0;
    }
    handleConfirm() {
        this.SaveReturnConsumption();
    }
    handleCancel() {
        this.loading = false;
    }
}
