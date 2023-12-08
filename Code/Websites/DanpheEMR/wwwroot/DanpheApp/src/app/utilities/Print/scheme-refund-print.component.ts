import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { BillingBLService } from '../../billing/shared/billing.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { SecurityService } from '../../security/shared/security.service';
import { User } from '../../security/shared/user.model';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../settings-new/printers/printer-settings.model';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { SchemeRefund_DTO } from '../shared/DTOs/scheme-refund.dto';
import { UtilitiesBLService } from '../shared/utilities.bl.service';

@Component({
  selector: 'scheme-refund-print',
  templateUrl: './scheme-refund-print.component.html',
})
export class SchemeRefundPrintComponent implements OnInit {

  @Input("scheme-refund-receiptNo")
  public receiptNo: number;

  @Input("showReceipt")
  public showReceipt: boolean;
  public DateTimeNow: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);

  @Output("scheme-refund-print-callback")
  public schemerefundprintcallback = new EventEmitter<object>();
  //public currencyUnit: string;

  public CurrentUser: User = new User();
  public browserPrintContentObj: HTMLElement;
  public openBrowserPrintWindow: boolean;
  public loading: boolean;
  public fromDate: string = null;
  public toDate: string = null;

  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  schemeRefundDetails: any;
  depositId: number;
  public patientDetails: SchemeRefund_DTO = new SchemeRefund_DTO();
  public schemeRefundList: SchemeRefund_DTO = new SchemeRefund_DTO();
  schemePrintDetails: any;
  public FiscalYear: string = null;
  public localDate: string;
  public isSchemePrintDetailsLoaded: boolean = false;
  public printDetails: any;

  public EnableEnglishCalendarOnly: boolean = false;


  constructor(public msgBoxService: MessageboxService,
    public utilitiesBlService: UtilitiesBLService,
    public coreService: CoreService,
    public nepaliCalendarServ: NepaliCalendarService,
    public billingBLService: BillingBLService,
    public securityService: SecurityService,

    public changeDetector: ChangeDetectorRef) {
    this.GetCalendarParameter();

    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    //this.SetPrinterFromParam();
  }
  GetCalendarParameter(): void {
    const param = this.coreService.Parameters.find(p => p.ParameterGroupName === "Common" && p.ParameterName === "EnableEnglishCalendarOnly");
    if (param && param.ParameterValue) {
      const paramValue = JSON.parse(param.ParameterValue);
      this.EnableEnglishCalendarOnly = paramValue;
    }
  }

  ngOnInit() {
    this.GetSchemeRefund();
    this.GetDepositDetails();
    this.CurrentUser = this.securityService.GetLoggedInUser();
  }

  GetDepositDetails() {
    if (this.depositId) {
      this.utilitiesBlService.GetDepositDetails(this.depositId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.schemeRefundDetails = res.Results;
        }
      });

    }
  }
  GetSchemeRefund() {
    this.showReceipt = true;
    this.utilitiesBlService.GetSchemeRefundById(this.receiptNo).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.schemePrintDetails = res.Results;
          this.localDate = this.GetLocalDate(this.schemePrintDetails.CreatedOn);
          this.loading = false;
          this.isSchemePrintDetailsLoaded = true;
        } else {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "Refund Scheme details not available",
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

  GetLocalDate(engDate: string): string {
    if (this.EnableEnglishCalendarOnly) {
      return null;
    } else {
      let npDate = this.nepaliCalendarServ.ConvertEngToNepDateString(engDate);
      // return npDate + " BS";
      return `(${npDate} BS)`;
    }
  }
  logError(err: any): void {
    console.log(err);
  }
  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  OnPrinterChanged($event) {
    this.selectedPrinter = $event;
  }
  GoBackToSchemeRefundPage() {
    this.schemerefundprintcallback.emit({ action: "GoBackToSchemeRefundPage" });
  }
  public print() {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.printDetails = document.getElementById("id_print_scheme_refund");
      this.openBrowserPrintWindow = false;
      this.openBrowserPrintWindow = true;
      this.loading = false;
      this.GoBackToSchemeRefundPage();
    }
    else {
      this.loading = false;
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Printer Not Supported."]);
    }
  }
}
