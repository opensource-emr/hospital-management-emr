import { Component, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, OnInit, Input, Output } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { PatientService } from "../../../patients/shared/patient.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { LabsBLService } from "../../shared/labs.bl.service";
import { LabMasterModel, Requisition } from "../../shared/labMasterData.model";
import { CommonFunctions } from "../../../shared/common.functions";
import { LabPendingResultVM } from "../../shared/lab-view.models";
import * as moment from 'moment/moment';
import { CoreService } from "../../../core/shared/core.service";
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DanpheCache, MasterType } from '../../../shared/danphe-cache-service-utility/cache-services';
import { LabTestFinalReportModel, LabTestsInFinalReportModel } from '../../shared/lab-finalreport.VM';

@Component({
  selector: 'lab-report-dispatch-detail',
  templateUrl: "./lab-report-dispatch-detail.html",
  styles: [`  .test-list-table {background: #e6e6e6;}
              .test-list-table thead{background: #126587;}
              .test-list-table tr th, .test-list-table tr td {padding: 4px 2px;font-size: 11px;}
              .test-list-table tr th {color: #fff;}
              .test-list-table tr td: not(.txt-red) {color: #000;}
              .slct-checkbox{margin: 0;}
              .txt-red {color: red;}`]
})

export class LabReportDispatchDetailComponent {  
  @Input() public reportSelected: LabTestFinalReportModel = new LabTestFinalReportModel();

  public allEmployeeList: Array<any> = [];
  public showVerifiedByColumn: boolean = false;

  public selectAll: boolean = false;

  constructor(public patientService: PatientService, public coreService: CoreService,
    public msgBoxService: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public labBLService: LabsBLService) {
    this.showVerifiedByColumn = this.coreService.EnableVerificationStep();
  }

  ngOnInit() {
    this.allEmployeeList = DanpheCache.GetData(MasterType.Employee, null);
    this.reportSelected.Tests.forEach(tst => {
      tst['SampleCollectedByName'] = '';
      tst['ResultVerifiedByName'] = '';
      tst['ResultAddedByName'] = '';
      tst['PrintedByName'] = '';
      tst['CheckedForPrint'] = false;

      this.allEmployeeList.forEach(val => {
        if (val.EmployeeId == tst.SampleCollectedBy) {
          tst['SampleCollectedByName'] = val.FirstName + " " + val.LastName;
        }
        if (val.EmployeeId == tst.VerifiedBy) {
          tst['ResultVerifiedByName'] = val.FirstName + " " + val.LastName;
        }
        if (val.EmployeeId == tst.ResultAddedBy) {
          tst['ResultAddedByName'] = val.FirstName + " " + val.LastName;
        }
        if (val.EmployeeId == tst.PrintedBy) {
          tst['PrintedByName'] = val.FirstName + " " + val.LastName;
        }
      });
    });
  }


  public CheckForSelectAll(test) {

    test["CheckedForPrint"] = !test["CheckedForPrint"];

    if ((this.reportSelected.Tests.every(a => a["CheckedForPrint"] == true))) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

  }

  public SelectDeselectAll() {
    if (this.selectAll) {
      this.reportSelected.Tests.forEach(tst => {
        tst['CheckedForPrint'] = true;
      });
    } else {
      this.reportSelected.Tests.forEach(tst => {
        tst['CheckedForPrint'] = false;
      });
    }
  }

}
