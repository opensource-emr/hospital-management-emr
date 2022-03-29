import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { FamilyHistory } from './family-history.model';
import { SocialHistory } from './social-history.model';
import { SurgicalHistory } from './surgical-history.model';

import { HomeMedication } from './home-medication.model';
import { MedicationPrescription } from './medication-prescription.model';

import { Vitals } from './vitals.model';
import { Allergy } from './allergy.model';
import { InputOutput } from './input-output.model';

import { ActiveMedical } from './active-medical.model';
import { PastMedical } from './past-medical.model';
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
import { AcceptanceModel } from '../eye-examination/prescription-slip/shared/acceptance.model';
import { HistoryModel } from '../eye-examination/prescription-slip/shared/history.model';
import { DilateModel } from '../eye-examination/prescription-slip/shared/dilate.model';
import { IOPModel } from '../eye-examination/prescription-slip/shared/IOP.model';
import { PlupModel } from '../eye-examination/prescription-slip/shared/plup.model';
import { RetinoscopyModel } from '../eye-examination/prescription-slip/shared/retinoscopy.model';
import { SchrimeModel } from '../eye-examination/prescription-slip/shared/schrime.model';
import { VaUnaidedModel } from '../eye-examination/prescription-slip/shared/va-unaided.model';
import { PrescriptionSlipModel } from '../eye-examination/prescription-slip/shared/PrescriptionSlip.model';
import { TBUTModel } from '../eye-examination/prescription-slip/shared/TBUT.model';
import { ClinicalSubjectivePrescriptionNotes } from '../../clinical-notes/shared/subjective-note.model';
import { NotesModel } from '../../clinical-notes/shared/notes.model';

@Injectable()
export class ClinicalDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {
  }
  //family-history
  public GetFamilyHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=familyhistory", this.options);
  }
  //social-history
  public GetSocialHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=socialhistory", this.options);
  }
  //Referral Source
  public GetReferralSourceList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=referralsource", this.options);
  }
  //surgical-history get
  public GetSurgicalHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=surgicalhistory", this.options);
  }
  //home-medication get
  public GetHomeMedicationList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=homemedication", this.options)
  }
  //medication-prescription
  public GetMedicationList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=medicationprescription", this.options);
  }
  //allergy
  public GetPatientAllergyList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=allergy", this.options);
  }

  public GetRefraction() {
    return this.http.get<any>("/api/Clinical?masterId=" + "&reqType=getrefraction", this.options);
  }
  //input-output
  public GetPatientInputOutputList(patientVisitId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&reqType=inputoutput", this.options);
  }
  //vitals
  public GetPatientVitalsList(patientVisitId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&reqType=vitals", this.options);
  }
  //longsignature
  public GetProviderLongSignature(providerId: number) {
    return this.http.get<any>("/api/Clinical?providerId=" + providerId + "&reqType=ProviderLongSignature", this.options);
  }
  //get uploaded scanned images
  public GetUploadedPatientImages(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=GetUploadedScannedImages", this.options);
  }

  //active-medical
  public GetPatientActiveMedicalList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=activemedical", this.options);
  }
  //past-medical
  public GetPatientPastMedicalList(patientId: number) {
    return this.http.get<any>("/api/Clinical?patientId=" + patientId + "&reqType=pastmedical", this.options);
  }
  //notes
  public GetPatientClinicalDetailsForNotes(patientVisitId: number, patientId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&patientId=" + patientId + "&reqType=notes", this.options);
  }
  //Patient visit note
  public GetPatientVisitNote(patientVisitId: number, patientId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&patientId=" + patientId + "&reqType=patient-visit-note", this.options);
  }
  //patient-visit-procedures 
  public GetPatientVisitProcedures(patientVisitId: number, patientId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&patientId=" + patientId + "&reqType=patient-visit-procedures", this.options);
  }
  public GetPatientVisitNoteAllData( patientId: number,patientVisitId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&patientId=" + patientId + "&reqType=patient-visit-note-all-data", this.options);
  }
  //notes
  public GetMasterReactionList() {
    return this.http.get<any>("/api/Master?type=reaction", this.options);
  }
  public GetMasterMedicineList() {
    return this.http.get<any>("/api/Master?type=medicine", this.options);
  }
  //Get Eye History
  public GetEyeHistoryByPatientId(PatientId) {
    return this.http.get<any>("/api/Clinical?reqType=EyeHistory&patientId=" + PatientId, this.options);
  }
  public LoadEyeEMR(MasterId: number) {
    return this.http.get<any>("/api/Clinical?reqType=GetEMRbyId&masterId=" + MasterId, this.options);
  }
  // public GetMasterICDList() {
  //     return this.http.get<any>("/api/Master?type=icdcode", this.options);
  // }
  public GetPhrmGenericList() {
    return this.http.get<any>("/api/Pharmacy?reqType=getGenericList");
  }
  public GetPatientClinicalNotes(patientId: number) {
    return this.http.get<any>("/api/Clinical?reqType=patient-clinical-notes&patientId=" + patientId, this.options);
  }
  public GetPatientObjectiveNote(notesId: number) {
    return this.http.get<any>("/api/Clinical?reqType=get-objective-notes&notesId=" + notesId, this.options);
  }
  //family-history
  public PostFamilyHistory(currentFamilyHistory) {
    let data = JSON.stringify(currentFamilyHistory);
    return this.http.post<any>("/api/Clinical?reqType=familyhistory", data, this.options)
  }
  //social-history
  public PostSocialHistory(currentSocialHistory) {
    let data = JSON.stringify(currentSocialHistory);
    return this.http.post<any>("/api/Clinical?reqType=socialhistory", data, this.options)
  }
  //PostReferralSource
  public PostReferralSource(currentReferralSource) {
    let data = JSON.stringify(currentReferralSource);
    return this.http.post<any>("/api/Clinical?reqType=referralsource", data, this.options)
  }
  //surgical-history post
  public PostSurgicalHistory(currentSurgicalHistory) {
    let data = JSON.stringify(currentSurgicalHistory);
    return this.http.post<any>("/api/Clinical?reqType=surgicalhistory", data, this.options)
  }

  //home-medication post
  public PostHomeMedication(currentHomeMedication) {
    let data = JSON.stringify(currentHomeMedication);
    return this.http.post<any>("/api/Clinical?reqType=homemedication", data, this.options)
  }

  //medication-prescription
  public PostPrescription(currentMedication) {
    let data = JSON.stringify(currentMedication);
    return this.http.post<any>("/api/Clinical?reqType=medicationprescription", data, this.options);
  }

  //allergy
  public PostAllergy(currentAllergy) {
    let data = JSON.stringify(currentAllergy);
    return this.http.post<any>("/api/Clinical?reqType=allergy", data, this.options);
  }

  //input-output
  public PostInputOutput(currentInputOutput) {
    let data = JSON.stringify(currentInputOutput);
    return this.http.post<any>("/api/Clinical?reqType=inputoutput", data, this.options);
  }

  //vitals
  public PostVitals(currentVitals: string) {
    return this.http.post<any>("/api/Clinical?reqType=vitals", currentVitals, this.options);
  }
  public PostNotes(currentNotes) {
    let data = JSON.stringify(currentNotes);
    return this.http.post<any>("/api/Clinical?reqType=notes", data, this.options);
  }

  //active-medical
  public PostActiveMedical(currentActiveMedical) {
    let data = JSON.stringify(currentActiveMedical);
    return this.http.post<any>("/api/Clinical?reqType=activemedical", data, this.options);
  }
  //past-medical
  public PostPastMedical(pastMedical) {
    let data = JSON.stringify(pastMedical);
    return this.http.post<any>("/api/Clinical?reqType=pastmedical", data, this.options);
  }
  public PostPatientVisitNote(patientVisitNote) {
    let data = JSON.stringify(patientVisitNote);
    return this.http.post<any>("/api/Clinical?reqType=patient-visit-note", data, this.options);
  }
  
  public PostPatientVisitProcedures(patientVisitProcedures) {
    let data = JSON.stringify(patientVisitProcedures);
    return this.http.post<any>("/api/Clinical?reqType=patient-visit-procedures", data, this.options);
  }
  public PutPatientVisitNote(patientVisitNote) {
    return this.http.put<any>("/api/Clinical?reqType=patient-visit-note", patientVisitNote, this.options);

  }
  public PutClinical(clinicalObj: string, reqType: string) {
    return this.http.put<any>("/api/Clinical?reqType=" + reqType, clinicalObj, this.options);

  }
  public deactivateUploadedImage(patImageId) {
    return this.http.delete<any>("/api/Clinical?reqType=deactivateUploadedImage" + "&patImageId=" + patImageId, this.options);
  }

  //active-medical
  public DeleteActiveMedical(activeMedical) {
    return this.http.delete<any>("/api/Clinical?reqType=activemedical" + "&patientProblemId=" + activeMedical.PatientProblemId, this.options);
  }
  public PostPatientImages(formData: any) {
    try {
      return this.http.post<any>("/api/Clinical?reqType=upload", formData);
    } catch (exception) {
      throw exception;
    }
  }
  //eyerefraction
  //medication-prescription
  public PostRefraction(refraction: RefractionModel) {
    let data = JSON.stringify(refraction);
    return this.http.post<any>("/api/Clinical?reqType=postrefraction", data, this.options);
  }
  //ablation
  public PostAblation(ablation: AblationProfileModel) {
    let data = JSON.stringify(ablation);
    return this.http.post<any>("/api/Clinical?reqType=postablation", data, this.options);
  }
  //laserdata
  public PostLaserData(laserdata: LaserDataEntryModel) {
    let data = JSON.stringify(laserdata);
    return this.http.post<any>("/api/Clinical?reqType=postlaserdata", data, this.options);
  }
  //prepechymetry
  public PostPrePachymetry(prepachymetry: PreOPPachymetryModel) {
    let data = JSON.stringify(prepachymetry);
    return this.http.post<any>("/api/Clinical?reqType=postprepachymetry", data, this.options);
  }
  //LASIKRST
  public PostLaSikRST(lasikrst: LasikRSTModel) {
    let data = JSON.stringify(lasikrst);
    return this.http.post<any>("/api/Clinical?reqType=postlasikrst", data, this.options);
  }
  //SmileSetting
  public PostSmileSetting(smilesetting: SmileSettingsModel) {
    let data = JSON.stringify(smilesetting);
    return this.http.post<any>("/api/Clinical?reqType=postsmilesetting", data, this.options);
  }
  //eyevisumax
  public PostVisumax(visumax: EyeVisuMaxModel) {
    let data = JSON.stringify(visumax);
    return this.http.post<any>("/api/Clinical?reqType=postvisumax", data, this.options);
  }
  //eyesmileincision
  public PostSmileIncision(smileincision: SmileIncisionsModel) {
    let data = JSON.stringify(smileincision);
    return this.http.post<any>("/api/Clinical?reqType=postsmileincision", data, this.options);
  }

  //eyeora
  public PostORA(ora: ORAModel) {
    let data = JSON.stringify(ora);
    return this.http.post<any>("/api/Clinical?reqType=postora", data, this.options);
  }

  //eyewavefront
  public PostWavefront(wavefront: WavefrontModel) {
    let data = JSON.stringify(wavefront);
    return this.http.post<any>("/api/Clinical?reqType=postwavefront", data, this.options);
  }

  //eye-Pachymetry
  public PostPachymetry(pachymetry: Pachymetry) {
    let data = JSON.stringify(pachymetry);
    return this.http.post<any>("/api/Clinical?reqType=postpachymetry", data, this.options);
  }
  //eye-master
  public PostMasterEye(EyeMaster: EyeModel) {
    let data = JSON.stringify(EyeMaster);
    return this.http.post<any>("/api/Clinical?reqType=posteyemaster", data, this.options);
  }
  public PutMasterEye(EyeMaster: EyeModel) {
    return this.http.put<any>("/api/Clinical?reqType=UpdateEyeMaster", EyeMaster, this.options);

  }
  public PostAcceptance(Acceptance: AcceptanceModel) {
    let data = JSON.stringify(Acceptance);
    return this.http.post<any>("/api/Clinical?reqType=postacceptance", data, this.options);
  }
  public PostHistory(History: HistoryModel) {
    let data = JSON.stringify(History);
    return this.http.post<any>("/api/Clinical?reqType=postpresricphistory", data, this.options);
  }
  public PostDilate(Dilate: DilateModel) {
    let data = JSON.stringify(Dilate);
    return this.http.post<any>("/api/Clinical?reqType=postdilate", data, this.options);
  }
  public PostIOP(IOP: IOPModel) {
    let data = JSON.stringify(IOP);
    return this.http.post<any>("/api/Clinical?reqType=postiop", data, this.options);
  }
  public PostPlup(Plup: PlupModel) {
    let data = JSON.stringify(Plup);
    return this.http.post<any>("/api/Clinical?reqType=postplup", data, this.options);
  }
  public PostRetinoscopy(Retinoscopy: RetinoscopyModel) {
    let data = JSON.stringify(Retinoscopy);
    return this.http.post<any>("/api/Clinical?reqType=postretinoscopy", data, this.options);
  }
  public PostSchrime(Schrime: SchrimeModel) {
    let data = JSON.stringify(Schrime);
    return this.http.post<any>("/api/Clinical?reqType=postschrime", data, this.options);
  }
  public PostVaUnaided(vaunaided: VaUnaidedModel) {
    let data = JSON.stringify(vaunaided);
    return this.http.post<any>("/api/Clinical?reqType=postvaunaided", data, this.options);
  }
  public PostTBUT(TBUT: TBUTModel) {
    let data = JSON.stringify(TBUT);
    return this.http.post<any>("/api/Clinical?reqType=postTBUT", data, this.options);
  }
  public PostMasterPrescriptionSlip(PrescriptionSlip: PrescriptionSlipModel) {
    let data = JSON.stringify(PrescriptionSlip);
    return this.http.post<any>("/api/Clinical?reqType=postprescriptionslipmaster", data, this.options);
  }
  //Get  Prescription History
  public GetPrescriptionHistoryByPatientId(PatientId) {
    return this.http.get<any>("/api/Clinical?reqType=PrescriptionHistory&patientId=" + PatientId, this.options);
  }
  public LoadPrescriptionDetailbyMasterId(MasterId: number) {
    return this.http.get<any>("/api/Clinical?reqType=GetPrescriptionbyMasterId&masterId=" + MasterId, this.options);
  }

  public AddPatientFiles(formData: any) {
    try {
      return this.http.post<any>("/api/Clinical?reqType=scanimagesupload", formData);
    } catch (exception) {
      throw exception;
    }
  }

  /// Post Notes Template
  public PostProcedureNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postprocedurenotetemplate", data, this.options);
  }
  public PostProgressNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postprogressnotetemplate", data, this.options);
  }

  public PostFreetextNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postfreetextnotetemplate", data, this.options);
  }

  public PostDischargeSummary(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postdischargenote", data, this.options);
  }

  public PostHistoryAndPhysicalNoteTemplate(NoteMaster: NotesModel) {
    console.log("Note Master in dl:");
    console.log(NoteMaster);
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=posthistoryandphysicalnote", data, this.options);
  }
  public PostOpdExamination(NoteMaster: NotesModel) {
    console.log("Note Master in dl:");
    console.log(NoteMaster);
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postopdexamination", data, this.options);
  }
  public PostEmergencyNoteTemplate(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=postemergencynote", data, this.options);
  }
  public PostClinicalPrescripitionNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical?reqType=post-clinicalprescription-note", data, this.options);
  }

  ///Get Notes Template
  public GetNoteTypeList() {
    return this.http.get<any>("/api/Clinical?reqType=getNoteTypeList", this.options);
  }
  public GetAllTemplateList() {
    return this.http.get<any>("/api/Clinical?reqType=getTemplateList", this.options);
  }
  public GetFreetextNoteTemplateByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getFreeTextTemplateList&NotesId=" + NotesId, this.options);
  }
  public GetProcedureNoteTemplateByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getProcedureNoteTemplateList&NotesId=" + NotesId, this.options);
  }

  public GetProgressNoteTemplateByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getProgressNoteTemplateList&NotesId=" + NotesId, this.options);
  }
  public GetTemplateDetailsByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical/GetTemplateDetailsByNoteId/" + NotesId, this.options);
  }
  public GetAllOrdersByNoteId(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getAllOrdersByNoteId&NotesId=" + NotesId, this.options);
  }
  public GetHistoryAndPhysicalNoteById(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getHistoryAndPhysicalNoteById&NotesId=" + NotesId, this.options);
  }
  public GetOpdExaminationdetailsById(patientId,patientVisitid,notesId) {
    return this.http.get<any>("/api/Clinical?reqType=getopdExaminationById&patientVisitId=" + patientVisitid + "&patientId=" + patientId + "&notesId="+ notesId, this.options);
  }
  public GetEmergencyNoteById(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getEmergencyNoteById&NotesId=" + NotesId, this.options);
  }
  public GetClinicalPrescriptionNoteById(NotesId) {
    return this.http.get<any>("/api/Clinical?reqType=getClinicalPrescriptionNoteById&NotesId=" + NotesId, this.options);
  }
  ///Put Notes Template
  public PutFreetextNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putFreeTextTemplateList", data, this.options);
  }

  public PutProcedureNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putProcedureNoteTemplateList", data, this.options);
  }

  public PutProgressNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putProgressNoteTemplateList", data, this.options);
  }

  public PutEmergencyNoteTemplate(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putEmergencyNoteTemplate", data, this.options);
  }

  public PutHistoryAndPhysicalNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putHistoryAndPhysicalNoteTemplate", data, this.options);
  }

  public PutDischargeNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putDischargeNoteTemplateList", data, this.options);
  }

  public GetSubjectivePrescriptionNotes(patientVisitId: number, notesId: number) {
    return this.http.get<any>("/api/Clinical?patientVisitId=" + patientVisitId + "&notesId=" + notesId + "&reqType=patient-clinical-prescription-notes", this.options);
  }
  public SaveNote(prescriptionNotes: ClinicalSubjectivePrescriptionNotes) {
    let data = JSON.stringify(prescriptionNotes);
    return this.http.post<any>("/api/Clinical?reqType=postprescriptionnotes", data, this.options);
  }

  public PutClinicalPrescripitionNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical?reqType=putPrescriptionNote", data, this.options);
  }

}
