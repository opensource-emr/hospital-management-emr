import { Component, ChangeDetectorRef } from "@angular/core";
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { VisitService } from '../../appointments/shared/visit.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { Visit } from "../../appointments/shared/visit.model";

import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';

@Component({
    templateUrl: "./patient-visit-history.html"
})
export class PatientVisitHistoryComponent {
    public visits: Array<Visit> = new Array<Visit>();
    public showOpdSummary: boolean = false;

    constructor(
        public visitService: VisitService,
        public visitDLService: VisitDLService,
        public router: Router,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.LoadPatientVisitList();
    }
    //commented the call of this function from the constructor since we're not using the create visit page
    //loads exisitng visits of a certain Patient
    LoadPatientVisitList(): void {
        let patientId = this.visitService.getGlobal().PatientId;
        this.visitDLService.GetPatientVisitList(patientId)
            .map(res => res)
            .subscribe(res => {
                if (res.Status == "OK")
                    this.visits = this.GetFormattedVisits(res.Results);
                else
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
            });
    }

    GetFormattedVisits(visitList: Array<Visit>): Array<Visit> {
        //adding a property Age into each visit's Patient object. 
        //try and make the logic global if needed.. 
        let formattedVisits = visitList.map(function (vis) {
            vis.VisitTime = moment(vis.VisitTime, "hhmm").format('hh:mm A');
            return vis;
        });
        return formattedVisits;
    }

    ViewVisitSummary() {
        this.showOpdSummary = false;
        this.changeDetector.detectChanges();
        this.showOpdSummary = true;
    }

}