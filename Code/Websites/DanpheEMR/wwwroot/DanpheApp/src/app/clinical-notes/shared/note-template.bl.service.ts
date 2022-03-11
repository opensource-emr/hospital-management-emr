import { Injectable, Directive } from '@angular/core';
import { ClinicalDLService } from '../../clinical/shared/clinical.dl.service';
import { NotesModel } from '../shared/notes.model';
import * as _ from 'lodash';

@Injectable()
export class NoteTemplateBLService {

  public _NotesId: number = 0;
  get NotesId(): number {
    return this._NotesId;
  }
  set NotesId(NotesId: number) {
    this._NotesId = NotesId;
  }

  constructor(public clinicalDLService: ClinicalDLService) {

  }
  ///Post Notes Template
  public PostProcedureNoteTemplate(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'SubjectiveNote', 'ObjectiveNote', 'FreeTextNote', 'ClinicalDiagnosis', 'AllIcdAndOrders', 'EmergencyNote', 'ProgressiveNote']);
    return this.clinicalDLService.PostProcedureNoteTemplate(temp)
      .map(res => res);
  }

  public PostProgressNoteTemplate(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'SubjectiveNote', 'ObjectiveNote', 'FreeTextNote', 'ClinicalDiagnosis', 'AllIcdAndOrders', 'EmergencyNote', 'ProcedureNote']);
    return this.clinicalDLService.PostProgressNoteTemplate(temp)
      .map(res => res);
  }


  public PostFreetextNoteTemplate(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'SubjectiveNote', 'ObjectiveNote', 'ProcedureNote', 'ClinicalDiagnosis', 'AllIcdAndOrders', 'EmergencyNote', 'ProgressiveNote']);
    return this.clinicalDLService.PostFreetextNoteTemplate(temp)
      .map(res => res);
  }


  public PostDischargeSummary(NoteMaster: NotesModel) {
    var tempNotes = _.omit(NoteMaster, ['SubjectiveNote', 'ObjectiveNote', 'FreeTextNote', 'ProcedureNote', 'ClinicalDiagnosis', 'AllIcdAndOrders', 'EmergencyNote', 'ProgressiveNote']);

    var tempDischargeSummary = _.omit(tempNotes.DischargeSummaryNote, ['DischargeSummaryValidator']);
    tempNotes.DischargeSummaryNote = tempDischargeSummary;
    var tempMedicines: any = tempNotes.DischargeSummaryNote.DischargeSummaryMedications.map(itm => {
      return _.omit(itm, ['DischargeSummaryMedicationValidator']);
    });

    tempNotes.DischargeSummaryNote.DischargeSummaryMedications = tempMedicines;
    return this.clinicalDLService.PostDischargeSummary(tempNotes)
      .map(res => res)
  }

  public PostHistoryAndPhysicalNoteTemplate(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'FreeTextNote', 'EmergencyNote', 'ProcedureNote', 'ProgressiveNote', 'ClinicalDiagnosis']);
    var newtemp = _.omit(temp.SubjectiveNote, ['SubjectiveNoteValidator']);
    temp.SubjectiveNote = newtemp;
    return this.clinicalDLService.PostHistoryAndPhysicalNoteTemplate(temp)
      .map(res => res);
  }
  public PostOpdExamination(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'EmergencyNote', 'ProgressiveNote']);
    var newtemp = _.omit(temp.SubjectiveNote, ['SubjectiveNoteValidator']);
    temp.SubjectiveNote = newtemp;
    return this.clinicalDLService.PostOpdExamination(temp)
      .map(res => res);
  }

  public PostEmergencyNoteTemplate(NoteMaster: NotesModel) {
    var temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'FreeTextNote', 'ProcedureNote', 'ProgressiveNote', 'ClinicalDiagnosis']);
    var newtemp = _.omit(temp.SubjectiveNote, ['SubjectiveNoteValidator']);
    temp.SubjectiveNote = newtemp;
    return this.clinicalDLService.PostEmergencyNoteTemplate(temp)
      .map(res => res);
  }

  public PostClinicalPrescriptionNoteTemplate(NoteMaster: NotesModel) {
    let temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'FreeTextNote', 'ObjectiveNote', 'ProcedureNote', 'ProgressNote', 'ClinicalDiagnosis', 'EmergencyNote']);
    let newtemp = _.omit(temp.SubjectiveNote, ['SubjectiveNoteValidator']);
    temp.SubjectiveNote = newtemp;
    return this.clinicalDLService.PostClinicalPrescripitionNote(temp)
      .map(res => res);
  }



  ///Get Notes Template
  public GetNoteTypeList() {
    return this.clinicalDLService.GetNoteTypeList().map(res => res);
  }

  public GetAllTemplateList() {
    return this.clinicalDLService.GetAllTemplateList()
      .map(res => res);
  }

  public GetFreetextNoteTemplateByNotesId(NotesId) {
    return this.clinicalDLService.GetFreetextNoteTemplateByNotesId(NotesId)
      .map(res => res);
  }

  public GetProcedureNoteTemplateByNotesId(NotesId) {
    return this.clinicalDLService.GetProcedureNoteTemplateByNotesId(NotesId)
      .map(res => res);
  }

  public GetProgressNoteTemplateByNotesId(NotesId) {
    return this.clinicalDLService.GetProgressNoteTemplateByNotesId(NotesId)
      .map(res => res);
  }
  public GetTemplateDetailsByNotesId(NotesId) {
    return this.clinicalDLService.GetTemplateDetailsByNotesId(NotesId)
      .map(res => res);
  }
  public GetHistoryAndPhysicalNoteById(NotesId) {
    return this.clinicalDLService.GetHistoryAndPhysicalNoteById(NotesId)
      .map(res => res);
  }
  public GetOpdExaminationdetailsById(patientId,PatientVisitid,notesId) {
    return this.clinicalDLService.GetOpdExaminationdetailsById(patientId,PatientVisitid,notesId)
      .map(res => res);
  }
  public GetEmergencyNoteById(NotesId) {
    return this.clinicalDLService.GetEmergencyNoteById(NotesId)
      .map(res => res);
  }
  public GetClinicalPrescriptionNoteById(NotesId) {
    return this.clinicalDLService.GetClinicalPrescriptionNoteById(NotesId)
      .map(res => res);
  }
  public GetAllOrdersByNoteId(NotesId) {
    return this.clinicalDLService.GetAllOrdersByNoteId(NotesId).map(res => res);
  }

  ///Put Notes Template
  public PutFreetextNoteTemplateByNotesId(data) {
    return this.clinicalDLService.PutFreetextNoteTemplateByNotesId(data)
      .map(res => res);
  }

  public PutProcedureNoteTemplateByNotesId(data) {
    return this.clinicalDLService.PutProcedureNoteTemplateByNotesId(data)
      .map(res => res);
  }

  public PutProgressNoteTemplateByNotesId(data) {
    return this.clinicalDLService.PutProgressNoteTemplateByNotesId(data)
      .map(res => res);
  }

  public PutDischargeNoteTemplateByNotesId(data: NotesModel) {

    var tempNotes = _.omit(data, ['SubjectiveNote', 'ObjectiveNote', 'FreeTextNote', 'ProcedureNote', 'ClinicalDiagnosis', 'AllIcdAndOrders', 'EmergencyNote', 'ProgressNote']);

    var tempDischargeSummary = _.omit(tempNotes.DischargeSummaryNote, ['DischargeSummaryValidator']);
    tempNotes.DischargeSummaryNote = tempDischargeSummary;
    var tempMedicines: any = tempNotes.DischargeSummaryNote.DischargeSummaryMedications.map(itm => {
      return _.omit(itm, ['DischargeSummaryMedicationValidator']);
    });

    tempNotes.DischargeSummaryNote.DischargeSummaryMedications = tempMedicines;

    return this.clinicalDLService.PutDischargeNoteTemplateByNotesId(tempNotes)
      .map(res => res);
  }

  public PutEmergencyNoteTemplate(data) {
    return this.clinicalDLService.PutEmergencyNoteTemplate(data)
      .map(res => res);
  }

  public PutHistoryAndPhysicalNote(data) {
    return this.clinicalDLService.PutEmergencyNoteTemplate(data)
      .map(res => res);
  }

  public PutPrescriptionNote(NoteMaster: NotesModel) {
    let temp = _.omit(NoteMaster, ['DischargeSummaryNote', 'FreeTextNote', 'ObjectiveNote', 'ProcedureNote', 'ProgressNote', 'ClinicalDiagnosis', 'EmergencyNote']);
    let newtemp = _.omit(temp.SubjectiveNote, ['SubjectiveNoteValidator']);
    temp.SubjectiveNote = newtemp;
    return this.clinicalDLService.PutClinicalPrescripitionNote(temp)
      .map(res => res);
  }

}
