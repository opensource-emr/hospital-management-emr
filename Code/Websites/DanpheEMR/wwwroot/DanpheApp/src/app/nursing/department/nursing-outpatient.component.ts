import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment/moment';
import 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { VisitBLService } from '../../appointments/shared/visit.bl.service';
import { Visit } from "../../appointments/shared/visit.model";
import { VisitService } from '../../appointments/shared/visit.service';
import { CoreService } from '../../core/shared/core.service';
import { PatientService } from "../../patients/shared/patient.service";
import { SecurityService } from '../../security/shared/security.service';
import { Department } from '../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from "../../shared/danphe-grid/NepaliColGridSettingsModel";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../shared/routefrom.service";
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../shared/shared-enums';
import { NursingBLService } from "../shared/nursing.bl.service";

@Component({
  selector: 'nursing-outpatient',
  templateUrl: './nursing-outpatient.html',
  styleUrls: ['./nursing-outpatient.component.css'],
  styles: [`
    .orange{ background-color: orange !important }
`]
})

export class NursingOutPatientComponent {
  public Timer: any;
  public opdList: Array<Visit> = new Array<Visit>();
  public opdListZero: Array<Visit> = new Array<Visit>();
  public opdListOne: Array<Visit> = new Array<Visit>();
  public opdListPastDays: Array<Visit> = new Array<Visit>();
  public opdListZeroPastDays: Array<Visit> = new Array<Visit>();
  public opdListOnePastDays: Array<Visit> = new Array<Visit>();
  public opdFilteredList: Array<Visit> = new Array<Visit>();

  nurOPDGridColumnSettings: Array<any> = null;

  public reloadFrequency: number = 30000; //30000 =30 seconds: this is the frequency of new Pull-Request for OPD Patient List.
  public timer; ///timer variable to subscribe or unsubscribe the timer
  public sub: Subscription;

  public fromDate: string = '';
  public toDate: string = '';
  public isShowUploadMode: boolean = false;
  public isShowListMode: boolean = false;
  public showDocumentsDetails: boolean = false;
  public patientId: number = null;
  public patientVisitId: number = null;

  public globalPatient: any;
  public globalVisit: any;
  //public patGirdDataApi: string = "";
  public selectedVisit: Visit = new Visit();
  searchText: string = '';
  public enableServerSideSearch: boolean = false;
  public showVitalsPendingGrid: boolean = false;
  public showVitalsTakenGrid: boolean = false;
  public showOpdTriage: boolean = false;
  public currentTab: string = 'today';

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public patientInfo: any;
  public triageEdit: boolean = false;
  static serv: any;
  public departmentList: Array<Department> = [];
  public selectedDepartment: Department = new Department();
  public visit: Visit = new Visit();
  public searchString: string = null;
  public isCheckinForm: boolean = false;
  public index: number;

  public showNursingCheckin: boolean = false;
  public showNursingCheckout: boolean = false;
  public showChangeDoctor: boolean = false;
  public IsPatientSelected: boolean = false;
  public isAllSelected: boolean = false;
  public isChangeDoctorForm: boolean = false;
  public isNursingCheckoutForm: boolean = false;
  @ViewChild('selectAllCheckbox') selectAllCheckbox: ElementRef<HTMLInputElement>;
  public showExchangeDoctorPopUp: boolean = false;
  public isExchangeDoctorForm: boolean = false;
  ///public selectedVisit: Visit;

  constructor(public patientService: PatientService, public securityService: SecurityService,
    public visitService: VisitService,
    public nursingBLService: NursingBLService,
    public changeDetector: ChangeDetectorRef,
    public router: Router,
    public routeFromSrv: RouteFromService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    private messageboxService: MessageboxService,

    public visitBLService: VisitBLService) {
    this.GetDepartments();
    this.selectedDepartment = new Department();
    this.LoadVisitList();
    //this.patGirdDataApi = APIsByType.NursingOutpatient;
    NursingOutPatientComponent.serv = this.securityService;
    this.nurOPDGridColumnSettings = [
      {
        headerName: "Date",
        field: "VisitDate",
        width: 80,
        sort: "desc"
        //cellRenderer: GridColumnSettings.VisitDateOnlyRenderer,
      },
      {
        headerName: "Time",
        field: "",
        width: 70,
        cellRenderer: GridColumnSettings.VisitTimeOnlyRendererNurOPD,
      },
      { headerName: "Hospital Number", field: "PatientCode", width: 120 },
      {
        headerName: "Patient Name", field: "ShortName", width: 160,
        //cellRenderer: GridColumnSettings.NursingOpdPatNameRenderer,
      },
      {
        headerName: "Age/Sex",
        field: "",
        width: 70,
        cellRenderer: GridColumnSettings.AgeSexRendererNurOPD,
      },
      { headerName: "Phone", field: "PhoneNumber", width: 125 },

      { headerName: "Doctor Name", field: "PerformerName", width: 160 },
      { headerName: "Appointment Type", field: "AppointmentType", width: 80 },
      {
        headerName: "Action",
        field: "",
        width: 200,
        cellRenderer: this.GetButtonsBasedOnPermissions,
      },
    ];
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.getParamter();
    this.LoadVisitList();
    this.Timer = setInterval(() => {
      if (this.currentTab == 'today') {
        this.LoadVisitList();
        this.opdList = this.opdList.slice();
      }
    }, 60000);

    //showtime=false for this. we already have separate colum for Time in this grid..
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("VisitDate", false));
  }
  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }
  GetDepartments() {
    this.visitBLService.GetDepartment()
      .subscribe(
        (res: DanpheHTTPResponse) => {
          if (res.Status === ENUM_DanpheHTTPResponses.OK)
            this.departmentList = res.Results;
          this.selectedDepartment = new Department();
        });
  }


  GetButtonsBasedOnPermissions(params) {
    let template = "";
    let currPat = params.data;

    if (currPat.IsTriaged == 1) {
      template = '<a danphe-grid-action="opd-triage" class="grid-action">Edit Triage</a>';
    } else {
      template = '<a danphe-grid-action="opd-triage" class="grid-action">Add Triage</a>';
    }
    if (NursingOutPatientComponent.serv.HasPermission("nursing-op-summary-view")) {
      template += '<i danphe-grid-action="patient-overview" class="fa fa-tv grid-action" style="padding: 3px;" title="overview"> </i>';
    }

    if (NursingOutPatientComponent.serv.HasPermission("nursing-op-clinical-view")) {
      template += `<a danphe-grid-action="clinical" class="grid-action">Clinical</a>`;
    }

    if (NursingOutPatientComponent.serv.HasPermission("nursing-op-fileupload-view")) {
      template += ' <i danphe-grid-action="upload-files" class="fa fa-upload grid-action" style="padding: 3px;" title="upload files"> </i>';
    }
    return template;
  }


  ngOnDestroy() {
    clearInterval(this.Timer);
  }


  // ngOnInit() {
  //we are using Timer function of Observable to Call the HTTP with angular timer
  //first Zero(0) means when component is loaded the timer is also start that time
  //seceond (60000) means after each 1 min timer will subscribe and It Perfrom HttpClient operation
  // this.timer = Observable.timer(0, this.reloadFrequency);
  // subscribing to a observable returns a subscription object
  //  this.sub = this.timer.subscribe(t => this.LoadVisitList(t));
  // }

  // ngOnDestroy() {
  // Will clear when component is destroyed e.g. route is navigated away from.
  // clearInterval(this.timer);
  // this.sub.unsubscribe();//IMPORTANT to unsubscribe after going away from current component.
  //  }
  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    //this.LoadVisitList();
  }

  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["NursingOutPatient"];
  }
  LoadVisitList() {
    //today's all visit or all visits with IsVisitContinued status as false
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.nursingBLService.GetOPDList(this.fromDate, this.toDate)  //this.fromDate, this.toDate
      .subscribe(res => {
        if (res.Status === ENUM_DanpheHTTPResponses.OK) {
          this.opdList = res.Results;
          let opdTriaged = [];
          let opdNotTriaged = [];
          for (let i = 0; i < res.Results.length; i++) {
            if (res.Results[i].IsTriaged == 0) {
              opdNotTriaged.push(res.Results[i]);
            } else if (res.Results[i].IsTriaged == 1) {
              opdTriaged.push(res.Results[i]);
            }
          }
          this.opdListZero = opdNotTriaged;

          this.opdListOne = opdTriaged;
          // this.onChangeDepartment();
          this.opdFilteredList = this.opdList;
          //this.opdFilteredList.forEach(a => a.IsSelected = false);
        }
        else {
          this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data']);
        }

      });
  }
  // onChangeDepartment() {
  //   if (((this.selectedDepartment.DepartmentId !== null || this.selectedDepartment.DepartmentId !== undefined)
  //     && this.selectedDepartment.DepartmentId != 0) && typeof (this.selectedDepartment) === 'object') {
  //     this.opdFilteredList = this.opdListZero.filter(r => r.DepartmentId == this.selectedDepartment.DepartmentId);
  //     this.opdFilteredList = this.opdFilteredList.slice();
  //   } else {
  //     this.opdFilteredList = this.opdListZero;
  //   }
  // }
  filterRows() {
    if (!this.opdList || this.opdList.length === 0) {
      this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data']);
      return;
    }

    if (this.searchString) {
      this.opdFilteredList = this.opdList.filter((row) =>
        row.PatientCode.toLowerCase().includes(this.searchString.toLowerCase()) ||
        row.ShortName.toLowerCase().includes(this.searchString.toLowerCase()) ||
        row.DepartmentName.toLowerCase().includes(this.searchString.toLowerCase())
      );
    } else {
      this.opdFilteredList = this.opdList;
    }
  }



  // LoadOutPatient() {
  //     var checkIfSameOrBefore = moment(this.fromDate).isSameOrBefore(this.toDate);

  //     if (checkIfSameOrBefore) {
  //         this.nursingBLServiec.GetOPDListByDate(this.fromDate, this.toDate)
  //             .subscribe(res => {
  //                 if (res.Status == "OK") {
  //                     this.opdList = res.Results;
  //                 }
  //                 else {
  //                     this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
  //                 }
  //             });
  //     }
  //     else {
  //         this.msgBoxServ.showMessage("failed", ["To-Date should be greater than From-Date."]);
  //         // alert('Please Provide Before Date and To date Properly');
  //     }

  // }


  NurOPDListGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "clinical":
        {
          this.SetPatDataToGlobal($event.Data);
          this.router.navigate(["/Nursing/PatientOverviewMain/Clinical"]);
          break;

        }
      case "patient-overview":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            this.routeFromSrv.RouteFrom = "nursing";
            this.router.navigate(["/Nursing/PatientOverviewMain"]);
          }
          break;
        }
      case "upload-files":
        {
          if ($event.Data) {
            this.isShowUploadMode = true;
            this.isShowListMode = false;
            this.patientId = $event.Data.PatientId;
            this.showDocumentsDetails = true;
          }
          break;
        }
      case "opd-triage":
        {
          if ($event.Data) {
            this.SetPatDataToGlobal($event.Data);
            this.showOpdTriage = false;
            this.patientInfo = Object.create($event.Data);
            this.showOpdTriage = true;

            //if triage already added then it must be edit mode
            if (this.globalVisit.IsTriaged == 1) {
              this.triageEdit = true;
            } else if (this.globalVisit.IsTriaged == 0) {
              this.triageEdit = false;
            }

          }
          break;
        }
    }
  }

  public CloseUplaodPopUp() {
    this.isShowUploadMode = false;
    this.showDocumentsDetails = false;
  }

  public SetPatDataToGlobal(data) {
    this.globalPatient = this.patientService.CreateNewGlobal();
    this.globalPatient.PatientId = data.PatientId;
    this.globalPatient.PatientCode = data.PatientCode;
    this.globalPatient.ShortName = data.ShortName;
    this.globalPatient.DateOfBirth = data.DateOfBirth;
    this.globalPatient.Gender = data.Gender;
    this.globalPatient.PhoneNumber = data.PhoneNumber;
    this.globalPatient.Address = data.Address;
    this.globalPatient.Age = data.Age;
    this.globalVisit = this.visitService.CreateNewGlobal();
    this.globalVisit.ShortName = data.ShortName;
    this.globalVisit.Age = data.Age;
    this.globalVisit.Gender = data.Gender;
    this.globalVisit.PatientVisitId = data.PatientVisitId;
    this.globalVisit.PatientId = data.PatientId;
    this.globalVisit.PerformerName = data.PerformerName;
    this.globalVisit.PerformerId = data.PerformerId;
    this.globalVisit.VisitType = data.VisitType;
    this.globalVisit.IsTriaged = data.IsTriaged;

  }



  ToggleCurrentTab(value) {
    this.currentTab = value;
  }

  public showAllData: boolean = false;
  public showTriagedData: boolean = false;
  public showNotTriagedData: boolean = false;

  public showAll() {
    this.showAllData = true;
    this.showTriagedData = false;
    this.showNotTriagedData = false;
  }

  public showTriaged() {
    this.showAllData = false;
    this.showTriagedData = true;
    this.showNotTriagedData = false;
  }

  public showNotTriaged() {
    this.showAllData = false;
    this.showTriagedData = false;
    this.showNotTriagedData = true;
  }

  onGridDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    this.LoadPastDaysData(this.fromDate, this.toDate);
  }

  LoadPastDaysData(fromdate, todate) {

    this.patientId = this.patientService.globalPatient.PatientId;
    this.nursingBLService.GetOPDPastDataList(fromdate, todate)  //this.fromDate, this.toDate
      .subscribe(res => {
        if (res.Status == "OK") {
          this.opdListPastDays = res.Results;
          var opdTriaged = [];
          var opdNotTriaged = [];

          for (var i = 0; i < res.Results.length; i++) {
            if (res.Results[i].IsTriaged == 0) {
              opdNotTriaged.push(res.Results[i]);
            } else if (res.Results[i].IsTriaged == 1) {
              opdTriaged.push(res.Results[i]);
            }
          }
          this.opdListZeroPastDays = opdNotTriaged;
          this.opdListOnePastDays = opdTriaged;
        }
        else {
          this.msgBoxServ.showMessage("failed to load data", [res.ErrorMessage]);
        }

      });

  }

  ClosePopUp() {
    this.showOpdTriage = false;
    this.patientId = null;
    this.patientVisitId = null;
  }

  OPDTriagedCallback($event) {
    if ($event.isSubmitted) {
      this.LoadVisitList();
    } else {
    }
    this.triageEdit = false;
    this.ClosePopUp();
  }

  NursingCheckin() {
    if (this.IsPatientSelected) {
      this.isCheckinForm = false;
      this.index = null;
      this.changeDetector.detectChanges();
      this.showNursingCheckin = true;
      this.isCheckinForm = true;

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please select patient before checkin']);
    }
  }

  ExchangeDoctorDepartment() {
    if (this.IsPatientSelected) {
      this.isExchangeDoctorForm = false;
      this.index = null;
      this.changeDetector.detectChanges();
      this.showExchangeDoctorPopUp = true;
      this.isExchangeDoctorForm = true;

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please select patient before CheckIn']);
    }
  }

  ChangeDoctor() {
    if (this.IsPatientSelected) {
      this.isChangeDoctorForm = false;
      this.index = null;
      this.changeDetector.detectChanges();
      this.showChangeDoctor = true;
      this.isChangeDoctorForm = true;

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please select patient before checkin']);
    }
  }
  NursingCheckOut() {
    if (this.IsPatientSelected) {
      this.isNursingCheckoutForm = false;
      this.index = null;
      this.changeDetector.detectChanges();
      this.showNursingCheckout = true;
      this.isNursingCheckoutForm = true;

    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please select patient before checkin']);
    }
  }
  NursingTriage() {
    if (this.IsPatientSelected) {
      this.showOpdTriage = true;
      this.SetPatDataToGlobal(this.selectedVisit);
    }
    else {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please select patient before Triage']);
    }
  }
  SelectFilteredList(row: Visit) {
    if (row.IsSelected) {
      this.IsPatientSelected = true;
      this.selectedVisit = row;
      this.opdFilteredList.forEach(a => {
        if (row.PatientId !== a.PatientId) {
          a.IsSelected = false;
        }
      });

    } else {
      this.selectedVisit = new Visit();
      this.IsPatientSelected = false;

    }
  }

  NursingOpdActionsInCallback($event) {
    if ($event) {
      if ($event.action === 'close') {
        this.showNursingCheckin = false;
        this.showChangeDoctor = false;
        this.showNursingCheckout = false;
        this.showExchangeDoctorPopUp = false;
        this.LoadVisitList();
        this.selectedVisit = new Visit();
        this.IsPatientSelected = false;
      }
    }
  }
  NursingOpdCheckoutActionsInCallback($event) {
    if ($event) {
      if ($event.action === 'close') {
        this.showNursingCheckout = false;
      }
    }
  }
}
