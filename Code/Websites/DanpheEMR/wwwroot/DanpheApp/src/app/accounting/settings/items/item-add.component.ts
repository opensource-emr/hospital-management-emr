
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { ItemModel } from '../shared/item.model';
import { LedgerModel } from '../shared/ledger.model'
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { AccountingService } from "../../shared/accounting.service"


@Component({
    selector: 'item-add',
    templateUrl: './item-add.html'
 
 

})
export class ItemsAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedItem")
    public selectedItem: ItemModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentItem: ItemModel;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completeitemList: Array<ItemModel> = new Array<ItemModel>();
    public itemList: Array<ItemModel> = new Array<ItemModel>();
    public ledger: Array<LedgerModel> = null;
    public selLedger: any;
    constructor(public acctMstBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService,public accountingService: AccountingService) {
        this.GetLedger();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedItem) {
            this.update = true;
            this.CurrentItem = Object.assign(this.CurrentItem, this.selectedItem);
            this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.itemList = this.itemList.filter(item => (item.ItemId != this.selectedItem.ItemId));
        }
        else {
            this.CurrentItem = new ItemModel();
            this.CurrentItem.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }

    GetLedger() {
        if(!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length>0){//mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackLedger(this.accountingService.accCacheData.Ledgers);//mumbai-team-june2021-danphe-accounting-cache-change
          }

    }

    CallBackLedger(res) {
        this.ledger = res;//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledger = this.ledger.slice();//mumbai-team-june2021-danphe-accounting-cache-change

    }
    //adding new Item
    AddItem() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentItem.ItemValidator.controls) {
            this.CurrentItem.ItemValidator.controls[i].markAsDirty();
            this.CurrentItem.ItemValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentItem.checkSelectedItem)
        {
            this.msgBoxServ.showMessage("error", ['Provided Ledger Name is Not Available']);
        }
        else
        {
            if (this.CurrentItem.IsValidCheck(undefined, undefined)) {
                ////this.CurrentItem.LedgerId = this.CurrentItem.LedgerId[0].LedgerId;
                this.acctMstBLService.AddItems(this.CurrentItem)
                    .subscribe(
                    res => {
                        this.msgBoxServ.showMessage("success", ["Item Added"]);
                        this.CurrentItem = new ItemModel();
                        this.CallBackAddItem(res);
                        this.selLedger = null;

                    },
                    err => {
                        this.logError(err);
                    });
            }
        }
        
    }
  

    Close() {
        this.selectedItem = null;
        this.update = false;
        this.itemList = this.completeitemList;
        this.selLedger = null;
        this.showAddPage = false;
    }

    //after adding Item is succesfully added  then this function is called.
    CallBackAddItem(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ item: res.Results });
            ///this.selLedger.LedgerId = null;
        }
        else {
            this.msgBoxServ.showMessage("error", ["Check log for details"]);
            console.log(res.ErrorMessage);
        }
    }
    

    logError(err: any) {
        console.log(err);
    }

    public AssignSelectedLedger() {
        if (this.selLedger.LedgerId) {
            if ((this.selLedger.LedgerId != 0) && (this.selLedger.LedgerId != null)) {
                this.CurrentItem.LedgerId = this.selLedger.LedgerId;
            }
        }
    }
    LedgerListFormatter(data: any): string {
        return data["LedgerName"];
    }

    CheckProperSelectedItem(selItem) {
        try {
            /////Loop through ledgergroup and Check Ledger is Proper Or NOT
            for (var i = 0; i < this.ledger.length; i++) {
                if (this.ledger[i].LedgerId == selItem.LedgerId) {
                    this.CurrentItem.checkSelectedItem = false;
                    break;
                }
                else {
                    ////if LedgerGroupId is Undefined meanse Wrong Ledger Is Selected
                    if (selItem.LedgerId == undefined) {
                        this.CurrentItem.checkSelectedItem = true;
                        break;
                    }
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
}