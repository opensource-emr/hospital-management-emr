import { Component, ChangeDetectorRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';// this is 
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from '../../patients/shared/patient.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingTransaction } from '../shared/billing-transaction.model';
import { PatientWithVisitInfoVM } from "../../patients/shared/patient.view-models";
import * as moment from 'moment/moment';
import { APIsByType } from "../../shared/search.service";
import { CoreService } from "../../core/shared/core.service";
import { SecurityService } from "../../security/shared/security.service";
import { CallbackService } from "../../shared/callback.service";
@Component({
  templateUrl: "./billing-search-patient.html", //"/BillingView/BillingSearchPatient"  //controller in BillingViewController
  styles: [`.padding-10-tp{padding-top: 10px;}
          .lab-radio-holder{font-weight: bold;color: green;margin-bottom: 0;text-indent: 3px;line-height: 14px;cursor: pointer;}
          .lab-radio-holder input[type=radio]{float: left;margin: 0;}`]
})

export class BillingSearchPatientComponent {
  // binding logic
  patientGridColumns: Array<any> = null;
  public selectedpatient: Patient = new Patient();
  allPatients: Array<any> = new Array<any>();
  filteredPatients: Array<any> = new Array();//sud: 4sept'18
  public selPatient: Patient = new Patient();
  public showPatientBillHistory = false;
  public showInpatientMessage = false;
  public patGirdDataApi: string = "";
  public patientType: string = "All";

  public showPatRegistration: boolean = false;
  public showAddNewOpPopUp: boolean = false;
  public currentCounter: number = null;
  public searchText: string = '';
  public enableServerSideSearch: boolean = false;
  constructor(public patientService: PatientService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public billingService: BillingService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public securityService: SecurityService,
    public callbackService: CallbackService) {
    this.getParamter();
    this.LoadPatientList("");
    this.patientGridColumns = GridColumnSettings.BillPatientSearch;
    // this.patGirdDataApi = APIsByType.BillingPatient;
    this.showPatRegistration = this.coreService.AllowPatientRegistrationFromBilling();
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    // if(this.currentCounter <1){
    //   this.callbackService.CallbackRoute = '/Billing/SearchPatient'
    //   this.router.navigate(['/Billing/CounterActivate']);
    // }
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }

  LoadPatientList(searchTxt): void {
    this.billingBLService.GetPatientsWithVisitsInfo(searchTxt)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allPatients = res.Results;
          if (this.allPatients && this.allPatients.length > 0) {
            this.allPatients.forEach(pat => {
              pat.BillingType = pat.IsAdmitted ? "IP" : "OP";
            });
            //assign all to filtered patient at first.
            this.filteredPatients = this.allPatients;
          }
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          //alert(res.ErrorMessage);
          console.log(res.ErrorMessage);
        }
      });
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    //this.GetPendingReportList(this.fromDate, this.toDate, this.searchText);
    this.LoadPatientList(searchTxt);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["BillingSearchPatient"];
  }
  GetResults($event) {
    this.allPatients = $event;
    if (this.allPatients && this.allPatients.length > 0) {
      this.allPatients.forEach(pat => {
        pat.BillingType = pat.IsAdmitted ? "IP" : "OP";
      });
      //assign all to filtered patient at first.
      this.filteredPatients = this.allPatients;
    }
  }
  SelectPatient(selectedPatient: Patient) {

    var globalPatient: Patient = this.patientService.getGlobal();
    globalPatient.PatientId = selectedPatient.PatientId;
    globalPatient.FirstName = selectedPatient.FirstName;
    globalPatient.LastName = selectedPatient.LastName;
    globalPatient.ShortName = selectedPatient.ShortName;
    globalPatient.PatientCode = selectedPatient.PatientCode;
    globalPatient.DateOfBirth = selectedPatient.DateOfBirth;
    globalPatient.MembershipTypeId = selectedPatient.MembershipTypeId;
    globalPatient.MembershipTypeName = selectedPatient.MembershipTypeName;
    globalPatient.MembershipDiscountPercent = selectedPatient.MembershipDiscountPercent;
  }

  PatientGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "bill-history":
        {

          var data = $event.Data;
          this.showPatientBillHistory = false;
          this.changeDetector.detectChanges();
          this.selPatient = new Patient();
          this.selPatient.PatientId = data.PatientId;
          this.selPatient.PatientCode = data.PatientCode;
          this.selPatient.ShortName = data.ShortName;
          this.selPatient.PhoneNumber = data.PhoneNumber;
          this.selPatient.Address = data.Address;
          this.selPatient.DateOfBirth = data.DateOfBirth;
          this.selPatient.Gender = data.Gender;
          this.showPatientBillHistory = true;
          this.showDischargeBillPopup = false;
        }
        break;
      case "deposit":
        {
          var data = $event.Data;
          this.AssignPatientGlobalValues(data);
          this.router.navigate(["/Billing/BillingDeposit"]);
        }
        break;
      case "billingRequest":
        {

          var data = $event.Data;
          this.AssignPatientGlobalValues(data);
          let currPat = this.patientService.globalPatient;

          this.billingService.CreateNewGlobalBillingTransaction();
          this.billingService.BillingType = data.IsAdmitted ? "inpatient" : "outpatient";

          if (this.billingService.BillingType == "outpatient") {
            this.router.navigate(["/Billing/BillingTransaction"]);
            this.patientService.globalPatient.LatestVisitType = "outpatient";

            //sud:14Mar'19--below code is now moved to BilingTransactionPage.
            ////if emergency visit comes on 2nd day, ask user to do Either Emergency or outpatient Billing
            //if (currPat.LatestVisitType && currPat.LatestVisitType.toLowerCase() == "emergency") {
            //    let lastErDay = moment().diff(moment(currPat.LatestVisitDate), 'days');
            //    if (lastErDay > 0) {
            //        this.showChangeVisitTypePopup = true;
            //    }
            //}
            //else {
            //    this.patientService.globalPatient.LatestVisitType = this.billingService.BillingType;
            //}
            //if (!this.showChangeVisitTypePopup) {
            //    //let totDays = moment(currentDate).diff(moment(dateOfBirth).format('YYYY-MM-DD'), 'days');
            //    this.router.navigate(["/Billing/BillingTransaction"]);
            //}
          }
          else {
            this.showInpatientMessage = true;
          }
          break;
        }
      case "insurance-billing":
        {
          var data = $event.Data;
          this.AssignPatientGlobalValues(data);
          this.billingService.CreateNewGlobalBillingTransaction();
          this.billingService.BillingType = data.IsAdmitted ? "Inpatient" : "Outpatient";
          this.router.navigate(["/Billing/InsuranceBilling"]);
        }
        break;
      default:
        break;
    }
  }

  AssignPatientGlobalValues(ipData: PatientWithVisitInfoVM) {
    var globalPat = this.patientService.getGlobal();
    //mapping to prefill in Appointment Form
    globalPat.PatientId = ipData.PatientId;

    //this.LoadMembershipTypePatient(globalPat.PatientId);

    globalPat.PatientCode = ipData.PatientCode;
    globalPat.FirstName = ipData.FirstName.trim();
    globalPat.LastName = ipData.LastName.trim();
    globalPat.MiddleName = ipData.MiddleName ? ipData.MiddleName.trim() : ipData.MiddleName;
    globalPat.PhoneNumber = ipData.PhoneNumber;
    globalPat.Gender = ipData.Gender;
    globalPat.Age = ipData.Age;
    globalPat.CountryName = ipData.CountryName;
    globalPat.CountryId = ipData.CountryId;
    globalPat.ShortName = ipData.ShortName;
    globalPat.DateOfBirth = ipData.DateOfBirth;
    globalPat.Address = ipData.Address;
    globalPat.CountrySubDivisionId = ipData.CountrySubDivisionId;
    globalPat.CountrySubDivisionName = ipData.CountrySubDivisionName;
    globalPat.PANNumber = ipData.PANNumber;
    globalPat.Admissions = ipData.Admissions;
    globalPat.LatestVisitType = ipData.LatestVisitType;
    globalPat.LatestVisitCode = ipData.LatestVisitCode;
    globalPat.LatestVisitId = ipData.LatestVisitId;
    globalPat.LatestVisitDate = ipData.LatestVisitDate;

    globalPat.MembershipTypeId = ipData.MembershipTypeId;
    globalPat.MembershipTypeName = ipData.MembershipTypeName;
    globalPat.MembershipDiscountPercent = ipData.MembershipDiscountPercent;
    globalPat.DialysisCode = ipData.DialysisCode; //24th July:Dinesh to show dialysis number for MIKC
  }

  CloseBillHistory() {
    this.showPatientBillHistory = false;
  }

  //sud: 4sept: to filter between IP, OP and All Patients

  //public patientType: string = "All";//default type is All.
  OnPatientTypeChange() {
    if (this.patientType == "All") {
      this.filteredPatients = this.allPatients;
    }
    else if (this.patientType == "OP") {
      this.filteredPatients = this.allPatients.filter(p => p.BillingType == "OP");
    }
    else if (this.patientType == "IP") {
      this.filteredPatients = this.allPatients.filter(p => p.BillingType == "IP");
    }
  }

  public showDischargeBillPopup = false;
  public selPatForDischarge = { PatientId: 0, VisitId: 0 };
  CloseDischargeBill($event) {
    this.showDischargeBillPopup = false;
  }


  //sud:14Mar'19--this is now moved to BillingTransaction page..
  //public showChangeVisitTypePopup: boolean = false;
  ////Change LatestVisitType to OPD if user chooses so..
  //public OnChangeVisitPopupClosed($event) {

  //    if ($event && $event.EventName == "close") {
  //        this.showChangeVisitTypePopup = false;
  //    }
  //    else {
  //        if ($event && $event.EventName == "changeToOPD") {
  //            this.patientService.globalPatient.LatestVisitType = "outpatient";
  //        }
  //        this.showChangeVisitTypePopup = false;
  //        this.router.navigate(["/Billing/BillingTransaction"]);
  //    }
  //}

  GetBackFromOpPatAdd($event) {
    if ($event.close) {
      this.showAddNewOpPopUp = false;
      if ($event.action && $event.action == "register-only") {
        this.LoadPatientList("");
      }
      else if ($event.action && $event.action == "register-and-billing") {
        var data = $event.data;
        this.AssignPatientGlobalValues(data);
        let currPat = this.patientService.globalPatient;
        this.billingService.CreateNewGlobalBillingTransaction();
        this.billingService.BillingType = data.IsAdmitted ? "inpatient" : "outpatient";
        this.router.navigate(["/Billing/BillingTransaction"]);
      }

    }
  }

  public ShowOpPatAddPopUp() {
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/SearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    } else {
      this.showAddNewOpPopUp = true;
    }
  }

}
