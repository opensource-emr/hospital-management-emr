import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { ADT_DLService } from "../../adt/shared/adt.dl.service";
import { Visit } from "../../appointments/shared/visit.model";
import { ICD10 } from "../../clinical/shared/icd10.model";
import { PatientClinicalInfoModel } from "../../clinical/shared/patient-clinical-info.model";
import { FinalDiagnosisModel } from "../../medical-records/outpatient-list/final-diagnosis/final-diagnosis.model";
import { MR_BLService } from "../../medical-records/shared/mr.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { ENUM_DanpheHTTPResponses, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from "../../shared/shared-enums";
import { NursingOpdCheckIn_DTO } from "../shared/dto/nursing-opd-checkin.dto";
import { PerformerDetails_DTO } from "../shared/dto/performer-details.dto";
import { NursingBLService } from "../shared/nursing.bl.service";


@Component({
  selector: 'nursing-opd-checkin',
  templateUrl: './nursing-opd-checkin.component.html',
  styleUrls: ['./nursing-opd-checkin.component.css']
})
export class NursingOpdCheckinComponent implements OnInit {

  @Input('isCheckinForm')
  public showNursingCheckin: boolean = false;
  @Output() CallBackNursingCheckin = new EventEmitter<boolean>();

  @Output('nursing-opd-checkIn-callback)')
  NursingOpdCheckInCallback = new EventEmitter<object>();

  @Input('selected-visit')
  public selectedVisit: Visit;
  public addDiagnosis: ICD10[] = [];
  public selectedDiagnosis: ICD10[] = [];
  public providerList: PerformerDetails_DTO[] = [];
  public ICD10MainList: ICD10[] = [];
  public visitDate: string = '';
  public FinalDiagnosisList: FinalDiagnosisModel[] = [];
  public chiefComplaints: Array<PatientClinicalInfoModel> = [];
  public nursingOpdCheckIn: NursingOpdCheckIn_DTO = new NursingOpdCheckIn_DTO();
  public checkInDetails: NursingOpdCheckIn_DTO = new NursingOpdCheckIn_DTO();

  public selectedDiagnosisSubscription = new Subscription();



  constructor(
    public admissionDLService: ADT_DLService,
    public msgBoxServ: MessageboxService,
    public mrBLService: MR_BLService,
    public nursingBLService: NursingBLService
  ) {
    this.GetProviderList();
    this.GetICDList();
    this.OnSelectedDiagnosisListChanged();

  }
  ngOnInit(): void {
    ///Assign input value of Current Selected Visits to CurrentCheckInDetails
    //other values will be assigned later on.
    this.checkInDetails.PatientId = this.selectedVisit.PatientId;
    this.checkInDetails.PatientVisitId = this.selectedVisit.PatientVisitId;
    this.checkInDetails.PerformerId = this.selectedVisit.PerformerId;
    this.checkInDetails.PerformerName = this.selectedVisit.PerformerName;
    this.visitDate = moment(this.selectedVisit.VisitDate).format(ENUM_DateTimeFormat.Year_Month_Day);

  }

  ngOnDestroy() {
    this.selectedDiagnosisSubscription.unsubscribe();
  }

  OnSelectedDiagnosisListChanged() {
    this.selectedDiagnosisSubscription = this.nursingBLService.SelectedDiagnosisList().subscribe(res => {
      if (res) {
        this.OnDiagnosisSelected(res);
      }
    })
  }

  Close() {
    this.selectedDiagnosis = []
    this.chiefComplaints = new Array<PatientClinicalInfoModel>();
    this.NursingOpdCheckInCallback.emit({ action: 'close' });
    this.showNursingCheckin = false;
  }

  Discard() {
    this.selectedDiagnosis = []
    this.chiefComplaints = new Array<PatientClinicalInfoModel>();
    this.NursingOpdCheckInCallback.emit({ action: 'close' });
    this.showNursingCheckin = false;

  }

  providerListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }
  GetProviderList() {
    this.admissionDLService.GetProviderList().subscribe(
      res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.providerList = res.Results;

        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);

        }
      },
      (err) => {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);

      }
    );
  }

  addCheckInDetails() {

    this.AssignFinalDiagnosis();
    this.nursingOpdCheckIn = {
      DiagnosisList: this.FinalDiagnosisList,
      ChiefComplaints: this.chiefComplaints,
      PatientId: this.selectedVisit.PatientId,
      PatientVisitId: this.selectedVisit.PatientVisitId,
      PerformerName: this.selectedVisit.PerformerName,
      PerformerId: this.selectedVisit.PerformerId
    }
    if (this.nursingOpdCheckIn != null) {
      this.Save();
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed.']);
    }
  }


  public GetICDList() {
    this.mrBLService.GetICDList()
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.ICD10MainList = res.Results;
        }
        else {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get data']);
        }
      },
        err => {
          this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Failed to get ICD10.. please check log for detail.']);
        });
  }


  AssignFinalDiagnosis() {
    if (this.selectedDiagnosis.length > 0) {
      this.selectedDiagnosis.forEach(a => {
        let temp = this.ICD10MainList.find(b => a.ICD10Code === b.ICD10Code);
        if (temp) {
          let finalDiagnosis: FinalDiagnosisModel = new FinalDiagnosisModel();
          finalDiagnosis.PatientId = this.selectedVisit.PatientId;
          finalDiagnosis.PatientVisitId = this.selectedVisit.PatientVisitId;
          finalDiagnosis.ICD10ID = temp.ICD10ID;
          this.FinalDiagnosisList.push(finalDiagnosis);
        }
      });
    }
  }

  OnDiagnosisSelected(event: any) {
    if (event)
      this.selectedDiagnosis = event;
  }

  AddNewComplaintRow() {
    let complain = new PatientClinicalInfoModel();
    complain.KeyName = "chief-complaint";
    complain.IsActive = true;
    complain.PatientId = this.selectedVisit.PatientId;
    complain.PatientVisitId = this.selectedVisit.PatientVisitId;
    this.chiefComplaints.push(complain);
  }


  Save() {
    if (this.selectedVisit.PerformerId != null) {
      this.nursingBLService.PostNursingCheckinDetails(this.nursingOpdCheckIn)
        .subscribe((res) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK) {
            this.chiefComplaints = new Array<PatientClinicalInfoModel>();
            this.selectedDiagnosis = []
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ['Nursing CheckIn Added Successfully']);
          }
          else {
            this.selectedDiagnosis = []
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to add NursingCheckin Details']);
          }
        });
      this.Close();
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Warning, ['Please Select Doctor']);
    }
  }

  removeComplaint(index: number) {
    if (this.chiefComplaints.length > 1) {
      this.chiefComplaints.splice(index, 1);
      this.chiefComplaints.slice();
    }
  }
  AssignSelectedDoctor(event) {
    this.selectedVisit.PerformerName = event.FullName;
    this.selectedVisit.PerformerId = event.EmployeeId;
  }
}
