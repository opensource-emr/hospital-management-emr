import { Injectable, Directive } from '@angular/core';
import { ClinicalDLService } from './clinical.dl.service';
import { HomeMedication } from './home-medication.model';
import { MedicationPrescription } from './medication-prescription.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { RefractionModel } from '../eye-examination/shared/Refraction.model';
import { EyeVisuMaxModel } from '../eye-examination/shared/EyeVisuMax.model';
import { SmileIncisionsModel } from '../eye-examination/shared/SmileIncisions.model';
import { ORAModel } from '../eye-examination/shared/ORA.model';
import { WavefrontModel } from '../eye-examination/shared/Wavefront.model';
import { Pachymetry } from '../eye-examination/shared/Pachymetry.model';
import { AblationProfileModel } from '../eye-examination/shared/AblationProfile.model';
import { LaserDataEntryModel } from '../eye-examination/shared/LaserData.model';
import { PreOPPachymetryModel } from '../eye-examination/shared/PreOP-Pachymetry.model';
import { LasikRSTModel } from '../eye-examination/shared/LasikRST.model';
import { SmileSettingsModel } from '../eye-examination/shared/SmileSettings.model';
import { EyeModel } from '../eye-examination/shared/Eye.model';
import { EyeScanModel } from '../eye-examination/scan-upload/shared/eye-scan-images.model';
@Injectable()
export class EyeExaminationBLService {

  public _MasterId: number = 0;
  get MasterId(): number {
    return this._MasterId;
  }
  set MasterId(MasterId: number) {
    this._MasterId = MasterId;
  }
  constructor(public clinicalDLService: ClinicalDLService) {
  }
  //Get Patient History
  public GetEyeHistoryByPatientId(PatientId: number) {
    return this.clinicalDLService.GetEyeHistoryByPatientId(PatientId)
      .map(res => res);
  }
  public LoadEyeEMR(MasterId) {
    return this.clinicalDLService.LoadEyeEMR(MasterId)
      .map(res => res);
  }
    //eye-refraction
  public PostRefraction(refraction: RefractionModel) {

    return this.clinicalDLService.PostRefraction(refraction)
      .map(res => res);
  }
  //Ablation
  public PostAblation(ablation: AblationProfileModel) {

    return this.clinicalDLService.PostAblation(ablation)
      .map(res => res);
  }
  //LASERDATA
  public PostLaserData(laserdata: LaserDataEntryModel) {

    return this.clinicalDLService.PostLaserData(laserdata)
      .map(res => res);
  }
  //PrePachymetry
  public PostPrePachymetry(prepachymetry: PreOPPachymetryModel) {

    return this.clinicalDLService.PostPrePachymetry(prepachymetry)
      .map(res => res);
  }
  //LASIKRST
  public PostLaSikRST(lasikrst: LasikRSTModel) {

    return this.clinicalDLService.PostLaSikRST(lasikrst)
      .map(res => res);
  }
  //smileIncision
  public PostSmileSetting(smilesetting: SmileSettingsModel) {

    return this.clinicalDLService.PostSmileSetting(smilesetting)
      .map(res => res);
  }

  //eye-visumax
  public PostVisumax(visumax: EyeVisuMaxModel) {

    return this.clinicalDLService.PostVisumax(visumax)
      .map(res => res);
  }

  //eye-SmileIncision
  public PostSmileIncision(smileincision: SmileIncisionsModel) {

    return this.clinicalDLService.PostSmileIncision(smileincision)
      .map(res => res);
  }

  //eye-ORA
  public PostORA(ora: ORAModel) {

    return this.clinicalDLService.PostORA(ora)
      .map(res => res);
  }

  //eye-Wavefront
  public PostWavefront(wavefront: WavefrontModel) {

    return this.clinicalDLService.PostWavefront(wavefront)
      .map(res => res);
  }

  //eye-Pachymetry
  public PostPachymetry(pachymetry: Pachymetry) {

    return this.clinicalDLService.PostPachymetry(pachymetry)
      .map(res => res);
  }
  //eye-visumax
  public PostMasterEye(EyeMaster: EyeModel) {

    return this.clinicalDLService.PostMasterEye(EyeMaster)
      .map(res => res);
  }
  //update refraction
  public UpdateMasterEye(EyeMaster:EyeModel) {
    return this.clinicalDLService.PutMasterEye(EyeMaster)
      .map(res => res);
  }


  public AddPatientFiles(filesToUpload, patReport: EyeScanModel) {
    try {
      let formToPost = new FormData();
      //localFolder storage address for the file ex. Radiology\X-Ray
      //var localFolder: string = "PatientFiles\\" + patReport.FileType;
      var fileName: string;
      //patient object was included to display it's details on client side
      //it is not necessary during post
      var omited = _.omit(patReport, ['EyeScanValidator']);

      //we've to encode uri since we might have special characters like , / ? : @ & = + $ #  etc in our report value. 
      var reportDetails = JSON.stringify(omited);//encodeURIComponent();


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
      formToPost.append("reportDetails", reportDetails);

      //let finalIPResult = input;
      return this.clinicalDLService.AddPatientFiles(formToPost)
        .map(res => res);

    } catch (exception) {
      throw exception;
    }
  }
}

