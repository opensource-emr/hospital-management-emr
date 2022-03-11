import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { NepaliDateInGridColumnDetail, NepaliDateInGridParams } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { PharmacyBLService } from '../../shared/pharmacy.bl.service';
import PHRMGridColumns from '../../shared/phrm-grid-columns';

@Component({
  selector: 'app-item-wise-purchase-report',
  templateUrl: './item-wise-purchase-report.component.html',
  styleUrls: ['./item-wise-purchase-report.component.css']
})
export class ItemWisePurchaseReportComponent implements OnInit {

  ItemWisePurchaseReportColumns: Array<any> = null;
  ItemWisePurchaseReportData: Array<any> = new Array<any>();
  public FromDate: string = null;
  public ItemName: string = "";
  public ToDate: string = null;
  public itemList: Array<any> = new Array<any>();
  public selectedItem: any;
  public itemId: number = null;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public storeId: number = null;
  public purchaseForm = new FormGroup({ InvoiceNo: new FormControl(''), GRNo: new FormControl('') });
  invoiceNo: number = null;
  goodReceiptNo: number = null;
  grandTotal: any = { totalPurchaseQty: 0, totPurchaseVal_VatExcluded: 0, totVatAmount: 0, totPurchaseValue: 0 };
  public footerContent = '';
  public dateRange: string = "";

  public supplierId: number;
  public selectedSupplier: any;
  public supplierList: Array<any> = new Array<any>();
  loading: boolean;

  constructor(public pharmacyBLService: PharmacyBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService, public changeDetector: ChangeDetectorRef) {
    this.FromDate = moment().format("YYYY-MM-DD");
    this.ToDate = moment().format("YYYY-MM-DD");
    this.ItemWisePurchaseReportColumns = PHRMGridColumns.ItemWisePurchaseList;
    this.GetItemMasterlist();
    this.GetSupplierListDetails();
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail("GoodReceiptDate", false));
  }
  ngOnInit() {
  }
  ngAfterViewChecked() {
    this.footerContent = document.getElementById("print_summary").innerHTML;
  }
  public GetItemMasterlist(): void {
    try {
      this.pharmacyBLService.GetItemMasterList()
        .subscribe(res => {
          this.itemList = res.Results;
        });
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  onChangeItem($event) {
    try {
      if ($event.ItemId > 0) {
        this.itemId = this.selectedItem.ItemId;
      }
      else {
        this.itemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  CheckProperSelectedItem() {
    try {
      if ((typeof this.selectedItem !== 'object') || (typeof this.selectedItem === "undefined") || (typeof this.selectedItem === null)) {
        this.selectedItem = null;
        this.itemId = null;
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  myItemListFormatter(data: any): string {
    let html = data["ItemName"];//+ " |B.No.|" + data["BatchNo"] + " |M.R.P|" + data["MRP"];
    return html;
  }

  GetReportData() {
    this.loading = true;
    if (this.FromDate && this.ToDate) {
      this.invoiceNo = this.purchaseForm.get('InvoiceNo').value == "" ? null : this.purchaseForm.get('InvoiceNo').value;
      this.goodReceiptNo = this.purchaseForm.get('GRNo').value == "" ? null : this.purchaseForm.get('GRNo').value;
      this.ItemWisePurchaseReportData = [];
      this.grandTotal = { totalPurchaseQty: 0, totalPurchaseValue: 0 };
      this.pharmacyBLService.GetItemWisePurchaseReport(this.FromDate, this.ToDate, this.itemId, this.invoiceNo, this.goodReceiptNo, this.supplierId)
        .subscribe(res => {
          if (res.Status == 'OK' && res.Results.length > 0) {
            this.ItemWisePurchaseReportData = res.Results;
            this.grandTotal.totalPurchaseQty = this.ItemWisePurchaseReportData.reduce((a, b) => a + b.ReceivedQuantity, 0);
            this.grandTotal.totPurchaseVal_VatExcluded = this.ItemWisePurchaseReportData.reduce((a, b) => a + b.SubTotal, 0);
            this.grandTotal.totVatAmount = this.ItemWisePurchaseReportData.reduce((a, b) => a + b.VATAmount, 0);
            this.grandTotal.totalPurchaseValue = this.ItemWisePurchaseReportData.reduce((a, b) => a + b.TotalAmount, 0);
            this.changeDetector.detectChanges();
            this.footerContent = document.getElementById("print_summary").innerHTML;
          } else {
            this.ItemWisePurchaseReportData = null;
            this.msgBoxServ.showMessage("Notice-Message", ["Could not find records."])
          }
          this.loading = false;

        });
    }
  }
  OnFromToDateChange($event) {
    this.FromDate = $event ? $event.fromDate : this.FromDate;
    this.ToDate = $event ? $event.toDate : this.ToDate;
    this.dateRange = "<b>Date:</b>&nbsp;" + this.FromDate + "&nbsp;<b>To</b>&nbsp;" + this.ToDate;
  }
  gridExportOptions = {
    fileName: 'PharmacyItemWisePurchaseReport_' + moment().format('YYYY-MM-DD') + '.xls',
  };

  //start: sud/ramesh/sanjit:4Sept'21--Adding suppliers in the same report..
  public GetSupplierListDetails(): void {
    try {
      this.pharmacyBLService.GetSupplierList()
        .subscribe(res => this.CallBackGetSupplierTypeList(res));
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  CallBackGetSupplierTypeList(res) {
    try {
      if (res.Status == 'OK') {
        if (res.Results) {
          this.supplierList = new Array<any>();
          this.supplierList = res.Results;
        }
      }
      else {
        err => {
          this.msgBoxServ.showMessage("failed", ['failed to get items..']);
        }
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }



  mySupplierListFormatter(data: any): string {
    let html = data["SupplierName"];
    return html;
  }


  public SupplierSrchBoxOnFocusOut($event) {
    let supp = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    if (this.selectedSupplier) {
      if (typeof (this.selectedSupplier) == 'string' && this.supplierList.length) {
        supp = this.supplierList.find(a => a.SupplierName.toLowerCase() == this.selectedSupplier.toLowerCase());
      }
      else if (typeof (this.selectedSupplier) == 'object') {
        supp = this.selectedSupplier;
      }
      if (supp) {
        this.supplierId = this.selectedSupplier.SupplierId;
      }
      else
        this.supplierId = null;
    }
    else {
      this.supplierId = null;
    }

  }



  //end: sud/ramesh/sanjit:4Sept'21--Adding suppliers in the same report..

}
