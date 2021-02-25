import { Injectable, Directive } from '@angular/core';
import { ClinicalDLService } from './clinical.dl.service';
import { FamilyHistory } from './family-history.model';
import { SocialHistory } from './social-history.model';
import { SurgicalHistory } from './surgical-history.model';
import { PatientImagesModel } from "../shared/patient-uploaded-images.model";
import * as moment from 'moment/moment';

import * as _ from 'lodash';
import { ClinicalSubjectivePrescriptionNotes } from '../../clinical-notes/shared/subjective-note.model';
import { ReferralSource } from '../../doctors/referral-source/referral-source.model';
@Injectable()
export class HistoryBLService {

    constructor(public clinicalDLService: ClinicalDLService) {
    }
    //family-history.component
    //get list of family history using patientId
    public GetFamilyHistoryList(patientId: number) {
        return this.clinicalDLService.GetFamilyHistoryList(patientId)
            .map(res => res);
    }
    //social-history.component
    //get list of social history using patientId
    public GetSocialHistoryList(patientId: number) {
        return this.clinicalDLService.GetSocialHistoryList(patientId)
            .map(res => res);
  }
  public GetReferralSourceList(patientId: number) {
    return this.clinicalDLService.GetReferralSourceList(patientId)
      .map(res => res);
  }
    //surgical-history.component
    //get list of surgical history using patientId.
    public GetSurgicalHistoryList(patientId: number) {
        return this.clinicalDLService.GetSurgicalHistoryList(patientId)
            .map(res => res)
    }
    //get uploaded scanned images
    public GetUploadedPatientImages(patientId: number) {
        return this.clinicalDLService.GetUploadedPatientImages(patientId)
            .map(res => res)
    }
    // public GetICDList() {
    //     return this.clinicalDLService.GetMasterICDList()
    //         .map(res => res);
    // }
    //family-history.component
    //post family history
    public PostFamilyHistory(currentFamilyHistory: FamilyHistory) {
        var temp = _.omit(currentFamilyHistory, ['FamilyHistoryValidator']);
        return this.clinicalDLService.PostFamilyHistory(temp)
            .map(res => res);
    }
    //social-history.component
    //post social history
    public PostSocialHistory(currentSocialHistory: SocialHistory) {
        var temp = _.omit(currentSocialHistory, ['SocialHistoryValidator']);
        return this.clinicalDLService.PostSocialHistory(temp)
            .map(res => res);
  }
  //post referral source 
  public PostReferralSource(currentReferralSource: ReferralSource) {
    var temp = _.omit(currentReferralSource, ['ReferralSourceValidator']);
    return this.clinicalDLService.PostReferralSource(temp)
      .map(res => res);
     }
    //surgical-history.component
    //post surgical history
    public PostSurgicalHistory(currentSurgicalHistory: SurgicalHistory) {
        var temp = _.omit(currentSurgicalHistory, ['SurgicalHistoryValidator']);
        return this.clinicalDLService.PostSurgicalHistory(temp)
            .map(res => res);
    }

    //family-history.component
    //update family history
    public PutFamilyHistory(currentFamilyHistory: FamilyHistory) {
        //gives json convert error in the server side if the format is not set properly.
        currentFamilyHistory.CreatedOn = moment(currentFamilyHistory.CreatedOn).format('YYYY-MM-DD HH:mm');
        var temp = _.omit(currentFamilyHistory, ['FamilyHistoryValidator']);

        let data = JSON.stringify(temp);
        let reqType = 'familyhistory';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }

    //social-history.component
    //update social history
    public PutSocialHistory(currentSocialHistory: SocialHistory) {
        //gives json convert error in the server side if the format is not set properly.
        currentSocialHistory.CreatedOn = moment(currentSocialHistory.CreatedOn).format('YYYY-MM-DD HH:mm');
        var temp = _.omit(currentSocialHistory, ['SocialHistoryValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'socialhistory';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
  }
  //PutReferralSource
  public PutReferralSource(currentReferralSource: ReferralSource) {
    //gives json convert error in the server side if the format is not set properly.
    currentReferralSource.CreatedOn = moment(currentReferralSource.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(currentReferralSource, ['ReferralSourceValidator']);
    let data = JSON.stringify(temp);
    let reqType = 'referralsource';
    return this.clinicalDLService.PutClinical(data, reqType)
      .map(res => res);
  }

    //surgical-history.component
    //update surgical history
    public PutSurgicalHistory(currentSurgicalHistory: SurgicalHistory) {
        //gives json convert error in the server side if the format is not set properly.
        currentSurgicalHistory.CreatedOn = moment(currentSurgicalHistory.CreatedOn).format('YYYY-MM-DD HH:mm');
        currentSurgicalHistory.SurgeryDate = moment(currentSurgicalHistory.SurgeryDate).format('YYYY-MM-DD');
        var temp = _.omit(currentSurgicalHistory, ['SurgicalHistoryValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'surgicalhistory';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
    public AddPatientImages(filesToUpload, patReport: PatientImagesModel) {
        try {
            let formToPost = new FormData();
            //localFolder storage address for the file ex. Radiology\X-Ray
            //var localFolder: string = "PatientFiles\\" + patReport.FileType;
            var fileName: string;
            //patient object was included to display it's details on client side
            //it is not necessary during post
            var omited = _.omit(patReport, ['PatientImageValidator']);

            //we've to encode uri since we might have special characters like , / ? : @ & = + $ #  etc in our report value. 
            var imgDetails = JSON.stringify(omited);//encodeURIComponent();


            let uploadedImgCount = 0;
            //ImageName can contain names of more than one image seperated by ;
            //if (patReport.ImageName)
            //    uploadedImgCount = patReport.ImageName.split(";").length;
            for (var i = 0; i < filesToUpload.length; i++) {
                //to get the imagetype
                let splitImagetype = filesToUpload[i].name.split(".");
                let imageExtension = splitImagetype[1];
                //fileName = PatientId_ImagingItemName_PatientVisitId_CurrentDateTime_Counter.imageExtension
                fileName = patReport.FileType + "_" + moment().format('DD-MM-YY') + "." + imageExtension;
                formToPost.append("uploads", filesToUpload[i], fileName);
            }
            //pending reports has ImagingReportId
            //new reports does not has ImagingReportId
            //if ImagingReportId is present then update item.
            formToPost.append("imgDetails", imgDetails);

            //let finalIPResult = input;
            return this.clinicalDLService.PostPatientImages(formToPost)
                .map(res => res);

        } catch (exception) {
            throw exception;
        }
    }
    public deactivateUploadedImage(patImageId: number) {
        return this.clinicalDLService.deactivateUploadedImage(patImageId)
            .map(res => res);
    }
    public GetSubjectivePrescriptionNotes(patientVisitId: number, notesId: number) {
        return this.clinicalDLService.GetSubjectivePrescriptionNotes(patientVisitId, notesId)
            .map(res => res);
    }
    public SaveNote(currentNotes: ClinicalSubjectivePrescriptionNotes) {
        return this.clinicalDLService.SaveNote(currentNotes)
            .map(res => res);

    }
}
