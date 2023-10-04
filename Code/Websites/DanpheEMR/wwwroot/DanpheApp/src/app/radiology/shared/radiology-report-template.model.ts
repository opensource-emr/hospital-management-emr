import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    ReactiveFormsModule
} from '@angular/forms';


export class RadiologyReportTemplate {	
    public TemplateId: number = 0;
    public ModuleName: string = "Radiology";
    public TemplateCode: string= null; 	
    public TemplateName: string= null;	
    public TemplateHTML: string = null;
    public FooterNote: string = null;
    public CreatedBy: number = null;
    public ModifiedBy: number = null;
    public IsActive: boolean = true;
    public CreatedOn: string = null;
    public ModifiedOn: string = null;

    public RadiologyReportTemplateValidator: FormGroup = null;

     constructor() {
         var _formBuilder = new FormBuilder();
         this.RadiologyReportTemplateValidator = _formBuilder.group({
             'ModuleName': ['', Validators.compose([Validators.required])],
             'TemplateCode': ['', Validators.compose([Validators.required])],
             'TemplateName': ['', Validators.compose([Validators.required])]
         });
     }

     public IsDirty(fieldName): boolean {
         if (fieldName == undefined)
             return this.RadiologyReportTemplateValidator.dirty;
         else
             return this.RadiologyReportTemplateValidator.controls[fieldName].dirty;
     }

     public IsValid():boolean{if(this.RadiologyReportTemplateValidator.valid){return true;}else{return false;}} public IsValidCheck(fieldName, validator): boolean {
         if (fieldName == undefined)
             return this.RadiologyReportTemplateValidator.valid;
         else
             return !(this.RadiologyReportTemplateValidator.hasError(validator, fieldName));
     }

}                  