import { Injectable, Directive } from '@angular/core';
import { ClinicalDLService } from './clinical.dl.service';

import { Vitals } from './vitals.model';
import { Allergy } from './allergy.model';
import { InputOutput } from './input-output.model';
//import { NotesModel } from '../notes/shared/notes.model';
import * as _ from 'lodash';
import * as moment from 'moment/moment';
import { PatientVisitNoteModel } from './clinical-patient-visit-note.model';
import { PatientVisitProcedureModel } from './clinical-patient-visit-procedure.model';
@Injectable()
export class IOAllergyVitalsBLService {

    constructor(public clinicalDLService: ClinicalDLService) { }
    //allergy
    //get list of allergy using patientId
    public GetPatientAllergyList(patientId: number) {
        return this.clinicalDLService.GetPatientAllergyList(patientId)
            .map(res => res);
    }
    public GetReactionList() {
        return this.clinicalDLService.GetMasterReactionList()
            .map(res => res);
    }
    public GetMedicineList() {
        return this.clinicalDLService.GetMasterMedicineList()
            .map(res => res);
    }
    //input-output
    //get list of IO using PatientId
    public GetPatientInputOutputList(patientVisitId: number) {
        return this.clinicalDLService.GetPatientInputOutputList(patientVisitId)
            .map(res => res);
    }
    //vitals
    //get list of vitals using patient Id
    public GetPatientVitalsList(patientVisitId: number) {
        return this.clinicalDLService.GetPatientVitalsList(patientVisitId)
            .map(res => res);
    }
    //get list of signature using provider Id
    public GetProviderLongSignature(providerId: number) {
        return this.clinicalDLService.GetProviderLongSignature(providerId)
            .map(res => res);
    }

    public GetPhrmGenericList() {
        return this.clinicalDLService.GetPhrmGenericList()
            .map(res => { return res });
    }

    //notes
    public GetPatientClinicalDetailsForNotes(patientVisitId: number, patientId: number) {
        return this.clinicalDLService.GetPatientClinicalDetailsForNotes(patientVisitId, patientId)
            .map(res => res);
    }
    public GetPatientVisitNote(patientVisitId: number, patientId: number) {
        return this.clinicalDLService.GetPatientVisitNote(patientVisitId, patientId)
            .map(res => res);
    }
    public GetPatientVisitNoteAllData(patientId: number,patientVisitId: number, ) {
        return this.clinicalDLService.GetPatientVisitNoteAllData(patientId,patientVisitId)
            .map(res => res);
    }
    
    public GetPatientVisitProcedures(patientVisitId: number, patientId: number) {
        return this.clinicalDLService.GetPatientVisitProcedures(patientVisitId, patientId)
            .map(res => res);
    }
    //allergy
    //post allergy
    public PostAllergy(currentAllergy: Allergy) {
        var temp = _.omit(currentAllergy, ['AllergyValidator']);
        return this.clinicalDLService.PostAllergy(temp)
            .map(res => res);
    }
    //input-output
    //post IO
    public PostInputOutput(currentInputOutput: InputOutput) {
        var temp = _.omit(currentInputOutput, ['InputOutputValidator']);
        return this.clinicalDLService.PostInputOutput(temp)
            .map(res => res);
    }
    //notes
    //post notes
    // public AddNotes(currentNotes: NotesModel, addType: string) {
    //     let notes = _.omit(currentNotes, ['PatientVisit']);
    //     return this.clinicalDLService.PostNotes(notes)
    //         .map(res => res);
    // }

    //input-output
    //calculate Balance in IO.
    public CalculateBalance(intake, output, lastBalance): number {
        return intake + lastBalance - output;
    }
    //vitals
    //calculate BMI in viatls.
    public CalculateBMI(height, weight, heightunit, weightunit): number {
        var _height;
        var _weight;
        //calculating BMI taking height in meter and weight in kg
        // BMI = (weight/ (height*height));
        if (heightunit == "cm")
            _height = height * 0.01;

        else if (heightunit == "inch") {
            _height = height * 0.0254;
        }

        else if (heightunit == "meter")
            _height = height;

        if (weightunit == "pound")
            _weight = weight * 0.45;

        else if (weightunit == "kg")
            _weight = weight

        var bmi = (_weight / (_height * _height));

        ///Math.round-> rounds off to the 1 decimal point
        return (Math.round(bmi * 10) / 10);
    }

    public ConvertInchToFootInch(value) {
        let inch = value % 12;
        let foot = (value - inch) / 12;
        if (foot < 0)
            foot = 0;
        let footinch = foot + "'" + inch + "''";
        return footinch;
    }

    //vitals
    //post vitals
    public PostVitals(currentVitals: Vitals) {
        //start1<sudarshan:23jan'17>: assigning validator to null to avoid circular-reference error inside JSON.stringify
        var obj = currentVitals;
        var vitalValidator = obj.VitalsValidator;//JUGAAD-cut,stringify & reassign validator : revision needed[see below error]
        obj.VitalsValidator = null;
        //ideally below line '_.omit' should work, but its giving null reference error, 
        //var temp = _.omit(obj, ['VitalsValidator']);
        let data = JSON.stringify(obj);
        obj.VitalsValidator = vitalValidator;
        //end1<sudarshan:23jan'17>: assigning validator to null to avoid circular-reference error inside JSON.stringify
        // we make the json string

        return this.clinicalDLService.PostVitals(data)
            .map(res => res);
    }
    //POSt: Patient visit note 
    public PostPatientVisitNote(patVisitNote:PatientVisitNoteModel){
        var temp = _.omit(patVisitNote, ['PatientVisitNoteValidator']);
        return this.clinicalDLService.PostPatientVisitNote(temp)
            .map(res => res);
    }
    
    //POSt: Patient visit procedures
    public PostPatientVisitProcedures(patVisitProcedures){
        return this.clinicalDLService.PostPatientVisitProcedures(patVisitProcedures)
            .map(res => res);
    }
    //Put: Patient visit note 
    public PutPatientVisitNote(patVisitNote:PatientVisitNoteModel){
        var temp = _.omit(patVisitNote, ['PatientVisitNoteValidator']);
        return this.clinicalDLService.PutPatientVisitNote(temp)
            .map(res => res);
    }
    //vitals
    //update vitals
    public PutVitals(currentVitals: Vitals) {
        currentVitals.CreatedOn = moment(currentVitals.CreatedOn).format('YYYY-MM-DD HH:mm');
        //start1<sudarshan:23jan'17>: assigning validator to null to avoid circular-reference error inside JSON.stringify
        var obj = currentVitals;
        var vitalValidator = obj.VitalsValidator;//JUGAAD-cut,stringify & reassign validator : revision needed[see below error]
        obj.VitalsValidator = null;
        //ideally below line '_.omit' should work, but its giving null reference error, 
        //var temp = _.omit(obj, ['VitalsValidator']);
        let data = JSON.stringify(obj);
        obj.VitalsValidator = vitalValidator;
        let reqType = 'vitals';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);

    }
    //allergy
    //updates allergy
    public PutAllergy(currentAllergy: Allergy) {
        currentAllergy.CreatedOn = moment(currentAllergy.CreatedOn).format('YYYY-MM-DD HH:mm');
        var temp = _.omit(currentAllergy, ['AllergyValidator']);
        let data = JSON.stringify(temp);
        let reqType = 'allergy';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }

    //input-output
    //updates IO
    public PutInputOutput(currentInputOutput: InputOutput) {
        currentInputOutput.CreatedOn = moment(currentInputOutput.CreatedOn).format('YYYY-MM-DD HH:mm');
        var temp = _.omit(currentInputOutput, ['InputOutputValidator']);

        let data = JSON.stringify(temp);
        let reqType = 'inputoutput';
        return this.clinicalDLService.PutClinical(data, reqType)
            .map(res => res);
    }
    //notes
    //update notes
    // public PutNotes(currentNotes: NotesModel, addType: string) {
    //     currentNotes.CreatedOn = moment(currentNotes.CreatedOn).format('YYYY-MM-DD HH:mm');
    //     let notes = _.omit(currentNotes, ['PatientVisit']);
    //     let data = JSON.stringify(notes);
    //     let reqType = 'notes';
    //     return this.clinicalDLService.PutClinical(data, reqType)
    //         .map(res => res);

    // }
}