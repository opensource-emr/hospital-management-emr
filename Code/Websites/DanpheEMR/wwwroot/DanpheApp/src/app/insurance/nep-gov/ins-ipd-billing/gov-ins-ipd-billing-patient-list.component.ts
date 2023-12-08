import { Component } from "@angular/core";
//Remove below imports and move the dl calling logic to bl/dl later on.
import { Router } from "@angular/router";
import { CoreService } from "../../../core/shared/core.service";
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from "../../../security/shared/security.service";
import { GeneralFieldLabels } from "../../../shared/DTOs/general-field-label.dto";
import { CallbackService } from "../../../shared/callback.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { DLService } from "../../../shared/dl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { GovInsuranceService } from "../shared/ins-service";
import { GovInsuranceBlService } from "../shared/insurance.bl.service";


@Component({
  templateUrl: "./gov-ins-ipd-billing-patient-list.component.html"
})
export class GovINSIPDBillingComponent {

  public showPatientContext: boolean = false;
  public selPatId: number = 0;
  public selVisitId: number = 0;
  public allInpatList: Array<any> = [];
  public ipPatientGridColumns: Array<any> = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(public dlService: DLService,
    public securityService: SecurityService,
    public callbackService: CallbackService,
    public patientService: PatientService,
    public router: Router,
    public messageBoxService: MessageboxService,
    public insuranceService: GovInsuranceService,
    public coreService: CoreService,

    public insuranceBlService: GovInsuranceBlService) {
    this.LoadInpatientList();
    this.LoadAllBillingItems();
    this.LoadAllDoctorsList();
    this.LoadAllEmployeeList();
    this.GetOrganizationList();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
    this.ipPatientGridColumns = GridColumnSettings.insIpBillPatientSearch;
    this.ipPatientGridColumns[3].headerName = `${this.GeneralFieldLabel.NSHINo} No`;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));
  }

  LoadInpatientList() {
    this.dlService.Read("/api/GovInsurance/AdmittedPatients")
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allInpatList = res.Results;
          //ward/bed search wasnot working from grid so combining the columns as one to fill the grid data..
          if (this.allInpatList && this.allInpatList.length > 0) {
            this.allInpatList.forEach(ipInfo => {
              //below column will be added in all rows and also used as fieldName in grid-column-settings.
              ipInfo["WardBedInfo"] = ipInfo.BedInformation.Ward + "/" + ipInfo.BedInformation.BedCode;
            });
          }
        }
        else {
          this.messageBoxService.showMessage("failed", ["Unable to get ins-ip-patient list."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  OnSummaryWindowClosed($event) {
    this.showPatientContext = false;
    this.selPatId = this.selVisitId = 0;
    //Reload the summary after single patient context is closed.
    this.LoadInpatientList();
  }
  ShowPatientProvisionalItems(row): void {
    //patient mapping later used in receipt print
    var patient = this.patientService.CreateNewGlobal();
    patient.ShortName = row.PatientName;
    patient.PatientCode = row.PatientNo;
    patient.DateOfBirth = row.DateOfBirth;
    patient.PhoneNumber = row.PhoneNumber;
    patient.Gender = row.Gender;
  }
  IpBillingGridAction($event: GridEmitModel) {
    var selPat = $event.Data;
    switch ($event.Action) {
      case "view-summary":
        {
          if (this.securityService.getLoggedInCounter().CounterId < 1) {
            this.callbackService.CallbackRoute = '/Billing/InpatBilling';
          }
          this.selPatId = selPat.PatientId;
          this.selVisitId = selPat.VisitId;
          this.ShowPatientProvisionalItems(selPat);

          //assign necessary values of patient here..
          this.showPatientContext = true;

        }
        break;
      default:
        break;
    }
  }

  //we have to load all billing items into service variable, which will be used across this module. 
  public LoadAllBillingItems() {
    this.insuranceBlService.GetBillItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("bill item prices are loaded successfully (billing-main).");
          this.insuranceService.LoadAllBillItemsPriceList(res.Results);
        }
        else {
          console.log("Couldn't load bill item prices. (billing-main)");
        }
      });
  }

  public LoadAllDoctorsList() {
    this.insuranceBlService.GetDoctorsList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("doctors list are loaded successfully (billing-main).");
          this.insuranceService.SetAllDoctorList(res.Results);
        }
        else {
          console.log("Couldn't get doctor's list. (billing-main)");
        }
      });
  }
  public LoadAllEmployeeList() {
    this.insuranceBlService.GetActiveEmployeesList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          console.log("Employee list are loaded successfully (billing-main).");
          this.insuranceService.SetAllEmployeeList(res.Results);
        }
        else {
          console.log("Couldn't get Employee list. (billing-main)");
        }
      });
  }

  public GetOrganizationList() {
    this.insuranceBlService.GetOrganizationList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == 'OK') {
          console.log("CreditOrganization list are loaded successfully (billing-main).");
          this.insuranceService.SetAllCreditOrgList(res.Results);
        }
        else {
          console.log("Couldn't get CreditOrganization List(billing-main).");
        }
      });
  }

}