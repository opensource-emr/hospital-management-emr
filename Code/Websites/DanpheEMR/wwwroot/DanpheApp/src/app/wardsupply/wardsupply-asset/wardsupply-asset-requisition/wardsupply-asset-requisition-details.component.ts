import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { RequisitionItems } from "../../../inventory/shared/requisition-items.model";
import { Requisition } from "../../../inventory/shared/requisition.model"
import { InventoryBLService } from "../../../inventory/shared/inventory.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../../shared/routefrom.service";
import { InventoryService } from '../../../inventory/shared/inventory.service';
import { CoreService } from "../../../core/shared/core.service"
import * as moment from 'moment/moment';
import { SecurityService } from '../../../security/shared/security.service';
import { DispatchVerificationActor } from '../../../inventory/shared/track-requisition-vm.model';
import { VerificationActor } from '../../../verification/inventory/requisition-details/inventory-requisition-details.component';
import { WardSupplyAssetRequisitionItemsModel } from '../../shared/wardsupply-asset-requisitionItems.model';
import { WardSupplyBLService } from '../../shared/wardsupply.bl.service';
import { wardsupplyService } from '../../shared/wardsupply.service';
@Component({
  selector: 'wardsupply-asset-requisition-details',
  templateUrl: "./wardsupply-asset-requisition-details.component.html"
})
export class WardSupplyAssetRequisitionDetailsComponent implements OnInit {
  public CurrentStoreId: number = 0;
  public requisitionItemsDetails: Array<WardSupplyAssetRequisitionItemsModel> = new Array<WardSupplyAssetRequisitionItemsModel>();
  public departmentName: string = "";
  public requisitionId: number = 0;
  public requisitionNo: number = 0;
  public issueNo: number = null;
  public requisitionDate: string = null;
  public ShowOutput: number = 0;
  //public header: any = null;
  public createdby: string = "";
  public dispatchers: DispatchVerificationActor[] = []; //this can come as empty array
  public verifiers: VerificationActor[] = null; // by default, this wil be null
  public receivedby: string = "";
  public requisition: Requisition = new Requisition();
  public showCancelRequisitonPopUp: boolean = false;
  public IsCancel: boolean = false;
  public isModificationAllowed: boolean = true;
  public mainRemarks: string;
  public showNepaliReceipt: boolean;
  printDetaiils: HTMLElement;
  showPrint: boolean;
  constructor(public securityService: SecurityService,
    public InventoryBLService: InventoryBLService,
    public inventoryService: InventoryService,
    public messageBoxService: MessageboxService,
    public router: Router,
    public msgBoxServ: MessageboxService,
    public routeFrom: RouteFromService,
    public coreservice: CoreService,
    public wardSupplyBLService: WardSupplyBLService,
    public wardSupplyService: wardsupplyService) {

  }

  ngOnInit() {
    //check for english or nepali receipt style
    let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
    this.showNepaliReceipt = (receipt == "true");
    this.requisitionId = this.wardSupplyService.RequisitionId;
    if (this.showNepaliReceipt == false) {
      this.LoadRequisitionDetails(this.wardSupplyService.RequisitionId);
    }
  }
  LoadRequisitionDetails(RequisitionId: number) {
    if (RequisitionId != null) {
      this.requisitionId = RequisitionId;
      // this.CheckIfModificationApplicable();    
      this.wardSupplyBLService.GetSubstoreAssetRequistionItemsById(this.requisitionId)
        .subscribe(res => this.ShowRequisitionDetails(res));
    }
    else {
      this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
      // this.router.navigate(['/Inventory/InternalMain/RequisitionList']);
      this.requisitionList();
    }
  }


  ShowRequisitionDetails(res) {
    if (res.Status == "OK") {
      this.requisitionItemsDetails = res.Results;
      this.dispatchers = res.Results.Dispatchers;
      this.verifiers = res.Results.Verifiers;
      if (this.requisitionItemsDetails.length > 0) {
        this.requisitionItemsDetails.forEach(itm => {
          itm.CreatedOn = moment(itm.CreatedOn).format('YYYY-MM-DD');
        });
        this.requisitionDate = this.requisitionItemsDetails[0].CreatedOn;
        this.requisitionNo = this.requisitionItemsDetails[0].RequisitionNo;
        this.issueNo = this.requisitionItemsDetails[0].IssueNo;
        this.createdby = this.requisitionItemsDetails[0].CreatedByName;
        this.receivedby = this.requisitionItemsDetails[0].ReceivedBy;
        this.mainRemarks = this.requisitionItemsDetails[0].Remarks;
        var status = this.requisitionItemsDetails.find(a => a.RequisitionId == this.requisitionId);
        var updatedstatus = this.requisitionItemsDetails[0].RequisitionItemStatus;

      }
      else {
        this.messageBoxService.showMessage("notice-message", ["Selected Requisition is without Items"]);
        this.requisitionList();
      }


    }
    else {
      this.messageBoxService.showMessage("notice-message", ["There is no Requisition details !"]);
      this.requisitionList();

    }
  }

  //this is used to print the receipt
  print() {
    this.printDetaiils = document.getElementById("printpage");
    this.showPrint = true;
  }
  callBackPrint() {
    this.printDetaiils = null;
    this.showPrint = false;
  }
  @Output("callback-details")
  callbackDetails: EventEmitter<Object> = new EventEmitter<Object>();

  requisitionList() {
    this.requisitionId = 0;
    this.wardSupplyService.RequisitionId = 0;
    this.router.navigate(['/WardSupply/FixedAsset/Requisition/List'])
  }
}
