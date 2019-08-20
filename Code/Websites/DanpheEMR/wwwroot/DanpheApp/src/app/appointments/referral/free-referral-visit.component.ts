
import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Patient } from '../../patients/shared/patient.model';
import { Visit } from '../shared/visit.model';
import { VisitBLService } from '../shared/visit.bl.service';
import { Employee } from '../../employee/shared/employee.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import * as moment from 'moment/moment';
import { SecurityService } from '../../security/shared/security.service';
import { VisitService } from '../shared/visit.service';

@Component({
  selector: "danphe-free-referal-visit",
  templateUrl: "./free-referal-visit.html"
})
export class FreeReferalVisitComponent {
  public showReferalPage: boolean = false;
  @Input("visit")
  public selectedVisit: Visit;
  @Output("add-referal")
  addreferal: EventEmitter<Object> = new EventEmitter<Object>();


  public doctorList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }> = [];
  public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }>;
  public selectedDoctor = { DepartmentId: 0, DepartmentName: "", ProviderId: 0, ProviderName: "", ItemName: "", Price: 0, IsTaxApplicable: false, DepartmentLevelAppointment: false };
  public selectedDepartment = { DepartmentId: 0, DepartmentName: "" };
  public departmentList: any;

  public departmentId: number = 0;




  public showmsgbox: boolean = false;
  public status: string = null;
  public message: string = null;
  public loading: boolean = false;//to restrict double click

  constructor(public visitBLService: VisitBLService,
    public msgBoxServ: MessageboxService, public securityService: SecurityService,
    public visitService: VisitService) {

    this.departmentList = this.visitService.ApptApplicableDepartmentList;
    this.doctorList = this.visitService.ApptApplicableDoctorsList;
    //All doctors will be shown at first..
    this.filteredDocList = this.visitService.ApptApplicableDoctorsList;
  }
  

  //load doctor  list according to department.
  //does a get request in employees table using departmentId.
  FilterDoctorList(): void {
    //erases previously selected doctor and clears respective schedule list

    if (this.departmentId != 0) {
      this.filteredDocList = this.doctorList.filter(d => d.DepartmentId == this.departmentId);
    }
    else {
      this.filteredDocList = this.doctorList;
    }


    //this.visitBLService.GetDoctorList(this.departmentId)
    //  .subscribe(res => this.CallBackGenerateDoctor(res));
  }


  myListFormatter(data: any): string {
    let html = data["Value"];
    return html;
  }


  public AssignSelectedDoctor() {
    let doctor = null;

    if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
      if (typeof (this.selectedDoctor) == 'string') {
        doctor = this.doctorList.find(a => a.ProviderName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
      }
      else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.ProviderId)
        doctor = this.doctorList.find(a => a.ProviderId == this.selectedDoctor.ProviderId);



      this.departmentId = doctor.DepartmentId;

    }
  }


  AddReferralVisit() {
    this.loading = true;//disables Refer button

    let refVis = new Visit();
    refVis.ProviderId = this.selectedDoctor.ProviderId;
    refVis.ProviderName = this.selectedDoctor.ProviderName;
    refVis.PatientId = this.selectedVisit.PatientId;
    refVis.DepartmentId = this.departmentId;

    refVis.VisitDate = moment().format("YYYY-MM-DD");
    refVis.VisitTime = moment().add(5, 'minute').format("HH:mm");//by default we add 5 minutes to the new visit.
    refVis.VisitType = "outpatient";
    refVis.VisitStatus = "Initiated";
    refVis.BillingStatus = "paid";
    refVis.ReferredByProvider = this.selectedVisit.ProviderId.toString();
    refVis.AppointmentType = "Referral";
    refVis.ParentVisitId = this.selectedVisit.PatientVisitId;
    refVis.CreatedBy = this.securityService.loggedInUser.EmployeeId;
    refVis.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");
    refVis.IsActive = true;


    this.visitBLService.PostFreeReferralVisit(refVis)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {

          this.addreferal.emit({ action: "free-referral", data: res.Results });
          this.loading = false;//enable Refer button once function completed
        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to add referral visit. Please try again.", res.ErrorMessage]);
          this.loading = false;
        }

      });

    this.loading = false;//enable Refer button once function completed

  }
  Close() {
    this.addreferal.emit({ action: "close" });
  }


  ProviderListFormatter(data: any): string {
    let html = data["FullName"];//FullName is a property in the Employee Model.
    //let html = data["Salutation"] + "." + data["FirstName"] + "  " + data["LastName"];
    return html;
  }

  //used to format the display of item in ng-autocomplete.
  DocListFormatter(data: any): string {
    let html = data["ProviderName"];
    return html;
  }

}
