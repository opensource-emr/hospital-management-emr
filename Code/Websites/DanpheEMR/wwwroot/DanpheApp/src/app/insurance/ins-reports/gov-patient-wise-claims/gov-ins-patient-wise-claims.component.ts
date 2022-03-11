import { ChangeDetectorRef, Component } from "@angular/core";
import { ReportingService } from "../../../reporting/shared/reporting-service";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { Observable } from 'rxjs/Rx';// this is 
import { Patient } from "../../../patients/shared/patient.model";
import { InsuranceBlService } from "../../shared/insurance.bl.service";
import { SecurityService } from "../../../security/shared/security.service";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: 'gov-ins-patient-wise-claims',
  templateUrl: "./gov-ins-patient-wise-claims.html"
})

export class GOVINSPatientWiseClaimsComponent {

  public dlService: DLService = null;
  public PatientObj: any = null;
  public showPatientPanel: boolean = false;
  public selPatient: Patient = new Patient();
  public claimsList: Array<any> = new Array<any>();
  public showClaimPanel: boolean = false;
  public showPrintPopup: boolean = false;
  public selectedClaimCode: any = null;
  public loading: boolean = false;
  public showPrint: boolean = false;
  public claimDetail: any;
  public isSearchByPatient: boolean = true;
  public isSearchByClaimCode: boolean = false;
  public selClaimCode: string = "";
  constructor(_dlService: DLService,
    public msgBoxServ: MessageboxService,
    public reportServ: ReportingService,
    public changeDetector: ChangeDetectorRef,
    public insuranceBlService: InsuranceBlService,
    public securityService: SecurityService, public coreService: CoreService) {
    this.dlService = _dlService;
    this.coreService.FocusInputById("srch_PatientList");//default focus on Search By Patient
  }

  public patientSearchAsync = (searchTxt: any): Observable<any[]> => {
    return this.insuranceBlService.SearchInsurancePatients(searchTxt);
  }

  public patientInfoChanged() {
    if (this.PatientObj && typeof (this.PatientObj) == "object") {
      this.changeDetector.detectChanges();
      this.selPatient = this.PatientObj;
      this.showPatientPanel = true;
      this.showClaimPanel = false;
      //this.setFocusOnButton('srch_PatientList');
    }
  }
  public patientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "Patient No: [" + data["PatientCode"] + "]" + "</font>&nbsp;&nbsp;<font size=03>NSHI No:[" + data["Ins_NshiNumber"] + "]</font>&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>";
    return html;
  }

  public loadClaimsList() {
    this.loading = true;
    this.dlService.Read("/api/Insurance?reqType=insurance-claim-code-list&patientId=" + this.selPatient.PatientId)
      .map(res => res)
      .finally(() => { this.loading = false; })
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.claimsList = res.Results;
          this.showClaimPanel = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }

  //Sud:18Jan'21--Here we get PatientInformation also in the Claim Object.
  //so we need to assign ShortName, HospitalNo etc from the Claim Object to Selected patient Object.
  AssignPatientInfo(claimObj: any) {
    this.selPatient.PatientId = claimObj.PatientId;
    this.selPatient.ShortName = claimObj.ShortName;
    this.selPatient.PatientCode = claimObj.PatientCode;
    this.selPatient.Ins_NshiNumber = claimObj.NSHI;
    this.selPatient.Gender = claimObj.Gender;
    this.selPatient.Age = claimObj.Age;
    this.selPatient.Address = claimObj.Address;
  }
  public loadSingleClaimDetails(claimObj: any) {
    this.claimDetail = claimObj;
    this.showPrintPopup = true;
  }
  public setFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }
  public closeClaimPopup(event) {
    if (event) {
      if (event.showPrintPopup) {
        this.showPrintPopup = false;
      }
    }
    this.selectedClaimCode = null;
  }
  public searchByCheck(search) {
    if (search == 'patient') {
      this.isSearchByPatient = true;
      this.isSearchByClaimCode = false;
      this.showClaimPanel = false;
      this.showPatientPanel = false;
      this.PatientObj = null; 
      this.coreService.FocusInputById("srch_PatientList");
    }
    else if (search == 'claimcode') {
      this.isSearchByClaimCode = true;
      this.isSearchByPatient = false;
      this.showClaimPanel = false;
      this.showPatientPanel = false;
      this.selClaimCode = null;
      this.coreService.FocusInputById("txtClaimcode");
    }
  }
  public loadClaimsListbyClaimCode() {
    if (!this.selClaimCode) {
      this.msgBoxServ.showMessage("error", ["Please enter claim code"]);
      return;
    }
    this.loading = true;
    this.dlService.Read("/api/Insurance?reqType=insurance-claim-code-list-by-claimcode&claimCode=" + this.selClaimCode)
      .map(res => res)
      .finally(() => { this.loading = false; })
      .subscribe(res => {
        if (res.Status == "OK" && res.Results) {
          this.claimsList = res.Results;
          if (this.claimsList.length > 0) {
            this.showClaimPanel = true;
          }
          else {
            this.msgBoxServ.showMessage("notice", ["No record is available for entered claim code "]);
          }
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
      });
  }
}
