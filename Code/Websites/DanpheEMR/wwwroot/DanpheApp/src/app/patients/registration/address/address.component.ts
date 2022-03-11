import { Component, OnInit } from "@angular/core";

import { PatientService } from '../../shared/patient.service';
import { IRouteGuard } from '../../../shared/route-guard.interface';
import { PatientsBLService } from '../../shared/patients.bl.service';

import { Address } from "../../shared/address.model"
import { Patient } from "../../shared/patient.model"
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheCache, MasterType } from "../../../shared/danphe-cache-service-utility/cache-services";


@Component({
  templateUrl: "./address.html"
})
export class AddressComponent implements IRouteGuard {
    // binding logic

    public editbutton: boolean = false;
    public addresses: Array<Address> = new Array<Address>();
    public currentPatient: Patient = null;
    //get defaddresstype from the parameters, remove the hardcode later.. 
    public defAddressType: string = "Temporary";
    public currentAddress: Address = new Address(this.defAddressType);
    // this used to disble the drop down of CountrySubDivision or district/state
    public disableTextBox: boolean = true;
    // to store the CountrySubDivision which we are getting in GetCountrySubDivision
    public CountrySubDivisionList: any;
    //declare boolean loading variable for disable the double click event of button
    loading: boolean = false;
    public Countries: Array<any> = null;
    constructor(_serv: PatientService, public patientBLService: PatientsBLService,  
        public msgBoxServ: MessageboxService
    ) {

        this.currentPatient = _serv.getGlobal();
        this.addresses = this.currentPatient.Addresses;
        //setting default country and state/district...according to the selction in the basic info page(according to santosh sir).
        this.currentAddress.CountryId = this.currentPatient.CountryId;
        this.currentAddress.CountrySubDivisionId = this.currentPatient.CountrySubDivisionId;
        this.GetCountry();
        this.GoToNextInput("inputId");

    }
    public Edit(selectedAddress: Address) {
        this.editbutton = true;
        this.currentAddress = Object.assign(this.currentAddress, selectedAddress);

    }
    public Update() {

      
     
        for (var i in this.currentAddress.AddressValidator.controls) {
            this.currentAddress.AddressValidator.controls[i].markAsDirty();
            this.currentAddress.AddressValidator.controls[i].updateValueAndValidity();
        }
        this.loading = true;
        if (this.currentAddress.IsValidCheck(undefined, undefined) == true) {
              //set the ddl values only if current model is valid. 
            this.SetDDLSelectedValues();
            for (let address of this.addresses) {
                if (address.AddressType == this.currentAddress.AddressType) {
                    address.City = this.currentAddress.City;
                    address.CountryId = this.currentAddress.CountryId;
                    address.CountrySubDivisionId = this.currentAddress.CountrySubDivisionId;

                    address.CountryName = this.currentAddress.CountryName;
                    address.CountrySubDivisionName = this.currentAddress.CountrySubDivisionName;
                    address.Street2 = this.currentAddress.Street2;
                    address.Street1 = this.currentAddress.Street1;
                    address.ZipCode = this.currentAddress.ZipCode;


                    this.currentAddress = new Address(this.defAddressType);

                    this.editbutton = false;

                }

            }
        }
    }

    public AddAddress(address: Address) {
        
        // for loop is used to show validation message ..if required  field is not filled
        for (var i in this.currentAddress.AddressValidator.controls) {
            this.currentAddress.AddressValidator.controls[i].markAsDirty();
            this.currentAddress.AddressValidator.controls[i].updateValueAndValidity();
        }

        this.loading = true;

        //if IsValid is true ...then only add in the grid
        if (this.currentAddress.IsValidCheck(undefined, undefined) == true) {
            //set the ddl values only if current model is valid. 
            this.SetDDLSelectedValues();
            //this condition take care that duplicate address type is not add in table/grid
            if (this.addresses != null && this.addresses.length != 0) {

                for (var a = 0; a < this.addresses.length; a++) {
                    if (this.addresses[a].AddressType == this.currentAddress.AddressType) {
                        this.msgBoxServ.showMessage("error", [this.currentAddress.AddressType +" Address is already added"]);
                        //alert(this.currentAddress.AddressType + " Address is already added");
                        return;
                    }
                }
                this.currentAddress.PatientId = this.currentPatient.PatientId;
                this.addresses.push(this.currentAddress);
                this.currentAddress = new Address(this.defAddressType);

            }
            else {
                this.addresses.push(this.currentAddress);
                this.currentAddress = new Address(this.defAddressType);
            }
        }


    }


    CanRouteLeave() {
        // if the IsValid is false  then..it will show the validation message to the end user using the for loop..
        if (this.currentAddress.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show validation message 
            for (var i in this.currentAddress.AddressValidator.controls) {
                this.currentAddress.AddressValidator.controls[i].markAsDirty();
                this.currentAddress.AddressValidator.controls[i].updateValueAndValidity();
            }
        }
        else {
            return true;
        }


    }

  
    // this is used to get data from master table according to the countryId
    GetDDLSelectedText(dropdownId: string): string {
        //we're typecasting to HTMLSelectElement and then HTMLScriptElement to get the dropdown value.
        let ddl = document.getElementById(dropdownId) as HTMLSelectElement;
        let selText = (ddl.options[ddl.selectedIndex]).text;
        return selText;
    }
    SetDDLSelectedValues() {
        let countryName = this.GetDDLSelectedText("ddlCountry");
        let CountrySubDivisionName = this.GetDDLSelectedText("ddlCountrySubDivision");
        this.currentAddress.CountrySubDivisionName = CountrySubDivisionName;
        this.currentAddress.CountryName = countryName;

    }
    GoToNextInput(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
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
    GetCountrySubDivision(currentAddress) {
        if (this.currentAddress.CountryId != 0) {
            this.disableTextBox = false;
        }
        var countryId = this.currentAddress.CountryId;
        this.patientBLService.GetCountrySubDivision(countryId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.CountrySubDivisionList = res.Results;
                } else {
                   // alert(res.ErrorMessage);
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    
                }
            },
            err => {
                this.msgBoxServ.showMessage("failed", ["failed get cities. please check log for details."]);
               // alert('failed get cities. please check log for details.');
               
            });


    }
   


}
