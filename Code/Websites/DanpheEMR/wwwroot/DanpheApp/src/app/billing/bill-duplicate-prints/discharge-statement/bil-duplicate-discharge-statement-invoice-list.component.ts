import { Component, OnInit } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { BillingBLService } from '../../shared/billing.bl.service';
import { DischargeStatementViewModel } from './discharge-statement-view.model';

@Component({
  selector: 'bil-duplicate-discharge-statement-invoice-list',
  templateUrl: './bil-duplicate-discharge-statement-invoice-list.component.html'
})
export class Bil_DuplicateDischargeStatementInvoiceListComponent implements OnInit {
  dischargeStatementList: Array<DischargeStatementViewModel> = new Array<DischargeStatementViewModel>();
  DischargeStatementGridCols: any[] = [];
  NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  ShowStatementView: boolean = false;
  DischargeStatementId: number = 0;
  dateRange: string = "last1Week";
  dischargeStatementObject = { DischargeStatementId: 0, PatientId: 0, PatientVisitId: 0, DischargeStatementNo: 0, DischargeDate: null }
  fromDate: string;
  toDate: string;
  showBillSummary: boolean = false;



  constructor(public billingBLService: BillingBLService, public messageBox: MessageboxService) {
    this.DischargeStatementGridCols = GridColumnSettings.DischargeStatementColumnList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('StatementDate', true));

  }

  ngOnInit() {
  }

  GetDuplicateDischargeStatementInvoiceList(): void {
    if (this.fromDate === null || this.toDate === null) {
      return this.messageBox.showMessage(ENUM_MessageBox_Status.Notice, ['Please select valid date']);
    }
    this.billingBLService.GetDuplicateDischargeStatementList(this.fromDate, this.toDate).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
        this.dischargeStatementList = [];
        this.dischargeStatementList = res.Results;
      }
      else {
        this.messageBox.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to get discharge statement']);
      }
    },
      err => {
        this.messageBox.showMessage(ENUM_MessageBox_Status.Failed, ['See console error for more details']);
        console.log(err);
      })
  }

  DuplicateDischargeStatementGridActions($event: GridEmitModel) {
    switch ($event.Action) {
      case "show-statement-details":
        {
          this.dischargeStatementObject.DischargeStatementId = $event.Data.DischargeStatementId;
          this.dischargeStatementObject.PatientId = $event.Data.PatientId;
          this.dischargeStatementObject.DischargeStatementNo = $event.Data.StatementNo;
          this.dischargeStatementObject.PatientVisitId = $event.Data.PatientVisitId;
          this.ShowStatementView = true;
        }
        break;
      case "show-statement-summary":
        {
          this.dischargeStatementObject.DischargeStatementId = $event.Data.DischargeStatementId;
          this.dischargeStatementObject.PatientId = $event.Data.PatientId;
          this.dischargeStatementObject.DischargeStatementNo = $event.Data.StatementNo;
          this.dischargeStatementObject.PatientVisitId = $event.Data.PatientVisitId;
          this.dischargeStatementObject.DischargeDate = $event.Data.StatementDate;
          this.showBillSummary = true;
        }
        break;
      default:
        break;
    }
  }

  CloseRecieptView(event) {
    this.ShowStatementView = false;
    this.showBillSummary = false;
  }

  AfterDischargePrint(data) {
    if (data.Close == "close") {
      this.ShowStatementView = false;
      this.showBillSummary = false;
    }
  }

  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

}

