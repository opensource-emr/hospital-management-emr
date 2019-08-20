
import { Component } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DoctorsBLService } from '../shared/doctors.bl.service';

@Component({
    templateUrl: "../../view/doctors-view/PatientOverviewMain.html" // "/DoctorsView/PatientOverviewMain"
})


export class PatientOverviewMainComponent {

    validRoutes: any;
    isVisitConcluded = false;
    constructor(public securityService: SecurityService,
        public PatService: PatientService,
        public visitService: VisitService,
        public msgBoxSrv: MessageboxService,
        public router: Router,
        private doctorBLService: DoctorsBLService) {
        //get the chld routes of Doctors/PatientOverviewMain from valid routes available for this user.
        this.validRoutes = this.securityService.GetChildRoutes("Doctors/PatientOverviewMain");
        if (this.visitService.globalVisit.ConcludeDate) {
            this.isVisitConcluded = true;
        }else{
            this.isVisitConcluded = false;
        }
    }

    ConcludeVisit() {
        var txt;
        var r = confirm("Are you sure you want to conclude this visit ?");
        if (r == true) {
            this.doctorBLService.ConcludeVisit(this.visitService.globalVisit.PatientVisitId)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxSrv.showMessage("success", ["Current visit is concluded."]);
                        this.router.navigate(['/Doctors/OutPatientDoctor']);
                    } else {
                        this.msgBoxSrv.showMessage("error", ["something wrong please try again."]);
                    }
                })
            ///
        }

        //} else {
        //    txt = "You pressed Cancel!";
        //}
    }
}