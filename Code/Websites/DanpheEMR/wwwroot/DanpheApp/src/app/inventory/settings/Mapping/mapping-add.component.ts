import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { CurrencyModel } from '../shared/currency.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'mapping-add',
    templateUrl: './mapping-add.html'

})
export class MappingAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedCurrency")
    public selectedCurrency: CurrencyModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentCurrency: CurrencyModel;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completecurrencylist: Array<CurrencyModel> = new Array<CurrencyModel>();
    public currencylist: Array<CurrencyModel> = new Array<CurrencyModel>();
   

    constructor(public invSettingBL: InventorySettingBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedCurrency) {
            this.update = true;
            this.CurrentCurrency = Object.assign(this.CurrentCurrency, this.selectedCurrency);
            this.CurrentCurrency.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.currencylist = this.currencylist.filter(currency => (currency.CurrencyID != this.selectedCurrency.CurrencyID));
        }
        else {
            this.CurrentCurrency = new CurrencyModel();
            this.CurrentCurrency.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }
  



    //adding new department
    AddCurrency() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCurrency.CurrencyValidator.controls) {
            this.CurrentCurrency.CurrencyValidator.controls[i].markAsDirty();
            this.CurrentCurrency.CurrencyValidator.controls[i].updateValueAndValidity();
        }


        if (this.CurrentCurrency.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.AddCurrency(this.CurrentCurrency)
                .subscribe(
                res => {
                    this.showMessageBox("success", "Currency Added");
                    this.CurrentCurrency = new CurrencyModel();
                    this.CallBackAddCurrency(res)
                },
                err => {
                    this.logError(err);
                });
        }
    }
    //adding new department
    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCurrency.CurrencyValidator.controls) {
            this.CurrentCurrency.CurrencyValidator.controls[i].markAsDirty();
            this.CurrentCurrency.CurrencyValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentCurrency.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.UpdateCurrency(this.CurrentCurrency)
                .subscribe(
                res => {
                    this.showMessageBox("success", "Currency Updated");
                    this.CurrentCurrency = new CurrencyModel();
                    this.CallBackAddCurrency(res)

                },
                err => {
                    this.logError(err);
                });
        }
    }

    Close() {
        this.selectedCurrency = null;
        this.update = false;
        this.currencylist = this.completecurrencylist;
        this.showAddPage = false;
    }

    //after adding currency is succesfully added  then this function is called.
    CallBackAddCurrency(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ currency: res.Results });



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



}
