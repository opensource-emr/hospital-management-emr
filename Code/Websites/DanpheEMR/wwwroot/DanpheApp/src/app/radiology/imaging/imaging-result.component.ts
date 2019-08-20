import { Component, ChangeDetectorRef  } from "@angular/core";
import { Router } from '@angular/router';
import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';
import { ImagingItemReport, ImagingReportViewModel } from '../shared/imaging-item-report.model';
import { ImagingBLService } from '../shared/imaging.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
    templateUrl: "../../view/radiology-view/ImagingResult.html" // "/RadiologyView/ImagingResult"
})
export class ImagingResultComponent {
    public imagingReports: Array<ImagingItemReport> = new Array<ImagingItemReport>();
    //enable preview is for message dialog box.
    public enablePreview: boolean = false;
    public requisitionId: number = null;
    //show report is for pop up show report page
    public showImagingReport: boolean = false;
    constructor(public visitService: VisitService,
        public imagingBLService: ImagingBLService,
        public patientService: PatientService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService) {
        this.GetPatientReports();
    }
    //get list of report of the selected patient.
    GetPatientReports(): void {
        this.imagingBLService.GetPatientReports(this.visitService.getGlobal().PatientId)
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.imagingReports = res.Results;
                    this.enablePreview = true;
                }
                else {
                    this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
                }
            });
    }
    
    ViewReport(report: ImagingItemReport): void {
        this.showImagingReport = false;
        this.requisitionId = null;
        //manually triggering the angular change detection.
        this.changeDetector.detectChanges();
        this.requisitionId = report.ImagingReportId;
        this.showImagingReport = true;
    }
}