import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";

import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponses,
  ENUM_DateTimeFormat,
  ENUM_MessageBox_Status,
} from "../../../shared/shared-enums";
import { SchemeRefund_DTO } from "../../shared/DTOs/scheme-refund.dto";
import { UtilitiesBLService } from "../../shared/utilities.bl.service";
import { UtilitiesService } from "../../shared/utilities.service";

@Component({
  selector: "app-scheme-refund-list",
  templateUrl: "./scheme-refund-list.component.html",
  styleUrls: ["./scheme-refund-list.component.css"],
})
export class SchemeRefundListComponent implements OnInit, AfterViewInit {
  @Output("scheme-refund-print-callback")
  public schemerefundprintcallback = new EventEmitter<object>();
  public schemeRefundGridColumns: Array<any> = null;
  public SchemeRefundList: Array<SchemeRefund_DTO> =
    new Array<SchemeRefund_DTO>();
  public loading = false;
  public ShowSchemeReturnEntryPage: boolean;
  public printSchemeRefund: boolean = false;
  public receiptNo: number = null;
  public isSchemeRefund: boolean = false;
  public showReceipt: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  index: number;
  public dateRange: string = "";
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  printDetails: any;

  ngAfterViewInit() {
    this.setFocusOnInput();
  }

  constructor(
    public utilitiesServ: UtilitiesService,
    public utilitiesBlService: UtilitiesBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.schemeRefundGridColumns = this.utilitiesServ.settingsGridCols.SchemeRefundGridCols;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('RefundDate', false));
  }
  ngOnInit() {
  }
  // setFocusOnInput() {
  //   document.getElementById("id_patient_number").focus();
  // }
  GetSchemeRefund() {
    this.utilitiesBlService
      .GetSchemeRefund(this.fromDate, this.toDate)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.SchemeRefundList = res.Results;
            this.loading = false;
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
              "Refund Scheme not available",
            ]);
            this.loading = false;
          }
        },
        (err) => {
          this.logError(err);
          this.loading = false;
        }
      );
  }
  logError(err: any) {
    throw new Error("Method not implemented.");
  }

  setFocusOnInput() {
    setTimeout(() => {
      const inputField = document.getElementById("id_patient_number") as HTMLInputElement;
      if (inputField) {
        inputField.focus();
      }
    }, 0);
  }
  ShowAddNewPage(): void {
    this.ShowSchemeReturnEntryPage = true;
    this.setFocusOnInput();
  }
  CloseItemSettingsPage($event): void {
    if ($event && $event.action === 'close') {
      this.ShowSchemeReturnEntryPage = false;
      this.GetSchemeRefund();
    }
  }
  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (
        moment(this.fromDate).isBefore(this.toDate) ||
        moment(this.fromDate).isSame(this.toDate)
      ) {
        this.GetSchemeRefund();
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please enter valid From date and To date",]);
      }
    }
  }

  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "Print": {
        // this.index = this.SchemeRefundList.findIndex(
        //   (b) => b.SchemeId === $event.Data.SchemeId
        // );
        // $event.Data.IsActive = true;
        this.receiptNo = $event.Data.ReceiptNo;
        this.PrintSchemeRefund();
        break;
      }
      default:
        break;
    }
  }
  gridExportOptions = {
    fileName:
      "SchemeRefundDetail" + moment().format(ENUM_DateTimeFormat.Year_Month_Day) + ".xls",
  };
  SchemeRefundPrintCallBack($event) {
    if ($event) {
      if ($event.action === "GoBackToSchemeRefundPage") {
        this.isSchemeRefund = false;
      }
    }
  }
  CloseSchemeRefundReceiptPopUp() {
    this.showReceipt = false;
  }
  PrintSchemeRefund() {
    this.printSchemeRefund = true;
    this.showReceipt = true;
  }
}

