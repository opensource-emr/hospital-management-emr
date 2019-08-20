import { Component, ChangeDetectorRef } from "@angular/core";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { ledgerGroupCategoryModel } from '../shared/ledger-group-category.model';
import { AccountingLedgerVoucherMapViewModel } from '../shared/ledgergroup-voucherledgergroupmap-view.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

@Component({
    selector: 'ledgergroup-category-list',
    templateUrl: './ledger-group-category-list.html',
})
export class LedgerGroupCategoryListComponent {
    public ledgerGroupCategoryList: Array<ledgerGroupCategoryModel> = new Array<ledgerGroupCategoryModel>();
    public tempLedgerGrpCategoryList: ledgerGroupCategoryModel = new ledgerGroupCategoryModel();
    public ledgerGroupCategoryGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedLedgerGroupCategory: ledgerGroupCategoryModel;
    public index: number;
    public showGrid: boolean = false;
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.ledgerGroupCategoryGridColumns = GridColumnSettings.ledgerGroupCategoryList;
        this.getLedgerGroupCategoryList();
    }
    public getLedgerGroupCategoryList() {
        this.accountingSettingsBLService.GetLedgerGrpCategory()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ledgerGroupCategoryList = res.Results;
                    this.showGrid = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    AddLedgerGroupCategory() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        this.tempLedgerGrpCategoryList = $event.currentLedgerGrpCategory[0];
        this.ledgerGroupCategoryList.push(this.tempLedgerGrpCategoryList);
        if (this.index)
            this.ledgerGroupCategoryList.splice(this.index, 1);
        this.ledgerGroupCategoryList = this.ledgerGroupCategoryList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedLedgerGroupCategory = null;
        this.index = null;
    }
    LedgerGroupCategoryGridActions($event: GridEmitModel) {

        switch ($event.Action) {
           case "activateDeactivateBasedOnStatus": {
                if ($event.Data != null) {
                    this.selectedLedgerGroupCategory = null;
                    this.selectedLedgerGroupCategory = $event.Data;
                    this.ActivateDeactivateLedgerGrpCategoryStatus(this.selectedLedgerGroupCategory);
                    this.selectedLedgerGroupCategory = null;
                    this.showGrid = true;
                }
                break;
            }
            default:
                break;
        }
    }

    ActivateDeactivateLedgerGrpCategoryStatus(selectedLedgerGrpCategory: ledgerGroupCategoryModel) {
        if (selectedLedgerGrpCategory != null) {
            let status = selectedLedgerGrpCategory.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + selectedLedgerGrpCategory.LedgerGroupCategoryName + ' ?')) {

                selectedLedgerGrpCategory.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateLedgerGrpCategoryIsActive(selectedLedgerGrpCategory)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                            this.msgBox.showMessage("success", [res.Results.LedgerGroupCategoryName + ' ' + responseMessage]);
                            //This for send to callbackadd function to update data in list
                            this.getLedgerGroupCategoryList();
                        }
                        else {
                            this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.logError(err);
                    });
            }

        }

    }
    logError(err: any) {
        console.log(err);
    }

}