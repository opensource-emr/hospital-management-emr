import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from "../../../core/shared/core.service";
import { DispensaryRequisitionService } from '../../../dispensary/dispensary-main/stock-main/requisition/dispensary-requisition.service';
import { SecurityService } from '../../../security/shared/security.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { RouteFromService } from "../../../shared/routefrom.service";
import { PharmacyBLService } from "../../shared/pharmacy.bl.service";
import { PharmacyService } from '../../shared/pharmacy.service';
import { GeneralFieldLabels } from '../../../shared/DTOs/general-field-label.dto';
@Component({
      templateUrl: "./phrm-store-requisition-details.component.html"
})
export class PHRMStoreRequisitionDetailsComponent implements OnInit {
      public requisitionId: number = 0;
      msgBoxServ: any;
      requisition: GetRequisitionViewDto = new GetRequisitionViewDto();
      public showCancelButton: boolean = false;
      public cancelRemarks: string = "";
      showPrint: boolean;
      printDetaiils: any;
      @Input("requisitionId") RequisitionId: number;
      public showNepaliReceipt: boolean;

      public GeneralFieldLabel = new GeneralFieldLabels();
      constructor(public changeDetector: ChangeDetectorRef,
            public PharmacyBLService: PharmacyBLService,
            public PharmacyService: PharmacyService,
            public dispensaryRequisitionService: DispensaryRequisitionService,
            public securityService: SecurityService,
            public messageBoxService: MessageboxService,
            public router: Router,
            public routeFrom: RouteFromService,
            public coreservice: CoreService) {
            this.GetPharmacyBillingHeaderParameter();
            this.LoadRequisitionDetails(this.PharmacyService.Id);
            this.GeneralFieldLabel = coreservice.GetFieldLabelParameter();
      }
      ngOnInit() {
            //check for english or nepali receipt style
            let receipt = this.coreservice.Parameters.find(lang => lang.ParameterName == 'NepaliReceipt' && lang.ParameterGroupName == 'Common').ParameterValue;
            this.showNepaliReceipt = (receipt == "true");
      }
      ngOnDestroy() {
            this.PharmacyService.Id = null;
      }
      ngAfterViewInit() {
            this.SetFocusOnButton("printButton");
      }
      SetFocusOnButton(idToSelect: string) {
            if (document.getElementById(idToSelect)) {
                  let btn = <HTMLInputElement>document.getElementById(idToSelect);
                  btn.focus();
            }
      }
      LoadRequisitionDetails(RequisitionId: number) {
            if (RequisitionId != null) {
                  this.requisitionId = RequisitionId;
                  this.dispensaryRequisitionService.GetRequisitionView(RequisitionId)
                        .subscribe(res => this.ShowRequisitionDetails(res));
            }
            else {
                  this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
                  this.routeToRequisitionList();
            }
      }

      ShowRequisitionDetails(res) {
            if (res.Status == "OK") {
                  this.requisition = res.Results.requisition;
            }
            else {
                  this.messageBoxService.showMessage("notice-message", ['Please, Select Requisition for Details.']);
                  this.routeToRequisitionList();
            }
      }

      //this is used to print the receipt
      print() {
            this.showPrint = false;
            this.printDetaiils = null;
            this.printDetaiils = document.getElementById("printpage");
            this.changeDetector.detectChanges();
            this.showPrint = true;
      }
      //route back
      routeToRequisitionList() {
            this.routeFrom.RouteFrom = "RequisitionDetails"
            // this.router.navigate(['/Pharmacy/Store/StoreRequisition']);
            this.router.navigate(['/Pharmacy/SubstoreRequestAndDispatch/Requisitions']);
      }

      public headerDetail: { hospitalName, address, email, PANno, tel, DDA };

      //Get Pharmacy Billing Header Parameter from Core Service (Database) assign to local variable
      GetPharmacyBillingHeaderParameter() {
            var paramValue = this.coreservice.Parameters.find(a => a.ParameterName == 'Pharmacy Receipt Header').ParameterValue;
            if (paramValue)
                  this.headerDetail = JSON.parse(paramValue);
            else
                  this.msgBoxServ.showMessage("error", ["Please enter parameter values for BillingHeader"]);
      }
      ShowCancelButtonOnCkboxChange() {
            this.showCancelButton = this.requisition.RequisitionItems.filter(a => a.IsSelected == true).length > 0;
      }
      CancelSelectedItems() {
            if (!this.cancelRemarks || this.cancelRemarks.trim() == '') {
                  this.messageBoxService.showMessage("failed", ["Remarks is Compulsory for cancelling items."]);
            }
            else {
                  let cancelledRequisitionItemIds: number[] = this.requisition.RequisitionItems.filter(a => a.IsSelected).map(s => s.RequisitionItemId);
                  let cancelRequisitionItemDto: CancellRequisitionDTO = new CancellRequisitionDTO(this.requisitionId, cancelledRequisitionItemIds, this.cancelRemarks);
                  this.dispensaryRequisitionService.CancelRequisitionItems(cancelRequisitionItemDto).
                        subscribe(res => {
                              if (res.Status == 'OK') {
                                    this.messageBoxService.showMessage("success", ["Requisition is Cancel and Saved"]);
                                    // this.router.navigate(['/Pharmacy/Store/StoreRequisition']);
                                    this.router.navigate(['/Pharmacy/SubstoreRequestAndDispatch/Requisitions']);
                              }
                              else {
                                    this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
                              }
                        },
                              err => {
                                    this.messageBoxService.showMessage("failed", ['failed to cancel items.. please check log for details.']);
                              });
            }
      }

}
export class GetRequisitionViewDto {
      RequisitionNo: number;
      RequisitionDate: string;
      RequisitionStatus: string;
      RequestedBy: string;
      DispatchedBy: string;
      ReceivedBy: string;
      RequestedStoreName: string;
      RequisitionItems: GetRequisitionItemViewDto[] = [];

}
export class GetRequisitionItemViewDto {
      RequisitionId: number;
      RequisitionItemId: number;
      ItemName: string;
      GenericName: string;
      RequestedQuantity: number;
      ReceivedQuantity: number;
      PendingQuantity: number;
      RequestedItemStatus: string;
      Remarks: string;
      //for cancel selected item
      IsSelected: boolean;
      //for Cancelled item and remarks
      public CancelQuantity: number = 0;
      public CancelledBy: number = null;
      public CancelledOn: string = "";
      public CancelRemarks: string = "";
      public DispatchedQuantity: number = 0;
}

export class CancellRequisitionDTO {
      RequisitionId: number;
      RequisitionItemIdList: number[] = [];
      CancelRemarks: string = "";
      constructor(requisitionId, requisitionItemIdList, cancelRemarks) {
            this.RequisitionId = requisitionId;
            this.RequisitionItemIdList = requisitionItemIdList;
            this.CancelRemarks = cancelRemarks;
      }
}