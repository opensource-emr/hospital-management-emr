import { Component } from "@angular/core";
import {
  RouterOutlet,
  RouterModule,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from "@angular/router";
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DoctorsBLService } from "../shared/doctors.bl.service";
import { CoreService } from "../../core/shared/core.service";

@Component({
  templateUrl: "./patient-overview-main.html",
})
export class PatientOverviewMainComponent {
  validRoutes: any;
  isVisitConcluded = false;
  currentModuleName: any;

  constructor(
    public securityService: SecurityService,
    public PatService: PatientService,
    public visitService: VisitService,
    public msgBoxSrv: MessageboxService,
    public router: Router,
    private doctorBLService: DoctorsBLService,
    private route: ActivatedRoute,
    private coreService: CoreService
  ) {
    this.currentModuleName = this.securityService.currentModule;
    //get the chld routes of Doctors/PatientOverviewMain from valid routes available for this user.
    if (this.currentModuleName == "doctor") {
      this.validRoutes = this.securityService.GetChildRoutes(
        "Doctors/PatientOverviewMain"
      );
    } else if (this.currentModuleName == "nursing") {
      this.validRoutes = this.securityService.GetChildRoutes(
        "Nursing/PatientOverviewMain"
      );
    } else if (this.currentModuleName == "emergency") {
      this.validRoutes = this.securityService.GetChildRoutes(
        "Emergency/PatientOverviewMain"
      );
    }
    var visitType: string = this.visitService.globalVisit.VisitType;    
    var visitType = visitType ? visitType.toLowerCase() : visitType;

    if (visitType == "outpatient") {
      let excludedRoutes = this.coreService.GetExcludedOPpages('PatientOverviewMain');
      this.validRoutes = this.validRoutes.filter(function (r) {
        return !excludedRoutes.includes(r.RouterLink);
      });
    }


    if (this.visitService.globalVisit.ConcludeDate) {
      this.isVisitConcluded = true;
    } else {
      this.isVisitConcluded = false;
    }
    console.log(this.visitService.globalVisit);
  }

  ngOnInit() { }

  ngOnDestroy() { }

  ConcludeVisit() {
    var txt;
    var r = confirm("Are you sure you want to conclude this visit ?");
    if (r == true) {
      this.doctorBLService
        .ConcludeVisit(this.visitService.globalVisit.PatientVisitId)
        .subscribe((res) => {
          if (res.Status == "OK") {
            this.msgBoxSrv.showMessage("success", [
              "Current visit is concluded.",
            ]);
            this.router.navigate(["/Doctors/OutPatientDoctor"]);
          } else {
            this.msgBoxSrv.showMessage("error", [
              "something wrong please try again.",
            ]);
          }
        });
      ///
    }

    //} else {
    //    txt = "You pressed Cancel!";
    //}
  }

  //sud:4Apr'20--to go to MyAppointments page.
  public BackToHome() {
    if (this.currentModuleName == "doctor") {
      this.router.navigate(["/Doctors/OutPatientDoctor"]);
    } else if (this.currentModuleName == "nursing") {
      if (this.visitService.globalVisit.VisitType == "outpatient") {
        this.router.navigate(["/Nursing/OutPatient"]);
      } else {
        this.router.navigate(["/Nursing/InPatient"]);
      }

    } else if (this.currentModuleName == "emergency") {
      if (this.visitService.globalVisit.ERTabName == "triaged") {
        this.router.navigate(["/Emergency/TriagePatients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-lama") {
        this.router.navigate(["/Emergency/FinalizedPatients/Lama-Patients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-transferred") {
        this.router.navigate(["/Emergency/FinalizedPatients/Transferred-Patients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-discharge") {
        this.router.navigate(["/Emergency/FinalizedPatients/Discharged-Patients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-admitted") {
        this.router.navigate(["/Emergency/FinalizedPatients/Admitted-Patients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-death") {
        this.router.navigate(["/Emergency/FinalizedPatients/Death-Patients"]);
      } else if (this.visitService.globalVisit.ERTabName == "finalized-dor") {
        this.router.navigate(["/Emergency/FinalizedPatients/Dor-Patients"]);
      }
    }
  }
}
