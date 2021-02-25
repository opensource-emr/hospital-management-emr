import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

export class SubjectiveNotesModel {
    public SubjectiveNoteId: number = 0;
    public NotesId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public ChiefComplaint: string = null;
    public HistoryOfPresentingIllness: string = null;
    public ReviewOfSystems: string = null;
    public CreatedBy: number = null;
    public CreatedOn: string = null;
    public ModifiedBy: number = null;
    public ModifiedOn: string = null;
    public IsActive: boolean = true;
    public SubjectiveNoteValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.SubjectiveNoteValidator = _formBuilder.group({
            //'ChiefComplaint': ['', Validators.compose([Validators.maxLength(2000)])],
            //'HistoryOfPresentingIllness': ['', Validators.compose([Validators.maxLength(2000)])],
            //'ReviewOfSystems': ['', Validators.compose([Validators.maxLength(2000)])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SubjectiveNoteValidator.dirty;
        else
            return this.SubjectiveNoteValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean { if (this.SubjectiveNoteValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.SubjectiveNoteValidator.valid;
        else
            return !(this.SubjectiveNoteValidator.hasError(validator, fieldName));
    }
}
    export class ClinicalSubjectivePrescriptionNotes {
    public PatientCode: string = null;
    public PatientName: string = null;
    public AgeGender: string = null;
    public Specialization: string = null;
        public DoctorName: string = null;
        public NMCNo: string = null;
        public RegistrationDate: string = null;
        public VisitTime: string = null;
        public RegistrationNo: string = null;
        public PatientType: string = null;
        public ChiefComplaint: string = null;
        public HistoryIllness: string = null;
        public Height: number = null;
        public Weight: number = null;
        public BMI: number = null;
        public Temp: number = null;
        public Pulse: number = null;
        public Respiration: string = null;
        public BPSystolic: number = null;
        public BPDiastolic: number = null;
        public SpO2: number = null;
        public PainScale: number = null;
        public Advice: string = null;
        public FreeNotes: string = null;
        public DiagnosisType: string = null;
        public Diagnosis: string = null;
        public PatientVisitId: number = null;
}
