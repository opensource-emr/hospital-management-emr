import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
export class LabTestComponent {
  public TestComponentResultId: number = 0;
  public RequisitionId: number = 0;
  public LabTestId: number = 0;
  public Value: string = null;
  public Unit: string = null;
  public Range: string = null;
  public Method: string = null;
  public ComponentName: string = null;
  public ComponentId: number = 0;
  public Remarks: string = null;
  public IsSelected: boolean = true;
  //public IsPrint: boolean = null;
  //public PrintId: number = null;
  //public PatientName: string = null;
  //public TemplateName: string = null;
  public TemplateId: number = null;
  public CreatedOn: string = null;
  public CreatedBy: number = null;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  //public PatientId: number = null;
  public ValueType: string = null;
  public ControlType: string = null;
  public ValueLookup: string = null;
  public ValueSourceName: string = null;
  public ValueDataSource = [];
  public IsDynamic: boolean = false;
  public RangeDescription: string = null;
  public LabReportId: number = null;
  //validation properties.
  public IsValueValid: boolean = true; //is value valid or not: checks both datatype and required etc.
  public IsGroupValid: boolean = true; //whether or not the value matches with group validation
  public IsAbnormal: boolean = false; //if value is out of range or something.

  public ErrorMessage: string = null;
  public GroupName: string = null;
  public IsNegativeResult: boolean = false;
  public NegativeResultText: string = null;

  public CultureAddedGroup: Array<any> = new Array<any>();

  public ComponentValidator: FormGroup = null;

  //For CLientSide Only
  public ValueHtml: any;
  public DisplaySequence: number;
  public IndentationCount: number = 0;
  public IsActive: boolean = true; //sud:19Sept'18

  public MaleRange: string = null;
  public FemaleRange: string = null;
  public ChildRange: string = null;

  public AbnormalType: string = null;

  public ResultGroup: number = 1;

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.ComponentValidator.dirty;
    } else {
      return this.ComponentValidator.controls[fieldname].dirty;
    }
  }

  //public IfCheck(IsSelected): boolean {
  //    if (IsSelected == true) {
  //        return this.ComponentValidator.value;
  //    }
  //    else {
  //        return this.ComponentValidator.value;
  //    }
  //}

  public IsValid(): boolean {
    if (this.ComponentValidator.valid) {
      return true;
    } else {
      return false;
    }
  }
  public IsValidCheck(fieldname, validator): boolean {
    //if nothing's has changed in Addess then return true..
    //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
    //if (!this.ComponentValidator.dirty) {
    //    return true;
    //}

    if (fieldname == undefined) {
      return this.ComponentValidator.valid;
    } else {
      return !this.ComponentValidator.hasError(validator, fieldname);
    }
  }
  constructor() {
    var _formBuilder = new FormBuilder();
    this.ComponentValidator = _formBuilder.group({
      ComponentName: ["", Validators.required],
      Value: ["", Validators.compose([])],
      Unit: ["", Validators.compose([])],
      RangeDescription: ["", Validators.compose([])],
    });
  }
}
