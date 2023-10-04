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
import { DeathDetails } from '../../adt/shared/death.detail.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./death-list.html"
})

// App Component class
export class DeathListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public gridColumns: Array<any> = null;
  public dateRange: string = null;
  public showDeathCertificate: boolean = false;
  public deathList: Array<DeathDetails> = new Array<DeathDetails>();

  public selectedDeath: any = null;
  public deathDetailId: number = null;
  public showDeathRecordWindow: boolean = false;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public hasDeathRecordPermission: boolean = false;


  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {

    this.gridColumns = MRGridColumnSettings.DeathList;
    this.dateRange = "last3Months";
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('DeathDate', false));

    this.hasDeathRecordPermission = this.securityService.HasPermission('btn-mr-add-death-record-button-permission');

  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAllTheDeathList();
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }

  public GetAllTheDeathList() {
    this.medicalRecordsBLService.GetDeathList(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == 'OK') {
        this.deathList = res.Results;
      } else {
        this.msgBoxServ.showMessage("failed", ['Error Occured while getting Death List. Please Try again Later']);
      }
    });
  }

  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-death-certificate":
        {
          this.selectedDeath = $event.Data;
          this.deathDetailId = this.selectedDeath.DeathId;
          this.showDeathCertificate = true;
        }
        break;
      default:
        break;
    }
  }

  public CloseDeathCertificatePopUp() {
    this.deathDetailId = null;
    this.showDeathCertificate = false;
  }

  public CloseDeathCertificate($event) {
    if ($event && $event.close) {
      this.deathDetailId = null;
      this.showDeathCertificate = false;
    }
  }

  CallBackAddNewDeath(data) {
    if (data && data.Close) {
      this.showDeathRecordWindow = false;
    } else if (data && (data.Add || data.Edit)) {
      this.showDeathRecordWindow = false;
      this.GetAllTheDeathList();
    }
  }
}
