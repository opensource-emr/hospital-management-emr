import { Component, ChangeDetectorRef } from "@angular/core";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { AccountingLedgerVoucherMapViewModel } from '../shared/ledgergroup-voucherledgergroupmap-view.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { VoucherModel } from "../shared/voucher.model";

@Component({
    selector: 'ledgergroup-list',
    templateUrl: './ledger-group-list.html',
})
export class LedgerGroupListComponent {
    public ledgerGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
    public tempLedgerGrpList: ledgerGroupModel = new ledgerGroupModel();
    public showLedgerGroupList: boolean = true;
    public ledgerGroupGridColumns: Array<any> = null;
    public showAddPage: boolean = false;
    public selectedLedgerGroup: ledgerGroupModel;
    public index: number;
    public showGrid: boolean = false;
    public showManageVouchers: boolean = false;
    public selectedLedgers: ledgerGroupModel = null;
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.ledgerGroupGridColumns = GridColumnSettings.ledgerGroupList;
        this.getLedgerGroupList();
    }
    public getLedgerGroupList() {
        this.accountingSettingsBLService.GetLedgerGroup()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ledgerGroupList = res.Results;
                    this.showGrid = true;
                    this.showLedgerGroupList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    AddLedgerGroup() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        let tempLed = $event.currentLedger;
        //this.tempLedgerGrpList = $event.currentLedger[0];
        this.ledgerGroupList.push(tempLed);
        if (this.index)
            this.ledgerGroupList.splice(this.index, 1);
        this.ledgerGroupList = this.ledgerGroupList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.selectedLedgerGroup = null;
        this.index = null;
    }
    LedgerGroupGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "activateDeactivateBasedOnStatus": {
                if ($event.Data != null) {
                    this.selectedLedgerGroup = null;
                    this.selectedLedgerGroup = $event.Data;
                    this.ActivateDeactivateLedgerStatus(this.selectedLedgerGroup);
                    this.showLedgerGroupList = true;
                    this.selectedLedgerGroup = null;
                    this.showGrid = true;
                }
                break;
            }
            case "edit": {
                if ($event.Data != null) {
                    this.selectedLedgerGroup = null;
                    this.showAddPage = false;
                    this.index = $event.RowIndex;
                    this.changeDetector.detectChanges();
                    this.selectedLedgerGroup = $event.Data;
                    this.showLedgerGroupList = true;
                    this.showAddPage = true;
                }
                break;
            }
            default:
                break;
        }
    }

    ActivateDeactivateLedgerStatus(selectedLedgerGrp: ledgerGroupModel) {
        if (selectedLedgerGrp != null) {
            let status = selectedLedgerGrp.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + selectedLedgerGrp.LedgerGroupName + ' ?')) {

                selectedLedgerGrp.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateLedgerGrpIsActive(selectedLedgerGrp)
                    .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                            this.msgBox.showMessage("success", [res.Results.LedgerGroupName + ' ' + responseMessage]);
                            //This for send to callbackadd function to update data in list
                            this.getLedgerGroupList();
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