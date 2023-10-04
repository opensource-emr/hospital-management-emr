import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DateFormats, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { Patient_DTO } from '../DTOs/patient.dto';

@Component({
  selector: 'echs-mrp-drug-certificate-print',
  templateUrl: './echs-mrp-drug-certificate-print.component.html',
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class EchsMrpDrugCertificatePrintComponent implements OnInit {
  @Input("patient-obj")
  public patientObj: Patient_DTO = new Patient_DTO();
  @Input("show-echs-mrp-drug-certificate-print-page")
  public showEchsMrpDrugCertificatePrintPage: boolean;
  @Input("bill-number")
  public billNumber: number;
  @Output("hide-echs-mrp-drug-certificate-print-page")
  public hideEchsMrpDrugCertificatePrintPage: EventEmitter<boolean> = new EventEmitter<boolean>();
  public headerTitle: string = "MRP Drug Certificate";
  public dateToday: string = "";
  public openBrowserPrintWindow: boolean = false;
  public browserPrintContentObj: any;
  public closePopUpAfterStickerPrint: boolean = true;
  public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
  public loading: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private messageBoxService: MessageboxService
  ) {

  }

  ngOnInit() {
    this.dateToday = moment().format(ENUM_DateFormats.Year_Month_Day);
  }

  public CloseEchsMrpDrugCertificatePopUp(): void {
    this.showEchsMrpDrugCertificatePrintPage = false;
    this.hideEchsMrpDrugCertificatePrintPage.emit(true);
  }
  public Print(): void {
    this.loading = true;
    if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
      this.browserPrintContentObj = document.getElementById("id_echs-mrp-drug-certificate");
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
      this.CloseEchsMrpDrugCertificatePopUp();
    }
  }

}
