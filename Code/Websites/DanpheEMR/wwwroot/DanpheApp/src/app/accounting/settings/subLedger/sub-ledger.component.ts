import { Component } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import GridColumnSettings from "../../../shared/danphe-grid/grid-column-settings.constant";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from "../../../shared/shared-enums";
import { AccountingService } from '../../shared/accounting.service';
import { AccountingSettingsBLService } from "../shared/accounting-settings.bl.service";
import { LedgerModel } from "../shared/ledger.model";
import { ledgerGroupModel } from "../shared/ledgerGroup.model";
import { SubLedgerModel, SubLedgerVM } from "../shared/sub-ledger.model";

@Component({
    templateUrl: './sub-ledger.component.html'
})
export class SubLedgerComponent {

    public gridData: Array<SubLedgerVM> = new Array<SubLedgerVM>();
    public subLedgerList: Array<SubLedgerModel> = new Array<SubLedgerModel>();
    public GridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public subLedger: SubLedgerModel = new SubLedgerModel();
    public newSubLedgerList: Array<SubLedgerModel> = new Array<SubLedgerModel>();

    public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public ledgerGroup: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
    public selectedLedger: LedgerModel = new LedgerModel();
    public selectedLedgerGroup: ledgerGroupModel = new ledgerGroupModel();

    public showEditPage: boolean = false;

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public messabeBoxService: MessageboxService, public accountingService: AccountingService, public coreService: CoreService) {
        this.GridColumns = GridColumnSettings.subLedgerList;
        this.getConfigData();
        this.getSubLedger();
    }

    public ngOnInit() {

    }

    public getSubLedger() {
        this.coreService.loading = true;
        this.accountingSettingsBLService.GetSubLedger()
            .finally(() => { this.coreService.loading = false; })
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.gridData = this.subLedgerList = res.Results;
                    let ledgerlist = this.accountingService.accCacheData.LedgersALL;
                    this.gridData.forEach(data => {
                        let obj = ledgerlist.find(a => a.LedgerId === data.LedgerId);
                        if (obj) {
                            data.LedgerName = obj.LedgerName;
                        }
                    });
                }
                else {
                    this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to get subledger list."]);
                }
            },
                (err: DanpheHTTPResponse) => {
                    this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Unable to get subledger list. ${err.ErrorMessage}`])
                });
    }
    public getConfigData() {
        if (this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {
            this.ledgerList = this.accountingService.accCacheData.LedgersALL;
            this.ledgerGroup = this.accountingService.accCacheData.LedgerGroups;
        }
    }

    FilterLedgerList() {
        if (this.selectedLedgerGroup.LedgerGroupId > 0) {
            this.ledgerList = this.accountingService.accCacheData.LedgersALL;
            this.ledgerList = this.ledgerList.filter(a => a.LedgerGroupId == this.selectedLedgerGroup.LedgerGroupId)
        }
        else {
            this.ledgerList = this.accountingService.accCacheData.LedgersALL;
        }
        this.subLedger.LedgerId = 0;
    }

    GridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "edit": {
                this.showEditPage = true;
                this.subLedger = { ...$event.Data };
                if (this.subLedger.DrCr) {
                    this.subLedger.Dr = true;
                }
                else {
                    this.subLedger.Cr = true;
                }

                break;
            }
            case "activate/deactivate": {
                this.subLedger = { ...$event.Data };
                this.accountingSettingsBLService.ActivateDeactiveSubLedger(this.subLedger).subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.getSubLedger();
                    }
                });
            }
            default:
                break;
        }
    }
    AddSubLedgerPopup() {
        this.selectedLedger = new LedgerModel();
        this.subLedger = new SubLedgerModel();
        let subledger = new SubLedgerModel();
        this.newSubLedgerList = [];
        this.newSubLedgerList.push(subledger);
        this.showEditPage = false;
        this.selectedLedgerGroup = new ledgerGroupModel();
        this.FilterLedgerList();
        this.showAddPage = true;
        setTimeout(() => {
            let htmlObj = document.getElementById('SubLedgerName0');
            if (htmlObj) {
                htmlObj.focus();
            }
        }, 100);
    }
    public SaveSubLedger() {
        if (this.subLedger.LedgerId > 0) {
            this.newSubLedgerList.forEach(led => {
                led.LedgerId = this.subLedger.LedgerId;
            });
            let ledgerValidation = true;
            for (var ledger of this.newSubLedgerList) {
                for (var b in ledger.subLedgerValidator.controls) {
                    ledger.subLedgerValidator.controls[b].markAsDirty();
                    ledger.subLedgerValidator.controls[b].updateValueAndValidity();
                }
                if (ledger.IsValidCheck(undefined, undefined) || ledger.SubLedgerName === null || ledger.SubLedgerName.trim() === "") {
                    if (ledger.SubLedgerName && ledger.SubLedgerName.trim() === "") {
                        this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Invalid SubLedgerName."]);
                    }
                    ledgerValidation = false;
                    return;
                }
            };
            if (ledgerValidation) {
                this.accountingSettingsBLService.AddSubLedger(this.newSubLedgerList)
                    .subscribe(
                        (res: DanpheHTTPResponse) => {
                            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                                this.subLedger = new SubLedgerModel();
                                this.getSubLedger();
                                this.showAddPage = false;
                                this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Success, ["SubLedger successfully saved."]);
                            }
                            else {
                                this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to save subLedger."]);
                            }
                        },
                        (err: DanpheHTTPResponse) => {
                            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
                        });
            }
        }
        else {
            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please Select LedgerName"]);
        }
    }


    public UpdateSubLedger() {
        if (this.subLedger.LedgerId > 0 && this.subLedger.SubLedgerName) {
            this.accountingSettingsBLService.UpdateSubLedger(this.subLedger)
                .subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                            this.subLedger = new SubLedgerModel();
                            this.getSubLedger();
                            this.showEditPage = false;
                            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Success, ["SubLedger successfully Updated."]);
                        }
                        else {
                            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable to update subLedger."]);
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Error, [err.ErrorMessage]);
                    });
        }
        else {
            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Notice, ["Please supply all the mandatory fields."]);
        }
    }


    Close() {
        this.showAddPage = false;
        this.showEditPage = false;
    }

    public DrCrChange(event): void {
        if (event.target.name === "Dr") {
            if (event.target.checked) {
                this.subLedger.DrCr = true;
                this.subLedger.Cr = false;
            }
            else {
                this.subLedger.DrCr = false;
                this.subLedger.Cr = true;
            }
        }
        else if (event.target.name === "Cr") {
            if (event.target.checked) {
                this.subLedger.DrCr = false;
                this.subLedger.Dr = false;
            }
            else {
                this.subLedger.DrCr = true;
                this.subLedger.Dr = true;
            }
        }
    }

    public AddNewSubLedger() {
        this.newSubLedgerList.push(new SubLedgerModel());
    }

    public DeleteSubLedgerRow(index: number) {
        if (index === 0 && this.newSubLedgerList.length === 1) {
            this.newSubLedgerList[index] = new SubLedgerModel();
        }
        else {
            this.newSubLedgerList.splice(index, 1);
        }
    }

    public DrCrChangeNewSubLedger(event, index: number): void {
        if (event.target.name === "Dr") {
            if (event.target.checked) {
                this.newSubLedgerList[index].DrCr = true;
                this.newSubLedgerList[index].Cr = false;
            }
            else {
                this.newSubLedgerList[index].DrCr = false;
                this.newSubLedgerList[index].Cr = true;
            }
        }
        else if (event.target.name === "Cr") {
            if (event.target.checked) {
                this.newSubLedgerList[index].DrCr = false;
                this.newSubLedgerList[index].Dr = false;
            }
            else {
                this.newSubLedgerList[index].DrCr = true;
                this.newSubLedgerList[index].Dr = true;
            }
        }
    }

    public FocuseToNextInput(name: string, index: number): void {
        let htmlObj = document.getElementById(`${name}${index}`);
        if (htmlObj) {
            htmlObj.focus();
        }
    }

    public CreateNewRow(index: number) {
        this.AddNewSubLedger();
        setTimeout(() => {
            let htmlObj = document.getElementById(`SubLedgerName${index + 1}`);
            if (htmlObj) {
                htmlObj.focus();
            }
        }, 100);
    }

    public CheckDuplicateSubLedgerName(index: number): void {
        let filteredList = this.newSubLedgerList.filter(a => a.SubLedgerName.trim().toLowerCase() === this.newSubLedgerList[index].SubLedgerName.trim().toLowerCase());
        if (filteredList && filteredList.length > 1) {
            this.newSubLedgerList[index].SubLedgerName = ``;
            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`This SubLedgerName is already entered. Please supply unique name`]);
        }
        let existingSubLedger = this.subLedgerList.filter(a => a.SubLedgerName.toLowerCase() === this.newSubLedgerList[index].SubLedgerName.toLowerCase()
            && a.LedgerId === this.subLedger.LedgerId);
        if (existingSubLedger.length > 0) {
            this.newSubLedgerList[index].SubLedgerName = ``;
            this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`SubLedger with same name already exists for this Ledger. Please enter unique name.`]);
        }
    }

    public AssignSelectedLedger(): void {
        if (this.selectedLedger.LedgerId > 0) {
            this.subLedger.LedgerId = this.selectedLedger.LedgerId;
            let isSubLedgerexisits = false;
            this.newSubLedgerList.forEach((sub, index) => {
                let existingSubLedger = this.subLedgerList.filter(a => a.SubLedgerName.toLowerCase() === sub.SubLedgerName.toLowerCase() && a.LedgerId === this.subLedger.LedgerId);
                if (existingSubLedger.length > 0) {
                    this.newSubLedgerList[index].SubLedgerName = ``;
                    isSubLedgerexisits = true;
                }
            });
            if (isSubLedgerexisits) {
                this.messabeBoxService.showMessage(ENUM_MessageBox_Status.Warning, [`SubLedger with same name already exists for this Ledger. Please enter unique name.`]);
            }
        }
    }
}