
import { Component, Directive, ChangeDetectorRef, SecurityContext, ViewChild, Renderer2 } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Patient } from '../../../patients/shared/patient.model';
import { ImagingItemReport, ImagingReportViewModel } from '../../shared/imaging-item-report.model';
import { ImagingBLService } from "../imaging.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { Lightbox } from 'angular2-lightbox';
import { DLService } from "../../../shared/dl.service";
import * as moment from 'moment/moment';
import { RadiologyService } from '../radiology-service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DicomService } from '../../../shared/danphe-dicom-viewer/shared/dicom.service';
import { CoreService } from '../../../../../src/app/core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RadEmailModel, ImageAttachmentModel } from '../rad-email.model';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { CoreCFGEmailSettingsModel } from '../CoreCFGEmailSettings.model';
import { CompileReflector } from '@angular/compiler';

@Component({
  selector: "danphe-view-imaging-report",
  templateUrl: "./view-report.html",
  styleUrls: ['./rad-view-report.style.css']
})
export class ViewReportComponent {

  public report: ImagingReportViewModel = new ImagingReportViewModel();
  //requisitionId used instead of reportId because we're using using this component in patientoverview page where getting list of requisitions.
  @Input("requisitionId")
  public requisitionId: number = null;
  public displayFullSizeImage: boolean = false;
  public album = [];
  public reportHtml;
  public enableImageUpload: boolean = false;
  public enableDicomImages: boolean = false;//sud:18Aug'19--separated param for dicom.
  public reportHeader: any;
  public showStudy: boolean = false;

  @Output("on-report-edit")
  onReportEdit: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("print-without-preview")
  printWithoutPreview: boolean = false;

  public showChangeReferrerPopUp: boolean = false;

  public doctorSelected: any;
  public hospitalCode: string = null;
  public topHeightInReportClass: string = '';

  public loggedInUserId: number = null;
  public showDigitalSignatureImage: boolean = true;
  public showEmailDataBox: boolean = false;
  public radEmail: RadEmailModel = null;
  public loading: boolean = false;
  public emailSettings: CoreCFGEmailSettingsModel = new CoreCFGEmailSettingsModel();

  public imageUploadFolderPath: string = null;//sud:18Aug'19--for radiology image upload.

  public ExtRefSettings = null;
  public enableDoctorUpdateFromSignatory: boolean = false;

  printDetails: any;
  showPrint: boolean;
  constructor(public imagingBLService: ImagingBLService, public coreService: CoreService,
    public radiologyService: RadiologyService, public securityService: SecurityService,
    public messageBoxService: MessageboxService,
    public lightbox: Lightbox, public dlService: DLService,
    public sanitizer: DomSanitizer,
    public changeDetector: ChangeDetectorRef,
    public _router: Router,
    public _dicomService: DicomService, public renderer: Renderer2, public http: HttpClient

  ) {

    this.report.ReportText = "";
    this.enableImageUpload = this.radiologyService.EnableImageUpload();
    this.enableDicomImages = this.radiologyService.EnableDicomImages();
    this.reportHeader = this.radiologyService.ReportHeader;
    this.hospitalCode = this.coreService.GetHospitalCode();
    this.loggedInUserId = this.securityService.loggedInUser.EmployeeId;
    this.emailSettings = this.coreService.GetEmailSettings();
    this.enableDoctorUpdateFromSignatory = this.coreService.UpdateAssignedToDoctorFromAddReportSignatory();

    if (this.hospitalCode && this.hospitalCode.toLowerCase() == 'mnk') {
      this.topHeightInReportClass = 'mnk-rad-hdr-gap default-radheader-gap';
    }
    else {
      this.topHeightInReportClass = 'rad-hdr-gap default-radheader-gap';
    }


    this.imageUploadFolderPath = this.radiologyService.GetImageUploadFolderPath();
    this.ExtRefSettings = this.radiologyService.GetExtReferrerSettings();
    this.RptHdrSettng = this.ReportHeaderPatientNameSettings();

  }


  //start: sud: 2July'19: For Keyboard Shortcuts..
  globalListenFunc: () => void;
  ngOnDestroy() {
    // remove listener
    if (this.globalListenFunc) {
      this.globalListenFunc();
    }
  }

  ngAfterViewInit() {
    //CTRL+P  -> FOR Printing.
    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      var kc = e.which || e.keyCode;
      if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "P") {
        e.preventDefault();
        this.PrintReportHTML();

      }
      //else if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "E") {
      //  e.preventDefault();
      //  this.EditReport();
      //}
    });
  }

  public showImagingReport: boolean = false;
  public isReportLoadCompleted: boolean = false;

  ngOnInit() {
    if (this.requisitionId) {
      this.GetImagingReport(this.printWithoutPreview);
    }
  }

  ngAfterViewChecked() {
    var doc = document.getElementById("print_page_end");
    // this is callback method. so,print function called while condition is matched.
    if (doc && this.printWithoutPreview && this.isReportLoadCompleted) {
      this.PrintReportHTML();
      this.isReportLoadCompleted = false;
    }
  }


  public GetImagingReport(printWoPreview: boolean = false) {

    this.imagingBLService.GetImagingReportByRequisitionId(this.requisitionId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {

          this.report = res.Results;
          //IMPORTANT: sanitizer.bypassSecurity : Needed to retain style/css of innerHTML !! --sud:12Apr'18'
          let rptText = res.Results.ReportText;
          this.report.ReportText = this.sanitizer.bypassSecurityTrustHtml(rptText);

          this.report.Signatories = JSON.parse(this.report.Signatories);

          this.SetPatHeaderOnLoad();

          this.SetImagePath();

          this.showImagingReport = true;
          this.isReportLoadCompleted = true;
          this.printWithoutPreview = printWoPreview;

        }
        else {
          this.messageBoxService.showMessage("failed", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }

      });
  }

  public SetImagePath() {
    //ImageName contains names of multiple images seperated by ';'
    //split the string ImageName into array pathToImage.
    if (this.report.ImageName) {
      this.album = [];
      let groupOf3Img = [];//push 3 images at a time to this variable, and push the array in album variable above.

      let imageNames = this.report.ImageName.split(";");
      imageNames.forEach(imgName => {

        // let imgPath = "/app/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
        let imgPath = "/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
        //let imgPath = this.imageUploadFolderPath + this.report.ImagingTypeName + "/" + imgName;

        const image = {
          src: imgPath,
          caption: imgName,
          thumb: null
        }

        groupOf3Img.push(image);
        //if groupOf3Img is full (length=3) then push it to album[] and clear it again.
        if (groupOf3Img.length == 3) {
          this.album.push(groupOf3Img);
          groupOf3Img = [];
        }

      });

      //push remaining images to album[] array, if any (there may be 1 or 2 images (max) since they won't be pushed inside loop.)
      if (groupOf3Img.length > 0) {
        this.album.push(groupOf3Img);
      }

    }
    this.showImagingReport = true;
  }

  OpenLightBox(vIndex: number, hIndex: number): void {
    // open lightbox
    this.lightbox.open(this.album[vIndex], hIndex);
  }

  Close() {
    this.report = null;
    this.requisitionId = null;
    this.showImagingReport = false;
    this.album = [];
    this.onReportEdit.emit({ Submit: true });
  }


  PrintReportHTML() {
    var printContents = document.getElementById("printpage").innerHTML;
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head><style>.no-print{display: none;} .patient-hdr-label{margin: 2px 0;}</style>';
    documentContent += '<body>' + printContents + '</body></html>'
    this.printDetails=documentContent;
    this.showPrint = true;
    this.showImagingReport=false;
  }

  callBackPrint() {
    setTimeout(()=>{
      this.printDetails = null;
      this.showPrint = false;
    },300);
  }
  
  //method to show dicomImages according to PatientStudyId..
  ViewScannedImages() {

    try {
      if (this.report.PatientStudyId) {
        this.showStudy = false;
        this.changeDetector.detectChanges();
        this._dicomService.patientStudyId = this.report.PatientStudyId;
        this.showStudy = true;
      } else {
        this.messageBoxService.showMessage("notice", ['Mapped Images not found.']);
      }
    } catch (exception) {
      console.log(exception);
      this.messageBoxService.showMessage("error", ['Error details check in console log']);
    }

  }

  //start: sud-14Jan'19--For Edit Reports

  public showEditReportWindow: boolean = false;
  public reportToEdit: ImagingReportViewModel = null;
  public currentPatient: Patient = null;
  EditReport() {

    this.reportToEdit = Object.assign({}, this.report);
    this.reportToEdit.ProviderId = this.report.ProviderId;

    this.currentPatient = <Patient>{
      PatientId: this.report.PatientId,
      ShortName: this.report.PatientName,
      Address: this.report.Address,
      PhoneNumber: this.report.PhoneNumber,
      DateOfBirth: this.report.DateOfBirth,
      Gender: this.report.Gender,
      PatientCode: this.report.PatientCode

    };

    this.selectedRefName = this.reportToEdit.ProviderName;
    this.selectedRefId = this.reportToEdit.ProviderId;
    this.showEditReportWindow = false;
    this.showImagingReport = true;
    this.changeDetector.detectChanges();
    this.showImagingReport = false;
    this.reportToEdit.Signatories = JSON.stringify(this.report.Signatories);
    this.reportToEdit.ReportText = this.sanitizer.sanitize(SecurityContext.HTML, this.report.ReportText);
    this.showEditReportWindow = true;

  }



  //post report called from post-report component using event emitter.
  UpdatePatientReport($event): void {

    try {

      let selReport = $event.report;
      let printReport = false;
      let isUpdate: boolean = false;
      if ($event.orderStatus == "print") {
        printReport = true;
        $event.orderStatus = "pending";
      }

      if (selReport.ImagingReportId)
        isUpdate = true;
      let orderStatus = $event.orderStatus;
      //now we're getting report files separately.
      let filesToUpload = $event.reportFiles;
      this.album = [];//need to empty the album since it's showing duplicate images: sud:21Oct'19

      //filesToUpload,selReport,OrderStatus
      this.imagingBLService.AddImgItemReport(filesToUpload, selReport, orderStatus, this.enableDoctorUpdateFromSignatory)
        .subscribe(res => {

          if (res.Status == "OK") {
            this.showEditReportWindow = true;
            this.showImagingReport = false;
            this.changeDetector.detectChanges();
            this.report = new ImagingReportViewModel();//reset the value of current report, it'll be loaded again from function below..
            this.showEditReportWindow = false;
            this.showImagingReport = true;
            this.GetImagingReport(true);//assigning printWithoutPreview argument true to print after view page loaded completly.
          }

        });

    } catch (exception) {
      //this.msgBoxServ.showMessage("error", ['check console log for detail error..!']);
      console.log(exception);
    }

  }


  OpenChangeDocPopup() {
    this.showChangeReferrerPopUp = false;
    this.selectedRefId = null;
    this.changeDetector.detectChanges();
    this.showChangeReferrerPopUp = true;
  }



  closeReferrerPopup() {
    this.showChangeReferrerPopUp = false;
  }



  UpdateReferredByDrToDB() {

    if (!this.selectedRefId && !this.selectedRefName) {
      this.messageBoxService.showMessage("failed", ["No Doctor Selected or Written."]);
    }
    else {
      if (this.requisitionId) {
        //if selected refId is null or undefined or empty then make it zero (see previous logic)
        if (!this.selectedRefId) {
          this.selectedRefId = 0;
        }

        if (this.selectedRefName && this.selectedRefName.trim() != '') {
          this.imagingBLService.PutDoctor(this.selectedRefId, this.selectedRefName, this.requisitionId)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.report["ProviderName"] = res.Results;
                this.messageBoxService.showMessage("success", ["Doctor Updated"]);
                this.doctorSelected = '';
              }
              else {
                this.doctorSelected = '';
                this.messageBoxService.showMessage("failed", ["Doctor Name cannot be Updated in your Lab Report"]);
              }
            });
        }
        else {
          this.messageBoxService.showMessage("failed", ["No Doctor Selected or Written."]);
          this.doctorSelected = '';
        }

      }
      else {
        this.messageBoxService.showMessage("failed", ["There is no requisitions !!"]);
      }
    }

    this.showChangeReferrerPopUp = false;

  }


  RemoveSignatureImage() {
    if (this.showDigitalSignatureImage) {
      this.showDigitalSignatureImage = false;
      document.getElementById("btnShowHideSignaImage").innerHTML = "Show Image";
    } else {
      this.showDigitalSignatureImage = true;
      document.getElementById("btnShowHideSignaImage").innerHTML = "Hide Signature";
    }

  }

  CloseSendEmailPopUp() {
    this.showEmailDataBox = false;
  }


  ProcessSendingData() {
    this.loading = false;

    this.radEmail = new RadEmailModel();

    if (this.emailSettings.PdfContent) {
      html2canvas(document.getElementById("printpage"), {
        scale: 1
      }).then(canvas => {
        var image = canvas.toDataURL("image/png");
        var ratio = canvas.width / canvas.height;
        var imageWidth = 210;
        var imageHeight = imageWidth / ratio;

        var pdfSize: any = [210, imageHeight];

        var doc = new jsPDF('p', 'mm', pdfSize);
        doc.addImage(image, 'PNG', 0, 0, 210, imageHeight);
        var binary = doc.output();
        this.radEmail.PdfBase64 = btoa(binary);
        this.radEmail.AttachmentFileName = this.report.PatientName + "-" + moment().format("YYMMDDHHmm") + '.pdf';
      });
    }

    this.radEmail.SendHtml = this.emailSettings.TextContent;
    this.radEmail.SendPdf = this.emailSettings.PdfContent;
    this.radEmail.SenderTitle = this.emailSettings.SenderTitle;
    this.radEmail.SenderEmailAddress = this.emailSettings.SenderEmail;
    this.radEmail.Subject = 'Report of ' + this.report.PatientName;

    this.LoadEmailAttachments_Images();


  }


  public attachmentImages = [];

  public LoadEmailAttachments_Images() {
    if (this.report.ImageName) {
      this.attachmentImages = [];
      let albumTemp = [];
      let imageNames = this.report.ImageName.split(";");
      let count: number = 1;
      let patName = this.report.PatientName;
      let todayDate = moment().format("YYYYMMDD_HHmmss");
      imageNames.forEach(imgName => {
        let imgPath = "/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
        this.ConvertImgSrcUrlToBase64(imgPath, function (dataUri) {
          let img: ImageAttachmentModel = new ImageAttachmentModel();
          //we've to send only the base64 content. dataUri format includes the string: data:image/png.. in its value so we're replacing it with empty string.
          img.src = dataUri;//this will be used to show preview on email box.
          img.ImageBase64 = dataUri.replace("data:image/png;base64,", "");
          img.ImageName = patName + "_" + todayDate + "_" + count.toString();
          img.IsSelected = true;
          ////everytime count increases, re-assign to preview image count.
          count++;
          albumTemp.push(img);
        });
      });

      //this.attachmentImages = albumTemp;
      this.radEmail.ImageAttachments_Preview = albumTemp;
      this.email_previewImage_Count = imageNames.length;
    }
  }



  public ConvertImgSrcUrlToBase64(url, callback) {
    let image = new Image();
    image.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = image.width; // or 'width' if you want a special/scaled size //this.naturalWidth
      canvas.height = image.height; // or 'height' if you want a special/scaled size //this.naturalHeight
      canvas.getContext('2d').drawImage(image, 0, 0);
      // Get raw image data
      callback(canvas.toDataURL('image/png'));
      //callback(canvas.toDataURL(''));
    };

    image.src = url;
  }


  public email_showImagePreview: boolean = false;
  public email_previewImage_Src: string = null;
  public email_previewImage_Count: number = 0;



  email_imagePreview_onMouseOver(imgObj): void {
    this.email_previewImage_Src = imgObj.src;
    this.email_showImagePreview = true;
  }

  email_imagePreview_onMouseOut(): void {
    this.email_showImagePreview = false;
  }

  ImgPreviewChkOnChange() {
    this.email_previewImage_Count = this.radEmail.ImageAttachments_Preview.filter(a => a.IsSelected == true).length;
  }

  public SendEmail() {
    if (this.emailSettings.TextContent) {
      //we have to take only text content, image won't be sent.
      var itemDiv = document.getElementById("rptContentNoImage").innerHTML;
      let data = this.sanitizer.sanitize(SecurityContext.HTML, itemDiv);

      this.radEmail.HtmlContent = data;
    }


    if (this.radEmail && (this.radEmail.SendHtml || this.radEmail.SendPdf)) {
      this.radEmail.EmailList = new Array<string>();
      for (var valCtrls in this.radEmail.RadEmailValidator.controls) {
        this.radEmail.RadEmailValidator.controls[valCtrls].markAsDirty();
        this.radEmail.RadEmailValidator.controls[valCtrls].updateValueAndValidity();
      }

      if (this.radEmail.IsValidCheck(undefined, undefined)) {

        var emailList = this.radEmail.EmailAddress.split(";");
        var allEmailIsValid = true;

        emailList.forEach(value => {
          if (value) {//if user provides semicolon after Only one Email, split will create two objects in array, second with empty space.
            if (this.ValidateEmail(value)) {
              this.radEmail.EmailList.push(value);
            } else {
              allEmailIsValid = false;
            }
          }
        });

        if (allEmailIsValid) {
          //console.log(this.radEmail);
          //remove unselected images before sending.
          this.radEmail.ImageAttachments = this.radEmail.ImageAttachments_Preview.filter(a => a.IsSelected == true);

          if (this.radEmail.ImageAttachments.length > 5) {
            this.messageBoxService.showMessage("error", ["Cannot attach more than 5 images, please remove some and send again."]);
            this.loading = false;
            return;
          }

          this.imagingBLService.sendEmail(this.radEmail)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.messageBoxService.showMessage('success', ['Email sent successfuly.']);
                this.loading = false;
                this.CloseSendEmailPopUp();
              } else {
                this.messageBoxService.showMessage('failed', ['Email could not be sent, please try later.']);
                this.loading = false;
              }
            });
        } else {
          this.messageBoxService.showMessage('error', ['Invalid EmailAddress entered, Please correct it.']);
          this.loading = false;
        }
      } else {
        this.loading = false;
      }
    } else {
      this.messageBoxService.showMessage('failed', ['Email Sending Parameter has all the types of Email to send made False.']);
      this.loading = false;
    }
  }

  public ValidateEmail(email): boolean {
    var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(email);
  }


  //prat: 20sep2019 for internal and external referrer 
  public defaultExtRef: boolean = false;
  selectedRefId: number = null;
  selectedRefName: string = null;

  OnReferrerChanged($event) {
    this.selectedRefId = $event.ReferrerId; //EmployeeId comes as ReferrerId from select referrer component.
    this.selectedRefName = $event.ReferrerName;//EmployeeName comes as ReferrerName from select referrer component.

  }

  //end: Pratik: 20Sept'19--For External Referrals


  //start: Pratik:20Sept show Patient Name of Report Header in Local Language

  public isLocalNameSelected: boolean = false;
  public PatientNameToDisplay: string = null;


  SetPatHeaderOnLoad() {

    if (this.RptHdrSettng.LocalNameEnabled) {
      if (this.RptHdrSettng.DefaultLocalLang) {
        this.isLocalNameSelected = true;//if default local language then  isLocalName should be true
        if (this.report.PatientNameLocal) {
          this.PatientNameToDisplay = this.report.PatientNameLocal;
        }
        else {
          this.switchLocalLang();
        }
      }
      else {
        this.PatientNameToDisplay = this.report.PatientName;
      }

    }
    else {
      this.PatientNameToDisplay = this.report.PatientName;
    }
  }


  public switchLocalLang() {
    this.isLocalNameSelected = !this.isLocalNameSelected;

    if (this.isLocalNameSelected) {
      if (this.report.PatientNameLocal) {
        this.PatientNameToDisplay = this.report.PatientNameLocal;
      }
      else {
        this.messageBoxService.showMessage("notice", ["Patient Name not found in LOCAL Language."]);
        this.isLocalNameSelected = false;
      }
    }
    else {
      this.PatientNameToDisplay = this.report.PatientName;
    }
  }

  public RptHdrSettng = { LocalNameEnabled: true, DefaultLocalLang: true };//this is default value for rptHdr
  public ReportHeaderPatientNameSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Radiology" && a.ParameterName == "ReportHeaderPatientNameSettings");
    if (currParam && currParam.ParameterValue) {
      return JSON.parse(currParam.ParameterValue);
    }
    else {
      return { LocalNameEnabled: false, DefaultLocalLang: false };
    }
  }

  //end: Pratik:20Sept show Patient Name of Report Header in Local Language

}

