import { Component, Input, Output, EventEmitter, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { CoreService } from '../../../core/shared/core.service';
import{MessageboxService} from '../../../shared/messagebox/messagebox.service';
import {UploadCosentFormModel} from '../../shared/upload-consent-form.Model';
import * as moment from 'moment/moment';
import { EmergencyBLService } from '../../shared/emergency.bl.service';
import { EmergencyPatientModel } from '../../shared/emergency-patient.model';
import { Patient } from '../../../patients/shared/patient.model';

@Component({
    selector: 'upload-consent',
    templateUrl: "./upload-consent.component.html"
  })

  export class uploadConsentAcionComponent {
    @Input("ERPatientId")
    public ERPatientId: any;
  
    @Input("patientDetail")
    public patientDetail: Patient=new Patient;
    @ViewChild("fileInput") fileInput;

    public loading: boolean = false;
    @Output("callBackClose")
    public callBackFileUploadClose: EventEmitter<Object> = new EventEmitter<Object>();

    public uploadedDocumentslist: Array<UploadCosentFormModel> = new Array<UploadCosentFormModel>();
    public selectedFile: UploadCosentFormModel = new UploadCosentFormModel();
    public selectedERPatientToEdit: EmergencyPatientModel = new EmergencyPatientModel();
  constructor(public securityService: SecurityService, 
    public coreService: CoreService,
    public emergencyBLService:EmergencyBLService, 
    public msgBoxServ: MessageboxService,
  ) {

  }
  ngOnInit() {
    this.GetConsentFormUploadList()
  }
  SubmitFiles() {
    try {
      this.loading = true;
       ///Takes Files 
       let files = null;
       files = this.fileInput.nativeElement.files;
      //Check Validation 
      for (var i in this.selectedFile.FileUploadValidator.controls) {
        this.selectedFile.FileUploadValidator.controls[i].markAsDirty();
        this.selectedFile.FileUploadValidator.controls[i].updateValueAndValidity();
    }
      if (this.selectedFile && !this.selectedFile.DisplayName && this.selectedFile.DisplayName.trim().length == 0) {
        this.loading = false;
        this.msgBoxServ.showMessage("error", ["Please Enter display name"]); return;
      }
      if(this.selectedFile && this.selectedFile.DisplayName && this.selectedFile.DisplayName.trim().length > 0){
        let duplicateName = this.uploadedDocumentslist.find(x => x.DisplayName == this.selectedFile.DisplayName)
        if(!!duplicateName){
          this.loading = false;
          this.msgBoxServ.showMessage("error", ["Duplicate File name not allowed"]); 
          return;
        }
    } 
     
      if (this.ValidateFileSize(files)) {
        if (files.length) {
          if (this.selectedFile && this.selectedFile.FileType !=".pdf") {
            this.selectedFile.FileName = this.selectedFile.DisplayName + "_" + moment().format('DDMMYY');
            this.selectedFile.PatientId = this.patientDetail.PatientId;
           this.selectedFile.ERPatientId = this.ERPatientId;
           console.log(this.selectedFile);
            console.log(files);
            this.AddReport(files,this.selectedFile);
            this.loading = false;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", ["Please Select Report File "]);
          this.loading = false;
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }

  }
  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      this.Close();
    }

    this.loading = false;
  }
  Close() {
    this.callBackFileUploadClose.emit({ close: true });
  }
  public ValidateFileSize(files) {
    let flag = true;
    let errorMsg = [];
    errorMsg.push("files size must be less than 10 mb");
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 10485000) {
          flag = false;
          errorMsg.push(files[i].name);
        }
      }
      if (flag == false) {
        this.msgBoxServ.showMessage("notice", errorMsg);
        this.loading = false;
      }
      return flag;
    }
  }
  AddReport(filesToUpload,selFile): void {
    this.loading = true;
    try {
      ///Read Files and patientFilesModel Data to Some Variable           
      if (filesToUpload.length || selFile) {
        this.emergencyBLService.UploadConsentForm(filesToUpload, selFile)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.selectedFile = new UploadCosentFormModel();
              this.fileInput.Value = null;
              this.fileInput.nativeElement.value = "";
              this.GetConsentFormUploadList();
              this.msgBoxServ.showMessage("success", ['File Uploded']);
              this.loading = false;
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.loading = false;
            }
          },
            err => { this.msgBoxServ.showMessage("error", [err.ErrorMessage]); this.loading = false; }
          );
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
   RemoveFile(Fileid) {
    this.emergencyBLService.DeleteFile(Fileid).subscribe((res) => {
      if (res.Status == 'OK') {
        this.uploadedDocumentslist = this.uploadedDocumentslist.filter(p => (p.FileId != Fileid)).slice();
        this.msgBoxServ.showMessage('success', ['File successfully removed']);
      }
    }, err => {
      this.msgBoxServ.showMessage('failed', ['Failed to Remove File']);
    });
  }
  GetConsentFormUploadList() {
    this.emergencyBLService.GetConsentFormUploadList(this.ERPatientId)
    .subscribe((res) => {
      if (res.Status == 'OK') {
        this.uploadedDocumentslist = res.Results }
    }, err => {
      this.msgBoxServ.showMessage('failed', ['Failed to Load Maternity Patient File List']);
    });
  }
  download(id) {
    this.emergencyBLService.GetFileFromServer(id).subscribe((event) => {
      this.downloadFile(event);
    },
      err => this.msgBoxServ.showMessage("error", ["Could not download file now"]));
  }
  downloadFile(data: Blob) {
    const downloadedFile = new Blob([data], { type: data.type });
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    const url = window.URL.createObjectURL(downloadedFile);
    document.body.appendChild(a);
    a.download = url;
    a.href = URL.createObjectURL(downloadedFile);
    a.target = '_blank';
    a.click();
    document.body.removeChild(a);
  }
  }
