import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

import { PatientService } from '../../../patients/shared/patient.service';
import { LabsBLService } from '../../shared/labs.bl.service';

import { LabTestRequisition } from '../../shared/lab-requisition.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabTestResultService } from "../../shared/lab.service";
import { Subscription } from "rxjs/Rx";
import { CoreService } from "../../../core/shared/core.service";

@Component({
    templateUrl: "../../../view/lab-view/ListLabRequisition.html" // "/LabView/ListLabRequisition"
})

export class LabListRequisitionComponent {

    public requisitions: Array<LabTestRequisition>;
    //start: for angular-grid
    LabGridColumns: Array<any> = null;
    public showLabRequestsPage: boolean = false;

    public timer;
    public reloadFrequency: number = 5000;
    public sub: Subscription;

    //@ViewChild('searchBox') someInput: ElementRef;

    constructor(public labBLService: LabsBLService, public router: Router,
        public patientService: PatientService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public labResultService: LabTestResultService, public coreService: CoreService) {

        //labrequisition grid
        this.LabGridColumns = LabGridColumnSettings.ListRequisitionColumnFilter(this.coreService.GetRequisitionListColumnArray());
        this.GetLabItems();

       
        if (!this.coreService.GetRefreshmentTime()) {
            this.reloadFrequency = 5000;
        } else {
            this.reloadFrequency = this.coreService.GetRefreshmentTime() * 1000;
        }
    }

    ngOnInit() {
        //we are using Timer function of Observable to Call the HTTP with angular timer
        //first Zero(0) means when component is loaded the timer is also start that time
        //seceond (60000) means after each 1 min timer will subscribe and It Perfrom HttpClient operation 
        this.timer = Observable.timer(0, this.reloadFrequency);
        // subscribing to a observable returns a subscription object
        this.sub = this.timer.subscribe(t => this.LoadLabRequisition(t));
    }

    ngOnDestroy() {
        // Will clear when component is destroyed e.g. route is navigated away from.
        clearInterval(this.timer);
        this.sub.unsubscribe();//IMPORTANT to unsubscribe after going away from current component.
    }

    ngAfterViewInit() {
        document.getElementById('quickFilterInput').focus();
    }

    GetLabItems() {
        this.labBLService.GetLabBillingItems()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.labResultService.labBillItems = res.Results;
                }
                else {
                    this.msgBoxServ.showMessage("failed", ["Unable to get lab items."]);
                }
            });
    }

    //getting the requsitions
    LoadLabRequisition(tick): void {
        this.labBLService.GetLabRequisition()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.requisitions = res.Results;
                  this.requisitions = this.requisitions.slice();                  
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["failed to add result.. please check log for details."]);
               
            });
    }
   
        //this.countPendingStatus = this.requisitions.filter(a => a.LabOrderStatus == "Pending").length;
        //this.countNewStatus = this.requisitions.filter(a => a.LabOrderStatus == "New").length;

    
    ViewDetails(req): void {
        this.patientService.getGlobal().PatientId = req.PatientId;
        this.patientService.getGlobal().ShortName = req.PatientName;
        this.patientService.getGlobal().PatientCode = req.PatientCode;
        this.patientService.getGlobal().DateOfBirth = req.DateOfBirth;
        this.patientService.getGlobal().Gender = req.Gender;
        this.patientService.getGlobal().PatientType = req.VisitType;
        this.patientService.getGlobal().RunNumberType = req.RunNumberType;
        this.patientService.getGlobal().RequisitionId = req.RequisitionId;
        this.patientService.getGlobal().WardName = req.WardName;
        this.patientService.getGlobal().PhoneNumber = req.PhoneNumber;
        this.router.navigate(['/Lab/CollectSample']);
        
    }

    //lab requisition grid 
   LabGridActions($event: GridEmitModel) {

        switch ($event.Action) {
            case "ViewDetails":
                {
                    this.ViewDetails($event.Data)
                }
                break;
            default:
                break;
        }
    }

   

}
