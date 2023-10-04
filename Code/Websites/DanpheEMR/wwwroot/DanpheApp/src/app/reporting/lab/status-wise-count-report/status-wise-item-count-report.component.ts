import {
  Component,
  Directive,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { ReportingService } from "../../shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import * as moment from "moment/moment";
import { CoreService } from "../../../core/shared/core.service";
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./status-wise-item-count.report.html"
})
export class RPT_LAB_StatusWiseItemCountComponent {
  StatusWiseItemCountColumns: Array<any> = null;
  StatusWiseItemCountData: Array<any> = null;
  public fromDate: any;
  public toDate: any;
  reportData: Array<any> = [];
  public showGrid: boolean = false;
  public selectedCategory: any;
  public itemDataOfCategory: Array<any> = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public dateRange:string = "";
  public statusAbove:number =0;
  public orderStatus={statusList: ''};
  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService
  ) {
    this.StatusWiseItemCountColumns = this.reportServ.reportGridCols.StatusWiseItemCount;
    this.NepaliDateInGridSettings = new NepaliDateInGridParams();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("RequestedOn", true));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("BillCancelledOn", true));
   }

  ngOnInit() {
    //this.LoadCategoryData();
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.dateRange="<b>Date:</b>&nbsp;"+this.fromDate+"&nbsp;<b>To</b>&nbsp;"+this.toDate;
  }


  Load() {    
    this.dlService
      .Read(
        "/Reporting/TestStatusDetailReport?FromDate=" +
        this.fromDate +
        "&ToDate=" +
        this.toDate+
        "&orderStatus="+
        this.orderStatus.statusList
      )
      .map((res) => res)
      .subscribe(
        (res) => this.Success(res),
        (err) => this.Error(err)
      );
  }

  Error(err) {
    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
  }

  Success(res) {
    if (res.Status == "OK" && res.Results.length > 0) {      
      this.StatusWiseItemCountData = res.Results;
      this.showGrid = true;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
      this.StatusWiseItemCountData =[];
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  print() {
    let popupWinindow;
    var printContents = document.getElementById("printPage").innerHTML;
    //var HeaderContent = document.getElementById("headerForPrint").outerHTML;
    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent +=
      '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent +=
      '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default/DanpheStyle.css"/>';
    documentContent +=
      '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += `</head><style> .non-printable { visibility: hidden; }.cat-tbl thead tr th,
        .cat - tbl tbody tr td {
      padding: 5px;
      font - size: 12px;
    }
.cat-tbl tbody tr td,
.cat-tbl tbody tr td a {
      font-weight: normal;
      color: #000;
    }
.cat-tbl-holder {
       margin-top: 15px; 
    }
.lft-ttx {
      line - height: 3;
    }
.ctr-txt{
      font-size: 24px;
      line-height: 36px;
    }</style>`;

    documentContent +=
      '<body onload="window.print()">' +
      // HeaderContent +
      printContents +
      "</body></html>";
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  gridExportOptions = {
    fileName: 'TestStatusDetailReport_' + moment().format('YYYY-MM-DD') + '.xls',
    //displayColumns: ['PatientCode', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber']
  };
}
