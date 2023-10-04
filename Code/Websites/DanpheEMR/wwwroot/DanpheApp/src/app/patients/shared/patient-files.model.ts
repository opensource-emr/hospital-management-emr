import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'
import * as moment from 'moment/moment';

export class PatientFilesModel {

    public PatientFileId: number = 0;
    public PatientId: number = 0;
    /// public ROWGUID: any = null;
    public FileType: string = "";
    public Title: string = "";
    public UploadedOn: string = "";
    public UploadedBy: number = 0;
    public Description: string = null;
    public FileBinaryData: string = "";
    public FileName: string = "";
    public FileExtention: string = "";
    public PatientFilesValidator: FormGroup = null;
    public IsActive: boolean = true;
    public FileBase64String: string = null;

    constructor() {
        var _formBuilder = new FormBuilder();

        this.PatientFilesValidator = _formBuilder.group({
            'FileType': ['', Validators.required,],
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.PatientFilesValidator.dirty;
        }
        else {
            return this.PatientFilesValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.PatientFilesValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {
        //if nothing's has changed in insurance then return true..
        //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
        if (!this.PatientFilesValidator.dirty) {
            return true;
        }

        if (fieldname == undefined) {
            return this.PatientFilesValidator.valid;
        }
        else {

            return !(this.PatientFilesValidator.hasError(validator, fieldname));
        }
    }
}