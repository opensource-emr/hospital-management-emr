import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DateFormats, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { Patient_DTO } from '../DTOs/patient.dto';

@Component({
  selector: 'medical-claim-form-print',
  templateUrl: './medical-claim-form-print.component.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class MedicalClaimFormPrintComponent implements OnInit {
  @Input("patient-obj")
  public patientObj: Patient_DTO = new Patient_DTO();
  @Input("show-medical-claim-form-print-page")
  public showMedicalClaimFormPrintPage: boolean;
  @Input("date-of-illness")
  public dateOfIllness: string = "";
  @Input("total-amount")
  public totalAmount: number;
  @Output("hide-medical-claim-form-print-page")
  public hideMedicalClaimFormPrintPage: EventEmitter<boolean> = new EventEmitter<boolean>();
  public headerTitle: string = "MEDICAL CLAIM FORM";
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public closePopUpAfterStickerPrint: boolean = true;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public loading: boolean = false;
  public dateToday: string = "";
  public insuranceCompanyName: string = "NATIONAL INSURANCE COMPANY LIMITED";
  public insuranceCompanyAddress: string = "2nd Floor, Arbind Complex, New Road, Pokhara, Nepal.";
  public insuranceCompanyTelephoneNumber: string = "061-525114";
  public insuranceCompanyFaxNumber: string = "061-525116";
  constructor(
    private changeDetector: ChangeDetectorRef,
    public messageBoxService: MessageboxService
  ) { }

  ngOnInit() {
    this.dateToday = moment().format(ENUM_DateFormats.Year_Month_Day);
  }

  public CloseMedicalClaimFormPopUp(): void {
    this.showMedicalClaimFormPrintPage = false;
    this.hideMedicalClaimFormPrintPage.emit(true);
  }
  public Print(): void {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("id_medical_claim_form");
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

  public hotkeys(event): void {
    if (event.keyCode === 27) {
      this.CloseMedicalClaimFormPopUp();
    }
  }

}
