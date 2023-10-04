import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Observable } from "rxjs";
import { Patient_DTO } from "../../../claim-management/shared/DTOs/patient.dto";
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from "../../../security/shared/security.service";
import { BillingScheme_DTO } from "../../../settings-new/billing/shared/dto/billing-scheme.dto";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import {
  ENUM_DanpheHTTPResponses,
  ENUM_Data_Type,
  ENUM_MessageBox_Status,
  ENUM_ProcessConfirmationActions,
  ENUM_ProcessesToConfirmDisplayNames,
} from "../../../shared/shared-enums";
import { PatientSchemeRefundsList_DTO } from "../../shared/DTOs/patient-scheme-refunds-list.dto";
import { SchemeRefund_DTO } from "../../shared/DTOs/scheme-refund.dto";
import { UtilitiesBLService } from "../../shared/utilities.bl.service";

@Component({
  selector: "new-scheme-refund",
  templateUrl: "./scheme-refund.component.html",
})
export class SchemeRefundComponent implements OnInit {
  @Output("callback-close")
  callbackClose: EventEmitter<Object> = new EventEmitter<Object>();
  public billingSchmes: Array<BillingScheme_DTO> = [];
  public patientSearchResult: SchemeRefund_DTO = new SchemeRefund_DTO();
  public PreviousSchemeRefundDetail = new Array<PatientSchemeRefundsList_DTO>();
  public selectedSchme: BillingScheme_DTO = new BillingScheme_DTO();
  public schemeRefundObject: SchemeRefund_DTO = new SchemeRefund_DTO();
  public selectedPatient: Patient_DTO = new Patient_DTO();
  public loading: boolean = false;
  public showIsPatientSelected: boolean = false;
  public SchemeRefundFixedAmount: any; //!Krishna, 8thMay'23, this is made any, as we are not sure what will the parameter return.
  public disableAmountField: boolean = false;
  public requiresProcessConfirmation: boolean = false;
  public ProcessToConfirmDisplayName: string = ENUM_ProcessesToConfirmDisplayNames.SchemeRefund;
  public RequiredPermissionNameToConfirmProcess: string = 'scheme-refund-confirmation-process'; //! Krishna, 14thMay'23 Do not change this value, This is a system generated PermissionName to confirm Scheme Refund Process.
  constructor(
    public utilitiesBlService: UtilitiesBLService,
    public messageBoxService: MessageboxService,
    public coreService: CoreService,
    public securityServices: SecurityService,
  ) {
    this.GetBillingSchems();
    this.SchemeRefundFixedAmount = this.GetParam_SchemeRefundFixedAmount();
  }

  public GetParam_SchemeRefundFixedAmount(): object {
    const StrParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "SchemeRefund" && a.ParameterName == "SchemeWiseFixedAmount");
    if (StrParam && StrParam.ParameterValue) {
      let currParam = JSON.parse(StrParam.ParameterValue);
      return currParam;
    }
  }
  ngOnInit(): void {

  }
  public GetBillingSchems() {
    this.utilitiesBlService.GetBillingSchmes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          if (res.Results && res.Results.length > 0) {
            this.billingSchmes = res.Results;
          } else {
            this.billingSchmes = [];
          }
        } else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
            `Error: ${res.ErrorMessage}`,
          ]);
        }
      },
      (err: DanpheHTTPResponse) => {
        this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [
          `Error: ${err.ErrorMessage}`,
        ]);
      }
    );
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    let searchPatient = this.utilitiesBlService.GetPatientsWithVisitsInfo(keyword);

    searchPatient.subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.patientSearchResult = res.Results;
        }
        else {
          this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
            "Patient Not found",
          ]);
        }
        this.loading = false;
      },
      (err) => {
        this.logError(err);
        this.loading = false;
      }
    );

    return searchPatient;
  };


  PatientListFormatter(data: any): string {
    let html: string = "";
    html =
      "<font size=03>" +
      "[" +
      data["PatientCode"] +
      "]" +
      "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" +
      data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" +
      "(" +
      data["Age"] +
      "/" +
      data["Gender"] +
      ")" +
      "" +
      "</b></font>";
    return html;
  }

  public AssignSelectedSchme() {
    if (this.selectedSchme && typeof this.selectedSchme === ENUM_Data_Type.Object && this.selectedSchme.SchemeId > 0) {
      this.schemeRefundObject.SchemeId = this.selectedSchme.SchemeId;
      const fixedAmountScheme = this.SchemeRefundFixedAmount.find(a => a.schemeId === this.schemeRefundObject.SchemeId);
      if (fixedAmountScheme) {
        this.schemeRefundObject.RefundAmount = +fixedAmountScheme.Amount;
        this.disableAmountField = true;
      } else {
        this.schemeRefundObject.RefundAmount = 0;
        this.disableAmountField = false;
      }
    }
  }

  public AssignSelectedPatient() {
    if (this.selectedPatient && typeof this.selectedPatient === ENUM_Data_Type.Object && this.selectedPatient.PatientId > 0) {
      this.schemeRefundObject.PatientId = this.selectedPatient.PatientId;
      if (this.schemeRefundObject.PatientId) {
        this.GetPatientSchemeRefunds();
      }
      this.selectedSchme = this.billingSchmes.find(a => a.SchemeId === this.selectedPatient.SchemeId);
      this.schemeRefundObject.SchemeId = this.selectedSchme ? this.selectedSchme.SchemeId : null;
      const fixedAmountScheme = this.SchemeRefundFixedAmount.find(a => a.schemeId === this.schemeRefundObject.SchemeId);
      if (fixedAmountScheme) {
        this.schemeRefundObject.RefundAmount = +fixedAmountScheme.Amount;
        this.disableAmountField = true;
      } else {
        this.schemeRefundObject.RefundAmount = 0;
        this.disableAmountField = false;
      }
      // this.selectedPatientChange.subscribe(patient => {
      //   if (patient) {
      //     this.patientId = patient.PatientId;
      //   }
      // })

      this.schemeRefundObject.PatientCode = this.selectedPatient.PatientCode;
      this.schemeRefundObject.Age = this.selectedPatient.Age;
      this.schemeRefundObject.Gender = this.selectedPatient.Gender;
      this.schemeRefundObject.PhoneNumber = this.selectedPatient.PhoneNumber;
      this.schemeRefundObject.Address = this.selectedPatient.Address;
      this.showIsPatientSelected = true;
      if (this.selectedPatient.IsAdmitted) {
        this.schemeRefundObject.InpatientNumber = this.selectedPatient.VisitCode;
      }
    }
    else {
      this.showIsPatientSelected = false;

    }
  }

  GotoProcessConfirmation(): void {
    if (this.securityServices.HasPermission(this.RequiredPermissionNameToConfirmProcess)) {
      this.SaveSchemeRefund();
    } else {
      this.requiresProcessConfirmation = true;
    }
  }
  ConfirmationProcessCallback($event = { action: '' }): void {
    if ($event && $event.action === ENUM_ProcessConfirmationActions.close) {
      this.requiresProcessConfirmation = false;
    }
    else if ($event && $event.action === ENUM_ProcessConfirmationActions.confirmSuccess) {
      this.requiresProcessConfirmation = false;
      this.SaveSchemeRefund();
    } else {
      this.requiresProcessConfirmation = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Could not confirm your process']);
    }
  }
  public SaveSchemeRefund() {
    this.loading = true;
    if (this.selectedSchme && this.selectedSchme.SchemeId > 0 && this.selectedPatient && this.selectedPatient.PatientId > 0 && this.schemeRefundObject.RefundAmount > 0) {
      this.schemeRefundObject.CounterId = this.securityServices.getLoggedInCounter().CounterId;
      this.utilitiesBlService
        .SaveSchemeRefund(this.schemeRefundObject)
        .finally(() => {
          this.loading = false;
          this.schemeRefundObject = new SchemeRefund_DTO();
          this.selectedPatient = null;
          this.selectedSchme = null;
          this.showIsPatientSelected = false;
          this.PreviousSchemeRefundDetail = new Array<PatientSchemeRefundsList_DTO>();
        })
        .subscribe(
          (res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
              if (res.Results) {
                this.messageBoxService.showMessage(
                  ENUM_MessageBox_Status.Success,
                  [`Successfully saved scheme refund transaction.`]
                );
                this.Close();
              }
            } else {
              this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${res.ErrorMessage}`,]);
            }
          },
          (err: DanpheHTTPResponse) => {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Error: ${err.ErrorMessage}`,]);
          }
        );
    } else {
      this.loading = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`Please fill all the mandatory fields.`,]);
    }
  }
  Close() {
    this.showIsPatientSelected = false;
    this.callbackClose.emit({ 'action': 'close' });
  }
  GoToNextInput(nextInputId: string) {
    const nextInput = document.getElementById(nextInputId);
    if (nextInput) {
      nextInput.focus();
    }
  }
  setFocusOnInput() {
    let obj = document.getElementById("id_patient_number");
    if (obj) {
      obj.focus();
    }
  }
  GetPatientSchemeRefunds() {
    this.utilitiesBlService
      .GetPatientSchemeRefunds(this.schemeRefundObject.PatientId)
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.PreviousSchemeRefundDetail = res.Results;
            this.loading = false;
          } else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, [
              "Could not fetch previous Scheme Refunds",
            ]);
            this.loading = false;
          }
        },
        (err) => {
          this.logError(err);
          this.loading = false;
        }
      );
  }
  logError(err: any): void {
    console.log(err);
  }

}
