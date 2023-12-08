import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs-compat';
import { CoreService } from '../../../core/shared/core.service';
import { Patient_DTO } from '../../shared/DTOs/patient.dto';
import { ClaimManagementBLService } from '../../shared/claim-management.bl.service';

@Component({
  selector: 'echs-drug-claim',
  templateUrl: './echs-mrp-drug-certificate.component.html'
})
export class EchsMrpDrugCertificateComponent implements OnInit {
  public patientObj: Patient_DTO = new Patient_DTO();
  public enableServerSideSearch: boolean = false;
  public patientSearchMinCharacterCount: number = 0;
  public billNumber: string = "";
  public isPatientSelected: boolean = false;
  public showEchsMrpDrugCertificatePrintPage: boolean = false;
  constructor(
    private claimManagementBLService: ClaimManagementBLService,
    private changeDetector: ChangeDetectorRef,
    private coreService: CoreService
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
    return this.claimManagementBLService.GetECHSPatientWithVisitInformation(keyword);
  }

  public PatientInfoChanged(): void {
    this.isPatientSelected = false;
    this.billNumber = null;
    if (this.patientObj && typeof (this.patientObj) === "object") {
      this.changeDetector.detectChanges();
      this.isPatientSelected = true;
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
    this.showEchsMrpDrugCertificatePrintPage = true;
    this.changeDetector.detectChanges();
  }

  public HideEchsMrpDrugCertificatePrintPage(data): void {
    if (data === true) {
      this.showEchsMrpDrugCertificatePrintPage = false;
      this.patientObj = null;
      this.isPatientSelected = false;
      this.billNumber = null;
    }
  }

}
