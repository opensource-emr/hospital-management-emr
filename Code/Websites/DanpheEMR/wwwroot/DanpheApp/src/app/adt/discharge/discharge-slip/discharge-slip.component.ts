import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { User } from '../../../security/shared/user.model';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { ADT_BLService } from '../../shared/adt.bl.service';
import { DischargeSlipDetails_DTO } from '../../shared/discharge-slip-details.dto';

@Component({
  selector: 'discharge-slip',
  templateUrl: './discharge-slip.component.html'
})
export class DischargeSlipComponent implements OnInit {

  @Input("show-discharge-slip")
  public showDischargeSlip: boolean = false;
  @Input("patient-visit-id")
  public patientVisitId: number = 0;
  public dischargeSlipDetails: DischargeSlipDetails_DTO = new DischargeSlipDetails_DTO();

  @Output("hide-discharge-slip")
  public hideDischargeSlip = new EventEmitter<boolean>();
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public loading: boolean = false;
  public InvoiceDisplaySettings = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true };
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public dateTimeFormat: string = ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute_12HoursFormat;
  public currentUser: User = new User();
  public DischargeClearanceApprovalParties = new Array<DischargeClearanceApproval_DTO>();
  constructor(
    private messageBoxService: MessageboxService,
    private changeDetector: ChangeDetectorRef,
    private securityService: SecurityService,
    private coreService: CoreService,
    private adtBLService: ADT_BLService
  ) {
    this.GetBillingHeaderParameter();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
    this.DischargeClearanceApprovalParties = this.GetDischargeApprovalsParties();
  }

  ngOnInit() {
    this.currentUser = this.securityService.GetLoggedInUser();
    this.GetDetailsForDischargeSlip(this.patientVisitId);

  }

  private GetDischargeApprovalsParties(): Array<DischargeClearanceApproval_DTO> {
    let dischargeClearanceApprovalParties = new Array<DischargeClearanceApproval_DTO>();
    const param = this.coreService.Parameters.find(p => p.ParameterGroupName === "ADT" && p.ParameterName === "DischargeClearanceApprovals");
    if (param) {
      const paramJson = JSON.parse(param.ParameterValue);
      dischargeClearanceApprovalParties = paramJson;
    }
    return dischargeClearanceApprovalParties;
  }
  public GetDetailsForDischargeSlip(PatientVisitId: number): void {
    try {
      this.adtBLService.GetDetailsForDischargeSlip(PatientVisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.dischargeSlipDetails = res.Results;
            this.showDischargeSlip = true;
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed  to get Discharge Details for Slip"]);
          }
        });
    }
    catch (exception) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception : ${exception}`]);
    }
  }
  public CloseDischargeSlipPopUp() {
    this.showDischargeSlip = false;
    this.hideDischargeSlip.emit(true);
  }
  public PrintDischargeSlip(): void {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("id_discharge_slip");
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.openBrowserPrintWindow = true;
      this.loading = false;
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Printer Not Supported."]);
    }
  }
  public GetBillingHeaderParameter(): void {
    const param = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader');
    const paramValue = param ? param.ParameterValue : null;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Please enter parameter values for BillingHeader"]);
  }

}

export class DischargeClearanceApproval_DTO {
  IsEnabled: boolean = false;
  IsBillingUser: boolean = false;
  ApprovingParty: string = ""
}
