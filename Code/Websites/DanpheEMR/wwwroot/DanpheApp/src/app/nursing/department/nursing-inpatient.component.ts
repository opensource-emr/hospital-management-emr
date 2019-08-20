import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { NursingBLService } from "../shared/nursing.bl.service";
import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from "../../patients/shared/patient.service";
import { RouteFromService } from "../../shared/routefrom.service";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import * as moment from 'moment/moment';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { APIsByType } from '../../shared/search.service';

@Component({
    selector: 'nursing-inpatient',
    templateUrl: './nursing-inpatient.html',
})

export class NursingInPatientComponent {

    public ipdList = [];
    nurIPDGridColumnSettings: Array<any> = null;

    public loading: boolean;
    public isShowUploadMode: boolean = false;
    public isShowDrugRequest: boolean = false;
    public isShowListMode: boolean = false;
    public showDocumentsDetails: boolean = false;
    public patientId: number = null;
 
    public globalPatient: any;
    public globalVisit: any;
    public patGirdDataApi:string="";
    public showIpDrugsRequest: boolean = false;
    constructor(public nursingBLServiec: NursingBLService,
        public changeDetector: ChangeDetectorRef,
        public patientService: PatientService,
        public visitService: VisitService,
        public router: Router,
        public routeFromSrv: RouteFromService,
        public msgBoxServ: MessageboxService) {
        this.LoadIPDList();
        this.nurIPDGridColumnSettings = GridColumnSettings.NurIPDList;
        this.patGirdDataApi=APIsByType.NursingInpatient;
    }
    //today's all visit or all visits with IsVisitContinued status as false
    LoadIPDList(): void {
        this.nursingBLServiec.GetAdmittedList()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ipdList = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);

                }
            });
    }

    NurIPDListGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "orders":
                {
                    if ($event.Data) {
                        this.routeFromSrv.RouteFrom = "nursing";
                        this.SetPatDataToGlobal($event.Data);
                        this.router.navigate(["/Nursing/WardBilling"]);
                        //this.router.navigate(["/Nursing/NursingOrder"]);
                    }
                }
                break;

            case "clinical":
                {
                    if ($event.Data) {
                        this.SetPatDataToGlobal($event.Data);
                        this.router.navigate(["/Nursing/Clinical"]);
                    }

                }
                break;
            case "patient-overview":
                {
                    if ($event.Data) {
                        this.SetPatDataToGlobal($event.Data);
                        this.routeFromSrv.RouteFrom = "nursing";
                        this.router.navigate(["/Nursing/PatientOverview"]);
                    }

                }
                break;
            case "upload-files":
                {
                    if ($event.Data) {
                        this.isShowUploadMode = true;
                        this.isShowListMode = false;
                        this.patientId = $event.Data.PatientId;
                        this.showDocumentsDetails = true;
                    }
                }
                break;
            case "drugs-request":
                {
                    if ($event.Data) {

                        this.SetPatDataToGlobal($event.Data);
                        this.isShowDrugRequest = true;
                        this.routeFromSrv.RouteFrom = "nursing";
                        this.router.navigate(["/Nursing/DrugsRequest"]);

                    }
                }
                break;
            
        }
    }
   
    //Place Nursing order against patient
    public SetPatDataToGlobal(data): void {
        this.globalPatient = this.patientService.CreateNewGlobal();
        this.globalPatient.PatientId = data.PatientId;
        this.globalPatient.PatientCode = data.PatientCode;
        this.globalPatient.ShortName = data.Name;
        this.globalPatient.DateOfBirth = data.DateOfBirth;
        this.globalPatient.Gender = data.Gender;
        this.globalPatient.Age = data.Age;
        this.globalVisit = this.visitService.CreateNewGlobal();
        this.globalVisit.PatientVisitId = data.PatientVisitId;
        this.globalVisit.PatientId = data.PatientId;
        this.globalVisit.ProviderId = data.AdmittingDoctorId;
    }

    
    
}