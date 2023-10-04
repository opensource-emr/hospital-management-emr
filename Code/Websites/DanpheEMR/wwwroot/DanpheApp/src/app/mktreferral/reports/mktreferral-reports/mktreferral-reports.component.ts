import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { ReferralParty_DTO } from "../../Shared/DTOs/referral-party.dto";
import { ReferralReport_DTO } from "../../Shared/DTOs/referral-report.dto";
import { MarketingReferralBLService } from "../../Shared/marketingreferral.bl.service";
import { MarketingReferralService } from "../../Shared/marketingreferral.service";

@Component({
  selector: 'mktreferral-reports',
  templateUrl: './mktreferral-reports.component.html',
})

export class MarketingReferralDetailReportsComponent implements OnInit {

  public marketingReferralreportListGridColumns: Array<any> = null;
  public marketingReferralReportList: Array<ReferralReport_DTO> =
    new Array<ReferralReport_DTO>();
  public fromDate: string = "";
  public toDate: string = "";
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  loading: boolean;
  public mktReferralDetailReportValidator: FormGroup = null;
  referringPartyFormControl: FormControl;
  RefPartyObj: any
  public referringPartyList: ReferralParty_DTO[] = [];
  showSummary: boolean;
  public selectedReferringParty: ReferralParty_DTO = new ReferralParty_DTO();

  constructor(public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public mktReferralBLService: MarketingReferralBLService,


    public mktReferral: MarketingReferralService) {
    var _formBuilder = new FormBuilder();
    this.mktReferralDetailReportValidator = _formBuilder.group({
      'fromDate': ['', Validators.compose([Validators.required, this.dateValidatorsForPast])],
      'toDate': ['', Validators.compose([Validators.required, this.dateValidator])],
      'ReferringPartyId': []
    });
    this.referringPartyFormControl = this.mktReferralDetailReportValidator.get('ReferringPartyId') as FormControl; // Assign the FormControl
    this.marketingReferralreportListGridColumns = this.mktReferral.settingsGridCols.marketingReferralreportListGridCols;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('InvoiceDate', false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('EnteredOn', false));
  }

  ngOnInit() {
    this.GetReferringParty();
  }
  ReferringPartiesListFormatter(data: any): string {
    let html: string = "";
    html = "<font color='blue'; size=02 >" + data["ReferringPartyName"] + "&nbsp;&nbsp;" + ":" + "&nbsp;" + data["GroupName"].toUpperCase() + "</font>" + "&nbsp;&nbsp;";
    html += "(" + data["VehicleNumber"] + ")" + "&nbsp;&nbsp;" + data["ReferringOrganizationName"] + "&nbsp;&nbsp;";
    return html;
  }
  onReferringPartySelect(selectedReferringParty: ReferralParty_DTO) {
    this.referringPartyFormControl.setValue(selectedReferringParty); // Set the selected value to the FormControl
  }
  dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    if (control.value) {
      //if positive then selected date is of future else it of the past
      if ((moment(control.value).diff(currDate) > 0) ||
        (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }

  Load() {
    this.showSummary = false;
    this.changeDetector.detectChanges();

    if (this.fromDate && this.toDate) {

      const ReferringPartyId = this.RefPartyObj ? this.RefPartyObj.ReferringPartyId : null;
      this.GetMarketingReferralDetailReport(this.fromDate, this.toDate, ReferringPartyId);
    }
  }
  dateValidator(control: FormControl): { [key: string]: boolean } {
    let currDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    if (control.value) { // gets empty string for invalid date such as 30th Feb or 31st Nov)
      if ((moment(control.value).diff(currDate) > 0)
        || (moment(currDate).diff(control.value, 'years') > 200)) //can select date upto 200 year past from today.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }
  GetReferringParty() {
    this.mktReferralBLService.GetReferringParty().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results && res.Results.length > 0) {
            this.referringPartyList = res.Results;
          } else {
            this.referringPartyList = [];
          }
        } else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
            `Error: ${res.ErrorMessage}`,
          ]);
        }
      },
      (err: DanpheHTTPResponse) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [
          `Error: ${err.ErrorMessage}`,
        ]);
      }
    );
  }
  GetMarketingReferralDetailReport(fromDate, toDate, ReferringPartyId) {
    this.mktReferralBLService
      .GetMarketingReferralDetailReport(this.fromDate, this.toDate, ReferringPartyId)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.marketingReferralReportList = res.Results;
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
  logError(err: DanpheHTTPResponse) {
    throw new Error("Something went wrong, please debug for more information.");
  }
  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }
  gridExportOptions = {
    fileName: 'MarketingReferralDetailReport' + moment().format('YYYY-MM-DD') + '.xls'
  };
  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "Yes": {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["All items are Already returned from this invoice. You’re not allowed to enter the Commission Details",]);

        break;
      }

      default:
        break;
    }
  }
}

