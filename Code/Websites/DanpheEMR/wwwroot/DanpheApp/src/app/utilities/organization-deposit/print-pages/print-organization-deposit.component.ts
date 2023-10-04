import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { CoreService } from "../../../core/shared/core.service";
import { PatientService } from '../../../patients/shared/patient.service';
import { SecurityService } from '../../../security/shared/security.service';
import { User } from '../../../security/shared/user.model';
import { ENUM_PrintingType } from '../../../settings-new/printers/printer-settings.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { OrganizationDeposit_DTO } from '../../shared/DTOs/organization-deposit.dto';
import { UtilitiesBLService } from "../../shared/utilities.bl.service";



@Component({
  selector: 'print-organization-deposit',
  templateUrl: './print-organization-deposit.component.html',
})
export class PrintOrganizationDepositComponent implements OnInit {
  public organizationDeposit: OrganizationDeposit_DTO = new OrganizationDeposit_DTO();

  @Input("deposit-id")
  public depositId: number;

  @Input("show-Organization-Deposit-Print-Page")
  public showOrganizationDepositPrintPage: boolean;

  @Output("organization-deposit-print-callback")
  public OrganizationDepositPrintCallback = new EventEmitter<object>();
  public loading: boolean;
  selectedPrinter: any;
  public showReceipt: boolean = false;

  public CurrentUser: User = new User();
  public browserPrintContentObj: HTMLElement;
  public openBrowserPrintWindow: boolean;
  public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };

  public DateTimeNow: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
  constructor(
    public utilitiesBlService: UtilitiesBLService,
    public patientService: PatientService,
    public coreService: CoreService,
    public messageBoxService: MessageboxService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef

  ) {

    let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);

  }
  ngOnInit() {
    this.GetDepositDetails();
    this.CurrentUser = this.securityService.GetLoggedInUser();
  }
  GetDepositDetails() {
    if (this.depositId) {
      this.utilitiesBlService.GetDepositDetails(this.depositId).subscribe((res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.organizationDeposit = res.Results;
        }
      });

    }
  }
  public Print() {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.openBrowserPrintWindow = false;
      this.changeDetector.detectChanges();
      this.browserPrintContentObj = document.getElementById("id_organizationDeposit_print");
      this.openBrowserPrintWindow = true;
      this.loading = false;
      this.CloseDepositReceiptPopUp();
      //this.GoBackToOrganizationDepositPage();
    }
    else {
      this.loading = false;
      this.messageBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Printer Not Supported."]);
    }
  }
  GoBackToOrganizationDepositPage() {
    this.OrganizationDepositPrintCallback.emit({ action: "GoBackToOrganizationDepositPage" });
  }
  CloseDepositReceiptPopUp(): void {
    this.showReceipt = false;
    this.depositId = null;
    console.log("close buttons is clicked")
  }

}
