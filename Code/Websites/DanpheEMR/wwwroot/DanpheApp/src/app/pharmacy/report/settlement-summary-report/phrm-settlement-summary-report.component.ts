import { Component } from "@angular/core";
import * as moment from "moment";
import { DispensaryService } from "../../../dispensary/shared/dispensary.service";
import { CommonFunctions } from "../../../shared/common.functions";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMGridColumns from "../../shared/phrm-grid-columns";
import { PHRMStoreModel } from "../../shared/phrm-store.model";


@Component({
    selector: 'phrm-settlement-summary-report',
    templateUrl: './phrm-settlement-summary-report.html',
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PHRMSettlementSummaryReportComponent {
    PHRMSettlementReportData: any[] = [];
    currentDispensary: PHRMStoreModel;
    FromDate: string = null;
    ToDate: string = null;
    SettlementSummaryReportColumns: ({ headerName: string; field: string; width: number; cellRenderer?: undefined; } | { headerName: string; field: string; width: number; cellRenderer: (params: any) => string; })[];
    PatientId: number = null;
    showPopup: boolean = false;
    PatientInfo: any = {};
    Settlements: any[] = [];
    ReturnedSettlements: any[] = [];
    CashDiscount: number = 0;
    loading: boolean = false;
    Age: any = null;
    dispensaryList: any;
    selectedDispensary: any = { StoreId: null, Name: 'All' };
    dispensaryDetails: any;
    StoreId: number;
    
    collectionFromReceivableSummary = { TotalReceivable: 0, NetCollection: 0 };
    cashDiscountReceivedSummary = { TotalReturn: 0, NetReturnAmount: 0, TotalCashDiscount: 0 }
    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public _dispensaryService: DispensaryService, public msgBoxServ: MessageboxService) {
        this.FromDate = moment().format("YYYY-MM-DD");
        this.ToDate = moment().format("YYYY-MM-DD");
        this.SettlementSummaryReportColumns = PHRMGridColumns.PHRMSettlementHeaderList;
        this.currentDispensary = this._dispensaryService.activeDispensary;
        this.GetActiveDispensarylist();
    }
    Load() {
        this.loading = true;
        this.pharmacyBLService.GetSettlementSummaryReport(this.FromDate, this.ToDate, this.StoreId).finally(() =>
            this.loading = false)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PHRMSettlementReportData = res.Results;
                    if (res.Status == 'OK' && res.Results.length == '') {
                        this.msgBoxServ.showMessage("notice", ["no record found."]);
                    }
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                    this.loading = false;
                }
            });

    }
    OnFromToDateChange($event) {
        this.FromDate = $event ? $event.fromDate : this.FromDate;
        this.ToDate = $event ? $event.toDate : this.ToDate;
    }
    gridExportOptions = {
        fileName: 'SettlementSummaryReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    PHRMSettlementReportGridActions($event: GridEmitModel) {
        switch ($event.Action) {

            case "view":
                {
                    var data = $event.Data;
                    if (data.PatientId > 0) {
                        this.PatientId = data.PatientId;
                        this.GetPatientSettlementReport();
                        this.showPopup = true;

                    }

                }
                break;
            default:
                break;
        }
    }
    GetPatientSettlementReport() {
        this.pharmacyBLService.GetPatientWiseSettlementSummaryReport(this.FromDate, this.ToDate, this.PatientId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PatientInfo = res.Results.PatientInfo;
                    this.Settlements = res.Results.Settlements;
                    this.ReturnedSettlements = res.Results.ReturnedSettlement;
                    this.CashDiscount = res.Results.CashDiscount[0].CashDiscount;
                    this.CalculateAge();
                    this.calculateTotals();
                    if (res.Status == 'OK' && res.Results.length == '') {
                        this.msgBoxServ.showMessage("notice", ["no record found."]);
                    }
                }
                else {

                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });
    }

    ClosePopup() {
        this.showPopup = false;
    }

    calculateTotals() {
        this.collectionFromReceivableSummary = { TotalReceivable: 0, NetCollection: 0 };
        this.cashDiscountReceivedSummary = { TotalReturn: 0, NetReturnAmount: 0, TotalCashDiscount: 0 };
        if (this.Settlements && this.Settlements.length) {
            this.collectionFromReceivableSummary.TotalReceivable = this.Settlements.reduce((a, b) => a + b.Receivable, 0);
            this.collectionFromReceivableSummary.NetCollection = this.collectionFromReceivableSummary.TotalReceivable - this.CashDiscount;
        }

        if (this.ReturnedSettlements && this.ReturnedSettlements.length) {
            this.cashDiscountReceivedSummary.TotalReturn = this.ReturnedSettlements.reduce((a, b) => a + b.ReturnTotalAmount, 0);
            this.cashDiscountReceivedSummary.TotalCashDiscount = this.ReturnedSettlements.reduce((a, b) => a + b.DiscountReturnAmount, 0);
            this.cashDiscountReceivedSummary.NetReturnAmount = this.cashDiscountReceivedSummary.TotalReturn - this.cashDiscountReceivedSummary.TotalCashDiscount;
        }
    }
    public hotkeys(event) {
        if (event.keyCode == 27) {
            this.showPopup = false;
        }
    }
    public CalculateAge() {
        this.Age = CommonFunctions.GetFormattedAge(this.PatientInfo.DateOfBirth);
    }

    GetActiveDispensarylist() {
        this._dispensaryService.GetAllDispensaryList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.dispensaryList = JSON.parse(JSON.stringify(res.Results)); //Since, we have filter the dispensary list in client side.
                    this.dispensaryList.unshift({ StoreId: null, Name: 'All' });
                }
            })
    }
    DispensaryListFormatter(data: any): string {
        return data["Name"];
    }
    OnDispensaryChange() {
        let dispensary = null;
        if (!this.selectedDispensary) {
            this.StoreId = null;
        }
        else if (typeof (this.selectedDispensary) == 'string') {
            dispensary = this.dispensaryList.find(a => a.Name.toLowerCase() == this.selectedDispensary.toLowerCase());
        }
        else if (typeof (this.selectedDispensary) == "object") {
            dispensary = this.selectedDispensary;
        }
        if (dispensary) {
            this.StoreId = dispensary.StoreId;
        }
        else {
            this.StoreId = null;
        }
    }

}