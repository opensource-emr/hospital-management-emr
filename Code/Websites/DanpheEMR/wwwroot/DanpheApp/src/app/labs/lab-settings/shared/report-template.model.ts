import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';

export class ReportTemplateModel_DeleteIt{
    public ReportTemplateID: number = 0;
    public ReportTemplateShortName: string = null;
    public ReportTemplateName: string = null;
    public TemplateFileName: string = null;
    public NegativeTemplateFileName: string = null;
    public IsDefault: boolean = false;
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;

    public ReportTemplateValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.ReportTemplateValidator = _formBuilder.group({
            'ReportTemplateShortName': ['', Validators.compose([Validators.required])],
            'ReportTemplateName': ['', Validators.compose([Validators.required])]
        });
    }

    public IsDirty(fieldname): boolean {
        if (fieldname == undefined) {
            return this.ReportTemplateValidator.dirty;
        }
        else {
            return this.ReportTemplateValidator.controls[fieldname].dirty;
        }

    }

    public IsValid():boolean{if(this.ReportTemplateValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldname, validator): boolean {        

        if (fieldname == undefined) {
            return this.ReportTemplateValidator.valid;
        }
        else {
            return !(this.ReportTemplateValidator.hasError(validator, fieldname));
        }
    }



}

