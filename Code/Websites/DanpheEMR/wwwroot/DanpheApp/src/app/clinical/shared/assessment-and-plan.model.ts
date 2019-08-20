import { PatientOrderListModel } from "./order-list.model";
import { ICD10 } from "./icd10.model";

export class AssessmentAndPlanModel {    
    public NotesId: number = 0;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public DiagnosisOrdersList: Array<DiagnosisOrderVM> = [];    
}

export class DiagnosisOrderVM {
    public DiagnosisId: number = 0;
    public IsEditable: boolean = true;
    public ICD: ICD10 = null;
    public OrdersList: Array<PatientOrderListModel> = [];
}