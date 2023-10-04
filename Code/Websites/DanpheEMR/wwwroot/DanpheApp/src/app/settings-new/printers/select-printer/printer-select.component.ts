import { Component, Input, Output, Injector, ChangeDetectorRef, Inject } from "@angular/core";
import { EventEmitter, OnInit } from "@angular/core"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CoreService } from "../../../core/shared/core.service";
import { PrinterSettingsModel } from "../printer-settings.model";

@Component({
    selector: 'select-printer',
    templateUrl: './printer-select.html'
})
export class PrinterSelectComponent {

    @Input("group-name")
    public groupName = "bill-receipt";//available values: [bill-receipt,phrm-receipt,reg-sticker,lab-sticker]

    @Input("storage-key")
    public storageKeyName = "";//this is unique localstorage-keyname from different print page.

    @Output("on-printer-change")
    public onPrinterChanged: EventEmitter<any> = new EventEmitter<any>();
    public showPrinterChange: boolean = false;

    //get this from server api after settings page is made..
    public allPrinters: Array<PrinterSettingsModel> = [];//this will be loaded from CoreService via api..
    public printersArrByGroupName: Array<PrinterSettingsModel> = [];//show only printers after filtering the all source by group name.

    public selPrinterObj: PrinterSettingsModel = null;
    public printerSettId: number = 0;

    constructor(public msgBoxService: MessageboxService,
        public coreService: CoreService) {
    }

    ngOnInit() {
        this.allPrinters = this.coreService.AllPrinterSettings;//
        this.selPrinterObj = null;
        if (this.groupName) {
            this.printersArrByGroupName = this.allPrinters.filter(a => a.GroupName == this.groupName);
        }

        //our storage key name format is: "printer-<storagekeyname>" 
        //storage key name comes from individual page.
        let prntrInStorage = localStorage.getItem("printer-" + this.storageKeyName);
        if (prntrInStorage) {
            this.printerSettId = parseInt(prntrInStorage);
            this.selPrinterObj = this.allPrinters.find(p => p.PrinterSettingId == this.printerSettId);
        }
        else {
            this.showPrinterChange = true;
        }
        //we need to emit from here regardless of any printer selected or not..
        this.onPrinterChanged.emit(this.selPrinterObj);
    }



    public SaveSelectedPrinter() {
        if (this.printerSettId) {
            this.selPrinterObj = this.allPrinters.find(p => p.PrinterSettingId == this.printerSettId);
            //our storage key name format is: "printer-<storagekeyname>" 
            if (localStorage.getItem("printer-" + this.storageKeyName)) {
                localStorage.removeItem("printer-" + this.storageKeyName);
            }
            //save printerSettId in storage..
            localStorage.setItem("printer-" + this.storageKeyName, this.printerSettId ? this.printerSettId.toString() : "0");
            this.onPrinterChanged.emit(this.selPrinterObj);
            this.showPrinterChange = false;
        }
        else {
            this.msgBoxService.showMessage('error', ["Please select Printer."]);
        }
    }

    public ShowPrinterChange() {
        this.showPrinterChange = true;
    }
}