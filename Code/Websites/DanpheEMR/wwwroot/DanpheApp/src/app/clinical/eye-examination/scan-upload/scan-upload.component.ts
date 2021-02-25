import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { Patient } from '../../../patients/shared/patient.model';
import { Visit } from '../../../appointments/shared/visit.model';
import { EyeExaminationBLService } from '../../shared/eye-examination.bl.service'
import { PatientService } from '../../../patients/shared/patient.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { EyeScanModel } from './shared/eye-scan-images.model';
import { PatientsBLService } from '../../../patients/shared/patients.bl.service';

@Component({
  selector: "prescription-slip",
  templateUrl: "./scan-upload.html",

})
export class ScanUploadComponent {
  coreservice: any;
  router: any;
  public selectedPatient: any;
  public uploadedDocuments: Array<EyeScanModel> = new Array<EyeScanModel>();
  public selectedDocuments: Array<EyeScanModel> = new Array<EyeScanModel>();
  public selectedReport: EyeScanModel = new EyeScanModel();
  public popupImageData: EyeScanModel = new EyeScanModel();
  public uploadFilesShow: boolean = false;
  public pat: Patient = new Patient();
  public patVisit: Visit = new Visit();
  public fullname: string = null;
  public age: string = "";
  public Patid: string = "";
  public Gender: string = "";
  public Phonenumber: string = "";
  constructor(
    public patientService: PatientService,
    public visitService: VisitService,
    public patientBLService: PatientsBLService,
    public eyeService: EyeExaminationBLService,
    public msgBoxServ: MessageboxService
  ) {

    this.pat = this.patientService.globalPatient;
    this.fullname = this.pat.ShortName;
    this.age = this.pat.Age;
    this.Patid = this.pat.PatientCode;
    this.Gender = this.pat.Gender;
    this.Phonenumber = this.pat.PhoneNumber;
    this.getPatientById();
     // this.PrescriptionSlipMaster.PatientId = this.patientService.globalPatient.PatientId;
    // this.PrescriptionSlipMaster.VisitId = this.visitService.globalVisit.PatientVisitId;
    // this.PrescriptionSlipMaster.ProviderId = this.visitService.globalVisit.ProviderId;
    // this.PrescriptionSlipMaster.VisitDate = new Date(this.patVisit.VisitDate);
  }

  @ViewChild("fileInput") fileInput;


  Close() {
    this.uploadFilesShow = false;
  }


  SubmitFiles() {
    try {
      ///Takes Files
      let files = this.fileInput.nativeElement.files;
      //Check Validation

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
            this.AddReport(files, this.selectedReport);
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


  AddReport(filesToUpload, selReport): void {

    try {
      ///Read Files and patientFilesModel Data to Some Variable           
      if (filesToUpload.length || selReport) {
        this.eyeService.AddPatientFiles(filesToUpload, selReport)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.msgBoxServ.showMessage("success", [' File Uploded']);
              this.Close();
            //  this.getPatientUplodedDocument();
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


  public getPatientById() {
    try {
      this.patientBLService.GetLightPatientById(this.pat.PatientId)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results) {
            this.selectedPatient = res.Results;
            this.selectedReport.PatientId = this.selectedPatient.PatientId;
            this.selectedPatient.DateOfBirth = moment(this.selectedPatient.DateOfBirth).format("YYYY-MM-DD");
            
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

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      this.Close();
    }
  }

  public OpenUploadBox() {
    this.uploadFilesShow = true;
  }
}
