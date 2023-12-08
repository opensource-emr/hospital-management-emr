import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DietHistoryDTO } from '../../shared/dto/patient-diet-history.dto';
import { NursingBLService } from '../../shared/nursing.bl.service';

@Component({
    selector: 'diet-sheet-patient-history',
    templateUrl: './diet-sheet-patient-history.component.html'
})
export class DietSheetPatientHistoryComponent implements OnInit {
    public loading: boolean = true;
    public showPatientDietHistoryPage: boolean = false;
    @Input('selected-ipd') selectedIpd: any;

    @Output()
    public hidePatientDietHistoryPage: EventEmitter<boolean> = new EventEmitter<boolean>();
    public patientDietHistory: Array<DietHistoryDTO> = [];
    public isPatientDietHistoryFound: boolean = false;
    public showPatientDietHistory: boolean = false;

    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public browserPrintContentObj: any;
    public openBrowserPrintWindow: boolean = false;
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
    public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };

    ngOnChanges(changes: SimpleChanges) {
        if (changes.selectedIpd && this.selectedIpd) {
            this.GetPatientDietHistory();
        }
    }
    constructor(
        private nursingBLService: NursingBLService,
        private changeDetector: ChangeDetectorRef,
        private messageBoxService: MessageboxService,
        private coreService: CoreService
    ) {
        let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
        if (paramValue) {
            this.headerDetail = JSON.parse(paramValue);
        }
        this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();

    }

    ngOnInit() {
    }

    public CloseBillPatientDietHistoryPopUp() {
        this.showPatientDietHistoryPage = false;
        this.hidePatientDietHistoryPage.emit();
    }

    public GetPatientDietHistory() {
        this.nursingBLService.GetPatientDietHistory(this.selectedIpd.PatientVisitId).subscribe((res: DanpheHTTPResponse) => {
            if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                this.patientDietHistory = res.Results;
                this.showPatientDietHistoryPage = true;
                if (this.patientDietHistory) {
                    this.isPatientDietHistoryFound = true;
                }
            }
        })
    }

    public Print(): void {
        this.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("id_patient_diet_history");
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

    public GetInvoiceDisplaySettings() {
        var StrParam = this.coreService.Parameters.find((a) =>
            a.ParameterGroupName == "Billing" &&
            a.ParameterName == "InvoiceDisplaySettings"
        );
        if (StrParam && StrParam.ParameterValue) {
            let currParam = JSON.parse(StrParam.ParameterValue);
            return currParam;
        }
    }
}
