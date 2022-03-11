import { Component, Directive, ViewChild, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Patient } from '../../../patients/shared/patient.model';
import { ImagingItemReport } from '../../shared/imaging-item-report.model';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { Lightbox } from "angular2-lightbox";
import { ImagingBLService } from "../imaging.bl.service";
import { RadiologyService } from "../radiology-service";
import { ReportingDoctor } from "../reporting-doctor.model";
import { RadiologyReportTemplate } from "../radiology-report-template.model";
import { DicomMappingModel } from "../dicom-mapping-model";
import { CoreService } from '../../../../../src/app/core/shared/core.service';


@Component({
  selector: "danphe-post-report",
  templateUrl: "./post-report.html"
  //,
  //styleUrls: ['themes/theme-default/DanpheStyle.css']

})
export class PostReportComponent {
  public showreport: boolean = false;
  public showDicomImageList: boolean = false;
  public oldPatientStudyIds: string = "";
  @Input("report")
  public report: any;
  @Input("patient")
  public patient: Patient;
  public orderStatus: string = "";
  @Output("add-report")
  addreport: EventEmitter<Object> = new EventEmitter<Object>();

  //sud-14Jan'19: Needed parameterized button list in this page to Enable/Disable Few features.
  //eg: Save/Print Button is not needed while This page is opened from ViewReport on EDIT action.
  // but those buttons are required when showing this page from Requisition List.
  @Input("buttonsList")
  public buttonsList = ["save", "submit", "print"];



  //private pathToImage: Array<string>;   
  public imgIndex: number = 0;
  public loading: boolean = false;
  public isReadOnly: boolean = false;
  public templateData: string = null;
  public album = [];
  public allImagSelect: boolean = false;
  public enableImgUpload: boolean = false;
  public enableDicomImages: boolean = false;//sud:18Aug'19--separated parameter for Dicom images.

  public reportingDoctors: Array<ReportingDoctor> = new Array<ReportingDoctor>();
  public reportTemplates: Array<RadiologyReportTemplate> = [];
  // public referredByDrList: Array<{ EmployeeId: number, FullName: string }> = [];
  public selReferredByDr: any;
  public selectedTemplate: RadiologyReportTemplate;
  public changeReportTemplate: boolean = false;
  public changeDicomImageList: boolean = false;

  public dicomImageDatas: Array<DicomMappingModel> = new Array<DicomMappingModel>();

  public ReportValidator: FormGroup = null;
  public defaultSigEmpIdList: Array<number>;
  public hospitalCode: string = null;
  public imageUploadFolderPath: string = null;//sud:18Aug'19--for radiology image upload.
  public enableDoctorUpdateFromSignatory: boolean = false;
  public addReportWithoutSignatory: boolean = false;

  public ExtRefSettings = null;
 

  constructor(
    public msgBoxServ: MessageboxService,
    public lightbox: Lightbox,
    public imagingBLService: ImagingBLService, public coreService: CoreService,
    public changeDetector: ChangeDetectorRef,
    public radiologyService: RadiologyService, public renderer: Renderer2) {

    this.enableImgUpload = this.radiologyService.EnableImageUpload();
    this.enableDicomImages = this.radiologyService.EnableDicomImages();
    //this.GetReferredByDoctorList();
    this.hospitalCode = this.coreService.GetHospitalCode();
    if (this.hospitalCode) {
      this.hospitalCode = this.hospitalCode.toLowerCase();
    }

    this.imageUploadFolderPath = this.radiologyService.GetImageUploadFolderPath();

    this.ExtRefSettings = this.radiologyService.GetExtReferrerSettings();
    this.enableDoctorUpdateFromSignatory = this.coreService.UpdateAssignedToDoctorFromAddReportSignatory();
    this.addReportWithoutSignatory = this.coreService.AddReportWOSignatory();
  }


  //start: sud: 2July'19: For Keyboard Shortcuts..
  globalListenFunc: () => void;
  ngOnDestroy() {
    // remove listener
    if (this.globalListenFunc) {
      this.globalListenFunc();
    }
  }

  //end: sud: 2July'19: For Keyboard Shortcuts..


  //To avoid null/undefined exceptions, set the value of buttonsList to default if it was set as null from Parent-Component.
  ngOnInit() {
    if (!this.buttonsList || this.buttonsList.length == 0) {
      this.buttonsList = ["save", "submit", "print"];
    }

    this.globalListenFunc = this.renderer.listen('document', 'keydown', e => {
      var kc = e.which || e.keyCode;
      if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "S") {
        e.preventDefault();
        this.SaveReport();
      }
      else if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == "P") {
        e.preventDefault();
        this.SubmitAndPrintReport();
      }
    });
  }



  @Input("showreport")
  public set value(val: boolean) {
    try {
      this.showreport = val;
      if (this.showreport) {
        this.oldPatientStudyIds = null;
        this.oldPatientStudyIds = this.report.PatientStudyId;
        this.setValidator();
        this.changeReportTemplate = false;
        this.changeDicomImageList = false;
        this.MakeImgAlbum();

        this.selectedRefId = this.report.ProviderId;
        this.selectedRefName = this.report.ProviderName ? this.report.ProviderName : "Self";

        //this.GetReportingDoctor();
        if (this.report && this.report.ProviderName) {
          this.selReferredByDr = { EmployeeId: this.report.ReportingDoctorId, FullName: this.report.ProviderName };
          //this.setReferredByDr();
        } else {
          this.selReferredByDr = { EmployeeId: null, FullName: 'Self' };
        }

        this.defaultSigEmpIdList = this.coreService.GetDefEmpIdForRadSignatories();

      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //using validation logic here instead of model. because we're not initializing new ImnagingItemReport() but
  //direclty getting the report model from server side which don't have validation.
  public setValidator() {
    var _formBuilder = new FormBuilder();
    this.ReportValidator = _formBuilder.group({
      'Signatories': ['', Validators.compose([])],
    });
  }


  // public setReferredByDr() {
  //   if (this.report.ProviderName)
  //     this.selReferredByDr = this.referredByDrList.find(a => a.FullName == this.report.ProviderName);
  //   else
  //     this.selReferredByDr = this.referredByDrList.find(a => a.FullName == "Self");
  // }


  public GetAllReportTemplates() {
    this.imagingBLService.GetAllReportTemplates()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.reportTemplates = res.Results;
          this.changeReportTemplate = true;
          this.selectedTemplate = this.reportTemplates.find(a => a.TemplateId == this.report.ReportTemplateId);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Failed to get Report Templates. Check Log"]);
          console.log(res.ErrorMessage);
        }
      });
  }
  private GetAllDicomImageList() {

    this.changeDicomImageList = false;
    this.imagingBLService.GetDicomImageList(this.oldPatientStudyIds)
      .subscribe(res => {

        if (res.Status == "OK" && res.Results) {


          this.dicomImageDatas = res.Results;
          if (this.dicomImageDatas.length > 0) {
            this.changeDicomImageList = true;
          } else {
            this.msgBoxServ.showMessage('notice', ['There is no uploaded dicom images or all files are mapped with Patient.']);
          }
        }
        else {
          this.msgBoxServ.showMessage('failed', ["failed to get Patient Images" + res.ErrorMessage]);
        }
      });
  }



  AddDicomImage() {
    this.report.PatientStudyId = this.dicomImageDatas.filter(s => s.IsMapped == true).map(k => k.PatientStudyId).join(',');
    //this.report.MappedOldStudyId = this.dicomImageDatas.filter(s => s.IsSelected == true).map(k => k.PatientStudyId).join(',');
    this.changeDicomImageList = false;

  }

  //this for make image album for show in lightbox
  public MakeImgAlbum() {
    try {
      if (this.report.ImageName) {
        let albumTemp = [];
        //this.album = [];
        let imageNames = this.report.ImageName.split(";");
        imageNames.forEach(imgName => {

          //let imgPath = this.imageUploadFolderPath + this.report.ImagingTypeName + "/" + imgName;
          // let imgPath = "/app/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
          let imgPath = "/fileuploads/Radiology/" + this.report.ImagingTypeName + "/" + imgName;
          //const image = {
          //  src: imgPath,
          //  caption: imgName,
          //  thumb: null,
          //  isActive: false
          //}

          //this.album.push(image);

          this.ConvertImgSrcUrlToBase64(imgPath, function (dataUri) {
            // Do whatever you'd like with the Data URI!

            let image = {
              src: dataUri,
              caption: imgName,
              thumb: null,
              isActive: false
            }

            albumTemp.push(image);

          });

        });

        this.album = albumTemp;
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //<input type='file' binds the selected files to this fileInput
  @ViewChild("fileInput") fileInput;
  //calls addReport function of imaging-requistion.component
  //orderStatus is either 'final' or 'pending' depending on submit button click or save button click.

  SaveReport() {
    this.AddReport("pending");
  }

  SubmitAndPrintReport() {
    this.AddReport("final");
    //this.PrintReportHTML();
  }


  AddReport(orderStatus) {
    try {
      //this.AssignReferredByDr();

      this.report.ProviderName = this.selectedRefName ? this.selectedRefName : 'self';
      this.report.ReportingDoctorId = this.selectedRefId ? this.selectedRefId : 0;


      if (this.report.ReportText) {
        if (!this.reportingDoctors.length)
          this.UpdateValidator("off", "Signatories", "required");

        for (var a in this.ReportValidator.controls) {
          this.ReportValidator.controls[a].markAsDirty();
          this.ReportValidator.controls[a].updateValueAndValidity();
        }

        if (this.CheckIfSignatureValid()) {          
          //if (orderStatus == "final") {
          //  var createNew: boolean;
          //  createNew = window.confirm('You wont be able to make further changes. Do you want to continue?');
          //  if (!createNew)
          //    return;
          //}
          let files = [];
          if (this.enableImgUpload) {
            if (this.album.length > 0) {

              let count = 1;
              this.album.forEach(img => {
                let singleFile = this.ConvertDataURLtoFile(img.src, "img_" + count);
                files.push(singleFile);
                count++;
              });
            }
            //files = this.fileInput.nativeElement.files;
          }


          //get the first provider to put in the BillTxnItem table Provider detail
          if (this.enableDoctorUpdateFromSignatory) {
            let signData = JSON.parse(this.report.Signatories);
            this.report.ProviderIdInBilling = this.report.ProviderNameInBilling = null;
            if (signData && signData.length == 1) {
              this.report.ProviderIdInBilling = signData[0].EmployeeId;
              this.report.ProviderNameInBilling = signData[0].EmployeeFullName;
            }
          }

          //uncomment this as soon as above is tested.
          this.addreport.emit({ reportFiles: files, report: this.report, orderStatus: orderStatus });

        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ['Please enter some report text.']);
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
      this.msgBoxServ.showMessage("error", ['Please check console log for details']);
    }
  }

  Close() {
    try {
      if (this.report.ReportText) {
        var close: boolean;
        close = window.confirm('Changes will be discarded. Do you want to close anyway?');
        if (!close)
          return;
      }
      this.album = [];
      this.report = null;
      this.showreport = false;
      this.templateData = null;
      this.isReadOnly = false;
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  ClosePat() {
    this.changeDicomImageList = false;
  }

  //get report template data from ckEditor onChange
  onChangeEditorData(data) {
    try {
      this.report.ReportText = data;
    } catch (exception) {
      this.msgBoxServ.showMessage("error", ["Please check log for details error"]);
      this.ShowCatchErrMessage(exception);
    }

  }

  open(index: number): void {
    try {
      // open lightbox
      this.lightbox.open(this.album, index);
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //Fires when user click select all for delete
  SelectImageCheckboxOnChange() {
    try {
      //all selected check
      let flag = true;
      this.album.forEach(x => {
        if (!x.isActive) {
          flag = false;
        }
      });
      this.allImagSelect = (flag == true) ? true : false;
      //this.SelectDeselectAllImages();
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //when user check or uncheck AllImages checkbox  fires this method
  SelectDeselectAllImages() {
    try {
      if (this.allImagSelect) {
        this.album.forEach(x => {
          if (x.isActive == false)
            x.isActive = true;
        });
      } else {
        this.album.forEach(x => {
          if (x.isActive == true)
            x.isActive = false;
        });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  //delete user selected saved images
  DeleteImagesAndSave(orderStatus) {
    try {
      //uploadedImgCount = imgReport.ImageName.split(";").length;
      //fruits.join(";");  
      let countImgs = this.album.filter(x => x.isActive == true).length;
      if (countImgs) {

        this.loading = true;
        let reportNewForDel: ImagingItemReport = new ImagingItemReport();
        let images = [];
        this.album.forEach(img => {
          if (img.isActive == false)
            images.push(img.caption);
        });

        var deleteImages: boolean;
        deleteImages = window.confirm('Are you sure you want to delete selected images ?');
        if (!deleteImages)
          return;
        reportNewForDel = Object.assign(reportNewForDel, this.report);
        reportNewForDel.ImageName = images.join(";");
        reportNewForDel.Patient = null;
        reportNewForDel.ReportText = null; //for less call load, we don't want to update report text in delete images call                
        this.imagingBLService.DeleteImgsByImgingRptId(reportNewForDel)
          .subscribe(res => {
            this.loading = false;
            if (res.Status == "OK") {
              this.CallBackDeleteImages(res.Results);
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.loading = false;
            }
          });
      }
      else {
        this.msgBoxServ.showMessage("notice", ["Please select image to delete."]);
      }

    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }


  CallBackDeleteImages(result) {
    try {
      this.loading = false;
      if (result) {
        this.report.ImageFullPath = result.ImageFullPath;
        this.report.ImageName = result.ImageName;
        this.MakeImgAlbum();//make image album after img deleted
        this.msgBoxServ.showMessage("success", ["Image(s) successfully deleted."]);
      }
    } catch (exception) {
      throw exception;
    }
  }
  //This function only for show catch messages
  ShowCatchErrMessage(exception) {
    if (exception) {
      this.loading = false;
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  public AssignSelectedReport() {
    //using this condition check since this funciton was called even during initialization.
    if (this.report.ReportTemplateId != this.selectedTemplate.TemplateId) {
      if (this.report.ReportText) {
        var change: boolean;
        change = window.confirm('Changes will be discarded. Do you want to close anyway?');
        if (!change) {
          this.selectedTemplate = this.reportTemplates.find(a => a.TemplateId == this.report.ReportTemplateId);
          return;
        }
      }
      this.report.ReportTemplateId = this.selectedTemplate.TemplateId;
      this.report.ReportText = this.selectedTemplate.TemplateHTML;
      this.report.TemplateName = this.selectedTemplate.TemplateName;
    }
  }
  ReportTempListFormatter(data: any): string {
    return data["TemplateName"];
  }

  public AssignReferredByDr() {
    this.report.ProviderName = this.selectedRefName;
    this.report.ReportingDoctorId = this.selectedRefId;




  }


  //validation check if the item is selected from the list
  public CheckIfSignatureValid(): boolean {
    if(!this.addReportWithoutSignatory){
      if (this.report.Signatories) {
        var signatureList = JSON.parse(this.report.Signatories);
        if(!(signatureList && signatureList.length)){
          this.msgBoxServ.showMessage("failed",["Please select at least one signature from the list."]);
          return false;
        }
        var validSignature = signatureList.find(a=>a.Signature !=null);
        if(validSignature){
          return true;
        }
        else{
          this.msgBoxServ.showMessage("failed",["Please select valid signature from the list."]);
          return false;
        }
        // for(var i=0; i<signatureList.length; i++){
        //     if(signatureList[i].length){
        //       if (!(signatureList && signatureList.length && signatureList.Signature.length)) {
        //         this.msgBoxServ.showMessage("failed", ["Please select at least one signatory from the list."]);
        //         return false;
        //       }
        //       return true;
        //     }else {
        //       this.msgBoxServ.showMessage("failed", ["Please insert Radiology Signature from Settings before adding report."]);
        //       return false;
        //     }
        // }
      }else {
        this.msgBoxServ.showMessage("failed", ["Please select at least one signatory from the list."]);
        return false;
      }
    }else{
      if (this.report.Signatories) {
        var signatureList = JSON.parse(this.report.Signatories);
        if (!(signatureList && signatureList.length)) {
          this.msgBoxServ.showMessage("failed", [
            "Please select at least one signatory from the list.",
          ]);
          return false;
        }
        return true;
      }else {
        this.msgBoxServ.showMessage("failed", ["Please select at least one signatory from the list."]);
         return false;
      }
    }

  }


  //using validation logic here instead of model. because we're not initializing new ImnagingItemReport() but
  //direclty getting the report model from server side which don't have validation.
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.ReportValidator.dirty;
    else
      return this.ReportValidator.controls[fieldName].dirty;
  }
  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ReportValidator.valid;
    }
    else
      return !(this.ReportValidator.hasError(validator, fieldName));
  }
  public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
    let validator = null;
    if (validatorType == 'required' && onOff == "on") {
      validator = Validators.compose([Validators.required]);
    }
    else {
      validator = Validators.compose([]);
    }
    this.ReportValidator.controls[formControlName].validator = validator;
    this.ReportValidator.controls[formControlName].markAsUntouched();
    this.ReportValidator.controls[formControlName].updateValueAndValidity();
  }

  onShortCutPressed($event) {

    console.log('shortcut pressed');
    console.log($event);

    if ($event.name == "CTRL+S") {
      this.SaveReport();
    }
    else if ($event.name == "CTRL+P") {
      this.SubmitAndPrintReport();
    }

  }

  //prat: 13sep2019 for internal and external referrer 
  public defaultExtRef: boolean = true;
  selectedRefId: number = null;
  selectedRefName: string = null;

  OnReferrerChanged($event) {
    this.selectedRefId = $event.ReferrerId; //EmployeeId comes as ReferrerId from select referrer component.
    this.selectedRefName = $event.ReferrerName;//EmployeeName comes as ReferrerName from select referrer component.
  }

  //end: Pratik: 12Sept'19--For External Referrals



  public fileChangeEvent(fileInput: any) {
    //this.album = [];
    if (fileInput.target.files && fileInput.target.files.length > 0) {

      let albumTemp = this.album;//since we can't access this.album inside the reader.onload function because of this-that issue of javascript/typescript.
      for (var i = 0; i < fileInput.target.files.length; i++) {

        let currFile = fileInput.target.files[i];
        //console.log();

        var reader = new FileReader();
        //reader["FileName"] = currFile.name;//adding a new property to reader object so that we can access it later inside onload funciton.
        //this.album
        reader.onload = function (e: any) {
          let imgDataUrl = e.target.result;
          let image = {
            src: imgDataUrl,
            caption: e.target.FileName,
            thumb: null,
            isActive: false
          }

          albumTemp.push(image);

        }
        reader.readAsDataURL(currFile);
      }

      this.fileInput.nativeElement.value = "";

      this.album = albumTemp;

    }
  }

  RemoveSingleImage(indx) {
    this.album.splice(indx, 1);
  }

  public ConvertDataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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
    };

    image.src = url;
  }



  //ImageReArrange_Drop(event: CdkDragDrop<string[]>) {
  //  moveItemInArray(this.album, event.previousIndex, event.currentIndex);
  //}




}


