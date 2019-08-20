import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { ImagingItemReport } from '../shared/imaging-item-report.model';
import { Patient } from '../../patients/shared/patient.model';
import { ImagingItemRequisition } from '../shared/imaging-item-requisition.model';
import { ImagingBLService } from '../shared/imaging.bl.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { ImagingPatientStudy } from "../shared/imaging-patient-study.model";
import { CoreService } from "../../core/shared/core.service";
//needed to assign external html as innerHTML property of some div
//otherwise angular removes some css property from the DOM. 
import { DomSanitizer } from '@angular/platform-browser';
import { ImagingType } from "../shared/imaging-type.model";

@Component({
  templateUrl: "./imaging-requisition-list.html" //  "/RadiologyView/ImagingRequisitionList"
})
export class ImagingRequisitionListComponent {

  public CurrentImagingReport: ImagingItemReport = new ImagingItemReport();
  public imagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public imagingReportsFiltered: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public imagingReportsLight: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  //enable preview is for success or error dialog box.
  public enablePreview: boolean = false;
  //showreport is for pop up add report page.
  public showreport: boolean = false;
  public selectedReport: ImagingItemReport = new ImagingItemReport();
  public patientDetails: Patient;
  public selIndex: number;
  public loading: boolean = false;
  public imgReqListGridColumns: Array<any> = null;
  public showImagingReport: boolean = false;
  public requisitionId: number = null;
  public showFileList: boolean = false;//show or hide imaging file list page
  public imagingFileList: Array<ImagingPatientStudy> = new Array<ImagingPatientStudy>();
  public reportData: ImagingItemReport = new ImagingItemReport();
  public isShowButton: boolean = false;
  public imagingTypes: Array<ImagingType> = new Array<ImagingType>();

  //used to pass value to rangeType in custom-date
  public dateRange: string = null;
  public fromDate: string = null;
  public toDate: string = null;


  //selected Imaging Type to  display in the grid.
  public selImgType: string = "All";
  constructor(public visitService: VisitService,
    public patientService: PatientService,
    public imagingBLService: ImagingBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public sanitizer: DomSanitizer) {
    this.getImagingType();
    this.GetButtonBehavior();
    this.imgReqListGridColumns = GridColumnSettings.ImagingRequisitionListSearch;
    this.GetImagingReqsAndReportsByStatus();
    this.dateRange = "today";
  }

  getImagingType() {
    this.imagingBLService.GetImagingTypes()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imagingTypes = res.Results;
        }
        else {
          this.msgBoxServ.showMessage('failed', ["failed to get Imaging Types " + res.ErrorMessage]);
        }
      });
  }

  //get property from parameter and set behavior or attach file button
  GetButtonBehavior() {
    try {
      let textVal = this.coreService.Parameters.filter(a => a.ParameterName == 'RAD_AttachFileButtonShowHide')[0]["ParameterValue"];
      this.isShowButton = (textVal == "false") ? false : true;
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  //gets active imaging request and pending imaging reports.
  GetImagingReqsAndReportsByStatus(): void {


    this.imagingBLService.GetImagingReqsAndReportsByStatus()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.imagingReports = res.Results;
          this.imagingReports.forEach(x => {
            x.IsShowButton = this.isShowButton;
          });
          if (this.selImgType == 'All') {
            this.imagingReportsFiltered = this.imagingReports;

          } else {
            this.imagingReportsFiltered = this.imagingReports.filter(x => x.ImagingTypeName == this.selImgType);
          }
          this.enablePreview = true;
        }
        else
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      });
  }

  //show add report pop up
  ShowAddReport(selReport, selIndex): void {
    this.selIndex = selIndex;
    this.showreport = false;
    selReport.ReportingDoctorId = selReport.ProviderId != 0 ? selReport.ProviderId : null;
    this.selectedReport = new ImagingItemReport();
    //changeDetector is needed to manually trigger the angular change detection,
    //which isn't working by default.
    this.changeDetector.detectChanges();
    //selectedReport is @input object for post-report.component.
    this.selectedReport = selReport;
    this.patientDetails = selReport.Patient;
    this.showreport = true;
  }


  //post report called from post-report component using event emitter.
  AddReport($event): void {
    if (!this.loading) {
      try {
        //$event contains reportFiles, report object and orderStatus(final/pending).
        let filesToUpload = $event.reportFiles;
        let selReport = $event.report;
        // let printReport = false;
        let isUpdate: boolean = false;
        // if ($event.orderStatus == "print") {
        //     printReport = true;
        //     $event.orderStatus = "pending";
        // }

        if (selReport.ImagingReportId)
          isUpdate = true;
        let orderStatus: string = $event.orderStatus;
        if (filesToUpload.length || selReport) {
          this.loading = true;
          //filesToUpload,selReport,OrderStatus
          this.imagingBLService.AddImgItemReport(filesToUpload, selReport, orderStatus)
            .subscribe(res => {
              this.loading = false;
              if (res.Status == "OK") {
                this.GetImagingReqsAndReportsByStatus();
                this.selectedReport.ImagingReportId = res.Results.ImagingReportId;

                if (res.Results.OrderStatus == "final") {
                  this.showreport = false;
                  this.ViewReport(res.Results.ImagingRequisitionId);
                }


                if (isUpdate)
                  this.msgBoxServ.showMessage("success", ["Report Updated Successfully"]);
                else
                  this.msgBoxServ.showMessage("success", ["Report Added Successfully"]);
              }
              else
                this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            });
        }
      } catch (exception) {
        this.msgBoxServ.showMessage("error", ['check console log for detail error..!']);
        console.log(exception);
      }
    }
  }

  ImagingRequisitionListGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "show-add-report":
        {
          var selReport = Object.assign({}, $event.Data);
          this.GetImagingReportContent(selReport, $event.RowIndex);//get content and show add report page
        }
        break;
      case "upload-imging-files":
        {
          this.LoadScannedImageList($event.Data, $event.RowIndex);
        }
        break;

      default:
        break;
    }
  }
  //get reportTExt and Images details from server  
  GetImagingReportContent(data: any, selIndex) {
    var selReport = new ImagingItemReport;
    selReport = data;
    let isRequisitionReport = false;//flag for check report from requisition or from report table
    //this method get reporttext, imageName, imageFullpath
    //first check report from Requisition table or report table
    //from requisition then take ReportTemplate from reportTemplate Master table by ImagingItemId
    //if report from Report table then check ReportText if ReportText is null then take it from ReportTemplate maste table by ImagingItemId
    //if report from report table and reportText is not null then take from ReportTable 
    isRequisitionReport = (selReport.ImagingReportId > 0) ? false : true; //check report from requisition or from report table
    let id = (isRequisitionReport == true) ? selReport.ImagingItemId : selReport.ImagingReportId;

    this.imagingBLService.GetImagingReportContent(isRequisitionReport, id)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results) {
            selReport.ImageFullPath = res.Results.ImageFullPath;
            selReport.ImageName = res.Results.ImageName;
            //IMPORTANT: sanitizer.bypassSecurity : Needed to retain style/css of innerHTML !! --sud:12Apr'18'
            //let reportText = this.sanitizer.bypassSecurityTrustHtml(res.Results.ReportText);

            selReport.ReportText = res.Results.ReportText;
            selReport.ReportTemplateId = res.Results.ReportTemplateId;
            selReport.TemplateName = res.Results.TemplateName;
          }
          this.ShowAddReport(selReport, selIndex);
        }
        else
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
      });
  }
  ViewReport(requisitionId: number): void {
    this.showImagingReport = false;
    this.requisitionId = null;
    this.changeDetector.detectChanges();
    this.requisitionId = requisitionId;
    this.showImagingReport = true;
  }

  //fire event when custom date selection changed
  onDateChange($event) {
    try {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
      var fromDateCheckflag = moment(this.fromDate, 'YYYY-MM-DD HH:mm', true).isValid();
      var toDateCheckflag = moment(this.toDate, 'YYYY-MM-DD HH:mm', true).isValid();
      if (fromDateCheckflag == true && toDateCheckflag == true) {
        this.imagingBLService.GetImgFileList(this.fromDate, this.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.imagingFileList = res.Results;
              if (this.imagingFileList.length > 0) {
                this.imagingFileList.forEach(x => {
                  if (x.PatientName) {
                    for (var i = 0; i < x.PatientName.length; i++) {
                      x.PatientName = x.PatientName.replace("^", " ");
                    }
                  }
                });
              } else {
                this.msgBoxServ.showMessage("notice", ['not study details for selected date']);
              }
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.showFileList = false;
            }
          });
      } else {
        this.msgBoxServ.showMessage("notice", ['Please select valid date for load scanned images']);
      }
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  //Get scanned imaging files list for add to report
  LoadScannedImageList(selReport: ImagingItemReport, Index) {
    try {
      this.showFileList = true;
      this.reportData = Object.assign(this.reportData, selReport);
      this.patientDetails = selReport.Patient;
      this.selIndex = Index;
    } catch (exception) {
      this.CatchErrorLog(exception);
      this.showFileList = false;
    }
  }
  //After selecting file attach imaging files for report
  AttachImagingFiles() {
    try {
      //check files selected or not for validation pupose
      if (this.CheckFileSelection()) {
        var patStudyList = "";
        this.imagingFileList.forEach(x => {
          if (x.IsSelect) {
            patStudyList = patStudyList + x.PatientStudyId + ";";
          }
        });
        this.reportData.PatientStudyId = this.reportData.PatientStudyId + patStudyList;

        if (!this.loading) {
          try {
            let orderStatus = (this.reportData.ImagingReportId > 0) ? this.reportData.OrderStatus : 'pending';
            orderStatus = (orderStatus == 'active') ? 'pending' : orderStatus;
            this.reportData.OrderStatus = orderStatus;
            if (this.reportData.PatientStudyId) {
              this.loading = true;
              this.imagingBLService.AddImagingPatientStudyToReport(this.reportData)
                .subscribe(res => {
                  this.loading = false;
                  if (res.Status == "OK")
                    this.CallBackPostImagingFile(res.Results);
                  else
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                });
            }
          } catch (exception) {
            this.msgBoxServ.showMessage("error", ['check console log for detail error..!']);
            console.log(exception);
          }
        }
      }
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  //call back after imaging files attachment completed 
  CallBackPostImagingFile(res) {
    this.imagingReports[this.selIndex].PatientStudyId = res.PatientStudyId;
    this.imagingReports[this.selIndex].ImagingReportId = res.ImagingReportId;
    this.imagingReports[this.selIndex].OrderStatus = 'pending';
    this.showFileList = false;
    this.reportData = new ImagingItemReport();
    this.msgBoxServ.showMessage("success", ["Files Added Successfully"]);
  }
  //check validation -file selected or not for attach with report
  CheckFileSelection(): boolean {
    try {
      let selectedCount = 0;
      selectedCount = this.imagingFileList.filter(x => x.IsSelect == true).length;
      if (selectedCount) {
        return true;
      } else {
        this.msgBoxServ.showMessage("notice", ['Please select study details']);
        return false;
      }
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }

  //on checkbox (radiobutton) check and uncheck this method will fire
  onSelectionChange(patStudyId) {
    try {
      if (patStudyId) {
        this.imagingFileList.forEach(x => x.IsSelect = false);
        let index = this.imagingFileList.findIndex(x => x.PatientStudyId == patStudyId);
        this.imagingFileList[index].IsSelect = true;
      }
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  Close() {
    try {
      this.showFileList = false;
      this.patientDetails = new Patient();
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  GetBackOnClose($event) {
    if ($event.Submit) {
      this.GetImagingReqsAndReportsByStatus();
    }
  }
  CatchErrorLog(exception) {
    this.msgBoxServ.showMessage("error", ["Error ! check log for details."]);
    console.log(exception);
  }
}
