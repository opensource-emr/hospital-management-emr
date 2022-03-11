import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { QuotationModel } from '../quotation.model';
import { RequestForQuotationModel } from '../request-for-quotaion.model';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { QuotationBLService } from '../quotation.bl.service';
import { CoreService } from '../../../core/shared/core.service';
import { QuotationAnalysisNpComponent } from './quotation-analysis-np.component';

@Component({
  selector: 'app-quotation-analysis',
  templateUrl: './quotation-analysis.component.html',
  styles: []
})
export class QuotationAnalysisComponent implements OnInit {
  @ViewChild('NepaliQuotationAnalysis') quotationAnalysisNpComponent: QuotationAnalysisNpComponent;
  public ReqItemList: any = [];
  public QuotItemList: any = [];
  public VendorList: any = [];
  public TotalAmount: any = [];
  public requisition: RequestForQuotationModel = new RequestForQuotationModel();
  public showQuotationDetails: boolean = false;
  public vendors: number = 0;
  public loading: boolean = false;
  public reqForQuotationId: number = 0;
  public selectedVendor: QuotationModel = new QuotationModel();
  public selectedVendorDetails: QuotationModel = new QuotationModel();
  public showInNepali: boolean = false;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;
  activeFiscalYear: string = '';
  issuedDate: string = '';
  constructor(public coreservice: CoreService, public QuotationBLService: QuotationBLService, public messageBoxService: MessageboxService, public inventoryService: InventoryService, public router: Router) {
    let ReqForQuotationId = this.inventoryService.ReqForQuotationId;
    this.GetQuotationDetails(ReqForQuotationId);
  }
  ngOnInit() {
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showInNepali = (receipt == "true");
  }


  //get requested quotation list
  LoadRequestedQuotationList() {
    this.loading = true;
    this.QuotationBLService.GetRequestedQuotationList().finally(() => this.loading = false)
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
    this.loading = true;
    this.reqForQuotationId = ReqForQuotationId;
    if (ReqForQuotationId != null && ReqForQuotationId != 0) {
      this.QuotationBLService.GetQuotationDetails(ReqForQuotationId).finally(() => this.loading = false)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.vendorList.length) {
              this.QuotItemList = [];
              this.TotalAmount = [];
              this.activeFiscalYear = res.Results.activeFiscalYear;
              this.QuotItemList = res.Results.ItemList;
              this.VendorList = res.Results.vendorList;
              this.vendors = this.VendorList.length;
              this.TotalAmount = res.Results.TotalAmount;
              this.showQuotationDetails = true;
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
        this.selectedVendor = this.VendorList[index];
        let selectedCount = this.VendorList.filter(s => s.IsSelected == true).length;
        if (selectedCount != 1) {
          this.loading = true;
          this.messageBoxService.showMessage("notice", ['Select only one Vendor!']);
        }
        else {
          this.loading = false;
          let selectedVendor = this.VendorList.filter(a => a.IsSelected == true);
        }
      } 
      else {
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
  selectedVendorEventHandler($event) {
    this.selectedVendor.VendorId = $event.selectedVendor ? $event.selectedVendor.VendorId : null;
    this.selectedVendor.VendorName = $event.selectedVendor ? $event.selectedVendor.VendorName : null;
    this.issuedDate = $event.issuedDate;
  }
  selectedDateEventHandler($event) {
    this.issuedDate = $event.issuedDate;
  }

  SaveSelectedVendor() {
    this.selectedVendorDetails.ReqForQuotationId = this.reqForQuotationId;
    this.selectedVendorDetails.VendorId = this.selectedVendor.VendorId;
    this.selectedVendorDetails.IssuedDate = this.issuedDate;

    this.QuotationBLService.UpdateVendorForPO(this.selectedVendorDetails).
      subscribe(res => {
        if (res.Status == "OK") {
          this.loading = true;
          this.router.navigate(['/ProcurementMain/Quotation/RequestForQuotationList']);
          this.messageBoxService.showMessage('success', ['Vendor Selected Successfully']);
          this.selectedVendorDetails = new QuotationModel();
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

  public BackToReqForQuotation() {
    this.router.navigate(['/ProcurementMain/Quotation/RequestForQuotationList']);
  }
  // Print Funcitions
  print() {
    this.printDetaiils = document.getElementById("print-page");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }

}
