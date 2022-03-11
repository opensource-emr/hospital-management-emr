import { Component, ChangeDetectorRef, Input, EventEmitter, Output } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { HttpClient } from '@angular/common/http';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import MRGridColumnSettings from '../shared/Mr-gridcol.settings';
import { Employee } from '../../employee/shared/employee.model';
import { DanpheCache, MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { DeathDetails } from '../../adt/shared/death.detail.model';

@Component({
  selector: 'death-certificate',
  templateUrl: "./death-certificate.html",
  styles: [`.mt-checkbox {
    margin-bottom: 0px;
    padding-left: 25px;
  }
  .wd-100 {
    width: 100%;
  }
  .icheck-inline {
    margin-left: 10px;
  }`]
})

// App DeathCertificateComponent class
export class DeathCertificateComponent {
  @Input("deathDetailId") deathDetailId: number = null;
  @Output("closeDeathCertificate") closeDeathCertificate: EventEmitter<object> = new EventEmitter<object>();
  public deadPat: DeathDetails = new DeathDetails();
  public loading: boolean = false;
  public showPrint : boolean= false;
  public HospitalDetails: any;
  public printDetails: HTMLElement;
  public providerList: Array<Employee> = new Array<Employee>();
  public isFinalCertificate: boolean = false;
  public CertifiedSignatory: any = '';

  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {

  }
  ngOnInit() {
    this.GetHospital();
    this.providerList = DanpheCache.GetData(MasterType.Employee, null);
    if (this.deathDetailId) { this.GetDeathDetailForCertificate(); }
  }

  public GetHospital() {
    this.HospitalDetails = this.coreService.GetHospital();
  }

  
  public GetDeathDetailForCertificate() {
    this.medicalRecordsBLService.GetDeathDetailForCertificate(this.deathDetailId).subscribe(res => {
      if (res.Status == 'OK') {
        this.deadPat = res.Results;
        this.deadPat.DeathDate = moment(this.deadPat.DeathDate).format("YYYY/MM/DD");
        if (!this.deadPat.CertifiedBy || !this.deadPat.FatherName ||
          !this.deadPat.MotherName || !this.deadPat.CauseOfDeath) {
          this.isFinalCertificate = false;       
        } else {
          this.AssignCertBySignatory();
          this.isFinalCertificate = true;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ['Error Occured while getting Death Detail. Please Try again Later']);
      }
    });
  }

  public AssignCertBySignatory() {
    var cetrBy = this.providerList.find(c => c.EmployeeId == this.deadPat.CertifiedBy);
    if (cetrBy) { this.CertifiedSignatory = cetrBy; }
  }


  public myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  public OnChangeIssuedSignatory() {

  }

  public OnChangeCertifiedSignatory() {

  }

  public UpdateDeathCertificationDetail() {
    if (this.loading) {
      if (this.CertifiedSignatory && this.CertifiedSignatory.EmployeeId)
       { 
         this.deadPat.CertifiedBy = this.CertifiedSignatory.EmployeeId; 
        }
      if (this.deadPat.FatherName && this.deadPat.FatherName.trim() !== '' && this.deadPat.MotherName && this.deadPat.MotherName.trim() != ''
        && this.deadPat.CertifiedBy   && this.deadPat.CauseOfDeath
        && this.deadPat.CauseOfDeath.trim() != '') {
        this.medicalRecordsBLService.PutDeathCertificateReportDetail(this.deadPat).subscribe(res => {
          if (res.Status == "OK") {
            this.isFinalCertificate = true;
            this.loading = false;
            setTimeout(() => {
              this.Print();
            }, 100);
          } else {
            this.loading = false;
            this.msgBoxServ.showMessage("failed", ['Error Occured while Updating Death Detail. Please Try again Later']);
          }
        });
      } else {
        this.msgBoxServ.showMessage("failed", ['Some of the fields are missing. Please fill up the detail properly.']);
        this.loading = false;
      }
    }
  }

  public UpdateDeathCertPrintCount() {
    if (this.loading) {
      this.medicalRecordsBLService.PutDeathCertificatePrintDetail(this.deadPat).subscribe(res => {
        if (res.Status == "OK") {
          setTimeout(() => {
            this.Print();
          }, 100);
          this.loading = false;
        } else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ['Error Occured while Updating Death Detail. Please Try again Later']);
        }
      });
    }

  }

  // public Print() {
  //   let popupWinindow;
  //   if (document.getElementById("PrintPage")) {
  //     var printContents = document.getElementById("PrintPage").innerHTML;
  //   }
  //   popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
  //   popupWinindow.document.open();
  //   var documentContent = '<html><head>';
  //   documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../themes/theme-default/DanpheStyle.css" />`
  //     + `</head>`;

  //   documentContent += '<body onload="window.print()">' + printContents + '</body></html>';
  //   popupWinindow.document.write(documentContent);
  //   popupWinindow.document.close();
  //   this.closeDeathCertificate.emit({ close: true })
  // }

  public Print() {
    this.printDetails = document.getElementById("PrintPage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetails = null;
    this.showPrint = false;
  }

  public Edit() {
    this.isFinalCertificate = false;
  }

  public Close() {
    this.closeDeathCertificate.emit({ close: true })
  }

}
