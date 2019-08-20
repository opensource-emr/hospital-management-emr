import { Component, Input, Output, EventEmitter, Directive, ViewChild } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { Patient } from "../../../patients/shared/patient.model";
import * as moment from 'moment/moment';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service"
import { CoreService } from "../../../core/shared/core.service";
import { RPT_ADT_DischargedPatientModel } from "../../../reporting/adt/discharge/discharged-patient.model";


@Component({
    selector: "discharge-bill-breakup",
    templateUrl: "./ip-discharge-bill-breakup.html"
})
export class IPDischargeBillBreakupComponent {

    public showDischargeBillBreakup: boolean = false;
    @Input("DischargedPat")
    public disPat: RPT_ADT_DischargedPatientModel;

    @Output("on-bill-closed")
    public onClose = new EventEmitter<object>();

    public patient: any;
    public hospitalName: any;
    public address: any;
    public tel: any;

    public isPageLoaded: boolean = false;

    public dischargeBillBreakupRPT: DischargeBillBreakupReport = new DischargeBillBreakupReport();
    constructor(
        public msgBoxServ: MessageboxService,
        public patientService: PatientService,
        public dlService: DLService,
        public coreService: CoreService
    ) {

    }

    ngOnInit() {
        if (this.disPat) {
            let visitId = this.disPat.VisitId;
            if (visitId > 0) {
                this.GetPatDischargeBillBreakupReport(visitId, this.disPat.PatientId)
            }
        } else {
            this.ClosePopup();
        }
    }


    public GetPatDischargeBillBreakupReport(visitId: number, patientId: number) {
        this.dlService.Read("/Reporting/DischargedPatientBillBreakup?VisitId=" + visitId + "&PatientId=" + patientId)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK" && res.Results) {
                    this.isPageLoaded = true;
                    this.patient = res.Results.Patient.Patient;
                    this.MapReportData(res.Results.ReportData);
                    let s = this.dischargeBillBreakupRPT;
                    let custHeader = this.coreService.Parameters.find(s => s.ParameterName == "CustomerHeader").ParameterValue;
                    this.hospitalName = JSON.parse(custHeader).hospitalName;
                    this.address = JSON.parse(custHeader).address;
                    this.tel = JSON.parse(custHeader).tel;
                    this.showDischargeBillBreakup = true;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                    this.ClosePopup();
                }
            });
    }

    MapReportData(reportData: any) {
        let deptNamesList = reportData.map(itm => itm.departmentName).filter((value, index, self) => self.indexOf(value) === index);
        if (deptNamesList) {
            deptNamesList.forEach(i => {
                let tempData = new DischargeBillVM();
                tempData.departmentName = i;
                tempData.itemList = reportData.filter(t => t.departmentName == i);
                tempData.calculationpart = this.calculate(tempData.itemList)
                this.dischargeBillBreakupRPT.reportData.push(tempData);
            });
            this.finalCalculation();
        }
    }
    public calculateSubTotalTotal() {

    }

    ClosePopup() {

        this.showDischargeBillBreakup = false;
      this.disPat = new RPT_ADT_DischargedPatientModel();
        this.patient = null;
        this.dischargeBillBreakupRPT = new DischargeBillBreakupReport();
        this.isPageLoaded = false;
        this.onClose.emit({ close: true });
       
    }


    public Print() {
        try {
            let popupWinindow;
            var printContents = document.getElementById("printpage").innerHTML;
            popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWinindow.document.open();

            let documentContent = "<html><head>";
            documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
            documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
            documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
            documentContent += '</head>';
            documentContent += '<body onload="window.print()">' + printContents + '</body></html>'

            popupWinindow.document.write(documentContent);
            popupWinindow.document.close();
        } catch (ex) {
            console.log(ex);
        }
    }
    public calculate(itemList: any) {
        let tempCal = new SubTotalModel();
        itemList.forEach(itm => {

            tempCal.qty = tempCal.qty + itm.qty;
            tempCal.amount = tempCal.amount + itm.amount;
            tempCal.subTotal = tempCal.subTotal + itm.subTotal;
            tempCal.discount = tempCal.discount + itm.discount;
            tempCal.total = tempCal.total + itm.total;
            tempCal.vat = tempCal.vat + itm.vat;
        });
        return tempCal;
    }
    public finalCalculation() {
        this.dischargeBillBreakupRPT.reportData.forEach(i => {
            this.dischargeBillBreakupRPT.amount = i.calculationpart.amount + this.dischargeBillBreakupRPT.amount;
            this.dischargeBillBreakupRPT.total = i.calculationpart.total + this.dischargeBillBreakupRPT.total;
            this.dischargeBillBreakupRPT.subTotal = i.calculationpart.subTotal + this.dischargeBillBreakupRPT.subTotal;
            this.dischargeBillBreakupRPT.discount = i.calculationpart.discount + this.dischargeBillBreakupRPT.discount;
            this.dischargeBillBreakupRPT.vat = i.calculationpart.vat + this.dischargeBillBreakupRPT.vat;
        });
    }
}

export class DischargeBillBreakupReport {
    public amount: number = 0;
    public discount: number = 0;
    public subTotal: number = 0;
    public taxable: number = 0;
    public vat: number = 0;
    public nonTaxable: number = 0;
    public total: number = 0;
    public deposit: number = 0;
    public totalPayment: number = 0;
    public reportData: Array<DischargeBillVM> = new Array<DischargeBillVM>();
}
export class DischargeBillVM {
    public departmentName: string = null;
    public itemList: Array<SubTotalModel> = new Array<SubTotalModel>();
    public calculationpart: SubTotalModel = new SubTotalModel();
}
export class SubTotalModel {
    public billDate: string = null;
    public description: string = null;
    public qty: number = 0;
    public amount: number = 0;
    public discount: number = 0;
    public subTotal: number = 0;
    public vat: number = 0;
    public total: number = 0;
}



