import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs-compat';
import { CoreService } from '../../../core/shared/core.service';
import { ENUM_DateFormats } from '../../../shared/shared-enums';
import { Patient_DTO } from '../../shared/DTOs/patient.dto';
import { ClaimManagementBLService } from '../../shared/claim-management.bl.service';

@Component({
  selector: 'medical-claim-form',
  templateUrl: './medical-claim-form.component.html'
})
export class MedicalClaimFormComponent implements OnInit {
  public patientObj: Patient_DTO = new Patient_DTO();
  public enableServerSideSearch: boolean = false;
  public patientSearchMinCharacterCount: number = 0;
  public totalAmount: number;
  public dateOfIllness: string = "";
  public isPatientSelected: boolean = false;
  public showMedicalClaimFormPrintPage: boolean = false;
  public isValidMedicarePatient: boolean = false;

  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private changeDetector: ChangeDetectorRef,
    public coreService: CoreService
  ) {
    this.GetParameter();
    this.GetPatientSearchMinCharacterCountParameter();
  }

  ngOnInit() {
  }
  public PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + "(" + data["PhoneNumber"] + ")" + '' + "</b></font>";
    return html;
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.claimManagementBLService.GetPatientsWithVisitsInfo(keyword);
  }

  public PatientInfoChanged(): void {
    this.isPatientSelected = false;
    this.totalAmount = null;
    this.isValidMedicarePatient = false;
    if (this.patientObj && typeof (this.patientObj) === "object") {
      this.changeDetector.detectChanges();
      this.isPatientSelected = true;
      if (this.patientObj.MedicareMemberNo !== null) {
        this.isValidMedicarePatient = true;
      }
      else {
        alert(`${this.patientObj.ShortName} is not a Medicare Patient.`);
      }
    }
  }

  public SetFocusOn(idToSelect: string): void {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  public GetParameter(): void {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName === "Common" && p.ParameterName === "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["BillingSearchPatient"];
  }

  public GetPatientSearchMinCharacterCountParameter(): void {
    let param = this.coreService.Parameters.find(a => a.ParameterGroupName === 'Common' && a.ParameterName === 'PatientSearchMinCharacterCount');
    if (param) {
      let obj = JSON.parse(param.ParameterValue);
      this.patientSearchMinCharacterCount = parseInt(obj.MinCharacterCount);
    }
  }

  public ShowEchsMrpCertificate(): void {
    this.showMedicalClaimFormPrintPage = true;
    this.changeDetector.detectChanges();
  }
  public HideEchsMrpDrugCertificatePrintPage(data): void {
    if (data === true) {
      this.showMedicalClaimFormPrintPage = false;
      this.patientObj = null;
      this.isPatientSelected = false;
      this.dateOfIllness = moment().format(ENUM_DateFormats.Year_Month_Day);
      this.totalAmount = null;
    }
  }

}
