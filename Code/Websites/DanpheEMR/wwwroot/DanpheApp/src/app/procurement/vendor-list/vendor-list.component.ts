import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { CoreService } from '../../core/shared/core.service';
import { InventoryService } from '../../inventory/shared/inventory.service';
import { GridEmitModel } from '../../shared/danphe-grid/grid-emit.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { GoodsReceipt } from '../goods-receipt/goods-receipt.model';
import ProcurementGridColumns from '../shared/procurement-grid-column';
import { ProcurementBLService } from '../shared/procurement.bl.service';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styles: []
})
export class VendorListComponent implements OnInit {
  ngOnInit() {
  }


  public newGoodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public currentGRdetails: GoodsReceipt = new GoodsReceipt();
  public innerVendordetails: GoodsReceipt = new GoodsReceipt();
  public vendorList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public filterGoodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public griForCurrentVendor: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public newVendorList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public goodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  vendorsGridColumns: ({ headerName: string; field: string; width: number; template?: undefined; } | { headerName: string; field: string; width: number; template: string; })[];
  public supplierId: number = null;
  public fromDate: string;
  public toDate: string;
  public subTotal: number = 0;
  public fromDay: number = null;
  public GoodReceiptDate: string = "";
  public currentVendor: GoodsReceipt = new GoodsReceipt();
   public totalAmount: number = 0;
  public showVendorsbyVendorId: boolean = false;
   public showListofVendor: boolean = false ;
   toDay: any;
   messageBoxService: any;
   public discountTotal: number = 0;
   public Discount: number = 0;

  constructor( public coreService: CoreService,
    public procurementBLService: ProcurementBLService,
    public inventoryService: InventoryService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public router: Router) {
    this.vendorsGridColumns = ProcurementGridColumns.VendorsList;
    this.GetVendorsDetailsList();
    this.GetInventoryBillingHeaderParameter();
  }

  
  public GetVendorsDetailsList() {
    var todat = new Date(this.toDate);
    this.procurementBLService.GetVendorsDetailsList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.goodsReceiptList = res.Results;
          
          this.filterGoodsReceiptList = new Array<GoodsReceipt>();
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
  // outer grid action
 VendorsGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        //changing datetime format to date only for view
        $event.Data.GoodReceiptDate = moment($event.Data.GoodReceiptDate).format("YYYY-MM-DD");
        this.currentGRdetails = $event.Data;
        this.procurementBLService.GetEachVendorDetailsList(this.currentGRdetails.VendorId)
          .subscribe(res => {
            if (res.Status == "OK") {
              this.griForCurrentVendor = res.Results;
              this.showListofVendor = true;
 }
          });
        break;
      }
      default:
        break;
    }
  }
  // inner grid  action
  VendorGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "view": {
        if ($event.Data != null) {
          this.innerVendordetails = $event.Data;
          this.ShowVendorsbyGRId(this.innerVendordetails.GoodsReceiptID);
          this.showListofVendor = false;
        }
        break;
      }
      default:
        break;
    }
  }
  ShowVendorsbyGRId(GoodsReceiptId) {

    //making server call when required data is not found in localdatalist (ID is passed to fetch specific data)
    this.procurementBLService.GetGRItemsByGRId(GoodsReceiptId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.vendorList = res.Results; // not an array
          //changing datetime format to view only date and limitng percentage to 2 decimal
          this.showVendorsbyVendorId = false;
          this.changeDetector.detectChanges();
          this.showVendorsbyVendorId = true;

          //after changedetection we will make showGRItemsbyGRId=true to show view popup
          
        }
        else {
          this.msgBoxServ.showMessage("failed", ['failed to get Vendors List. ' + res.ErrorMessage]);
        }
      },
        err => {
          this.msgBoxServ.showMessage("error", ['failed to get Vendors List. ' + err.ErrorMessage]);
        }
      );
  }
  
  
  gridExportOptions = {
    fileName: 'VendortLists_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  Close() {
    this.showVendorsbyVendorId = false;
    this.showListofVendor = false;
  }
  //printVendorsList() {
  //  let popupWinindow;
  //  var printContents = document.getElementById("print-vendors-list").innerHTML;
  //  popupWinindow = window.open('', '_blank', 'width=1600,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
  //  popupWinindow.document.open();
  //  popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../../themes/theme-default/ReceiptList.css" /></head><body onload="window.print()">' + printContents + '</body></html>');

  //  popupWinindow.document.close();
  //}

  

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };

  //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }
}
