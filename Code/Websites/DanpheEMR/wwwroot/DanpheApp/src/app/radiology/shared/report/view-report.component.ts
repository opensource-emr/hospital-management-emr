
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
import { RadEmailModel } from '../rad-email.model';
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { CoreCFGEmailSettingsModel } from '../CoreCFGEmailSettings.model';

@Component({
  selector: "danphe-view-imaging-report",
  templateUrl: "./view-report.html",
  styles: [`.rad-single-signature{flex: 0 0 33%;padding: 15px;}
.main-rad-sgn{float: right;text-align: left;}
.rad-signature{white-space: pre-line;padding-top: 10px;margin-top: 50px;border-top: 2px dashed;}
.flow-hr-reverse{flex-direction: row-reverse;}
.rad-hdr-flex-col{padding: 3px 0px;}
.rad-hdr-flex-col:nth-child(odd) {flex-basis: 50%;}
.rad-hdr-flex-col:nth-child(even) {flex-basis: 40%;}
.border-wrap{border: 1px solid;padding: 10px;}
.rad-report-holder{margin-top: 15px;}
.ref-label{margin-bottom: 0; line-height:36px;}`]
})
export class ViewReportComponent {
  public showImagingReport: boolean = false;
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

  public showPopUp: boolean = false;
  public doctorsList: Array<any> = [];
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

    if (this.hospitalCode && this.hospitalCode.toLowerCase() == 'mnk') {
      this.topHeightInReportClass = 'mnk-rad-hdr-gap default-radheader-gap';
    } else {
      this.topHeightInReportClass = 'rad-hdr-gap default-radheader-gap';
    }

    this.GetDoctorsList();

    this.imageUploadFolderPath = this.radiologyService.GetImageUploadFolderPath();

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


  @Input("showImagingReport")
  public set value(val: boolean) {
    if (val && this.requisitionId) {
      this.GetImagingReport();
    }
    else
      this.showImagingReport = false;
  }

  public GetDoctorsList() {
    this.imagingBLService.GetDoctorsList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          if (res.Results.length) {
            this.doctorsList = res.Results;
          }
          else {
            console.log(res.ErrorMessage);
          }
        }
      },
        err => {
          this.messageBoxService.showMessage('Failed', ["unable to get Doctors list.. check log for more details."]);
        });
  }

  public GetImagingReport() {
    this.imagingBLService.GetImagingReportByRequisitionId(this.requisitionId)
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.report = res.Results;
          //IMPORTANT: sanitizer.bypassSecurity : Needed to retain style/css of innerHTML !! --sud:12Apr'18'
          let rptText = res.Results.ReportText;
          this.report.ReportText = this.sanitizer.bypassSecurityTrustHtml(rptText);

          //this.report.DoctorSignatureJSON = JSON.parse(this.report.DoctorSignatureJSON);
          this.report.Signatories = JSON.parse(this.report.Signatories);

          //var signatoryArray = JSON.parse(this.report.Signatories);
          //var userSignedIn = signatoryArray.find(a => a.EmployeeId == this.loggedInUserId);
          //if (userSignedIn && this.report.SignatoryImageBase64) {
          //  this.showDigitalSignatureImage = true;
          //}

          this.SetImagePath();
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
      let imageNames = this.report.ImageName.split(";");
      imageNames.forEach(imgName => {

       // let imgPath = "/app/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
        let imgPath = "/DanpheApp/src/app/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
        //let imgPath = this.imageUploadFolderPath + this.report.ImagingTypeName + "/" + imgName;

        const image = {
          src: imgPath,
          caption: imgName,
          thumb: null
        }
        this.album.push(image);
      });
    }
    this.showImagingReport = true;
  }
  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.album, index);
  }
  Close() {
    this.report = null;
    this.requisitionId = null;
    this.showImagingReport = false;
    this.album = [];
    this.onReportEdit.emit({ Submit: true });
  }

  PrintReport() {
    this.dlService.ReadExcel("/RadiologyReport/GetImagingReport?reportId=" + this.report.ImagingReportId)
      .map(res => res)
      .subscribe(res => {
        let blob = res;
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = this.report.PatientName + " " + this.report.ImagingItemName + " " + moment().format("DD-MMM-YYYY_HHmmA") + '.docx';
        document.body.appendChild(a);
        a.click();

      },
        err => {
          console.log(err.ErrorMessage);
        });
  }
  PrintReportHTML() {
    let popupWinindow;
    var printContents = document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();

    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head><style>.no-print{display: none;} .patient-hdr-label{margin: 2px 0;}</style>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'

    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
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
    this.currentPatient = <Patient>{
      PatientId: this.report.PatientId,
      ShortName: this.report.PatientName,
      Address: this.report.Address,
      PhoneNumber: this.report.PhoneNumber,
      DateOfBirth: this.report.DateOfBirth,
      Gender: this.report.Gender,
      PatientCode: this.report.PatientCode
    };
    this.showEditReportWindow = false;
    this.showImagingReport = true;
    this.changeDetector.detectChanges();
    this.showImagingReport = false;
    this.reportToEdit.Signatories = JSON.stringify(this.report.Signatories);
    this.reportToEdit.ReportText = this.sanitizer.sanitize(SecurityContext.HTML, this.report.ReportText);
    this.showEditReportWindow = true;



    //this.onReportEdit.emit({ report: this.report });
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


      //filesToUpload,selReport,OrderStatus
      this.imagingBLService.AddImgItemReport(null, selReport, orderStatus)
        .subscribe(res => {

          if (res.Status == "OK") {

            this.showEditReportWindow = true;
            this.showImagingReport = false;

            this.changeDetector.detectChanges();

            //this.reportToEdit.Signatories = JSON.stringify(this.report.Signatories);
            //this.reportToEdit.ReportText = this.sanitizer.sanitize(SecurityContext.HTML, this.report.ReportText);
            //this.showEditReportWindow = true;

            this.report = new ImagingReportViewModel();//reset the value of current report, it'll be loaded again from function below..

            this.showEditReportWindow = false;
            this.showImagingReport = true;

            this.GetImagingReport();


            // this.GetImagingReqsAndReportsByStatus();
            // this.selectedReport.ImagingReportId = res.Results.ImagingReportId;
            if (printReport) {

              //this.ViewReport(res.Results.ImagingRequisitionId);
              //this.showreport = false;
            }
            //if (res.Results.OrderStatus == "final")
            //    this.showreport = false;

            //if (isUpdate)
            //    this.msgBoxServ.showMessage("success", ["Report Updated Successfully"]);
            //else

            // this.msgBoxServ.showMessage("success", ["Report Added Successfully"]);
          }
          //else
          //    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        });

    } catch (exception) {
      //this.msgBoxServ.showMessage("error", ['check console log for detail error..!']);
      console.log(exception);
    }

  }

  openPopUpBox() {
    this.showPopUp = false;
    this.changeDetector.detectChanges();
    this.showPopUp = true;
  }

  AssignSelectedDoctor() {
    if (this.doctorSelected) {
      this.UpdateDoctor();
    } else {
      this.messageBoxService.showMessage("failed", ["No Doctor Selected or Written."]);
    }
    this.showPopUp = false;
  }

  closePopUpBox() {
    this.showPopUp = false;
  }

  UpdateDoctor() {
    if (this.requisitionId && this.doctorSelected) {
      var providerName: string = null;
      var providerId: number = 0;
      if (this.doctorSelected.EmployeeId) {
        providerName = this.doctorSelected.LongSignature;
        providerId = this.doctorSelected.EmployeeId;
      } else if (this.doctorSelected.trim() != '') {
        providerName = this.doctorSelected;
      }

      if (providerName && providerName.trim() != '') {
        this.imagingBLService.PutDoctor(providerId, providerName, this.requisitionId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.report["ProviderName"] = res.Results;
              this.messageBoxService.showMessage("success", ["Doctor Updated"]);
              this.doctorSelected = '';
            } else {
              this.doctorSelected = '';
              this.messageBoxService.showMessage("failed", ["Doctor Name cannot be Updated in your Lab Report"]);
            }
          });
      } else {
        this.messageBoxService.showMessage("failed", ["No Doctor Selected or Written."]);
        this.doctorSelected = '';
      }

    }
    else {
      this.messageBoxService.showMessage("failed", ["There is no requisitions !!"]);
    }
  }

  AssignedToDocListFormatter(data: any): string {
    return data["FullName"];
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


  }





  public SendEmail() {
    if (this.emailSettings.TextContent) {
      var itemDiv = document.getElementById("printpage").innerHTML;
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
          if (this.ValidateEmail(value)) {
            this.radEmail.EmailList.push(value);
          } else {
            allEmailIsValid = false;
          }
        });

        if (allEmailIsValid) {
          console.log(this.radEmail);
          this.imagingBLService.sendEmail(this.radEmail)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.messageBoxService.showMessage('success', ['Email send to the given email.']);
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

}
