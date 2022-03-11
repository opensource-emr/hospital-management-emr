import { Component, OnInit, OnDestroy } from "@angular/core";
import { InventoryService } from "../../shared/inventory.service";
import { InventoryBLService } from "../../shared/inventory.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from "../../../core/shared/core.service";
import { Router } from "@angular/router";
import { RouteFromService } from "../../../shared/routefrom.service";
import { PurchaseRequestVM } from "../../../procurement/purchase-request/purchase-request-view/purchase-request-view.component";


@Component({
  selector: 'app-internalmain-purchase-request-detail',
  templateUrl: './internalmain-purchase-request-detail.component.html',
  styles: []
})
export class InternalmainPurchaseRequestDetailComponent implements OnInit, OnDestroy {


  public headerDetail: { header1, header2, header3, header4, hospitalName; address; email; PANno; tel; DDA };
  public PurchaseRequestVM: PurchaseRequestVM = new PurchaseRequestVM();
  public isModificationApplicable: boolean = false;
  public printDetaiils: HTMLElement;
  public showPrint: boolean;
  CancelRemarksVar: any;

  constructor(public inventoryService: InventoryService,
    public inventoryBLService: InventoryBLService, public coreService: CoreService,
    public router: Router, public routeFromService: RouteFromService,
    public messageBoxService: MessageboxService) {
    this.GetInventoryBillingHeaderParameter();
  }
  ngOnDestroy(): void {
    this.routeFromService.RouteFrom = "";
  }
  ngOnInit(): void {
    this.LoadPurchaseRequest();
  }
  GetInventoryBillingHeaderParameter() {
    var paramValue = this.coreService.Parameters.find(
      a => a.ParameterName == "Inventory Receipt Header"
    ).ParameterValue;
    if (paramValue) this.headerDetail = JSON.parse(paramValue);
    else
      this.messageBoxService.showMessage("error", [
        "Please enter parameter values for BillingHeader"
      ]);
  }

  LoadPurchaseRequest() {
    if (this.inventoryService.PurchaseRequestId > 0) {
      var PRId = this.inventoryService.PurchaseRequestId;
      this.inventoryBLService.GetPurchaseRequestById(PRId)
        .subscribe(res => {
          if (res.Status == "OK") {
            this.PurchaseRequestVM = res.Results;
            document.getElementById("printBtn").focus();
            this.CheckForActionsAvailable();
          }
          else {
            this.messageBoxService.showMessage("Failed", ["Cannot show the view"]);
          }
        })
    }
  }
  private CheckForActionsAvailable() {
    if (this.PurchaseRequestVM.PurchaseRequest.IsPOCreated == true || this.PurchaseRequestVM.PurchaseRequest.RequestStatus == 'withdrawn') {
      this.isModificationApplicable = false;
    }
    else {
      if (this.PurchaseRequestVM.PurchaseRequest.MaxVerificationLevel == 0) {
        this.isModificationApplicable = true;
      }
      else {
        //conditions when verification exists.
        // if verification has been done once, disable modification.
        if (this.PurchaseRequestVM.PurchaseRequest.CurrentVerificationLevelCount == 0) {
          this.isModificationApplicable = true;
        }
      }
    }
  }

  EditRequest() {
    this.inventoryService.PurchaseRequestId = this.PurchaseRequestVM.PurchaseRequest.PurchaseRequestId;
    this.router.navigate(["/Inventory/InternalMain/PurchaseRequest/PurchaseRequestAdd"])
  }
  WithdrawPurchaseRequest() {
    this.CancelRemarksVar=this.PurchaseRequestVM.PurchaseRequest.CancelRemarks;
    if(this.CancelRemarksVar.trim()== null){
      this.messageBoxService.showMessage("Failed", ["Remarks is required."]);
    }
    else{
      this.inventoryBLService.WithdrawPurchaseRequestById(this.PurchaseRequestVM.PurchaseRequest.PurchaseRequestId, this.PurchaseRequestVM.PurchaseRequest.CancelRemarks)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.messageBoxService.showMessage("Success", ["Purchase Request " + this.PurchaseRequestVM.PurchaseRequest.PRNumber + " is successfully withdrawn."]);
        }
        else {
          this.messageBoxService.showMessage("Failed", ["Something went wrong..."]);
          console.log(res.ErrorMessage);
        }
      });
    this.RouteBack();
    }
    
  }
  RouteBack() {
    this.router.navigate([this.routeFromService.RouteFrom]);
  }
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
}