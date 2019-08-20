import { Component, ChangeDetectorRef, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { PatientImagesModel } from '../shared/patient-uploaded-images.model';
import { SecurityService } from "../../security/shared/security.service";
import { PatientService } from '../../patients/shared/patient.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { HistoryBLService } from '../shared/history.bl.service';
import { DoctorsBLService } from '../../doctors/shared/doctors.bl.service';
import * as moment from 'moment/moment';
import { Lightbox } from "angular2-lightbox";
@Component({
    templateUrl: "./scanned-images.html" 
})
export class PatientScannedImages{
    public selectedImage: PatientImagesModel = new PatientImagesModel();
    @ViewChild("fileInput") fileInput;
    employeeId: number;
    DepartmentId: number;
    public uploadedImagesList: Array<PatientImagesModel> = new Array<PatientImagesModel>();
    album: any[];

    constructor(public securityService: SecurityService,
        public PatService: PatientService,
        public visitService: VisitService,
        public msgBoxSrv: MessageboxService,
        public histoServ : HistoryBLService,
        public doctorsBLService: DoctorsBLService,
        public lightbox: Lightbox){
        this.GetUploadedPatientImages();
        this.GetDepartMent();
    }
    GetDepartMent() {
        this.employeeId = this.securityService.GetLoggedInUser().EmployeeId;
        this.doctorsBLService.GetDepartMent(this.employeeId).subscribe(res => {
          if (res.Status == "OK") {
            var data = res.Results;
            this.DepartmentId = data.DepartmentId;
          }
          else {
            this.msgBoxSrv.showMessage("failed", ["Invalid Employee"]);
          }
        });
      }

    GetUploadedPatientImages(){
        this.histoServ.GetUploadedPatientImages(this.visitService.globalVisit.PatientId)
        .subscribe(res => {
            if (res.Status == "OK") {
                if(res.Results.length){
                    this.uploadedImagesList = res.Results;
                    this.uploadedImagesList.forEach(a=>{
                        a.UploadedOn = moment(a.UploadedOn).format("YYYY-MM-DD");
                    });
                    this.MakeImgAlbum();
                }
                else{
                    this.msgBoxSrv.showMessage("error", ["No images Found."]);
                }
             //   this.msgBoxSrv.showMessage("success", ["Current visit is concluded."]);
            } else {
                this.msgBoxSrv.showMessage("error", ["something wrong please try again."]);
            }
        })
    }

      //this for make image album for show in lightbox
  public MakeImgAlbum() {
    try {
        this.album = [];
        for (let i = 0; i <= this.uploadedImagesList.length; i++) {
            const src = 'data:image/jpeg;base64,'+ this.uploadedImagesList[i].FileBinaryData;    
            const caption = this.uploadedImagesList[i].FileType + " : " + this.uploadedImagesList[i].Title+ " " + this.uploadedImagesList[i].UploadedOn;
          //  const thumb = src+ i + '-thumb.jpg';
            const image = {
               src: src,
               caption: caption,
               thumb: null
            };
       
            this.album.push(image);
          }
    } catch (exception) {
     // this.ShowCatchErrMessage(exception);
    }
  }

  //shows the image in bigger size
  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.album, index);
  }
 
//   close(): void {
//     // close lightbox programmatically
//     this.lightbox.close();
//   }

    SubmitImages() {
        try {
            ///Takes Files 
            let files = null;
             files = this.fileInput.nativeElement.files;
            //Check Validation 
            for (var i in this.selectedImage.PatientImageValidator.controls) {
                this.selectedImage.PatientImageValidator.controls[i].markAsDirty();
                this.selectedImage.PatientImageValidator.controls[i].updateValueAndValidity();
            }
            ///if validation is Proper  then Pass Files and Report Data to Parent Component
            if (this.selectedImage.IsValidCheck(undefined, undefined) && this.ValidateImageSize(files)) {
                if (files.length) {
                    if (this.selectedImage) {
                        this.selectedImage.PatientVisitId = this.visitService.globalVisit.PatientVisitId;
                        this.selectedImage.DepartmentId =  this.DepartmentId;
                        this.selectedImage.UploadedOn = moment().format("YYYY-MM-DD");
                        this.selectedImage.UploadedBy = this.employeeId;
                        this.selectedImage.PatientId = this.visitService.globalVisit.PatientId;
                        ///File Name is Required in Format
                        //File No Will be Bind on Server beacause for Each File We have to check what is MAX File No Based on FileType and PatientId
                        this.selectedImage.FileName = this.selectedImage.FileType + "_" + moment().format('DDMMYY');
                        this.AddReport(files, this.selectedImage);
                    }
                }
                else {
                    this.msgBoxSrv.showMessage("error", ["Either Select Report File "]);
                }
            }
            else{
                this.selectedImage = new PatientImagesModel();
                this.msgBoxSrv.showMessage("", ["Please insert all details.."]);
            }
        } catch (ex) {

           // this.ShowCatchErrMessage(ex);
        }

    }

    public ValidateImageSize(files) {
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
                this.msgBoxSrv.showMessage("notice", errorMsg);
            }
            return flag;
        }
    }
    AddReport(imgToUpload, selReport): void {

        try {
            ///Read Files and patientFilesModel Data to Some Variable           
            if (imgToUpload.length || selReport) {
                this.histoServ.AddPatientImages(imgToUpload, selReport)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.msgBoxSrv.showMessage("success", ['Image is Uploded']);
                           // this.closeUpload();
                           this.selectedImage = new PatientImagesModel();
                            this.GetUploadedPatientImages();
                        }
                        else if (res.Status == "Failed") {
                            this.msgBoxSrv.showMessage("error", ['Failed']);
                        }
                        else
                            this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
                    });
            }

        } catch (exception) {
           // this.ShowCatchErrMessage(exception);
        }

    }

    public DeleteUploadedImage(index: number): void{
        let check = confirm("Are you sure want to delete this image?");
        if(check){
            let deletedImage = new PatientImagesModel();
            deletedImage = this.uploadedImagesList[index];
            this.histoServ.deactivateUploadedImage(deletedImage.PatImageId)
            .subscribe(res => {
                if(res.Status =="OK"){
                    this.msgBoxSrv.showMessage("success", ['Image is Deleted.']); 
                    this.GetUploadedPatientImages();
                }
                else{
                    this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
                }
            });
        }
    }
}