import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PharmacyReceiptModel } from '../../../../pharmacy/shared/pharmacy-receipt.model';
import { PharmacyBLService } from '../../../../pharmacy/shared/pharmacy.bl.service';
import { PharmacyService } from '../../../../pharmacy/shared/pharmacy.service';
import { PHRMInvoiceReturnModel } from '../../../../pharmacy/shared/phrm-invoice-return.model ';
import { PHRMInvoiceModel } from '../../../../pharmacy/shared/phrm-invoice.model';
import { PHRMStoreModel } from '../../../../pharmacy/shared/phrm-store.model';
import { SecurityService } from '../../../../security/shared/security.service';
import { GridEmitModel } from '../../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import DispensaryGridColumns from '../../../shared/dispensary-grid.column';
import { DispensaryService } from '../../../shared/dispensary.service';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {
  //It save list of sale for grid
  public saleListData: Array<PHRMInvoiceModel> = new Array<PHRMInvoiceModel>();
  public saleRetListData: Array<PHRMInvoiceReturnModel> = new Array<PHRMInvoiceReturnModel>();
  //variable for show invoice details with all items
  public saleInvoiceDetails: PHRMInvoiceModel = new PHRMInvoiceModel();
  // //It save InvoiceId with Invoice itmes details for local data access
  public saleInvoiceLocalData = new Array<{ InvoiceId: number, Invoice: PHRMInvoiceModel }>();
  public saleGridColumns: Array<any> = null;
  public showSaleItemsPopup: boolean = false;
  public currDate = moment().format('YYYY-MM-DD');
  public fromDate: string = null;
  public toDate: string = null;
  public pharmListfiltered: Array<PHRMInvoiceModel> = new Array<PHRMInvoiceModel>();
  public pharmRetListfiltered: Array<PHRMInvoiceReturnModel> = new Array<PHRMInvoiceReturnModel>();
  public dateRange: string = "last1Week";
  public pharmacyReceipt: PharmacyReceiptModel = new PharmacyReceiptModel();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();

  public currentDispensary: PHRMStoreModel;
  public isCurrentDispensaryInsurance: boolean;
  loading: boolean = false;

  constructor(public router: Router, public pharmacyService: PharmacyService,
    public pharmacyBLService: PharmacyBLService,
    public msgBoxServ: MessageboxService,
    public changeDetector: ChangeDetectorRef,
    public securityService: SecurityService,
    private _dispensaryService: DispensaryService

  ) {
    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    this.currentDispensary = this._dispensaryService.activeDispensary;
    this.isCurrentDispensaryInsurance = this._dispensaryService.isInsuranceDispensarySelected;
    this.saleGridColumns = this.isCurrentDispensaryInsurance ? DispensaryGridColumns.PHRMInsuranceSaleList : DispensaryGridColumns.PHRMSaleList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('CreateOn', false));
  }
  ngOnInit() {
  }
  //Load sale invoice list
  LoadSaleInvoiceList(): void {
    try {
      this.loading = true;
      this.pharmacyBLService.GetSaleInvoiceList(this.fromDate, this.toDate, this.currentDispensary.StoreId)
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.saleListData = res.Results;
            this.pharmListfiltered = this.saleListData;
            this.loading = false;
          }
          else {
            this.logError(res.ErrorMessage);
          }
        },
          () => {
            this.logError("failed to get patients")
          });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }
  logError(err: any) {
    this.msgBoxServ.showMessage("error", [err]);
    console.log(err);
  }
  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.pharmListfiltered = [];
      this.saleListData.forEach(pharm => {
        let selPharmDate = moment(pharm.CreateOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selPharmDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selPharmDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.pharmListfiltered.push(pharm);
        }
      });
    }
    else {
      this.pharmListfiltered = this.saleListData;
    }
  }
  // Date range change event for From To Date Selector
  OnDateRangeChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
    }
  }

  //Grid actions fires this method
  SaleInvoiceGridActions($event: GridEmitModel) {
    try {
      switch ($event.Action) {
        case "view": {
          if ($event.Data != null) {
            var selectedSaleInvoiceData = $event.Data;
            this.saleInvoiceDetails = selectedSaleInvoiceData;
            this.showSaleItemsPopup = true;
            //this.ShowSaleInvoiceDetail(selectedSaleInvoiceData);
          }
          break;
        }
        case "saleCredit": {
          if ($event.Data != null) {
            var data = $event.Data;
            this.ShowSaleCreditInvoiceDetail(data.InvoiceId);
          }
          break;
        }
        default:
          break;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  ShowSaleCreditInvoiceDetail(InvoiceId) {
    //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
    this.pharmacyService.Id = InvoiceId;
    this.router.navigate(['/Dispensary/Sale/SaleCredit']);
  }

  //Method to show details of single sale invoice
  public ShowSaleInvoiceDetail(selectedSaleInvoiceData) {
    try {
      if (selectedSaleInvoiceData) {
        this.saleInvoiceDetails = selectedSaleInvoiceData;
        //find invoice details in locl variable if find then no need to go server
        let saleInvoiceDetailsSearchData = this.saleInvoiceLocalData.find(a => a.InvoiceId == this.saleInvoiceDetails.InvoiceId);
        if (saleInvoiceDetailsSearchData) {
          this.showSaleItemsPopup = true;
          this.saleInvoiceDetails = saleInvoiceDetailsSearchData.Invoice;
          this.printReceipt(this.saleInvoiceDetails);
        }
        else {
          if (this.saleInvoiceDetails.InvoiceId) {
            this.pharmacyBLService.GetSaleInvoiceItemsByInvoiceId(this.saleInvoiceDetails.InvoiceId)
              .subscribe(res => {
                if (res.Status == 'OK') {
                  this.showSaleItemsPopup = true;
                  this.saleInvoiceDetails.InvoiceItems = res.Results;
                  let tempInvoice = { InvoiceId: this.saleInvoiceDetails.InvoiceId, Invoice: this.saleInvoiceDetails };
                  this.saleInvoiceLocalData.push(tempInvoice);
                  this.printReceipt(this.saleInvoiceDetails);
                }
                else {
                  this.showSaleItemsPopup = false;
                  this.logError(res.ErrorMessage);
                }
              },
                () => {
                  this.showSaleItemsPopup = false;
                  this.logError("failed to get invoice items")
                });
          }
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  OnInvoicePopUpClose() {
    this.showSaleItemsPopup = false;
  }
  //This function only for show catch messages in console 
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

  printReceipt(invoiceItemData) {
    try {
      if (invoiceItemData) {
        let txnReceipt = PharmacyReceiptModel.GetReceiptForTransaction(invoiceItemData);
        txnReceipt.IsValid = true;
        txnReceipt.ReceiptType = "Sale Receipt";
        txnReceipt.BillingUser = invoiceItemData.UserName;
        txnReceipt.Patient = invoiceItemData.Patient;// this.currSale.selectedPatient;
        txnReceipt.Remarks = invoiceItemData.Remarks;
        this.pharmacyService.globalPharmacyReceipt = txnReceipt;
        this.pharmacyReceipt = this.pharmacyService.globalPharmacyReceipt;
        this.showSaleItemsPopup = true;
      }
      else {
        this.msgBoxServ.showMessage("failed", ['no data,please try again']);
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }

  }

  //Export data grid options for excel file
  gridExportOptions = {
    fileName: 'DispensarySaleLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };

}
