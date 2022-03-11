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
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import MRGridColumnSettings from '../shared/Mr-gridcol.settings';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../shared/danphe-grid/NepaliColGridSettingsModel';

@Component({
  templateUrl: "./birth-list.html"
})

// App Component class
export class BirthListComponent {
  public fromDate: string = null;
  public toDate: string = null;
  public gridColumns: Array<any> = null;
  public dateRange: string = null;
  public showBirthCertificate: boolean = false;
  public birthList: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();

  public selectedBirth: any = null;
  public babyBirthDetailsId: number = null;

  public showAddNewBirthDetails: boolean = false;

  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  constructor(
    public router: Router, public http: HttpClient,
    public medicalRecordsBLService: MR_BLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService) {
    this.gridColumns = MRGridColumnSettings.BirthList;
    this.dateRange = "last3Months";
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('BirthDate', false));

  }


  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;

    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetAllTheBirthList();
      } else {
        this.msgBoxServ.showMessage("failed", ['Please enter valid From date and To date']);
      }

    }
  }

  public GetAllTheBirthList() {
    this.medicalRecordsBLService.GetBirthList(this.fromDate, this.toDate).subscribe(res => {
      if (res.Status == 'OK') {
        this.birthList = res.Results;
      } else {
        this.msgBoxServ.showMessage("failed", ['Error Occured while getting Birth List. Please Try again Later']);
      }
    });
  }

  GridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "view-birth-certificate":
        {
          this.selectedBirth = $event.Data;
          this.babyBirthDetailsId = this.selectedBirth.BabyBirthDetailsId;
          this.showBirthCertificate = true;
        }
        break;
      default:
        break;
    }
  }

  public CloseBirthCertificatePopUp() {
    this.babyBirthDetailsId = null;
    this.showBirthCertificate = false;
  }

  public CloseBirthCertificate($event) {
    if ($event && $event.close) {
      this.babyBirthDetailsId = null;
      this.showBirthCertificate = false;
    }
  }

  CallBack(data) {
    if (data && data.Close) {
      this.showAddNewBirthDetails = false;
    } else if (data && (data.Add || data.Edit)) {
      this.showAddNewBirthDetails = false;
      this.GetAllTheBirthList();
    }
  }
}
