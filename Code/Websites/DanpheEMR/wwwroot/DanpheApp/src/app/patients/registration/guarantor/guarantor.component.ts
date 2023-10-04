import { Component } from "@angular/core";
import { IRouteGuard } from '../../../shared/route-guard.interface';
import { PatientService } from '../../shared/patient.service';
import { PatientsBLService } from '../../shared/patients.bl.service';
import { Guarantor } from "../../shared/guarantor.model";
import { Patient } from "../../shared/patient.model";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheCache,MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";
@Component({
    templateUrl: "./guarantor.html"
})
export class GuarantorComponent implements IRouteGuard {
    // binding logic
    public currentGuarantor: Guarantor = null;
    public currentPatient: Patient = null;
    // this used to disble the drop down of CountrySubDivision or district/state
    public disableTextBox: boolean = true;
    // to store the CountrySubDivision which we are getting in GetCountrySubDivision
    public CountrySubDivisionList: any;
    public loading: boolean = false;
    public hasGuarantor: boolean = false;
    //this is not mapped guarantor
    public guarantor: Guarantor = new Guarantor();
    public showGuarantorPropertyField: boolean = false;
    public Countries: Array<any> = null;


    constructor(
        _serv: PatientService,
        public patientBLService: PatientsBLService,
        public msgBoxServ: MessageboxService) {
        this.GoToNextInput("InputId");
        this.currentPatient = _serv.getGlobal();
        this.currentGuarantor = this.currentPatient.Guarantor;

        //this is in constructor because we are getting data from patient service .... 
        //and while getting the data from service we have to fire this to get CountrySubDivisionName from master table..
        //otherwise the CountrySubDivisionName will not been shown in client side ... and this should be done before mapping the data
        this.GetCountrySubDivision(this.currentPatient.Guarantor)
        this.currentGuarantor.PatientId = this.currentPatient.PatientId;
        this.hasGuarantor = this.currentGuarantor.PatientGurantorInfo > 0 ? true : false;
        this.GetCountry();
    }

    ChangeForSelf(val): void {
        if (this.guarantor.GuarantorSelf == true) {
            // this if condition is because we want client should add the address first because we are getting some data from address also
            if (this.currentPatient.Addresses.length != 0) {
                this.guarantor.PatientRelationship = "Self";
                this.guarantor.GuarantorName = this.currentPatient.FirstName;
                this.guarantor.GuarantorDateOfBirth = this.currentPatient.DateOfBirth;
                this.guarantor.GuarantorCountryId = this.currentPatient.CountryId;
                this.guarantor.GuarantorCountrySubDivisionId = this.currentPatient.CountrySubDivisionId;
                this.guarantor.GuarantorGender = this.currentPatient.Gender;
                this.guarantor.GuarantorPhoneNumber = this.currentPatient.PhoneNumber;
                this.guarantor.GuarantorCity = this.currentPatient.Addresses[0].City;
                this.guarantor.GuarantorStreet1 = this.currentPatient.Addresses[0].Street1;
                this.guarantor.GuarantorStreet2 = this.currentPatient.Addresses[0].Street2;
                this.guarantor.GuarantorZIPCode = this.currentPatient.Addresses[0].ZipCode;
            }
            else {
                this.guarantor.GuarantorSelf = false;
                //alert("To fill the data by self checkbox first you have to fill your address")
                this.msgBoxServ.showMessage("notice-message", ["To fill the data by self checkbox, first you have to fill your address"]);
            }
        }
        else {
            this.guarantor = new Guarantor();
        }
    }

    GoToNextInput(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }

    CanRouteLeave() {
        // if the IsValid is false  then..it will show the validation message to the end user using the for loop..
        if (this.currentGuarantor.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show validation message 
            for (var i in this.currentGuarantor.GuarantorValidator.controls) {
                this.currentGuarantor.GuarantorValidator.controls[i].markAsDirty();
                this.currentGuarantor.GuarantorValidator.controls[i].updateValueAndValidity();
            }
        }
        else {
            return true;
        }
    }
    // this is used to get data from master table according to the countryId
    GetCountrySubDivision(guarantor) {
        if (this.guarantor.GuarantorCountryId != 0) {
            this.disableTextBox = false;
        }
        var countryId = this.guarantor.GuarantorCountryId;
        this.patientBLService.GetCountrySubDivision(countryId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.CountrySubDivisionList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["failed get cities. please check log for details."]);
            });
    }

    save() {
        for (var i in this.guarantor.GuarantorValidator.controls) {
            this.guarantor.GuarantorValidator.controls[i].markAsDirty();
            this.guarantor.GuarantorValidator.controls[i].updateValueAndValidity();
        }
        this.loading = false;
        if (this.guarantor.IsValidCheck(undefined, undefined) == true) {
            this.currentPatient.Guarantor = this.guarantor;
            this.currentGuarantor = this.guarantor;
            this.showGuarantorPropertyField = false;
            this.hasGuarantor = true;
        }
    }

    logError(err: any) {
        console.log(err);
    }


    showPropertyFileds(type) {
        if (type == "add") {
            this.guarantor = new Guarantor();
            this.showGuarantorPropertyField = true;
        }
        else if (type == "edit") {
            this.guarantor = new Guarantor();
            Object.assign(this.guarantor, this.currentPatient.Guarantor);
            this.showGuarantorPropertyField = true;
        }
    }
    GetCountry() {
		this.Countries = DanpheCache.GetData(MasterType.Country,null);
		
        // this.patientBLService.GetCountries()
            // .subscribe(res => {
                // if (res.Status == 'OK') {
                    // this.Countries = res.Results;
                // } else {
                    // this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

                // }
            // },
                // err => {
                    // this.msgBoxServ.showMessage("failed", ["failed get countries. please check log for details."]);

                // });
    }
}
