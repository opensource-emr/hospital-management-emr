
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { VoucherModel } from '../shared/voucher.model';
import { VoucherHeadModel } from '../shared/voucherhead.model';
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';


@Component({
    selector: 'voucher-head-add',
    templateUrl: './voucher-head-add.html'



})
export class VoucherHeadAddComponent {

    public showAddPage: boolean = false;
    @Input("selectedVoucherHead")
    public selectedVoucherHead: VoucherHeadModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean;

    public CurrentVoucherhead: VoucherHeadModel;

    //public showmsgbox: boolean = false;
    //public status: string = null;
    //public message: string = null;
    public completevoucherList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
    public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {

    }
    ngOnInit() {
        this.update = false;
    }

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedVoucherHead) {
            this.update = false;
            this.changeDetector.detectChanges();
            this.update = true;
            this.voucherHeadList = new Array<VoucherHeadModel>();
            this.CurrentVoucherhead = Object.assign(this.CurrentVoucherhead, this.selectedVoucherHead);
            this.CurrentVoucherhead.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.voucherHeadList = this.voucherHeadList.filter(voucher => (voucher.VoucherHeadId != this.selectedVoucherHead.VoucherHeadId));
        }
        else {
            this.update = false;
            this.CurrentVoucherhead = new VoucherHeadModel();
            this.CurrentVoucherhead.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
       
        }
    }
    
    //adding new Voucher head
    AddVoucherHead() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVoucherhead.VoucherHeadValidator.controls) {
            this.CurrentVoucherhead.VoucherHeadValidator.controls[i].markAsDirty();
            this.CurrentVoucherhead.VoucherHeadValidator.controls[i].updateValueAndValidity();
        }


        if (this.CurrentVoucherhead.IsValidCheck(undefined, undefined)) {
            this.accountingSettingsBLService.AddVoucherHead(this.CurrentVoucherhead)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Voucher Head Added Succesfully!"]);
                        this.CurrentVoucherhead = new VoucherHeadModel();
                        this.CallBackAddVoucher(res);
                    } else {
                        this.msgBoxServ.showMessage("error", ["Duplicate Voucher Heads not allowed"]);
                    }
                },
                err => {
                    this.logError(err);
                });
        }
    }
    //adding new Vouchers
    UpdateVoucherHead() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVoucherhead.VoucherHeadValidator.controls) {
            this.CurrentVoucherhead.VoucherHeadValidator.controls[i].markAsDirty();
            this.CurrentVoucherhead.VoucherHeadValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentVoucherhead.IsValidCheck(undefined, undefined)) {
            this.CurrentVoucherhead.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.accountingSettingsBLService.UpdateVoucherHead(this.CurrentVoucherhead)
                .subscribe(
                res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Ledger Updated !"]);
                        this.CurrentVoucherhead = new VoucherHeadModel();
                        this.CallBackAddVoucher(res)
                        this.selectedVoucherHead = null;
                    }
                    else {
                        this.msgBoxServ.showMessage("error", ["error in update, please try again !"]);
              
                    }
                },
                err => {
                    this.logError(err);
                });
        }

    }

    Close() {
        this.selectedVoucherHead = null;
        this.update = false;
        this.voucherHeadList = this.completevoucherList;
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