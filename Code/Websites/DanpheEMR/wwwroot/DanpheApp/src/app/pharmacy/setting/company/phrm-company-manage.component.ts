import { Component, ChangeDetectorRef, Input, Output, EventEmitter, OnInit, Renderer2 } from "@angular/core";

import PHRMGridColumns from '../../shared/phrm-grid-columns';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PHRMCompanyModel } from "../../shared/phrm-company.model";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';

@Component({
    selector: "selectcompanytype-item-add",
    templateUrl: "./phrm-company-manage.html"

})
export class PHRMCompanyManageComponent implements OnInit {
    public CurrentCompany: PHRMCompanyModel = new PHRMCompanyModel();
    public selectedItem: PHRMCompanyModel = new PHRMCompanyModel();
    public companyList: Array<PHRMCompanyModel> = new Array<PHRMCompanyModel>();
    public companyGridColumns: Array<any> = null;
    public showCompanyList: boolean = true;
    public showCompanyAddPage: boolean = false;
    public update: boolean = false;
    public ESCAPE_KEYCODE = 27;//to close the window on click of ESCape.
    public index: number;
    @Input("selectcompany")
    public selectcompany: PHRMCompanyModel;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public globalListenFunc: Function;

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showCompanyAddPage = val;
        this.setFocusById('companyname');
    }

    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetector: ChangeDetectorRef,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService, public renderer2: Renderer2) {
        this.companyGridColumns = PHRMGridColumns.PHRMCompanyList;
        this.getCompanyList();
    }
    ngOnInit() {
        this.globalListenFunc = this.renderer2.listen('document', 'keydown', e => {
            if (e.keyCode == this.ESCAPE_KEYCODE) {
                this.Close()
            }
        });
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

    CompanyGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "edit": {
                this.selectedItem = null;
                this.update = true;
                this.index = $event.RowIndex;
                this.showCompanyAddPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = $event.Data;
                this.CurrentCompany.CompanyId = this.selectedItem.CompanyId;
                this.CurrentCompany.CompanyName = this.selectedItem.CompanyName;
                this.CurrentCompany.ContactNo = this.selectedItem.ContactNo;
                this.CurrentCompany.Description = this.selectedItem.Description;
                this.CurrentCompany.ContactAddress = this.selectedItem.ContactAddress;
                this.CurrentCompany.Email = this.selectedItem.Email;
                this.CurrentCompany.IsActive = this.selectedItem.IsActive;
                this.showCompanyAddPage = true;

                break;
            }
            case "activateDeactivateIsActive": {
                if ($event.Data != null) {
                    this.selectedItem = null;
                    this.selectedItem = $event.Data;
                    this.ActivateDeactivateStatus(this.selectedItem);
                    this.selectedItem = null;
                }
                break;
            }
            default:
                break;
        }
    }

    AddCompany() {
        this.showCompanyAddPage = false;
        this.changeDetector.detectChanges();
        this.showCompanyAddPage = true;
        this.setFocusById('companyname');
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

    Update() {
        for (var i in this.CurrentCompany.CompanyValidator.controls) {
            this.CurrentCompany.CompanyValidator.controls[i].markAsDirty();
            this.CurrentCompany.CompanyValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentCompany.IsValidCheck(undefined, undefined)) {
            this.pharmacyBLService.UpdateCompany(this.CurrentCompany)
                .subscribe(
                    res => {
                        if (res.Status == "OK") {
                            this.msgBoxServ.showMessage("success", ['Company Details Updated.']);
                            this.CallBackAddUpdate(res)
                            this.CurrentCompany = new PHRMCompanyModel();
                        }
                        else {
                            this.msgBoxServ.showMessage("failed", ["Something Wrong " + res.ErrorMessage]);
                        }
                    },
                    err => {
                        this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                    });
        }
    }

    CallBackAddUpdate(res) {
        if (res.Status == "OK") {
            var company: any = {};
            company.CompanyId = res.Results.CompanyId;
            company.CompanyName = res.Results.CompanyName;
            company.ContactNo = res.Results.ContactNo;
            company.Description = res.Results.Description;
            company.ContactAddress = res.Results.ContactAddress;
            company.Email = res.Results.Email;
            company.IsActive = res.Results.IsActive;
            this.AddUpdateResponseEmitter(company);
            this.getCompanyList();;
            this.CallBackAdd(company);
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
    ActivateDeactivateStatus(currCompany: PHRMCompanyModel) {
        if (currCompany != null) {
            let status = currCompany.IsActive == true ? false : true;
            let msg = status == true ? 'Activate' : 'Deactivate';
            if (confirm("Are you Sure want to " + msg + ' ' + currCompany.CompanyName + ' ?')) {
                currCompany.IsActive = status;
                this.pharmacyBLService.UpdateCompany(currCompany)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                let responseMessage = res.Results.IsActive ? "Company is now activated." : "Company is now Deactivated.";
                                this.msgBoxServ.showMessage("success", [responseMessage]);
                                this.getCompanyList();
                            }
                            else {
                                this.msgBoxServ.showMessage("error", ['Something wrong' + res.ErrorMessage]);
                            }
                        },
                        err => {
                            this.msgBoxServ.showMessage("error", ["Something Wrong " + err.ErrorMessage]);
                        });
            }
            //to refresh the checkbox if we cancel the prompt
            //this.getCompanyList();
        }
    }
    Close() {
        this.CurrentCompany = new PHRMCompanyModel();
        this.selectedItem = null;
        this.update = false;
        this.showCompanyAddPage = false;
    }

    AddUpdateResponseEmitter(company) {
        this.callbackAdd.emit({ company: company });
    }
    setFocusById(IdToBeFocused) {
        window.setTimeout(function () {
            document.getElementById(IdToBeFocused).focus();
        }, 20);
    }
}