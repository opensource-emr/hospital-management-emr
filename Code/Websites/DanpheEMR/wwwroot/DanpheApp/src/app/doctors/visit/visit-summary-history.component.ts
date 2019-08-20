import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../../appointments/shared/visit.model';
import { DynamicTemplateService } from '../../core/dyn-templates/shared/dynamic-template-service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientService } from '../../patients/shared/patient.service';
import { DLService } from '../../shared/dl.service';
import { VisitService } from '../../appointments/shared/visit.service';

@Component({
    templateUrl: "./visit-summary-history.html"
})
//Module's main component class
export class VisitSummaryHistoryComponent {

    public selectedPatient: Patient = new Patient();
    public visitList: Array<Visit> = new Array<Visit>();
    public isReportPending: boolean = false;
    public showSummaryViewEdit: boolean = false;
    public selVisitId: number;
    constructor(public dynTempService: DynamicTemplateService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public router: Router,
        public patientService: PatientService, public dlService: DLService, public visitServ: VisitService) {

        //redirect to patient list if the patient isn't selected from earlier page.
        this.selectedPatient = this.patientService.getGlobal();
        if (this.selectedPatient.PatientId) {
            this.GetPatientVisitList();
        }
        else {
            this.router.navigate(['/Patient/PatientList']);
        }

    }

    public GetPatientVisitList() {
        let url = "/api/Visit?reqType=patVisitList&patientId=" + this.selectedPatient.PatientId;
        this.dlService.Read(url).map(res => res).subscribe(res => {
            if (res.Status == "OK" && res.Results.length) {
                this.visitList = res.Results;
                this.CheckPendingRecord();
            }
        });
    }
    public CheckPendingRecord() {
        if (this.visitList) {
            for (let vis of this.visitList) {
                if (!vis.IsSignedVisitSummary) {
                    this.isReportPending = true;
                    break;
                }

            }
        }
    }
    ShowEditViewSummary(vis: Visit,renderMode:string) {
        this.selVisitId = vis.PatientVisitId;
        this.dynTempService.templateRenderMode = renderMode;
        this.showSummaryViewEdit = true;
    }

    CloseEditViewSummary() {
        this.showSummaryViewEdit = false;
        this.selVisitId = null;
    }
}

