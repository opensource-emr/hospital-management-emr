/// <reference path="../../patients/shared/patient.model.ts" />

import { BillingItem } from './billing-item.model';
import { Patient } from '../../patients/shared/patient.model';
import {
  NgForm,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms'

export class BillingTransactionItem {

  public BillingTransactionItemId: number = 0;
  public BillingTransactionId: number = null;
  public PatientId: number = 0;
  //Ashim: 4Jan2018
  //ProviderId is AssignedToDr. It is used only in BillingTransaction.
  //In LabItemRequisition. ProviderId is RequestedBy Dr. from billing/ doctor who gives lab order in Doctors
  public ProviderId: number = null;
  public ProviderName: string = null;
  public ServiceDepartmentId: number = 0;
  public ServiceDepartmentName: string = null;
  public ProcedureCode: string = null;
  public ItemId: number = 0;
  public ItemName: string = null;
  public Price: number = 0;
  public SAARCCitizenPrice: number = 0; //Yubraj: 16th May '19
  public ForeignerPrice: number = 0; //Yubraj: 16th May '19
  public Quantity: number = null;
  public SubTotal: number = null;
  public DiscountPercent: number = 0;
  public DiscountPercentAgg: number = 0;
  public DiscountAmount: number = 0;
  public Tax: number = 0;
  public TotalAmount: number = 0;
  public BillStatus: string = null;
  public RequisitionId: number = null;
  public RequisitionDate: string = null;
  public PaidDate: string = null;
  public Remarks: string = null;
  public ReturnStatus: boolean = null;
  public ReturnQuantity: number = null;
  public CounterId: number = 0;
  public CounterDay: string = null;
  public CreatedBy: number = 0;
  public CreatedOn: string = null;
  public CancelRemarks: string = null;
  public ItemList: Array<BillingItem> = new Array<BillingItem>();  // array to map the items from different department
  public TaxPercent: number = 0;
  public CancelledBy: number = null;//add cancelled-on also if needed. which is now done from server side.
  public BillingPackageId: number = null;

  public IsPaid: boolean = true;
  //Below variable only for check duplicate item or not
  public IsDuplicateItem: boolean = false;


  public Patient: Patient = new Patient();
  public ServiceDepartment = null;///service deparatment comes as a part of .Include() in billing controller.

  public BillingTransactionItemValidator: FormGroup = null;
  public RequestedBy: number = null;
  public RequestedByName: string = "";
  public PatientVisitId: number = null;
  //only used to update BillStatus in BIL_BillItemRequisition table during PendingBills.
  public BillItemRequisitionId: number = null;
  //only used in client side.
  public IsTaxApplicable: boolean = true;
  public TaxableAmount: number = 0;
  public PatientName: string = null;//mahesh:10Mar'19-needed for fraction.

  public NonTaxableAmount: number = 0;//added: sud: 29May'18
  public PaymentReceivedBy: number = null;//added: sud: 29May'18
  public PaidCounterId: number = null;//added: sud: 29May'18

  public BillingType: string = null;//sud: 19Jun'18--eg: IP, OP.
  public RequestingDeptId: number = null;//used mostly for Inpatient segregation.

  public IsSelected: boolean = false;//sud:12May
  public IsValidSelDepartment: boolean = true;
  public IsValidSelItemName: boolean = true;
  public IsValidSelAssignedToDr: boolean = true;
  public IsValidSelRequestedByDr: boolean = true;

  public BillItemPriceId: number = 0;//mahesh:10Mar'19-needed for fraction.

  public RequestingUserNameNDept: string = null;//sud:24Sept'18 -- needed for IP-Lab Request

  public VisitType: string = null;//sud: 27Sept'18 -- needed for Labs.

  //not mapped field - required while updating adt item quantity
  public ItemIntegrationName: string = null;
  //not mapped field - required while updating adt item quantity
  public SrvDeptIntegrationName: string = null;

  public IsDoctorMandatory: boolean = false;//sud:6Feb'18--for ward billing, used only in client side.

  //Price Category includes: Normal, Foreigner, EHS, SAARCCitizen, GovtInsurance, etc.. 
  public PriceCategory: string = "Normal";//sud: 25Feb'19-- default value is Normal

  //checked only if we need to do a post to INS_TXN_PatientInsurancePackages table
  public IsInsurancePackage: boolean = false;
  public PatientInsurancePackageId: number = null;
  public FullName: string = "";           //ag7_mig_fix: used in calculate-details.component.html page.
  public StartDate: string = null;
  public EndDate: string = null;
  public IsExistBedFeatureId: boolean = false;
  public ModifiedBy: number = null;
  public ModifiedOn: string = null;
  public IsLastBed: boolean = false;
  public ProvisionalReceiptNo: number = null; //Yubraj 31st May '19
  public ProvisionalFiscalYearId: number = null; //Yubraj 31st May '19
  public ProvisionalFiscalYear: number = null; //Yubraj 31st May '19
  public IsInsurance: boolean = false;//Yubraj 3rd July '19
  public DiscountSchemeId: number = null; //Yubraj 30th July '19

  constructor() {
    var _formBuilder = new FormBuilder();
    this.BillingTransactionItemValidator = _formBuilder.group({
      'ItemName': ['', Validators.compose([Validators.required])],
      'ServiceDepartmentId': ['', Validators.compose([Validators.required])],
      'RequestedBy': ['', Validators.compose([Validators.required])],
      //'RequestedBy': ['', Validators.compose([])],  //for biling order.
      'ProviderId': ['', Validators.compose([])],//there will be no validation for providerid at the begining. it is conditional validation.
      'Price': ['', Validators.compose([this.positiveNumberValdiator])],
      'Quantity': ['', Validators.compose([this.positiveNumberValdiator])],
      'DiscountPercent': ['', Validators.compose([this.discountPercentValidator])],
    });
  }
  public IsDirty(fieldName): boolean {
    if (fieldName == undefined)
      return this.BillingTransactionItemValidator.dirty;
    else
      return this.BillingTransactionItemValidator.controls[fieldName].dirty;
  }

  //public IsValid(): boolean {
  //  if (this.BillingTransactionItemValidator.valid) {
  //    return true;
  //  }
  //  else {
  //    return false;
  //  }
  //}

  public IsValid(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.BillingTransactionItemValidator.valid;
    else
      return !(this.BillingTransactionItemValidator.hasError(validator, fieldName));
  }

  public IsValidCheck(fieldName, validator): boolean {
    if (fieldName == undefined)
      return this.BillingTransactionItemValidator.valid;
    else
      return !(this.BillingTransactionItemValidator.hasError(validator, fieldName));
  }

  //dynamically sets ON and OFF the validation on ProviderId controlname.
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

    this.BillingTransactionItemValidator.controls[formControlName].validator = validator;
    this.BillingTransactionItemValidator.controls[formControlName].updateValueAndValidity();

  }

  ///2017-07-19--For Quick Bug fix... Make proper implementation of it later..
  public static GetClone(ipBilTxnItm: BillingTransactionItem): BillingTransactionItem {


    //let srvDptId = ipBilTxnItm ? ipBilTxnItm.ServiceDepartment ? ipBilTxnItm.ServiceDepartment


    let retObject = Object.assign({}, ipBilTxnItm);
    //set not-required fields to null.--needs revision on which all fields to remove.
    retObject.Patient = null;
    retObject.ServiceDepartment = null;
    return retObject;
  }
  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }

  }
  discountPercentValidator(control: FormControl): { [key: string]: boolean } {
    if (control.value) {
      if (control.value < 0 || control.value > 100)
        return { 'invalidPercent': true };
    }

  }

  //to dynamically enable/disable any form-control. 
  //here [disabled] attribute was not working from cshtml, so written a separate logic to do it.
  public EnableControl(formControlName: string, enabled: boolean) {

    let currCtrol = this.BillingTransactionItemValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

  //remove individual validators of current billingtransactionitem. 
  //USAGE:
  ////let currBilTxnItm: BillingTransactionItem = new BillingTransactionItem();
  ////currBilTxnItm.RemoveValidators(["ProviderId","DiscountPercent"]);
  public RemoveValidators(formControls: Array<string>) {
    let validator = null;
    if (formControls != null && formControls.length > 0) {
      formControls.forEach(ctrlName => {
        this.BillingTransactionItemValidator.controls[ctrlName].validator = null;//Validators.compose([])
      });
    }
  }

}
