import { Component, ChangeDetectorRef } from "@angular/core";

import PHRMGridColumns from '../shared/phrm-grid-columns';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { PHRMSupplierModel } from "../shared/phrm-supplier.model"
import { PHRMACCSuppliersModel } from "../shared/phrm-acc-suppliers.model"
import { PHRMGoodsReceiptItemsModel } from "../shared/phrm-goods-receipt-items.model"
import { PharmacyBLService } from "../shared/pharmacy.bl.service"
import { MessageboxService } from "../../shared/messagebox/messagebox.service"
import { CommonFunctions } from "../../shared/common.functions"
import * as moment from 'moment/moment';
import { CoreService } from "../../core/shared/core.service";
import { IGridFilterParameter } from "../../shared/danphe-grid/grid-filter-parameter.interface";
import { GeneralFieldLabels } from "../../shared/DTOs/general-field-label.dto";

@Component({
  templateUrl: "./phrm-acc-supplier-list.html"
})
export class PHRMSuppliersListComponent {
  public currentGRdetails: PHRMACCSuppliersModel = new PHRMACCSuppliersModel();
  public innerGRdetails: PHRMACCSuppliersModel = new PHRMACCSuppliersModel();
  public selectedDatalist: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  public goodsReceiptItemsList: Array<PHRMGoodsReceiptItemsModel> = new Array<PHRMGoodsReceiptItemsModel>();
  public goodsReceiptList: Array<PHRMACCSuppliersModel> = new Array<PHRMACCSuppliersModel>();
  public griForCurrentSupplier: Array<PHRMACCSuppliersModel> = new Array<PHRMACCSuppliersModel>();
  public filterGoodsReceiptList: Array<PHRMACCSuppliersModel> = new Array<PHRMACCSuppliersModel>();
  public newGoodsReceiptList: Array<PHRMACCSuppliersModel> = new Array<PHRMACCSuppliersModel>();
  public supplierList: Array<PHRMSupplierModel> = new Array<PHRMSupplierModel>();
  public goodsreceiptsGridColumns: Array<any> = null;
  public showGRItemsbyGRId: boolean = false;
  public IsCancelStatus: boolean = false;
  public printGR: boolean = false;
  public fromDate: string;
  public toDate: string;
  public fromDay: number = null;
  public toDay: number = null;
  public supplierId: number = null;
  public totalAmount: number = null;
  public subTotal: number = null;
  public discountTotal: number = null;
  public vatAmount: number = null;
  public ccAmount: number = null;
  public showGRIListofSupplier: boolean = false;
  public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
  accsuppliersGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
  totalAmount1: number;
  subTotal1: number;
  discountTotal1: any;
  VATAmount1: any;
  FilterParameters: IGridFilterParameter[] = [];
  dateRange: string;
  footerContent: string;
  goodsReceiptReturnItemList: Array<any> = null;
  showGRReturnItemsbyGRId: boolean = false;

  public GeneralFieldLabel = new GeneralFieldLabels();

  constructor(public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
    //this.fromDate = moment().format('YYYY-MM-DD');
    //this.toDate = moment().format('YYYY-MM-DD');
    this.goodsreceiptsGridColumns = PHRMGridColumns.PHRMACCTGoodsReceiptList;
    this.accsuppliersGridColumns = PHRMGridColumns.PHRMACCTSuppliersList;
    // this.GetAccountDetails();
    this.GetPharmacyBillingHeaderParameter()
    this.GetSupplierData();
    this.GeneralFieldLabel = coreService.GetFieldLabelParameter();
  }
  //this function load all suppliers details
  GetSupplierData() {
    try {
      this.pharmacyBLService.GetSupplierList()
        .subscribe(
          res => {
            if (res.Status == "OK") {
              this.supplierList = res.Results;
            } else {
              this.msgBoxServ.showMessage("failed", ['Failed to get supplier list.' + res.ErrorMessage]);
            }
          },
          err => {
            this.msgBoxServ.showMessage("error", ['Failed to get supplier list.' + err.ErrorMessage]);
          }
        );
    }
    catch (exception) {
      console.log(exception);
      this.msgBoxServ.showMessage("error", ['error details see in console log']);
    }
  }
  //used to format display item in ng-autocomplete
  myListFormatter(data: any): string {
    let html = data["SupplierName"];
    return html;
  }
  public GetSuppliersLedgerInfo() {
    //var todat = new Date(this.toDate);
    if (this.fromDate == null || this.toDate == null) {
      this.msgBoxServ.showMessage('Notice', ['Please select valid date']);
      return;
    }

    this.pharmacyBLService.GetSuppliersLedgerInfo(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.newGoodsReceiptList = res.Results;
          this.goodsReceiptList = res.Results;

          for (let i = 0; i < this.goodsReceiptList.length; i++) {
            var date2 = new Date(this.goodsReceiptList[i].GoodReceiptDate);
            var date1 = new Date(moment().format('YYYY-MM-DD'));
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            this.goodsReceiptList[i].AgingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

          }
          this.filterGoodsReceiptList = new Array<PHRMACCSuppliersModel>();
          this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == false);

          //reset 
          this.totalAmount = this.subTotal = this.vatAmount = this.ccAmount = 0;
          if (this.newGoodsReceiptList)
            this.totalAmount = this.newGoodsReceiptList.filter(s => s.IsCancel == false).reduce((sum, current) => sum + current.TotalAmount, 0);
          this.subTotal = this.newGoodsReceiptList.filter(s => s.IsCancel == false).reduce((sum, current) => sum + current.SubTotal, 0);
          this.discountTotal = this.newGoodsReceiptList.filter(s => s.IsCancel == false).reduce((sum, current) => sum + current.DiscountAmount, 0);
          this.vatAmount = this.newGoodsReceiptList.filter(s => s.IsCancel == false).reduce((sum, current) => sum + current.VATAmount, 0);
          //this.ccAmount = this.newGoodsReceiptList.filter(s => s.IsCancel == false).reduce((sum, current) => sum + current.CCAmount, 0);

        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
        });
  }

  public summaryData = {
    Subtotal: 0,
    DiscountAmount: 0,
    VATAmount: 0,
    TotalAmount: 0
  }
  GoodsReceiptGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        //changing datetime format to date only for view
        $event.Data.GoodReceiptDate = moment($event.Data.GoodReceiptDate).format("YYYY-MM-DD");
        this.currentGRdetails = $event.Data;
        this.FilterParameters = [
          { DisplayName: "SupplierName", Value: this.currentGRdetails.SupplierName },
          { DisplayName: "DateRange", Value: `<b>From:</b>&nbsp;${this.fromDate}&nbsp;<b>To:</b>&nbsp;${this.toDate}` },
        ];
        this.pharmacyBLService.GetEachAccountDetailsList(this.currentGRdetails.SupplierId, this.fromDate, this.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.griForCurrentSupplier = res.Results;

              this.showGRIListofSupplier = true;
              if (this.griForCurrentSupplier.length > 0) {
                this.summaryData.Subtotal = this.griForCurrentSupplier.reduce((a, b) => a + b.SubTotal, 0);
                this.summaryData.DiscountAmount = this.griForCurrentSupplier.reduce((a, b) => a + b.DiscountAmount, 0)
                this.summaryData.VATAmount = this.griForCurrentSupplier.reduce((a, b) => a + b.VATAmount, 0)
                this.summaryData.TotalAmount = this.griForCurrentSupplier.reduce((a, b) => a + b.TotalAmount, 0)
              }

            }
          });
        break;
      }
      default:
        break;
    }
  }
  GRSupplierGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
          this.currentGRdetails.InvoiceNo = $event.Data.InvoiceNo;
          this.currentGRdetails.GoodReceiptPrintId = $event.Data.GoodReceiptPrintId;
          this.currentGRdetails.GoodReceiptDate = $event.Data.GoodReceiptDate;
          this.currentGRdetails.ContactNo = $event.Data.ContactNo;
          this.innerGRdetails = $event.Data;
          if ($event.Data.GoodReceiptType == 'Returned GR') {
            this.ShowGRReturnItem(this.innerGRdetails.GoodReceiptId, this.currentGRdetails.GoodReceiptPrintId)
          }
          else {
            this.ShowGRItemsbyGRId(this.innerGRdetails.GoodReceiptId);
          }
          this.showGRIListofSupplier = false;

        }
        break;
      }
      default:
        break;
    }
  }
  public GRSummary = {
    SubTotal: 0,
    DiscountAmount: 0,
    VATAmount: 0,
    CCAmount: 0,
    TotalAmount: 0
  }
  ShowGRItemsbyGRId(goodsreceiptId) {

    //making server call when required data is not found in localdatalist (ID is passed to fetch specific data)
    this.pharmacyBLService.GetGRItemsByGRId(goodsreceiptId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.goodsReceiptItemsList = res.Results;
          //changing datetime format to view only date and limitng percentage to 2 decimal
          this.goodsReceiptItemsList.forEach(gr => {
            // gr.ManufactureDate = moment(gr.ManufactureDate).format("YYYY-MM-DD");
            gr.ExpiryDate = moment(gr.ExpiryDate).format("YYYY-MM-DD");
            gr.VATPercentage = CommonFunctions.parseAmount(gr.VATPercentage);
          });

          this.GRSummary.SubTotal = this.goodsReceiptItemsList.reduce((a, b) => a + b.SubTotal, 0);
          this.GRSummary.DiscountAmount = this.goodsReceiptItemsList.reduce((a, b) => a + b.DiscountAmount, 0);
          this.GRSummary.VATAmount = this.goodsReceiptItemsList.reduce((a, b) => a + b.VATAmount, 0);
          this.GRSummary.CCAmount = this.goodsReceiptItemsList.reduce((a, b) => a + b.CCAmount, 0);
          this.GRSummary.TotalAmount = this.goodsReceiptItemsList.reduce((a, b) => a + b.TotalAmount, 0);
          this.showGRItemsbyGRId = false;
          this.changeDetector.detectChanges();
          //after changedetection we will make showGRItemsbyGRId=true to show view popup
          this.showGRItemsbyGRId = true;
        }
        else {
          this.msgBoxServ.showMessage("failed", ['failed to get Goods Receipt Items List. ' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['failed to get Goods Receipt Items List. ' + err.ErrorMessage]);
        }
      );
  }

  public ReturnSummary = {
    SubTotal: 0,
    DiscountAmount: 0,
    VATAmount: 0,
    CCAmount: 0,
    TotalAmount: 0
  }
  ShowGRReturnItem(goodsreceiptId, creditNotePrintId) {
    this.pharmacyBLService.GetGRReturnItemsByGRId(goodsreceiptId, creditNotePrintId).subscribe(res => {
      if (res.Status == "OK") {
        this.goodsReceiptReturnItemList = res.Results;
        this.goodsReceiptReturnItemList.forEach(grret => {
          grret.ExpiryDate = moment(grret.ExpiryDate).format("YYYY-MM-DD");
          grret.VATPercentage = CommonFunctions.parseAmount(grret.VATPercentage);
          grret.DiscountPercentage = CommonFunctions.parseAmount(grret.DiscountPercentage);
        });

        this.ReturnSummary.SubTotal = this.goodsReceiptReturnItemList.reduce((a, b) => a + b.SubTotal, 0);
        this.ReturnSummary.DiscountAmount = this.goodsReceiptReturnItemList.reduce((a, b) => a + b.DiscountAmount, 0);
        this.ReturnSummary.VATAmount = this.goodsReceiptReturnItemList.reduce((a, b) => a + b.VATAmount, 0);
        this.ReturnSummary.CCAmount = this.goodsReceiptReturnItemList.reduce((a, b) => a + b.CCAmount, 0);
        this.ReturnSummary.TotalAmount = this.goodsReceiptReturnItemList.reduce((a, b) => a + b.TotalAmount, 0);

        this.showGRReturnItemsbyGRId = true;
      }
      else {
        this.msgBoxServ.showMessage("failed", ['failed to get Goods Receipt Return Items List. ' + res.ErrorMessage]);
      }
    },
      err => {
        this.msgBoxServ.showMessage("error", ['failed to get Goods Receipt Return Items List. ' + err.ErrorMessage]);
      })

  }

  SupplierChange($event) {
    this.supplierId = $event.SupplierId;
  }
  public filterlist() {
    this.supplierId = this.currentSupplier.SupplierId;
    if (this.fromDate && this.toDate) {
      this.fromDate = moment(this.fromDate).add(this.fromDay, 'days').format('YYYY-MM-DD');
      this.toDate = moment(this.toDate).add(-this.toDay, 'days').format('YYYY-MM-DD');

      this.newGoodsReceiptList = [];
      this.filterGoodsReceiptList.forEach(list => {
        let selPharmDate = moment(list.CreatedOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selPharmDate <= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selPharmDate >= moment(this.toDate).format('YYYY-MM-DD')


        if (isGreterThanFrom && isSmallerThanTo && list.SupplierId == this.supplierId) {

          var date2 = new Date(list.GoodReceiptDate);
          var date1 = new Date(moment().format('YYYY-MM-DD'));
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          list.AgingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

          this.newGoodsReceiptList.push(list);
        }
      });

      this.totalAmount = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
        .map(c => c.TotalAmount).reduce((sum, current) => sum + current);
      this.subTotal = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
        .map(c => c.SubTotal).reduce((sum, current) => sum + current);
      this.discountTotal = this.newGoodsReceiptList.filter(a => a.SupplierId == this.supplierId)
        .map(c => c.DiscountAmount).reduce((sum, current) => sum + current);


      this.fromDate = moment().format('YYYY-MM-DD');
      this.toDate = moment().format('YYYY-MM-DD');

    }
    else {

      this.newGoodsReceiptList = this.filterGoodsReceiptList.filter(a => a.SupplierId == this.supplierId);
    }

  }
  gridExportOptions = {
    fileName: 'PharmacyGoodReceiptLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Close() {
    this.showGRItemsbyGRId = false;
    this.showGRIListofSupplier = true;
    this.showGRReturnItemsbyGRId = false;
  }
  CloseGRIListOfSupplier() {
    this.showGRIListofSupplier = false;
  }
  printGoodReciept() {
    let popupWinindow;
    var printContents = document.getElementById("print-good-reciept").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

    popupWinindow.document.close();


  }

  LoadGoodsReceiptListByStatus(flag) {
    this.filterGoodsReceiptList = new Array<PHRMACCSuppliersModel>();
    if (flag == true) {
      this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == true);
    }
    else {
      this.filterGoodsReceiptList = this.goodsReceiptList.filter(s => s.IsCancel == false);
    }
    this.newGoodsReceiptList = this.filterGoodsReceiptList;
  }

  public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetPharmacyBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  OnFromToDateChange($event) {
    if ($event) {
      this.fromDate = $event.fromDate;
      this.toDate = $event.toDate;
      // this.GetAccountDetails();
    }

  }
  ngAfterViewChecked() {
    this.dateRange = "<b>From:</b>&nbsp;" + this.fromDate + "&nbsp;<b>To:</b>&nbsp;" + this.toDate;

    if (this.showGRIListofSupplier) {
      this.footerContent = document.getElementById("PharmacySupplierAccountSummary").innerHTML;
    }
  }
}
