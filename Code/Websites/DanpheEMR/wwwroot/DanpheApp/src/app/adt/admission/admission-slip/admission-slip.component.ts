import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import { User } from '../../../security/shared/user.model';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { AdmissionSlipDetails_DTO } from '../../shared/DTOs/admission-slip-details.dto';
import { ADT_BLService } from '../../shared/adt.bl.service';

@Component({
  selector: 'admission-slip',
  templateUrl: './admission-slip.component.html'
})
export class AdmissionSlipComponent implements OnInit {


  @Input("patient-visitId")
  public PatientVisitId: number = null;

  public showAdmissionSlip: boolean = false;
  public admissionSlipDetails: AdmissionSlipDetails_DTO = new AdmissionSlipDetails_DTO();
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public loading: boolean = false;
  public InvoiceDisplaySettings = { "ShowHeader": true, "ShowQR": true, "ShowHospLogo": true };
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
  public dateTimeFormat: string = ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute_12HoursFormat;

  public currentUser: User = new User();
  constructor(
    private messageBoxService: MessageboxService,
    private changeDetector: ChangeDetectorRef,
    private securityService: SecurityService,
    private coreService: CoreService,
    private adtBlService: ADT_BLService
  ) {
    this.GetBillingHeaderParameter();
    this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
  }

  ngOnInit() {
    this.currentUser = this.securityService.GetLoggedInUser();
    this.GetDetailsForAdmissionSlip(this.PatientVisitId);
  }

  public GetDetailsForAdmissionSlip(patientVisitId: number): void {
    try {
      this.adtBlService.GetDetailsForAdmissionSlip(patientVisitId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK && res.Results) {
            this.admissionSlipDetails = res.Results;
            this.showAdmissionSlip = true;
          }
          else {
            this.messageBoxService.showMessage(ENUM_MessageBox_Status.Failed, ["Failed  to get Details for Admission Slip"]);
          }
        });
    }
    catch (exception) {
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Exception : ${exception}`]);
    }
  }

  public PrintAdmissionSlip(): void {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("id_admission_slip");
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
