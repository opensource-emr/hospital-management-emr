import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class Template {
    public TemplateId: number;
    public TemplateTypeId: number;
    public TemplateCode: string = "";
    public TemplateName: string = "";
    public Description: string = "";
    public PrintContentHTML: string = "";
    public IsDefaultForThisType: boolean;
    public CreatedBy: number;
    public CreatedOn: string;
    public ModifiedBy: number;
    public ModifiedOn: string = "";
    public IsActive: boolean;
    public DynamicTemplateValidator: FormGroup = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.DynamicTemplateValidator = _formBuilder.group({
            'TemplateTypeId': ['', Validators.compose([Validators.required])],
            'TemplateCode': ['', Validators.compose([Validators.required])],
            'TemplateName': ['', Validators.compose([Validators.required])],
        });
    }
    public IsDirty(fieldName): boolean {
        if (fieldName == undefined)
            return this.DynamicTemplateValidator.dirty;
        else
            return this.DynamicTemplateValidator.controls[fieldName].dirty;
    }

    public IsValid(): boolean {
        if (this.DynamicTemplateValidator.valid) {
            return true;
        }
        else {
            return false;
        }
    }
    public IsValidCheck(fieldName, validator): boolean {
        if (fieldName == undefined)
            return this.DynamicTemplateValidator.valid;
        else
            return !(this.DynamicTemplateValidator.hasError(validator, fieldName));
    }
}
