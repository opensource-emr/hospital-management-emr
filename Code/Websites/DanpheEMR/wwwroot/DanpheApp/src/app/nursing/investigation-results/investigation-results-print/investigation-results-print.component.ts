import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { PatientService } from '../../../patients/shared/patient.service';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from '../../../shared/shared-enums';

@Component({
    selector: 'investigation-results-print',
    templateUrl: './investigation-results-print.component.html'
})
export class InvestigationResultsPrintComponent {
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
    public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };
    public currentDate: Date;
    @Input('show-investigation-results-print-page')
    public showInvestigationResultsPrintPage: boolean = false;

    @Input('inner-html-data')
    public innerHtmlData: any = { innerHTML: '' };
    ;
    @Output()
    public hidePrintPage: EventEmitter<boolean> = new EventEmitter<boolean>();
    public loading: boolean = false;
    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public browserPrintContentObj: any;
    public openBrowserPrintWindow: boolean = false;
    constructor(
        private coreService: CoreService,
        private messageBoxService: MessageboxService,
        private changeDetector: ChangeDetectorRef,
        public PatService: PatientService,
    ) {
        let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
        if (paramValue) {
            this.headerDetail = JSON.parse(paramValue);
        }
        this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();
        this.currentDate = new Date;
    }
    ngAfterViewInit() {
        this.appendInnerHtmlToDiv();
    }
    ClosePopUp() {
        this.showInvestigationResultsPrintPage = false;
        this.hidePrintPage.emit();
    }
    Print(): void {
        this.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("id_investigation_results");
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

    appendInnerHtmlToDiv() {
        const div = document.getElementById('div-investigation-results');
        if (div) {
            div.innerHTML += this.innerHtmlData;
        }
    }
}
