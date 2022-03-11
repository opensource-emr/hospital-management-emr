import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { LabsBLService } from '../../shared/labs.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import * as moment from 'moment/moment';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";
import { PatientService } from '../../../patients/shared/patient.service';
import { CoreService } from "../../../core/shared/core.service";
import { SecurityService } from '../../../security/shared/security.service';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginToTelemed } from '../../shared/labMasterData.model';
import { RouteFromService } from '../../../shared/routefrom.service';
@Component({
  selector: 'lab-final-reports',
  templateUrl: "./lab-tests-final-reports.html"
})
export class LabTestsFinalReports implements AfterViewInit {
  public reportList: Array<any>;
  gridColumns: Array<any> = null;
  public showAddEditResult: boolean = false;
  public showReport: boolean = false;
  public showGrid: boolean = true;
  public requisitionIdList = [];
  public verificationRequired: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";//default show last 1 week records.
  searchText: string = '';
  public enableServerSideSearch: boolean = false;

  //@ViewChild('searchBox') someInput: ElementRef;

  public printReportFromGrid: boolean = false;

  public timeId: any = null;
  public catIdList: Array<number> = new Array<number>();
  public isInitialLoad: boolean = true;
  public labGridCols: LabGridColumnSettings = null;
  public enableResultEdit: boolean = false;
  public allowOutPatientWithProvisional: boolean = false;
  public loading: boolean = false;
  public showReportUpload : boolean = false;
  public TeleMedicineUploadForm:any =
    {
      phoneNumber:"",
      firstName: "",
      lastName: "",
      email: ""
    }
    public IsTeleMedicineEnabled : boolean = false;
  constructor(public labBLService: LabsBLService, public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public patientService: PatientService,
    public securityService: SecurityService,
    public routeFromService: RouteFromService) {
    this.getParamter();
    this.labGridCols = new LabGridColumnSettings(this.securityService);

    this.gridColumns = this.labGridCols.FinalReportListColumnFilter(this.coreService.GetFinalReportListColumnArray());
    if(!this.IsTeleMedicineEnabled)
    this.gridColumns = this.gridColumns.filter(a =>a.headerName !== "Is Uploaded");
    this.enableResultEdit = this.coreService.ShowEditResultButtonInLabFinalReport();
    this.allowOutPatientWithProvisional = this.coreService.AllowOutpatientWithProvisional();
    // this.GetPendingReportList(this.fromDate,this.toDate);
  }

  ngAfterViewInit() {
    document.getElementById('quickFilterInput').focus()
  }



  getParamter() {
    let parameterData = this.coreService.Parameters.find(p => p.ParameterGroupName == "Common" && p.ParameterName == "ServerSideSearchComponent").ParameterValue;
    var data = JSON.parse(parameterData);
    this.enableServerSideSearch = data["LaboratoryFinalReports"];
    let TeleMedicineConfig = this.coreService.Parameters.find(p =>p.ParameterGroupName == "TeleMedicine" && p.ParameterName == "DanpheConfigurationForTeleMedicine").ParameterValue;
    this.IsTeleMedicineEnabled = JSON.parse(JSON.parse(TeleMedicineConfig).IsTeleMedicineEnabled);
  }

  GetPendingReportList(frmdate, todate, searchtxt = '', categoryList) {
    this.reportList = [];
    this.loading=true;
    this.labBLService.GetPatientListInLabFinalReports(frmdate, todate, categoryList).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status == 'OK') {
        this.reportList = res.Results;
        this.reportList.forEach((a)=>{
          if(a.IsFileUploadedToTeleMedicine == false || a.IsFileUploadedToTeleMedicine == null)
          a.IsFileUploadedToTeleMedicine = "NO";
          else
          a.IsFileUploadedToTeleMedicine = "YES";
        });
        this.loading=false;
      } else {
        this.msgBoxService.showMessage('failed', ['Unable to get Final Report List']);
        console.log(res.ErrorMessage);
        this.loading=false;
      }
    }, err => {
      this.msgBoxService.showMessage('failed', [err]);
      console.log(err);
      this.loading=false;
    });
  }

  GridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "ViewDetails":
        {
          this.AssignRequisitionData($event.Data);

          //this is removed because it didnt show the two diff. RequisitionID of same TestName of single patient Twice
          //this.requisitionIdList = $event.Data.Tests.map(test => { return test.RequisitionId });

          this.printReportFromGrid = false;
          this.verificationRequired = false;
          this.showGrid = false;
          this.showAddEditResult = false;
          this.showReport = true;
          this.TeleMedicineUploadForm.firstName = ($event.Data.FirstName);
          this.TeleMedicineUploadForm.lastName = ($event.Data.LastName);
          this.TeleMedicineUploadForm.phoneNumber = ($event.Data.PhoneNumber);
          this.TeleMedicineUploadForm.email = ($event.Data.Email);
          this.routeFromService.RouteFrom = "finalReport";
        }
        break;
      case "Print":
        {
          this.AssignRequisitionData($event.Data);

          //this is removed because it didnt show the two diff. RequisitionID of same TestName of single patient Twice
          //this.requisitionIdList = $event.Data.Tests.map(test => { return test.RequisitionId });

          this.printReportFromGrid = true;
          this.verificationRequired = false;
          this.showGrid = false;
          this.showAddEditResult = false;
          this.showReport = true;


        }
        break;
      default:
        break;
    }
  }

  AssignRequisitionData(data) {
    this.requisitionIdList = [];
    this.patientService.getGlobal().PatientId = data.PatientId;
    this.patientService.getGlobal().ShortName = data.PatientName;
    this.patientService.getGlobal().PatientCode = data.PatientCode;
    this.patientService.getGlobal().DateOfBirth = data.DateOfBirth;
    this.patientService.getGlobal().Gender = data.Gender;
    this.patientService.getGlobal().WardName = data.WardName;

    this.requisitionIdList = data.LabRequisitionIdCSV.split(",").map(Number);
  }

  serverSearchTxt(searchTxt) {
    this.searchText = searchTxt;
    this.GetPendingReportList(this.fromDate, this.toDate, this.searchText, this.catIdList);
  }

  BackToGrid() {
    this.showGrid = true;
    //reset patient on header;
    this.patientService.CreateNewGlobal();
    // this.reportList = [];
    // this.requisitionIdList = [];

    //this.GetPendingReportList(this.fromDate, this.toDate, '', this.catIdList);
  }

  public CallBackBackToGrid($event) {
    if ($event.backtogrid) {
      this.printReportFromGrid = false;
      this.BackToGrid();
    }
  }

  public UpdateUploadStatus($event){
    this.reportList.forEach((a)=>{
      if(a.LabRequisitionIdCSV.includes($event.requisition[0]))
      a.IsFileUploadedToTeleMedicine = "YES";
    });
  }

  public GetTestListFilterByCategories() {
    if ((this.fromDate != null) && (this.toDate != null) && (this.catIdList.length > 0)) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPendingReportList(this.fromDate, this.toDate, this.searchText, this.catIdList);
      } else {
        this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  public LabCategoryOnChange($event) {
    //Reload the  Pending report list only if Category is Changed. 
    if($event.length != this.catIdList.length){
      this.isInitialLoad = false;
      this.catIdList = [];
      this.reportList = [];
      if ($event && $event.length) {
        $event.forEach(v => {
          this.catIdList.push(v.TestCategoryId);
        })
      }
      if (this.timeId) {
        window.clearTimeout(this.timeId);
        this.timeId = null;
      }
      this.timeId = window.setTimeout(() => {
        this.GetTestListFilterByCategories();
      }, 400);
    }
  }

  //sud:6Sept'21--to reload final report data--
  LoadDataForFinalReport() {
    if (this.fromDate != null && this.toDate != null && (this.catIdList.length > 0) && !this.isInitialLoad) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetPendingReportList(this.fromDate, this.toDate, this.searchText, this.catIdList);
      } else {
        this.msgBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
  }

  Close(){
    this.showReportUpload = false;
    this.requisitionIdList = [];
  }
}
