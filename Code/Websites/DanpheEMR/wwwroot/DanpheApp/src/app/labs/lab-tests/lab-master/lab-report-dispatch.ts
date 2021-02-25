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
  public showPreviewButton: boolean = false;

  public selectedReport: LabTestFinalReportModel = new LabTestFinalReportModel();
  public requisitionIdList: Array<number> = new Array<number>();
  

  public showAddEditResult: boolean = false;
  public showReport: boolean = false;
  public enableEdit: boolean = false;
  public showHeader: boolean = false;
  public showSignatories: boolean = true;
  public printReportFromGrid: boolean = false;
  public labReportFormat: string = 'format1';
  public templateReport: LabReportVM = null;
  public LabHeader: any = null;
  public showRangeInRangeDescription: boolean = false;
  public defaultColumns = { "Name": true, "Result": true, "Range": true, "Method": false, "Unit": true, "Remarks": false };
  public allCategories: Array<LabCategoryModel> = new Array<LabCategoryModel>();
  public selectedCategory: Array<any> = new Array<any>();

  constructor(public patientService: PatientService, public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef, public securityService: SecurityService,
    public labBLService: LabsBLService) {
    this.showRangeInRangeDescription = this.coreService.EnableRangeInRangeDescriptionStep();
    this.RangeTypeOnChange();
    this.labReportFormat = this.coreService.GetLabReportFormat();
    this.GetAllLabCategory();
  }

  ngOnInit() {
    this.LabHeader = this.coreService.GetLabReportHeaderSetting();
    this.showHeader = this.LabHeader.showLabReportHeader;
  }

  ngAfterViewInit() {
    document.getElementById('searchBxLabReport').focus();
  }

  public LoadLabReports() {
    //remove hardcoded id: 1 from below and pass correct one.
    //or pass list of requisitionIds as per necessity
    this.labBLService.GetReportFromReqIdList(this.requisitionIdList)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.templateReport = res.Results;
          this.MapSequence();
          this.requisitionIdList = [];
          this.showReport = true;
          //below below should be called only when 
        }
        else {
          this.msgBoxService.showMessage("failed", ["Unable to get lab reports."]);
          console.log(res.ErrorMessage);
        }

      });
  }

  public MapSequence() {

    var dob = this.templateReport.Lookups.DOB;
    var patGender = this.templateReport.Lookups.Gender;
    var patAge = CommonFunctions.GetFormattedAge(dob);

    patAge = patAge.toUpperCase();

    var indicator: string = 'normal';


    if (patAge.includes('Y')) {
      var ageArr = patAge.split('Y');
      var actualAge = Number(ageArr[0]);
      //Patient is not child
      if (actualAge > 16) {
        //Use validation according to Gender
        if (patGender.toLowerCase() == 'male') {
          indicator = 'male';
        } else if (patGender.toLowerCase() == 'female') {
          indicator = 'female';
        } else {

        }
      }
      else {
        indicator = 'child';
      }
    }
    else {
      indicator = 'child';
    }

    if (this.templateReport.Columns) {
      this.templateReport.Columns = JSON.parse(this.templateReport.Columns);
      //below statement can come out from templateReport level-- remove it ASAP.//remove this after columns are implemented in template level.
      this.templateReport = LabReportVM.AssignControlTypesToComponent(this.templateReport);
    }

    this.templateReport.Templates.forEach(tmplates => {
      //assign columns at template level. if found from database, then parse it else assign default values.
      tmplates.TemplateColumns = tmplates.TemplateColumns ? JSON.parse(tmplates.TemplateColumns) : this.defaultColumns;

      tmplates.Tests.forEach(test => {
        if (test.HasNegativeResults) {
          test.ShowNegativeCheckbox = true;
        } else {
          test.ShowNegativeCheckbox = false;
        }
        let componentJson: Array<LabComponentModel> = new Array<LabComponentModel>();
        //componentJson = JSON.parse(test.ComponentJSON);

        test.ComponentJSON.forEach(cmp => {
          if (this.showRangeInRangeDescription) {
            if (indicator == 'male') {
              if (cmp.MaleRange && cmp.MaleRange.trim() != '' && cmp.MaleRange.length && cmp.MaleRange.trim().toLowerCase() != 'nan-nan') {
                cmp.RangeDescription = cmp.MaleRange;
              }
            } else if (indicator == 'female') {
              if (cmp.FemaleRange && cmp.FemaleRange.trim() != '' && cmp.FemaleRange.length && cmp.FemaleRange.trim().toLowerCase() != 'nan-nan') {
                cmp.RangeDescription = cmp.FemaleRange;
              }
            } else if (indicator == 'child') {
              if (cmp.ChildRange && cmp.ChildRange.trim() != '' && cmp.ChildRange.length && cmp.ChildRange.trim().toLowerCase() != 'nan-nan') {
                cmp.RangeDescription = cmp.ChildRange;
              }
            }

          }

          if (cmp.DisplaySequence == null) {
            cmp.DisplaySequence = 100;
          }
        });

        test.ComponentJSON.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });

        test.Components.forEach(result => {

          if (!result.IsNegativeResult) {
            var seq = test.ComponentJSON.find(obj => obj.ComponentName == result.ComponentName);
            if (seq) {
              result.DisplaySequence = seq.DisplaySequence;
              result.IndentationCount = seq.IndentationCount;
            } else {
              result.IndentationCount = 0;
            }
          } else {
            //test.HasNegativeResults = result.IsNegativeResult;
            test.IsNegativeResult = result.IsNegativeResult;
            test.NegativeResultText = result.Remarks;
            if (this.templateReport.Templates.length == 1 && this.templateReport.Templates[0].Tests.length == 1) {
              this.templateReport.Columns.Unit = false;
              this.templateReport.Columns.Range = false;
              this.templateReport.Columns.Method = false;
              this.templateReport.Columns.Remarks = false;
            }

          }
        });

        test.Components.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });

      });
    });
  }

  public GetAllLabCategory() {
    this.labBLService.GetAllLabCategory()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allCategories = res.Results;
        }
        else {
          this.msgBoxService.showMessage('failed', ['Cannot Load the Lab Category']);
          console.log(res.ErrorMessage);
        }
      })
  }

  public GetPendingReportList() {
    this.labBLService.GetLabTestFinalReports(this.fromDate, this.toDate)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.reportList = res.Results;
          this.reportList.forEach(result => {
            result['IsSelected'] = false;
            let testNameCSV: string;
            let templateNameCSV: string;
            let AllowOutPatientWithProvisional = this.coreService.AllowOutpatientWithProvisional();
            result["allowOutpatientWithProvisional"] = AllowOutPatientWithProvisional;           
          });
          
          this.FilterDataByCategory();
        }
        else {
          this.msgBoxService.showMessage('failed', ['Unable to get Pending Report List']);
          console.log(res.ErrorMessage);
        }
      });
  }

  public SelectUnselectRow(report) {    
    this.reportList.forEach(val => {
      val['IsSelected'] = false;
    });

    report.IsSelected = true;
    this.showPreviewButton = true;

    this.showSelectedPatTestDetail = false;
    this.changeDetector.detectChanges();
    this.selectedReport = new LabTestFinalReportModel();
    this.selectedReport = Object.assign(this.selectedReport, report);
    this.showSelectedPatTestDetail = true;

    this.patientService.getGlobal().PatientId = report.PatientId;
    this.patientService.getGlobal().ShortName = report.PatientName;
    this.patientService.getGlobal().PatientCode = report.PatientCode;
    this.patientService.getGlobal().DateOfBirth = report.DateOfBirth;
    this.patientService.getGlobal().Gender = report.Gender;
    this.patientService.getGlobal().WardName = report.WardName;

  }

  public PreviewSelectedReport() {
    //console.log(this.selectedReport);

    this.showReport = false;
    this.requisitionIdList = [];
    this.templateReport = null;

    this.selectedReport.Tests.forEach(val => {
      if (val['CheckedForPrint'] && val.ValidTestToPrint) {
        if (!(this.requisitionIdList.includes(val.RequisitionId))) {
          this.requisitionIdList.push(val.RequisitionId);
        }
      }
    });

    if (this.requisitionIdList.length > 0) {
      this.LoadLabReports();
    } else {
      this.msgBoxService.showMessage("error", ["No Test Selected."]);
    }

    //console.log(this.requisitionIdList);

  }

  public Close() {
    this.showReport = false;
    this.requisitionIdList = [];
    this.templateReport = null;
  }

  public CallBackToReportDispatchAfterPrint($event) {

    if ($event && $event.printed) {
      var reqIdListPrinted = $event.requisitionList;

      this.selectedReport.Tests.forEach(val => {        
        if (reqIdListPrinted.includes(val.RequisitionId)) {
          val.PrintedBy = this.securityService.GetLoggedInUser().EmployeeId;
          val['PrintedByName'] = this.securityService.GetLoggedInUser().Employee.FirstName + ' ' + this.securityService.GetLoggedInUser().Employee.LastName;
          if (val.PrintCount) { val.PrintCount++; } else { val.PrintCount = 1;}
        }        
      });

      this.Close();
    }
  }
  
  public CategoryOnChange($event) {
    this.selectedCategory = $event;
    this.FilterDataByCategory();
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
      this.selectedReport = new LabTestFinalReportModel();
    }
  }

  RangeTypeOnChange() {
    this.showSelector = false;
    this.showLabel = false;
    this.isOutOfFiscalYearDate = false;
    if (this.rangeType == "None") {
      var from = new Date();
      var to = new Date();
      to.setHours(23, 59, 59, 999);
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 1);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last1Week") {
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - 7);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last3Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 3);
      this.fromDate = moment(from).format('YYYY-MM-DD');

      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last6Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 6);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      // }
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else {
      this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
      this.showSelector = true;
      //this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate, type: "custom" });
    }
    this.GetPendingReportList();
  }


}
