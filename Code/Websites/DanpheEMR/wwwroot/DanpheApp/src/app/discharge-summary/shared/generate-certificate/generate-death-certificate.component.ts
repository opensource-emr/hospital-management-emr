import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../discharge-summary.bl.service';
import { VisitService } from '../../../appointments/shared/visit.service';
import * as moment from 'moment/moment';
import { PatientCertificate } from '../patient-certificate.model';
import { CoreService } from "../../../core/shared/core.service";
import { Employee } from '../../../employee/shared/employee.model';
import { Router } from "@angular/router";

@Component({
  selector: 'generate-death-certificate',
  templateUrl: './generate-death-certificate.html',
})

export class DeathCertificateComponent {
    @Input("CurrentDischargeSummary")
    public CurrentDischargeSummary: any;
    public showDeathCertificate: boolean;
    public HospitalDetails: any;
    public providerList: Array<Employee> = new Array<Employee>();
    public CertifiedSignatory: Employee = new Employee();
    public CurrentCertificate :PatientCertificate = new PatientCertificate();
    public Update:boolean = false;
    public DeathCause: string = null;
    public IsPrint:boolean = false;
    public FatherName: string = null;
    public MotherName : string = null;
    public DeathDate : string = null;
    public DeathTime : string = null;
    public Spouse:string = null;

    @Input("selectedPatient")
    public selectedPatient: any;
  PatientAddress: any;
  IsShowPage : boolean;
  CertifiedByName: any;
  CertifiedByDesignation: any;
  MNC: any;
    constructor(public security: SecurityService,
        public messgbox: MessageboxService,
        public patVisit: VisitService,
        public dischargeServ : DischargeSummaryBLService,
        public coreService: CoreService,
        public router: Router) {

      }


    @Input("showDeathCertificate")
    public set value(val: boolean) {
      this.IsShowPage = val;
      if(this.CurrentDischargeSummary && this.selectedPatient){
        if(this.CurrentDischargeSummary.IsSubmitted){
          this.IsPrint = true;
        }
        this.CurrentCertificate.FiscalYearName = this.CurrentDischargeSummary.FiscalYearName;
        this.CurrentCertificate.CertificateNumber = this.CurrentDischargeSummary.DeathCertificateNumber;
        this.GetDeathCertificate();
        this.DeathDate = moment().format('YYYY-MM-DD');
        this.DeathTime = moment().format("hh:mm:ss");
      }
      this.GetHospital();
      this.LoadEmployees();
      }

      public GetHospital(){
        this.HospitalDetails = this.coreService.GetHospital();
      }
      public LoadEmployees() {
        this.dischargeServ.GetProviderList()
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.providerList = res.Results;
              this.CertifiedSignatory = this.providerList[0];
            } else {
              this.messgbox.showMessage("error", [res.ErrorMessage]);
            }
          },
            err => {
              this.messgbox.showMessage("error", ['Failed to get Doctors list.. please check log for details.']);
              });
      }
      
      myListFormatter(data: any): string {
        let html = data["FullName"];
        return html;
      }
      
      OnChangeCertifiedSignatory(){
        if(this.CertifiedSignatory.EmployeeId){
          this.CurrentCertificate.CertifiedBySignatories =  JSON.stringify( { EmployeeId: this.CertifiedSignatory.EmployeeId, EmployeeFullName: this.CertifiedSignatory.FullName, Signature: this.CertifiedSignatory.LongSignature, DisplaySequence: this.CertifiedSignatory.DisplaySequence ? this.CertifiedSignatory.DisplaySequence : 1000, MedCertificationNo : this.CertifiedSignatory.MedCertificationNo });
          this.CertifiedByName =  this.CertifiedSignatory.FullName;
          this.CertifiedByDesignation = this.CertifiedSignatory.LongSignature;
          this.MNC = this.CertifiedSignatory.MedCertificationNo;
        }
      }

      GetDeathCertificate(){
 this.dischargeServ.GetCertificate(this.CurrentDischargeSummary.DischargeSummaryId, this.CurrentDischargeSummary.PatientId)
    .subscribe(res => {
      if (res.Status == "OK") {
        var Certificate = res.Results.certificate;
        if(Certificate.length > 0){
          this.CurrentCertificate = Certificate[0];
          var obj = JSON.parse(this.CurrentCertificate.CertifiedBySignatories);
          this.CertifiedSignatory.FullName =obj.EmployeeFullName;
          this.CertifiedSignatory.EmployeeId =obj.EmployeeId;
          this.CertifiedByName =  this.CertifiedSignatory.FullName;
          this.CertifiedByDesignation = obj.LongSignature;
          this.MNC = obj.MedCertificationNo;
          this.Update = true;
          this.FatherName = this.CurrentCertificate.FatherName;
          this.MotherName = this.CurrentCertificate.MotherName ;
           this.Spouse =this.CurrentCertificate.Spouse ;
           this.DeathDate = moment(this.CurrentCertificate.DeathDate).format('YYYY-MM-DD'); 
           this.DeathTime = this.CurrentCertificate.DeathTime;
           this.DeathCause = this.CurrentCertificate.DeathCause ;
        }
        else{
          this.CurrentCertificate = new PatientCertificate();
          this.CurrentCertificate.FiscalYearName = this.CurrentDischargeSummary.FiscalYearName;
          this.CurrentCertificate.CertificateNumber = this.CurrentDischargeSummary.DeathCertificateNumber;
          this.CurrentCertificate.DischargeSummaryId = this.CurrentDischargeSummary.DischargeSummaryId;
        }
        
        if(res.Results.PatAddress){
        this.PatientAddress =res.Results.PatAddress;
        this.showDeathCertificate = this.IsShowPage;
        }
        else{
          this.messgbox.showMessage("error", ["No Address Found."]);
          this.router.navigate(['/Patient/SearchPatient']);
        }
      } else {
        this.messgbox.showMessage("error", [res.ErrorMessage]);
        console.log(res.ErrorMessage);
      }
    });
      }

      Save(){
        this.CurrentCertificate.CreatedOn = moment().format('YYYY-MM-DD');
        this.CurrentCertificate.CertificateType ="Death Report";
        this.CurrentCertificate.FatherName = this.FatherName;
        this.CurrentCertificate.MotherName = this.MotherName;
        this.CurrentCertificate.Spouse = this.Spouse;
        this.CurrentCertificate.DeathTime = this.DeathTime;
        this.CurrentCertificate.DeathDate = this.DeathDate;
        this.CurrentCertificate.DeathCause = this.DeathCause;
        this.CurrentCertificate.CertificateNumber = this.CurrentDischargeSummary.DeathCertificateNumber;
        if(this.FatherName && this.MotherName && this.DeathCause){
        if(this.CurrentCertificate.CertifiedBySignatories && this.CheckDatesValidation()){
          this.dischargeServ.PostCertificate(this.CurrentCertificate)
          .subscribe(res => {
            if (res.Status == 'OK') {
             // this.update == true;
              this.messgbox.showMessage("Success", ["Certificate is created successfully"]);
            } else {
              this.messgbox.showMessage("error", [res.ErrorMessage]);
            }
          },
            err => {
              this.messgbox.showMessage("error", ['please check log for details.']);
              });
        }else{
          this.messgbox.showMessage("error", ['Select Signatories']);
        }
      }
      else{
        this.messgbox.showMessage("", ['Fill all Fields.']);
      }
      }
      UpdateCertificate(){
        this.CurrentCertificate.FatherName = this.FatherName;
        this.CurrentCertificate.MotherName = this.MotherName;
        this.CurrentCertificate.Spouse = this.Spouse;
        this.CurrentCertificate.DeathTime = this.DeathTime;
        this.CurrentCertificate.DeathDate = this.DeathDate;
        this.CurrentCertificate.DeathCause = this.DeathCause;
        if(this.CurrentCertificate.CertifiedBySignatories){
          this.dischargeServ.UpdateCertificate(this.CurrentCertificate)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.messgbox.showMessage("Success", ["Certificate is updated successfully."]);
            } else {
              this.messgbox.showMessage("error", [res.ErrorMessage]);
            }
          },
            err => {
              this.messgbox.showMessage("error", ['please check log for details.']);
              });
        }else{
          this.messgbox.showMessage("error", ['Select Signatories']);
        }
      }

      public CheckDatesValidation() {
        if(this.DeathDate > moment().format('YYYY-MM-DD')){
              return false;
        } 
        else{
          return true;
        }
      }

      Print(){
          let popupWinindow;
          // var headerContent = document.getElementById("PrintCertificate").innerHTML;
          // var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
          var printContents = '<style> #PrintPage { padding: 10px; } </style>';
           printContents += document.getElementById("PrintPage").innerHTML;
          popupWinindow = window.open('', '_blank', 'width=700,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
          popupWinindow.document.open();
          let documentContent = "<html><head>";
          documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
          documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
          documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
          documentContent += '</head>';
          documentContent +='<body onload="window.print()">' + printContents + '</body></html>'
          popupWinindow.document.write(documentContent);
          popupWinindow.document.close();
      }
}
