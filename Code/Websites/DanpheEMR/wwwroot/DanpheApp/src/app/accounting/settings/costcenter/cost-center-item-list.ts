import { Component, ChangeDetectorRef } from "@angular/core";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { CostCenterItemModel } from '../shared/cost-center-item.model';

@Component({
    selector: 'costcenter-item-list',
    templateUrl: './cost-center-item-list.html',
})
export class CostCenterItemListComponent {
    public costCenterItemsList: Array<CostCenterItemModel> = new Array<CostCenterItemModel>();
    public showCostCenterItemList: boolean = true;
    public costCenterItemsGridColumns: Array<any> = null;

    public showAddPage: boolean = false;
    public selectedCostCenterItem: CostCenterItemModel;
    public index: number;

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public msgBox: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.costCenterItemsGridColumns = GridColumnSettings.CostCenterItemsList;
        this.getCostCenterItemsList();
    }
    public getCostCenterItemsList() {
        this.accountingSettingsBLService.GetCostCenterItemList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.costCenterItemsList = res.Results;
                    this.showCostCenterItemList = true;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                }

            });
    }

    AddCostCenterItems() {
        this.showAddPage = false;
        this.changeDetector.detectChanges();
        this.showAddPage = true;
    }

    CallBackAdd($event) {
        let curtFiscalLen = $event.costCenterItem;//mumbai-team-june2021-danphe-accounting-cache-change
        this.costCenterItemsList.push(curtFiscalLen);
        if (this.index)
            this.costCenterItemsList.splice(this.index, 1);
        this.costCenterItemsList = this.costCenterItemsList.slice();
        this.changeDetector.detectChanges();
        this.showAddPage = false;
        this.index = null;
    }
    CostCenterItemGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "activateDeactivateBasedOnStatus": {
                this.selectedCostCenterItem = null;
                this.index = $event.RowIndex;
                this.selectedCostCenterItem = $event.Data;
                this.DeactivateFiscalYearStatus(this.selectedCostCenterItem)
                this.showCostCenterItemList = true;
            }
            default:
                break;
        }
    }

    DeactivateFiscalYearStatus(selecttedCostCenterItm: CostCenterItemModel) {
        if (selecttedCostCenterItm != null) {
            let status = selecttedCostCenterItm.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'De-Activate';
            if (confirm("Are you Sure want to " + msg + ' ' + selecttedCostCenterItm.CostCenterItemName + ' ?')) {

                selecttedCostCenterItm.IsActive = status;
                //we want to update the ISActive property in table there for this call is necessry
                this.accountingSettingsBLService.UpdateCostCenterItemStatus(selecttedCostCenterItm)
                    .subscribe(
                        
                    res => {
                        if (res.Status == "OK") {
                            let responseMessage = res.Results.IsActive ? "is now activated." : "is now Deactivated.";
                            this.msgBox.showMessage("success", [res.Results.CostCenterItemName + ' ' + responseMessage]);
                            //This for send to callbackadd function to update data in list
                            this.getCostCenterItemsList();
                        }
                        else {
                            this.msgBox.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                        }
                    },
                    err => {
                        console.log(err);
                    });
            }

        }

    }
    

}