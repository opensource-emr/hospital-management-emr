import { Injectable, Directive } from '@angular/core';
import { Patient } from '../../patients/shared/patient.model';
import * as moment from 'moment/moment';
import { Appointment } from '../../appointments/shared/appointment.model';
import { Guarantor } from '../../patients/shared/guarantor.model';
import { BillItemPriceVM } from '../../billing/shared/billing-view-models';
import { Subject } from 'rxjs';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { Visit } from '../../appointments/shared/visit.model';
import { InsuranceVM } from '../../billing/shared/patient-billing-context-vm';
import { BillingReceiptModel } from '../../billing/shared/billing-receipt.model';
import { NepaliCalendarService } from '../../shared/calendar/np/nepali-calendar.service';
import { CreditOrganization } from '../../settings-new/shared/creditOrganization.model';

@Injectable()
export class InsuranceService {
  public insBillingFlow: string = "normal";//normal for normal billing and insurance for insurance billing
  public currencyUnit: string = "";
  public patientId: number;
  insGlobalAppointment: Appointment = new Appointment();
  public InsuranceDotMatrixPrinterPageDimension: any;
  public InsuranceDischargeBillDotMatrixPageDim: any;
  public InsDotMatrixStickerPrinterPageDim: any;

  public CreateNewGlobal(): Visit {
    this.globalVisit = new Visit();
    return this.globalVisit;
  }
  public CreateInsAppointment(): Appointment {
    this.insGlobalAppointment = new Appointment();
    return this.insGlobalAppointment;
  }
  public GetInsAppointment(): Appointment {
    return this.insGlobalAppointment;
  }
  public GlobalAppointmentPatient: Patient = new Patient();
  // appointment

  //billing
  public taxId: number = 0;
  public taxPercent: number = 0;
  public BillingType: string = "";//for: inpatient, outpatient, etc.. 
  public BillingFlow: string = "normal"; //normal for normal billing and insurance for insurance billing
  public isInsuranceBilling: boolean = false;
  public Insurance: InsuranceVM;
  public taxLabel: string = "";
  public taxName: string = "";
  public AllDoctorsListForBilling = [];//this variable will be set from billing-main component.. 
  public AllEmpListForBilling = [];//
  public AllCreditOrganizationsList = [];

  globalBillingReceipt: BillingReceiptModel = new BillingReceiptModel();
  public GetGlobalBillingReceipt(): BillingReceiptModel {
    return this.globalBillingReceipt;
  }

  globalBillingTransaction: BillingTransaction = new BillingTransaction();
  public CreateNewGlobalBillingTransaction(): BillingTransaction {
    this.globalBillingTransaction = new BillingTransaction();
    return this.globalBillingTransaction;
  }
  public GetDoctorsListForBilling(): Array<any> {
    let docListToReturn = [];
    if (this.AllDoctorsListForBilling) {
      // //need to individually map the objects to avoid Reference-Type issue
      docListToReturn = this.AllDoctorsListForBilling.map(doc => Object.assign({}, doc));
    }
    return docListToReturn;
  }
  public SetAllEmployeeList(empListFromServer: Array<any>) {
    this.AllEmpListForBilling = empListFromServer;
  }

  public SetAllCreditOrgList(creditOrgFromServer: Array<CreditOrganization>) {
    this.AllCreditOrganizationsList = creditOrgFromServer;
  }

  public SetAllDoctorList(docListFromServer: Array<any>) {
    this.AllDoctorsListForBilling = docListFromServer;
  }

  //billing
  constructor(public npCalendarService: NepaliCalendarService) { }

  public CalculateDOB(age: number, ageUnit: string) {
    var curDate = new Date();
    if ((age || age == 0) && ageUnit) {
      if (ageUnit == 'Y') {
        return moment({ months: curDate.getMonth(), days: curDate.getDate() }).subtract(age, 'year').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'M') {
        return moment({ days: curDate.getDate() }).subtract(age, 'months').format("YYYY-MM-DD");
      }
      else if (ageUnit == 'D') {
        return moment().subtract(age, 'days').format("YYYY-MM-DD");
      }
    }
  }
  public SeperateAgeAndUnit(age: string): { Age: string, Unit: string } {
    if (age) {
      var length: number = age.length;
      if (length >= 0) {
        return {
          Age: age.slice(0, length - 1), Unit: age.slice(length - 1, length)
        }
      }
    }
  }
  //ashim: 22Aug2018
  GetEnglishFromNepaliDate(nepaliDate) {
    if (nepaliDate) {
      let engDate = this.npCalendarService.ConvertNepToEngDate(nepaliDate);
      return moment(engDate).format("YYYY-MM-DD");;
    }

  }
  //ashim: 22Aug2018
  GetNepaliFromEngDate(engDate) {
    if (engDate) {
      return this.npCalendarService.ConvertEngToNepDate(engDate);
    }
  }
  GetDefaultNepaliDOB() {
    return this.npCalendarService.GetTodaysNepDate();
  }

  // globalPatient: Patient = new Patient();
  // public CreateNewGlobal(): Patient {
  //   this.globalPatient = new Patient();
  //   return this.globalPatient;
  // }
  // public getGlobal(): Patient {
  //   return this.globalPatient;
  // }

  // setGlobal(currPatient: Patient) {
  //   var pat = this.getGlobal();
  //   pat.ShortName = currPatient.ShortName;
  //   pat.PatientId = currPatient.PatientId;
  //   pat.PatientCode = currPatient.PatientCode;
  //   pat.EMPI = currPatient.EMPI;
  //   pat.FirstName = currPatient.FirstName;
  //   pat.LastName = currPatient.LastName;
  //   pat.MiddleName = currPatient.MiddleName;
  //   pat.DateOfBirth = moment(currPatient.DateOfBirth).format('YYYY-MM-DD');
  //   pat.CountrySubDivisionId = currPatient.CountrySubDivisionId;
  //   pat.CountrySubDivisionName = currPatient.CountrySubDivisionName;
  //   pat.WardName = currPatient.WardName;
  //   pat.BedNo = currPatient.BedNo;
  //   pat.Gender = currPatient.Gender;
  //   pat.CountryName = currPatient.CountryName;
  //   pat.PreviousLastName = currPatient.PreviousLastName;
  //   pat.Race = currPatient.Race;
  //   pat.Email = currPatient.Email;
  //   pat.MaritalStatus = currPatient.MaritalStatus;
  //   pat.PhoneNumber = currPatient.PhoneNumber;
  //   pat.EmployerInfo = currPatient.EmployerInfo;
  //   pat.PhoneAcceptsText = currPatient.PhoneAcceptsText;//change the client side naming: sudarshan 13Dec'16
  //   pat.IDCardNumber = currPatient.IDCardNumber;
  //   pat.Occupation = currPatient.Occupation;
  //   pat.EthnicGroup = currPatient.EthnicGroup;
  //   pat.BloodGroup = currPatient.BloodGroup;
  //   pat.Salutation = currPatient.Salutation;
  //   pat.CountryId = currPatient.CountryId;
  //   pat.IsDobVerified = currPatient.IsDobVerified;
  //   pat.Age = currPatient.Age;
  //   pat.MembershipTypeId = currPatient.MembershipTypeId;
  //   pat.MembershipTypeName = currPatient.MembershipTypeName;
  //   pat.MembershipDiscountPercent = currPatient.MembershipDiscountPercent;
  //   pat.PatientNameLocal = currPatient.PatientNameLocal;
  //   pat.IsDialysis = currPatient.IsDialysis;
  //   pat.DialysisCode = currPatient.DialysisCode; //sanjit: for IsDialysis flag to be check
  //   //mapping array of current object to the global instance...because of one to many relation
  //   pat.Addresses = currPatient.Addresses;
  //   pat.Insurances = currPatient.Insurances;
  //   pat.KinEmergencyContacts = currPatient.KinEmergencyContacts;

  //   pat.Address = currPatient.Address;
  //   pat.PANNumber = currPatient.PANNumber;
  //   pat.Admissions = currPatient.Admissions;
  //   pat.IsOutdoorPat = currPatient.IsOutdoorPat;
  //   pat.Allergies = currPatient.Allergies;

  //   //guarantor is having a lot of problems.. neet to check them carefully--sudarshan:5May'17
  //   if (currPatient.Guarantor != null && currPatient.Guarantor.GuarantorName != null) {

  //     pat.Guarantor = Object.assign(new Guarantor(), currPatient.Guarantor);
  //     pat.Guarantor.GuarantorDateOfBirth = currPatient.Guarantor.GuarantorDateOfBirth ? moment(currPatient.Guarantor.GuarantorDateOfBirth).format('YYYY-MM-DD') : null;

  //   }
  //   else if (currPatient.Guarantor != null && currPatient.Guarantor.GuarantorSelf == true) {
  //     pat.Guarantor = Object.assign(new Guarantor(), currPatient.Guarantor);
  //   }
  //   else {
  //     pat.Guarantor = new Guarantor();
  //   }


  //   pat.WardName = currPatient.WardName;

  // }


  public CreateNewVisitGlobal(): Visit {
    this.globalVisit = new Visit();
    return this.globalVisit;
  }
  public LoadAllBillItemsPriceList(billItms: Array<BillItemPriceVM>) {
    this.allBillItemsPriceList = billItms;
  }


  public appointmentType: string = "New";
  public PriceCategory: string = "Normal";//sud:26June'19-- this is needed across NewVisit, FollowupVisit and Referral Visits etc.. 

  public DocOpdPrices = [];
  public DeptOpdPrices = [];
  public DocFollowupPrices = [];
  public DeptFollowupPrices = [];


  public DocOpdPrice_OldPatient = [];
  public DeptOpdPrice_OldPatient = [];

  public ApptApplicableDepartmentList = [];
  public ApptApplicableDoctorsList = [];
  public allBillItemsPriceList = [];
  public ClaimCode: number;//sud:1-oct'21: Changed datatype from String to Number in all places
  // Observable string sources
  public billChangedEvent = new Subject<any>();

  public ObserveBillChanged = this.billChangedEvent.asObservable();
  //
  public TriggerBillChangedEvent(newBill) {
    this.billChangedEvent.next(newBill);
  }

  //applicable for followup, transfer, refer etc. now used only for followup.
  public ParentVisitInfo: any = null;
  //in case of Transfer previous bill needs to be returned.. so we're pulling that invoice and assigning to below property. 
  public ParentVisitInvoiceDetail: BillingTransaction = new BillingTransaction();
  public PatientTodaysVisitList: Array<Visit> = [];//sud:13July'19--to check if patient already has visit with same provider or department today.

  globalVisit: Visit = new Visit();

  public HasDuplicateVisitToday(patientId: number, departmentId: number, doctorId: number, todaysVisitList: Array<Visit>): boolean {
    let hasDuplicate = false;

    if (todaysVisitList && todaysVisitList.length > 0) {

      //let sameDeptCount = todaysVisitList.filter(v => v.PatientId == patientId &&  v.DepartmentId == departmentId);

      //for now check only for Same department.
      let sameDeptVisitCount = todaysVisitList.filter(v => v.PatientId == patientId && v.DepartmentId == departmentId);
      if (sameDeptVisitCount.length > 0) {
        hasDuplicate = true;
      }
    }

    return hasDuplicate;


  }

}
