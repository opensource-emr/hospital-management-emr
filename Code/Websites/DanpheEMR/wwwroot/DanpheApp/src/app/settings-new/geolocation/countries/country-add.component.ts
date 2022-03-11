import { Component, Output, Input, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Country } from '../../shared/country.model';
import { SettingsBLService } from '../../shared/settings.bl.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({
    selector: "country-add",
    templateUrl: "./country-add.html",
    host: { '(window:keyup)': 'hotkeys($event)' }
})

export class CountryAddComponent {
  
    public showAddPage: boolean = false;

    @Input("selectedCountry")
    public selectedCountry: Country;


    @Output("callback-Add") callbackAdd: EventEmitter<Object> = new EventEmitter<Object>(); 

    public completeCountryList: Array<Country> = new Array<Country>();
    public countryList: Array<Country> = new Array<Country>();
    public update: boolean = false; 

    public CurrentCountry:Country = new Country(); 

    constructor(public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef, public msgBoxServ: MessageboxService) {
        this.GetCountries();
    }

    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        this.FocusElementById('CountryName');
        if (this.selectedCountry) {
            this.update = true;
            this.CurrentCountry = Object.assign(this.CurrentCountry, this.selectedCountry);
            this.CurrentCountry.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.countryList = this.countryList.filter(country => (country.CountryId != this.selectedCountry.CountryId));
        }
        else {
            this.CurrentCountry = new Country();
            this.CurrentCountry.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }

    AddCountry() {
        for (var i in this.CurrentCountry.CountryValidator.controls) {
            this.CurrentCountry.CountryValidator.controls[i].markAsDirty();
            this.CurrentCountry.CountryValidator.controls[i].updateValueAndValidity();
            this.FocusElementById('CountryName');
        }

        if (this.CurrentCountry.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.AddCountry(this.CurrentCountry)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Country Added");
                        this.CurrentCountry = new Country();
                        this.CallBackAddCountry(res)
                    },
                    err => {
                        this.logError(err);
                        this.FocusElementById('CountryName');
                    });
        }
    }


    CallBackAddCountry(res) {
        if (res.Status == "OK") {
            this.callbackAdd.emit({ country: res.Results });
        }
        else {
            this.showMessageBox("error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }


    public GetCountries() {
        this.settingsBLService.GetCountries()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.countryList = res.Results;
                        this.completeCountryList = this.countryList;
                    }
                }
                else {
                    this.showMessageBox("error", "Check log for error message.");
                    this.logError(res.ErrorMessage);
                }
            },
                err => {
                    this.showMessageBox("error", "Failed to get Countries. Check log for error message.");
                    this.logError(err.ErrorMessage);
                });
    }

    Update() {
        //for checking validations, marking all the fields as dirty and checking the validity.
        for (var i in this.CurrentCountry.CountryValidator.controls) {
            this.CurrentCountry.CountryValidator.controls[i].markAsDirty();
            this.CurrentCountry.CountryValidator.controls[i].updateValueAndValidity();
            this.FocusElementById('CountryName');
        }

        if (this.CurrentCountry.IsValidCheck(undefined, undefined)) {
            this.settingsBLService.UpdateCountry(this.CurrentCountry)
                .subscribe(
                    res => {
                        this.showMessageBox("success", "Country Updated");
                        this.CurrentCountry = new Country();
                        this.CallBackAddCountry(res)

                    },
                    err => {
                        this.logError(err);
                        this.FocusElementById('CountryName');
                    });
        }
    }




    Close() {
        this.selectedCountry = null;
        this.update = false;
        this.countryList = this.completeCountryList;
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
