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

@Component({
  selector: "lab-categorywise-item-count-report",
  templateUrl: "./categorywise-item-count-report.html",
  styleUrls: ["./total-count-report.css"],
})
export class RPT_LAB_CategoryWiseItemCountComponent {
  @Input("fromDate") public fromDate: any;
  @Input("toDate") public toDate: any;
  @Input("orderStatus")
  orderStatus:string='';
  reportData: Array<any> = [];
  public showCategoryDetail: boolean = false;
  public selectedCategory: any;
  public itemDataOfCategory: Array<any> = [];


  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService
  ) {}

  ngOnInit() {
    this.LoadCategoryData();
  }

  LoadCategoryData() {
    this.dlService
      .Read(
        "/Reporting/CategoryWiseLabItemCountLabReport?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate+"&orderStatus="+
          this.orderStatus
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
      this.reportData = res.Results;
    } else if (res.Status == "OK" && res.Results.length == 0) {
      this.msgBoxServ.showMessage("notice-message", [
        "No Data is Avaliable for Selected Parameters.....Try Different",
      ]);
    } else {
      this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    }
  }

  CategorySelected(category: any) {
    this.selectedCategory = category;
    this.showCategoryDetail = true;
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
}
