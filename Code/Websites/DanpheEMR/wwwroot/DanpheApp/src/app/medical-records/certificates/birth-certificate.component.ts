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

@Component({
  selector: 'birth-certificate',
  templateUrl: "./birth-certificate.html",
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

// App Component class
export class BirthCertificateComponent {
  @Input("babyBirthDetailsId") babyBirthDetailId: number = null;
  @Output("closeBirthCertificate") closeBirthCertificate: EventEmitter<object> = new EventEmitter<object>();
  public CurrentBaby: BabyBirthDetails = new BabyBirthDetails();
  public loading: boolean = false;

  public BirthTypeList: Array<any> = new Array<any>();
  public BirthNumberTypeList: Array<any> = [{ type: "single birth", number: 1 },
  { type: "twin", number: 2 },
  { type: "multiple", number: 3 }];
  public HospitalDetails: any;

  public providerList: Array<Employee> = new Array<Employee>();
  public isFinalCertificate: boolean = false;
  public IssuedSignatory: any = '';
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
    this.GetBirthType();
    this.providerList = DanpheCache.GetData(MasterType.Employee, null);
    if (this.babyBirthDetailId) { this.GetBirthDetailForCertificate(); }
  }

  public GetHospital() {
    this.HospitalDetails = this.coreService.GetHospital();
  }

  public GetBirthType() {
    var birthTypeList = this.coreService.GetBirthType();
    birthTypeList.forEach(a => {
      this.BirthTypeList.push({ type: a, IsSelected: false });
    });
  }

  public GetBirthDetailForCertificate() {
    this.medicalRecordsBLService.GetBirthDetailForCertificate(this.babyBirthDetailId).subscribe(res => {
      if (res.Status == 'OK') {
        this.CurrentBaby = res.Results;
        if (!this.CurrentBaby.CertifiedBy || !this.CurrentBaby.IssuedBy || !this.CurrentBaby.BirthType) {
          this.AssignBirthNumberType();
          this.isFinalCertificate = false;
        } else {
          this.AssignCertAndIssuedSignatory();
          this.isFinalCertificate = true;
        }
      }
      else {
        this.msgBoxServ.showMessage("failed", ['Error Occured while getting Birth Detail. Please Try again Later']);
      }
    });
  }

  public AssignCertAndIssuedSignatory() {
    var issuedBy = this.providerList.find(p => p.EmployeeId == this.CurrentBaby.IssuedBy);
    var cetrBy = this.providerList.find(c => c.EmployeeId == this.CurrentBaby.CertifiedBy);
    if (issuedBy) { this.IssuedSignatory = issuedBy; }
    if (cetrBy) { this.CertifiedSignatory = cetrBy; }
  }

  public AssignBirthNumberType() {
    if (this.CurrentBaby.NumberOfBabies == 1) {
      this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 1).type;
    } else if (this.CurrentBaby.NumberOfBabies == 2) {
      this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 2).type;
    } else {
      this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 3).type;
    }
  }


  public myListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }

  public OnChangeIssuedSignatory() {

  }

  public OnChangeCertifiedSignatory() {

  }

  public UpdateBirthCertificationDetail() {
    if (this.loading) {
      var brthTyp = this.BirthTypeList.find(bt => bt.IsSelected);
      if (brthTyp) { this.CurrentBaby.BirthType = brthTyp.type; }
      if (this.IssuedSignatory && this.IssuedSignatory.EmployeeId) { this.CurrentBaby.IssuedBy = this.IssuedSignatory.EmployeeId; }
      if (this.CertifiedSignatory && this.CertifiedSignatory.EmployeeId) { this.CurrentBaby.CertifiedBy = this.CertifiedSignatory.EmployeeId; }
      if (this.CurrentBaby.BirthType && this.CurrentBaby.BirthNumberType
        && this.CurrentBaby.CertifiedBy && this.CurrentBaby.IssuedBy) {
        this.medicalRecordsBLService.PutBirthCertificateReportDetail(this.CurrentBaby).subscribe(res => {
          if (res.Status == "OK") {
            this.isFinalCertificate = true;
            this.loading = false;
            setTimeout(() => {
              this.Print();
            }, 100);
          } else {
            this.loading = false;
            this.msgBoxServ.showMessage("failed", ['Error Occured while Updating Birth Detail. Please Try again Later']);
          }
        });
      } else {
        this.loading = false;
      }
    }
  }

  public UpdateBirthCertPrintCount() {
    if (this.loading) {
      this.medicalRecordsBLService.PutBirthCertificatePrintDetail(this.CurrentBaby).subscribe(res => {
        if (res.Status == "OK") {
          setTimeout(() => {
            this.Print();
          }, 400);
          this.loading = false;
        } else {
          this.loading = false;
          this.msgBoxServ.showMessage("failed", ['Error Occured while Updating Birth Detail. Please Try again Later']);
        }
      });
    }

  }

  public Print() {
    let popupWinindow;
    if (document.getElementById("PrintPage")) {
      var printContents = document.getElementById("PrintPage").innerHTML;
    }
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = '<html><head>';
    documentContent += `<link rel="stylesheet" type="text/css" href="../../../../../themes/theme-default/DanpheStyle.css" />`
      + `</head>`;

    documentContent += '<body onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
    this.closeBirthCertificate.emit({close: true})
  }

  public Edit() {
    this.isFinalCertificate = false;
  }

  public Close() {
    this.closeBirthCertificate.emit({ close: true })
  }

}
