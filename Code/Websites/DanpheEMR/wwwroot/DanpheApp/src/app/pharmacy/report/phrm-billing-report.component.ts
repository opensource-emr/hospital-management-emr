import { Component, Directive, ViewChild } from '@angular/core';
import { DLService } from "../../shared/dl.service"
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { PharmacyBLService } from "../shared/pharmacy.bl.service";
import PHRMReportsGridColumns from "../shared/phrm-reports-grid-columns";
import { PHRMReportsModel } from '../shared/phrm-reports-model';

@Component({
    selector: 'my-app',
    templateUrl: "../../view/pharmacy-view/Report/PHRMBillingReport.html" //"/PharmacyReport/PharmacyBillingReport"
})
export class PHRMBillingReportComponent {

    ///Pharmacy Billing Report Columns variable
    PHRMBillingReportColumns: Array<any> = null;
    ///Pharmacy Billing Report Data variable
    PHRMBillingReportData: Array<any> = new Array<any>();
  ////Variable to Bind Item Name
   public InvoiceNumber: number = 0;
  public phrmReports: PHRMReportsModel = new PHRMReportsModel();

  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService, public msgBoxServ: MessageboxService)
  {
      this.PHRMBillingReportColumns = PHRMReportsGridColumns.PHRMBillingReport;
      this.phrmReports.FromDate = moment().format('YYYY-MM-DD');
      this.phrmReports.ToDate = moment().format('YYYY-MM-DD');
      this.InvoiceNumber = null;
    }


    //////Export data grid options for excel file
    gridExportOptions = {
        fileName: 'BillingReport_' + moment().format('YYYY-MM-DD') + '.xls',
    };

    //////Function Call on Button Click of Report
    GetReportData() {
      if (this.phrmReports.FromDate && this.phrmReports.ToDate) {
        this.pharmacyBLService.GetPharmacyBillingReport(this.phrmReports, this.InvoiceNumber)
                .subscribe(res => {
                    if (res.Status == 'OK' && res.Results.length > 0) {
                        ////Assign report Column from GridConstant to PHRMBillingReportColumns
                        this.PHRMBillingReportColumns = PHRMReportsGridColumns.PHRMBillingReport;
                        ////Assign  Result to PHRMBillingReportData
                        this.PHRMBillingReportData = res.Results;
                    }
                    if (res.Status == 'OK' && res.Results.length == 0) {
                        this.msgBoxServ.showMessage("error", ["No Data is Available for Selected Record"]);
                        this.PHRMBillingReportData = [];
                    }

                });
        }
        //else
        //{
        //    this.msgBoxServ.showMessage("error", ["0 Invoice Id is Wrong "]);
        //    this.PHRMBillingReportData = [];
      }
      




    ////on click grid export button we are catching in component an event.. 
    ////and in that event we are calling the server excel export....
    OnGridExport($event: GridEmitModel) {
        this.dlService.ReadExcel("/PharmacyReport/ExportToExcelPHRMBillingReport?InvoiceNumber=" + this.InvoiceNumber)
            .map(res => res)
            .subscribe(data => {
                let blob = data;
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "BillingReport" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
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






