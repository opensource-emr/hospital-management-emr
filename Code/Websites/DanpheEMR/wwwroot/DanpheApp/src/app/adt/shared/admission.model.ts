import { PatientBedInfo } from './patient-bed-info.model';
import { BillingDeposit } from '../../billing/shared/billing-deposit.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import * as moment from 'moment/moment';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,

  ValidatorFn
} from '@angular/forms'
import { CommonFunctions } from '../../shared/common.functions';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';

export class Admission {
  public PatientVisitId: number = 0;
  public PatientAdmissionId: number = 0;
  public PatientId: number = 0;
  public AdmittingDoctorId: number = null;
  public CreatedBy: number = null;
  public CreatedOn: string = null;
  public TransferDate: string = null;
  public AdmissionDate: string = null;
  public DischargeDate: string = null;
  public AdmissionNotes: string = null;
  public AdmissionOrders: string = null;
  public AdmissionStatus: string = null;
  public DischargedBy: number = null;
  public BillStatusOnDischarge: string = null;
  public DischargeRemarks: string = null;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  public PatientBedInfos: Array<PatientBedInfo> = new Array<PatientBedInfo>();
  public AdmissionValidator: FormGroup = null;

  public CareOfPersonName: string = null;
  public CareOfPersonPhoneNo: string = null;
  public CareOfPersonRelation: string = null;

  public BilDeposit: BillingDeposit = new BillingDeposit();
  //public BilTxnItems: BillingTransactionItem = new BillingTransactionItem();
  public RequestingDeptId: number = null;     //sud:19Jun'18  //uncommented ram:1oct'18

  //Added by Yubraj --19th November 2018
  public CancelledOn: string = null;
  public CancelledBy: string = null;
  public CancelledRemark: string = null;

  public ProcedureType: string = null;
  public IsPoliceCase: boolean = false;
  public Ins_HasInsurance: boolean = false;
  public ClaimCode: number = null;//sud:1-oct'21: Changed datatype from String to Number in all places
  public AdmissionCase: string = null;//pratik:22April'2021 for LPH
  public Ins_NshiNumber: string = null;
  public IsInsurancePatient: boolean = false;
  public Ins_InsuranceBalance: number = 0;
  public BillingTransaction: BillingTransaction = new BillingTransaction();

  //for membership selection in adt
  public DiscountSchemeId: number = null;
  public MembershipTypeName: string = null;
  public MembershipDiscountPercent: number = 0;
  public IsValidMembershipTypeName: boolean = true;
  public IsBillingEnabled: boolean;
  public IsLastClaimCodeUsed: boolean = false;
  public ProvisionalDiscPercent: number = null;
  public IsItemDiscountEnabled: boolean = false;

  constructor() {

    var _formBuilder = new FormBuilder();
    this.AdmissionValidator = _formBuilder.group({
      'AdmittingDoctorId': ['', Validators.compose([Validators.required])],
      'AdmissionDate': ['', Validators.compose([Validators.required, this.dateValidator])],
      'AdmissionNotes': ['', Validators.compose([Validators.maxLength(1000)])],
      'AdmissionOrders': ['', Validators.compose([Validators.maxLength(200)])],
      //'DischargeDate': ['', Validators.compose([]),],
      'DischargeRemarks': ['', Validators.compose([]),],
      'CareOfPersonPhoneNo': ['', Validators.compose([Validators.pattern('^[0-9]{0,10}$'), Validators.required])],
      'CareOfPersonName': ['', Validators.compose([Validators.maxLength(100)])],
      //'RequestingDeptId': ['', Validators.compose([Validators.required])]         //ramavtar:2oct'18 added as doctor is require so is this (it gets filled while filling doctor)
      'CareOfPersonRelation': ['', Validators.compose([Validators.maxLength(100)])],
      'ClaimCode': ['', Validators.compose([Validators.required])],
      'AdmissionCase': ['', Validators.compose([Validators.required])],
    });
  }
  //Modified: Ashim 14thSep : 
  //Validation: Can select admission date of upto 1 year before or after from today's date.
  dateValidator(control: FormControl): { [key: string]: boolean } {

    //dateTime limit is 1 day
    //Ex:it's 16Aug 7:30 PM now
    //user can add admission entry  upto 15Aug 12:00AM 
    var limitDate = moment({ hour: 0, minute: 0, second: 0, millisecond: 0 }).subtract(1, 'year').format('YYYY-MM-DD HH:mm');
    //if positive then selected date is of future else it of the past || selected year can't be of future
    if (control.value) {
      if ((moment(control.value).diff(limitDate) < 0)
        || (moment(control.value).diff(moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm')) > 0))
        //||(moment(control.value).diff(limitDate, 'years') > 1)) //can admit patient upto 1 year from today.
        return { 'wrongDate': true };
    }
    else
      return { 'wrongDate': true };
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.AdmissionValidator.dirty;
    else
      return this.AdmissionValidator.controls[fieldName].dirty;
  }

  public IsValid(): boolean { if (this.AdmissionValidator.valid) { return true; } else { return false; } } public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.AdmissionValidator.valid;
    else
      return !(this.AdmissionValidator.hasError(validator, fieldName));
  }
  public EnableControl(formControlName: string, enabled: boolean) {
    let currCtrol = this.AdmissionValidator.controls[formControlName];
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
