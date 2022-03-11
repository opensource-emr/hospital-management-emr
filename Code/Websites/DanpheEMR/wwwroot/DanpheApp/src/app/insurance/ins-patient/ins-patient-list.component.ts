import { ChangeDetectorRef, Component } from '@angular/core';
import { PatientService } from '../../patients/shared/patient.service';
import { BillingService } from '../../billing/shared/billing.service';
import { InsuranceVM } from '../../billing/shared/patient-billing-context-vm';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { InsuranceBlService } from '../shared/insurance.bl.service';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import { CoreService } from '../../core/shared/core.service';
import { INSGridColumnSettings } from '../shared/insurance-grid-columns';
import { InsuranceService } from '../shared/ins-service';
import { InsuranceBalanceAmountHistory } from '../shared/ins-insurance-balance-amount-history.model';
import { Patient } from '../../patients/shared/patient.model';

@Component({
  templateUrl: "./ins-patient-list.component.html",
  host: { '(window:keydown)': 'KeysPressed($event)' }
})

export class INSPatientListComponent {
  public insurancePatientsList: Array<any> = new Array<any>();
  public patListGridCols: Array<any> = null;
  public selPatient: Patient = new Patient();
  public patId: number = 0;

  public showInpatientMessage: boolean = false;
  public wardBedInfo: string = null;

  constructor(
    public insuranceBlService: InsuranceBlService,
    public insuranceService: InsuranceService,
    public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public router: Router,
    public patientService: PatientService,
    public changeDetector: ChangeDetectorRef,) {

    this.patListGridCols = (new INSGridColumnSettings(this.coreService)).InsurancePatientList;
    this.patientService.CreateNewGlobal();
    this.LoadInsurancePatientList();

  }

  ngAfterViewInit() {
    // let btnObj = document.getElementById('btnNewInsurancePat');
    // if (btnObj) {
    //   btnObj.focus();
    // }
  }

  searchText: string = null;
  SearchPatientFromGrid(searchTxt) {
    this.searchText = searchTxt;
    this.LoadInsurancePatientList();
  }

  LoadInsurancePatientList(): void {
    this.insuranceBlService.SearchInsurancePatients(this.searchText)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.insurancePatientsList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
        }
      });
  }
  public showBalanceUpdatePage: boolean = false;
  public showBalanceHistoryPage: boolean = false;
  public currentPatInsDetails: InsuranceVM = null;
  public PatInsDetails: InsuranceBalanceAmountHistory = null;
  public showPatientPopup: boolean = false;
  public selectedINSPatientToEdit: any;
  public showSearchPatient: boolean = true;
  PatientGridActions($event) {
    switch ($event.Action) {

      case "insurance-billing":
        {
          var data = $event.Data;
          this.insuranceService.BillingFlow = 'insurance';
          this.SelectPatient(null, $event.Data);
          this.insuranceService.CreateNewGlobalBillingTransaction();
          this.insuranceService.BillingType = data.IsAdmitted ? "Inpatient" : "Outpatient";
          this.patientService.globalPatient.LatestVisitType = this.insuranceService.BillingType;
          this.router.navigate(["/Insurance/BillingRequest"]);
        }
        break;
      case "update-ins-balance":
        {
          this.currentPatInsDetails = new InsuranceVM();
          var data = $event.Data;
          this.currentPatInsDetails.PatientId = data.PatientId;
          this.currentPatInsDetails.InsuranceProviderId = data.InsuranceProviderId;
          this.currentPatInsDetails.Ins_InsuranceBalance = data.Ins_InsuranceBalance;

          this.showBalanceUpdatePage = true;

        }
        break;
      case "new-visit":
        {
          var data = $event.Data;
          if (data.IsAdmitted) {
            this.wardBedInfo = $event.Data.WardBedInfo;
            this.showInpatientMessage = true;
          }
          else {
            this.insuranceService.CreateNewGlobalBillingTransaction();
            this.SelectPatient(null, $event.Data);
            this.router.navigate(["/Insurance/InsNewVisit"]);
          }
        }
        break;
      case "balance-history":
        {
          this.selPatient = new Patient();
          if ($event.Data != null) {
            this.selPatient = null;
            this.selPatient = $event.Data;

            this.insuranceService.patientId = $event.Data.PatientId;
            //this.selPatient=$event.Data.patientId
            //this.selPatient.FullName = data.FullName;
            // this.selPatient.PatientCode=data.PatientCode;
            // this.selPatient.Ins_NshiNumber=data.Ins_NshiNumber;
            // this.selPatient.claimCode=data.claimCode;
            this.showBalanceHistoryPage = true;

          }
        }
        break;
      default:
        break;
    }
  }
  SearchPatientsByKey(keyword: any) {
    return "/api/Insurance?reqType=all-patients-for-insurance&searchText=:dd";
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

  public InsPatientPopupOnClose($event) {
    this.showPatientPopup = false;
    if ($event.action == "new-pat-added") {
      this.LoadInsurancePatientList();

    }
    else if ($event.action == "patient-updated") {
      this.LoadInsurancePatientList();
    }

    this.selectedINSPatientToEdit = null;

  }

  SelectPatient(event, _patient) {
    let pat = this.patientService.getGlobal();
    Object.keys(_patient).forEach(property => {
      if (property in pat) {
        pat[property] = _patient[property];
      }
    });
    pat.DateOfBirth = moment(pat.DateOfBirth).format('YYYY-MM-DD');
    pat.NSHI = pat.Ins_NshiNumber;
    pat.Ins_InsuranceCurrentBalance = _patient.CurrentBalance;
    this.router.navigate(['/Insurance/InsNewVisit']);
  }
  CloseInsBalancePopup($event) {
    if ($event.action == "balance-updated") {
      let insPatId = $event.PatientId;
      let patFromGrid = this.insurancePatientsList.find(p => p.PatientId == insPatId);
      if (patFromGrid) {
        patFromGrid.Ins_InsuranceBalance = $event.UpdatedBalance;
      }

      this.insurancePatientsList = this.insurancePatientsList.slice();


    }
    console.log("ins popup closed");
    console.log($event);
    this.showBalanceUpdatePage = false;
  }
  CloseInsBalanceHistoryPopup($event) {
    console.log("ins popup closed");
    console.log($event);
    this.showBalanceHistoryPage = false;
  }
  public EditExistingPatientInfo() {
    this.popupAction = "edit";
    this.showPatientPopup = true;
  }


  NewINSPatientRegistration() {
    this.popupAction = "add";
    this.showPatientPopup = true;
  }
  AddPatient() {
    this.popupAction = "add";
    this.selectedINSPatientToEdit = null;
    this.showPatientPopup = true;
  }
  KeysPressed(event) {
    if (event.altKey && event.keyCode == 78) { //if alt key and N is pressed
      this.AddPatient()
    }
  }
}
