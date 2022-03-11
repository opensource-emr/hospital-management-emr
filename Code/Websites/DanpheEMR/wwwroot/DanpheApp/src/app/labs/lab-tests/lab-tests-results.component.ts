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
import { SecurityService } from '../../security/shared/security.service';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginToTelemed } from '../shared/labMasterData.model';
import { RouteFromService } from '../../shared/routefrom.service';


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

  @Input("hidePrintButton")
  public hidePrintButton: boolean = false;

  @Input() public verificationRequired: boolean = false;

  public templateReport: LabReportVM = null;
  public isEditResult: boolean = false;

  //this is used to enable edit of Lab Report Signatories
  @Input("enableEdit")
  public enableEdit: boolean = true;

  @Input("enableResultEdit")
  public enableResultEdit: boolean = false;

  @Input("TeleMedicineUploadForm")
  public TMForm : any;

  @Input("showUplaodToTeleMedicine")
  public showUplaodToTeleMedicine : boolean;

  public LabHeader: any = null;

  @Output("callbackAddUpdate") callbackAddUpdate: EventEmitter<object> = new EventEmitter<object>();
  @Output("callback-cancel") callbackCancel: EventEmitter<object> = new EventEmitter<object>();
  @Output("callbackUpdateUploadStatus") callbackUpdateUploadStatus : EventEmitter<any> = new EventEmitter<any>();


  public templateReportToEdit: LabReportVM = null;

  //sud: 19Sept'18 -- default column settings for 
  public defaultColumns = { "Name": true, "Result": true, "Range": true, "Method": false, "Unit": true, "Remarks": false };


  public showRangeInRangeDescription: boolean = false;
  public hospitalCode: string = '';

  public labReportFormat: string = 'format1';
  public allowOpWithProvToPrintReport: boolean = false;
  public resEditParam: boolean = false;
  public showReUploadPopup : boolean = false;
  TeleMedicineUploadForm: FormGroup = new FormGroup(
    {
      phoneNumber: new FormControl("",Validators.minLength(10)),
      firstName: new FormControl("",Validators.required),
      lastName: new FormControl("",Validators.required),
      email: new FormControl("")
    }
  )
  public Login = new LoginToTelemed();
  public TeleMedicineConfiguration : any;
  public IsTeleMedicineEnabled : boolean = false;
  public loading : boolean = false;
  public LabHeaderSetting : any;
  public IsFileUploaded : boolean = false;
  public interval : any;
  constructor(public labBLService: LabsBLService, public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService, public coreService: CoreService,public securityService : SecurityService,
    public routeFromService: RouteFromService) {
    this.showRangeInRangeDescription = this.coreService.EnableRangeInRangeDescriptionStep();
    this.allowOpWithProvToPrintReport = this.coreService.AllowOutpatientWithProvisional();
    this.hospitalCode = this.coreService.GetHospitalCode();
    this.labReportFormat = this.coreService.GetLabReportFormat();
    this.resEditParam = this.coreService.ShowEditResultButtonInLabFinalReport();
    this.LabHeaderSetting = this.coreService.GetLabReportHeaderSetting();
    let TeleMedicineConfig = this.coreService.Parameters.find(p =>p.ParameterGroupName == "TeleMedicine" && p.ParameterName == "DanpheConfigurationForTeleMedicine").ParameterValue;
    this.TeleMedicineConfiguration = JSON.parse(TeleMedicineConfig);
    this.Login.PhoneNumber = this.TeleMedicineConfiguration.PhoneNumber;
    this.Login.Password = this.TeleMedicineConfiguration.Password;
    this.IsTeleMedicineEnabled = JSON.parse(this.TeleMedicineConfiguration.IsTeleMedicineEnabled);
    if(this.IsTeleMedicineEnabled && this.routeFromService.RouteFrom == "finalReport"){
      this.routeFromService.RouteFrom = "";
      this.TeleMedLogin();
      this.interval = setInterval(()=>{
        this.TeleMedLogin();
      },this.TeleMedicineConfiguration.TokenExpiryTimeInMS)
    }
  }

  ngOnInit() {
    this.LabHeader = this.coreService.GetLabReportHeaderSetting();
    this.showHeader = this.LabHeader.showLabReportHeader;
    //this.verificationRequired = this.coreService.EnableVerificationStep();
    if(this.TMForm){
      this.TeleMedicineUploadForm.controls["firstName"].setValue(this.TMForm.firstName);
      this.TeleMedicineUploadForm.controls["lastName"].setValue(this.TMForm.lastName);
      this.TeleMedicineUploadForm.controls["phoneNumber"].setValue(this.TMForm.phoneNumber);
      this.TeleMedicineUploadForm.controls["email"].setValue(this.TMForm.email);
    }
  }

  ngOnDestroy(){
    if(this.interval)
    clearInterval(this.interval);
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
          this.enableResultEdit = !(this.templateReport && this.templateReport.ReportId && (this.templateReport.ReportId > 0)) || this.resEditParam;
          this.MapSequence();
          // this.requisitionIdList = [];
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
    this.templateReport.ValidToPrint = true;
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
        if (!this.allowOpWithProvToPrintReport) {
          var visitType = this.templateReport.Lookups.VisitType;
          var billStatus = test.BillingStatus;
          if (visitType && visitType.toLowerCase() == "outpatient" && billStatus && billStatus.toLowerCase() == "provisional") {
            this.templateReport.ValidToPrint = false;
          }
        }

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

  public ReportAddUpdateSuccess($event) {
    if ($event.added) {
      this.enableResultEdit = this.resEditParam;
    }
  }

  public TeleMedLogin(){
    this.labBLService.TeleMedLogin(this.TeleMedicineConfiguration.TeleMedicineBaseUrl,this.Login).subscribe(res=>{
      var token = res.token;
      sessionStorage.removeItem('TELEMED_Token');
      sessionStorage.setItem('TELEMED_Token', token);
    },
    err=>{
      console.log(err.ErrorMessage);
    }
    );
  }
  public exportToPdf() {
    this.coreService.loading = true;
   if(this.templateReport.IsFileUploadedToTeleMedicine || this.IsFileUploaded){
     this.showReUploadPopup = true;
   }
   else{
     this.UploadLabReportToTeleMedicine();
   }
 }

 public UploadLabReportToTeleMedicine(){
   this.showReUploadPopup = false;
  if(this.TeleMedicineUploadForm.controls["phoneNumber"].value && this.TeleMedicineUploadForm.controls["phoneNumber"].value.length >=10){
    const formData = new FormData();
    var dom = document.getElementById("lab-report-main");
    dom.style.border = "none";
    var domWidth = dom.style.width;
    dom.style.width = "1020px";
    html2canvas(dom, {
     useCORS: true,
     allowTaint: true,
      scrollY: 0 
     }).then((canvas) => 
     {
      const image = { type: 'jpeg', quality: 2 };
      const margin = [0.5, 0.5]; 
      var imgWidth = 8.5;
      var pageHeight : number;
      pageHeight = this.LabHeaderSetting.showLabReportHeader? 11 : 9;
      var innerPageWidth = imgWidth - margin[0] * 2; 
      var innerPageHeight = pageHeight - margin[1] * 2; 
      var pxFullHeight = canvas.height; 
      var pxPageHeight = Math.floor(canvas.width * (pageHeight / imgWidth)); 
      var nPages = Math.ceil(pxFullHeight / pxPageHeight); 
      var pageHeight = innerPageHeight; 
      var pageCanvas = document.createElement('canvas'); 
      var pageCtx = pageCanvas.getContext('2d');
       pageCanvas.width = canvas.width; 
       pageCanvas.height = pxPageHeight; 
       var pdf = new jsPDF('p', 'in', 'a4'); 
       for (var page = 0; page < nPages; page++)
        { 
           if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) 
           {
              pageCanvas.height = pxFullHeight % pxPageHeight;
              pageHeight = (pageCanvas.height * innerPageWidth) / pageCanvas.width;
           }
              var w = pageCanvas.width; 
              var h = pageCanvas.height;
               pageCtx.fillStyle = 'white';
                pageCtx.fillRect(0, 0, w, h); 
                pageCtx.drawImage(canvas, 5, page * pxPageHeight, w, h, 0, 0, w, h);
               if (page > 0) 
               pdf.addPage();
                var imgData = pageCanvas.toDataURL('image/' + image.type, image.quality); 
                if(this.LabHeaderSetting.showLabReportHeader)
                pdf.addImage(imgData, image.type, margin[1], margin[0], innerPageWidth, pageHeight);
                else
                pdf.addImage(imgData, image.type, margin[1],1.8, innerPageWidth, pageHeight);
         } 
         dom.style.width = domWidth;
             window.setTimeout(() => {
             var binary = pdf.output();
             const byteNumber = new Array(binary.length);
             for(let i=0;i<byteNumber.length;i++){
                 byteNumber[i]= binary.charCodeAt(i);
             }
             const byteArray = new Uint8Array(byteNumber);
             const blob = new Blob([byteArray],{type: 'application/pdf'});
             var fileName = this.TeleMedicineUploadForm.controls["firstName"].value+"_"+this.TeleMedicineUploadForm.controls["lastName"].value+"_"+"Lab_Report.pdf";
             const file = new File([blob],fileName,{type: 'application/pdf'});
             formData.append("Files",file, file.name);
             this.labBLService.uploadFile(this.TeleMedicineConfiguration.TeleMedicineBaseUrl,this.TeleMedicineUploadForm.value,formData).subscribe((res) => {
               if (res) {
                 this.msgBoxServ.showMessage('success', ['Lab Report is Successfully Uploaded.']);
                 this.labBLService.UpdateFileUploadStatus(this.requisitionIdList).subscribe((res)=>{
  
                 });
                 this.callbackUpdateUploadStatus.emit({requisition:this.requisitionIdList});
                 this.coreService.loading = false;
               }
             }, err => {
                 this.coreService.loading = false;
                 this.msgBoxServ.showMessage('error',['Something went wrong. Unable to uplaod lab report !!!.']);
                 this.IsFileUploaded = false;
               console.log(err);
             });
         }, 500)
              
     });
      this.IsFileUploaded = true;
   }
   else{
     this.coreService.loading = false;
     this.msgBoxServ.showMessage("warning",["Please Provide valid Phone Number to this patient."]);
   }
 }

 public closeConfirmationPopUp(){
   this.showReUploadPopup = false;
   this.coreService.loading = false;
 }
}
