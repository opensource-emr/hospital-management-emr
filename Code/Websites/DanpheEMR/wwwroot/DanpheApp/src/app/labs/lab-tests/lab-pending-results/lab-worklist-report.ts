import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { PatientService } from '../../../patients/shared/patient.service';
import { LabTestResultService } from '../../shared/lab.service';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientLabSample, LabTestSpecimen, LabResult_TestVM } from '../../shared/lab-view.models';
import { SecurityService } from '../../../security/shared/security.service';
import { LabTestRequisition } from '../../shared/lab-requisition.model';
import { LabTestComponent } from '../../shared/lab-component.model'
import { CommonFunctions } from "../../../shared/common.functions";
import * as _ from 'lodash';
import { LabSticker } from "../../shared/lab-sticker.model";
import { CoreService } from "../../../core/shared/core.service";
import { LabReportVM, ReportLookup } from "../../reports/lab-report-vm";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { LabCategoryModel } from "../../shared/lab-category.model";

@Component({
  selector: 'lab-worklist',
  templateUrl: "./lab-worklist-report.html",
  styles: ['.lab-workbook{max-height: 520px; overflow: auto;} table tr th, table tr td{font-size: 12px;} table tr td{font-weight: normal}'],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class LabWorkListReportComponent {
  @Output("closeWorkListReport") closeWorkListReport: EventEmitter<Object> = new EventEmitter<Object>();

  public pendingResultData: any;

  @Input("fromDate")
  public fromDate: string = null;

  @Input("toDate")
  public toDate: string = null;

  @Input("categoryIdList")
  public categoryIdList: any;

  public workListHeader: any;
  public printDate: string = null;
  public departmentName: string;
  public verificationRequired: boolean;
  public loading: boolean = true;

  @Input("categoryList")
  public allCategoryList: Array<LabCategoryModel>;

  constructor(public labBLService: LabsBLService,
    public router: Router,
    _patientservice: PatientService,
    _labresultservice: LabTestResultService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {

    let param = this.coreService.Parameters.find(a => a.ParameterGroupName.toLowerCase() == 'common' && a.ParameterName == 'CustomerHeader');

    if (param) {
      this.workListHeader = JSON.parse(param.ParameterValue);
    }
    this.printDate = moment().format("YYYY-MM-DD");
    this.verificationRequired = this.coreService.EnableVerificationStep();
  }

  ngOnInit() {

    if (this.verificationRequired) {
      this.GetWorkListDataForVerificationRequired(this.fromDate, this.toDate, this.categoryIdList);
    } else {
      this.GetWorkListForNoVerificationRequired(this.fromDate, this.toDate, this.categoryIdList);
    }
  }


  public GetWorkListDataForVerificationRequired(frmdate, todate, categoryIdList): void {
    this.loading = true;
    this.labBLService.GetPendingLabResultsForWorkList(frmdate, todate, categoryIdList)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.pendingResultData = res.Results;
          this.changeDetector.detectChanges();
          if (this.pendingResultData && this.pendingResultData) {
            this.pendingResultData.forEach(result => {
              result["AgeSex"] = CommonFunctions.GetFormattedAgeSex(result.DateOfBirth, result.Gender);


              let testNameCSV: string = '';
              let templateNameCSV: string = '';
              result.Tests.forEach(test => {
                if ((this.verificationRequired && !test.IsVerified) || !this.verificationRequired) {
                  if (!testNameCSV) {
                    testNameCSV = test.TestName;
                  }
                  else {
                    testNameCSV = testNameCSV + "," + test.TestName;
                  }
                  if (!templateNameCSV) {
                    templateNameCSV = test.ReportTemplateShortName;
                  }
                  else {
                    templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
                  }
                }
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });

            this.pendingResultData = this.pendingResultData.filter(t => {
              return t.LabTestCSV && (t.LabTestCSV.length > 0);
            })
          }
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", ["failed to get worklist.. please check log for details."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      }, err => { this.loading = false; });
  }

  public GetWorkListForNoVerificationRequired(frmdate, todate, categoryIdList) {
    this.labBLService.GetPendingLabResults(frmdate, todate, categoryIdList)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.pendingResultData = res.Results;
            this.pendingResultData = this.pendingResultData.slice();
            this.pendingResultData.forEach(result => {
              let testNameCSV: string;
              let templateNameCSV: string;
              result.Tests.forEach(test => {
                if (!testNameCSV)
                  testNameCSV = test.TestName;
                else
                  testNameCSV = testNameCSV + "," + test.TestName;
                //this is removed because it didnt show the same TestName of single patient Twice
                //testNameCSV += testNameCSV.includes(test.TestName) ? "" : "," + test.TestName;

                if (!templateNameCSV)
                  templateNameCSV = test.ReportTemplateShortName;
                else
                  templateNameCSV += templateNameCSV.includes(test.ReportTemplateShortName) ? "" : "," + test.ReportTemplateShortName;
              });
              result.LabTestCSV = testNameCSV;
              result.TemplateName = templateNameCSV;
            });
            this.loading = false;
          }
          else {
            this.pendingResultData = null;
            this.loading = false;
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", ["failed to get lab test of patient.. please check log for details."]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      }, err => { this.loading = false; });
  }

  public Close() {
    this.closeWorkListReport.emit({ close: true });
  }

  public Print() {
    let popupWinindow;
    if (document.getElementById("labWorkBook")) {
      var printContents = document.getElementById("labWorkBook").innerHTML;
    }
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = `<html><head>
                          <style>
                          .worklistHeader div[class*="col-"]{
                            height: 100%;
                            min-height: 67px;
                            display: flex;
                            justify-content: flex-end;
                            flex-direction: column;
                            border: none;
                            font-size: 9px;
                          }
                          .worklistHeader .row {
                            display: flex;
                            width: 100%;
                            justify-content: space-between;
                          }
                          .headerDate {
                            width: 37% !important;
                          }
                          .headerHospName {
                            width: 40% !important;
                            word-wrap: break-word;
                          }
                          .headerPrintDate {
                            width: 23% !important;
                          }</style>`;


    documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;

    documentContent += '<body class="lab-rpt4moz" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.closeWorkListReport.emit({ close: true });
    }
  }

}



