import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';

@Component({
    selector: "company-add",
    templateUrl: "./company-add.html"

})
export class PHRMCompanyAddComponent {
    @Output("callback-com-add")
    callbackcompAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public CurrentCompany: PHRMCompanyModel = new PHRMCompanyModel();
    public selectedItem: PHRMCompanyModel = new PHRMCompanyModel();
    public companyList: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
    public showCompanyList: boolean = true;
    public showCompanyAddPage: boolean = false;
    public showComAddPage: boolean = false;
    public update: boolean = false;
    public index: number;

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
        this.getCompanyList();
    }

    public getCompanyList() {
        this.pharmacyBLService.GetCompanyList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.companyList = res.Results;
                }
                else {
                    alert("Failed ! " + res.ErrorMessage);
                    console.log(res.ErrorMessage)
                }
            });
    }


    AddCompany() {
        this.showCompanyAddPage = false;
        this.changeDetector.detectChanges();
        this.showCompanyAddPage = true;
    }

    Add() {
        for (var i in this.CurrentCompany.CompanyValidator.controls) {
            this.CurrentCompany.CompanyValidator.controls[i].markAsDirty();
            this.CurrentCompany.CompanyValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCompany.IsValidCheck(undefined, undefined)) {
            this.CurrentCompany.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.pharmacyBLService.AddCompany(this.CurrentCompany)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ["Company Added."]);
                            this.CallBackAddUpdate(res)
                            this.CurrentCompany = new PHRMCompanyModel();
                            this.showComAddPage = false;
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Something Wrong" + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong" + err.ErrorMessage]);
                    });
        }
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            //var company: any = {};
            //company.CompanyId = res.Results.CompanyId;
            //company.CompanyName = res.Results.CompanyName;
            //company.ContactNo = res.Results.ContactNo;
            //company.Description = res.Results.Description;
            //company.ContactAddress = res.Results.ContactAddress;
            //company.Email = res.Results.Email;
            //company.IsActive = res.Results.IsActive;
            //this.CallBackAdd(company);
            this.callbackcompAdd.emit({ compny: res.Results });
        }
        else {
            this.msgBoxServ.showMessage("error", ['some error ' + res.ErrorMessage]);
        }
    }

    CallBackAdd(compny: PHRMCompanyModel) {
        this.companyList.push(compny);
        if (this.index != null)
            this.companyList.splice(this.index, 1);
        this.companyList = this.companyList.slice();
        this.changeDetector.detectChanges();
        this.showCompanyAddPage = false;
        this.selectedItem = null;
        this.index = null;
    }
    @Input("showComAddPage")
    public set value(val: boolean) {
        this.showComAddPage = val;

        this.CurrentCompany = new PHRMCompanyModel();
        this.CurrentCompany.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.update = false;
    }
    Close() {
        this.CurrentCompany = new PHRMCompanyModel();
        this.selectedItem = null;
        this.update = false;
        this.showComAddPage = false;
    }
}