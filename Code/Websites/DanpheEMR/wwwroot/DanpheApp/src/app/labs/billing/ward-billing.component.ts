import { Component, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { LabsBLService } from '../shared/labs.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { Router } from '@angular/router';
import { Patient } from "../../patients/shared/patient.model";
import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";
import { InPatientVM } from '../shared/InPatientVM';
import { ADT_BLService } from '../../adt/shared/adt.bl.service';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({

  selector: 'ward-billing',
  templateUrl: "./ward-billing.html"

})

export class WardBillingComponent {
  public showLabRequestsPage: boolean = false;
  public WardGridColumns: Array<any> = null;
  public showDischargeBill: boolean = false;
  public inpatientList: Array<InPatientVM>;
  public selecteditems: InPatientVM;
  public patientId: number = null;
  public patientVisitId: number = null;


  public showLabRequestsList: boolean = false;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();


  constructor(
    public router: Router,
    public labBLService: LabsBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef, public admissionBLService: ADT_BLService) {
    this.WardGridColumns = GridColumnSettings.WardBilling;
    this.GetInpatientlist();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('AdmittedDate', true));

  }

  AddLabRequest() {
    this.showLabRequestsPage = false;
    this.changeDetector.detectChanges();
    this.showLabRequestsPage = true;
  }

  RouteToLabRequisition() {


  }

  RouteToList($event) {
    this.selecteditems = new InPatientVM();
    if (!$event.state) {
      this.showLabRequestsList = false;
    }
  }

  LabGridActions($event: GridEmitModel) {

    switch ($event.Action) {
      case "ViewDetails":
        {
          this.showLabRequestsPage = false;
          this.showLabRequestsList = false;
          this.changeDetector.detectChanges();
          this.selecteditems = $event.Data;
          this.showLabRequestsList = true;
          break;
        }

      default:
        break;
    }
  }


  GetInpatientlist() {
    this.admissionBLService.GetAdmittedPatients()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.inpatientList = res.Results;
          this.inpatientList = this.inpatientList.slice();
        }
        else {
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
        });

  }



}
