import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnInit, Input, Output,SecurityContext } from "@angular/core";
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
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { LabTestFinalReportModel, LabTestsInFinalReportModel } from '../../shared/lab-finalreport.VM';
import { LabTestRequisition } from "../../shared/lab-requisition.model";
import { LabReportVM } from "../../reports/lab-report-vm";
import { LabComponentModel } from "../../shared/lab-component-json.model";
import { Subscription } from "rxjs/Rx";
import { SecurityService } from "../../../security/shared/security.service";
import { CoreCFGLabEmailSettingsModel } from "../../shared/CoreCFGLabEmailSettings.model";
import { LabEmailModel, AttachmentModel } from "../../shared/lab-email.model";
import html2canvas from "html2canvas";
import * as jsPDF from "jspdf";
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'lab-report-dispatch-detail',
  templateUrl: "./lab-report-dispatch-detail.html",
  styles: [`  .test-list-table {background: #e6e6e6;}
              .test-list-table thead{background: #126587;}
              .test-list-table tr th, .test-list-table tr td {padding: 4px 2px;font-size: 11px;}
              .test-list-table tr th {color: #fff;}
              .test-list-table tr td: not(.txt-red) {color: #000;}
              .slct-checkbox{margin: 0;}
              .btn-dispatch-preview{margin-bottom: 8px;}
              .txt-red {color: red;}`]
})

export class LabReportDispatchDetailComponent {
  // @Input("reportSelected")
  // public reportSelected: Array<LabTestFinalReportModel> = new Array<LabTestFinalReportModel>();

  @Input("fromDate")
  public fromDate: any;

  @Input("toDate")
  public toDate: any;

  @Input("catagoryList")
  public catagoryList: any;

  @Input("patientId")
  public patientId: number;

  public allEmployeeList: Array<any> = [];
  public showVerifiedByColumn: boolean = false;

  public showPendingTests: boolean = false;
  public loading: boolean = false;
  public selectAllReportsAndTest: boolean = false;
  public showPreviewButton: boolean = false;
  public showRangeInRangeDescription: boolean = false;
  public labReportFormat: string = 'format1';
  public LabHeader: any = null;
  public showHeader: boolean = false;
  public showAddEditResult: boolean = false;
  public showReport: boolean = false;
  public enableEdit: boolean = false;
  public showSignatories: boolean = true;


  public requisitions: Array<LabTestRequisition>;
  public resultsToAdd: Array<LabTestRequisition>;
  public resultsAdded: Array<LabTestRequisition>;
  public allEmployee: Array<any>;

  public reportSelected: Array<LabTestFinalReportModel> = new Array<LabTestFinalReportModel>();
  public requisitionIdList: Array<Array<number>> = new Array<Array<number>>();
  public templateReport: Array<LabReportVM> = [];
  public defaultColumns = { "Name": true, "Result": true, "Range": true, "Method": false, "Unit": true, "Remarks": false };
  public reportListSubscription: Subscription;
  public reportPreviewSubscription: Subscription;
  public loggedInUserId: any;

  public showEmailDataBox: boolean = false;
  public emailSettings: CoreCFGLabEmailSettingsModel = new CoreCFGLabEmailSettingsModel();
  public labEmail: LabEmailModel = null;
  public report: LabReportVM= new LabReportVM();
  public showImagingReport: boolean = false;
  public patName :string=null
  public Email:string=null
public test:string=null
  public docName:string=null
  public doc:any;
  constructor(public patientService: PatientService, public coreService: CoreService,
    public msgBoxService: MessageboxService, public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public labBLService: LabsBLService,
    public sanitizer: DomSanitizer,) {
    this.showVerifiedByColumn = this.coreService.EnableVerificationStep();
    this.showRangeInRangeDescription = this.coreService.EnableRangeInRangeDescriptionStep();
    this.labReportFormat = this.coreService.GetLabReportFormat();
    this.loggedInUserId = this.securityService.GetLoggedInUser().EmployeeId;
    this.emailSettings = this.coreService.GetLabEmailSettings();
  }

  ngOnInit() {
    this.LabHeader = this.coreService.GetLabReportHeaderSetting();
    this.showHeader = this.LabHeader.showLabReportHeader;
    this.LoadFinalizedReportByPatientId();
  }

  ngOnDestroy() {
    this.reportListSubscription && this.reportListSubscription.unsubscribe();
    this.reportPreviewSubscription && this.reportPreviewSubscription.unsubscribe();
  }

  public LoadFinalizedReportByPatientId() {
    //= this.labBLService.GetFinalReportsInReportDispatchByPatId(this.patientId, this.fromDate, this.toDate, this.catagoryList);

    this.reportListSubscription = this.labBLService.GetFinalReportsInReportDispatchByPatId(this.patientId, this.fromDate, this.toDate, this.catagoryList)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.reportSelected = res.Results;
          this.AssignEmployeeNamesToRespectiveField();
        }
        else {
          this.msgBoxService.showMessage("failed", ["Unable to get finalized test list of selected patient"]);
          this.coreService.loading = false;
          console.log(res.ErrorMessage);
        }

      }, (err) => { console.log(err.ErrorMessage); this.coreService.loading = false; });
  }

  public AssignEmployeeNamesToRespectiveField() {
    this.allEmployeeList = DanpheCache.GetData(MasterType.Employee, null);
    this.reportSelected.forEach(report => {
      report['SelectAll'] = false;
      report.Tests.forEach(tst => {
        tst['SampleCollectedByName'] = '';
        tst['ResultVerifiedByName'] = '';
        tst['ResultAddedByName'] = '';
        tst['PrintedByName'] = '';
        tst['CheckedForPrint'] = false;

        this.allEmployeeList.forEach(val => {
          if (val.EmployeeId == tst.SampleCollectedBy) {
            tst['SampleCollectedByName'] = val.FirstName + " " + val.LastName;
          }
          if (val.EmployeeId == tst.VerifiedBy) {
            tst['ResultVerifiedByName'] = val.FirstName + " " + val.LastName;
          }
          if (val.EmployeeId == tst.ResultAddedBy) {
            tst['ResultAddedByName'] = val.FirstName + " " + val.LastName;
          }
          if (val.EmployeeId == tst.PrintedBy) {
            tst['PrintedByName'] = val.FirstName + " " + val.LastName;
          }
        });
      });
    });
  }

  public PreviewSelectedReport() {
    this.coreService.loading = true;
    this.requisitionIdList = [];
    this.showReport = false;
    this.templateReport = null;

    this.reportSelected.forEach(rep => {
      let tempReqList = [];
      rep.Tests.forEach(val => {
        if (val['CheckedForPrint'] && val.ValidTestToPrint) {
          if (!(tempReqList.includes(val.RequisitionId))) {
            tempReqList.push(val.RequisitionId);
          }
        }
      });
      if (tempReqList && tempReqList.length) {
        this.requisitionIdList.push(tempReqList);
      }
    });
    if (this.requisitionIdList.length > 0) {
      this.LoadLabReports();
    } else {
      this.coreService.loading = false;
      this.msgBoxService.showMessage("error", ["No Test Selected."]);
    }

  }

  public LoadLabReports() {
    this.labBLService.GetReportFromListOfReqIdList(this.requisitionIdList)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK" && res.Results) {
          this.templateReport = res.Results;
          this.MapSequence();
          this.requisitionIdList = [];
          this.showReport = true;
          this.coreService.loading = false;
          //below below should be called only when 
        }
        else {
          this.msgBoxService.showMessage("failed", ["Unable to get lab reports."]);
          this.coreService.loading = false;
          console.log(res.ErrorMessage);
        }

      }, (err) => { console.log(err.ErrorMessage); this.coreService.loading = false; });
  }

  public MapSequence() {
    this.templateReport.forEach(rep => {
      var dob = rep.Lookups.DOB;
      var patGender = rep.Lookups.Gender;
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

      if (rep.Columns) {
        rep.Columns = JSON.parse(rep.Columns);
        //below statement can come out from templateReport level-- remove it ASAP.//remove this after columns are implemented in template level.
        rep = LabReportVM.AssignControlTypesToComponent(rep);
      }

      rep.Templates.forEach(tmplates => {
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
              if (rep.Templates.length == 1 && rep.Templates[0].Tests.length == 1) {
                rep.Columns.Unit = false;
                rep.Columns.Range = false;
                rep.Columns.Method = false;
                rep.Columns.Remarks = false;
              }
            }
          });
          test.Components.sort(function (a, b) { return a.DisplaySequence - b.DisplaySequence });
        });
      });
    });
  }


  public CallBackToReportDispatchAfterPrint($event) {
    if ($event && $event.printed) {
      var reqIdListPrinted = $event.requisitionList;

      this.reportSelected.forEach(report => {
        report.Tests.forEach(val => {
          if (reqIdListPrinted.includes(val.RequisitionId)) {
            val.PrintedBy = this.securityService.GetLoggedInUser().EmployeeId;
            val['PrintedByName'] = this.securityService.GetLoggedInUser().Employee.FirstName + ' ' + this.securityService.GetLoggedInUser().Employee.LastName;
            if (val.PrintCount) { val.PrintCount++; } else { val.PrintCount = 1; }
          }
        });
      });

      this.Close();
    }
  }

  public CheckForSelectAll(reportInd, testInd) {
    this.reportSelected[reportInd].Tests[testInd]["CheckedForPrint"] = !this.reportSelected[reportInd].Tests[testInd]["CheckedForPrint"];
    //var allTstSelected = true;
    //this.reportSelected.forEach((rep, ind) => {
    // if (ind != reportInd) {
    //   rep["SelectAll"] = false;
    //   rep.Tests.forEach(t => {
    //     t["CheckedForPrint"] = false;
    //   });
    // }
    //else {
    //   rep.Tests.forEach(t => {
    //     if (!t["CheckedForPrint"]) {
    //       allTstSelected = false;
    //     }
    //   });
    // }
    //});
    //this.reportSelected[reportInd]['SelectAll'] = allTstSelected;
    this.reportSelected[reportInd]["SelectAll"] = this.reportSelected[reportInd].Tests.every(t => t["CheckedForPrint"]);
    this.CheckForPreviewButtonDisplay();
  }

  SelectDeselectAllReportsAndTests() {
    this.reportSelected.forEach(rep => {
      rep['SelectAll'] = this.selectAllReportsAndTest;
      this.showPreviewButton = rep.Tests && (rep.Tests.length > 0) && this.selectAllReportsAndTest;
      rep.Tests.forEach(tst => {
        tst['CheckedForPrint'] = this.selectAllReportsAndTest;
      });
    })
  }

  public SelectDeselectAll(ind) {
    if (ind > -1) {
      let allSelected = this.reportSelected[ind]['SelectAll'];
      this.reportSelected[ind].Tests.forEach(tst => {
        tst['CheckedForPrint'] = allSelected;
      });
    }
    this.CheckForPreviewButtonDisplay();
  }

  public CheckForPreviewButtonDisplay() {
    this.showPreviewButton = this.reportSelected.some(rep => {
      return rep.Tests.some(val => {
        return (val['CheckedForPrint'] && val.ValidTestToPrint);
      });
    });
  }

  public ShowPendingTestList() {
    if (this.showPendingTests) {
      this.loading = true;
      this.labBLService.GetTestListSummaryByPatientId(this.reportSelected[0].PatientId, this.fromDate, this.toDate, this.catagoryList)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.requisitions = res.Results.Requisitions;
            this.resultsToAdd = res.Results.ResultsToAdd;
            this.resultsAdded = res.Results.ResultsAdded;
            this.allEmployee = res.Results.Employee;

            this.resultsToAdd.forEach(r => {
              let p = r.SampleCreatedBy.toString();
              if (this.allEmployee[p]) {
                r["SampleCollectedBy"] = this.allEmployee[p];
              }
            });

            this.resultsAdded.forEach(r => {
              let p = r.SampleCreatedBy.toString();
              let resAddedBy = r["ResultAddedBy"].toString();
              if (this.allEmployee[p]) {
                r["SampleCollectedBy"] = this.allEmployee[p];
                r["ResultEnteredBy"] = this.allEmployee[resAddedBy];
              }
            });

            this.loading = false;
          }
          else {
            this.msgBoxService.showMessage("failed", ["Please try again Later !!"]);
            this.loading = false;
          }
        });
    }
  }

  printLabReport() {
    this.loading = true;
    let allSelectedReqIds = [];
    this.reportSelected.forEach(rep => {
      rep.Tests.forEach(val => {
        if (val['CheckedForPrint'] && val.ValidTestToPrint) {
          if (!(allSelectedReqIds.includes(val.RequisitionId))) {
            allSelectedReqIds.push(val.RequisitionId);
          }
        }
      });
    });

    if (allSelectedReqIds && allSelectedReqIds.length && this.loading) {
      this.labBLService
        .UpdateIsPrintedFlag(0, allSelectedReqIds)
        .subscribe((res) => {
          if (res.Status == "OK") {
            this.print();
            this.updatePrintStatus(allSelectedReqIds);
          } else {
            this.msgBoxService.showMessage("failed", [
              "Error In Updating Print Informations in Report Table",
            ]);
            this.loading = false;
          }
        }, err => { console.log(err.ErrorMessage); this.loading = false; });
    } else {
      this.msgBoxService.showMessage("error", ["Cannot print the report."]);
      this.loading = false;
    }
  }

  updatePrintStatus(reqList) {
    let emp = this.allEmployeeList.find(e => e.EmployeeId == this.loggedInUserId);
    this.reportSelected.forEach(rep => {
      rep.Tests.forEach(val => {
        if (reqList.includes(val.RequisitionId)) {
          val.PrintCount += 1;
          val.PrintedBy = this.loggedInUserId;
          val['PrintedByName'] = emp ? (emp.FirstName + " " + emp.LastName) : '';
        }
      });
    });
  }

  print() {
    let popupWinindow;
    if (document.getElementById("all-lab-reports")) {
      document.getElementById("all-lab-reports").style.border = "none";
    }
    if (document.getElementById("all-lab-reports")) {
      var printContents = document.getElementById("all-lab-reports").innerHTML;
    }

    popupWinindow = window.open(
      "",
      "_blank",
      "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
    );
    popupWinindow.document.open();
    var documentContent = "<html><head>";
    documentContent +=
      `<link href="../../../../../../assets-dph/external/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
      `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/LabReportPrint-format2.css" /></head>`;

    /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    ///Sud:22Aug'18--added no-print class in below documeentContent

    documentContent +=
      '<body class="lab-rpt4moz">' +
      printContents +
      "</body></html>";
    popupWinindow.document.write(documentContent);
    document.getElementById("all-lab-reports").style.border = "1px solid";
    popupWinindow.document.close();

    let tmr = setTimeout(function () {
      popupWinindow.print();
      popupWinindow.close();
    }, 600);
    this.loading = false;
  }

  public Close() {
    this.showReport = false;
  }
 
  ProcessSendingData() {
    this.loading = false;
    this.labEmail = new LabEmailModel();
    let allSelectedReqIds = [];
    this.templateReport.forEach(rep => {
     
      
    this.patName =  rep.Lookups.PatientName ,
    this.Email = rep.Email
       });
   
    this.docName =  this.patName +"-" +moment().format("YYMMDDHHmm") +".pdf";
  
               html2canvas(document.getElementById("all-lab-reports"), {
                width: 1500,
                windowWidth: 1500,
                scale: 1,
              }).then((canvas) => {
              var image = canvas.toDataURL("image/png");
              var ratio = canvas.width / canvas.height;
              var imageWidth = 250;
              var imageHeight = imageWidth / ratio;
             
              this.doc = new jsPDF("p", "mm",  'a4');
              this.doc.addImage(image, 'PNG', 0, 0, 250,imageHeight);
              this.doc.save(this.docName);
              
              document.getElementById("all-lab-reports").style.border = "1px solid";
             
              document.getElementById("all-lab-reports").style.minHeight = 175 + "mm";
      
               var binary = this.doc.output();
              this.labEmail.PdfBase64 = btoa(binary);
              });
         
    this.labEmail.AttachmentFileName = this.patName + "-" + moment().format("YYMMDDHHmm") +'.pdf';       
    this.labEmail.EmailAddress = this.Email
    this.labEmail.SendHtml = this.emailSettings.TextContent;
    this.labEmail.SendPdf = this.emailSettings.PdfContent;
    this.labEmail.SenderTitle = this.emailSettings.SenderTitle;
    this.labEmail.SenderEmailAddress = this.emailSettings.SenderEmail;
    this.labEmail.Subject = 'Report of ' + this.patName;
       
    this.LoadEmailAttachments_Images();
  }

  public LoadEmailAttachments_Images() {
    if (this.report.Templates) {
      let albumTemp = [];
      let count: number = 1;
     this.templateReport.forEach(rep => {
   
     this.patName = rep.Lookups.PatientName
    });
      let todayDate = moment().format("YYYYMMDD_HHmmss");
          let pdf: AttachmentModel = new AttachmentModel();
          //we've to send only the base64 content. dataUri format includes the string: data:image/png.. in its value so we're replacing it with empty string.
          //ll be used to show preview on email box.
          pdf.ImageName = this.patName + "_" + todayDate + "_" + count.toString();
          pdf.IsSelected = true;
          ////everytime count increases, re-assign to preview image count.
          count++;
          albumTemp.push(pdf);
    this.labEmail.ImageAttachments_Preview = albumTemp;
    this.email_previewpdf_Count = this.labEmail.ImageAttachments_Preview.length;
 
    }
 
  }
  public email_showpdfPreview: boolean = false;
  public email_previewpdf_Src: string = null;
  public email_previewpdf_Count: number = 0;


  PdfPreviewChkOnChange() {
    this.email_previewpdf_Count = this.labEmail.ImageAttachments_Preview.filter(a => a.IsSelected == true).length;
  }
  public SendEmail() {
    if (this.emailSettings.PdfContent) {
      //we have to take only text content, image won't be sent.
      //var itemDiv = document.getElementById("lab-report-main").innerHTML;
      var itemDiv = document.getElementById("single-lab-report").innerHTML;
       let data = this.sanitizer.sanitize(SecurityContext.HTML, itemDiv);

      this.labEmail.HtmlContent = data;
    }

  //});
    if (this.labEmail && (this.labEmail.SendHtml || this.labEmail.SendPdf)) {
      this.labEmail.EmailList = new Array<string>();
      for (var valCtrls in this.labEmail.LabEmailValidator.controls) {
        this.labEmail.LabEmailValidator.controls[valCtrls].markAsDirty();
        this.labEmail.LabEmailValidator.controls[valCtrls].updateValueAndValidity();
      }
    
      if (this.labEmail.IsValidCheck(undefined, undefined)) {

        var emailList = this.labEmail.EmailAddress.split(";");
        var allEmailIsValid = true;

        emailList.forEach(value => {
          if (value) {//if user provides semicolon after Only one Email, split will create two objects in array, second with empty space.
            if (this.ValidateEmail(value)) {
              this.labEmail.EmailList.push(value);
            } else {
              allEmailIsValid = false;
            }
          }
        });

        if (allEmailIsValid) {
          //console.log(this.radEmail);
          //remove unselected images before sending.
          this.labEmail.ImageAttachments = this.labEmail.ImageAttachments_Preview.filter(a => a.IsSelected == true);
        
          if (this.labEmail.ImageAttachments.length > 5) {
            this.msgBoxService.showMessage("error", ["Cannot attach more than 5 images, please remove some and send again."]);
            this.loading = false;
            return;
          }
        
          this.labBLService.sendEmail(this.labEmail)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.msgBoxService.showMessage('success', ['Email sent successfuly.']);
                this.loading = false;
                this.CloseSendEmailPopUp();
              } else {
                this.msgBoxService.showMessage('failed', ['Email could not be sent, please try later.']);
                this.loading = false;
              }
            });
        
      }
      else {
          this.msgBoxService.showMessage('error', ['Invalid EmailAddress entered, Please correct it.']);
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    } else {
      this.msgBoxService.showMessage('failed', ['Email Sending Parameter has all the types of Email to send made False.']);
      this.loading = false;
    }
  
  }

  public ValidateEmail(email): boolean {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  }
  CloseSendEmailPopUp() {
    this.showEmailDataBox = false;
  }
}
