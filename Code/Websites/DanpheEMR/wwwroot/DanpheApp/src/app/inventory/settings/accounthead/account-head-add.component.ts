
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { AccountHeadModel } from '../shared/account-head.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'accounthead-add',
    templateUrl: './account-head-add.html',
    host: { '(window:keyup)': 'hotkeys($event)' }

})
export class AccountHeadAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedAccountHead")
    public selectedAccountHead: AccountHeadModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;
    public loading: boolean = false;

    public CurrentAccountHead: AccountHeadModel;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completeaccountheadlist: Array<AccountHeadModel> = new Array<AccountHeadModel>();
    public accountheadlist: Array<AccountHeadModel> = new Array<AccountHeadModel>();


    constructor(public invSettingBL: InventorySettingBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {

    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedAccountHead) {
            this.update = true;
            this.CurrentAccountHead = Object.assign(this.CurrentAccountHead, this.selectedAccountHead);
            this.CurrentAccountHead.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.accountheadlist = this.accountheadlist.filter(accounthead => (accounthead.AccountHeadId != this.selectedAccountHead.AccountHeadId));
        }
        else {
            this.CurrentAccountHead = new AccountHeadModel();
            this.CurrentAccountHead.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }




    //adding new department
    AddAccountHead(){
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentAccountHead.AccountHeadValidator.controls) {
            this.CurrentAccountHead.AccountHeadValidator.controls[i].markAsDirty();
            this.CurrentAccountHead.AccountHeadValidator.controls[i].updateValueAndValidity();
        }


        if (this.CurrentAccountHead.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.invSettingBL.AddAccountHead(this.CurrentAccountHead)
                .subscribe(
                res => {
                    this.showMessageBox("success", "AccountHead Added");
                    this.CurrentAccountHead = new AccountHeadModel();
                    this.CallBackAddAccountHead(res)
                    this.loading = false;
                },
                err => {
                    this.logError(err);
                    this.loading = false;
                    this.FocusElementById('AccountHeadName');
                });
        }
        this.FocusElementById('AccountHeadName');
    }
    //adding new department
    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentAccountHead.AccountHeadValidator.controls) {
            this.CurrentAccountHead.AccountHeadValidator.controls[i].markAsDirty();
            this.CurrentAccountHead.AccountHeadValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentAccountHead.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.invSettingBL.UpdateAccountHead(this.CurrentAccountHead)
                .subscribe(
                res => {
                    this.showMessageBox("success", "AccountHead List Updated");
                    this.CurrentAccountHead = new AccountHeadModel();
                    this.CallBackAddAccountHead(res)
                    this.loading = false;

                },
                err => {
                    this.logError(err);
                    this.loading = false;
                    this.FocusElementById('AccountHeadName');
                });
        }
        this.FocusElementById('AccountHeadName');
    }

    Close() {
        this.selectedAccountHead = null;
        this.update = false;
        this.accountheadlist = this.completeaccountheadlist;
        this.showAddPage = false;
    }

    //after adding Vendor is succesfully added  then this function is called.
    CallBackAddAccountHead(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ accounthead: res.Results });



        }
        else {
            this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    logError(err: any) {
        console.log(err);
    }
    FocusElementById(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
    hotkeys(event){
        if(event.keyCode==27){
            this.Close()
        }
    }


}
