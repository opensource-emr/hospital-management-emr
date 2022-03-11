import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { HttpClient } from '@angular/common/http';
import { MedicalRecordsMasterDataVM, OperationTypeModel, DeathTypeModel, DischargeConditionTypeModel, DeliveryTypeModel, DischargeTypeModel } from '../shared/DischargeMasterData.model';
import { Employee } from '../../employee/shared/employee.model';
import { MasterType, DanpheCache } from '../../shared/danphe-cache-service-utility/cache-services';
import { MedicalRecordsSummary, MRSelectTypeName } from '../shared/medical-records.model';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { DeathDetails } from '../../adt/shared/death.detail.model';

@Component({
  selector: "view-mr-summary",
  templateUrl: "./mr-summary-view.html",
  styleUrls: ['./MR-summary.css']
})

export class ViewMedicalRecordComponent {
  @Output("closeViewMrPopup") closeViewMrPopup: EventEmitter<object> = new EventEmitter<object>();
  @Input("patDetail") patientDetail: any = null;
  public loading: boolean = false;
  public RecordSummary: MedicalRecordsSummary = null;
  public allMasterDataForMR: MedicalRecordsMasterDataVM = new MedicalRecordsMasterDataVM();
  public AllDoctors: Array<Employee> = [];

  public patientId: number = null;
  public patientVisitId: number = null;
  public medicalRecordId: number = null;
  public OperationDiagnosis: any;

  public showDeathPeriod: boolean = false;
  public allDataLoaded: boolean = false;

  public allTypeName: MRSelectTypeName = new MRSelectTypeName();

  constructor(public MedicalRecordsBLService: MR_BLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.RecordSummary = new MedicalRecordsSummary();
  }

  ngOnInit() {
    this.patientVisitId = this.patientDetail.PatientVisitId;
    this.patientId = this.patientDetail.PatientId;
    this.medicalRecordId = this.patientDetail.MedicalRecordId;

    this.AllDoctors = DanpheCache.GetData(MasterType.Employee, null);
    if (this.medicalRecordId) {
      this.GetPatientMRDetail();
    }
  }

  public GetPatientMRDetail() {
    this.MedicalRecordsBLService.GetPatientMRDetailWithMasterData(this.medicalRecordId, this.patientVisitId).subscribe(
      res => {
        if (res.Status == 'OK') {

          this.RecordSummary = res.Results.MedicalRecordOfPatient;
          this.OperationDiagnosis= this.RecordSummary.OperationDiagnosis;
          this.RecordSummary.BirthDetail = new BabyBirthDetails();
          this.allMasterDataForMR.AllOperationType = res.Results.AllOperationType;
          this.allMasterDataForMR.AllDischargeType = res.Results.AllDischargeType;
          this.allMasterDataForMR.AllBirthConditions = res.Results.AllBirthConditions;
          this.allMasterDataForMR.AllGravita = res.Results.AllGravita;
          if (this.RecordSummary.DischargeTypeId) {
            var dis = this.allMasterDataForMR.AllDischargeType.find(d => d.DischargeTypeId == this.RecordSummary.DischargeTypeId);
            if (dis) {
              this.allTypeName.DischargeTypeName = dis.DischargeTypeName;
              if (this.RecordSummary.DischargeConditionId) {
                var con = dis.DischargeConditionTypes.find(c => c.DischargeConditionId == this.RecordSummary.DischargeConditionId);
                if (con) {
                  this.allTypeName.DischargeConditionName = con.Condition;
                  if (this.RecordSummary.DeliveryTypeId) {
                    var del = con.CurrentConditionTypes.find(d => d.DeliveryTypeId == this.RecordSummary.DeliveryTypeId);
                    if (del) {
                      this.allTypeName.DeliveryTypeName = del.DeliveryTypeName;
                    }
                  }
                }
              }
              if (this.RecordSummary.DeathPeriodTypeId) {
                var dthPeriod = dis.DeathTypes.find(c => c.DeathTypeId == this.RecordSummary.DeathPeriodTypeId);
                if (dthPeriod) { this.allTypeName.DeathPeriodTypeName = dthPeriod.DeathType; }
              }
            }
          }
          // if (this.RecordSummary.BabyBirthConditionId) {
          //   var brthCondition = this.allMasterDataForMR.AllBirthConditions.find(bc => bc.BabyBirthConditionId == this.RecordSummary.BabyBirthConditionId);
          //   if (brthCondition) {this.allTypeName.BabyBirthConditionName = brthCondition.BirthConditionType;}
          // }
          if (this.RecordSummary.OperationTypeId) {
            var opr = this.allMasterDataForMR.AllOperationType.find(o => o.OperationId == this.RecordSummary.OperationTypeId);
            if (opr) { this.allTypeName.OperationTypeName = opr.OperationName; }
          }
          if (this.RecordSummary.GravitaId) {
            var grv = this.allMasterDataForMR.AllGravita.find(g => g.GravitaId == this.RecordSummary.GravitaId);
            if (grv) { this.allTypeName.GravitaName = grv.GravitaName; }
          }
          if (this.RecordSummary.OperatedByDoctor) {
            var doc = this.AllDoctors.find(d => d.EmployeeId == this.RecordSummary.OperatedByDoctor);
            if (doc) { this.allTypeName.OperatedByDoctorName = doc.FullName; }
          }
          if (this.RecordSummary.ShowBirthCertDetail) {
            if (this.RecordSummary.BabyBirthDetails && this.RecordSummary.BabyBirthDetails.length > 0) {
              this.RecordSummary.BabyBirthDetails.forEach(brthDet => {
                brthDet.BirthDate = moment(brthDet.BirthDate).format('YYYY-MM-DD');
              });
            }
          }
          if (this.RecordSummary.ShowDeathCertDetail) {
            if (this.RecordSummary.DeathDetail && this.RecordSummary.DeathDetail.DeathId) {
              this.RecordSummary.DeathDetail.DeathDate = moment(this.RecordSummary.DeathDetail.DeathDate).format('YYYY-MM-DD');
              this.RecordSummary.DeathDetail = Object.assign(new DeathDetails(), this.RecordSummary.DeathDetail);
            }
          } else {
            this.RecordSummary.DeathDetail = new DeathDetails();
          }
          if (this.RecordSummary.AllTestList && this.RecordSummary.AllTestList.length > 0) {
            this.RecordSummary.AllTestList.forEach(t => {
              t.IsSelected = true;
            })
          }

          this.allDataLoaded = true;
        }
        else {
          this.msgBoxServ.showMessage("error", ['Cannot Get the Record of Pateint. Please try later']);
        }
      },
      err => {
        this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
      });
  }

  public EditRecord() {
    this.closeViewMrPopup.emit({ action: 'edit', close: true });
  }

  public PrintRecord() {
    let popupWinindow;
    if (document.getElementById("patMrRecordDetail")) {
      var printContents = document.getElementById("patMrRecordDetail").innerHTML;
    }
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    var documentContent = '<html><head>';
    documentContent += `<link href="../../../../../assets-dph/external/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />`
      + `<link rel="stylesheet" type="text/css" href="../../../../../themes/theme-default/DanpheStyle.css" />`
      + `<link rel="stylesheet" type="text/css" href="../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;


    documentContent += '<body class="medical-record-body" onload="window.print()">' + printContents + '</body></html>';
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
    this.closeViewMrPopup.emit({ action: 'print', close: true });
  }

  public CloseMRViewPopUp() {
    this.closeViewMrPopup.emit({ action: null, close: true });
  }
}
