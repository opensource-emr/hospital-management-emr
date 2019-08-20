import { Component, ChangeDetectorRef, HostListener } from "@angular/core";

import { PatientService } from "../../patients/shared/patient.service";
import { MedicationBLService } from '../shared/medication.bl.service';
import { SecurityService } from "../../security/shared/security.service";
import { OrderService } from '../../orders/shared/order.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { MedicationPrescription } from "../shared/medication-prescription.model";
import { Employee } from '../../employee/shared/employee.model';
import { PHRMPrescriptionItem } from "../../pharmacy/shared/phrm-prescription-item.model";

//http is used for temporary purpose only: remove it ASAP : sud-6feb2018
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../shared/common.functions";
import { PHRMItemMasterModel } from "../../pharmacy/shared/phrm-item-master.model";

@Component({
    selector: "medications-select",
    template:'' // "../../view/clinical-view/MedicationPrescription.html" // "/ClinicalView/MedicationPrescription"
})
export class MedicationPrescriptionComponent {

//    public selectAllPreference: boolean = false;
//    //used in autocomplete
//    public selMed: { MedicineName, MedicineId, IsSelected, IsPreference };
//    public medicationHash: Array<any> = [];


//    //http is used for temporary purpose only: remove it ASAP : sud-6feb2018
//    constructor(public patientService: PatientService,
//        public medicationBLService: MedicationBLService,
//        public securityService: SecurityService,
//        public changeDetector: ChangeDetectorRef,
//        public ordServ: OrderService, public msgBoxServ: MessageboxService, public http: HttpClient) {

//        this.LoadAllMedications();
//        this.LoadEmpPreference();

//    }



//    //get the list of surgical history of the selected patient.
//    LoadAllMedications(): void {

//        if (this.ordServ.medicationList && this.ordServ.medicationList.length > 0) {
//            //we can move Createmedicationhash to orderservice and re-use it.
//            this.CreateMedicationHash();
//        }
//        else {
//            //only for temporary purpose, call it using pharmacydl service.
//            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
//            let options = new RequestOptions({ headers: headers });
//            this.http.get<any>('/api/Pharmacy?reqType=item', options).map(res => res)
//                .subscribe(res => {
//                    if (res.Status == "OK") {
//                        this.ordServ.medicationList = [];//empty the medicationlist after server call.
//                        res.Results.forEach(itm => {
//                            this.ordServ.medicationList.push({
//                                MedicineName: itm.ItemName,
//                                MedicineId: itm.ItemId,
//                                GenericId: itm.GenericId,
//                                IsSelected: false,
//                                IsPreference: false
//                            });
//                        });
//                        this.CreateMedicationHash();
//                    }
//                    else {
//                        this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
//                    }
//                });
//        }



//    }

//    CreateMedicationHash() {
//        let allFirstChars = this.ordServ.medicationList.map(mdc => {
//            return mdc.MedicineName.charAt(0).toUpperCase();
//        });

//        let distinctFirstChars = CommonFunctions.GetUniqueItemsFromArray(allFirstChars);

//        if (distinctFirstChars && distinctFirstChars.length > 0) {
//            distinctFirstChars.forEach(ch => {
//                let currCharGroup = this.ordServ.medicationList.filter(a => a.MedicineName.toUpperCase().startsWith(ch));
//                this.medicationHash.push({ Key: ch, Values: currCharGroup })
//            });

//        }

//    }

//    //get list of employee preferences if any.
//    LoadEmpPreference(): void {
//        if (this.ordServ.medicationPreference && this.ordServ.medicationPreference.length > 0) {
//            //don't go to server if preference is already loaded.
//        }
//        else {
//            var employeeId = this.securityService.GetLoggedInUser().EmployeeId;
//            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
//            let options = new RequestOptions({ headers: headers });
//            this.http.get<any>('/api/Pharmacy?reqType=employeePreference&employeeId=' + employeeId, options)
//                .map(res => res)
//                .subscribe(res => {
//                    if (res.Status == 'OK') {
//                        if (res.Results && res.Results.length) {
//                            this.ordServ.medicationPreference = [];//empty the medication preference list after tab change.
//                            res.Results.forEach(itm => {
//                                this.ordServ.medicationPreference.push({
//                                    MedicineName: itm.ItemName,
//                                    MedicineId: itm.ItemId,
//                                    IsSelected: false,
//                                    IsPreference: true
//                                });
//                            });
//                        }
//                    }
//                },
//                    err => {
//                        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
//                    });

//        }


//    }
//    //post new prescription
//    AddMedication(med): void {
//        this.ordServ.MedicationEventHandler(this.MapMedication(med));
//    }
//    MapMedication(med): PHRMPrescriptionItem {
//        let newMed: PHRMPrescriptionItem = new PHRMPrescriptionItem();
//        newMed.PatientId = this.patientService.getGlobal().PatientId;
//        newMed.ItemName = med.MedicineName;
//        newMed.ItemId = med.MedicineId;
//        newMed.OrderStatus = "active";
//        newMed.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
//        newMed.StartingDate = moment().format('YYYY-MM-DD HH:mm:ss');
//        newMed.ProviderId = this.securityService.GetLoggedInUser().EmployeeId;
//        newMed.IsSelected = med.IsSelected;
//        return newMed;
//    }


//    SelectAllPreference() {
//        //if selectAllPreference is true then all the preference item is selected...
//        if (this.selectAllPreference) {

//            for (var i = 0; i < this.ordServ.medicationPreference.length; i++) {
//                //IsPresent is used to check whether the item item is present or not the ordServ.imagingItems 
//                //if it is present then,dont push else push
//                var IsPresent = false;
//                for (var a = 0; a < this.ordServ.medSelected.length; a++) {
//                    if (this.ordServ.medSelected[a].ItemId == this.ordServ.medicationPreference[i].MedicineId) {
//                        IsPresent = true;
//                    }
//                }
//                if (IsPresent == false) {
//                    this.ordServ.medicationPreference[i].IsSelected = true;
//                    this.ordServ.medicationPreference[i].IsPreference = true;
//                    this.AddMedication(this.ordServ.medicationPreference[i]);
//                }

//            }
//        }
//        //if selectAllPreference is false then all the preference is unselected...
//        if (this.selectAllPreference == false && this.ordServ.medSelected.length != 0) {
//            for (var a = 0; a < this.ordServ.medicationPreference.length; a++) {
//                for (var i = 0; i < this.ordServ.medSelected.length; i++) {
//                    if (this.ordServ.medSelected[i].ItemId == this.ordServ.medicationPreference[a].MedicineId) {
//                        this.ordServ.medicationPreference[a].IsSelected = false;
//                        this.ordServ.medSelected[i].IsSelected = false;
//                        this.AddMedication(this.ordServ.medicationPreference[a]);
//                    }

//                }
//            }
//        }
//    }
//    myListFormatter(data: any): string {

//        let html = data["MedicineName"];
//        return html;
//    }

//    SelectTestFromSearchBox(med) {
//        if (typeof med === "object" && !Array.isArray(med) && med !== null) {
//            this.selMed = null;
//            for (var i = 0; i < this.ordServ.medSelected.length; i++) {
//                if (this.ordServ.medSelected[i].ItemId == med.MedicineId) {
//                    var check = true;
//                }
//            }
//            // if the item is not present in the imagingItems array ...then add it
//            if (check != true) {
//                med.IsSelected = true;
//                // this is used to make the checkbox true from the list of item item
//                for (var i = 0; i < this.ordServ.medicationList.length; i++) {
//                    if (med.MedicineId == this.ordServ.medicationList[i].MedicineId) {
//                        this.ordServ.medicationList[i].IsSelected = true;
//                        this.AddMedication(this.ordServ.medicationList[i]);
//                        break;
//                    }
//                }
//            }
//            else {
//                this.msgBoxServ.showMessage("failed", ["This item is already added"]);
//            }
//        }
//    }



//    @HostListener('scroll')
//    scrollHandler() {
//        var selectedEl = document.getElementById('targetA');
//        var selectedElRect = selectedEl.getBoundingClientRect();
//        var altst = document.getElementById('allMedicationTests').getBoundingClientRect();
//        var fromTop = altst.top - selectedElRect.top;

//        this.medicationHash.forEach(ky => {
//            var alpClass = document.getElementById(ky.Key);
//            var myElement = document.getElementById('target' + ky.Key);
//            var topPos = myElement.offsetTop - 30;
//            if (fromTop >= topPos) {
//                var active = document.getElementsByClassName('activealpha');
//                active[0].className = active[0].className.replace(" activealpha", "");
//                alpClass.classList.toggle('activealpha');
//                return;
//            }
//        });
//    }

//    alphabetClick(event, el) {


//        var target = event.target || event.srcElement || event.currentTarget;
//        var chk = event.target.classList.contains('activealpha');

//        var allAlphabetsHolder = document.getElementById('allAlphaHolder');
//        var active = allAlphabetsHolder.getElementsByClassName('activealpha');

//        if (!chk) {
//            for (var i = 0; i < active.length; i++) {
//                active[i].className = active[i].className.replace(" activealpha", "");
//            }
//            event.target.classList.toggle('activealpha');
//        }

//        var myElement = document.getElementById('target' + el);
//        var topPos = myElement.offsetTop - 30;
//        var parentTestsHolder = document.getElementById('allMedicationTests');
//        parentTestsHolder.scrollTop = topPos;
//    }


//    //start:  For SearchByGeneric -- sud

//    public searchByGeneric: boolean = false;

//    selGenericMed: any = null;
//    public genericMedList: Array<any> = [];
//    public itemsInGeneric: Array<any> = null;
//    ShowItemsByGeneric() {
//        //get item's list from this generic name.
//        this.itemsInGeneric = null;
//        let genId = this.selGenericMed.GenericId;
//        this.itemsInGeneric = this.ordServ.medicationList.filter(med => med.GenericId == genId);
//    }

//    SearchByGenericChkOnChange() {
//        if (this.searchByGeneric) {
//            if (this.genericMedList == null || this.genericMedList.length == 0) {
//                this.LoadGenericList();
//            }

//            //this.genericMedList.push({ GenericName: "Generic1", GenericId: 1 });
//        }
//        else {
//            this.itemsInGeneric = null;
//            this.selGenericMed = null;
//        }

//    }

//    GenericListFormatter(data: any): string {

//        let html = data["GenericName"];
//        return html;
//    }


//    LoadGenericList() {

//        //only for temporary purpose, call it using pharmacydl service.
//        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
//        let options = new RequestOptions({ headers: headers });
//        this.http.get<any>('/api/Pharmacy?reqType=getGenericList', options).map(res => res)
//            .subscribe(res => {
//                if (res.Status == "OK") {

//                    res.Results.forEach(itm => {
//                        this.genericMedList.push({
//                            GenericName: itm.GenericName,
//                            GenericId: itm.GenericId
//                        });
//                    });
//                }
//                else {
//                    this.msgBoxServ.showMessage("failed", ['Failed. please check log for details.'], res.ErrorMessage);
//                }
//            });
//    }
//    //End:  For SearchByGeneric  -- sud
}