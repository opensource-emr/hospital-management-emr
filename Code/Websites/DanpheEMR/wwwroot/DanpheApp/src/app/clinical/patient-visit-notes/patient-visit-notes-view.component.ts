import {  Component} from "@angular/core";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { PatientService } from "../../patients/shared/patient.service";
import { VisitService } from "../../appointments/shared/visit.service";
import { IOAllergyVitalsBLService } from "../shared/io-allergy-vitals.bl.service";
import { PatientVisitNoteVM } from "./patient-visit-note-view-model";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./patient-visit-notes-view.component.html",
})
export class PatientVisitNoteViewComponent {
  public hpNote: any = null;
  public subjectiveNote: any = null;
  public objectiveNote: any = null;
  public diagnosisOrderList: Array<any> = null;
  public freeText: any = null;
  public Prescription: any = null;
  public OrdersList: Array<any> = [];
  public headerDetail: {
    header1;
    header2;
    header3;
    header4;
    hospitalName;
    address;
    email;
    PANno;
    tel;
    DDA;
  };
  public patId: number = 0;
  public patVisitId: number = 0;
  public patientQRCodeInfo: string = "";
  public notesId: number = 0;
  public showView: boolean = false;
  public patientVisitNote = new PatientVisitNoteVM();
  public patVisitCode: string = null;
  public departmentName:string=null;
  public showAyurvedVitals:boolean=false;
  constructor(
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public patientService: PatientService,
    public IOAllergeBLService: IOAllergyVitalsBLService,
    public visitService: VisitService,
    public router: Router
  ) {
    this.patVisitCode = this.visitService.getGlobal().VisitCode;
    this.patId = this.patientService.getGlobal().PatientId;
    this.patVisitId = this.visitService.getGlobal().PatientVisitId;
    this.departmentName=this.visitService.getGlobal().DepartmentName;
    this.GetHeaderParameter();
    this.showView = false;
    this.GetPatientVisitNoteAllData();
    this.showAyurvedVitals = this.coreService.ShowAyurvedVitals();
  }
  GetPatientVisitNoteAllData() {
    this.IOAllergeBLService.GetPatientVisitNoteAllData(
      this.patId,
      this.patVisitId
    ).subscribe((res) => {
      if (res.Status == "OK" && res.Results) {
        this.patientVisitNote = new PatientVisitNoteVM();
        this.patientVisitNote = res.Results;
       
        if(this.patientVisitNote.patVisitNote.PatientVisitNote.Diagnosis.trim().length > 0){
          this.patientVisitNote.diagnosisList= JSON.parse(this.patientVisitNote.patVisitNote.PatientVisitNote.Diagnosis);
        }

        for(var i=0; i < this.patientVisitNote.vitalsList.length; i++){
          if(this.patientVisitNote.vitalsList[i].BodyPart.trim().length > 0){
            this.patientVisitNote.bodyPainList= JSON.parse(this.patientVisitNote.vitalsList[i].BodyPart);
          }
        }
        var frtypes = new Array<FrequencyModel>();
        frtypes = [
          {FrequencyId:1, Type:"0-0-1"},
        {FrequencyId:2, Type:"0-1-0"},
        {FrequencyId:3, Type:"1-0-0"},
        {FrequencyId:4, Type:"0-1-1"},
        {FrequencyId:5, Type:"1-0-1"},
        {FrequencyId:6, Type:"1-1-0"},
        {FrequencyId:7, Type:"1-1-1"},
        {FrequencyId:8, Type:"1-1-1-1"} ];
        for(var i=0;i<this.patientVisitNote.homeMedicationList.length; i++){
          
           let frq=frtypes.find(f=>f.FrequencyId==this.patientVisitNote.homeMedicationList[i].FrequencyId);
           if(frq){
            this.patientVisitNote.homeMedicationList[i].FrequencyType=frq.Type;
           }
        }
        
        console.log(res.Results);
        this.showView = true;
      } else if (res.Status == "Failed") {
        this.msgBoxServ.showMessage("notice", [res.ErrorMessage]);
        this.Close();
      } else {
        this.msgBoxServ.showMessage("error", ["Please check error in console"]);
        console.log(res.ErrorMessage);
        this.Close();
      }
    });
  }

  GetHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      (a) => a.ParameterName == "CustomerHeader"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", [
        "Please enter parameter values for CustomerHeader",
      ]);
  }

  
    //thi sis used to print the receipt
    printTemplate() {
      let popupWinindow;
      var printContents = document.getElementById("printpage").innerHTML;
      popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
      popupWinindow.document.open();

      let documentContent = "<html><head>";
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanphePrintStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
      documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/Danphe_ui_style.css"/>';
      documentContent += `<style>
      .img-responsive{ position: static;left: -65px;top: 10px;}
      .qr-code{position: absolute; left: 1001px;top: 9px;}
      .invoice-print-header .col-md-2 {
          width: 20%;
          float: left;
      }
      .invoice-print-header .col-md-8 {
          width: 60%;
          float: left;
      }
      .sub-main-cls, ul.adviceSubList li {
          width: 50% !important;
          display: inline-block !important;
          padding: 1%;
      }
      ul.adviceSubList li {
           flex: 0 0 47%;
      }
      .sub-main-cls-fullwidth, ul.adviceSubList li .sub-main-cls {
          width: 100% !important;
          display: block !important;
      }
      .dsv-div .left-panel .patient-hdr-label, .left-panel .patient-hdr-label {
          display: inline-block;
          width: 33.33%;
      }
      .left-panel .patient-hdr-label.signature, .dr-signature-list .patient-hdr-label {
          max-width: 400px;
          width: 100%;
          display: block;
      }
      .left-panel .patient-hdr-label b:before,
      .p-relative b:before {
          display: none !important;    
      }
      </style>`;

      documentContent += '</head>';
      documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
      popupWinindow.document.write(documentContent);
      popupWinindow.document.close();
  }

  Close() {
    this.showView = false;
    this.router.navigate([
      "/Doctors/PatientOverviewMain/Clinical/PatientVisitNote",
    ]);
  }
}
class FrequencyModel {
  FrequencyId: number;
  Type:string
}

