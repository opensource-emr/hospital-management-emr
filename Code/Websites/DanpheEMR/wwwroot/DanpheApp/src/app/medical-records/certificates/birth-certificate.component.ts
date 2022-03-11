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
 

  public BirthTypeList: Array<any> = new Array<any>();
  public BirthNumberTypeList: Array<any> = [{ type: "single", number: 1 }, { type: "twin", number: 2 }, { type: "multiple", number: 3 }];
  public HospitalDetails: any;

  public providerList: Array<Employee> = new Array<Employee>();
  public isEditmode: boolean = false;
  public IssuedSignatory: any = '';
  public CertifiedSignatory: any = '';
  public showSavePopup: boolean = false;
  printDetails: HTMLElement;
  showPrint: boolean;
  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef,
    public coreService: CoreService) {

  }
  ngOnInit() {
    this.providerList = DanpheCache.GetData(MasterType.Employee, null);
    this.GetHospital();
    this.GetBirthType();
    if (this.babyBirthDetailId) { this.GetBirthDetailForCertificate(); }
  }

  public GetHospital() {
    this.HospitalDetails = this.coreService.GetHospital();
  }

  public GetBirthType() {
    var birthTypeList = this.coreService.GetBirthType();
    this.BirthTypeList = birthTypeList.map(birthType => { return { type: birthType, IsSelected: false } });
  }

  public GetBirthDetailForCertificate() {
    this.medicalRecordsBLService.GetBirthDetailForCertificate(this.babyBirthDetailId).subscribe(res => {
      if (res.Status == 'OK') {
        this.CurrentBaby = res.Results;
        // if (!this.CurrentBaby.CertifiedBy || !this.CurrentBaby.IssuedBy || !this.CurrentBaby.BirthType) {
        //   this.AssignBirthNumberType(); 
        //   this.isEditmode = false;
        // } else {
           this.AssignCertAndIssuedSignatory();
        // }
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
    try {
      if (this.CurrentBaby.NumberOfBabies > 0) {
        if (this.CurrentBaby.NumberOfBabies == 1) {
          this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 1).type;
        } else if (this.CurrentBaby.NumberOfBabies == 2) {
          this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 2).type;
        } else {
          this.CurrentBaby.BirthNumberType = this.BirthNumberTypeList.find(bn => bn.number == 3).type;
        }
      }

      else {
        this.msgBoxServ.showMessage("failed", ['Baby birth details not found']);
      }
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
      this.closesavePopup();
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
      // this.AssignBirthNumberType();
      //  this.AssignCertAndIssuedSignatory();
      var isValid: boolean = true;
      var errorMessages: string[] = [];
      if (!this.CurrentBaby.BirthNumberType) {
        errorMessages.push("Birth Number (single, twin, multiple) field is missing in Birth Certificate.");
        isValid = false;
      }
      if (!this.CurrentBaby.BirthType) {
        errorMessages.push("Birth Type field is missing in Birth Certificate.");
        isValid = false;
      }
      if (!this.IssuedSignatory || !this.IssuedSignatory.EmployeeId) {
        errorMessages.push("Issued By field is missing in Birth Certificate.");
        isValid = false;
      }
      if (!this.CertifiedSignatory || !this.CertifiedSignatory.EmployeeId) {
        errorMessages.push("Certified By field is missing in Birth Certificate.");
        isValid = false;
      }
      if (isValid) {
        this.CurrentBaby.CertifiedBy = this.CertifiedSignatory.EmployeeId;
        this.CurrentBaby.IssuedBy = this.IssuedSignatory.EmployeeId;
        this.medicalRecordsBLService.PutBirthCertificateReportDetail(this.CurrentBaby).subscribe(res => {
          if (res.Status == "OK") {
            // setTimeout(() => {
            //   this.Print();
            // }, 100);
            this.msgBoxServ.showMessage("Sucess", ['Birth certificat has been updated sucessfully']);
            this.isEditmode=false;
          } else {
            
            this.msgBoxServ.showMessage("Failed", ['Error Occured while Updating Birth Detail. Please Try again Later']);
          }
        });
      } else {
        this.msgBoxServ.showMessage("Failed", errorMessages);
       
      }
    }
  

  public UpdateBirthCertPrintCount() {
      this.medicalRecordsBLService.PutBirthCertificatePrintDetail(this.CurrentBaby).subscribe(res => {
        if (res.Status == "OK") {
          // setTimeout(() => {
          //   this.Print();
          // }, 400);
          this.msgBoxServ.showMessage("Sucess", ['Birth certificate has been updated sucessfully']);
          this.isEditmode=false;
         
        } else {
          
          this.msgBoxServ.showMessage("failed", ['Error Occured while Updating Birth Detail. Please Try again Later']);
        }
      });
    }

  

  //this is used to print the receipt
  Print() {
    this.printDetails = document.getElementById("PrintPage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetails = null;
    this.showPrint = false;
    // this.closeBirthCertificate.emit({ close: true })
  }

  public Edit() {
    this.isEditmode = true;
  }

  public Close() {
    this.closeBirthCertificate.emit({ close: true })
  }
  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  closesavePopup() {
    this.showSavePopup = false;
  }
}
