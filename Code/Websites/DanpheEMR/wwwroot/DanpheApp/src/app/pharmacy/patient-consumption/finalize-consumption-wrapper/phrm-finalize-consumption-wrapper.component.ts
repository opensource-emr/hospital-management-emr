import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as _ from 'lodash';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { CommonFunctions } from "../../../shared/common.functions";
import { ENUM_BillPaymentMode, ENUM_DanpheHTTPResponseText } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";

@Component({
    selector: 'phrm-finalize-consumption-wrapper',
    templateUrl: "./phrm-finalize-consumption-wrapper.html",
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMFinalizeConsumptionWrapperComponent {

    @Input('switch-view') public switchview: string = "finalize-invoice";
    @Output("callback-add") public callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    @Output("callback-popup-close") public callBackPopupClose: EventEmitter<Object> = new EventEmitter<Object>();
    @Input() public PatientDetail: PHRMPatientConsumption = new PHRMPatientConsumption();
    public PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();
    public PatientConsumptionToEdit = new PHRMPatientConsumption();
    public PatientConsumptionToFinalize = new PHRMPatientConsumption();
    public showPrintPage: boolean = false;

    @Input() public CurrentCounterId: number = 0;
    public isFinalInvoice: boolean = false;
    IsItemDetailsLoaded: boolean = false;
    @Input('ward-id') WardId: number = 0; //This is used to get SubStore Details which are mapped with the ward.

    @Input('store-ids') StoreIds: string = null;  //This comes from Nursing Ward (Stores that is mapped with Nursing Ward).

    @Input('store-id') StoreId: number = 0; //This comes from Activated Dispensary finalized patient consumption
    Close() {
        this.callBackPopupClose.emit();
        this.callBackPopupClose.emit();
    }

    ClosePopupClose() {
        this.callBackPopupClose.emit();
    }
    constructor(public pharmacyBLService: PharmacyBLService) {

    }
    ngOnInit() {
        this.GetPatientConsumption(this.PatientDetail.PatientId, this.PatientDetail.PatientVisitId);
    }


    public GetPatientConsumption(PatientId: number, PatientVisitId: number): void {
        this.pharmacyBLService.GetPatientConsumption(PatientId, PatientVisitId)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.PatientConsumption = res.Results.PatientConsumption;
                    this.PatientConsumption.PaymentMode = ENUM_BillPaymentMode.cash;
                    this.PatientConsumption.PatientConsumptionItems = res.Results.PatientConsumptionItems;
                    this.PatientConsumption.PatientConsumptionItems.forEach(item => {
                        item.VisitType = res.Results.PatientConsumption.VisitType;
                        item.RemainingQuantity = item.Quantity - item.ReturnedQuantity;
                        if (this.switchview === 'finalize-invoice') {
                            item.SubTotal = CommonFunctions.parseAmount((item.RemainingQuantity * item.SalePrice), 4);
                            item.DiscountAmount = CommonFunctions.parseAmount(item.SubTotal * item.DiscountPercentage / 100, 4);
                            item.TotalAmount = item.SubTotal - item.DiscountAmount;
                        }
                        else {
                            item.TotalAmount = 0;
                        }
                    });
                    if (this.StoreIds) {
                        this.PatientConsumption.PatientConsumptionItems = this.PatientConsumption.PatientConsumptionItems.filter(item => (item.Quantity - item.ReturnedQuantity) > 0 && this.StoreIds.includes(item.StoreId.toString()));
                    }
                    else {
                        this.PatientConsumption.PatientConsumptionItems = this.PatientConsumption.PatientConsumptionItems.filter(item => (item.Quantity - item.ReturnedQuantity) > 0);
                    }
                    this.HandleSwitch();
                    this.IsItemDetailsLoaded = true;
                }
            });
    }
    HandleSwitch(): void {
        this.PatientConsumptionToEdit = _.cloneDeep(this.PatientConsumption);
        this.PatientConsumptionToFinalize = _.cloneDeep(this.PatientConsumption);
    }
    ClosePrintPage() {
        this.showPrintPage = false;
        this.Close();
    }
    CallFinalizeInvoicePrint($event) {
        this.Close();
    }
    callbackClose() {
        this.Close()
    }
    public hotkeys(event) {
        if (event.keyCode === 27) {
            //For ESC key => close the pop up
            this.ClosePrintPage();
        }
    }

}