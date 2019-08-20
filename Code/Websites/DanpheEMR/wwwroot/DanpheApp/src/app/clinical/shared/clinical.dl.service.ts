import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

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

@Injectable()
export class ClinicalDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
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
    public  GetUploadedPatientImages(patientId: number){
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
    //notes
    public GetMasterReactionList() {
        return this.http.get<any>("/api/Master?type=reaction", this.options);
    }
    public GetMasterMedicineList() {
        return this.http.get<any>("/api/Master?type=medicine", this.options);
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


    public PutClinical(clinicalObj: string, reqType: string) {
        return this.http.put<any>("/api/Clinical?reqType=" + reqType, clinicalObj, this.options);

    }
    public deactivateUploadedImage(patImageId){
        return this.http.delete<any>("/api/Clinical?reqType=deactivateUploadedImage" + "&patImageId="+ patImageId, this.options);
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
}
