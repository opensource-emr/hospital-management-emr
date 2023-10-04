import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PatientImagesModel {

    public PatImageId: number = 0;
    public PatientId: number = 0;
    public PatientVisitId: number = 0;
    public DepartmentId: number = 0;
    /// public ROWGUID: any = null;
    public FileType: string = "";
    public Title: string = "";
    public UploadedOn: string = "";
    public UploadedBy: number = 0;
    public Comment: string = null;
    public FileBinaryData: string = "";
    public FileName: string = "";
    public FileExtention: string = "";
    public PatientImageValidator: FormGroup = null;
    public IsActive: boolean = true;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.PatientImageValidator = _formBuilder.group({
            'FileType': ['', Validators.required,],
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.PatientImageValidator.dirty;
        }
        else {
            return this.PatientImageValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.PatientImageValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        //if nothing's has changed in insurance then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.PatientImageValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.PatientImageValidator.valid;
        }
        else {

            return !(this.PatientImageValidator.hasError(validator, fieldname));
        }
    }
}
