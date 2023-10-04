import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DispensaryService } from '../../../../dispensary/shared/dispensary.service';
import { CoreService } from '../../../../core/shared/core.service';
import { Patient } from '../../../../patients/shared/patient.model';
import { PatientService } from '../../../../patients/shared/patient.service';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { SecurityService } from '../../../../security/shared/security.service';
import { CallbackService } from '../../../../shared/callback.service';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../../../shared/routefrom.service';
import { APIsByType } from '../../../../shared/search.service';
import DispensaryGridColumns from '../../../shared/dispensary-grid.column';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styles: []
})
export class PatientListComponent implements OnInit {
  patients: Array<Patient> = new Array<Patient>();
  patient: Patient = new Patient();
  public currentCounterId: number = null;
  public currentCounterName: string = null;
  patientGridColumns: Array<any> = null;
  public ShowDepositAdd: boolean = false;
  public selectedPatientData: Patient = new Patient();
  public patGirdDataApi: string = "";
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  currentActiveDispensary: any;
  IsCurrentDispensaryInsurace: any;
  constructor(
    public router: Router,
    public patientService: PatientService,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    public callBackService: CallbackService,
    public routeFromService: RouteFromService,
    public messageboxService: MessageboxService,
    public coreService: CoreService,
    public _dispensaryService: DispensaryService
  ) {
    try {

      this.currentCounterId = this.securityService.getPHRMLoggedInCounter().CounterId;
      this.currentCounterName = this.securityService.getPHRMLoggedInCounter().CounterName;

      if (this.currentCounterId < 1) {
        this.callBackService.CallbackRoute = '/Dispensary/Patient/List'
        this.router.navigate(['/Dispensary/ActivateCounter']);
      }
      else {
        this.getParamter();
        this.currentActiveDispensary = this._dispensaryService.activeDispensary;
        this.IsCurrentDispensaryInsurace = this._dispensaryService.isInsuranceDispensarySelected;
        this.Load("");
        this.patientGridColumns = (this.IsCurrentDispensaryInsurace == true) ? DispensaryGridColumns.PHRMINSPatientList : DispensaryGridColumns.PHRMPatientList;
        this.patGirdDataApi = APIsByType.PatByName;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ngOnInit() {
  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.Load(this.searchText);
  }
  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["PatientSearchPatient"];
  }
  //Load patients
  Load(searchTxt): void {
    this.pharmacyBLService.GetPatients(searchTxt, this.IsCurrentDispensaryInsurace)
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.patients = res.Results;
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      }, err => {
        console.log(err);
        this.msgBoxServ.showMessage("error", ["failed to get  patients"]);
      });
  }
  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }
  //Grid actions fires this method
  PatientGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "newPrescription": {
        var selectedPatientData = $event.Data;
        this.SetPatServiceData(selectedPatientData);
        this.router.navigate(["/Dispensary/Prescription/New"]);
      }
        break;
      case "sale": {
        var selectedPatientData = $event.Data;
        this.SetPatServiceData(selectedPatientData);
        this.router.navigate(["/Dispensary/Sale/New"]);
      }
        break;

      case "deposit": {
        this.selectedPatientData = $event.Data;
        this.ShowDepositAdd = true;
      }
        break;
      default:
        break;
    }
  }

  //Method for assign value to patient service
  public SetPatServiceData(selectedPatientData) {
    if (selectedPatientData) {
      this.patient = this.patients.find(pat => pat.PatientId == selectedPatientData.PatientId);
      var globalPatient = this.patientService.getGlobal();
      globalPatient.PatientId = selectedPatientData.PatientId;
      globalPatient.PatientCode = selectedPatientData.PatientCode;
      globalPatient.ShortName = selectedPatientData.ShortName;
      globalPatient.DateOfBirth = selectedPatientData.DateOfBirth;
      globalPatient.Gender = selectedPatientData.Gender;
      globalPatient.IsOutdoorPat = selectedPatientData.IsOutdoorPat;
      globalPatient.PhoneNumber = selectedPatientData.PhoneNumber;
      globalPatient.FirstName = this.patient.FirstName;
      globalPatient.MiddleName = this.patient.MiddleName;
      globalPatient.LastName = this.patient.LastName;
      globalPatient.Age = this.patient.Age;
      globalPatient.Address = this.patient.Address;
      globalPatient.ClaimCode = this.patient.ClaimCode;
      globalPatient.Ins_InsuranceBalance = this.patient.Ins_InsuranceBalance;
      globalPatient.Ins_NshiNumber = this.patient.Ins_NshiNumber;
    }
  }
  //Method for navigate to New outdoor patient registration page
  public RegisterNewPatient() {
    this.router.navigate(["/Pharmacy/Patient/New"]);
  }
  DepositAdd() {
    this.ShowDepositAdd = false;
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.routeFromService.RouteFrom = null;
      this.messageboxService.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
      //this.messageboxService.showMessage("error", [ex.message + "     " + ex.stack]);
    }
  }
}