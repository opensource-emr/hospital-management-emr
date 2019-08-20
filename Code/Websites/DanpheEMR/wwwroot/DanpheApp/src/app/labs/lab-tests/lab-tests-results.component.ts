/*
 Description:
    - It is a reusable component and uses two other components
        - Add Result Component
        - View Report Component
    - Displays either add/result or view report as required.
    - It has input element requisitionIdList
    - It does a GET request using requisitionIdList and assigns the output of the request to templateReport variable.
    - templateReport variable is passed as Input to lab-tests-add-result.component.ts and lab-tests-view-report.component.ts
    - showSignatoires and showHeader parameter is passed as Input to lab-tests-view-report.component.ts
    - It is used in the following pages.
    - Lab - Add Result Page
    - Lab - Pending Report Page
    - Lab - Final Report Page
    - Doctors - PatientOverview Page
    
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 3rd July 2018           created            
                                                     
 -------------------------------------------------------------------
 */

import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LabsBLService } from '../shared/labs.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { LabReportVM } from '../reports/lab-report-vm';
import { LabReport } from "../shared/lab-report";
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from '../../core/shared/core.service';
import { LabComponentModel } from '../shared/lab-component-json.model';
import * as _ from 'lodash';


@Component({
  selector: 'danphe-lab-results',
  templateUrl: "./lab-tests-results.html"

})
export class LabTestsResults {
  public requisitionIdList: Array<number>;
  @Input("showReport")
  public showReport: boolean = false;
  @Input("showAddEditResult")
  public showAddEditResult: boolean = false;
  @Input("showHeader")
  public showHeader: boolean = true;
  @Input("showSignatories")
  public showSignatories: boolean = true;
  @Input("printReportFromGrid")
  public printReportFromGrid: boolean = false;

  @Input() public verificationRequired: boolean = false;

  public templateReport: LabReportVM = null;
  public isEditResult: boolean = false;
  @Input("enableEdit")
  public enableEdit: boolean = true;
  public LabHeader: any = null;

  @Output("callbackAddUpdate") callbackAddUpdate: EventEmitter<object> = new EventEmitter<object>();
  @Output("callback-cancel") callbackCancel: EventEmitter<object> = new EventEmitter<object>();


  public templateReportToEdit: LabReportVM = null;

  //sud: 19Sept'18 -- default column settings for 
  public defaultColumns = { "Name": true, "Result": true, "Range": true, "Method": false, "Unit": true, "Remarks": false };


  public showRangeInRangeDescription: boolean = false;
  public hospitalCode: string = '';

  constructor(public labBLService: LabsBLService, public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public coreService: CoreService) {
    this.showRangeInRangeDescription = this.coreService.EnableRangeInRangeDescriptionStep();
    this.hospitalCode = this.coreService.GetHospitalCode();
  }

  ngOnInit() {
    this.LabHeader = this.coreService.GetLabReportHeaderSetting();
    this.showHeader = this.LabHeader.showLabReportHeader;
    //this.verificationRequired = this.coreService.EnableVerificationStep();
  }


  @Input("requisitionIdList")
  public set reqIdList(idList: Array<number>) {
    if (idList.length) {
      this.requisitionIdList = idList;
      this.LoadLabReports();
    }
  }

  public LoadLabReports(isAfterEdit: boolean = false) {
    //remove hardcoded id: 1 from below and pass correct one.
    //or pass list of requisitionIds as per necessity
    this.labBLService.GetReportFromReqIdList(this.requisitionIdList)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.templateReport = res.Results;
          this.MapSequence();
          this.requisitionIdList = [];
          //below below should be called only when 
          if (isAfterEdit) {
            this.showAddEditResult = false;
            this.showReport = true;

            //if (this.templateReport.TemplateType == 'normal') {
            //    this.showAddEditResult = false;
            //    this.showReport = true;
            //}
            //else {

            //}
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get lab reports."]);
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



  CallBackAddUpdate($event) {
    this.requisitionIdList = $event.selReqIdList;
    this.LoadLabReports(true);
    ////WTF IS BELOW CODE DOING ??
    ////same values are getting assigned in both if and else... 
    //if (this.templateReport.TemplateType == 'normal') {
    //    this.showAddEditResult = false;
    //    this.showReport = true;
    //}
    //else {
    //    this.showAddEditResult = false;
    //    this.showReport = true;
    //}

  }

  CallbackCancel($event) {
    if (this.showAddEditResult && this.isEditResult) {
      if ($event.cancel) {
        this.BackToViewReport();
      }
    } else {
      if ($event.cancel) {
        this.callbackCancel.emit({ cancel: true });
      }
    }  
  }


  public EditReport() {
    this.showReport = false;
    this.templateReportToEdit = new LabReportVM();
    //below function _.cloneDeep  creates a new copy and assign all values to new object recursively.
    //reference of old object/values will no longer be there..
    this.templateReportToEdit = _.cloneDeep(this.templateReport);
    this.isEditResult = true;
    this.showAddEditResult = true;
    this.changeDetector.detectChanges();
  }
  public BackToViewReport() {
    this.templateReport = this.templateReportToEdit;
    this.isEditResult = false;
    this.showAddEditResult = false;
    this.showReport = true;
  }

  public CallBackBackToGrid($event) {
    if ($event.verified || $event.printed) {
      this.showReport = false;
      this.callbackAddUpdate.emit({ backtogrid: true });
    }
  }
}
