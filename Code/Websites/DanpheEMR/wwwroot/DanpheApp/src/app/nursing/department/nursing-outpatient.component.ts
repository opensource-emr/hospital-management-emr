import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';


import { Visit } from "../../appointments/shared/visit.model";
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
    selector: 'nursing-outpatient',
    templateUrl: './nursing-outpatient.html',
})

export class NursingOutPatientComponent {

    public opdList: Array<Visit> = new Array<Visit>();
    nurOPDGridColumnSettings: Array<any> = null;

    public reloadFrequency: number = 30000; //30000 =30 seconds: this is the frequency of new Pull-Request for OPD Patient List.
    public timer; ///timer variable to subscribe or unsubscribe the timer 
    public sub: Subscription;

    public fromDate: string = '';
    public toDate: string = '';
    public isShowUploadMode: boolean = false;
    public isShowListMode: boolean = false;
    public showDocumentsDetails: boolean = false;
    public patientId: number = null;

    public globalPatient: any;
    public globalVisit: any;
    public patGirdDataApi:string="";
    public selectedVisit: Visit = new Visit();
    constructor(public patientService: PatientService,
        public visitService: VisitService,
        public nursingBLServiec: NursingBLService,
        public changeDetector: ChangeDetectorRef,
        public router: Router,
        public routeFromSrv: RouteFromService,
        public msgBoxServ: MessageboxService) {
        this.patGirdDataApi=APIsByType.NursingOutpatient;
        this.nurOPDGridColumnSettings = GridColumnSettings.NurOPDList;
        this.fromDate = moment().format('YYYY-MM-DD');
        this.toDate = moment().format('YYYY-MM-DD');
    }


    ngOnInit() {
        //we are using Timer function of Observable to Call the HTTP with angular timer
        //first Zero(0) means when component is loaded the timer is also start that time
        //seceond (60000) means after each 1 min timer will subscribe and It Perfrom HttpClient operation 
        this.timer = Observable.timer(0, this.reloadFrequency);
        // subscribing to a observable returns a subscription object
        this.sub = this.timer.subscribe(t => this.LoadVisitList(t));
    }

    ngOnDestroy() {
        // Will clear when component is destroyed e.g. route is navigated away from.
        clearInterval(this.timer);
        this.sub.unsubscribe();//IMPORTANT to unsubscribe after going away from current component.
    }

    LoadVisitList(tick) {
        //today's all visit or all visits with IsVisitContinued status as false
        this.nursingBLServiec.GetOPDList()  //this.fromDate, this.toDate
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.opdList = res.Results;
                }
                else {

                    this.msgBoxServ.showMessage("failed to load data", [res.ErrorMessage]);
                }

            });
    }




    // LoadOutPatient() {
    //     var checkIfSameOrBefore = moment(this.fromDate).isSameOrBefore(this.toDate);

    //     if (checkIfSameOrBefore) {
    //         this.nursingBLServiec.GetOPDListByDate(this.fromDate, this.toDate)
    //             .subscribe(res => {
    //                 if (res.Status == "OK") {
    //                     this.opdList = res.Results;
    //                 }
    //                 else {
    //                     this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
    //                 }
    //             });
    //     }
    //     else {
    //         this.msgBoxServ.showMessage("failed", ["To-Date should be greater than From-Date."]);
    //         // alert('Please Provide Before Date and To date Properly');
    //     }

    // }

    NurOPDListGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "clinical":
                {
                    this.SetPatDataToGlobal($event.Data);
                    this.router.navigate(["/Nursing/Clinical"]);
                    break;

                }
            case "patient-overview":
                {
                    if ($event.Data) {
                        this.SetPatDataToGlobal($event.Data);
                        this.routeFromSrv.RouteFrom = "nursing";
                        this.router.navigate(["/Nursing/PatientOverview"]);
                    }
                    break;
                }
            case "upload-files":
                {
                    if ($event.Data) {
                        this.isShowUploadMode = true;
                        this.isShowListMode = false;
                        this.patientId = $event.Data.Patient.PatientId;
                        this.showDocumentsDetails = true;
                    }
                }
        }
    }

    public SetPatDataToGlobal(data) {
        this.globalPatient = this.patientService.CreateNewGlobal();
        this.globalPatient.PatientId = data.Patient.PatientId;
        this.globalPatient.PatientCode = data.Patient.PatientCode;
        this.globalPatient.ShortName = data.Patient.ShortName;
        this.globalPatient.DateOfBirth = data.Patient.DateOfBirth;
        this.globalPatient.Gender = data.Patient.Gender;
        this.globalPatient.PhoneNumber = data.Patient.PhoneNumber;
        this.globalPatient.Address = data.Patient.Address;
        this.globalPatient.Age = data.Patient.Age;
        this.globalVisit = this.visitService.CreateNewGlobal();
        this.globalVisit.PatientVisitId = data.PatientVisitId;
        this.globalVisit.PatientId = data.Patient.PatientId;
        this.globalVisit.ProviderName = data.ProviderName;
        this.globalVisit.ProviderId = data.ProviderId;

    }

}
