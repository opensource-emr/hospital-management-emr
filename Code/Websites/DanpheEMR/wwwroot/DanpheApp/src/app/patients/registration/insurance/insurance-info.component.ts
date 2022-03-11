import { Component } from "@angular/core";
import * as moment from 'moment/moment';

import { InsuranceInfo } from "../../shared/insurance-info.model"
import { Patient } from "../../shared/patient.model"
import { PatientService } from '../../shared/patient.service';
import { IRouteGuard } from '../../../shared/route-guard.interface';

import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PatientsBLService } from "../../shared/patients.bl.service";
import { InsuranceProviderModel } from '../../shared/insurance-provider.model';
import { CoreService } from "../../../core/shared/core.service";

@Component({
  templateUrl: "./insurance-info.html"
})
export class InsuranceInfoComponent implements IRouteGuard {
    public editbutton: boolean = false;
    public currentInsurance: InsuranceInfo = new InsuranceInfo();
    public currentPatient: Patient = null;
    public insurances: Array<InsuranceInfo> = new Array<InsuranceInfo>();

    public IdCardTypes: Array<{ IdCardTypeId: number, IdCardTypeName: string }> = new Array<{ IdCardTypeId: number, IdCardTypeName: string }>();
  public insProviderList: Array<any> = [];

    public insProvider: InsuranceProviderModel = null;

    constructor(patientService: PatientService,
        public patientBlService: PatientsBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService
    ) {
        this.currentPatient = patientService.getGlobal();
        this.insurances = this.currentPatient.Insurances;
        this.SeedIdCardTypes();
        this.GetInsuranceProviderList();
        this.GoToNextInput("InputId");
    }

    SeedIdCardTypes() {
        //for client side dropdown
        this.IdCardTypes.push({ IdCardTypeId: 1, IdCardTypeName: 'Social Security Card' });
        this.IdCardTypes.push({ IdCardTypeId: 2, IdCardTypeName: 'Passport' });
        this.IdCardTypes.push({ IdCardTypeId: 3, IdCardTypeName: 'Driving License' });
        this.IdCardTypes.push({ IdCardTypeId: 4, IdCardTypeName: 'ID Card' });
    }

    GoToNextInput(id: string) {
        window.setTimeout(function () {
          let itmNameBox = document.getElementById(id);
          if (itmNameBox) {
            itmNameBox.focus();
          }
        }, 600);
      }
    public GetInsuranceProviderList() {
        this.patientBlService.GetInsuranceProviderList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.insProviderList = res.Results;

                        //to get and display the first list 
                        this.currentInsurance.InsuranceProviderId = this.insProviderList[0].InsuranceProviderId;
                    }
                    else {
                        this.msgBoxServ.showMessage('Failed', ["unable to get items for searchbox.. check logs for more details."]);
                        console.log(res.ErrorMessage);
                    }
                }
            });
    }

    // select the value from table
    public Edit(selectedAddress: InsuranceInfo) {
        this.editbutton = true;
        this.currentInsurance = Object.assign(this.currentInsurance, selectedAddress);
        if (this.currentInsurance.SubscriberDOB) {
            var selectedDateSubscriberDOB = moment(this.currentInsurance.SubscriberDOB).format('YYYY-MM-DD');
            this.currentInsurance.SubscriberDOB = selectedDateSubscriberDOB;
        }


    }
    // this update is done locally in table
    public Update() {

        for (var i in this.currentInsurance.InsuranceValidator.controls) {
            // this.insProvider.InsuranceProviderValidator.controls[i].markAsDirty();
            this.currentInsurance.InsuranceValidator.controls[i].markAsDirty();
            this.currentInsurance.InsuranceValidator.controls[i].updateValueAndValidity();
        }
        if (this.currentInsurance.IsValidCheck(undefined, undefined) == true) {
            for (let insurance of this.insurances) {
                if (insurance.InsuranceNumber == this.currentInsurance.InsuranceNumber) {
                    this.SetInsuranceProviderName();

                    insurance.InsuranceProviderName = this.currentInsurance.InsuranceProviderName;
                    insurance.InsuranceProviderId = this.currentInsurance.InsuranceProviderId;
                    insurance.InsuranceName = this.currentInsurance.InsuranceName;
                    insurance.CardNumber = this.currentInsurance.CardNumber;
                    insurance.SubscriberDOB = this.currentInsurance.SubscriberDOB;
                    insurance.SubscriberFirstName = this.currentInsurance.SubscriberFirstName;
                    insurance.SubscriberGender = this.currentInsurance.SubscriberGender;
                    insurance.SubscriberIDCardNumber = this.currentInsurance.SubscriberIDCardNumber;
                    insurance.SubscriberLastName = this.currentInsurance.SubscriberLastName;
                    insurance.SubscriberIDCardType = this.currentInsurance.SubscriberIDCardType;
                    insurance.IMISCode= this.currentInsurance.IMISCode;
                    insurance.CurrentBalance = this.currentInsurance.InitialBalance;
                    insurance.InitialBalance = this.currentInsurance.InitialBalance;
                    this.currentInsurance = new InsuranceInfo();
                    this.editbutton = false;
                }

            }
        }
    }

    public AddInsurance(insurance: InsuranceInfo) {
        // for loop is used to show validation message ..if required is field is not filled

        for (var i in this.currentInsurance.InsuranceValidator.controls) {
            //            this.insProvider.InsuranceProviderValidator.controls[i].markAsDirty();
            this.currentInsurance.InsuranceValidator.controls[i].markAsDirty();
            this.currentInsurance.InsuranceValidator.controls[i].updateValueAndValidity();
        }

        //if IsValid is true ...then only add in the grid

        if (this.currentInsurance.IsValidCheck(undefined, undefined) == true && this.CheckIfInsuranceAlreadyExists()) {
            this.SetInsuranceProviderName();
            this.currentInsurance.CurrentBalance = this.currentInsurance.InitialBalance;
            
            this.insurances.push(this.currentInsurance);
            this.currentInsurance = new InsuranceInfo();
        }
    }
    SetInsuranceProviderName() {
        this.currentInsurance.InsuranceProviderName = this.insProviderList.find(a => a.InsuranceProviderId == this.currentInsurance.InsuranceProviderId).InsuranceProviderName;
    }
    CheckIfInsuranceAlreadyExists() {
        for (let ins of this.insurances) {
            if (this.currentInsurance.InsuranceProviderId == ins.InsuranceProviderId) {
                this.msgBoxServ.showMessage('failed', ["Please edit existing Insurance. Insurance deatil already exist for" + ins.InsuranceProviderName]);
                return false;
            }
        }
        return true;
    }
    CanRouteLeave() {
        // if the IsValid is false  then..it will show the validation message to the end user using the for loop..
        if (this.currentInsurance.IsValidCheck(undefined, undefined) == false) {
            // for loop is used to show validation message 
            for (var i in this.currentInsurance.InsuranceValidator.controls) {
                this.currentInsurance.InsuranceValidator.controls[i].markAsDirty();
                this.currentInsurance.InsuranceValidator.controls[i].updateValueAndValidity();
            }
        }
        else {
            return true;
        }


    }


}
