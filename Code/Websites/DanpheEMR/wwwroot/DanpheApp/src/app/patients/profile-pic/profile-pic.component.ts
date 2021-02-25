import { Component, ViewChild, Output, EventEmitter } from "@angular/core"
import { HttpClient} from '@angular/common/http';
//moment ----date format----
import * as moment from 'moment/moment';
import { PatientFilesModel } from "../shared/patient-files.model";
import { PatientService } from "../shared/patient.service";
import { Patient } from "../shared/patient.model";
import { PatientsBLService } from "../shared/patients.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import * as _ from 'lodash';
import { PatientsDLService } from "../shared/patients.dl.service";

@Component({
    templateUrl: "./profile-pic.html"
})

export class PatientProfilePicComponent {

    public patientFile: PatientFilesModel = new PatientFilesModel();
    public currPatient: Patient = null;

    public actionType: string = "add-new";//this tells cropper whether to edit or add new image.
    public currImageBase64: string = null;//this is passed as input to cropper in edit image function.

    //creating constructor--------it runs at the beginning
    constructor(public patService: PatientService,
        public patientBlService: PatientsBLService,
        public patDlService: PatientsDLService,
        public http: HttpClient) {

        this.currPatient = patService.getGlobal();
        if (this.currPatient.PatientId && this.currPatient.ProfilePic == null) {
            this.LoadProfilePic();
        }
        else if (this.currPatient.HasFile || (this.currPatient.PatientId && this.currPatient.ProfilePic != null)) {
            this.patientFile = this.currPatient.ProfilePic;
        }
    }

    //initiallly making showUploadBox unvisible
    public openPhotoCropper: boolean = false;

    public OpenUploadBox() {
        this.openPhotoCropper = true;
    }

    EditPhoto() {
        this.actionType = "edit";
        this.currImageBase64 = "data:image/jpeg;base64," + this.patientFile.FileBase64String;
        this.openPhotoCropper = true;
    }

    OnCropSuccess($event) {
        //Conditionally send data to server on success.
        this.openPhotoCropper = false;
        let profilePic: PatientFilesModel = this.GetProfilePicObject($event);
        //If patient already exists then post this file independenlty, else assign it to Patient's ProfilePic object
        //and send at the time of Registration.
        if (this.currPatient.PatientId) {
            this.PostPatientFile(profilePic);
        }
        else {
            this.currPatient.ProfilePic = profilePic;
            this.currPatient.HasFile = true;
        }
    }

    OnCropperClosed($event) {
        this.openPhotoCropper = false;
    }


    PostPatientFile(patFileToPost: PatientFilesModel) {
        let omited = _.omit(patFileToPost, ['PatientFilesValidator']);
        let patFileInfo = JSON.stringify(omited);

        this.http.post<any>("/api/Patient?reqType=profile-pic", patFileInfo)
            .map(res => res)
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status == "OK") {
                    this.patientFile.FileBase64String = res.Results.FileBase64String;
                    console.log(res.Results);
                }
                else {
                    console.log(res.ErrorMessage);
                }
            });
    }


    LoadProfilePic() {
        this.http.get<any>("/api/patient?reqType=profile-pic&patientId=" + this.currPatient.PatientId)
            .map(res => res)
            .subscribe((res: DanpheHTTPResponse) => {
                console.log(res);

                let fileInfo = res.Results;
                if (fileInfo) {
                    this.patientFile.FileBase64String = fileInfo.FileBase64String;
                    this.currPatient.ProfilePic = fileInfo;
                }

            });
    }

    GetProfilePicObject(imageBase64String): PatientFilesModel {

        let retObj = new PatientFilesModel();
        //assign required properties of patientfiles. 

        retObj.PatientId = this.currPatient.PatientId;
        retObj.FileType = "profile-pic";
        retObj.UploadedOn = moment().format("YYYY-MM-DD HH:mm:ss");
        retObj.UploadedBy = 1;
        retObj.IsActive = true;
        retObj.Description = "Profile Picture";
        //retObj.FileName = "";
        //retObj.FileExtention = ".jpg";

        let dataURI = imageBase64String.base64.split(",");
        retObj.FileBase64String = dataURI[1];//image-data comes in 1st index after splitting. 
        this.patientFile.FileBase64String = retObj.FileBase64String;
        return retObj;
    }

}
