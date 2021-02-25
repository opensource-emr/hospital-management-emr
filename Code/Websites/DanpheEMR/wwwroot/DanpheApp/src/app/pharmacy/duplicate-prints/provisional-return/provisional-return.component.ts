import { Component } from '@angular/core';
import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { PHRMInvoiceItemsModel } from '../../shared/phrm-invoice-items.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PHRMPatient } from '../../shared/phrm-patient.model';
import * as moment from 'moment/moment';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
@Component({
    templateUrl: './provisional-return.html'
})
export class PHRMProvisionalReturnComponent {

    public ProvisionalReturnListGrid: any;
    public provisionalBillsSummary: Array<any> = [];
    public provisionalBillFiltered: Array<any> = [];
    public remarks: string = null;
    public isPrint: boolean = false;
    public currSaleItemsRetOnly: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
    public fromDate: string = null;
    public toDate: string = null;
    public dateRange: string = "last1Week"; 
    public total: number = 0;
    public showSaleItemsPopup: boolean = false;
    public currentPatient: PHRMPatient = new PHRMPatient();
    public TransactionDate: string = null;
    public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public msgBoxServ: MessageboxService
    ) {
        this.ProvisionalReturnListGrid = PHRMGridColumns.ProvisionalReturnList;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
        this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastCreditBillDate', false));
        this.GetAllProvisionalReturn();
    }

    //gets summary of all patients
    GetAllProvisionalReturn(): void {
        try {
            this.pharmacyBLService.GetAllProvisionalReturn(this.fromDate, this.toDate)
                .subscribe(res => {
                    if (res.Status == 'OK') {
                        this.provisionalBillsSummary = res.Results;
                        this.provisionalBillFiltered = this.provisionalBillsSummary;
                    }
                    else {
                        this.logError(res.ErrorMessage);
                    }
                },
                );
        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    logError(err: any) {
        this.msgBoxServ.showMessage("error", [err]);
        console.log(err);
    }

    onGridDateChange($event) {

        this.fromDate = $event.fromDate;
        this.toDate = $event.toDate;
        if (this.fromDate != null && this.toDate != null) {
          if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
            this.GetAllProvisionalReturn();
          } else {
            this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
          }
    
        }
    
     }

    CreditBillGridActions($event: GridEmitModel) {
        switch ($event.Action) {

            case "view": {
                if ($event.Data != null) {
                    this.currentPatient = new PHRMPatient();
                    let CreditData = $event.Data;
                    this.currentPatient.PatientCode = CreditData.PatientCode;
                    this.currentPatient.ShortName = CreditData.ShortName;
                    this.currentPatient.DateOfBirth = CreditData.DateOfBirth;
                    this.currentPatient.Gender = CreditData.Gender;
                    this.currentPatient.Address = CreditData.Address;
                    this.currentPatient.CountrySubDivisionName = CreditData.CountrySubDivisionName;
                    this.currentPatient.PhoneNumber = CreditData.PhoneNumber;
                    this.currentPatient.PANNumber = CreditData.PANNumber;
                    this.currentPatient.Age = CreditData.Age;
                    this.GetAllProvisionalReturnDuplicatePrint(CreditData.PatientId);
                }
                break;
            }
            default:
                break;
        }
    }
    GetAllProvisionalReturnDuplicatePrint(PatientId) {
        this.pharmacyBLService.GetAllProvisionalReturnDuplicatePrint(PatientId)
            .subscribe((res: DanpheHTTPResponse) => {
                this.CallBackupdaeInvoice(res);
            });
    }

    CallBackupdaeInvoice(res) {
        try {
            if (res.Status == "OK") {
                this.total = 0;
                var resData = res.Results;
                this.currSaleItemsRetOnly = resData;

                this.currSaleItemsRetOnly.forEach(sum => {
                    this.total += sum.TotalAmount;
                });
                this.remarks = "";
                this.TransactionDate = resData[0].CreatedOn;
                this.showSaleItemsPopup = true;
            }
            else {
                // this.messageboxService.showMessage("failed", [res.ErrorMessage]);
                //this.loading = false;
            }
        }
        catch (exception) {
            // this.ShowCatchErrMessage(exception);
        }

    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    Close() {
        this.showSaleItemsPopup = false;
    }
    print() {
        let popupWinindow;
        var printContents = document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=1600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        //popupWinindow.document.write('<html><head><link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

        popupWinindow.document.close();
        this.showSaleItemsPopup = false;
    }
}
