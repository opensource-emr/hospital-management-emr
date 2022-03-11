import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PatientsBLService } from '../shared/patients.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from "../../core/shared/core.service";
import { PatientFilesModel } from '../shared/patient-files.model'
@Component({
    selector: "patient-upload-files",
    templateUrl: "./patient-upload-files.html"
})
export class PatientUploadFilesComponent {

    /*Description
    1) patientId - it's compulsory for use this component
    2) isShowUploadMode - only you can upload image for selectedPatient popup will come
    3) isShowListMode - It will show you List of Uploaded document for patient
                        Upload documents, View documents
        */

    ///To Show The Popup of UploadFiles
    public patientId: number = 0;
    public isShowUploadMode: boolean = false;
    public isShowListMode: boolean = false;
    public uploadedDocuments: Array<PatientFilesModel> = new Array<PatientFilesModel>();
    public selectedDocuments: Array<PatientFilesModel> = new Array<PatientFilesModel>();
    public selectedReport: PatientFilesModel = new PatientFilesModel();
    public popupImageData: PatientFilesModel = new PatientFilesModel();
    public selectedPatient: any;
    public showImage: boolean = false;
    public showAddPopup: boolean = false;
    public documentTypeList: any[];

    @Input("isShowUploadMode")
    public set isShowUploadModeValue(val: boolean) {
        try {
            if (val) {
                this.isShowUploadMode = val;
                //this.ShowComponent();
            }
            else {
                this.isShowUploadMode = false;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    @Input("isShowListMode")
    public set value(val: boolean) {
        try {
            if (val) {
                this.isShowListMode = val;
            }
            else {
                this.isShowListMode = false;
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }


    @Input("patientId")
    public set patIdValue(val: number) {
        try {
            if (val) {
                this.patientId = val;
                if (this.patientId > 0) {
                    this.selectedReport.UploadedOn = moment().format("YYYY-MM-DD");
                    this.getPatientById();

                }
                else {
                    this.msgBoxServ.showMessage("error", ['Please select patient']);
                    this.Close();
                }
            }
            else {
                this.Close();
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    @ViewChild("fileInput") fileInput;

    constructor(public patientBLService: PatientsBLService, public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public coreService: CoreService) {

    }

    public getPatientById() {
        try {
            this.patientBLService.GetLightPatientById(this.patientId)
                .subscribe(res => {
                    if (res.Status == 'OK' && res.Results) {
                        this.selectedPatient = res.Results;
                        this.selectedReport.PatientId = this.selectedPatient.PatientId;
                        this.selectedPatient.DateOfBirth = moment(this.selectedPatient.DateOfBirth).format("YYYY-MM-DD");
                        this.callBackPatientGet();
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get BillingHistory"]);
                });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }
    //it will decide behave of component    
    public callBackPatientGet() {
        try {
            if (this.patientId > 0) {
                if (this.isShowListMode === true) {
                    this.getPatientUplodedDocument();
                    if (this.isShowUploadMode == true) {
                        this.showAddPopup = true;
                    }
                } else if (this.isShowUploadMode === true) {
                    this.changeDetector.detectChanges();
                    this.showAddPopup = true;
                    // this.selectedReport.FileType = "Admin";//now hardcoded 
                    this.selectedReport.PatientId = this.patientId;
                }
            }
            else {
                this.msgBoxServ.showMessage("error", ['Please select patient']);
                this.Close();
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    public getPatientUplodedDocument() {
        try {
            this.patientBLService.getPatientUplodedDocument(this.patientId)
                .subscribe(res => {
                    if (res.Status == 'OK' && res.Results) {
                        this.uploadedDocuments = res.Results;
                        for (var i = 0; i < this.uploadedDocuments.length; i++) {
                            let WithOutExtention = this.uploadedDocuments[i].FileName.split(".");
                            this.uploadedDocuments[i].FileName = WithOutExtention[0];                           
                        }
                            this.documentTypeList = [];
                        this.documentTypeList = Array.from([new Set(this.uploadedDocuments.map(i => i.FileType))][0]);
                        if (this.uploadedDocuments.length > 0) {
                            this.selectedDocuments = [];
                            this.selectedDocuments = this.uploadedDocuments.filter(t => t.FileType == this.documentTypeList[0]);
                        } else {
                            this.selectedDocuments = [];
                        }
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    }
                },
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get BillingHistory"]);
                });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }

    public chaneFileType(fileType: string) {
        if (fileType) {
            this.selectedDocuments = [];
            this.selectedDocuments = this.uploadedDocuments.filter(t => t.FileType == fileType);
        }
    }

    Close() {
        try {
            this.changeDetector.detectChanges();
            this.isShowListMode = false;
            this.isShowUploadMode = false;
            this.popupImageData = new PatientFilesModel();
            this.selectedPatient = null;
            this.uploadedDocuments = new Array<PatientFilesModel>();
            this.selectedReport = new PatientFilesModel();
            this.showImage = false;
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }
    closeImg() {
        try {
            this.changeDetector.detectChanges();
            this.popupImageData = new PatientFilesModel();
            this.showImage = false;
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }

    }
    closeUpload() {
        try {
            this.isShowUploadMode = false;
            this.showAddPopup = false;

        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }


    SubmitFiles() {
        try {
            ///Takes Files 
            let files = this.fileInput.nativeElement.files;
            //Check Validation 
            for (var i in this.selectedReport.PatientFilesValidator.controls) {
                this.selectedReport.PatientFilesValidator.controls[i].markAsDirty();
                this.selectedReport.PatientFilesValidator.controls[i].updateValueAndValidity();
            }
            ///if validation is Proper  then Pass Files and Report Data to Parent Component
            if (this.selectedReport.IsValidCheck(undefined, undefined) && this.ValidateFileSize(files)) {
                if (files.length) {
                    if (this.selectedReport) {
                        ///File Name is Required in Format
                        /// (these files were uploaded on some date 04-04-18)
                        // DichargeSummary_040418_1           —-here fileno: 1
                        /// DichargeSummary_040418_2           —-here fileno: 2
                        ///Now Only Binding FileName= FileType_Date 
                        //File No Will be Bind on Server beacause for Each File We have to check what is MAX File No Based on FileType and PatientId
                      this.selectedReport.FileName = this.selectedReport.FileType + "_" + moment().format('DDMMYY');
                      console.log(this.selectedReport);
                      console.log(files);
                      this.AddReport(files, this.selectedReport);

                      console.log(this.selectedReport);
                      console.log(files);
                    }
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Either Select Report File "]);
                }
            }
        } catch (ex) {

            this.ShowCatchErrMessage(ex);
        }

    }
    //    img.files[0].size < 1048576
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
            }
            return flag;
        }
    }

    openImage(id){
        this.patientBLService.GetFileFromServer(id).subscribe((event) => {
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
   

    AddReport(filesToUpload, selReport): void {

        try {
            ///Read Files and patientFilesModel Data to Some Variable           
            if (filesToUpload.length || selReport) {
                this.patientBLService.AddPatientFiles(filesToUpload, selReport)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", [' File Uploded']);
                            this.closeUpload();
                            this.getPatientUplodedDocument();
                        }
                        else if (res.Status == "Failed") {
                            this.msgBoxServ.showMessage("error", ['Failed']);
                        }
                        else
                            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                    });
            }

        } catch (exception) {
            this.ShowCatchErrMessage(exception);
        }

    }
    public AttachFiles() {
        try {
            if (this.patientId > 0) {
                this.showAddPopup = true;
            } else {
                this.msgBoxServ.showMessage("notice", ['please select patient']);
            }
        } catch (ex) { this.ShowCatchErrMessage(ex); }
    }
    //This function only for show catch messages
    public ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
            this.Close();
        }
    }
}
