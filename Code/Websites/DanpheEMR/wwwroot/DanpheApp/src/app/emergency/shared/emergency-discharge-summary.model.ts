import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';

export class EmergencyDischargeSummary {
    public ERDischargeSummaryId: number = 0;
    public PatientId: number = null;
    public PatientVisitId: number = null;
    public DischargeType: string = null;
    public ChiefComplaints: string = null;
    public TreatmentInER: string = null;
    public Investigations: string = null;
    public AdviceOnDischarge: string = null;
    public OnExamination: string = null;
    public ProvisionalDiagnosis: string = null;
    public DoctorName: string = null;
    public MedicalOfficer: string = null;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;

    public DoctorSelected: any = null;
    public MedicalOfficerSelected: any = null;
}

