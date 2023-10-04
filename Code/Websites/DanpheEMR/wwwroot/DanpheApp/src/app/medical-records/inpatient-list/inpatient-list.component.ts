import { Component, ChangeDetectorRef } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';
//Security Service for Loading Child Route from Security Service
import { SecurityService } from "../../security/shared/security.service";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { MR_BLService } from '../shared/mr.bl.service';
import { CoreService } from '../../core/shared/core.service';
import { HttpClient } from '@angular/common/http';
import MRGridColumnSettings from '../shared/Mr-gridcol.settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./inpatient-list.html",
  styleUrls: ['./MR-inpatient-list.css']
})

// App Component class
export class MRInpatientListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public currentDate: string = null;
  public dischargedList: Array<any> = Array<any>();
  public AllDischargedList: Array<any> = Array<any>();
  public searchString: string = null;
  public selectedPrevVisitId: number = 0;


  public showActionsForSelectedPat: boolean = false;

  public showAddMedicalRecords: boolean = false;
  public showViewMedicalRecords: boolean = false;
  public selectedInpatient: any = null;

  public MrStatus: string = 'all';
  public loading: boolean = false;//to handle double/multiple click in the button
  public gridColumns: Array<any> = [];
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    // this.fromDate = moment().format('YYYY-MM-DD');
    // this.toDate = moment().format('YYYY-MM-DD');
    // this.LoadAllDischargedPatients();
    this.gridColumns = MRGridColumnSettings.InpatientList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('DischargedDate', false));
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', false));

  }

  public LoadAllDischargedPatients() {
    if (this.fromDate && this.toDate) {
      try {
        this.loading = true;
        this.medicalRecordsBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
          .finally(() => { this.loading = false; })
          .subscribe(res => {

            if (res.Status == 'OK') {
              this.AllDischargedList = res.Results;
              if (this.MrStatus == 'all') {
                this.dischargedList = Array<any>();
                this.dischargedList = res.Results;
              } else {
                this.FilterMrList();
              }
              this.selectedPrevVisitId = 0;
            }
            else {
              this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
          },
            err => {
              this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
            });
      }
      catch (exception) {
        this.loading = false;
        this.ShowCatchErrMessage(exception);
      }
    }
    else {
      this.msgBoxServ.showMessage("warning", ["Please select valid date range."])
    }
  }



  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  // public AddMedicalRecords() {
  //   if (this.selectedInpatient) {
  //     this.showAddMedicalRecords = true;
  //   }
  //   else {
  //     this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
  //   }
  // }

  // public ViewMedicalRecords() {
  //   if (this.selectedInpatient) {
  //     this.showViewMedicalRecords = true;
  //   }
  //   else {
  //     this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
  //   }
  // }

  public EditMedicalRecords() {
    if (this.selectedInpatient) {
      this.showAddMedicalRecords = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
    }
  }


  // public SelectUnselectRow(pat, patVisId) {
  //   if (this.selectedPrevVisitId > 0 && patVisId != this.selectedPrevVisitId) {
  //     var pt = this.dischargedList.find(d => d.PatientVisitId == this.selectedPrevVisitId);
  //     if (pt) pt.IsSelected = false;
  //   }
  //   this.selectedInpatient = null;
  //   if (pat && patVisId) {
  //     pat.IsSelected = !pat.IsSelected;
  //     this.selectedPrevVisitId = patVisId;

  //     if (pat.IsSelected) {
  //       this.showActionsForSelectedPat = true;
  //       this.selectedInpatient = pat;
  //     } else {
  //       this.showActionsForSelectedPat = false;
  //     }
  //   } else {
  //     this.showActionsForSelectedPat = false;
  //   }

  // }


  public CloseAddUpdateMRPopUp($event) {
    if ($event && $event.close) {
      if ($event.action == 'add') {
        if ($event.medicalRecObj) {
          var ds = this.dischargedList.find(d => d.PatientVisitId == $event.medicalRecObj.PatientVisitId);
          if (ds) {
            ds.MedicalRecordId = $event.medicalRecObj.MedicalRecordId;
            //this refreshes the source array of discharged list so that grid reloads locally without calling the server api.
            this.dischargedList = this.dischargedList.slice();
          }

        }
        this.showAddMedicalRecords = false;
      }
      else if ($event.action == 'update') {
        this.showAddMedicalRecords = false;
        this.showViewMedicalRecords = true;
      }
      else {

      }
      this.showAddMedicalRecords = false;
    }
  }

  public CloseViewMRPopUp($event) {
    if ($event && $event.close) {
      this.showViewMedicalRecords = false;
      if ($event.action == 'edit') { this.EditMedicalRecords(); }
    }
  }

  OnFromToDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
  }

  public FilterMrList() {
    // this.SelectUnselectRow(null, null);
    this.dischargedList = new Array<any>();
    if (this.AllDischargedList && this.AllDischargedList.length > 0) {
      if (this.MrStatus && this.MrStatus != 'all') {
        if (this.MrStatus == 'complete') {
          this.dischargedList = this.AllDischargedList.filter(d => d.MedicalRecordId && d.MedicalRecordId > 0);
        } else if (this.MrStatus == 'pending') {
          this.dischargedList = this.AllDischargedList.filter(d => d.MedicalRecordId == null || d.MedicalRecordId == 0);
        }
      } else {
        this.dischargedList = this.AllDischargedList;
      }
    } else {
      this.msgBoxServ.showMessage("Info", ["There is no Data to filter!"]);
    }
  }
  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "add-mr":
        {
          this.selectedInpatient = $event.Data;
          this.showViewMedicalRecords = false;
          this.showAddMedicalRecords = true;
        }
        break;
      case "view-mr":
        {
          this.selectedInpatient = $event.Data;
          this.showAddMedicalRecords = false;
          this.showViewMedicalRecords = true;
        }
        break;
      default:
        break;
    }
  }
}
