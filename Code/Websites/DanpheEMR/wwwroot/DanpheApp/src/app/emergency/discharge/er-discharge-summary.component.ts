import { Component, ChangeDetectorRef, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { CoreService } from '../../core/shared/core.service';
import { EmergencyPatientModel } from '../shared/emergency-patient.model';
import { CommonFunctions } from '../../shared/common.functions';
import { EmergencyBLService } from '../shared/emergency.bl.service';
import { EmergencyDLService } from '../shared/emergency.dl.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { PatientService } from '../../patients/shared/patient.service';
import * as moment from 'moment/moment';
import { EmergencyDischargeSummaryVM } from '../shared/emergency-discharge-summaryVM';

@Component({
    selector: 'er-discharge-summary',
    templateUrl: './er-discharge-summary.html'
})

// App Component class
export class ERDischargeSummaryComponent {
    public showAddUpdate: boolean = false;
    public viewSummary: boolean = false;

    @Input() public patientId: number = null;
    @Input() public visitId: number = null;
        
    public PatientSummary: EmergencyDischargeSummaryVM = new EmergencyDischargeSummaryVM();;

    constructor(public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService, public emergencyBLService: EmergencyBLService,
        public coreService: CoreService) {

    }

    ngOnInit() {
        if (this.patientId && this.visitId) {
            this.GetDischargeDetails();
        }
    }

    GetDischargeDetails() {
        if (this.patientId && this.visitId) {
            this.emergencyBLService.GetDischargeSummaryDetail(this.patientId, this.visitId)
                .subscribe((res: DanpheHTTPResponse) => {
                    if (res.Status == "OK") {
                        this.PatientSummary = new EmergencyDischargeSummaryVM();
                        this.PatientSummary = res.Results;
                        this.PatientSummary.EmergencyPatient.FullName = this.PatientSummary.EmergencyPatient.FirstName + (this.PatientSummary.EmergencyPatient.MiddleName ? this.PatientSummary.EmergencyPatient.MiddleName : ' ') + this.PatientSummary.EmergencyPatient.LastName;
                        this.AssignViewOrUpdate();
                    } else {
                        this.msgBoxServ.showMessage("Failed", ["Cannot get the Discharge Summary!!"]);
                    }
                });
        }
    }

    AssignViewOrUpdate() {
        if (this.PatientSummary && this.PatientSummary.DischargeSummary && this.PatientSummary.DischargeSummary.ERDischargeSummaryId) {
            this.viewSummary = true;
            this.showAddUpdate = false;
        } else {
            this.viewSummary = false;
            this.showAddUpdate = true;
        }
    }

    CallBackFromAddUpdate($event) {
        if ($event.submit) {
            this.PatientSummary.DischargeSummary = $event.dischargeSummary;
            this.PatientSummary.EmergencyPatient.ERDischargeSummaryId = this.PatientSummary.DischargeSummary.ERDischargeSummaryId;
            this.changeDetector.detectChanges();
            this.showAddUpdate = false;
            this.viewSummary = true;
        }
    }

    CallBackFromView($event) {
        if ($event.callBack) {
            this.viewSummary = false;
            this.showAddUpdate = true;
        }
    }

}