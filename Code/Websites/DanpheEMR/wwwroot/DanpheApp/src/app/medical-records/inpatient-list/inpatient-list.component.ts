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

@Component({
  templateUrl: "./inpatient-list.html",
  styleUrls: ['./MR-inpatient-list.css']
})

// App Component class
export class MRInpatientListComponent {  
  public fromDate: string = null;
  public toDate: string = null;
  public currentDate: string = null;
  public dischargedList: any[];
  public searchString: string = null;
  public selectedPrevVisitId: number = 0;

  public loading: boolean = false;
  public showActionsForSelectedPat: boolean = false;

  public showAddMedicalRecords: boolean = false;
  public showViewMedicalRecords: boolean = false;
  public selectedInpatient: any = null;

  constructor(
    public router: Router, public http: HttpClient, 
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.LoadAllDischargedPatients();
  }

  public LoadAllDischargedPatients() {
    if (this.checkDateValidation()) {
      try {
        this.medicalRecordsBLService.GetDischargedPatientsList(this.fromDate, this.toDate)
          .subscribe(res => {
            if (res.Status == 'OK') {
              this.dischargedList = res.Results;
              this.dischargedList.forEach(pat => { pat['IsSelected'] = false; });
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
        this.ShowCatchErrMessage(exception);
      }
    }
  }

  public checkDateValidation() {
    let flag = true;
    flag = moment(this.fromDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = moment(this.toDate, "YYYY-MM-DD").isValid() == true ? flag : false;
    flag = (this.toDate >= this.fromDate) == true ? flag : false;
    if (!flag) {
      this.msgBoxServ.showMessage("error", ['select proper date(FromDate <= ToDate)']);
    }
    return flag;
  }

  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }

  public AddMedicalRecords() {
    if (this.selectedInpatient) {
      this.showAddMedicalRecords = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
    }
  }

  public ViewMedicalRecords() {
    if (this.selectedInpatient) {
      this.showViewMedicalRecords = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
    }
  }

  public EditMedicalRecords() {
    if (this.selectedInpatient) {
      this.showAddMedicalRecords = true;
    }
    else {
      this.msgBoxServ.showMessage("failed", ['Select a Patient Again']);
    }
  }
  

  public SelectUnselectRow(pat, patVisId) {   
    if (this.selectedPrevVisitId > 0) {
      if (patVisId != this.selectedPrevVisitId) {
        var pt = this.dischargedList.find(d => d.PatientVisitId == this.selectedPrevVisitId);
        pt.IsSelected = false;
      }      
    }    

    this.selectedInpatient = null;
    pat.IsSelected = !pat.IsSelected;
    this.selectedPrevVisitId = patVisId;

    if (pat.IsSelected) {
      this.showActionsForSelectedPat = true;
      this.selectedInpatient = pat;
    } else {
      this.showActionsForSelectedPat = false;
    }    
  }
  

  public CloseAddUpdateMRPopUp($event) {
    if ($event && $event.close) {
      if ($event.action == 'add') {
        if ($event.medicalRecordId) {
          var ds = this.dischargedList.find(d => d.PatientVisitId == this.selectedPrevVisitId);
          if (ds) { ds.MedicalRecordId = $event.medicalRecordId; }
          var doc = document.getElementById('patient' + ds.PatientVisitId);
          if (doc.classList.contains('new-rec')) {
            doc.classList.remove('new-rec');
            doc.classList.add('saved-rec');
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
  
}
