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
  public showGRIListofSupplier: boolean = false;
  public currentSupplier: PHRMSupplierModel = new PHRMSupplierModel();
    accsuppliersGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
    totalAmount1: number;
    subTotal1: number;
    discountTotal1: any;
    VATAmount1: any;
  constructor(public coreService: CoreService,
    public pharmacyBLService: PharmacyBLService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService) {
    //this.fromDate = moment().format('YYYY-MM-DD');
    //this.toDate = moment().format('YYYY-MM-DD');
    this.goodsreceiptsGridColumns = PHRMGridColumns.PHRMACCTGoodsReceiptList;
    this.accsuppliersGridColumns = PHRMGridColumns.PHRMACCTSuppliersList;
    this.GetAccountDetails();
    this.GetPharmacyBillingHeaderParameter()
    this.GetSupplierData();
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
  public GetAccountDetails() {
    var todat = new Date(this.toDate);
    this.pharmacyBLService.GetAccountDetailsList()
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

          this.totalAmount = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.TotalAmount).reduce((sum, current) => sum + current);
          this.subTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.SubTotal).reduce((sum, current) => sum + current);
          this.discountTotal = this.goodsReceiptList.filter(s => s.IsCancel == false).map(c => c.DiscountAmount).reduce((sum, current) => sum + current);

        }
        else {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ["Failed to get GoodsReceiptList. " + err.ErrorMessage]);
        });
  }
  GoodsReceiptGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        //changing datetime format to date only for view
        $event.Data.GoodReceiptDate = moment($event.Data.GoodReceiptDate).format("YYYY-MM-DD");
        this.currentGRdetails = $event.Data;
        this.pharmacyBLService.GetEachAccountDetailsList(this.currentGRdetails.SupplierId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.griForCurrentSupplier = res.Results;
              this.showGRIListofSupplier = true;
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
          this.currentGRdetails.GoodReceiptDate = $event.Data.GoodReceiptDate ;
          this.innerGRdetails = $event.Data;
          this.ShowGRItemsbyGRId(this.innerGRdetails.GoodReceiptId);
          this.showGRIListofSupplier = false;
        }
        break;
      }
      default:
        break;
    }
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
  }
  CloseGRIListOfSupplier(){
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
  
}
