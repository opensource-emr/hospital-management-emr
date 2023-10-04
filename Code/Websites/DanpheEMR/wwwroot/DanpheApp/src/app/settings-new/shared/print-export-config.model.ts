import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class PrintExportConfigurationModel {

  public PrintExportSettingsId: number = 0;
  public SettingName: string = null;
  public PageHeaderText: string = null;
  public ReportDescription: string = null;
  public ModuleName : string = null;
  public ShowHeader:boolean = true;
  public ShowFooter : boolean = true;
  public ShowUserName : boolean = true;
  public ShowPrintExportDateTime :boolean = true;
  public ShowNpDate : boolean = true;
  public ShowEnDate : boolean = true;
  public ShowFilterDateRange : boolean = true;
  public ShowOtherFilterVariables :boolean = true;
  public IsActive: boolean = true;
  public CreatedBy: number = null;
  public ModifiedBy: number = null;
  public CreatedOn: string = null;
  public ModifiedOn: string = null;
  public ConfigurationValidator: FormGroup = null;


  constructor() {
    var _formBuilder = new FormBuilder();
    this.ConfigurationValidator = _formBuilder.group({
       'SettingName': ['', Validators.compose([Validators.required])],
       'PageHeaderText': ['', Validators.compose([Validators.required])],
       'ModuleName': ['', Validators.compose([Validators.required])],
      //  'ReportDescription': ['', Validators.compose([Validators.required])],
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) {
      return this.ConfigurationValidator.dirty;
    }    
    else
      return this.ConfigurationValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.ConfigurationValidator.valid) {
      return true;
    }
    else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.ConfigurationValidator.valid;
    }
    else {
      return !(this.ConfigurationValidator.hasError(validator, fieldName));
    }  
  }
}
