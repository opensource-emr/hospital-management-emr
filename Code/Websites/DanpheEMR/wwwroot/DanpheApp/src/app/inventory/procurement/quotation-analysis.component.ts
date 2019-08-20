import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { InventoryBLService } from "../shared/inventory.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
//import { , QuotationModel } from "../shared/request-for-quotation.model";
import { element } from "@angular/core/src/render3";
import { QuotationModel } from "../shared/quotation.model";
import { RequestForQuotationModel } from "../shared/request-for-quotaion.model";
import { InventoryService } from "../shared/inventory.service";
@Component({
  templateUrl: "./quotation-analysis.html",
})
export class QuotationAnalysisComponent {
  public ReqItemList: any = [];
  public QuotItemList: any = [];
  public VendorList: any = [];
  public TotalAmount: any = [];
  public requisition: RequestForQuotationModel = new RequestForQuotationModel();
  public showQuotationDetails: boolean = false;
  public vendors: number = 0;
  public loading: boolean = true;
  public reqForQuotationId: number = 0;
  public selectedVendor: QuotationModel = new QuotationModel();

  constructor(public InventoryBLService: InventoryBLService,
    public messageBoxService: MessageboxService,
    public inventoryService: InventoryService,
    public router: Router) {
    let ReqForQuotationId = this.inventoryService.ReqForQuotationId;
    this.GetQuotationDetails(ReqForQuotationId);
  }

  //get requested quotation list
  LoadRequestedQuotationList() {
    this.InventoryBLService.GetRequestedQuotationList()
      .subscribe(res => this.CallBackGetQList(res));
  }

  CallBackGetQList(res) {
    if (res.Status == 'OK') {
      this.ReqItemList = [];
      if (res && res.Results) {
        this.ReqItemList = res.Results;
      }
    }
    else {
      err => {
        this.messageBoxService.showMessage("failed", ['failed to get Item.. please check log for details.']);
        this.logError(err.ErrorMessage);
      }
    }
  }
  logError(err: any) {
    console.log(err);
  }



  //getting quotation details
  GetQuotationDetails(ReqForQuotationId) {
    this.reqForQuotationId = ReqForQuotationId;
    if (ReqForQuotationId != null && ReqForQuotationId != 0) {
      this.InventoryBLService.GetQuotationDetails(ReqForQuotationId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.vendorList.length) {
              this.showQuotationDetails = true;
              this.QuotItemList = [];
              this.TotalAmount = [];
              this.QuotItemList = res.Results.ItemList;
              this.VendorList = res.Results.vendorList;
              this.vendors = this.VendorList.length;
              this.TotalAmount = res.Results.TotalAmount;
            } else {
              this.messageBoxService.showMessage("", ['Vendors are not available']);
              this.showQuotationDetails = false;
            }
          }
          else {
            this.showQuotationDetails = false;
            this.messageBoxService.showMessage("failed", ['failed to get quotation order.. please check log for details.']);
            console.log(res.ErrorMessage);
          }
        });
    }
    else {
      this.showQuotationDetails = false;
    }
  }
  //select vendor for request
  public ToggleItemSelection(index: number) {
    try {
      if (this.VendorList[index].IsSelected) {
        let selectedCount = this.VendorList.filter(s => s.IsSelected == true).length;
        if (selectedCount != 1) {
          this.loading = true;
          this.messageBoxService.showMessage("notice", ['Select only one Vendor!']);
        }
        else {
          this.loading = false;
          let selectedVendor = this.VendorList.filter(a => a.IsSelected == true);
        }
      } else {
        let selectedCount = this.VendorList.filter(s => s.IsSelected == true).length;
        if (selectedCount == 1) {
          this.loading = false;
        }
        else this.loading = true;
      }
    } catch (ex) {
      //this.ShowCatchErrMessage(ex);
    }
  }
  SaveSelectedVender() {
    let check = confirm("Are you sure to select this Vendor?");
    if (check) {
      this.selectedVendor = new QuotationModel();
      let selven = this.VendorList.find(a => a.IsSelected == true).VendorId;
      this.reqForQuotationId = this.VendorList.find(a => a.IsSelected == true).ReqForQuotationId;
      this.selectedVendor.ReqForQuotationId = this.reqForQuotationId;
      this.selectedVendor.VendorId = selven;

      this.InventoryBLService.UpdateVendorForPO(this.selectedVendor).
        subscribe(res => {
          if (res.Status == "OK") {
            this.loading = true;
            this.messageBoxService.showMessage('success', ['Vendor Selected Successfully']);
            this.selectedVendor = new QuotationModel();
            this.showQuotationDetails = false;
            this.ReqItemList = [];
            this.LoadRequestedQuotationList();
          }
          else {
            this.loading = false;
            err => {
              this.messageBoxService.showMessage("failed", ["please check log for details."]);
              this.logError(err.ErrorMessage);
            }
          }
        });
    }
  }

  public BackToReqForQuotation() {
    this.router.navigate(['/Inventory/ProcurementMain/RequestForQuotation']);
  }
}



