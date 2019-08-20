import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Patient } from '../../patients/shared/patient.model';
import { ActiveMedical } from '../../clinical/shared/active-medical.model';
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DoctorsBLService } from '../shared/doctors.bl.service';
import { RouteFromService } from "../../shared/routefrom.service";


@Component({
    templateUrl: "../../view/doctors-view/PatientOverview.html" //"/DoctorsView/PatientOverview"
})


export class PatientOverviewComponent {

    public currentPatient: Patient = null;
    public patientVisitId: number = null;

    //used to view lab report of selected test
    public labRequisitionIdList: Array<number>;
    public showLabReport: boolean = false;

    public imagingRequisitionId: number = null;
    public showImagingReport: boolean = false;
    public selectedProblem: ActiveMedical;
    public showAddProblemNote: boolean = false;
    public enableAddOrders: boolean = true;
    constructor(public patientservice: PatientService,
        public callBackService: CallbackService,
        public changeDetector: ChangeDetectorRef,
        public router: Router,
        public visitservice: VisitService,
        public msgBoxServ: MessageboxService,
        public doctorsBLService: DoctorsBLService,
        public routeFromService: RouteFromService) {

        this.currentPatient = new Patient();
        this.patientVisitId = this.visitservice.globalVisit.PatientVisitId;
        this.CheckRouteFrom();
        this.ShowPatientPreview();
    }
    public CheckRouteFrom() {
        if (this.routeFromService.RouteFrom == "nursing") {
            this.enableAddOrders = false;
            this.routeFromService.RouteFrom = null;
        }
    }

    ShowPatientPreview() {

        let patientId = this.patientservice.getGlobal().PatientId;
        let patientVisitId = this.visitservice.getGlobal().PatientVisitId;
        this.doctorsBLService.GetPatientPreview(patientId, patientVisitId)
            .subscribe(res => {
                this.CallBackPatientPreview(res)
                this.routeFromService.RouteFrom = null;
            });
    }

    CallBackPatientPreview(res) {

        if (res.Status == "OK") {

            let retPatient: Patient = res.Results;

            var pat = this.patientservice.getGlobal();
            pat.PatientId = retPatient.PatientId;
            pat.FirstName = retPatient.FirstName;
            pat.LastName = retPatient.LastName;
            pat.MiddleName = retPatient.MiddleName;
            pat.ShortName = retPatient.ShortName;
            pat.PatientCode = retPatient.PatientCode;
            pat.DateOfBirth = retPatient.DateOfBirth;
            pat.CountrySubDivisionId = retPatient.CountrySubDivisionId;
            pat.Gender = retPatient.Gender;
            pat.Salutation = retPatient.Salutation;
            pat.Allergies = retPatient.Allergies;
            pat.BedNo = retPatient.BedNo;
            pat.WardName = retPatient.WardName; 

            pat.Vitals = retPatient.Vitals;
            pat.Problems = retPatient.Problems;
            pat.MedicationPrescriptions = retPatient.MedicationPrescriptions;
            pat.LabRequisitions = retPatient.LabRequisitions;
            pat.ProfilePic = retPatient.ProfilePic;
            //pat.ImagingReports = retPatient.ImagingReports;
            pat.ImagingItemRequisitions = retPatient.ImagingItemRequisitions;
            this.currentPatient = this.patientservice.getGlobal();

            this.currentPatient["MedAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Allergy");
            this.currentPatient["AdvReaction"] = retPatient.Allergies.filter(a => a.AllergyType == "AdvRec");
            this.currentPatient["OtherAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Others");

            //format patient allergies so that we can show them in PatOverviewMain Page.
            pat.FormatPatientAllergies();
           

        }
        else {
            this.msgBoxServ.showMessage("error", [res.ErrorMessage]);

        }
    }

    AddAllergy() {
        this.callBackService.CallbackRoute = "/Doctors/PatientOverview";
        this.router.navigate(['/Clinical/Allergy']);
        //this.allergy.AddAllergy();
    }

    routeTo(route: string = null) {
        this.routeFromService.RouteFrom = route;
        this.router.navigate(['/Doctors/PatientOverviewMain/Orders']);

    }
    public ViewLabReport(labRequisitionId: number) {
        this.labRequisitionIdList = [labRequisitionId];
        this.showLabReport = true;

    }
    public ViewImagingReport(imagingRequisitionId: number) {
        this.imagingRequisitionId = null;
        this.showImagingReport = false;
        this.changeDetector.detectChanges();
        this.imagingRequisitionId = imagingRequisitionId;
        this.showImagingReport = true;
    }

    public CloseLabReport() {
        this.labRequisitionIdList = null;
        this.showLabReport = false;

    }
    public CloseImagingReport() {
        this.imagingRequisitionId = null;
        this.showImagingReport = false;
    }
    public CloseAddProblemNote() {
        this.selectedProblem = null;
        this.showAddProblemNote = false;
    }
    public ShowAddProblemNote(problem: ActiveMedical) {
        this.selectedProblem = new ActiveMedical();
        this.selectedProblem = Object.assign(this.selectedProblem, problem);
        this.showAddProblemNote = true;
    }
    public AddProblemNote() {
        this.selectedProblem.ActiveMedicalValidator.controls["Note"].markAsDirty();
        this.selectedProblem.ActiveMedicalValidator.controls["Note"].updateValueAndValidity();
        if (this.selectedProblem.ActiveMedicalValidator.controls["Note"].valid) {
            this.doctorsBLService.PutActiveMedical(this.selectedProblem)
                .subscribe(res => {
                    if (res.Status == "OK") {
                        var index = this.currentPatient.Problems.findIndex(a => a.PatientProblemId == this.selectedProblem.PatientProblemId);
                        this.msgBoxServ.showMessage("success", ["Note Updated"]);
                        this.currentPatient.Problems[index] = res.Results;
                        this.CloseAddProblemNote();
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                        console.log(res.ErrorMessage);
                    }
                });
        }
    }
}