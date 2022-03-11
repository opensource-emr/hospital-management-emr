import { Component, Directive, ViewChild } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Visit } from '../../appointments/shared/visit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { Router } from '@angular/router';
import { PatientService } from '../../patients/shared/patient.service';
import { Subscription } from 'rxjs';
import { DanpheHTTPResponse } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { RouteFromService } from '../../shared/routefrom.service';
import { BillingService } from '../../billing/shared/billing.service';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { ENUM_AppointmentType, ENUM_BillingStatus, ENUM_VisitType, ENUM_OrderStatus } from '../../shared/shared-enums';
import { VisitBLService } from '../../appointments/shared/visit.bl.service';
import { VaccinationBLService } from '../shared/vaccination.bl.service';
import { CoreService } from '../../core/shared/core.service';

@Component({
  selector: "vacc-followup-visit-add",
  templateUrl: "./vaccination-followup-add.html",
  host: { '(window:keydown)': 'hotkeys($event)' }
})
export class VaccinationFollowupAddComponent {
  public showFollowupPage: boolean = false;

  @Output("on-followup-add")
  followupCompleted: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("parent-visit-id")
  parentVisitId: number = null;

  public patAndVisInfo: any = null;
  public followupVisitObj: Visit = new Visit();


  public todaysDate: any;
  public daysPassed: number = 0;
  public loading: boolean = false;//to restrict double click

  constructor(public msgBoxServ: MessageboxService,
    public router: Router,
    public securityService: SecurityService,
    public routeFromService: RouteFromService,
    public vaccBlService: VaccinationBLService,
    public coreService: CoreService) {
    this.todaysDate = moment().format("YYYY-MM-DD HH:mm");

  }



  ngOnInit() {
    //assign properties of parentVisit to Current Visit
    if (this.parentVisitId) {
      this.LoadParentVisitDetails(this.parentVisitId);
    }
  }

  LoadParentVisitDetails(visitId: number) {

    this.vaccBlService.GetPatientAndVisitInfo(visitId).subscribe(res => {
      if (res.Status == "OK") {
        this.patAndVisInfo = res.Results;
        let todaysDateFormatted = moment(this.todaysDate).format("YYYY-MM-DD");
        this.daysPassed = moment(todaysDateFormatted).diff(moment(this.patAndVisInfo.VisitDate, "YYYY-MM-DD"), "days");
        this.coreService.FocusInputById("btnSaveFollowup", 200);

      } else {
        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
      }
    });


    // this.patAndVisInfo = new Visit();



  }


  SaveFollowUp() {
    this.loading = true;//disables FollowUp button

    this.followupVisitObj.DepartmentId = this.patAndVisInfo.DepartmentId;
    this.followupVisitObj.PatientId = this.patAndVisInfo.PatientId;
    this.followupVisitObj.VisitDate = moment().format("yyyy-MM-dd HH:mm");
    this.followupVisitObj.VisitTime = moment().format("HH:mm");
    this.followupVisitObj.AppointmentType = "followup";
    this.followupVisitObj.VisitType = "outpatient";
    this.followupVisitObj.BillingStatus = "free";
    this.followupVisitObj.IsVisitContinued = false;
    this.followupVisitObj.ParentVisitId = this.patAndVisInfo.PatientVisitId;




    this.vaccBlService.PostFollowupVisit(this.followupVisitObj)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["Followup created successfully."]);
          console.log(res.Results);
          this.followupCompleted.emit({ action: "free-followup", data: res.Results });
          this.loading = false;
        }
        else {
          this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
          console.log(res.ErrorMessage);
          this.loading = false;
        }
      });

    //this.followupCompleted.emit({ action: "free-followup", data: { Info: "Hello There from vacc followup." } });
  }



  Close() {
    this.followupCompleted.emit({ action: "close" });
  }

  public hotkeys(event) {
    if (event.keyCode == 27) {
      this.followupCompleted.emit("Close");
    }
  }
}
