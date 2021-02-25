import { Component, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { SecurityService } from '../../security/shared/security.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PatientService } from "../../patients/shared/patient.service";
import { PHRMPrescription } from "../shared/phrm-prescription.model";
import { PHRMPrescriptionItem } from "../shared/phrm-prescription-item.model";
import { PHRMItemTypeModel } from "../shared/phrm-item-type.model";
import { PHRMItemMasterModel } from "../shared/phrm-item-master.model"

@Component({
    templateUrl: "./phrm-prescription.html"
})
export class PHRMPrescriptionComponent {
    //constructor of clas
    constructor(
        public pharmacyBLService: PharmacyBLService,
        public changeDetectorRef: ChangeDetectorRef,
        public router: Router,
        public patientService: PatientService,
        public securityService: SecurityService,
        public messageboxService: MessageboxService) {
        this.CheckPatientDetails();
        this.GenerateDoctorList();
        this.AddRowRequest(0);
        this.LoadItemTypeList();
    }

    //Variable declaration is here
    public name: string = null;
    public loading: boolean = false;
    public IsWrongProvider: boolean = false;
    public selProvider: any;
    public currPrescription: PHRMPrescription = new PHRMPrescription();
    public currPrescriptionItems: Array<PHRMPrescriptionItem> = new Array<PHRMPrescriptionItem>();
    public ItemTypeList: Array<PHRMItemTypeModel> = new Array<PHRMItemTypeModel>();
    public doctorList: any;
    public itemTypeMapItemListData = new Array<{ ItemTypeId: number, ItemList: Array<PHRMItemMasterModel> }>();

    //Get all doctor name list
    GenerateDoctorList(): void {
        //erases previously selected doctor and clears respective schedule list
        this.selProvider = null;
        this.pharmacyBLService.GetDoctorList()
            .subscribe(res => this.CallBackGenerateDoctor(res));
    }
    //this is a success callback of GenerateDoctorList function.
    CallBackGenerateDoctor(res) {
        if (res.Status == "OK") {
            this.doctorList = [];
            //format return list into Key:Value form, since it searches also by the property name of json.
            if (res && res.Results) {
                res.Results.forEach(a => {
                    this.doctorList.push({
                        "Key": a.EmployeeId, "Value": a.FullName
                    });
                });
            }
        }
        else {
            this.messageboxService.showMessage("failed", [res.ErrorMessage]);
        }
    }
    //GET: to load the itemType in the start
    LoadItemTypeList(): void {
        this.pharmacyBLService.GetItemTypeList()
            .subscribe(res => this.CallBackGetItemTypeList(res));
    }
    CallBackGetItemTypeList(res) {
        if (res.Status == 'OK') {
            if (res.Results) {
                this.ItemTypeList = new Array<PHRMItemTypeModel>();
                this.ItemTypeList = res.Results;
                ///displaying only those ItemTypeList in Dropdown whose Status is Active Now. 
                this.ItemTypeList = this.ItemTypeList.filter(itmtype => itmtype.IsActive == true);
            }
        }
        else {
            err => {
                this.messageboxService.showMessage("failed", ['failed to get ItemTypeList..']);
            }
        }
    }

    ////GET: this is ngModelChange based function on ItemTypeList to Load Item Based on Item Type
    onChangeItemType(itemTypeId, index) {
        //find itemtype with itemlist as locally if yes then take this else go to server
        let ItemTypeData = this.itemTypeMapItemListData.find(a => a.ItemTypeId == itemTypeId);
        if (ItemTypeData && itemTypeId) {
            this.currPrescriptionItems[index].ItemListByItemType = [];
            this.currPrescriptionItems[index].ItemListByItemType = ItemTypeData.ItemList;
        }
        else {
            if (itemTypeId && index >= 0) {
                this.pharmacyBLService.GetItemListByItemTypeId(itemTypeId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.currPrescriptionItems[index].ItemListByItemType = [];
                            this.currPrescriptionItems[index].ItemListByItemType = res.Results;
                            let tempItmList = { ItemTypeId: itemTypeId, ItemList: res.Results };
                            this.itemTypeMapItemListData.push(tempItmList);
                        }
                        else {
                            this.messageboxService.showMessage("error", [res.ErrorMessage]);
                        }
                    });
            }
        }
    }
    //conditional validation for age and Dob
    //if on is passed to the UpdateValidator in model the Age is validated and
    // if off on is passed to the UpdateValidator in model the dob is validated and
    ConditionalValidationOfProvider() {
        this.IsWrongProvider = false;
        if (this.currPrescription.IsInPatient) {
            this.currPrescription.ProviderFullName = "";
            let onOff = 'on';
            let formControlName = 'ProviderId';
            this.currPrescription.UpdateValidator(onOff, formControlName);
            this.currPrescription.PHRMPrescriptionValidator.controls['ProviderId'].updateValueAndValidity();
        }
        else {
            this.selProvider = null;
            //incase age was entered.
            this.currPrescription.ProviderId = null;
            let onOff = 'off';
            let formControlName = 'ProviderId';
            this.currPrescription.UpdateValidator(onOff, formControlName);
            this.currPrescription.PHRMPrescriptionValidator.controls['ProviderId'].updateValueAndValidity();
        }
    }
    SavePrescription(): void {      
        //check patient is indoor or outdoor
        if (this.currPrescriptionItems != null) {
            if (this.currPrescription.IsInPatient) {
                this.currPrescription.ProviderId = this.selProvider ? this.selProvider.Key : 0;
                this.currPrescription.ProviderFullName = this.selProvider ? this.selProvider.Value : '';
                this.IsWrongProvider = (this.currPrescription.ProviderId > 0) ? false : true;
            } else {
                this.IsWrongProvider = (this.currPrescription.ProviderFullName.length > 0 && this.currPrescription.ProviderFullName) ? false : true;
            }
            //this function call for assign important value for making prescription and Prescription Items
            //checking manual Validation
            let CheckIsValid = true;
            //prescription-for checking validations, marking all the fields as dirty and checking the validity.
            for (var i in this.currPrescription.PHRMPrescriptionValidator.controls) {
                this.currPrescription.PHRMPrescriptionValidator.controls[i].markAsDirty();
                this.currPrescription.PHRMPrescriptionValidator.controls[i].updateValueAndValidity();
            }
            //prescription items-for checking validations, marking all the fields as dirty and checking the validity.
            for (var j = 0; j < this.currPrescriptionItems.length; j++) {
                for (var i in this.currPrescriptionItems[j].PHRMPrescriptionItemsValidator.controls) {
                    this.currPrescriptionItems[j].PHRMPrescriptionItemsValidator.controls[i].markAsDirty();
                    this.currPrescriptionItems[j].PHRMPrescriptionItemsValidator.controls[i].updateValueAndValidity();
                }
                //check selected item is proper or not
                let item = this.currPrescriptionItems[j].SelectedItem;
                if (typeof item !== "object" && Array.isArray(item) && item === null) {
                    this.currPrescriptionItems[i].IsWrongItem = true;
                    CheckIsValid = false;
                }
                //check every prescription items is valid or not
                if (!this.currPrescriptionItems[j].IsValidCheck(undefined, undefined)) {
                    CheckIsValid = false;
                }
            }
            if (this.currPrescription.IsValidCheck(undefined, undefined) && (this.IsWrongProvider == false && CheckIsValid)) {
                this.MakePrescriptionObject();
                this.loading = true;
                this.currPrescription.PHRMPrescriptionItems = this.currPrescriptionItems;
                this.pharmacyBLService.PostPrescription(this.currPrescription)
                    .subscribe(
                    res => {
                        this.CallBackSavePrescription(res),
                            this.loading = false;
                    },
                    err => {
                        this.loading = false;
                        this.messageboxService.showMessage("error", [err.ErrorMessage]);
                    });
            }
        }
    }
    //after prescription is succesfully added this function is called.
    CallBackSavePrescription(res) {
        if (res.Status == "OK") {
            this.loading = false;  
            this.router.navigate(['/Pharmacy/Prescription/List'])
            this.messageboxService.showMessage("success", ["Prescription Created Succesfully. "]);                     
        }
        else {
            this.messageboxService.showMessage("failed", [res.ErrorMessage]);
            this.loading = false;
        }
    }a
    //used to format display of doctors name in ng-autocomplete.
    myDoctorListFormatter(data: any): string {
        let html = data["Value"];
        return html;
    }
    //used to format display of item in ng-autocomplete
    myItemListFormatter(data: any): string {
        let html = data["ItemName"];
        return html;
    }

    //This function checking for patient information if no pat info then navigate to pat list and select pat
    CheckPatientDetails() {
        if (!this.patientService.globalPatient.PatientCode) {
            this.messageboxService.showMessage("notice", ['Please select patient for prescription']);
            this.router.navigate(['/Pharmacy/Patient/List']);
        }
    }
    //Add New row into list
    AddRowRequest(index) {
        var tempPrescription: PHRMPrescriptionItem = new PHRMPrescriptionItem();
        if (this.currPrescriptionItems.length == 0) {
            this.currPrescriptionItems.push(tempPrescription);
        } else {
            //tempPrescription.ItemTypeName = this.currPrescriptionItems[index].ItemTypeName;
            tempPrescription.ItemId = this.currPrescriptionItems[index].ItemId;
            tempPrescription.Quantity = this.currPrescriptionItems[index].Quantity;
            tempPrescription.Notes = this.currPrescriptionItems[index].Notes;
            tempPrescription.StartingDate = this.currPrescriptionItems[index].StartingDate;
            tempPrescription.HowManyDays = this.currPrescriptionItems[index].HowManyDays;
            this.currPrescriptionItems.push(tempPrescription);
        }
    }
    //to delete the row
    DeleteRow(index) {
        //this will remove the data from the array        
        this.currPrescriptionItems.splice(index, 1);
        if (index == 0 && this.currPrescriptionItems.length == 0) {
            this.AddRowRequest(0);
        }
        else {
            this.changeDetectorRef.detectChanges();
        }
    }

    //when provider value changed this fired and validation flag goes off
    ProviderValueChanged() {
        this.IsWrongProvider = false;
    }
    //when item value changed this funciton call and validation flag goes off for item
    ItemValueChanged(i) {
        this.currPrescriptionItems[i].IsWrongItem = false;
    }
    MakePrescriptionObject() {
        this.currPrescription.PatientId = this.patientService.globalPatient.PatientId;
        this.currPrescription.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.currPrescription.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
        this.currPrescription.PrescriptionStatus = "active";
        for (var i = 0; i < this.currPrescriptionItems.length; i++) {
           // this.currPrescriptionItems[i].CompanyId = this.currPrescriptionItems[i].SelectedItem.CompanyId;
           // this.currPrescriptionItems[i].UOMId = this.currPrescriptionItems[i].SelectedItem.UOMId;
            this.currPrescriptionItems[i].ItemId = this.currPrescriptionItems[i].SelectedItem.ItemId;
            //frequency is changed from 
            this.currPrescriptionItems[i].Frequency = 0;// this.MakeFrequencyValueUItoDB(this.currPrescriptionItems[i]);
           // this.currPrescriptionItems[i].PrescriptionItemStatus = "active";
            this.currPrescriptionItems[i].CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.currPrescriptionItems[i].CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
        }
    }
    //make medicine frequency by concating all value as single value
    MakeFrequencyValueUItoDB(presItem: PHRMPrescriptionItem): string {
        let frequency = presItem.mrng.toString() + "," + presItem.noon.toString() + "," + presItem.evng.toString() + "," + presItem.night.toString();
        return frequency;
    }
    Cancel() {
        this.currPrescriptionItems = new Array<PHRMPrescriptionItem>();
        var tempPres: PHRMPrescriptionItem = new PHRMPrescriptionItem();
        this.currPrescriptionItems.push(tempPres);
    }
}