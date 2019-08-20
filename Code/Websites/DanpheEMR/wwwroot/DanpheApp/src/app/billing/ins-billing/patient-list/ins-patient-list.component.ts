import { Component, ChangeDetectorRef } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';// this is 
//import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
//import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { BillingBLService } from '../../shared/billing.bl.service';
import { BillingService } from '../../shared/billing.service';
import { Patient } from "../../../patients/shared/patient.model";
import { PatientService } from '../../../patients/shared/patient.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { BillingTransaction } from '../../shared/billing-transaction.model';
import { PatientWithVisitInfoVM } from "../../../patients/shared/patient.view-models";
import * as moment from 'moment/moment';

import { APIsByType } from "../../../shared/search.service";
import { BillingGridColumnSettings } from "../../shared/billing-grid-columns";
import { CoreService } from "../../../core/shared/core.service";
import { InsuranceVM } from "../../shared/patient-billing-context-vm";
import { GovInsuranceBLService } from "../shared/gov-ins.bl.service";

@Component({
  templateUrl: "./ins-patient-list.html"
})

export class InsurancePatientListComponent {

  public insurancePatients: Array<any> = new Array<any>();
  //filteredPatients: Array<any> = new Array();//sud: 4sept'18

  public selPatient: Patient = new Patient();

  //public billingGridColumns: BillingGridColumnSettings = null;
  public patListGridCols: Array<any> = null;


  constructor(public patientService: PatientService,
    public billingBLService: BillingBLService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public billingService: BillingService, public govInsBLService: GovInsuranceBLService,
    public msgBoxServ: MessageboxService, public coreService: CoreService) {

    this.patListGridCols = (new BillingGridColumnSettings(this.coreService)).InsurancePatientList;

    this.LoadInsurancePatientList();

  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus();
  }

  LoadInsurancePatientList(): void {
    this.billingBLService.GetInsurancePatients()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.insurancePatients = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }

  GetResults($event) {
    this.insurancePatients = $event;
    if (this.insurancePatients && this.insurancePatients.length > 0) {
      this.insurancePatients.forEach(pat => {
        pat.BillingType = pat.IsAdmitted ? "IP" : "OP";
      });
    }
  }



  public showBalanceUpdatePage: boolean = false;
  public currentPatInsDetails: InsuranceVM = null;

  PatientGridActions($event) {
    switch ($event.Action) {

      case "insurance-billing":
        {
          var data = $event.Data;
          this.billingService.BillingFlow = 'insurance';
          this.AssignPatientGlobalValues(data);
          this.billingService.CreateNewGlobalBillingTransaction();
          this.billingService.BillingType = data.IsAdmitted ? "Inpatient" : "Outpatient";
          this.router.navigate(["/Billing/InsuranceMain/InsBillingTransaction"]);
        }
        break;

      case "update-ins-balance":
        {
          this.currentPatInsDetails = new InsuranceVM();
          var data = $event.Data;
          this.currentPatInsDetails.PatientId = data.PatientId;
          this.currentPatInsDetails.InsuranceProviderId = data.InsuranceProviderId;
          this.currentPatInsDetails.CurrentBalance = data.CurrentBalance;

          this.showBalanceUpdatePage = true;

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
    globalPat.FirstName = ipData.FirstName;
    globalPat.LastName = ipData.LastName;
    globalPat.MiddleName = ipData.MiddleName;
    globalPat.PatientNameLocal = ipData.PatientNameLocal;
    globalPat.PhoneNumber = ipData.PhoneNumber;
    globalPat.Gender = ipData.Gender;
    globalPat.ShortName = ipData.ShortName;
    globalPat.DateOfBirth = ipData.DateOfBirth;
    globalPat.Address = ipData.Address;
    globalPat.CountrySubDivisionName = ipData.CountrySubDivisionName;
    globalPat.PANNumber = ipData.PANNumber;
    globalPat.Admissions = ipData.Admissions;
    globalPat.LatestVisitType = ipData.LatestVisitType;
    globalPat.LatestVisitCode = ipData.LatestVisitCode;
    globalPat.LatestVisitId = ipData.LatestVisitId;
    globalPat.LatestVisitDate = ipData.LatestVisitDate;

  }


  CloseInsBalancePopup($event) {
    if ($event.action == "balance-updated") {
      let insPatId = $event.PatientId;
      let patFromGrid = this.insurancePatients.find(p => p.PatientId == insPatId);
      if (patFromGrid) {
        patFromGrid.CurrentBalance = $event.UpdatedBalance;
      }

      this.insurancePatients = this.insurancePatients.slice();


    }

    console.log("ins popup closed");
    console.log($event);

    this.showBalanceUpdatePage = false;
    //this.currBillingContext.Insurance.CurrentBalance = $event.currentBalance;
  }

  public showSearchPatient: boolean = true;
  public showPatientPopup: boolean = false;
  public selectedINSPatientToEdit: any;



  //sud:24Jul'19-- Below is a server side search implemented in danphe-autocomplete.
  //the api should be in format: apiName?reqType=reqTypeValue&paramname=:xxx  -> here   :xxx will be replaced by the word typed in the dropdown.
  //Pls do not change it.
  SearchPatientsByKey(keyword: any) {
    return "/api/BillInsurance?reqType=all-patients-for-insurance&searchText=:dd";
  }

  patientListFormatter(data: any): string {
    let html = "";

    if (data["InsuranceProviderId"]) {
      html = "<b>(INS) </b> ";
    }

    html += data["ShortName"] + ' [ ' + data['PatientCode'] + ' ]' + ' - ' + data['Age'] + ' - ' + ' ' + data['Gender'];
    return html;
  }

  public popupAction: string = "add";//add or edit based on condition.


  public EditExistingPatientInfo() {
    this.popupAction = "edit";
    this.showPatientPopup = true;
  }


  NewINSPatientRegistration() {
    this.popupAction = "add";
    this.showPatientPopup = true;
  }

  public InsPatientPopupOnClose($event) {
    this.showPatientPopup = false;
    if ($event.action == "new-pat-added") {
      this.LoadInsurancePatientList();
      this.selectedINSPatientToEdit = null;
    }
    else if ($event.action == "patient-updated") {
      this.LoadInsurancePatientList();
      this.selectedINSPatientToEdit = null;
    }


  }
}
