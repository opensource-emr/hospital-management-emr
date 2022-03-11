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
import { DanpheHTTPResponse } from "../../shared/common-models";
import { PatientLatestVisitContext } from "../../patients/shared/patient-lastvisit-context";

@Component({
  templateUrl: "./billing-search-patient-new.html", //"/BillingView/BillingSearchPatient"  //controller in BillingViewController
  styles: [`.padding-10-tp{padding-top: 10px;}
          .lab-radio-holder{font-weight: bold;color: green;margin-bottom: 0;text-indent: 3px;line-height: 14px;cursor: pointer;}
          .lab-radio-holder input[type=radio]{float: left;margin: 0;}`],
  host: { '(window:keydown)': 'hotkeys($event)' }
})

export class BillingSearchPatientNewComponent {
  // binding logic
  patientGridColumns: Array<any> = null;
  public selectedpatient: Patient = new Patient();
  public allPatients: Array<any> = new Array<any>();
  public filteredPatients: Array<any> = new Array();//sud: 4sept'18
  public filteredIPPatients: Array<any> = new Array();//sud: 4sept'18
  public selPatient: Patient = new Patient();
  public showPatientBillHistory = false;
  public showInpatientMessage = false;
  public patGirdDataApi: string = "";
  public patientType: string = "All";
  public showPatientSticker: boolean;
  public showPatRegistration: boolean = false;
  public showAddNewOpPopUp: boolean = false;
  public currentCounter: number = null;
  public searchText: string = '';
  public enableServerSideSearch: boolean = false;

  public PatientObj: any = null;
  public PatientIPObj: any = null;
  public showPatientPanel: boolean = false;
  public showBillingPanel: boolean = false;

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
    //this.LoadPatientList("");
    this.patientGridColumns = GridColumnSettings.BillPatientSearch;
    // this.patGirdDataApi = APIsByType.BillingPatient;
    this.showPatRegistration = this.coreService.AllowPatientRegistrationFromBilling();
    this.currentCounter = this.securityService.getLoggedInCounter().CounterId;
    if (this.currentCounter < 1) {
      this.callbackService.CallbackRoute = '/Billing/SearchPatient'
      this.router.navigate(['/Billing/CounterActivate']);
    }
  }

  ngAfterViewInit() {
    this.SetFocusOnPatientSearch('srch_PatientList');
  }


  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["BillingSearchPatient"];
  }


  GetBackFromOpPatAdd($event) {
    if ($event.close) {
      this.showAddNewOpPopUp = false;

      this.SetFocusOnPatientSearch('srch_PatientList');

      if ($event.action && $event.action == "register-only") {
        //this.LoadPatientList("");
      }
      else if ($event.action && $event.action == "register-and-billing") {
        var data = $event.data;
        //sud/anjana:7May'21--Assigning default visittype after registration. [LPH-904]
        if (!data["LatestVisitType"]) {
          data["LatestVisitType"] = "outpatient";//by default visittype will be outpatient after registration.
        }
        this.AssignPatientGlobalValues_PatientService(data);
        let currPat = this.patientService.globalPatient;
        this.billingService.CreateNewGlobalBillingTransaction();
        this.billingService.BillingType = data.IsAdmitted ? "inpatient" : "outpatient";
        this.AssignVisContextAndRedirectToBillingTxnPage(data.PatientId);
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

  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }

  IPPatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "IPD: [" + data["VisitCode"] + "]" + "</font>&nbsp;&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b>-&nbsp;&nbsp;HospNo:" + data["PatientCode"] + "</font>";
    return html;
  }

  PatientInfoChanged() {
    if (this.PatientObj && typeof (this.PatientObj) == "object") {
      this.showBillingPanel = false;
      this.changeDetector.detectChanges();
      this.selPatient = this.PatientObj;
      this.showPatientPanel = true;
      this.showBillingPanel = true;
      this.SetFocusOnButton('btn_billRequest');
    }
  }

  PatientIPInfoChanged() {
    if (this.PatientIPObj && typeof (this.PatientIPObj) == "object") {
      this.showBillingPanel = false;
      this.changeDetector.detectChanges();
      this.selPatient = this.PatientIPObj;
      this.showPatientPanel = true;
      this.showBillingPanel = true;
      this.SetFocusOnButton('btn_billRequest');
    }
  }

  NewBillingRequest() {
    this.AssignPatientGlobalValues_PatientService(this.selPatient);

    this.billingService.CreateNewGlobalBillingTransaction();
    if (this.PatientObj) {
      this.billingService.BillingType = this.PatientObj.IsAdmitted ? "inpatient" : "outpatient";
    }
    else if (this.PatientIPObj) {
      this.billingService.BillingType = this.PatientIPObj.IsAdmitted ? "inpatient" : "outpatient";
    }
    this.patientService.globalPatient.LatestVisitType = this.billingService.BillingType;
    this.AssignVisContextAndRedirectToBillingTxnPage(this.selPatient.PatientId);
  }

  NewDeposit() {
    this.AssignPatientGlobalValues_PatientService(this.selPatient);
    this.router.navigate(["/Billing/BillingDeposit"]);
  }

  AssignPatientGlobalValues_PatientService(ipData: Patient) {
    var globalPat = this.patientService.getGlobal();
    //mapping to prefill in Appointment Form
    globalPat.PatientId = ipData.PatientId;
    globalPat.PatientCode = ipData.PatientCode;
    globalPat.FirstName = ipData.FirstName;
    globalPat.LastName = ipData.LastName;
    globalPat.MiddleName = ipData.MiddleName;
    globalPat.PhoneNumber = ipData.PhoneNumber;
    globalPat.Gender = ipData.Gender;
    globalPat.ShortName = ipData.ShortName;
    globalPat.DateOfBirth = ipData.DateOfBirth;
    globalPat.Age = ipData.Age;
    globalPat.Address = ipData.Address;
    globalPat.CountrySubDivisionName = ipData.CountrySubDivisionName;
    globalPat.CountryId = ipData.CountryId;
    globalPat.CountrySubDivisionId = ipData.CountrySubDivisionId;
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
    globalPat.WardName = ipData.WardName;
    globalPat.BedCode = ipData.BedCode;

  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  private SetFocusOnPatientSearch(idToSelect: string) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById(idToSelect);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }



  //this function is to handle Shortcuts in this page. 
  public hotkeys(event) {
    if (event.altKey) {
      //console.log(event.keyCode);
      switch (event.keyCode) {
        case 78: {// => ALT+N comes here for New Patient.
          this.ShowOpPatAddPopUp();
          break;
        }

        default:
          break;
      }
    }
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.billingBLService.GetPatientsWithVisitsInfo(keyword);
  }

  public IpdPatientSearchAsync = (ipdVisitCode: any): Observable<any[]> => {
    return this.billingBLService.GetIpdPatientsWithVisitsInfo(ipdVisitCode);
  }


  //sud:8Sept'21--Need to get visitcontext before redirecting. this is needed in billing transaction component..
  public AssignVisContextAndRedirectToBillingTxnPage(patientId: number) {
    //reset last visit context of a patient. 
    this.billingService.PatLastVisitContext = new PatientLatestVisitContext();
    //we need to set visitcontext in billing before sending to billingtransaction component, else there's a good chance that we'll not get correct record..
    this.billingBLService.GetPatientLatestVisitContext(patientId)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          if (res.Results && res.Results.length) {
            let visContxt: PatientLatestVisitContext = res.Results[0];//we get array with single item from server-api.

            //take last visitid if patient is currently admitted, else check if followup is valid or not..
            //else set visitcontext to empty since we can't use those for followup.
            //for inpatient take discharge date for followup valid chek.. 
            if (
              (visContxt.VisitType == "inpatient" && visContxt.IsCurrentlyAdmitted)
              ||
              (visContxt.VisitType == "inpatient" && this.IsFollowupValid(visContxt.DischargeDate))
              ||
              this.IsFollowupValid(visContxt.VisitDate)
            ) {
              this.billingService.PatLastVisitContext = visContxt;
            }
            else {
              this.billingService.PatLastVisitContext = new PatientLatestVisitContext();
            }
          }

          this.router.navigate(["/Billing/BillingTransaction"]);
        }
        else {
          //we need to redirect to billing transaction even if visit context not found for this patient.. 
          //this.router.navigate(["/Billing/BillingTransaction"]);
          console.log(res.ErrorMessage);
        }

        // alert('Selected date: ' + this.billingService.PatLastVisitContext.VisitDate + '    visid:' + this.billingService.PatLastVisitContext.PatientVisitId);

      },
        err => {
          console.log(err.ErrorMessage);
        });
  }

  //If last visit was within Followup valid date range then take that visitId for billing and furhter..
  //pending: need to discuss what to do with Insurance Visits since validity of Insurance visit is only for 1 day..
  //but it won't impact the data so we can continue with this solution..
  IsFollowupValid(lastVisDate: string) {
    let retValue = false;
    //check for followup valid days if last vist was not inpatient. 
    let fwupValidDaysParam = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "MaximumLastVisitDays");
    if (fwupValidDaysParam && fwupValidDaysParam.ParameterValue && parseInt(fwupValidDaysParam.ParameterValue)) {
      let fwupValidDays = parseInt(fwupValidDaysParam.ParameterValue);
      let daySinceLastVisit = moment().diff(moment(lastVisDate), 'days');
      if (fwupValidDays >= daySinceLastVisit) {
        retValue = true;
      }
    }

    return retValue;
  }
  OnClickPatientSticker(){
    this.showPatientSticker = true;
  }
  ClosePrintStickerPopup(){
    this.showPatientSticker = false;
  }


}
