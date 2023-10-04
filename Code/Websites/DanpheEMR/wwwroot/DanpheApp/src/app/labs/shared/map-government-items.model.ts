import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";

export class MappedGovernmentItems {
  public ReportMapId: number = 0;
  public ReportItemId: number = 0;
  public LabItemId: number = 0;
  public IsActive: boolean = true;
  public ComponentName: string = null;
  public IsResultCount: boolean = false;
  public IsComponentBased: boolean = false;
  public PositiveIndicator: string = null;
  public ComponentId:number = 0;

  public GovItemValidator: FormGroup = null;

  constructor() {
    var _formBuilder = new FormBuilder();
    this.GovItemValidator = _formBuilder.group({
      ReportItemId: [
        "",
        Validators.compose([Validators.required, this.positiveNumberValdiator]),
      ],
      LabItemId: [
        "",
        Validators.compose([Validators.required, this.positiveNumberValdiator]),
      ],
      ComponentId: ["", Validators.compose([Validators.required,this.positiveNumberValdiator])]
    });
  }

  public IsDirty(fieldName): boolean {
    if (fieldName == undefined) return this.GovItemValidator.dirty;
    else return this.GovItemValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean {
    if (this.GovItemValidator.valid) {
      return true;
    } else {
      return false;
    }
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined) {
      return this.GovItemValidator.valid;
    } else {
      return !this.GovItemValidator.hasError(validator, fieldName);
    }
  }

  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0) return { invalidNumber: true };
    }
  }
}