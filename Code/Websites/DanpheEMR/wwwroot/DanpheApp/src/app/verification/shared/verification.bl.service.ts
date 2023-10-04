import { Injectable } from "@angular/core";
import * as _ from 'lodash';
import { GoodsReceipt } from "../../inventory/shared/goods-receipt.model";
import { PurchaseOrder } from "../../inventory/shared/purchase-order.model";
import { PurchaseRequestModel } from "../../inventory/shared/purchase-request.model";
import { Requisition } from "../../inventory/shared/requisition.model";
import { PharmacyPurchaseOrder_DTO } from "../pharmacy/shared/pharmacy-purchase-order.dto";
import { PharmacySubStoreRequisitionVerification_DTO } from "../pharmacy/shared/pharmacy-substore-requisition-verification.dto";
import { VerificationDLService } from "./verification.dl.service";

@Injectable()
export class VerificationBLService {
  constructor(public verificationDLService: VerificationDLService) { }
  //#region : Inventory Requisition Verification Http Requests
  GetInventoryRequisitionListBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetInventoryRequisitionListBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  GetInventoryRequisitionDetails(RequisitionId) {
    try {
      return this.verificationDLService.GetInventoryRequisitionDetails(RequisitionId)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  ApproveRequisition(Requisition: Requisition, VerificationRemarks: string) {
    try {
      //omiting the validators during post because it causes cyclic error during serialization in server side.
      //omit validator from inputPO (this will give us object)
      let newreq: any = _.omit(Requisition, ['RequisitionValidator']);
      let newreqItems = Requisition.RequisitionItems.map(item => {
        return _.omit(item, ['RequisitionItemValidator']);
      });

      newreq.RequisitionItems = newreqItems;

      let data = JSON.stringify(newreq);

      return this.verificationDLService.ApproveRequisition(data, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  RejectRequisition(RequisitionId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectRequisition(RequisitionId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  //#endregion
  //#region : Inventory Purchase Requests Http Requests
  GetInventoryPurchaseRequestsBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetInventoryPurchaseRequestsBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  GetInventoryPurchaseRequestDetails(PurchaseRequ) {
    try {
      return this.verificationDLService.GetInventoryPurchaseRequestDetails(PurchaseRequ)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  ApprovePurchaseRequest(PurchaseRequest: PurchaseRequestModel, VerificationRemarks: string) {
    try {
      //omiting the validators during post because it causes cyclic error during serialization in server side.
      //omit validator from inputPO (this will give us object)
      let newreq: any = _.omit(PurchaseRequest, ['PurchaseRequestValidator']);
      let newreqItems = PurchaseRequest.PurchaseRequestItems.map(item => {
        return _.omit(item, ['PurchaseRequestItemValidator']);
      });

      newreq.RequisitionItems = newreqItems;

      let data = JSON.stringify(newreq);

      return this.verificationDLService.ApprovePurchaseRequest(data, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  RejectPurchaseRequest(PurchaseRequestId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectPurchaseRequest(PurchaseRequestId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  //#endregion

  //#region : Inventory Purchase Order Http Requests
  GetInventoryPurchaseOrdersBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetInventoryPurchaseOrdersBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  GetInventoryPurchaseOrderDetails(PurchaseRequest) {
    try {
      return this.verificationDLService.GetInventoryPurchaseOrderDetails(PurchaseRequest)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  ApprovePurchaseOrder(PurchaseOrder: PurchaseOrder, VerificationRemarks: string) {
    try {
      //omiting the validators during post because it causes cyclic error during serialization in server side.
      //omit validator from inputPO (this will give us object)
      let newreq: any = _.omit(PurchaseOrder, ['PurchaseOrderValidator']);
      let newreqItems = PurchaseOrder.PurchaseOrderItems.map(item => {
        return _.omit(item, ['PurchaseOrderItemValidator']);
      });

      newreq.RequisitionItems = newreqItems;

      let data = JSON.stringify(newreq);

      return this.verificationDLService.ApprovePurchaseOrder(data, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  RejectPurchaseOrder(PurchaseOrderId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectPurchaseOrder(PurchaseOrderId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  //#endregion


  //#region : Inventory GR Http Requests
  GetInventoryGRBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetInventoryGRBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  GetInventoryGRDetails(GoodsReceipt) {
    try {
      return this.verificationDLService.GetInventoryGRDetails(GoodsReceipt)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  ApproveGR(GoodsReceipt: GoodsReceipt, VerificationRemarks: string) {
    try {
      //omiting the validators during post because it causes cyclic error during serialization in server side.
      //omit validator from inputPO (this will give us object)
      let newGR: any = _.omit(GoodsReceipt, ['GoodsReceiptValidator']);
      let newGRItems = GoodsReceipt.GoodsReceiptItem.map(item => {
        return _.omit(item, ['GoodsReceiptItemValidator']);
      });

      newGR.GoodsReceiptItem = newGRItems;

      let data = JSON.stringify(newGR);

      return this.verificationDLService.ApproveGR(data, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  RejectGR(GoodsReceiptId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectGR(GoodsReceiptId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  //#endregion


  GetPharmacyPurchaseOrdersBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetPharmacyPurchaseOrdersBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }


  GetPharmacyPurchaseOrderInfo(PurchaseOrderId: number) {
    return this.verificationDLService.GetPharmacyPurchaseOrderInfo(PurchaseOrderId).map(res => { return res });
  }

  ApprovePharmacyPurchaseOrder(purchaseOrderDTO: PharmacyPurchaseOrder_DTO) {
    try {
      return this.verificationDLService.ApprovePharmacyPurchaseOrder(purchaseOrderDTO).map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  ApprovePharmacyRequisition(requisitionDTO: PharmacySubStoreRequisitionVerification_DTO) {
    try {
      return this.verificationDLService.ApprovePharmacyRequisition(requisitionDTO).map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  RejectPharmacyPurchaseOrder(PurchaseOrderId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectPharmacyPurchaseOrder(PurchaseOrderId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks).map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  GetPharmacyRequisitionsBasedOnUser(fromDate, toDate) {
    try {
      return this.verificationDLService.GetPharmacyRequisitionsBasedOnUser(fromDate, toDate)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }

  GetPharmacyRequisitionInfo(RequisitionId) {
    try {
      return this.verificationDLService.GetPharmacyRequisitionInfo(RequisitionId)
        .map(res => {
          return res;
        });
    } catch (ex) {
      throw ex;
    }
  }
  RejectPharmacyRequisition(RequisitionId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    try {
      return this.verificationDLService.RejectPharmacyRequisition(RequisitionId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks).map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
}