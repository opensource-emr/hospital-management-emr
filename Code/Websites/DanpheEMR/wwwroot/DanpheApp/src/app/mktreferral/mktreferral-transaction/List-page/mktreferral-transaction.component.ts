import { Component, OnInit } from "@angular/core";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { MarketingReferralInvoice_DTO } from "../../Shared/DTOs/referral-invoice.dto";
import { MarketingReferralBLService } from "../../Shared/marketingreferral.bl.service";
import { MarketingReferralService } from "../../Shared/marketingreferral.service";

@Component({
  selector: 'mktreferral-transaction',
  templateUrl: './mktreferral-transaction.component.html',
})

export class MarketingReferralTransactionComponent implements OnInit {
  public invoiceListGridColumns: Array<any> = null;
  public referralInvoiceList: Array<MarketingReferralInvoice_DTO> =
    new Array<MarketingReferralInvoice_DTO>();
  public AddNewReferal: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public ShowAddPage: boolean = false;
  public fromDate: string = "";
  public toDate: string = "";

  loading: boolean;;
  SelectedRowData: any;
  constructor(
    public msgBoxServ: MessageboxService,
    public mktReferralBLService: MarketingReferralBLService,
    public mktReferral: MarketingReferralService,
  ) {
    this.invoiceListGridColumns = this.mktReferral.settingsGridCols.InvoiceListGridCols;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', false));

  }

  ngOnInit() {
  }
  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "Yes": {
        if ($event.Data.NetAmount === 0) {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["All items are Already returned from this invoice. You’re not allowed to enter the Commission Details",]);
          this.ShowAddPage = false;
        }
        else {
          this.ShowAddPage = true;
          this.SelectedRowData = $event.Data;
        }
        break;
      }
      case "No": {
        if ($event.Data.NetAmount === 0) {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["All items are Already returned from this invoice. You’re not allowed to enter the Commission Details",]);
          this.ShowAddPage = false;
        }
        else {
          this.ShowAddPage = true;
          this.SelectedRowData = $event.Data;
        }
        break;
      }
      default:
        break;
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
        this.GetInvoice();
      } else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Please enter valid range",]);
      }
    }
  }
  GetInvoice() {
    this.mktReferralBLService
      .GetInvoiceList(this.fromDate, this.toDate)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.referralInvoiceList = res.Results;
            this.loading = false;
          } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [
              "Invoice not available",
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
    throw new Error("Something went wrong, please debug for more information.");
  }
  ClosePopUp() {
    this.ShowAddPage = false;
  }
  CloseAddPage($event): void {
    if ($event && $event.action === 'close') {
      this.ShowAddPage = false;
      this.GetInvoice();
    }
  }
}

