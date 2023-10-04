import { Component, Directive, ViewChild, Input, OnInit } from "@angular/core";
import { ReportingService } from "../../shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import * as moment from "moment/moment";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: "lab-item-count-report",
  templateUrl: "./itemwise-count-report.html",
  styleUrls: ["./total-count-report.css"],
})
export class RPT_LAB_ItemCountComponent {
  @Input("fromDate") public fromDate: any;
  @Input("toDate") public toDate: any;

  @Input("categoryId") public categoryId: any = null;
  @Input("category") public category: any = null;
  @Input("orderStatus")
  orderStatus:string='';
  reportData: Array<any> = [];
  showExcelExport: boolean = true;

  itemCountReportColumn: Array<any> = [
    { headerName: "Category Name", field: "TestCategoryName", width: 150 },
    { headerName: "Test Name", field: "LabTestName", width: 125 },
    { headerName: "Total Count", field: "TotalCount", width: 150 },
  ];

  exportOptions: any = {
    fileName: "",
    customHeader: "",
  };

  fileName: string = "LabItemCount-report";
  customHeader: string = "Lab Item Count Report";

  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public coreservice: CoreService
  ) {
    this.exportOptions.fileName += moment()
      .format("YYYY-DD-MM hh:mm")
      .toString();
  }

  ngOnInit() {
    if (this.category && this.category.TestCategoryId) {
      this.categoryId = this.category.TestCategoryId;
      this.exportOptions.fileName = this.fileName + " of " + this.category.TestCategoryName;
      this.exportOptions.customHeader = this.fileName + " of " + this.category.customHeader;
    }
    this.LoadItemData();
  }

  LoadItemData() {
    this.dlService
      .Read(
        "/Reporting/ItemWiseLabItemCountLabReport?FromDate=" +
          this.fromDate +
          "&ToDate=" +
          this.toDate +
          "&categoryId=" +
          this.categoryId+
          "&orderStatus="+
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
}
