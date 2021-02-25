
import { Component, ChangeDetectorRef } from "@angular/core"
import PHRMGridColumns from '../shared/phrm-grid-columns';
import { PharmacyService } from "../shared/pharmacy.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { Router } from '@angular/router';
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { PHRMInvoiceItemsModel } from "../shared/phrm-invoice-items.model"
import { RouteFromService } from "../../shared/routefrom.service";

import { PHRMProvisionalItemVMModel } from "../shared/phrm-provisional-items-vm.model"
import { DrugsRequistionItemModel } from "../../nursing/shared/drugs-requistion-items.model"
import * as moment from 'moment/moment';
import { Patient } from "../../patients/shared/patient.model";
import { PatientService } from "../../patients/shared/patient.service";
import { PatientsBLService } from "../../patients/shared/patients.bl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";

@Component({

    templateUrl: "./phrm-provisional-items.html"
})
export class PHRMProvisionalItems {
    patients: Array<Patient> = new Array<Patient>();
    patient: Patient = new Patient();

    public PHRMProvisionalItemsGridColumns: Array<any> = null;
    public PHRMProvisionalItemsList: any;
    public showProItemList: boolean = true;
    public showDispatchItem: boolean = false;
    public proItems: PHRMInvoiceItemsModel = new PHRMInvoiceItemsModel();
    public localDatalist: Array<DrugsRequistionItemModel> = new Array<DrugsRequistionItemModel>();
    public selectedDatalist: Array<DrugsRequistionItemModel> = new Array<DrugsRequistionItemModel>();
    public PHRMProItemsList: Array<DrugsRequistionItemModel> = new Array<DrugsRequistionItemModel>();
    public patientId: number;
    public invoiceItemId: any;
    constructor(public pharmacyBLService: PharmacyBLService,
        public pharmacyService: PharmacyService,
        public msgBoxServ: MessageboxService,
        public patientService: PatientService,
        public patientBlService: PatientsBLService,
        public router: Router,
        public changeDetectorRef: ChangeDetectorRef,
        public routeFromService: RouteFromService) {
        this.PHRMProvisionalItemsGridColumns = PHRMGridColumns.PHRMProvisionalItemsList;
        this.LoadPHRMPOProvisionalItemsByStatus();
    }

    // Load drugs request list from nursing dept.
    LoadPHRMPOProvisionalItemsByStatus() {

        var Status = "pending";
        this.pharmacyBLService.GetPHRMProvisionalItemList(Status)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.PHRMProvisionalItemsList = res.Results;
                    for (let i = 0; i < this.PHRMProvisionalItemsList.length; i++) {
                        this.patientId = this.PHRMProvisionalItemsList[i].PatientId;
                    }
                } else {
                    this.msgBoxServ.showMessage("failed", ['Failed to get OrderList.' + res.ErrorMessage]);
                }
            },
                err => {
                    this.msgBoxServ.showMessage("error", ['Failed to get OrderList.' + err.ErrorMessage]);
                }
            );
    }

    //Method for assign value to patient service
    public SetPatServiceData(selectedPatientData) {
        if (selectedPatientData) {
           
            this.patientBlService.GetPatientById(selectedPatientData.PatientId)
                .subscribe((res: DanpheHTTPResponse) => {
                    this.patient = res.Results;
                    var globalPatient = this.patientService.getGlobal();
                    globalPatient.PatientId = this.patient.PatientId;
                    globalPatient.PatientCode = this.patient.PatientCode;
                    globalPatient.ShortName = this.patient.ShortName;
                    globalPatient.DateOfBirth = this.patient.DateOfBirth;
                    globalPatient.Gender = this.patient.Gender;
                    globalPatient.IsOutdoorPat = this.patient.IsOutdoorPat;
                    globalPatient.PhoneNumber = this.patient.PhoneNumber;
                    globalPatient.FirstName = this.patient.FirstName;
                    globalPatient.MiddleName = this.patient.MiddleName;
                    globalPatient.LastName = this.patient.LastName;
                    globalPatient.Age = this.patient.Age;
                    //globalPatient.AgeUnit = this.patient.AgeUnit;
                    globalPatient.Address = this.patient.Address;
                    this.pharmacyService.RequisitionId = selectedPatientData.RequisitionId;
                    this.router.navigate(["/Pharmacy/Sale/Dispatch"]);

                });

        }
    }


    PHRMProvisionalItemsGridAction($event: GridEmitModel) {
        switch ($event.Action) {
            case "dispatch":
                {
                    //var data = $event.Data;
                    //this.showDispatchItem = true;
                    //this.ShowProvisionalItemsDetailsById(data.RequisitionId);

                    var data = $event.Data;
                    this.pharmacyService.RequisitionId = $event.Data.RequisitionId;
                    this.SetPatServiceData(data);
                }
                break;
            default:
                break;
        }
    }

    CloseDrugsRequestsPage() {
        this.showDispatchItem = false;
    }

    // show the selected patients drugs item list
    ShowProvisionalItemsDetailsById(requsitionId) {

        var len = this.localDatalist.length;
        for (var i = 0; i < len; i++) {
            let selectedDataset = this.localDatalist[i];
            if (selectedDataset.ItemId == requsitionId) {
                this.selectedDatalist.push(selectedDataset);
            }
        }
        if (this.selectedDatalist[0] && requsitionId) {
            this.PHRMProItemsList = this.selectedDatalist;
            this.selectedDatalist = new Array<DrugsRequistionItemModel>();
        }
        else {
            (
                this.pharmacyBLService.GetPHRMDrugsItemList(requsitionId)
                    .subscribe(res => {
                        if (res.Status == "OK") {
                            this.PHRMProItemsList = res.Results;
                            this.PHRMProItemsList.forEach(itm => { this.localDatalist.push(itm); });

                        } else {
                            this.msgBoxServ.showMessage("failed", ['Failed to get List.' + res.ErrorMessage]);
                        }
                    },
                        err => {
                            this.msgBoxServ.showMessage("error", ['Failed to get List.' + err.ErrorMessage]);
                        }
                    )
            )
        }
    }

    myItemListFormatter(data: any): string {
        let html = data["GenericName"] + "||" + data["ItemName"];
        return html;
    }

    // saved requested data into pharmacy invoice items table
    Save() {
        try {
            this.pharmacyBLService.PostProvisonalItems(this.PHRMProItemsList).
                subscribe(res => {
                    if (res.Status == "OK") {
                        this.LoadPHRMPOProvisionalItemsByStatus();
                        this.showDispatchItem = false;
                        this.msgBoxServ.showMessage("success", ["successfully saved"]);
                    } else {
                        this.msgBoxServ.showMessage("Failed", ["Failed "]);
                    }
                });
        }
        catch (ex) {
        }

    }

}