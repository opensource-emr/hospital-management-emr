
import { ChangeDetectorRef, Component } from "@angular/core";

import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { LedgerModel } from '../shared/ledger.model';

import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingService } from "../../shared/accounting.service";

@Component({
  selector: 'ledger-list',
  templateUrl: './ledger-list.html',
})
export class LedgerListComponent {
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public showLedgerList: boolean = true;
  public ledgerGridColumns: Array<any> = null;

  public showAddPage: boolean = false;
  public showEditPage: boolean = false;
  public selectedLedger: LedgerModel;
  public index: number;

  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public msgBox: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public accountingService: AccountingService) {
    this.ledgerGridColumns = GridColumnSettings.ledgerList;
    this.getLedgerList();
  }
  public getLedgerList() {
    if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
      this.ledgerList = this.ledgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
      this.showLedgerList = true;
    }
  }

  AddLedger() {
    this.index = null;
    this.showAddPage = false;
    this.changeDetector.detectChanges();
    this.showEditPage = false;
    this.changeDetector.detectChanges();
    this.showAddPage = true;
  }

  CallBackAdd($event) {
    let tempLed = $event.ledger;
    this.changeDetector.detectChanges();
    this.getLedgerList();
    this.UpdateLedgers();
    this.showAddPage = false;
    this.showEditPage = false;
    this.changeDetector.detectChanges();
    this.selectedLedger = null;
    this.index = null;

  }
  LedgerGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "activateDeactivateBasedOnStatus": {
        this.selectedLedger = null;
        this.index = $event.RowIndex;
        this.selectedLedger = $event.Data;
        this.ActivateDeactivateLedgerStatus(this.selectedLedger, this.index)
        this.showLedgerList = true;
        this.selectedLedger = null;
        break;
      }
      case "edit": {
        this.selectedLedger = null;
        this.showAddPage = false;
        this.showEditPage = false;
        this.index = $event.RowIndex;
        this.changeDetector.detectChanges();
        this.selectedLedger = $event.Data;
        this.changeDetector.detectChanges();//mumbai-team-june2021-danphe-accounting-cache-change
        this.showLedgerList = true;
        this.showEditPage = true;
        this.changeDetector.detectChanges();//mumbai-team-june2021-danphe-accounting-cache-change
        break;
      }
      default:
        break;
    }
  }

  ActivateDeactivateLedgerStatus(selectedLedger: LedgerModel, index: number) {
    if (selectedLedger != null) {
      let status = selectedLedger.IsActive == true ? false : true;
      let msg = status == true ? 'Activate' : 'Deactivate';
      if (confirm("Are you Sure want to " + msg + ' ' + selectedLedger.LedgerName + ' ?')) {

        selectedLedger.IsActive = status;
        //we want to update the ISActive property in table there for this call is necessry
        this.accountingSettingsBLService.UpdateLedgerStatus(selectedLedger)
          .subscribe(
            res => {
              if (res.Status == "OK") {
                let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                this.msgBox.showMessage("success", [res.Results.LedgerName + ' ' + responseMessage]);
                //This for send to callbackadd function to update data in list


                this.getLedgerList();
                this.UpdateLedgers();

                //Ledger list refresh problem after the activation or deactivation of the Ledger is solved by following code
                this.ledgerList[index].IsActive = res.Results.IsActive;
                this.ledgerList.slice();
                this.changeDetector.detectChanges();
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
  // we are using ledgersAll in cache for setting ledger-list page 
  //From this page we can update or add new ledger so we need to update Ledgers list in cache
  //this method will update Ledgers in cache object
  public UpdateLedgers() {
    try {
      DanpheCache.clearDanpheCacheByType(MasterType.Ledgers);
      DanpheCache.clearDanpheCacheByType(MasterType.LedgersAll);
      this.accountingService.RefreshAccCacheData();
    }
    catch (ex) {
      console.log(ex);
    }
  }

}
