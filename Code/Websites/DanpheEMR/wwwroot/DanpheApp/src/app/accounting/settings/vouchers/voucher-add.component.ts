
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'voucher-add',
    templateUrl: './voucher-add.html'
 
 

})
export class VouchersAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedVoucher")
    public selectedVoucher: VoucherModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentVoucher: VoucherModel;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completevoucherList: Array<VoucherModel> = new Array<VoucherModel>();
    public voucherList: Array<VoucherModel> = new Array<VoucherModel>();

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
      
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedVoucher) {
            this.update = true;
            this.CurrentVoucher = Object.assign(this.CurrentVoucher, this.selectedVoucher);
            this.CurrentVoucher.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.voucherList = this.voucherList.filter(voucher => (voucher.VoucherId != this.selectedVoucher.VoucherId));
        }
        else {
            this.CurrentVoucher = new VoucherModel();
            this.CurrentVoucher.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }


    //adding new Voucher
    AddVoucher() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVoucher.VoucherValidator.controls) {
            this.CurrentVoucher.VoucherValidator.controls[i].markAsDirty();
            this.CurrentVoucher.VoucherValidator.controls[i].updateValueAndValidity();
        }

    
        if (this.CurrentVoucher.IsValidCheck(undefined, undefined)) {
            this.accountingSettingsBLService.AddVouchers(this.CurrentVoucher)
                .subscribe(
                res => {
                    this.showMessageBox("success", "Voucher Added");
                    this.CurrentVoucher = new VoucherModel();
                    this.CallBackAddVoucher(res)
                },
                err => {
                    this.logError(err);
                });
        }
    }
    //adding new Vouchers
    //Update() {
    //    //for checking validations, marking all the fields as dirty and checking the validity.
    //    for (var i in this.CurrentVoucher.VoucherValidator.controls) {
    //        this.CurrentVoucher.VoucherValidator.controls[i].markAsDirty();
    //        this.CurrentVoucher.VoucherValidator.controls[i].updateValueAndValidity();
    //    }

    //    if (this.CurrentVoucher.IsValidCheck(undefined, undefined)) {
    //        this.accountingSettingsBLService.UpdateVoucher(this.CurrentVoucher)
    //            .subscribe(
    //            res => {
    //                this.showMessageBox("success", "Voucher Updated");
    //                this.CurrentVoucher = new VoucherModel();
    //                this.CallBackAddVoucher(res)

    //            },
    //            err => {
    //                this.logError(err);
    //            });
    //    }
    //}

    Close() {
        this.selectedVoucher = null;
        this.update = false;
        this.voucherList = this.completevoucherList;
        this.showAddPage = false;
    }

    //after adding Voucher is succesfully added  then this function is called.
    CallBackAddVoucher(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ voucher: res.Results });         
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