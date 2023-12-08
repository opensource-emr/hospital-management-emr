import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { ENUM_PrintingType, PrinterSettingsModel } from '../../../settings-new/printers/printer-settings.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { DietSheetDTO } from '../../shared/dto/diet-sheet.dto';

@Component({
    selector: 'diet-sheet-print',
    templateUrl: './diet-sheet-print.component.html'
})
export class DietSheetPrintComponent implements OnInit {
    @Input('print-ipd-list')
    public ipdListView: Array<DietSheetDTO> = [];
    @Input('show-diet-sheet-print-page')
    public showDietSheetPrintPage: boolean = false;
    @Output()
    public hideDietSheetPrintPage: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input('ward-name')
    public wardName: string = "";
    public IsLocalDate: boolean = true;
    public selectedPrinter: PrinterSettingsModel = new PrinterSettingsModel();
    public browserPrintContentObj: any;
    public openBrowserPrintWindow: boolean = false;
    public loading: boolean = false;
    public currentDate: Date;
    SchemeWiseCount: { SchemeName: string, Count: number }[] = [];
    specifiedScheme: { SchemeName: string, Count: number }[] = [];
    columnData: string[] = [];
    public headerDetail: { CustomerName, Address, Email, CustomerRegLabel, CustomerRegNo, Tel };
    public InvoiceDisplaySettings: any = { ShowHeader: true, ShowQR: true, ShowHospLogo: true, ShowPriceCategory: false };


    constructor(
        private changeDetector: ChangeDetectorRef,
        private messageBoxService: MessageboxService,
        private coreService: CoreService


    ) {
        let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'BillingHeader').ParameterValue;
        if (paramValue) {
            this.headerDetail = JSON.parse(paramValue);
        }

        this.InvoiceDisplaySettings = this.coreService.GetInvoiceDisplaySettings();

        this.currentDate = new Date;

    }

    ngOnInit() {
        //group the patients with Scheme and count the number
        const counts = this.ipdListView.reduce((acc, ipd) => {
            const name = ipd.SchemeName;
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as { [name: string]: number });

        this.SchemeWiseCount = Object.keys(counts).map((name) => {
            return { SchemeName: name, Count: counts[name] };
        });
        // checking Scheme from Core CFG
        let paramValue = this.coreService.Parameters.find(a => a.ParameterName === 'DietSheetSchemeSettings').ParameterValue;
        const dataArray: string[] = paramValue.split(';');
        this.columnData = dataArray.map(value => value.trim());

        //filter on specified Scheme and their counted number 
        this.specifiedScheme = this.columnData.map(type => {
            const matchingItem = this.SchemeWiseCount.find(item => item.SchemeName === type);
            return {
                SchemeName: type,
                Count: matchingItem ? matchingItem.Count : 0
            };
        });
    }


    public ClosePrintDietSheetPopUp(): void {
        this.showDietSheetPrintPage = false;
        this.hideDietSheetPrintPage.emit();
    }

    public ChangeDateFormate(): void {
        this.IsLocalDate = !this.IsLocalDate
    }

    public Print(): void {
        this.loading = true;
        if (!this.selectedPrinter || this.selectedPrinter.PrintingType === ENUM_PrintingType.browser) {
            this.browserPrintContentObj = document.getElementById("id_diet_sheet");
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
