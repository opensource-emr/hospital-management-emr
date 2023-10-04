import { Component, Input, OnInit } from '@angular/core';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { CoreService } from '../../../../core/shared/core.service';
import { InventoryReportsBLService } from '../../shared/inventory-reports.bl.service';

@Component({
  selector: 'app-expirable-stock-detail-view',
  templateUrl: './expirable-stock-detail-view.component.html'
})
export class ExpirableStockDetailViewComponent implements OnInit {

  public headerDetail: { header1, header2, header3, header4, hospitalName, address, email, PANno, tel, DDA };
  printDetaiils: HTMLElement;
  showPrint: boolean = false;

  @Input('selectedItemId')
  selectedItemId: number = 0;

  @Input('fromDate')
  fromDate: string = '';

  @Input('toDate')
  toDate: string = '';

  @Input('fiscalYearId') fiscalYearId: number = null;
  ExpirableStockDetailView: any[] = [];
  ExpirableStockItemDetailView: ExpirableStockItemDetailView = new ExpirableStockItemDetailView();

  constructor(public msgBox: MessageboxService, public coreService: CoreService, public inventoryReportBLService: InventoryReportsBLService) {

  }

  ngOnInit() {
    this.GetInventoryBillingHeaderParameter();
    this.LoadReport();
  }

  //Gets Header For the report
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(a => a.ParameterName == 'Inventory Receipt Header').ParameterValue;
    if (paramValue)
      this.headerDetail = JSON.parse(paramValue);
    else
      this.msgBox.showMessage("error", ["Please enter parameter values for BillingHeader"]);
  }

  LoadReport() {
    this.inventoryReportBLService.GetExpirableStockReportData(this.fromDate, this.toDate, this.fiscalYearId, this.selectedItemId).subscribe(res => {
      if (res.Status == "OK") {
        if (res.Results.expirableStockDetailViewModel.length > 0) {
          this.ExpirableStockDetailView = res.Results.expirableStockDetailViewModel;
          this.ExpirableStockItemDetailView = res.Results.expirableStockReportDataViewModel;
        }
        else {
          this.msgBox.showMessage('Notice', ['No data']);
        }
      }
      else {
        this.msgBox.showMessage('Failed', ['Failed to get report data']);
        console.log(res.ErrorMessage);
      }
    }, err => {
      this.msgBox.showMessage('Failed', ['Failed to get report data']);
      console.log(err.ErrorMessage);
    })
  }

  print() {
    this.printDetaiils = document.getElementById("divExpirableStockViewPage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }

}
export class ExpirableStockItemDetailView {
  ItemName: string = null;
  Code: string = null;
  UOMName: string = null;
  SubCategoryName: string = null;
  ItemCategory: string = null;


}
