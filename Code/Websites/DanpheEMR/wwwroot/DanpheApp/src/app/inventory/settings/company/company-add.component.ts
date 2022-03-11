import { Component, Input, Output, EventEmitter } from "@angular/core";

//Parse, validate, manipulate, and display dates and times in JS.
import * as moment from 'moment/moment';
import { CompanyService } from "../shared/company/company.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { SecurityService } from "../../../security/shared/security.service";
import { CompanyModel } from "../shared/company/company.model";


@Component({
    selector: "company-add",
    templateUrl: "./company-add.html",
    host: { '(window:keyup)': 'hotkeys($event)' }
})
export class CompanyAddComponent {

    @Input("selected-company")
    public CurrentCompany: CompanyModel;
    public showAddPage: boolean = false;
    public loading: boolean = false;

    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public companyService: CompanyService, public securityService: SecurityService,
        public msgBoxServ: MessageboxService) {
    }

    @Input('showAddPage')
    public set ShowAdd(_showAdd) {
        this.showAddPage = _showAdd;
        if (this.showAddPage) {
            if (this.CurrentCompany && this.CurrentCompany.CompanyId) {
                let Company = new CompanyModel();
                this.CurrentCompany = Object.assign(Company, this.CurrentCompany);
            }
            else {
                this.CurrentCompany = new CompanyModel();
            }
        }

    }

    //adding new Company
    AddCompany() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCompany.CompanyValidator.controls) {
            this.CurrentCompany.CompanyValidator.controls[i].markAsDirty();
            this.CurrentCompany.CompanyValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentCompany.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.companyService.AddCompany(this.CurrentCompany)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Company Added");
                        this.CurrentCompany = new CompanyModel();
                        this.callbackAdd.emit({ 'newCompany': res.Results });
                        this.loading = false;
                    },
                    err => {
                        this.logError(err);
                        this.loading = false;
                        this.FocusElementById('CompanyName');
                    });
        }
        this.FocusElementById('CompanyName');
    }

    //updating Company
    UpdateCompany() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCompany.CompanyValidator.controls) {
            this.CurrentCompany.CompanyValidator.controls[i].markAsDirty();
            this.CurrentCompany.CompanyValidator.controls[i].updateValueAndValidity();
        }

        if (this.CurrentCompany.IsValidCheck(undefined, undefined)) {
            this.loading = true;
            this.companyService.UpdateCompany(this.CurrentCompany.CompanyId, this.CurrentCompany)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Company Updated");
                        this.showAddPage = false;
                        //this.CurrentCompany = new PhrmCompanyModel();
                        this.callbackAdd.emit({ 'newCompany': res.Results });
                        this.loading = false;
                    },
                    err => {
                        this.logError(err);
                        this.loading = false;
                        this.FocusElementById('CompanyName');
                    });
        }
        this.FocusElementById('CompanyName');
    }

    Close() {
        this.callbackAdd.emit();
        this.showAddPage = false;
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