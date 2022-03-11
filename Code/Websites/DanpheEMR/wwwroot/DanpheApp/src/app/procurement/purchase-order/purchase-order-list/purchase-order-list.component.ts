import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { GridEmitModel } from '../../../shared/danphe-grid/grid-emit.model';
import { NepaliDateInGridParams, NepaliDateInGridColumnDetail } from '../../../shared/danphe-grid/NepaliColGridSettingsModel';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import ProcurementGridColumns from '../../shared/procurement-grid-column';
import { ProcurementBLService } from '../../shared/procurement.bl.service';
import { PurchaseOrder } from '../purchase-order.model';

@Component({
  selector: 'app-purchase-order-list',
  templateUrl: './purchase-order-list.component.html',
  styles: []
})
export class PurchaseOrderListComponent implements OnInit {

  public purchaseOrderList: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public index: number = 0;
  public purchaseOrdersGridColumns: Array<any> = null;
  public polistVendorwiseGridColumns: Array<any> = null;
  public disable: boolean = true;
  public showVendorwise: boolean = false;
  public fromDate: string = '';
  public toDate: string = '';
  public dateRange: string = 'None';
  public poListfiltered: Array<PurchaseOrder> = new Array<PurchaseOrder>();
  public showDetails: any;
  public NepaliDateInGridSettings: NepaliDateInGridParams = new NepaliDateInGridParams();
  poStatusForFilter: string = 'pending';
  constructor(
    public procBLService: ProcurementBLService,
    public inventoryService: InventoryService,
    public router: Router,
    public messageBoxService: MessageboxService) {
    this.purchaseOrdersGridColumns = ProcurementGridColumns.POList;
    this.NepaliDateInGridSettings.NepaliDateColumnList.push(new NepaliDateInGridColumnDetail('PoDate', false));
    this.disable = true;

    this.fromDate = moment().format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit(): void {
  }

  onDateChange($event) {
    this.fromDate = $event.fromDate;
    this.toDate = $event.toDate;
    if (this.fromDate != null && this.toDate != null) {
      if (moment(this.fromDate).isBefore(this.toDate) || moment(this.fromDate).isSame(this.toDate)) {
        this.LoadPOListByStatus();
      } else {
        this.messageBoxService.showMessage('failed', ['Please enter valid From date and To date']);
      }

    }
  }

  LoadPOListByStatus(): void {
    //there is if condition because we have to check diferent and multiple status in one action ....
    //like in pending we have to check the active and partial both...
    var Status = '';
    if (this.poStatusForFilter == "pending") {
      Status = "active,pending,partial";
    }
    else if (this.poStatusForFilter == "complete") {
      Status = "complete";
    }
    else if (this.poStatusForFilter == "cancelled") {
      Status = "cancelled";
    }
    else if (this.poStatusForFilter == "all") {
      Status = "active,pending,partial,complete,initiated,cancelled";
    }
    else {
      Status = "initiated"
    }
    this.showVendorwise = false;
    this.procBLService.GetPurchaseOrderList(this.fromDate, this.toDate, Status)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.purchaseOrderList = res.Results;
          this.purchaseOrderList.forEach(PO => {
            PO.PoDate = moment(PO.PoDate).format("YYYY-MM-DD");
            if (PO.IsVerificationEnabled == true) {
              var VerifierIdsParsed: any[] = JSON.parse(PO.VerifierIds);
              PO.MaxVerificationLevel = VerifierIdsParsed.length;
            }
          });
          this.poListfiltered = this.purchaseOrderList;
        }
        else {
          this.messageBoxService.showMessage("failed", ['failed to get Purchase Order.. please check log for details.']);
          console.log(res.ErrorMessage);
        }
      });
  }

  PurchaseOrderGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "genReceipt":
        {
          var data = $event.Data;
          this.ShowDetails(data);
          break;
        }
      case "view":
        {
          this.RouteToViewDetails($event.Data.PurchaseOrderId)
          break;
        }
      case 'CreateCopy':
        {
          this.RouteToRecreatePO($event.Data.PurchaseOrderId);
        }
      default:
        break;
    }
  }

  povendorGridAction($event: GridEmitModel) {
    switch ($event.Action) {
      case "genGR": {
        break;
      }
      default:
        break;
    }
  }

  ShowDetails(details) {
    //Pass the Purchase order Id  to Next page for getting PUrchaserOrderItems using inventoryService
    this.inventoryService.POId = details.PurchaseOrderId;
    this.router.navigate(['/ProcurementMain/GoodsReceipt/GoodsReceiptAdd']);
  }
  //route to create PO page
  CreatePurchaseOrder() {
    this.inventoryService.PurchaseRequestId = 0;
    this.inventoryService.POId = 0;
    this.inventoryService.POIdforCopy = 0;
    this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
  }
  //route to recreate PO page
  RouteToRecreatePO(id) {
    this.inventoryService.POIdforCopy = id;
    this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderAdd']);
  }
  RouteToViewDetails(id) {
    //pass the purchaseorderID to purchaseorderDetails page
    this.inventoryService.POId = id;//sud:3Mar'20-Property Rename in InventoryService
    this.router.navigate(['/ProcurementMain/PurchaseOrder/PurchaseOrderView']);
  }

  //temp to create quotation analysis
  QAnalysis() {
    this.router.navigate(['/ProcurementMain/Quotation/QuotationAnalysis']);
  }

  public filterlist() {
    if (this.fromDate && this.toDate) {
      this.poListfiltered = [];
      this.purchaseOrderList.forEach(inv => {
        let selinvDate = moment(inv.CreatedOn).format('YYYY-MM-DD');
        let isGreterThanFrom = selinvDate >= moment(this.fromDate).format('YYYY-MM-DD');
        let isSmallerThanTo = selinvDate <= moment(this.toDate).format('YYYY-MM-DD')
        if (isGreterThanFrom && isSmallerThanTo) {
          this.poListfiltered.push(inv);
        }
      });
    }
    else {
      this.poListfiltered = this.purchaseOrderList;
    }
  }

  //start: sud-4May'20-- For Export feature in gr-list
  getGridExportOptions() {
    let gridExportOptions = {
      fileName: 'PurchaseOrderList-' + moment().format('YYYY-MM-DD') + '.xls',
      displayColumns: ["PurchaseOrderId", "PoDate", "PRNumber", "VendorName", "VendorContact", "TotalAmount", "POStatus"]
    };
    return gridExportOptions;
  }
}
