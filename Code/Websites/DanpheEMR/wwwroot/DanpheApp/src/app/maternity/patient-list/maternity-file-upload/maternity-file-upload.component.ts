import { Component, Input, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { SecurityService } from "../../../security/shared/security.service";
import { CoreService } from '../../../core/shared/core.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { MaternityBLService } from '../../shared/maternity.bl.service';
import * as moment from 'moment/moment';
import { MaternityANCModel } from '../../shared/maternity-anc.model';
import { MaternityPatientFilesModel } from '../../shared/maternity-file-upload.model';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'maternity-file-upload',
  templateUrl: "./maternity-file-upload.html"
})

// App Component class
export class MaternityPatientUploadFilesComponent {
  @Input("maternalPatientId")
  public maternalPatientId: any;

  @Input("patientDetail")
  public patientDetail: any;

  @Output("callBackANCClose")
  public callBackFileUploadClose: EventEmitter<Object> = new EventEmitter<Object>();

  public uploadedDocumentslist: Array<MaternityPatientFilesModel> = new Array<MaternityPatientFilesModel>();
  public selectedReport: MaternityPatientFilesModel = new MaternityPatientFilesModel();


  @ViewChild("fileInput") fileInput;

  public loading: boolean = false;


  constructor(public securityService: SecurityService, public coreService: CoreService, public maternityBLService: MaternityBLService,
    public msgBoxServ: MessageboxService,
  ) {

  }

  ngOnInit() {
    this.GetMaternityFileUploadList()
  }



  Close() {
    this.callBackFileUploadClose.emit({ close: true });
  }

  SubmitFiles() {
    try {
      this.loading = true;
      if (this.selectedReport && this.selectedReport.DisplayName && this.selectedReport.DisplayName.trim().length == 0) {
        this.loading = false;
        this.msgBoxServ.showMessage("error", ["Please Enter display name"]); return;
      }
      ///Takes Files 
      let files = null;
      files = this.fileInput.nativeElement.files;
      if (this.ValidateFileSize(files)) {
        if (files.length) {
          if (this.selectedReport) {
            this.selectedReport.FileName = this.selectedReport.DisplayName + "_" + moment().format('DDMMYY');
            this.selectedReport.PatientId = this.patientDetail.PatientId;
            this.selectedReport.MaternityPatientId = this.maternalPatientId;
            this.AddReport(files);
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

  AddReport(filesToUpload): void {
    this.loading = true;
    try {
      ///Read Files and patientFilesModel Data to Some Variable           
      if (filesToUpload.length || this.selectedReport) {
        this.maternityBLService.UploadMaternityPatientFiles(filesToUpload, this.selectedReport)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.selectedReport = new MaternityPatientFilesModel();
              this.fileInput.Value = null;
              this.fileInput.nativeElement.value = "";
              this.GetMaternityFileUploadList();
              this.msgBoxServ.showMessage("success", ['File Uploded']);
              this.loading = false;
            }
            else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              this.loading = false;
            }
          },
            err => { this.msgBoxServ.showMessage("error", [err.error.ErrorMessage]); this.loading = false; }
          );
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
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
        this.loading = false;
      }
      return flag;
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

  GetMaternityFileUploadList() {
    this.coreService.loading = true;
    this.maternityBLService.GetMaternityFileUploadList(this.maternalPatientId).subscribe((res) => {
      if (res.Status == 'OK') {
        this.uploadedDocumentslist = res.Results;
        this.coreService.loading = false;
      }
    }, err => {
      this.coreService.loading = false;
      this.msgBoxServ.showMessage('failed', ['Failed to Load Maternity Patient File List']);
    });
  }

  RemoveFile(Fileid) {
    this.coreService.loading = true;
    this.maternityBLService.DeleteMaternityPatientFile(Fileid).subscribe((res) => {
      if (res.Status == 'OK') {
        this.uploadedDocumentslist = this.uploadedDocumentslist.filter(p => (p.FileId != Fileid)).slice();
        this.msgBoxServ.showMessage('success', ['File successfully removed']);
        this.coreService.loading = false;
      }
    }, err => {
      this.coreService.loading = false;
      this.msgBoxServ.showMessage('failed', ['Failed to Remove File']);
    });
  }

  download(id) {
    this.maternityBLService.GetFileFromServer(id).subscribe((event) => {
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

