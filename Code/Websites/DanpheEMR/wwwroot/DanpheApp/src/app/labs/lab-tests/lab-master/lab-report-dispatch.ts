import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { PatientService } from "../../../patients/shared/patient.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../../shared/labs.bl.service";
import { LabMasterModel, Requisition } from "../../shared/labMasterData.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { LabPendingResultVM } from "../../shared/lab-view.models";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { LabTestFinalReportModel, LabTestsInFinalReportModel } from '../../shared/lab-finalreport.VM';
import { LabReportVM } from "../../reports/lab-report-vm";
import { LabComponentModel } from '../../shared/lab-component-json.model';
import { SecurityService } from "../../../security/shared/security.service";
import { LabCategoryModel } from "../../shared/lab-category.model";

@Component({
  templateUrl: "./lab-report-dispatch.html",
  styleUrls: ['./lab-report-dispatch.css']
})

export class LabReportDispatchComponent {
  public reportList: Array<any>;
  public reportListFiltered: Array<any>;

  public loading: boolean = false;

  public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };
  public showSelector: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public rangeType: string = "last1Week";
  public showLabel: boolean = false;
  public isOutOfFiscalYearDate: boolean = false;

  public searchString: string = null;
  public showSelectedPatTestDetail: boolean = false;

  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public selectedCategory: Array<any> = new Array<any>();

  public timeId: any;
  public catIdList: Array<number> = new Array<number>();
  public isInitialLoad: boolean = true;

  // public timeIdForDAte: any;
  public patientId: number;
  public page: number = 1;

  constructor(public patientService: PatientService, public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef, public securityService: SecurityService,
    public labBLService: LabsBLService) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    document.getElementById('searchBxLabReport').focus();
  }



  public GetPendingReportList() {
    this.isInitialLoad = false;
    this.loading = true;
    if (this.fromDate != null && this.toDate != null && (this.catIdList.length > 0)) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        let isForLabMasterPage = true;
        this.reportListFiltered = [];
        this.showSelectedPatTestDetail = false;
        this.labBLService.GetPatientListForReportDispatch(this.fromDate, this.toDate, this.catIdList)
          .subscribe((res: DanpheHTTPResponse) => {
            if (res.Status == "OK") {
              this.loading = false;
              this.reportList = res.Results;
              this.reportListFiltered = res.Results;
              this.showSelectedPatTestDetail = false;
              if (!res.Results || !res.Results.length) {
                this.msgBoxService.showMessage('warning', ['No patient data found']);
              }
            }
            else {
              this.msgBoxService.showMessage('failed', ['Unable to get Patient data']);
              console.log(res.ErrorMessage);
              this.loading = false;
            }
          });
      }
    } else {
      if (!this.catIdList || !this.catIdList.length) {
        this.msgBoxService.showMessage('failed', ['Please select at least one category']);
      }
      this.loading = false;
    }
  }

  public SelectUnselectRow(report) {
    this.reportList.forEach(val => {
      val['IsSelected'] = false;
    });

    report.IsSelected = true;

    this.patientId = report.PatientId;
    this.showSelectedPatTestDetail = false;
    this.changeDetector.detectChanges();
    this.showSelectedPatTestDetail = true;

    this.patientService.getGlobal().PatientId = report.PatientId;
    this.patientService.getGlobal().ShortName = report.PatientName;
    this.patientService.getGlobal().PatientCode = report.PatientCode;
    this.patientService.getGlobal().DateOfBirth = report.DateOfBirth;
    this.patientService.getGlobal().Gender = report.Gender;
    this.patientService.getGlobal().WardName = report.WardName;

  }

  public FilterDataByCategory() {
    var allCategoryIds = [];
    if (this.selectedCategory && this.selectedCategory.length) {
      this.selectedCategory.forEach(val => {
        allCategoryIds.push(val.TestCategoryId);
      });
      this.reportListFiltered = this.reportList.filter(report => {
        var existInFilteredList = false;
        report.Tests.forEach(test => {
          if (allCategoryIds.includes(test.LabCategoryId)) {
            existInFilteredList = true;
          }
        });
        return existInFilteredList;
      });

    } else {
      this.reportListFiltered = this.reportList.slice();
    }
    this.reportListFiltered = this.reportListFiltered.slice();
    if (this.reportListFiltered.length) {
      this.showSelectedPatTestDetail = false;
    }
  }

  public CategoryOnChange($event) {
    this.catIdList = [];
    if ($event && $event.length) {
      $event.forEach(v => {
        this.catIdList.push(v.TestCategoryId);
      })
    }
    // if (this.timeId) {
    //   window.clearTimeout(this.timeId);
    //   this.timeId = null;
    // }
    // this.timeId = window.setTimeout(() => {
    //   this.GetPendingReportList();
    // }, 300);
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    // if (!this.isInitialLoad) {
    //   if (this.timeIdForDAte) {
    //     window.clearTimeout(this.timeIdForDAte);
    //     this.timeIdForDAte = null;
    //   }
    //   this.timeIdForDAte = window.setTimeout(() => {
    //     this.GetPendingReportList();
    //   }, 300);
    // }
  }

  GetFormattedAgeSex(dateOfBirth: string, gender: string) {
    if (dateOfBirth && gender && (dateOfBirth.trim() != '') && (gender.trim() != ''))
      return CommonFunctions.GetFormattedAgeSex(dateOfBirth, gender);
  }
}
