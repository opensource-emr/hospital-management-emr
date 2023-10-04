
import { Component } from "@angular/core";
import { AccountingService } from "../../../../accounting/shared/accounting.service";
import { SubLedger_DTO } from "../../../../accounting/transactions/shared/DTOs/subledger-dto";
import { DanpheHTTPResponse } from "../../../../shared/common-models";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_DrCr, ENUM_DanpheHTTPResponses, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { BankReconciliationCategory } from "../../../bank-reconciliation/reconcile-bank-transactions/bank-reconciliation.model";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { LedgerModel } from "../../shared/ledger.model";

@Component({
    selector: 'bank-reconciliation-category-ledger-mapping',
    templateUrl: "./bank-reconciliation-category-mapping.html"
})

export class BankReconciliationCategoryLedgerMappingComponent {

    public loading: boolean = false;
    public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public isSelectAll: boolean = false;
    public bankReconciliationCategoryModeLedgerList: Array<BankReconciliationCategory> = new Array<BankReconciliationCategory>();
    public selectedLedger: Array<LedgerModel> = new Array<LedgerModel>();
    public selectedSubLedger: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public ledgerWiseSubLedger: Array<Array<SubLedger_DTO>> = new Array<Array<SubLedger_DTO>>();
    public subLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();




    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBoxServ: MessageboxService,
        public accountingService: AccountingService) {
        this.getLedgerList();
        this.getBankReconciliationCategory();
        this.GetSubLedgers();
    }
    UpdateBankReconciliation() {
        let selectedBankReconciliationData = this.bankReconciliationCategoryModeLedgerList.filter(a => a.IsSelected == true);
        let emptyCheck: boolean = false;

        for (let i = 0; i < selectedBankReconciliationData.length; i++) {
            if (selectedBankReconciliationData[i].MappedLedgerId === null || selectedBankReconciliationData[i].SubLedgerId === null) {
                emptyCheck = true;
                break;
            }
        }
        this.loading = true;
        if (selectedBankReconciliationData.length > 0) {
            if (emptyCheck) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ["Please select Ledger or Sub-Ledger from the list."]);
            } else {
                this.accountingSettingsBLService.UpdateBankReconciliationCategory(selectedBankReconciliationData).subscribe(
                    (res: DanpheHTTPResponse) => {
                        if (res.Status = ENUM_DanpheHTTPResponses.OK) {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Bank Reconciliation Category is successfully mapped to the ledger."]);
                        } else {
                            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ["Unable to map selected Ledger."]);
                        }
                    },
                    (err: DanpheHTTPResponse) => {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, [err.ErrorMessage]);
                    },
                    () => {
                        this.getBankReconciliationCategory();
                        this.loading = false;
                    }
                );
            }
        } else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Please select at least one category from the list."]);
        }
    }



    public getLedgerList() {
        if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {
            this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;
            this.sourceLedgerList = this.sourceLedgerList.slice();
        }
    }

    public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
        return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
    }
    GetSubLedgers() {
        this.subLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
    }

    LedgerListFormatter(data: any): string {
        return `${data["Code"]}-${data["LedgerName"]} | ${data["PrimaryGroup"]} -> ${data["LedgerGroupName"]}`;
    }

    AssignSelectedLedger(index) {
        if (typeof this.selectedLedger[index] === ENUM_Data_Type.Object) {
            this.bankReconciliationCategoryModeLedgerList[index].MappedLedgerId = this.selectedLedger[index].LedgerId;
            let filteredSubLedger = this.subLedgerMaster.filter(a => a.LedgerId === this.selectedLedger[index].LedgerId);
            this.ledgerWiseSubLedger[index] = filteredSubLedger;
        }
    }
    AssignSelectedSubLedger(index) {
        if (typeof this.selectedSubLedger[index] === ENUM_Data_Type.Object) {
            this.bankReconciliationCategoryModeLedgerList[index].SubLedgerId = this.selectedSubLedger[index].SubLedgerId;
            let ledger = this.sourceLedgerList.find(a => a.LedgerId === this.selectedSubLedger[index].LedgerId);
            if (ledger) {
                this.selectedLedger[index] = ledger;
                this.bankReconciliationCategoryModeLedgerList[index].MappedLedgerId = ledger.LedgerId;
            }
        }
    }
    SelectAllChkOnChange() {
        if (this.isSelectAll) {
            this.bankReconciliationCategoryModeLedgerList.every(a => a.IsSelected = true);
        }
        else {
            this.bankReconciliationCategoryModeLedgerList.forEach(a => a.IsSelected = false);
        }
    }



    getBankReconciliationCategory() {
        this.accountingSettingsBLService.GetBankReconciliationCategory()
            .subscribe((res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponses.OK) {
                    this.bankReconciliationCategoryModeLedgerList = new Array<BankReconciliationCategory>();
                    this.bankReconciliationCategoryModeLedgerList = res.Results;
                    this.bankReconciliationCategoryModeLedgerList = this.bankReconciliationCategoryModeLedgerList.map(obj => ({ ...obj, IsClearable: (obj.MappedLedgerId == null && obj.SubLedgerId == null) ? true : false }));

                    this.bankReconciliationCategoryModeLedgerList.forEach((a, index) => {
                        a.IsSelected = false;
                        this.selectedLedger[index] = this.sourceLedgerList.find(led => led.LedgerId === a.MappedLedgerId);
                        this.selectedSubLedger[index] = this.subLedgerMaster.find(subled => subled.SubLedgerId === a.SubLedgerId);
                        a.DrCr ? a.Dr = true : a.Cr = true;
                        this.ledgerWiseSubLedger[index] = this.subLedgerMaster;
                    });
                }
            });
    }

    public HandleDrCr(e, index: number) {
        if (e.target.name === ENUM_ACC_DrCr.Dr) {
            if (e.target.checked) {
                this.bankReconciliationCategoryModeLedgerList[index].DrCr = true;
                this.bankReconciliationCategoryModeLedgerList[index].Cr = false;
                this.bankReconciliationCategoryModeLedgerList[index].Dr = true;
            }
        }
        if (e.target.name === ENUM_ACC_DrCr.Cr) {
            if (e.target.checked) {
                this.bankReconciliationCategoryModeLedgerList[index].DrCr = false;
                this.bankReconciliationCategoryModeLedgerList[index].Dr = false;
                this.bankReconciliationCategoryModeLedgerList[index].Cr = true;
            }
        }
    }
    SingleCkboxChange(index) {
        var bankReconciliationCategoryModeLedgerList = this.bankReconciliationCategoryModeLedgerList[index];
        if (bankReconciliationCategoryModeLedgerList.IsClearable) {
            this.selectedLedger[index] = new LedgerModel();
            this.selectedSubLedger[index] = new SubLedger_DTO();
        }
        else {
            return;
        }

    }
}
