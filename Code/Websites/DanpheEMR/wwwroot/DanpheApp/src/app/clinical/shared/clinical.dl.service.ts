import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';




import { NotesModel } from '../../clinical-notes/shared/notes.model';
import { ClinicalSubjectivePrescriptionNotes } from '../../clinical-notes/shared/subjective-note.model';
import { IOPModel } from '../eye-examination/prescription-slip/shared/IOP.model';
import { PrescriptionSlipModel } from '../eye-examination/prescription-slip/shared/PrescriptionSlip.model';
import { TBUTModel } from '../eye-examination/prescription-slip/shared/TBUT.model';
import { AcceptanceModel } from '../eye-examination/prescription-slip/shared/acceptance.model';
import { DilateModel } from '../eye-examination/prescription-slip/shared/dilate.model';
import { HistoryModel } from '../eye-examination/prescription-slip/shared/history.model';
import { PlupModel } from '../eye-examination/prescription-slip/shared/plup.model';
import { RetinoscopyModel } from '../eye-examination/prescription-slip/shared/retinoscopy.model';
import { SchrimeModel } from '../eye-examination/prescription-slip/shared/schrime.model';
import { VaUnaidedModel } from '../eye-examination/prescription-slip/shared/va-unaided.model';
import { AblationProfileModel } from '../eye-examination/shared/AblationProfile.model';
import { EyeModel } from '../eye-examination/shared/Eye.model';
import { EyeVisuMaxModel } from '../eye-examination/shared/EyeVisuMax.model';
import { LaserDataEntryModel } from '../eye-examination/shared/LaserData.model';
import { LasikRSTModel } from '../eye-examination/shared/LasikRST.model';
import { ORAModel } from '../eye-examination/shared/ORA.model';
import { Pachymetry } from '../eye-examination/shared/Pachymetry.model';
import { PreOPPachymetryModel } from '../eye-examination/shared/PreOP-Pachymetry.model';
import { RefractionModel } from '../eye-examination/shared/Refraction.model';
import { SmileIncisionsModel } from '../eye-examination/shared/SmileIncisions.model';
import { SmileSettingsModel } from '../eye-examination/shared/SmileSettings.model';
import { WavefrontModel } from '../eye-examination/shared/Wavefront.model';
import { DanpheHTTPResponse } from '../../shared/common-models';

@Injectable()
export class ClinicalDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(public http: HttpClient) {
  }
  //family-history
  public GetFamilyHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical/FamilyHistories?patientId=" + patientId, this.options);
  }
  //social-history
  public GetSocialHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical/SocialHistory?patientId=" + patientId, this.options);
  }
  //Referral Source
  public GetReferralSourceList(patientId: number) {
    return this.http.get<any>("/api/Clinical/ReferralSource?patientId=" + patientId, this.options);
  }
  //surgical-history get
  public GetSurgicalHistoryList(patientId: number) {
    return this.http.get<any>("/api/Clinical/SurgicalHistory?patientId=" + patientId, this.options);
  }
  //home-medication get
  public GetHomeMedicationList(patientId: number) {
    return this.http.get<any>("/api/Clinical/HomeMedication?patientId=" + patientId, this.options)
  }
  //medication-prescription
  public GetMedicationList(patientId: number) {
    return this.http.get<any>("/api/Clinical/MedicationPrescriptions?patientId=" + patientId, this.options);
  }
  //allergy
  public GetPatientAllergyList(patientId: number) {
    return this.http.get<any>("/api/Clinical/PatientAllergies?patientId=" + patientId, this.options);
  }

  // Not in use
  // public GetRefraction() {
  //   return this.http.get<any>("/api/Clinical?masterId=" + "&reqType=getrefraction", this.options);
  // }
  //input-output
  public GetPatientInputOutputList(patientVisitId: number, fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Clinical/InputOutput?patientVisitId=" + patientVisitId + "&fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }
  //vitals
  public GetPatientVitalsList(patientVisitId: number) {
    return this.http.get<any>("/api/Clinical/LatestVitals?patientVisitId=" + patientVisitId, this.options);
  }
  //longsignature
  public GetProviderLongSignature(providerId: number) {
    return this.http.get<any>("/api/Clinical/ProviderLongSignature?providerId=" + providerId, this.options);
  }
  //get uploaded scanned images
  public GetUploadedPatientImages(patientId: number) {
    return this.http.get<any>("/api/Clinical/ScannedImages?patientId=" + patientId, this.options);
  }

  //active-medical
  public GetPatientActiveMedicalList(patientId: number) {
    return this.http.get<any>("/api/Clinical/ActiveMedicalProblems?patientId=" + patientId, this.options);
  }
  //past-medical
  public GetPatientPastMedicalList(patientId: number) {
    return this.http.get<any>("/api/Clinical/PastMedicalProblems?patientId=" + patientId, this.options);
  }
  //notes
  // public GetPatientClinicalDetailsForNotes(patientVisitId: number, patientId: number) {
  //   return this.http.get<any>("/api/Clinical/Notes?patientVisitId=" + patientVisitId + "&patientId=" + patientId, this.options);
  // }
  //notes
  public GetMasterReactionList() {
    return this.http.get<any>("/api/Master/Reactions", this.options);
  }
  public GetMasterMedicineList() {
    return this.http.get<any>("/api/Master/Medicines", this.options);
  }
  //Get Eye History
  public GetEyeHistoryByPatientId(PatientId) {
    return this.http.get<any>("/api/Clinical/EyeHistory?patientId=" + PatientId, this.options);
  }
  public LoadEyeEMR(MasterId: number) {
    return this.http.get<any>("/api/Clinical/EyeEMR?masterId=" + MasterId, this.options);
  }
  // public GetMasterICDList() {
  //     return this.http.get<any>("/api/Master?type=icdcode", this.options);
  // }
  public GetPhrmGenericList() {
    return this.http.get<any>("/api/PharmacySettings/Generics");
  }
  public GetPatientClinicalNotes(patientId: number) {
    return this.http.get<any>("/api/Clinical/PatientNotes?patientId=" + patientId, this.options);
  }
  public GetPatientObjectiveNote(notesId: number) {
    return this.http.get<any>("/api/Clinical?reqType=get-objective-notes&notesId=" + notesId, this.options);
  }
  //family-history
  public PostFamilyHistory(currentFamilyHistory) {
    let data = JSON.stringify(currentFamilyHistory);
    return this.http.post<any>("/api/Clinical/FamilyHistory", data, this.options)
  }
  //social-history
  public PostSocialHistory(currentSocialHistory) {
    let data = JSON.stringify(currentSocialHistory);
    return this.http.post<any>("/api/Clinical/SocialHistory", data, this.options)
  }
  //PostReferralSource
  public PostReferralSource(currentReferralSource) {
    let data = JSON.stringify(currentReferralSource);
    return this.http.post<any>("/api/Clinical/ReferralSource", data, this.options)
  }
  //surgical-history post
  public PostSurgicalHistory(currentSurgicalHistory) {
    let data = JSON.stringify(currentSurgicalHistory);
    return this.http.post<any>("/api/Clinical/SurgicalHistory", data, this.options)
  }

  //home-medication post
  public PostHomeMedication(currentHomeMedication) {
    let data = JSON.stringify(currentHomeMedication);
    return this.http.post<any>("/api/Clinical/HomeMedication", data, this.options)
  }

  //medication-prescription
  public PostPrescription(currentMedication) {
    let data = JSON.stringify(currentMedication);
    return this.http.post<any>("/api/Clinical/MedicationPrescription", data, this.options);
  }

  //allergy
  public PostAllergy(currentAllergy) {
    let data = JSON.stringify(currentAllergy);
    return this.http.post<any>("/api/Clinical/Allergy", data, this.options);
  }

  //input-output
  public PostInputOutput(currentInputOutput) {
    let data = JSON.stringify(currentInputOutput);
    return this.http.post<any>("/api/Clinical/InputOutput", data, this.options);
  }

  //vitals
  public PostVitals(currentVitals: string) {
    return this.http.post<any>("/api/Clinical/Vitals", currentVitals, this.options);
  }
  // public PostNotes(currentNotes) {
  //   let data = JSON.stringify(currentNotes);
  //   return this.http.post<any>("/api/Clinical?reqType=notes", data, this.options);
  // }

  //active-medical
  public PostActiveMedical(currentActiveMedical) {
    let data = JSON.stringify(currentActiveMedical);
    return this.http.post<any>("/api/Clinical/ActiveMedicalProblem", data, this.options);
  }
  //past-medical
  public PostPastMedical(pastMedical) {
    let data = JSON.stringify(pastMedical);
    return this.http.post<any>("/api/Clinical/PastMedicalProblem", data, this.options);
  }


  public PutActiveMedicalProblem(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/ActiveMedicalProblem", clinicalObj, this.options);

  }

  public PutClinicalPastMedical(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/PastMedical", clinicalObj, this.options);

  }


  public PutClinicalHomeMedication(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/HomeMedication", clinicalObj, this.options);

  }

  public PutClinicalFamilyHistory(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/FamilyHistory", clinicalObj, this.options);

  }

  public PutClinicalMedicationPrescription(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/MedicationPrescription", clinicalObj, this.options);

  }

  public PutClinicalSocialHistory(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/SocialHistory", clinicalObj, this.options);

  }

  public PutClinicalreferralsource(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/ReferralSource", clinicalObj, this.options);

  }
  public PutClinicalSurgicalHistory(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/SurgicalHistory", clinicalObj, this.options);

  }
  public PutClinicalInputOutput(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/InputOutput", clinicalObj, this.options);

  }
  public PutClinicalAllergy(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/Allergy", clinicalObj, this.options);

  }
  public PutClinicalVitals(clinicalObj: string) {
    return this.http.put<any>("/api/Clinical/Vitals", clinicalObj, this.options);

  }
  public deactivateUploadedImage(patImageId) {
    return this.http.put<any>("/api/Clinical/DeactivatePatientImage?patImageId=" + patImageId, this.options);
  }

  //active-medical
  public ResolveActiveMedicalProblem(activeMedical) {
    return this.http.put<any>("/api/Clinical/ResolveActiveMedicalProblem?patientProblemId=" + activeMedical.PatientProblemId, this.options);
  }
  public PostPatientImages(formData: any) {
    try {
      return this.http.post<any>("/api/Clinical/PatientFiles", formData);
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
    return this.http.post<any>("/api/Clinical/EyeMasterDetails", data, this.options);
  }
  public PutMasterEye(EyeMaster: EyeModel) {
    return this.http.put<any>("/api/Clinical?reqType=EyeMasterDetail", EyeMaster, this.options);

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
    return this.http.post<any>("/api/Clinical/PrescriptionMasterSlip", data, this.options);
  }
  //Get  Prescription History
  public GetPrescriptionHistoryByPatientId(PatientId) {
    return this.http.get<any>("/api/Clinical/PrescriptionHistory?patientId=" + PatientId, this.options);
  }
  public LoadPrescriptionDetailbyMasterId(MasterId: number) {
    return this.http.get<any>("/api/Clinical/PrescriptionDetails?masterId=" + MasterId, this.options);
  }

  public PostScannedEyeImages(formData: any) {
    try {
      return this.http.post<any>("/api/Clinical/ScannedEyeImages", formData);
    } catch (exception) {
      throw exception;
    }
  }

  /// Post Notes Template
  public PostProcedureNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/ProcedureNoteTemplate", data, this.options);
  }
  public PostProgressNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/ProgressNoteTemplateDetail", data, this.options);
  }

  public PostFreetextNoteTemplate(NoteMaster: NotesModel) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/FreeTextNoteTemplateDetail", data, this.options);
  }

  public PostDischargeSummary(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/DischargeNote", data, this.options);
  }

  public PostHistoryAndPhysicalNoteTemplate(NoteMaster: NotesModel) {
    console.log("Note Master in dl:");
    console.log(NoteMaster);
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/HistoryAndPhysicalNoteDetail", data, this.options);
  }
  public PostEmergencyNoteTemplate(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/EmergencyNote", data, this.options);
  }
  public PostClinicalPrescripitionNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.post<any>("/api/Clinical/PrescriptionNote", data, this.options);
  }

  ///Get Notes Template
  public GetNoteTypeList() {
    return this.http.get<any>("/api/Clinical/NoteTypes", this.options);
  }
  public GetAllTemplateList() {
    return this.http.get<any>("/api/Clinical/NotesTemplates", this.options);
  }
  public GetFreetextNoteTemplateByNotesId(NoteId) {
    return this.http.get<any>("/api/Clinical/FreeTextNoteTemplateDetail?NoteId=" + NoteId, this.options);
  }
  public GetProcedureNoteTemplateByNotesId(NoteId) {
    return this.http.get<any>("/api/Clinical/ProcedureNoteTemplateDetail?NoteId=" + NoteId, this.options);
  }

  public GetProgressNoteTemplateByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical/ProgressNoteTemplateDetail?NoteId=" + NotesId, this.options);
  }
  public GetTemplateDetailsByNotesId(NotesId) {
    return this.http.get<any>("/api/Clinical/TemplateDetailsByNoteId?noteId=" + NotesId, this.options);
  }
  public GetAllOrdersByNoteId(NoteId) {
    return this.http.get<any>("/api/Clinical/OrdersAndICD?NoteId=" + NoteId, this.options);
  }
  public GetHistoryAndPhysicalNoteById(NotesId) {
    return this.http.get<any>("/api/Clinical/HistoryAndPhysicalNoteDetail?NoteId=" + NotesId, this.options);
  }
  public GetEmergencyNoteById(NotesId) {
    return this.http.get<any>("/api/Clinical/EmergencyNoteDetail?NoteId=" + NotesId, this.options);
  }
  public GetClinicalPrescriptionNoteById(NoteId) {
    return this.http.get<any>("/api/Clinical/PrescriptionNoteDetail?NoteId=" + NoteId, this.options);
  }
  ///Put Notes Template
  public PutFreetextNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/FreeTextNoteTemplateDetail", data, this.options);
  }

  public PutProcedureNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/ProcedureNoteTemplateDetail", data, this.options);
  }

  public PutProgressNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/ProgressNoteTemplateDetail", data, this.options);
  }

  public PutEmergencyNoteTemplate(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/EmergencyNoteDetail", data, this.options);
  }

  public PutHistoryAndPhysicalNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/HistoryAndPhysicalNoteDetail", data, this.options);
  }

  public PutDischargeNoteTemplateByNotesId(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/DischargeNoteTemplateDetail", data, this.options);
  }

  public GetSubjectivePrescriptionNotes(patientVisitId: number, noteId: number) {
    return this.http.get<any>("/api/Clinical/PrescriptionNote?patientVisitId=" + patientVisitId + "&noteId=" + noteId, this.options);
  }
  public SaveNote(prescriptionNotes: ClinicalSubjectivePrescriptionNotes) {
    let data = JSON.stringify(prescriptionNotes);
    return this.http.post<any>("/api/Clinical?reqType=postprescriptionnotes", data, this.options);
  }

  public PutClinicalPrescripitionNote(NoteMaster) {
    let data = JSON.stringify(NoteMaster);
    return this.http.put<any>("/api/Clinical/PrescriptionNote", data, this.options);
  }
  public PostBloodSugar(currentInputOutput) {
    return this.http.post<any>("/api/Clinical/bloodsugar", currentInputOutput, this.optionJson);
  }

  public GetPatientAdmissionInfo(patientVisitId: number) {
    return this.http.get<any>("/api/Clinical/patient-admission-info?patientVisitId=" + patientVisitId, this.options);
  }
  public GetPatientBloodSugarList(patientVisitId: number) {
    return this.http.get<any>("/api/Clinical/bloodsugar?patientVisitId=" + patientVisitId, this.options);
  }
  public GetClinicalIntakeOutputParameterList() {
    return this.http.get<DanpheHTTPResponse>("/api/Clinical/getClinicalIntakeOutputParameter", this.options);
  }
}
