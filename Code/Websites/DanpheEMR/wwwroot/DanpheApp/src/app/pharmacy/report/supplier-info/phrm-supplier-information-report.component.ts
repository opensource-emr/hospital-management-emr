import { Component, Directive, ViewChild } from '@angular/core';


import { PHRMReportsModel } from "../../shared/phrm-reports-model"
import { DLService } from "../../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../../shared/phrm-reports-grid-columns";

@Component({
    templateUrl: "./phrm-supplier-information-report.html"
})
export class PHRMSupplierInformationReportComponent {


    PHRMSupplierInformationReportColumns: Array<any> = null;
    PHRMSupplierInformationReportData: Array<any> = new Array<any>();
    public phrmReports: PHRMReportsModel = new PHRMReportsModel();



    constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
        public msgBoxServ: MessageboxService) {
        this.PHRMSupplierInformationReportColumns = PHRMReportsGridColumns.PHRMSupplierInfoReport;
        this.Load();
    }

    ////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'PharmacySupplierInfoReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };
    Load() {
        this.pharmacyBLService.GetSupplierInformationReportList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.PHRMSupplierInformationReportColumns = PHRMReportsGridColumns.PHRMSupplierInfoReport;
                    this.PHRMSupplierInformationReportData = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage])
                }
            });

    }

    //on click grid export button we are catching in component an event.. 
    //and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMSupplierInfoReport")
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "PharmacySupplierInfoReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
                document.body.appendChild(a);
                a.click();
            },

            res => this.ErrorMsg(res));
    }
    ErrorMsg(err) {
        this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
        console.log(err.ErrorMessage);
    }






}






