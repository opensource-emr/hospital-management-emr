    
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DischargeSummaryBLService } from '../discharge-summary.bl.service';
import { BabyBirthDetails } from '../../../adt/shared/baby-birth-details.model';
import { VisitService } from '../../../appointments/shared/visit.service';
import * as moment from 'moment/moment';
import { PatientCertificate } from '../patient-certificate.model';
import { CoreService } from "../../../core/shared/core.service";
import { Employee } from '../../../employee/shared/employee.model';
import { Router } from "@angular/router";

@Component({
  selector: 'generate-birth-certificate',
  templateUrl: './generate-birth-certificate.html',
})

export class BirthCertificateGenerateComponent {
 public showBirthCertificate: boolean;

 @Input("selectedBaby")
 public selectedBaby: any;
 @Input("CurrentDischargeSummary")
 public CurrentDischargeSummary: any;
 public CurrentFiscalYear : string;
 public CurrentBaby : BabyBirthDetails = new BabyBirthDetails();
 public CertificateNumber :string = null;
 public CurrentCertificate :PatientCertificate = new PatientCertificate();
 public BirthCertificateLists: Array<PatientCertificate> = new Array<PatientCertificate>();
 public PatientAddress: any;
 public CertificateList : Array<PatientCertificate> = new Array<PatientCertificate>();
 public BirthType:string = "single birth";
 public BirthTypeList:Array<any> = new Array<any>();
 public HospitalDetails: any;
 public IsShowPage: boolean = false;
 public allEmployees: Array<any> = []; //changed
 public allEmpsFormatted: Array<any> = [];
 public selEmployees: Array<any> = [];
 public returnList = [];
 public providerList: Array<Employee> = new Array<Employee>();
 public IssuedSignatory: Employee = new Employee();
 public CertifiedSignatory:Employee = new Employee();
 public IsPrint:boolean = false;
 public IsSelected : boolean= false;
  IssuedByName: any;
  IssuedByDesignation: any;
  CertifiedByDesignation: any;
  CertifiedByName: any;
  public update: boolean = false;

  constructor(public security: SecurityService,
    public messgbox: MessageboxService,
    public patVisit: VisitService,
    public dischargeServ : DischargeSummaryBLService,
    public coreService: CoreService,
    public router: Router) {
  }
  @Input("showBirthCertificate")
  public set value(val: boolean) {
    this.IsShowPage = val;
    if(this.selectedBaby && this.CurrentDischargeSummary){
      if(this.CurrentDischargeSummary.IsSubmitted){
        this.IsPrint = true;
      }
      this.CurrentBaby = this.CurrentDischargeSummary.BabyBirthDetails[0];
     this.GetBirthType();
     this.GetHospital();
     this.LoadEmployees();
     this.GetCertificate();
    }
  }

  public GetBirthType(){
    var birthTypeList = this.coreService.GetBirthType();
    birthTypeList.forEach(a=>{
      this.BirthTypeList.push({type : a, IsSelected : false});
    });
  }

  public GetHospital(){
    this.HospitalDetails = this.coreService.GetHospital();
  }
  public GetCertificate(){
    this.dischargeServ.GetCertificate(this.CurrentDischargeSummary.DischargeSummaryId, this.CurrentDischargeSummary.PatientId)
    .subscribe(res => {
      if (res.Status == "OK") {
          this.BirthCertificateLists = res.Results.certificate;
        if(this.BirthCertificateLists.length > 0){
          this.update = true;
          this.CurrentCertificate = this.BirthCertificateLists[0];
          var obj = JSON.parse(this.CurrentCertificate.CertifiedBySignatories);
          var obj1 = JSON.parse(this.CurrentCertificate.IssuedBySignatories);

          this.CertifiedSignatory.FullName =obj.EmployeeFullName;
          this.CertifiedSignatory.EmployeeId =obj.EmployeeId;
          this.CertifiedByName =  this.CertifiedSignatory.FullName;
          this.CertifiedByDesignation = obj.LongSignature;

          this.IssuedSignatory.FullName =obj1.EmployeeFullName;
          this.IssuedSignatory.EmployeeId =obj1.EmployeeId;
          this.IssuedByName =  this.IssuedSignatory.FullName;
          this.IssuedByDesignation = obj1.LongSignature;
          // this.IssuedSignatory = this.CurrentCertificate.IssuedBySignatories;
          // this.CertifiedSignatory = this.CurrentCertificate.CertifiedBySignatories;
          this.BirthTypeList.forEach(a=>{
            if(a.type == this.CurrentCertificate.BirthType){
              a.IsSelected = true;
              this.BirthType = this.CurrentCertificate.BirthType;
            }
            else{
              a.IsSelected = false;
            }
          })
          
        }
        else{
          this.CurrentCertificate = new PatientCertificate();
          this.CurrentCertificate.FiscalYearName = this.CurrentDischargeSummary.FiscalYearName;
          this.CurrentCertificate.CertificateNumber = this.CurrentBaby.CertificateNumber;
          this.CurrentCertificate.DischargeSummaryId = this.CurrentDischargeSummary.DischargeSummaryId;
          this.CurrentCertificate.BabyBirthDetailsId = this.selectedBaby.BabyBirthDetailsId;
          this.CurrentCertificate.BirthType = this.BirthTypeList[0].type;
        }
 
        if(res.Results.PatAddress){
        this.PatientAddress =res.Results.PatAddress;
        this.showBirthCertificate = this.IsShowPage;
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

  CheckBirthType(val){
      this.BirthTypeList.forEach(a=>{
        if(a.type != val.type){
          a.IsSelected = false;
        }
      });
      this.CurrentCertificate.BirthType = val.type;
  }
public LoadEmployees() {
  this.dischargeServ.GetProviderList()
    .subscribe(res => {
      if (res.Status == 'OK') {
        this.providerList = res.Results;
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

OnChangeIssuedSignatory() {
  if(this.IssuedSignatory.EmployeeId){
    this.CurrentCertificate.IssuedBySignatories =  JSON.stringify( { EmployeeId: this.IssuedSignatory.EmployeeId, EmployeeFullName: this.IssuedSignatory.FullName, Signature: this.IssuedSignatory.LongSignature, DisplaySequence: this.IssuedSignatory.DisplaySequence ? this.IssuedSignatory.DisplaySequence : 1000 });
    this.IssuedByName = this.IssuedSignatory.EmployeeId;
    this.IssuedByDesignation = this.IssuedSignatory.LongSignature;
  }
}
OnChangeCertifiedSignatory(){
  if(this.CertifiedSignatory.EmployeeId){
    this.CurrentCertificate.CertifiedBySignatories =  JSON.stringify( { EmployeeId: this.CertifiedSignatory.EmployeeId, EmployeeFullName: this.CertifiedSignatory.FullName, Signature: this.CertifiedSignatory.LongSignature, DisplaySequence: this.CertifiedSignatory.DisplaySequence ? this.CertifiedSignatory.DisplaySequence : 1000 });
    this.CertifiedByName = this.CertifiedSignatory.EmployeeId;
    this.CertifiedByDesignation = this.CertifiedSignatory.LongSignature;
  }
}

Save(){
  this.CurrentCertificate.CreatedOn = moment().format('YYYY-MM-DD');
  this.CurrentCertificate.CertificateType ="Birth Report";
  if(this.CurrentCertificate.IssuedBySignatories && this.CurrentCertificate.CertifiedBySignatories){
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

UpdateCertificate(){
  this.CurrentCertificate.CreatedOn = moment().format('YYYY-MM-DD');
  if(this.CurrentCertificate.IssuedBySignatories && this.CurrentCertificate.CertifiedBySignatories){
    this.dischargeServ.UpdateCertificate(this.CurrentCertificate)
    .subscribe(res => {
      if (res.Status == 'OK') {
        this.messgbox.showMessage("Success", ["Certificate is updated"]);
      } else {
        this.messgbox.showMessage("error", [res.ErrorMessage]);
      }
    },
      err => {
        this.messgbox.showMessage("error", [' please check log for details.']);
        });
  }else{
    this.messgbox.showMessage("error", ['Select Signatories']);
  }
}

Print(){
  let popupWinindow;
  // var headerContent = document.getElementById("PrintCertificate").innerHTML;
  // var printContents = '<b>Report Date Range: ' + this.fromDate + ' To ' + this.toDate + '</b>';
  var printContents = '<style> .container { border-collapse: collapse; border-color: black; } </style>';
   printContents += document.getElementById("PrintPage").innerHTML;
  popupWinindow = window.open('', '_blank', 'width=700,height=800,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
  popupWinindow.document.open();
  let documentContent = "<html><head>";
  documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
  documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
  documentContent += '<link rel="stylesheet" type="text/css"  media="print" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
  documentContent += '</head>';
  documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
  popupWinindow.document.write(documentContent);
  popupWinindow.document.close();
}
}
