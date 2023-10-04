import { Visit } from "../../appointments/shared/visit.model";
import { FinalDiagnosisModel } from "../../medical-records/outpatient-list/final-diagnosis/final-diagnosis.model";
import { ComplaintsModel } from "../opd-triage/opd-triage.component";

export interface PatientData {
    selectedDiagnosis: Array<FinalDiagnosisModel>;
    chiefComplaints: Array<ComplaintsModel>;
    selectedPatient: Visit;
}