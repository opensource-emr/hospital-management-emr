import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PHRMInvoiceItemsModel } from '../../../../pharmacy/shared/phrm-invoice-items.model';
import { PHRMPatient } from '../../../../pharmacy/shared/phrm-patient.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import DispensaryGridColumns from '../../../shared/dispensary-grid.column';
import { DispensaryService } from '../../../shared/dispensary.service';
import { ENUM_DanpheHTTPResponses, ENUM_MessageBox_Status } from '../../../../shared/shared-enums';

@Component({
  selector: 'app-provisional-return',
  templateUrl: './provisional-return.component.html',
  styles: []
})
export class ProvisionalReturnComponent implements OnInit {

  public ProvisionalReturnListGrid: any;
  public provisionalBillsSummary: Array<any> = [];
  public provisionalBillFiltered: Array<any> = [];
  public remarks: string = null;
  public isPrint: boolean = false;
  public currSaleItemsRetOnly: Array<PHRMInvoiceItemsModel> = new Array<PHRMInvoiceItemsModel>();
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = "last1Week";
  public total: number = 0;
  public showSaleItemsPopup: boolean = false;
  public currentPatient: PHRMPatient = new PHRMPatient();
  public TransactionDate: string = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public currentActiveDispensary: PHRMStoreModel;
  ProvisionalReturnData: ProvisionalReturn_DTO[] = [];
  ShowProvisionalReturnReceipt: boolean = false;

  ReturnReceiptNo: number = 0;
  constructor(private _dispensaryService: DispensaryService,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService
  ) {
    this.ProvisionalReturnListGrid = DispensaryGridColumns.ProvisionalReturnList;
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('LastReturnDate', false));
    this.currentActiveDispensary = this._dispensaryService.activeDispensary;

  }
  ngOnInit(): void {
  }

  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }

  onGridDateChange($event) {

    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetProvisionalReturns(this.fromDate, this.toDate, this.currentActiveDispensary.StoreId)
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }

  }

  CreditBillGridActions($event: GridEmitModel) {
    switch ($event.Action) {

      case "view": {
        if ($event.Data != null) {
          this.ReturnReceiptNo = $event.Data.CancellationReceiptNo;
          this.ShowProvisionalReturnReceipt = true;
        }
        break;
      }
      default:
        break;
    }
  }

  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  Close() {
    this.showSaleItemsPopup = false;
  }

  GetProvisionalReturns(FromDate: string, ToDate: string, StoreId: number) {
    this.pharmacyBLService.GetProvisionalReturns(FromDate, ToDate, StoreId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.ProvisionalReturnData = res.Results;
      }
      else {
        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrive data']);
      }
    }, err => {
      this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Failed, ['Failed to retrive data' + err]);
    })
  }

  OnPopUpClose() {
    this.ShowProvisionalReturnReceipt = false;
  }

}
export class ProvisionalReturn_DTO {
  PatientCode: number = null;
  PatientName: string = '';
  ReferenceProvisionalReceiptNo: number = 0;
  CancellationReceiptNo: number = 0;
  SubTotal: number = 0;
  DiscountAmount: number = 0;
  TotalAmount: number = 0;
  VisitType: string = '';
  Gender: string = '';
  DateOfBirth: string = '';
  LastReturnDate: string = '';

}
