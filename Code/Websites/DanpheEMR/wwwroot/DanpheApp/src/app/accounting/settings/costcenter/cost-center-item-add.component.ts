import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
//import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { CostCenterItemModel } from '../shared/cost-center-item.model';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: 'costcenter-item-add',
    templateUrl: './cost-center-item-add.html'
})
export class CostCenterItemAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedCostCenterItem")
    public selectedCostCenterItem: CostCenterItemModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    
    public CurrentCostCenterItem: CostCenterItemModel = new CostCenterItemModel();
    
    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
     }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedCostCenterItem) {
             this.CurrentCostCenterItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        else {
            this.CurrentCostCenterItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
    }

    
    /////adding new Ledger
    AddCostCenterItem() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCostCenterItem.CostCenterItemValidator.controls) {
            this.CurrentCostCenterItem.CostCenterItemValidator.controls[i].markAsDirty();
            this.CurrentCostCenterItem.CostCenterItemValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCostCenterItem.IsValidCheck(undefined, undefined)) {
            this.CurrentCostCenterItem.CreatedOn = moment().format("YYYY-MM-DD");
            this.accountingSettingsBLService.AddCostCenterItem(this.CurrentCostCenterItem)
                .subscribe(
                res => {
                    this.msgBoxServ.showMessage("success", ["Cost Center Item Added"]);
                    this.CurrentCostCenterItem
                    this.CallBackAddCostCenterItem(res);
                    this.CurrentCostCenterItem = new CostCenterItemModel();
                   
                },
                err => {
                    console.log(err);
                });
        }
    }


    Close() {
        this.selectedCostCenterItem = null;
        this.CurrentCostCenterItem = new CostCenterItemModel();
        this.showAddPage = false;
    }
    
    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddCostCenterItem(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ costCenterItem: res.Results });
        }
        else {
            this.msgBoxServ.showMessage("error", ["Check log for details"]);
            console.log(res);
        }
    }
    
}