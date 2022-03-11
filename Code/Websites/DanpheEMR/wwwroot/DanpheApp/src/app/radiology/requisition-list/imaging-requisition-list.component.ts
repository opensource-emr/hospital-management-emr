import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';

import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';

import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { ImagingItemReport, RadiologyScanDoneDetail } from '../shared/imaging-item-report.model';
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
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import { SecurityService } from "../../security/shared/security.service";
import { FilmTypeModel } from "../shared/imaging-film-type-model";
import { FilmTypeValidatorModel } from "../shared/imaging-filmtype-validator-model";

@Component({
  templateUrl: "./imaging-requisition-list.html" //  "/RadiologyView/ImagingRequisitionList"
})
export class ImagingRequisitionListComponent {

  public CurrentImagingReport: ImagingItemReport = new ImagingItemReport();
  public imagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public imagingReportsFiltered: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public imagingReportsLight: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  //public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
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

  public filmTypeList:Array<FilmTypeModel> = new Array<FilmTypeModel>();// Alll list that comes from database
  public filteredFilmTypeList:Array<FilmTypeModel> = new Array<FilmTypeModel>(); //Filtered list for selected type
  public filmList:any;
  public displayFilmDetail:boolean = false;
  public selectedFilmType = { FilmTypeId:null, FilmTypeDisplayName:null};
  public filmTypeValidatorModel: FilmTypeValidatorModel = new FilmTypeValidatorModel();
  public isFilmTypeValid:boolean = true;

  //used to pass value to rangeType in custom-date
  public dateRange: string = "last1Week";  //by default show last 1 week data.;


  public fileFromDate: string = null;
  public fileToDate: string = null;


  public reqFromDate: string = null;
  public reqToDate: string = null;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();//sud:1June'20

  //selected Imaging Type to  display in the grid.
  public selImgType: any;
  public allValidImgTypeList: Array<number> = new Array<number>();

  public loadingGridData: boolean = false;
  public showScanDone: boolean = false;
  public scanDetail: RadiologyScanDoneDetail = new RadiologyScanDoneDetail();
  public enableDoctorUpdateFromSignatory: boolean = false;



  constructor(public visitService: VisitService,
    public patientService: PatientService,
    public imagingBLService: ImagingBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
   
    public sanitizer: DomSanitizer) {

    //this.getImagingType();
    this.selectedFilmType=null;
    this.getFilmTypeData();

    this.GetButtonBehavior();
    this.imgReqListGridColumns = this.getRadRequisitionListFilteredColumns(this.coreService.GetRadRequisitionListColmArr());
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreatedOn', true));
    //this.GetImagingReqsAndReportsByStatus();//don't need this here since gridOnchange gets called automatically after loading.
    this.enableDoctorUpdateFromSignatory = this.coreService.UpdateAssignedToDoctorFromAddReportSignatory();
  }
  ngOnInit(){
    this.filmList = [];
    this.filteredFilmTypeList =[];
    
  }
  
  getFilmTypeData(){
    this.imagingBLService.GetFilmTypeData()
    .subscribe(res => {
      if (res.Status == "OK") {
        this.filmTypeList = res.Results;
       
      }
      else
        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    });

  }

  
  getRadRequisitionListFilteredColumns(columnObj: any): Array<any> {
    let cols = GridColumnSettings.ImagingRequisitionListSearch;
    var filteredColumns = [];
    if (columnObj) {
      for (var prop in columnObj) {
        if (columnObj[prop] == true || columnObj[prop] == 1) {
          var headername: string = prop;
          var ind = cols.find(val => val.headerName.toLowerCase().replace(/ +/g, "") == headername.toLowerCase().replace(/ +/g, ""));
          if (ind) {
            filteredColumns.push(ind);
          }
        }
      }
    }
    else {
      return cols;
    }

    if (filteredColumns.length) {
      return filteredColumns;
    } else {
      return cols;
    }
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


  ImagingTypeDropdownOnChange($event) {
    this.selImgType = $event.selectedType;
    this.allValidImgTypeList = $event.typeList;
    this.GetImagingReqsAndReportsByStatus(this.reqFromDate, this.reqToDate);
  }

  //gets active imaging request and pending imaging reports.
  GetImagingReqsAndReportsByStatus(fromDate, toDate): void {
    if ((this.selImgType > 0) || (this.selImgType == -1)) {
      this.imagingBLService.GetImagingReqsAndReportsByStatus(fromDate, toDate, this.allValidImgTypeList)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.imagingReports = res.Results;
            this.imagingReportsFiltered = res.Results;
            //this.imagingReports.forEach(x => {
            //  x.IsShowButton = this.isShowButton;
            //  x.ProviderName= x.ProviderName ? x.ProviderName:'self';
            //});
            //if (this.selImgType == 'All') {
            //  this.imagingReportsFiltered = this.imagingReports.filter(x => x.IsActive == true);

            //} else {
            //  this.imagingReportsFiltered = this.imagingReports.filter(x => (x.ImagingTypeName == this.selImgType) && (x.IsActive == true));
            //}
            this.enablePreview = true;
          }
          else
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        });
    }
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
          this.imagingBLService.AddImgItemReport(filesToUpload, selReport, orderStatus, this.enableDoctorUpdateFromSignatory)
            .subscribe(res => {
              this.loading = false;
              if (res.Status == "OK") {
                this.GetImagingReqsAndReportsByStatus(this.reqFromDate, this.reqToDate);
                this.selectedReport.ImagingReportId = res.Results.ImagingReportId;
                this.showreport = false;
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
      case "show-edit-report":
        {
          var selReport = Object.assign({}, $event.Data);
          this.GetImagingReportContent(selReport, $event.RowIndex);//get content and show edit report page
        }
        break;
      case "upload-imging-files":
        {
          this.LoadScannedImageList($event.Data, $event.RowIndex);
        }
        break;
      case "scan-done":
        {
          this.scanDetail = new RadiologyScanDoneDetail();
          this.scanDetail.ScannedOn = moment().format("YYYY-MM-DD HH:mm");
          this.scanDetail.ImagingRequisitionId = $event.Data.ImagingRequisitionId;
          this.scanDetail.PatientCode = $event.Data.Patient.PatientCode;
          this.scanDetail.ShortName = $event.Data.Patient.ShortName;
          this.filmList =[];
          this.displayFilmDetail = false;
          this.selectedFilmType=null;
          this.filteredFilmTypeList = this.filmTypeList.filter(a=>a.ImagingTypeId == $event.Data.ImagingTypeId);
          if(this.filteredFilmTypeList.length>0){
            this.displayFilmDetail = true;
            this.filteredFilmTypeList.forEach(a => {
              this.filmList.push({"FilmTypeId":a.FilmTypeId,"FilmTypeDisplayName":a.FilmTypeDisplayName});
            });
            
          }
          // this.filmList.push({"FilmTypeId":"1","FilmType":"8*10"});
          // this.filmList.push({"FilmTypeId":"2","FilmType":"87*10"});
          //let ind = this.imagingReports.findIndex(r => r.ImagingRequisitionId == reqId);
          this.showScanDone = true;
        }
        break;

      default:
        break;
    }
  }

  SaveScanData() {
    this.filmTypeValidatorModel.UpdateValidator("on","FilmType","required");
    if(!this.displayFilmDetail){
      this.filmTypeValidatorModel.UpdateValidator("off", "FilmType", null);
    }
    for (var i in this.filmTypeValidatorModel.FilmTypeValidator.controls) {
      this.filmTypeValidatorModel.FilmTypeValidator.controls[i].markAsDirty();
      this.filmTypeValidatorModel.FilmTypeValidator.controls[i].updateValueAndValidity();
    }
    if (this.filmTypeValidatorModel.IsValidCheck(undefined, undefined)) {
      if(this.displayFilmDetail){
        if(this.selectedFilmType.FilmTypeId >0){
      
          this.scanDetail.FilmTypeId= this.selectedFilmType.FilmTypeId;
          this.putScan();
        }
        else{
          this.resetValididation();
          this.isFilmTypeValid=false;
          this.msgBoxServ.showMessage('error',["Sorry FilmType is Invalid"]);
          this.loadingGridData = false;
          this.loading=false;
        }

      }
      else{
          this.putScan();
      }
    }
    else{
      this.loadingGridData = false;
      this.loading=false;
    }
  }

  putScan(){
    this.loadingGridData = true;
    if (this.loading) {
      console.log(this.scanDetail);
      this.resetValididation();
      this.imagingBLService.PutScannedDetails(this.scanDetail)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.changeDetector.detectChanges();
            this.GetImagingReqsAndReportsByStatus(this.reqFromDate, this.reqToDate);
            this.loadingGridData = false;
            this.loading = false;
            this.msgBoxServ.showMessage('success', ["Scan detail Updated"]);
            this.showScanDone = false;
          } else {
            this.changeDetector.detectChanges();
            this.loadingGridData = false;
            this.loading = false;
            this.msgBoxServ.showMessage('error', ["Sorry Scan detail cannot be Updated at this time"]);
          }
        },
          err => {
            this.changeDetector.detectChanges();
            this.loadingGridData = false;
            this.loading = false;
            this.msgBoxServ.showMessage('error', ["Sorry Scan detail cannot be Updated at this time"]);
          });
    }

  }

  CancelScan() {
    this.resetValididation();
    this.showScanDone = false;
  }

  resetValididation(){
    this.filmTypeValidatorModel.UpdateValidator("off", "FilmType", null);
    this.filmTypeValidatorModel.FilmTypeValidator.controls["FilmType"].markAsDirty();
    this.filmTypeValidatorModel.FilmTypeValidator.controls["FilmType"].updateValueAndValidity();
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
            selReport.ScannedOn = res.Results.ScannedOn;
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
      this.fileFromDate = $event.fileFromDate;
      this.fileToDate = $event.fileToDate;
      var fromDateCheckflag = moment(this.fileFromDate, 'YYYY-MM-DD HH:mm', true).isValid();
      var toDateCheckflag = moment(this.fileFromDate, 'YYYY-MM-DD HH:mm', true).isValid();
      if (fromDateCheckflag == true && toDateCheckflag == true) {
        this.imagingBLService.GetImgFileList(this.fileFromDate, this.fileToDate)
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

  onGridDateChange($event) {
    this.reqFromDate = $event.fromDate;
    this.reqToDate = $event.toDate;
    if (this.reqFromDate != null && this.reqToDate != null) {
      if (moment(this.reqFromDate).isBefore(this.reqToDate) || moment(this.reqFromDate).isSame(this.reqToDate)) {
        this.GetImagingReqsAndReportsByStatus(this.reqFromDate, this.reqToDate)
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }
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

  ////get list of report of the selected patient.
  //GetPatientReportsByImagineType(frmDate: string, fileToDate: string): void {

  //  this.imagingBLService.GetAllImagingReports(frmDate, fileToDate)
  //    .subscribe(res => {
  //      if ((res.Status == "OK") && (res.Results != null)) {
  //        this.imagingReports = res.Results;
  //        if (this.selImgType == 'All') {
  //          this.imagingReportsFiltered = this.imagingReports;
  //        } else {
  //          this.imagingReportsFiltered = this.imagingReports.filter(x => x.ImagingTypeName == this.selImgType);
  //        }

  //        this.imagingReportsFiltered.forEach(val => {
  //          if (val.Signatories) {
  //            let signatures = JSON.parse(val.Signatories);
  //            var name = '';
  //            for (var i = 0; i < signatures.length; i++) {
  //              if (signatures[i].EmployeeFullName) {
  //                name = name + signatures[i].EmployeeFullName + ((i + 1 == signatures.length) ? '' : ' , ');
  //              }
  //            }
  //            val.ReportingDoctorNamesFromSignatories = name;
  //          } else {
  //            val.ReportingDoctorNamesFromSignatories = '';
  //          }
  //        });
  //        this.enablePreview = true;
  //      }
  //      else {
  //        this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //      }
  //    });
  //}

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
    this.resetValididation();
    try {
      this.showFileList = false;
      this.patientDetails = new Patient();
    } catch (exception) {
      this.CatchErrorLog(exception);
    }
  }
  GetBackOnClose($event) {
    if ($event.Submit) {
      this.GetImagingReqsAndReportsByStatus(this.reqFromDate, this.reqToDate);
    }
  }
  CatchErrorLog(exception) {
    this.msgBoxServ.showMessage("error", ["Error ! check log for details."]);
    console.log(exception);
  }

  FilmTypeListFormatter(data: any): string {
    let html = data["FilmTypeDisplayName"];
    return html;
  }
  loadFilmType() {
    this.filmTypeValidatorModel.FilmType = this.selectedFilmType ? this.selectedFilmType.FilmTypeDisplayName : null;
  }

    
}
