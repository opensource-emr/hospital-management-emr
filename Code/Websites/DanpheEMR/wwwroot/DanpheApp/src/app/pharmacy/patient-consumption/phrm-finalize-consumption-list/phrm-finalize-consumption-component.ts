import { Component } from "@angular/core";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { ENUM_DanpheHTTPResponses } from "../../../shared/shared-enums";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PHRMPatientConsumption } from "../shared/phrm-patient-consumption.model";

@Component({
    selector: 'phrm-finalize-consumption-list',
    templateUrl: "./phrm-finalize-consumption-list.html",
})
export class PHRMPatientConsumptionFinalizeComponent {

    public patientConsumptionFinalizeGridColumns: Array<any> = null;
    public ShowFinalizePrintPage: boolean = false;
    public PatientConsumption: PHRMPatientConsumption = new PHRMPatientConsumption();

    public patientConsumptions: Array<PHRMPatientConsumption> = new Array<PHRMPatientConsumption>();
    public IsFinalizeInvoice: boolean = false;
    constructor(public pharmacyBLService: PharmacyBLService) {
        this.patientConsumptionFinalizeGridColumns = GridColumnSettings.PatientConsumptionFinalizeColumn;
        this.GetPatientConsumptionFinalizeList();
    }
    GetPatientConsumptionFinalizeList() {
        this.pharmacyBLService.GetFinalizePatientConsumptions().subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.patientConsumptions = res.Results;
            }
        });
    }
    FinalizeConsumptionGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "view":
                {
                    if ($event.Data != null) {
                        this.ShowFinalizePrintPage = true;
                        this.GetPatientConsumptionFinalizeInvoice($event.Data.InvoicePrintNo);
                    }
                    break;
                }
        }
    }
    ClosePrintPage() {
        this.ShowFinalizePrintPage = false;
    }
    GetPatientConsumptionFinalizeInvoice(InvoicePrintNo: number) {
        this.pharmacyBLService.GetPatientConsumptionFinalizeInvoice(InvoicePrintNo).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.IsFinalizeInvoice = true;
                this.PatientConsumption = res.Results.PatientConsumption;
                this.PatientConsumption.PatientConsumptionItems = res.Results.PatientConsumptionItems;
                this.PatientConsumption.CreatedOn = this.PatientConsumption.PatientConsumptionItems[0].CreatedOn;
                this.PatientConsumption.FinalizedDate = this.PatientConsumption.CreatedOn;
                this.PatientConsumption.TotalAmount = res.Results.PatientConsumption.TotalAmount;
                this.PatientConsumption.SubTotal = res.Results.PatientConsumption.SubTotal;
                this.PatientConsumption.UserName = res.Results.PatientConsumptionItems[0].UserName;
                this.PatientConsumption.DiscountAmount = res.Results.PatientConsumption.DiscountAmount;
                this.PatientConsumption.PatientConsumptionItems.forEach((item) => {
                    item.FinalizedQty = item.Quantity - (item.ReturnedQuantity == null || item.ReturnedQuantity == 0 ? 0 : item.ReturnedQuantity);
                    item.TotalAmount = item.FinalizedQty * item.SalePrice;
                }

                )
            }
        });
    }

}
