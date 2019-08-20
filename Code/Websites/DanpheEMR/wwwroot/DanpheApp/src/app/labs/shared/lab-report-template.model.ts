import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms';
import * as moment from 'moment/moment';

export class LabReportTemplateModel {
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

    public HeaderText: string = null;//sud: 22Jun'18
    public ColSettingsJSON: string = null;//sud: 22Jun'18

    //Added By Anish 30 Aug 2018
    public TemplateType: string = null;
    public TemplateHTML: string = null;
    public FooterText: string = null;
    public Description: string = null;
    public DisplaySequence: number = 100;

    


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

//Added By Anish for ColSettingsJSON
export class LabReportColumnsModel {
  public Name: boolean = true;
  public Result: boolean = true;
  public Range: boolean = true;
  public Method: boolean = true;
  public Unit: boolean = true;
  public Remarks: boolean = true;

  public SelectAll: boolean = true;

  public constructor(name: boolean, result: boolean, range: boolean, method: boolean, unit: boolean, remarks: boolean, selectall: boolean) {
    this.Name = name;
    this.Remarks = remarks;
    this.Range = range;
    this.Result = result;
    this.Method = method;
    this.Unit = unit;
    this.SelectAll = selectall;
  }
    

}
