import {
    NgForm,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder
} from '@angular/forms'

import * as moment from 'moment/moment';

import { Address } from "./address.model";
import { InsuranceInfo } from "./insurance-info.model";
import { Guarantor } from './guarantor.model';
import { KinEmergencyContact } from './kin-emergency-contact.model';

import { Allergy } from '../../clinical/shared/allergy.model';
import { ActiveMedical } from "../../clinical/shared/active-medical.model";
import { Vitals } from "../../clinical/shared/vitals.model";
import { PastMedical } from "../../clinical/shared/past-medical.model";
import { FamilyHistory } from "../../clinical/shared/family-history.model";
import { SurgicalHistory } from "../../clinical/shared/surgical-history.model";
import { SocialHistory } from "../../clinical/shared/social-history.model";
import { MedicationPrescription } from "../../clinical/shared/medication-prescription.model";
import { Visit } from "../../appointments/shared/visit.model";
import { Appointment } from "../../appointments/shared/appointment.model";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { CountrySubdivision } from "../../settings-new/shared/country-subdivision.model";
import { Admission } from '../../adt/shared/admission.model';
import { PatientFilesModel } from './patient-files.model';
import { NepaliDate } from '../../shared/calendar/np/nepali-dates';
import { SSU_InformationModel } from '../../ssu/shared/SSU_Information.model';

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
    public BedNo: number = 0;
    public BedCode: string = null;
    //try to hide the audit trail properties from client models..sudarshan:15July
    public CreatedOn: string = null;
    public CreatedBy: number = null;
    public ModifiedOn: string = null;
    public ModifiedBy: number = null;
    public MaritalStatus: string = null;
    public TreatmentType: string = null;
    public EMPI: string = null;
    //this shortname =  FirstName+' '+LastName. created for common usage purpose. 
    public ShortName: string = null;
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
    public Age: string = null;
    public AgeUnit: string = 'Y'; //used only in client side
    public IsDobVerified: boolean = false;//seetting it to false for nepal where mostly they use Age..
    public PatientCode: string = null;
    public IsActive: boolean = true;
    public IsOutdoorPat: boolean = null;
    public PatientNameLocal: string = "";
    public Address: string = null;
    public IsDialysis: boolean = false;
    public DialysisCode: number = null;
    public DischargeDate: string = null; // added to fix production build error EMR_V2.1.8

    //display purpose only
    public CountrySubDivisionName: string = null;

    public CountrySubDivision: CountrySubdivision = new CountrySubdivision();
    public Ins_HasInsurance: boolean = null;
    public Ins_NshiNumber: string = null;
    public Ins_InsuranceBalance: number = 0;
    public ClaimCode: number = null;

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
    public Admissions: Array<Admission> = new Array<Admission>();

    //tests
    public LabRequisitions: Array<LabTestRequisition> = new Array<LabTestRequisition>();
    //public ImagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
    public ImagingItemRequisitions: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
    //updated changed from array<patientmemberships> to singular entity.
    public MembershipTypeId: number = null;//remove this hardcoded value : sudarshan: 6July2017
    public MembershipTypeName: string = null;
    public MembershipDiscountPercent: number = 0;

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
    public MunicipalityId: number = 0;
    public MunicipalityName: string = null;

    constructor() {
        var _formBuilder = new FormBuilder();
        this.PatientValidator = _formBuilder.group({
            'FirstName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'LastName': ['', Validators.compose([Validators.required, Validators.maxLength(30)])],
            'MiddleName': ['', Validators.compose([Validators.maxLength(30)])],
            //removing the age and dobvalidtors for now, need to 
            'Age': ['', Validators.compose([Validators.required])],
            'DateOfBirth': ['', Validators.compose([Validators.required, this.dateValidators]),],
            'Gender': ['', Validators.required],
            'CountrySubDivisionId': ['', Validators.required],
            'Email': ['', Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$')],
            'PhoneNumber': ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{1,10}$')])],
            'PassportNumber': ['', Validators.compose([Validators.maxLength(12)])],
            'LandLineNumber': ['', Validators.compose([Validators.pattern('^[0-9]{1,9}$')])],
            'CountryId': ['', Validators.required],
            //'Address': ['', Validators.required],
            'PANNumber': ['', Validators.compose([ Validators.maxLength(20)])],
            //'MembershipTypeId': ['', Validators.required],
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

}
