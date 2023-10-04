import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { SecurityService } from '../../../security/shared/security.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { GoodsReceipt } from '../goods-receipt.model';

@Component({
  selector: 'app-goods-receipt-list',
  templateUrl: './goods-receipt-list.component.html'
})
export class GoodsReceiptListComponent implements OnInit {
  public selectedGoodsReceiptId: number;
  public goodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public goodsreceiptGridColumns: Array<any> = null;
  public fromDate: string = null;
  public toDate: string = null;
  public dateRange: string = null;
  public grListfiltered: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public newGoodsReceiptList: Array<GoodsReceipt> = new Array<GoodsReceipt>();
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  public GRFilterStatus: string = 'complete';
  public showDonationReceipt: boolean;

  constructor(
    public procurementBLService: ProcurementBLService, public inventoryService: InventoryService, public msgBoxServ: MessageboxService, public router: Router, public securityService: SecurityService) {
    this.dateRange = 'None'; //means last 1 month
    this.goodsreceiptGridColumns = ProcurementGridColumns.GRList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(...[new NepaliDateInGridColumnDetail('GoodsReceiptDate'), new NepaliDateInGridColumnDetail('VendorBillDate')]);
  }
  ngOnInit(): void {
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.GetGoodsReceiptList();
      } else {
        this.msgBoxServ.showMessage('failed', ['Please enter valid From date and To date']);
      }
    }
  }


  GetGoodsReceiptList() {
    this.procurementBLService.GetGoodsReceiptList(this.fromDate, this.toDate)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.goodsReceiptList = res.Results;

          this.goodsReceiptList.forEach(GR => {
            //removed the time part as print and export shows in YYYY-MM-DD Thh:MM:ss format otherwise.
            GR.GoodsArrivalDate = moment(GR.GoodsArrivalDate).format("YYYY-MM-DD");
            GR.GoodsReceiptDate = moment(GR.GoodsReceiptDate).format("YYYY-MM-DD");
            GR.VendorBillDate = moment(GR.VendorBillDate).format("YYYY-MM-DD");
            //need to parse the verifier's ids if verification is enabled..
            if (GR.IsVerificationEnabled == true) {
              var VerifierIdsParsed: any[] = JSON.parse(GR.VerifierIds);
              GR.MaxVerificationLevel = VerifierIdsParsed.length;
            }
          });

          this.LoadGoodsReceiptListByStatus();
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
        this.RouteToViewDetails($event.Data.GoodsReceiptID);
        break;
      }
      case "show-donation-detail": {
        this.selectedGoodsReceiptId = $event.Data.GoodsReceiptID;
        this.showDonationReceipt = true;
      }
      default:
        break;
    }
  }
  closeDonationReceipt() {
    this.selectedGoodsReceiptId = null;
    this.showDonationReceipt = false;
  }
  RouteToViewDetails(goodsReceiptId: number) {
    //pass the goodsreceiptID to goodreceiptDetails page
    this.inventoryService.GoodsReceiptId = goodsReceiptId;
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptView']);
  }

  CreateNewGoodReceipt() {
    this.inventoryService.GoodsReceiptId = null;
    this.inventoryService.POId = 0;
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptAdd']);
  }

  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.grListfiltered = [];
      this.goodsReceiptList.forEach(inv => {
        let selinvDate = moment(inv.GoodsArrivalDate).format('YYYY-MM-DD');
        let isGreterThanFrom = selinvDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selinvDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.grListfiltered.push(inv);
        }
      });
    }
    this.LoadGoodsReceiptListByStatus();

  }

  LoadGoodsReceiptListByStatus() {
    this.grListfiltered = new Array<GoodsReceipt>();
    switch (this.GRFilterStatus) {
      case "complete":
        this.grListfiltered = this.goodsReceiptList.filter(s => s.IsCancel == false);
        break;
      case "cancelled":
        this.grListfiltered = this.goodsReceiptList.filter(s => s.IsCancel == true);
        break;
      default:
        break;
    }
    this.newGoodsReceiptList = this.grListfiltered;
  }

  //start: sud-4May'20-- For Export feature in gr-list
  GetGridExportOptions() {
    let gridExportOptions = {
      fileName: 'Goods-Receipt-List-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["GoodsReceiptNo", "GoodReceiptDate", "PurchaseOrderId", "GRCategory", "VendorName", "ContactNo", "BillNo", "TotalAmount", "PaymentMode", "Remarks", "CreatedOn"]
    };
    return gridExportOptions;
  }
  //End: sud-4May'20-- For Export feature in gr-list



}
