import { Component, ChangeDetectorRef } from "@angular/core";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { AccountingLedgerVoucherMapViewModel } from '../shared/ledgergroup-voucherledgergroupmap-view.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { VoucherModel } from "../shared/voucher.model";
import { AccountingService } from "../../shared/accounting.service";

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
        public changeDetector: ChangeDetectorRef,
        public accountingService: AccountingService) {
        this.ledgerGroupGridColumns = GridColumnSettings.ledgerGroupList;
        this.getLedgerGroupList();
    }
    public getLedgerGroupList() {
            if(!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
                this.ledgerGroupList = this.accountingService.accCacheData.LedgerGroups;//mumbai-team-june2021-danphe-accounting-cache-change
                this.ledgerGroupList = this.ledgerGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
                this.showGrid = true;
                this.showLedgerGroupList = true;
            }
    }

    AddLedgerGroup() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
      this.getLedgerGroupList();//mumbai-team-june2021-danphe-accounting-cache-change
        this.showAddPage = false;
        this.selectedLedgerGroup = null;
        this.index = null;
    }
    LedgerGroupGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "activateDeactivateBasedOnStatus": {
                if ($event.Data != null) {
                    this.selectedLedgerGroup = null;
                    this.index = $event.RowIndex;//mumbai-team-june2021-danphe-accounting-cache-change
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
                    //this.index = $event.RowIndex;
                    this.selectedLedgerGroup = $event.Data;
                    this.changeDetector.detectChanges();
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
