
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { VendorsModel } from '../shared/vendors.model';
import { InventorySettingBLService } from "../shared/inventory-settings.bl.service";

import { SecurityService } from '../../../security/shared/security.service';
//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: 'vendor-add',
    templateUrl: './vendor-add.html'

})
export class VendorsAddComponent {
    public showAddPage: boolean = false;
    @Input("selectedVendor")
    public selectedVendor: VendorsModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public update: boolean = false;

    public CurrentVendor: VendorsModel;
    public completevendorsList: Array<VendorsModel> = new Array<VendorsModel>();
    public vendorList: Array<VendorsModel> = new Array<VendorsModel>();
    public GetCurrencyCodeList: Array<VendorsModel> = new Array<VendorsModel>();
    public showAddCurrencyCodePopUp: boolean = false;

    constructor(public invSettingBL: InventorySettingBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        //this.GetVendors();
        this.GetCurrencyCode();
    }
  @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        if (this.selectedVendor) {
            this.update = true;
            this.CurrentVendor = Object.assign(this.CurrentVendor, this.selectedVendor);
            this.CurrentVendor.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.vendorList = this.vendorList.filter(vendor => (vendor.VendorId != this.selectedVendor.VendorId));
        }
        else {
            this.CurrentVendor = new VendorsModel();
            this.CurrentVendor.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }
    GetCurrencyCode() {

        this.invSettingBL.GetCurrencyCode()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.GetCurrencyCodeList = res.Results;
                    //this.CurrentVendor.DefaultCurrencyId = 1;
                } else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }

            });
                }

    //adding new department
    AddVendor() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVendor.VendorsValidator.controls) {
            this.CurrentVendor.VendorsValidator.controls[i].markAsDirty();
            this.CurrentVendor.VendorsValidator.controls[i].updateValueAndValidity();
        }

    
        if (this.CurrentVendor.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.AddVendor(this.CurrentVendor)
                .subscribe(
                res => {
                    this.showMessageBox("success", "Vendor Added");
                    this.CurrentVendor = new VendorsModel();
                    this.CallBackAddVendor(res)
                },
                err => {
                    this.logError(err);
                });
        }
    }
    //adding new department
    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentVendor.VendorsValidator.controls) {
            this.CurrentVendor.VendorsValidator.controls[i].markAsDirty();
            this.CurrentVendor.VendorsValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentVendor.IsValidCheck(undefined, undefined)) {
            this.invSettingBL.UpdateVendor(this.CurrentVendor)
                .subscribe(
                res => {
                    this.showMessageBox("success", "Vendor Updated");
                    this.CurrentVendor = new VendorsModel();
                    this.CallBackAddVendor(res)

                },
                err => {
                    this.logError(err);
                });
        }
    }

    Close() {
        this.selectedVendor = null;
        this.update = false;
        this.vendorList = this.completevendorsList;
        this.showAddPage = false;
    }

    //after adding Vendor is succesfully added  then this function is called.
    CallBackAddVendor(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ vendor: res.Results });
           
            
                
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

    AddCurrencyCodePopUp(){
      this.showAddCurrencyCodePopUp = false;
      this.changeDetector.detectChanges();
      this.showAddCurrencyCodePopUp = true;
    }
    OnNewCurrencyCodeAdded($event){
      this.showAddCurrencyCodePopUp = false;
      var CurrencyCode = $event.currency;
      this.GetCurrencyCodeList.push(CurrencyCode);
      this.GetCurrencyCodeList.slice();
    }
}
