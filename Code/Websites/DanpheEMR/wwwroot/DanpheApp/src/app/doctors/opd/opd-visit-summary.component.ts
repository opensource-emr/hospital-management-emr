import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { Patient } from '../../patients/shared/patient.model';
import { ActiveMedical } from '../../clinical/shared/active-medical.model';
import { PatientService } from "../../patients/shared/patient.service";
import { CallbackService } from '../../shared/callback.service';
import { VisitService } from '../../appointments/shared/visit.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DoctorsBLService } from '../shared/doctors.bl.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import html2canvas  from 'html2canvas';
import * as jspdf from 'jspdf';

@Component({
    selector: "opd-visit-summary",
    templateUrl: "./opd-visit-summary.html"
})

export class OPDVisitSummaryComponent {
    public currentPatient: Patient = null;
    public patientVisitId: number = null;

    //used to view lab report of selected test
    public labRequisitionId: number = null;
    public showLabReport: boolean = false;

    public imagingRequisitionId: number = null;
    public showImagingReport: boolean = false;
    public selectedProblem: ActiveMedical;
    public showAddProblemNote: boolean = false;
    public enableAddOrders: boolean = true;

    @Input("")
    public showSummaryPage: boolean = true;

    constructor(public patientservice: PatientService,
        public callBackService: CallbackService,
        public changeDetector: ChangeDetectorRef,
        public router: Router,
        public visitservice: VisitService,
        public msgBoxServ: MessageboxService,
        public doctorsBLService: DoctorsBLService,
        public routeFromService: RouteFromService) {
        this.showSummaryPage = true;

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
            pat.DateOfBirth = retPatient.DateOfBirth;
            pat.CountrySubDivisionId = retPatient.CountrySubDivisionId;
            pat.Gender = retPatient.Gender;
            pat.Salutation = retPatient.Salutation;
            pat.Allergies = retPatient.Allergies;

            pat.Vitals = retPatient.Vitals;
            pat.Problems = retPatient.Problems;
            pat.MedicationPrescriptions = retPatient.MedicationPrescriptions;
            pat.LabRequisitions = retPatient.LabRequisitions;
            //pat.ImagingReports = retPatient.ImagingReports;
            pat.ImagingItemRequisitions = retPatient.ImagingItemRequisitions;

            this.currentPatient = this.patientservice.getGlobal();

            this.currentPatient["MedAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Allergy");
            this.currentPatient["AdvReaction"] = retPatient.Allergies.filter(a => a.AllergyType == "AdvRec");
            this.currentPatient["OtherAllergy"] = retPatient.Allergies.filter(a => a.AllergyType == "Others");

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
        this.labRequisitionId = labRequisitionId;
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
        this.labRequisitionId = null;
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


    Add() {

    }

    Close() {
      this.showSummaryPage = false;
    

    }
    Print() {
        let popupWinindow;
        var printContents = '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';
        printContents += document.getElementById("printpage").innerHTML;
        popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        let documentContent = "<html><head>";
        documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
        documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        documentContent += '</head>';
        documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
      }

      PdfDownload(){
        var data = document.getElementById('printpage');  
        html2canvas(data).then(canvas => {  
          // Few necessary setting options  
          var imgWidth = 208;   
          var pageHeight = 295;     
          var imgHeight = canvas.height * imgWidth / canvas.width;  
          var heightLeft = imgHeight;  
      
          const contentDataURL = canvas.toDataURL('image/png')  
          let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF  
          var position = 0;  
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
          pdf.save('VisitSummary.pdf'); // Generated PDF   
        });
      }
}

