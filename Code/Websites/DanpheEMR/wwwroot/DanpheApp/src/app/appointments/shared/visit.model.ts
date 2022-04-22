import { Patient } from '../../patients/shared/patient.model';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms'
import * as moment from "moment/moment"


export class Visit {
  public PatientId: number = 0;
  public PatientVisitId: number = 0;
  public VisitCode: string = ""; //H follwed by 6 digit for in patient and V by outpatient
  public VisitDate: string = moment().format("YYYY-MM-DD");
  public DepartmentId: number = null;
  public DepartmentName: string = null;//sud:26June'19--Only to be used in Client Side.

  public Diagnosis :string = ""; // added for diagnosis check
  public ProviderId: number = 0;
  public ProviderName: string = null;
  public Comments: string = null;
  public ReferredByProvider: string = null;
  public VisitType: string = null;
  public VisitStatus: string = null;
  public VisitTime: string = moment().add(5, 'minutes').format('HH:mm');
  public VisitDuration: number = 0;
  public Patient: Patient = null;
  public AppointmentId: number = null;
  public BillingStatus: string = null;
  public ReferredByProviderId: number = null;
  public AppointmentType: string = null;
  public ParentVisitId: number = null;
  public IsVisitContinued: boolean = false;

  public CreatedOn: string = null;
  public CreatedBy: number = null;
  public IsActive: boolean = true;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public Remarks: string = null;
  public QueueNo: number = 0;

  public VisitValidator: FormGroup = null;
  //used only in client side
  public IsValidSelProvider: boolean = true;
  public IsValidSelDepartment: boolean = true;
  public IsSignedVisitSummary: boolean = false;
  public TransferredProviderId: number = null;
  public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places
  //used to create billingTransaction during transfer/refer
  public CurrentCounterId: number = null;
  //used for conclude visit
  public ConcludeDate: string = null;
  public ERTabName: string = null;

  public DeptRoomNumber: string = null;
  public Ins_HasInsurance: boolean = null;
  public IsLastClaimCodeUsed: boolean = false;//sud:1-Oct'21-- Needed to 
  public ShortName:string = null;
  public PatientCode:string = null;
  public CountryId: number = 0;
  public CountrySubDivisionId: number = 0;
  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.VisitValidator.dirty;
    }
    else {
      return this.VisitValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(): boolean { if (this.VisitValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldname, validator): boolean {
    //if nothing's has changed in Gurantor then return true..
    //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
    if (!this.VisitValidator.dirty) {
      return true;
    }

    if (fieldname == undefined) {
      return this.VisitValidator.valid;
    }
    else {

      return !(this.VisitValidator.hasError(validator, fieldname));

    }

  }
  constructor() {
    var _formBuilder = new FormBuilder();
    this.VisitValidator = _formBuilder.group({
      //'ProviderName': ['', Validators.compose([ Validators.required]),],            
      'VisitDate': ['', Validators.compose([Validators.required, this.DateValidator])],
      'VisitTime': ['', Validators.compose([Validators.required])],
      'Doctor': ['', Validators.compose([Validators.required])],
      'Department': ['', Validators.compose([Validators.required])],
      'ClaimCode': ['', Validators.compose([Validators.required])],
    },
      { validator: this.DateTimeValueValidator('VisitDate', 'VisitTime') } //Hom 19 April 2019
    );
    //to increment the time as the system time passes
    // setInterval(() => {
    //   if (!this.IsDirty("VisitTime"))
    //   this.VisitTime = moment().add(5, 'minutes').format('HH:mm');
    // },1000)
  }
  public DateValidator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      let _date = control.value;
      var _currDate = moment().format('YYYY-MM-DD');
      //if positive then selected time is of future else it of the past
      if (moment(_date).diff(_currDate) < 0)
        return { 'invalidDate': true };
    }

  }
  //Hom: April 19 2019
  public IsValidDateTime(validator): boolean {
    if (!this.VisitValidator.dirty) {
      return true;
    }
    else {

      return !(this.VisitValidator.hasError(validator));

    }
  }
  public UpdateValidator(onOff: string, formControlName: string, validatorType: string) {
    let validator = null;
    if (validatorType == 'required' && onOff == "on") {
      validator = Validators.compose([Validators.required]);
    }
    else {
      validator = Validators.compose([]);
    }
    //if (formControlName == "ProviderId")
    //    this.BillingTransactionItemValidator.controls['ProviderId'].validator = validator;

    //this.BillingTransactionItemValidator.controls['ProviderId'].updateValueAndValidity();

    this.VisitValidator.controls[formControlName].validator = validator;
    this.VisitValidator.controls[formControlName].updateValueAndValidity();

  }
  //Hom: April 19 2019
  public DateTimeValueValidator(targetKey: string, toMatchKey: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } => {
      const target = group.controls[targetKey];
      const toMatch = group.controls[toMatchKey];
      let _date = target.value;
      let _time = toMatch.value;
      let _dateTime = moment(_date + " " + _time);
      var _currDate = moment().format('YYYY-MM-DD HH:mm');
      if (moment(_dateTime).diff(_currDate) < 0)
        return { 'invalidDateTime': true };


    };
  }
  ngOnDestroy() {
    clearInterval();
  }
  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.VisitValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }
}






