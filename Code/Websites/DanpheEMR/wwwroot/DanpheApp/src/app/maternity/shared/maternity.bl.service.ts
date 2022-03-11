import { Injectable, Directive } from "@angular/core";
import { MaternityDLService } from "./maternity.dl.service";
import { CoreDLService } from "../../core/shared/core.dl.service";
import * as _ from 'lodash';
import { MaternityPatientFilesModel } from "./maternity-file-upload.model";
import * as moment from "moment";

@Injectable()
export class MaternityBLService {
  constructor(
    public maternityDLService: MaternityDLService,
    public coreDlService: CoreDLService
  ) { }

  public GetDataForEdit() {
    return this.maternityDLService.GetDataForEdit().map((res) => {
      return res;
    });
  }

  public GetPatientDetails() {
    return this.maternityDLService.GetPatientDetails().map((res) => {
      return res;
    });
  }

  public GetFileFromServer(id: number) {
    return this.maternityDLService.GetFileFromServer(id).map((res) => {
      return res;
    });
  }

  public GetAllActiveMaternityPatientList(showAll, fromDate, toDate) {
    return this.maternityDLService.GetAllActiveMaternityPatientList(showAll, fromDate, toDate).map((res) => {
      return res;
    });
  }

  public GetPatientDetailById(id: number) {
    return this.maternityDLService.GetPatientDetailById(id).map((res) => {
      return res;
    });
  }

  //here patientId is sent
  public GetPatientPaymentDetailById(id: number) {
    return this.maternityDLService.GetPatientPaymentDetailById(id).map((res) => {
      return res;
    });
  }

  //here paymentId is sent
  public GetPatientPaymentDetailByPaymentId(id: number) {
    return this.maternityDLService.GetPatientPaymentDetailByPaymentId(id).map((res) => {
      return res;
    });
  }

  public GetAllDosesNumber(dosesNeeded: boolean) {
    return this.maternityDLService.GetAllDosesNumber(dosesNeeded).map((res) => {
      return res;
    });
  }

  public GetAllANCByMaternityPatientId(id: number) {
    return this.maternityDLService.GetAllANCByMaternityPatientId(id).map((res) => {
      return res;
    });
  }

  public GetMaternityFileUploadList(id: number) {
    return this.maternityDLService.GetMaternityFileUploadList(id).map((res) => {
      return res;
    });
  }
  public GetAllChildList(matId: number, patId: number) {
    return this.maternityDLService.GetAllChildList(matId, patId).map((res) => {
      return res;
    });
  }

  public GetMaternityAllowanceReportList(fromDate, toDate) {
    return this.maternityDLService.GetMaternityAllowanceReportList(fromDate, toDate).map((res) => {
      return res;
    });
  }


  public AddMaternityPatient(model) {
    let temp = _.omit(model, ['MaternityPatientValidator'])
    let data = JSON.stringify(temp);
    return this.maternityDLService.AddMaternityPatient(data).map((res) => {
      return res;
    });
  }

  public AddMaternityPatientPayment(model) {
    let temp = _.omit(model, ['MaternityPaymentDetailsValidator'])
    let data = JSON.stringify(temp);
    return this.maternityDLService.AddMaternityPatientPayment(data).map((res) => {
      return res;
    });
  }

  public UpdateMaternityPatient(model) {
    let temp = _.omit(model, ['MaternityPatientValidator'])
    let data = JSON.stringify(temp);
    return this.maternityDLService.UpdateMaternityPatient(data).map((res) => {
      return res;
    });
  }

  public AddUpdateMaternityANC(model: any) {
    let mdoelData = Object.assign({}, model);
    let data = _.omit(mdoelData, ['ANCValidator']);
    let dataStr = JSON.stringify(data);
    return this.maternityDLService.AddUpdateMaternityANC(dataStr).map((res) => {
      return res;
    });
  }

  public RegisterMaternity(model) {
    let mdoelData = Object.assign({}, model);
    let temp = _.omit(mdoelData, ['MaternityRegisterDetailsValidator'])
    let data = JSON.stringify(temp);
    return this.maternityDLService.RegisterMaternity(data).map((res) => {
      return res;
    });
  }

  // public UploadMaternityPatientFiles(filesToUpload, patFile: MaternityPatientFilesModel) {
  //   let formToPost = new FormData();
  //   var fileName: string;
  //   //var fileType: string;
  //   var options;
  //   //patient object was included to display it's details on client side
  //   //it is not necessary during post
  //   var omited = _.omit(patFile, ['FileUploadValidator']);

  //   //we've to encode uri since we might have special characters like , / ? : @ & = + $ #  etc in our report value. 
  //   var reportDetails = JSON.stringify(omited);//encodeURIComponent();

  //   for (var i = 0; i < filesToUpload.length; i++) {
  //     //to get the imagetype
  //     let splitImagetype = filesToUpload[i].name.split(".");
  //     let imageExtension = splitImagetype[1];
  //     fileName = patFile.DisplayName + "_" + moment().format('DD-MM-YYYY') + "." + imageExtension;
  //     //fileType = imageExtension;
  //     formToPost.append("uploads", filesToUpload[i], fileName);
  //     //formToPost.append("uploads", filesToUpload[i], fileType);
  //     let header = new Headers();
  //       /** In Angular 5, including the header Content-Type can invalidate your request */
  //       header.append('Content-Type', 'multipart/form-data');
  //       header.append('Accept', 'application/json');
  //       options = new RequestOptions({ headers: header });
  //   }
  //   formToPost.append("reportDetails", reportDetails);

  //   return this.maternityDLService.PostMaternityPatientFiles(formToPost,options).map((res) => {
  //     return res;
  //   });
  // }
  public UploadMaternityPatientFiles(filesToUpload, patFile: MaternityPatientFilesModel) {
    let formToPost = new FormData();
    // if (filesToUpload && filesToUpload.length == 1) {
    //   let splitFiletype = filesToUpload[0].name.split(".");
    //   patFile.FileType = splitFiletype;
    // }

    for (let i = 0; i < filesToUpload.length; i++) {
      formToPost.append('files', filesToUpload[i]);
    }

    var omited = _.omit(patFile, ['FileUploadValidator']);

    var reportDetails = JSON.stringify(omited);//encodeURIComponent();

    formToPost.append("reportDetails", reportDetails);
    return this.maternityDLService.PostMaternityPatientFiles(formToPost).map((res) => {
      return res;
    });
  }
  public UpdateChildInfo(model) {
    let temp = _.omit(model, ['MaternityRegisterDetailsValidator']);
    let data = JSON.stringify(temp);
    return this.maternityDLService.UpdateChildInfo(data).map((res) => {
      return res;
    });
  }

  public UpdateMotherInfo(model){
    let temp = _.omit(model, ['MaternityRegisterDetailsValidator']);
    let data = JSON.stringify(temp);
    return this.maternityDLService.UpdateMotherInfo(data).map((res) => {
      return res;
    });
  }

  public DeleteMaternityPatient(id: number) {
    return this.maternityDLService.DeleteMaternityPatient(id).map((res) => {
      return res;
    });
  }

  public ConcludeMaternityPatient(id: number) {
    return this.maternityDLService.ConcludeMaternityPatient(id).map((res) => {
      return res;
    });
  }

  public DeleteMaternityPatientANC(id: number) {
    return this.maternityDLService.DeleteMaternityPatientANC(id).map((res) => {
      return res;
    });
  }

  public DeleteMaternityPatientFile(id: number) {
    return this.maternityDLService.DeleteMaternityPatientFile(id).map((res) => {
      return res;
    });
  }
  public DeleteChild(id: number) {
    return this.maternityDLService.DeleteChild(id).map((res) => {
      return res;
    });
  }
  public SearchPatListForAllowance(searchText: string,isSearchAll:boolean) {
    return this.maternityDLService.SearchPatListForAllowance(searchText,isSearchAll).map((res) => res);
  }

}
