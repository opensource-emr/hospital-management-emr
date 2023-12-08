import {
  FormBuilder, FormControl, FormGroup, Validators
} from '@angular/forms';

import * as moment from 'moment/moment';

import { Address } from "./address.model";
import { Guarantor } from './guarantor.model';
import { InsuranceInfo } from "./insurance-info.model";
import { KinEmergencyContact } from './kin-emergency-contact.model';

import { AdmissionModel } from '../../adt/shared/admission.model';
import { Appointment } from "../../appointments/shared/appointment.model";
import { PatientCareTaker_DTO } from '../../appointments/shared/dto/patient-caretaker.dto';
import { Visit } from "../../appointments/shared/visit.model";
import { PatientScheme } from '../../billing/shared/patient-map-scheme';
import { ActiveMedical } from "../../clinical/shared/active-medical.model";
import { Allergy } from '../../clinical/shared/allergy.model';
import { FamilyHistory } from "../../clinical/shared/family-history.model";
import { MedicationPrescription } from "../../clinical/shared/medication-prescription.model";
import { PastMedical } from "../../clinical/shared/past-medical.model";
import { SocialHistory } from "../../clinical/shared/social-history.model";
import { SurgicalHistory } from "../../clinical/shared/surgical-history.model";
import { Vitals } from "../../clinical/shared/vitals.model";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { CountrySubdivision } from "../../settings-new/shared/country-subdivision.model";
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { SSU_InformationModel } from '../../ssu/shared/SSU_Information.model';
import { PatientFilesModel } from './patient-files.model';

export class Patient {
  public PatientId: number = 0;
  public PatientName: string = "";
  public PatientNo: number = 0;//added: sud-24May'18
  public Salutation: string = null;
  public FirstName: string = "";
  public MiddleName: string = null;
  public LastName: string = "";
  public FullName: string = ""; //Yubraj 4th July '19
  public DateOfBirth: string = null;
  public Gender: string = null;
  public PreviousLastName: string = null;
  public WardName: string = "";
  public WardId: string = "";
  public BedNo: number = null;
  public BedCode: string = null;
  //try to hide the audit trail properties from client models..sudarshan:15July
  public CreatedOn: string = null;
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  public MaritalStatus: string = null;
  public TreatmentType: string = null;
  public EMPI: string = null;
  //this shortname =  FirstName+' '+LastName. created for common usage purpose.
  public ShortName: string = "";
  public Race: string = null;
  public PhoneNumber: string = null;
  public PassportNumber: string = null;
  public LandLineNumber: string = null;
  public PhoneAcceptsText: boolean = false;
  public IDCardNumber: string = null;
  public EmployerInfo: string = null;
  public Occupation: string = null;
  public EthnicGroup: string = null;
  public BloodGroup: string = null;
  public Email: string = null;
  public CountryId: number = 0;
  public CountryName: string = null;
  public CountrySubDivisionId: number = null;
  public WardNumber: number = null;
  public Age: string = null;
  public AgeUnit: string = 'Y'; //used only in client side
  public IsDobVerified: boolean = false;//seetting it to false for nepal where mostly they use Age..
  public PatientCode: string = null;
  public IsActive: boolean = true;
  public IsOutdoorPat: boolean = false;
  public PatientNameLocal: string = "";
  public Address: string = null;
  public IsDialysis: boolean = false;
  public DialysisCode: number = null;
  public DischargeDate: string = null; // added to fix production build error EMR_V2.1.8

  public Telmed_Patient_GUID: string;

  //display purpose only
  public CountrySubDivisionName: string = null;

  public CountrySubDivision: CountrySubdivision = new CountrySubdivision();
  public Ins_HasInsurance: boolean = false;
  public Ins_NshiNumber: string = null;
  public Ins_InsuranceBalance: number = 0;
  public ClaimCode: number = null;
  public RequestingDepartment: number = null;

  public Ins_InsuranceCurrentBalance: number = 0;
  // form group

  //Patient Registration

  public Addresses: Array<Address> = new Array<Address>();
  public Guarantor: Guarantor = new Guarantor();
  public KinEmergencyContacts: Array<KinEmergencyContact> = new Array<KinEmergencyContact>();
  public Insurances: Array<InsuranceInfo> = new Array<InsuranceInfo>();


  //Clinical
  //History of patients
  public Problems: Array<ActiveMedical> = new Array<ActiveMedical>();
  public PastMedicals: Array<PastMedical> = new Array<PastMedical>();
  public FamilyHistory: Array<FamilyHistory> = new Array<FamilyHistory>();
  public SurgicalHistory: Array<SurgicalHistory> = new Array<SurgicalHistory>();
  public SocialHistory: Array<SocialHistory> = new Array<SocialHistory>();
  public Allergies: Array<Allergy> = new Array<Allergy>();
  public Vitals: Array<Vitals> = new Array<Vitals>();
  public MedicationPrescriptions: Array<MedicationPrescription> = new Array<MedicationPrescription>();


  //Appointment
  public Appointment: Array<Appointment> = new Array<Appointment>();
  public Visits: Array<Visit> = new Array<Visit>();
  public Admissions: Array<AdmissionModel> = new Array<AdmissionModel>();

  //tests
  public LabRequisitions: Array<LabTestRequisition> = new Array<LabTestRequisition>();
  //public ImagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
  public ImagingItemRequisitions: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
  //updated changed from array<patientmemberships> to singular entity.
  //public MembershipTypeId: number = null;//sud:20Mar'23--Not required in New structure.
  //public MembershipTypeName: string = null;//sud:20Mar'23--Not required in New structure.
  //public MembershipDiscountPercent: number = 0;//sud:20Mar'23--Not required in New structure.

  public PANNumber: string = "";
  public PatientValidator: FormGroup = null;

  public UploadedFiles: Array<PatientFilesModel> = null;//sud:3July'18

  //dispaly purpose only
  public HasFile: boolean = false;
  public ProfilePic: PatientFilesModel = null;

  public NepaliDOB: NepaliDate = null;

  //ashim: 18Sep2018
  //used in samplecollect.
  public PatientType: string;
  public RunNumberType: string;
  public RequisitionId: number;

  //sud:28Sept'18 needed to assign these in billing..
  public LatestVisitType: string = null;
  public VisitType: string = null;
  public LatestVisitCode: string = null;
  public LatestVisitId: string = null;
  public LatestVisitDate: string = null;
  public IsValidMembershipTypeName: boolean = true; //Yubraj 2019 2nd August

  public IsPoliceCase: boolean = false;
  public NSHI: string = null;

  // Bikash 17th-Feb'21, fields added for SSU patient information
  public IsSSUPatient: boolean = false;
  public SSU_IsActive: boolean = false;
  public SSU_Information: SSU_InformationModel = new SSU_InformationModel();
  public FatherName: string;
  public MotherName: string;

  //Anjana :14May'21, Required to show municipality
  public MunicipalityId: number = null;
  public MunicipalityName: string = null;

  // rajib :18 Aug 2022, Required to APF Hospital
  public Posting: string = null;
  public Rank: string = null;
  public DependentId: string = null;
  public IsDependentIdEditAble: boolean = false; //Rajib, 31,Aug'22, To handle the edit of DepenedentId in Visit context(APF Hospital Specific)
  public APFPatientDependentIdCount: number = 0; //Rajib 31, Aug'22 It caputures count of dependentId for APF Patient.
  public PatientScheme: PatientScheme = new PatientScheme();
  public listOfPatientIdsUsingSameDependentId: Array<number> = new Array<number>();
  public SSFPolicyNo: string;
  public PolicyNo: string;
  public PriceCategoryId: number;
  public MedicareMemberNo: string = ''; //*Krishna, 6th,Jan'23
  public IsMedicarePatient: boolean = false; //*Krishna, 8th,Jan'23
  public IsMedicareMemberEligibleForRegistration: boolean = false; //*Krishna, 8th,Jan'23
  public IsAdmitted: boolean = false;
  public CareTaker = new PatientCareTaker_DTO();

  //!Bibek, 25thJune'23, Below Columns are added to avoid extra API call to fetch Care Taker information
  public CareTakerName: string = "";
  public RelationWithCareTaker: string = "";
  public CareTakerContact: string = "";
  public BedId: number = null;
  public VisitCode: string = "";
  public SchemeId: number = null; //! Krishna, 2ndOctober'23, Added this to transfer data to Referral Visit instance
  public DepartmentName: string = null;
  public AdmittedDate: string = null;

  constructor() {

    this.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");

    const _formBuilder = new FormBuilder();
    this.PatientValidator = _formBuilder.group({
      'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
      'MiddleName': ['', Validators.compose([Validators.maxLength(30)])],
      //removing the age and dobvalidtors for now, need to
      'Age': ['', Validators.compose([Validators.required])],
      'DateOfBirth': ['', Validators.compose([Validators.required, this.dateValidators]),],
      'Gender': ['', Validators.required],
      'CountrySubDivisionId': ['', Validators.required],
      'WardNumber': ['', Validators.compose([Validators.pattern('^[0-9]{0,2}$')])],
      //sud:20mar'23--Make proper implementation of Municipality validation in all pages (Patient,Registration,Billing,etc) then only apply required validator.
      'Municipality': [''], // ['', Validators.required],
      'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')],
      'PhoneNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
      'PassportNumber': ['', Validators.compose([Validators.maxLength(12)])],
      'LandLineNumber': ['', Validators.compose([Validators.pattern('^[0-9]{1,9}$')])],
      'CountryId': ['', Validators.required],
      //'Address': ['', Validators.required],
      'PANNumber': ['', Validators.compose([Validators.maxLength(20)])],
      // 'MembershipTypeId': ['', Validators.required],
      'Posting': [''],
      'Rank': [''],
      'DependentId': [''],
      'IDCardNumber': [''],

    });

  }

  public IsDirty(fieldname): boolean {
    if (fieldname == undefined) {
      return this.PatientValidator.dirty;
    }
    else {
      return this.PatientValidator.controls[fieldname].dirty;
    }

  }

  public IsValid(): boolean { if (this.PatientValidator.valid) { return true; } else { return false; } }
  public IsValidCheck(fieldname, validator): boolean {
    // this is used to check for patient form is valid or not
    if (this.PatientValidator.valid) {
      return true;
    }

    //if nothing's has changed in Patient then return true..
    //else check if the form is valid or not.. <needs revision: Sudarshan 27Dec'16>
    //if (!this.PatientValidator.dirty) {
    //    return true;
    //}


    if (fieldname == undefined) {
      return this.PatientValidator.valid;
    }
    else {

      return !(this.PatientValidator.hasError(validator, fieldname));
    }
  }

  //ageValidators(control: FormControl): { [key: string]: boolean } {
  //    // console.log("age validator: " + control.value);
  //    //return { 'wrongDate': true };
  //    ////get current date, month and time
  //    //var currDate = moment().format('YYYY-MM-DD');

  //    ////if positive then selected date is of future else it of the past
  //    //if ((moment(control.value).diff(currDate) > 0) ||
  //    //    (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
  //    //    return { 'wrongDate': true };
  //}

  dateValidators(control: FormControl): { [key: string]: boolean } {

    //get current date, month and time
    var currDate = moment().format('YYYY-MM-DD');

    //if positive then selected date is of future else it of the past
    if ((moment(control.value).diff(currDate) > 0) ||
      (moment(control.value).diff(currDate, 'years') < -200)) // this will not allow the age diff more than 200 is past
      return { 'wrongDate': true };
  }
  //returns only scalar properties of the patient from Input patient object.
  //rest of the fields are set to null.
  /// FIND a better cloning option for this: sudarshan-23May'17
  public static GetClone(ipPatient: Patient): Patient {
    let retPatient = Object.assign({}, ipPatient);
    //set not-required fields to null.--needs revision on which all fields to remove.
    retPatient.PatientValidator = null;
    retPatient.Guarantor = null;
    retPatient.Admissions = null;
    retPatient.Addresses = null;
    //retPatient.CountryId = null;
    //retPatient.CountrySubDivisionId = null;
    return retPatient;
  }

  //conditional sets ON and OFF the validation on age and dob
  //this function is not called anymore since we're showing both age and dateofbirth at the same time..
  //so adding the required and dateValidtor at the beginning itself..
  public UpdateValidator(onOff: string, formControlName: string) {
    let validator = null;
    if (formControlName == "Age" && onOff == "on") {
      this.PatientValidator.controls['Age'].validator = Validators.compose([Validators.required]);
      this.PatientValidator.controls['DateOfBirth'].validator = Validators.compose([]);
    }
    else {
      this.PatientValidator.controls['DateOfBirth'].validator = Validators.compose([Validators.required, this.dateValidators]);
      this.PatientValidator.controls['Age'].validator = Validators.compose([]);
    }
    this.PatientValidator.controls[formControlName].updateValueAndValidity();

  }

  public UpdatePhoneValidator(onOff: string, formControlName: string) {
    if (formControlName == "PhoneNumber" && onOff == "on") {
      this.PatientValidator.controls['PhoneNumber'].validator = Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')]);
    } else {
      this.PatientValidator.controls['PhoneNumber'].validator = Validators.compose([]);
    }
    this.PatientValidator.controls[formControlName].updateValueAndValidity();

  }


  //added: sud-15Jun'18-- to show in patientoverview page, use it in other places as well if required.
  public AllergyFormatted = { Primary: "", Secondary: "" };


  public FormatPatientAllergies() {

    if (this.Allergies && this.Allergies.length > 0) {
      //First allergy will be Primary, and remaining will come as secondary allergies.
      //Priority Sequence is by type:  Allergy > AdvRec > Others.
      let primAllerg = this.Allergies.find(alrg => alrg.AllergyType == "Medication")
        || this.Allergies.find(alrg => alrg.AllergyType == "Non Medication") || this.Allergies.find(alrg => alrg.AllergyType == "Others");

      if (primAllerg) {
        this.AllergyFormatted.Primary = primAllerg.AllergenAdvRecName;

        let secAllrgString = "";
        //if (secAllrgs && secAllrgs.length > 0) {
        this.Allergies.forEach(a => {
          secAllrgString += a.AllergenAdvRecName + "<br/>";
        });
        this.AllergyFormatted.Secondary = secAllrgString;
        // }

      }


    }

  }
  //to dynamically enable/disable any form-control.
  //here [disabled] attribute was not working from cshtml, so written a separate logic to do it.
  public EnableControl(formControlName: string, enabled: boolean) {

    let currCtrol = this.PatientValidator.controls[formControlName];
    if (currCtrol) {
      if (enabled) {
        currCtrol.enable();
      }
      else {
        currCtrol.disable();
      }
    }
  }

  positiveNumberValdiator(control: FormControl): { [key: string]: boolean } {
    if (control) {
      if (control.value <= 0)
        return { 'invalidNumber': true };
    }
  }
}
