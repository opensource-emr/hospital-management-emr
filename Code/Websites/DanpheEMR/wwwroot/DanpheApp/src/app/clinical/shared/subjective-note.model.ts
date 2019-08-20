import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';

export class SubjectiveNote {
    public SubjectiveNoteId: number = 0;
    public NotesId: number = 0;
    public PatientId: number = null;
    public PatientVisitId: number = null;
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
            'ChiefComplaint': ['', Validators.compose([Validators.maxLength(2000)])],
            'HistoryOfPresentingIllness': ['', Validators.compose([Validators.maxLength(2000)])],
            'ReviewOfSystems': ['', Validators.compose([Validators.maxLength(2000)])]
        });
    }

    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.SubjectiveNoteValidator.dirty;
        else
            return this.SubjectiveNoteValidator.controls[fieldName].dirty;
    }

    public IsValid():boolean{if(this.SubjectiveNoteValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.SubjectiveNoteValidator.valid;
        else
            return !(this.SubjectiveNoteValidator.hasError(validator, fieldName));
    }
}
   