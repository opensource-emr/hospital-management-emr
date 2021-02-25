import { Component, Directive, ViewChild } from '@angular/core';
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { RPT_BIL_NeighbourCardModel } from "./neighbour-card.model";
import * as moment from 'moment/moment';
import { DLService } from "../../../shared/dl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./neighbour-card-details.html"
})
export class RPT_BIL_PatNeighbourCardReportComponent {

  public FromDate: Date = null;
  public ToDate: Date = null;

  PatientNeighbourhoodCardDetailsColumns: Array<any> = null;
  PatientNeighbourhoodCardDetailsData: Array<any> = new Array<RPT_BIL_NeighbourCardModel>();
  public currentneighbourcard: RPT_BIL_NeighbourCardModel = new RPT_BIL_NeighbourCardModel();
  dlService: DLService = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(_dlService: DLService, public msgBoxServ: MessageboxService, public reportServ: ReportingService) {
    this.dlService = _dlService;
    this.currentneighbourcard.FromDate = moment().format('YYYY-MM-DD');
    this.currentneighbourcard.ToDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("IssuedDate", false));
  }


  gridExportOptions = {
    fileName: 'PatientNeighbourhoodCardDetailsList_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Load() {
    if (this.currentneighbourcard.FromDate != null && this.currentneighbourcard.ToDate != null) {
      this.dlService.Read("/BillingReports/PatientNeighbourhoodCardDetail?FromDate="
        + this.currentneighbourcard.FromDate + "&ToDate=" + this.currentneighbourcard.ToDate)
        .map(res => res)
        .subscribe(res => this.Success(res),
          res => this.Error(res));
    } else {
      this.msgBoxServ.showMessage("error", ['Dates Provided is not Proper']);
    }  

  }
  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);


  }
  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {
      this.PatientNeighbourhoodCardDetailsColumns = this.reportServ.reportGridCols.PatientNeighbourhoodCardDetailsReport;
      this.PatientNeighbourhoodCardDetailsData = res.Results;
    }
    else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected Parameters...Try Different'])
      this.PatientNeighbourhoodCardDetailsColumns = this.reportServ.reportGridCols.PatientNeighbourhoodCardDetailsReport;
      this.PatientNeighbourhoodCardDetailsData = res.Results;
    }
    else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }

  }

  //on click grid export button we are catching in component an event.. 
  //and in that event we are calling the server excel export....
  OnGridExport($event: GridEmitModel) {
    this.dlService.ReadExcel("/ReportingNew/ExportToExcelPatientNeighbourhoodCardDetails?FromDate="
      + this.currentneighbourcard.FromDate + "&ToDate=" + this.currentneighbourcard.ToDate)
      .map(res => res)
      .subscribe(data => {
        let blob = data;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "PatientNeighbourhoodCardDetails_" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
        document.body.appendChild(a);
        a.click();
      },

        res => this.ErrorMsg(res));
  }
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.currentneighbourcard.FromDate = $event.fromDate;
    this.currentneighbourcard.ToDate =  $event.toDate;

  }
}
