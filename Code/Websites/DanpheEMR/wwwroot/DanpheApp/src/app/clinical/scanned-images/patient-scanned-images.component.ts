import { Component, ChangeDetectorRef, OnInit, OnDestroy, ViewChild, Inject } from "@angular/core";
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
export class PatientScannedImages {
  public selectedImage: PatientImagesModel = new PatientImagesModel();
  @ViewChild("fileInput") fileInput;
  employeeId: number;
  DepartmentId: number;
  a: number;
  b: number;
  arr = [];
  sum: number;
  public uploadedImagesList: Array<PatientImagesModel> = new Array<PatientImagesModel>();
  album: any[];
  pdfAlbum: any[] = [];
  showSelectedPdf: boolean;
  SelectedPdfSrc: any;
  pdfPath: string = '/themes/theme-default/images/pdf_icon.jpg';
  constructor(public securityService: SecurityService,
    public PatService: PatientService,
    public visitService: VisitService,
    public msgBoxSrv: MessageboxService,
    public histoServ: HistoryBLService,
    public doctorsBLService: DoctorsBLService,
    public lightbox: Lightbox) {

    this.GetUploadedPatientImages();
    this.GetDepartMent(); this.pdfAlbum.length
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

  GetUploadedPatientImages() {
    this.histoServ.GetUploadedPatientImages(this.visitService.globalVisit.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          if (res.Results.length) {
            this.uploadedImagesList = res.Results;
            this.uploadedImagesList.forEach(a => {
              a.UploadedOn = moment(a.UploadedOn).format("YYYY-MM-DD");
            });
            this.MakeImgAlbum();
          }
          else {
            this.msgBoxSrv.showMessage("Notice", ["No images Found."]);
            this.uploadedImagesList = [];
            this.MakeImgAlbum();
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
      this.pdfAlbum = [];
      for (let i = 0; i <= this.uploadedImagesList.length; i++) {
        const src = 'data:image/jpeg;base64,' + this.uploadedImagesList[i].FileBinaryData;
        const caption = this.uploadedImagesList[i].FileType + " : " + this.uploadedImagesList[i].Title + " " + this.uploadedImagesList[i].UploadedOn;
        const PatImageId = this.uploadedImagesList[i].PatImageId
        //  const thumb = src+ i + '-thumb.jpg';
        const image = {
          src: src,
          caption: caption,
          thumb: null,
          PatImageId: PatImageId,
        };

        if (this.uploadedImagesList[i].FileExtention == '.pdf') {
          this.pdfAlbum.push(image);
        } else {
          this.album.push(image);
        }
      }
      this.album = this.album.slice();
    } catch (exception) {
      // this.ShowCatchErrMessage(exception);
    }
  }

  //shows the image in bigger size
  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.album, index);
  }
  openPdfFiles(i) {
    this.SelectedPdfSrc = this.pdfAlbum[i].src;
    this.showSelectedPdf = true;
  }

  //   close(): void {
  //     // close lightbox programmatically
  //     this.lightbox.close();
  //   }

  makearray(i: number) {
    console.log(i);
    this.a = i;
    this.sum = this.a + i;
    for (var j = 0; j < 2; j++) {
      this.arr[0] = this.a;
      this.arr[1] = 0;

    };
  }



  open1(index: number): void {
    // open lightbox
    this.lightbox.open(this.album, this.arr[0], this.arr[1]);
  }


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
            this.selectedImage.DepartmentId = this.DepartmentId;
            this.selectedImage.UploadedOn = moment().format("YYYY-MM-DD");
            this.selectedImage.UploadedBy = this.employeeId;
            this.selectedImage.PatientId = this.visitService.globalVisit.PatientId;
            ///File Name is Required in Format
            //File No Will be Bind on Server beacause for Each File We have to check what is MAX File No Based on FileType and PatientId
            this.selectedImage.FileName = this.selectedImage.FileType;
            this.AddReport(files, this.selectedImage);
          }
        }
        else {
          this.msgBoxSrv.showMessage("error", ["Either Select Report File "]);
        }
      }
      else {
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

  // public DeleteUploadedImage(index: number): void {
  //   let check = confirm("Are you sure want to delete this image?");
  //   if (check) {
  //     let deletedImage = new PatientImagesModel();
  //     deletedImage = this.uploadedImagesList[index];
  //     this.histoServ.deactivateUploadedImage(deletedImage.PatImageId)
  //       .subscribe(res => {
  //         if (res.Status == "OK") {
  //           this.msgBoxSrv.showMessage("success", ['Image is Deleted.']);
  //           this.GetUploadedPatientImages();
  //         }
  //         else {
  //           this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
  //         }
  //       });
  //   }
  // }
  public DeleteUploadedImage(index: number): void {
    let check = confirm("Are you sure want to delete this image?");
    if (check) {
      let deleteImage = new PatientImagesModel();
      deleteImage = this.album[index].PatImageId;
      this.DeleteFile(deleteImage);
    }
  }
  DeleteUploadedPdf(i) {
    let check = confirm("Are you sure want to delete this PDF file?");
    if (check) {
      let deletePdf = new PatientImagesModel();
      deletePdf = this.pdfAlbum[i].PatImageId;
      this.DeleteFile(deletePdf);
    }
  }
  DeleteFile(File) {
    this.histoServ.deactivateUploadedImage(File)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxSrv.showMessage("success", ['Image is Deleted.']);
          this.GetUploadedPatientImages();
        }
        else {
          this.msgBoxSrv.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }
}
