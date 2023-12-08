import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CoreService } from "../../../../core/shared/core.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_DrCr, ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { AccountingSettingsBLService } from "../../../settings/shared/accounting-settings.bl.service";
import { LedgerModel } from "../../../settings/shared/ledger.model";
import { SubLedgerForMakePayment } from "../DTOs/sub-ledger-for-payment.dto";

@Component({
    selector: 'subledger-add',
    templateUrl: './subledger-add.component.html'



})
export class SubLedgerAddComponent implements OnInit {


    @Input("show-add-page")
    public ShowAddPage: boolean = false;

    @Output("callback-add")
    CallbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    @Input("ledger-for-subledger")
    public LedgerForSubLedger: LedgerModel = new LedgerModel();
    public SelectedSubledger: SubLedgerForMakePayment = new SubLedgerForMakePayment();
    public Dr: boolean;
    public Cr: boolean;

    @Input("selected-supplier")
    public SelectedSupplier: any;

    @Input("phrm-section-flag")
    public PhrmSectionFlag = false;

    @Input("selected-vendor")
    public SelectedVendor: any;

    @Input("inv-section-flag")
    public InvSectionFlag = false;

    @Input("ledger-type")
    public LedgerType: string = "";
    constructor(public coreService: CoreService,
        public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBoxService: MessageboxService,) {
    }
    ngOnInit(): void {
        if (this.PhrmSectionFlag) {
            this.SelectedSubledger.SubLedgerName = this.SelectedSupplier.SupplierName;
            this.SelectedSubledger.ReferenceId = this.SelectedSupplier.SupplierId;
            this.SelectedSubledger.LedgerType = this.LedgerType;
        }
        else if (this.InvSectionFlag) {
            this.SelectedSubledger.SubLedgerName = this.SelectedVendor.VendorName;
            this.SelectedSubledger.ReferenceId = this.SelectedVendor.VendorId;
            this.SelectedSubledger.LedgerType = this.LedgerType;
        }
    }

    Close() {
        this.ShowAddPage = false;
        this.LedgerForSubLedger = new LedgerModel();
        this.CallbackAdd.emit({ action: "close" });
    }
    AddSubLedger() {
        this.SelectedSubledger.LedgerId = this.LedgerForSubLedger.LedgerId;
        if (this.SelectedSubledger.LedgerId && this.SelectedSubledger.SubLedgerName !== "") {

            const subLedgers = new Array<SubLedgerForMakePayment>();
            subLedgers.push(this.SelectedSubledger);

            this.accountingSettingsBLService.AddSubLedgers(subLedgers)
                .subscribe(
                    res => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            this.SelectedSubledger = new SubLedgerForMakePayment();
                            this.LedgerForSubLedger = new LedgerModel();
                            this.Close();
                            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ["SubLedger Added"]);
                        }
                        else {
                            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Cannot Add SubLedger"]);
                        }
                    },
                    err => {
                        this.logError(err);

                    });
        }
        else {
            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["SubLedger Name Cannot be empty"]);
        }

    }
    logError(err: any) {
        console.log(err);
    }
    ChangeOpeningBalType(e) {
        if (e.target.name === ENUM_ACC_DrCr.Dr) {
            if (e.target.checked) {
                this.SelectedSubledger.DrCr = true;
                this.Cr = false;
                this.Dr = true;
            }
        }
        if (e.target.name === ENUM_ACC_DrCr.Cr) {
            if (e.target.checked) {
                this.SelectedSubledger.DrCr = false;
                this.Dr = false;
                this.Cr = true;
            }
        }
    }
}
