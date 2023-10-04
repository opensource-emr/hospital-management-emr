import {
  Component,
  Directive,
  ViewChild,
  ChangeDetectorRef,
} from "@angular/core";
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from "@angular/forms";
import { ReportingService } from "../../shared/reporting-service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { DLService } from "../../../shared/dl.service";
import * as moment from "moment/moment";
import { NepaliDate } from "../../../shared/calendar/np/nepali-dates";
import { NepaliCalendarService } from "../../../shared/calendar/np/nepali-calendar.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  templateUrl: "./lab-total-count-report.html",
})
export class RPT_LAB_TotalCategogyAndItemCountComponent {
  reportDate: ReportDateInLabModel = new ReportDateInLabModel();
  showReportCategoryWise: boolean = false;
  showReportItemWise: boolean = false;
  public selectedCategoryId: number = null;
  public statusAbove:number =0;
  public orderStatus={statusList: ''};
  constructor(
    public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public npCalendarService: NepaliCalendarService,
    public reportServ: ReportingService,
    public coreservice: CoreService,
    public changeDetector: ChangeDetectorRef
  ) {
    this.reportDate.fromDate = moment().format("YYYY-MM-DD");
    this.reportDate.toDate = moment().format("YYYY-MM-DD");
    this.reportDate.reportType = "category";
  }

  Load() {
    this.showReportCategoryWise = false;
    this.showReportItemWise = false;
    this.changeDetector.detectChanges();
    switch (this.reportDate.reportType) {
      case "category":
        this.showReportCategoryWise = true;
        break;

      case "item":
        this.showReportItemWise = true;
        break;

      default:
        this.msgBoxServ.showMessage("error", [
          "type not set, Please set the type",
        ]);
        break;
    }
  }

  categoryClicked($event) {
    if ($event && $event.selectedCatId) {
      this.selectedCategoryId = $event.selectedCatId;
      this.reportDate.reportType = "item";
      this.Load();
    }
  }

  //Anjana:11June'20--reusable From-ToDate-In Reports..
  //Anjana:10June'20--reusable From-ToDate-In Reports..
  OnFromToDateChange($event) {
    this.reportDate.fromDate = $event.fromDate;
    this.reportDate.toDate = $event.toDate;
  }
}

export class ReportDateInLabModel {
  public fromDate: string = "";
  public toDate: string = "";
  public reportType: string = "";
  public ReportDateValidator: FormGroup = null;
  constructor() {
    var _formBuilder = new FormBuilder();
    this.ReportDateValidator = _formBuilder.group({
      fromDate: [
        "",
        Validators.compose([Validators.required, this.dateValidatorsForPast]),
      ],
      toDate: [
        "",
        Validators.compose([Validators.required, this.dateValidator]),
      ],
    });
  }

  dateValidator(control: FormControl): { [key: string]: boolean } {
    var currDate = moment().format("YYYY-MM-DD HH:mm");
    if (control.value) {
      // gets empty string for invalid date such as 30th Feb or 31st Nov)
      if (
        moment(control.value).diff(currDate) > 0 ||
        moment(currDate).diff(control.value, "years") > 200
      )
        //can select date upto 200 year past from today.
        return { wrongDate: true };
    } else return { wrongDate: true };
  }

  dateValidatorsForPast(control: FormControl): { [key: string]: boolean } {
    //get current date, month and time
    var currDate = moment().format("YYYY-MM-DD");
    if (control.value) {
      //if positive then selected date is of future else it of the past
      if (
        moment(control.value).diff(currDate) > 0 ||
        moment(control.value).diff(currDate, "years") < -200
      )
        // this will not allow the age diff more than 200 is past
        return { wrongDate: true };
    } else return { wrongDate: true };
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) return this.ReportDateValidator.dirty;
    else return this.ReportDateValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.ReportDateValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) return this.ReportDateValidator.valid;
    else return !this.ReportDateValidator.hasError(validator, fieldName);
  }
  
}
