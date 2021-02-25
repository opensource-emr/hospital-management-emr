import { PatientOrderListModel } from "../../clinical/shared/order-list.model";
import { ICD10 } from "../../clinical/shared/icd10.model";

export class AssessmentAndPlanModel {    
    public NotesId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public DiagnosisOrdersList: Array<DiagnosisOrderVM> = [];    
    public RemovedDiagnosisOrdersList: Array<DiagnosisOrderVM> = [];    
}

export class DiagnosisOrderVM {
    public DiagnosisId: number = 0;
    public IsEditable: boolean = true;
    public ICD: ICD10 = null;
    public OrdersList: Array<PatientOrderListModel> = [];

    // bikash: 11-may-2020 - to distinguished removed one.
    public IsActive: boolean = true; 
    public RemovedOrdersList: Array<PatientOrderListModel> = [];
}
