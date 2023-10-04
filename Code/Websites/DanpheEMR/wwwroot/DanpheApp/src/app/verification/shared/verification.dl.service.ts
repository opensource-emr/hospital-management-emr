import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PharmacyPurchaseOrder_DTO } from "../pharmacy/shared/pharmacy-purchase-order.dto";
import { PharmacySubStoreRequisitionVerification_DTO } from "../pharmacy/shared/pharmacy-substore-requisition-verification.dto";

@Injectable()
export class VerificationDLService {
  public options = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };
  constructor(public http: HttpClient) { }

  GetInventoryRequisitionListBasedOnUser(fromDate, toDate) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryRequisitionListBasedOnUser/" + fromDate + "/" + toDate,
      this.options
    );
  }

  GetInventoryRequisitionDetails(RequisitionId) {
    return this.http.get(`/api/Verification/GetInventoryRequisitionDetails?requisitionId=${RequisitionId}`, this.options);
  }

  ApproveRequisition(Requisition, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/ApproveRequisition/" + VerificationRemarks, Requisition,
      this.options
    );
  }

  RejectRequisition(RequisitionId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/RejectRequisition/" + RequisitionId + "/" + CurrentVerificationLevel + "/" + CurrentVerificationLevelCount + "/" + MaxVerificationLevel, VerificationRemarks,
      this.options
    );
  }
  //#region : Inventory Purchase Orders Http Orders
  GetInventoryPurchaseRequestsBasedOnUser(fromDate, toDate) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryPurchaseRequestsBasedOnUser/" + fromDate + "/" + toDate,
      this.options
    );
  }

  GetInventoryPurchaseRequestDetails(PurchaseRequestId) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryPurchaseRequestDetails/" + PurchaseRequestId,
      this.options
    );
  }

  ApprovePurchaseRequest(PurchaseRequest, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/ApprovePurchaseRequest/" + VerificationRemarks, PurchaseRequest,
      this.options
    );
  }

  RejectPurchaseRequest(PurchaseRequestId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/RejectPurchaseRequest/" + PurchaseRequestId + "/" + CurrentVerificationLevel + "/" + CurrentVerificationLevelCount + "/" + MaxVerificationLevel, VerificationRemarks,
      this.options
    );
  }
  //#endregion
  //#region : Inventory Purchase Orders Http Order
  GetInventoryPurchaseOrdersBasedOnUser(fromDate, toDate) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryPurchaseOrdersBasedOnUser/" + fromDate + "/" + toDate,
      this.options
    );
  }

  GetInventoryPurchaseOrderDetails(PurchaseOrderId) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryPurchaseOrderDetails/" + PurchaseOrderId,
      this.options
    );
  }

  ApprovePurchaseOrder(PurchaseOrder, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/ApprovePurchaseOrder/" + VerificationRemarks, PurchaseOrder,
      this.options
    );
  }

  RejectPurchaseOrder(PurchaseOrderId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/RejectPurchaseOrder/" + PurchaseOrderId + "/" + CurrentVerificationLevel + "/" + CurrentVerificationLevelCount + "/" + MaxVerificationLevel, VerificationRemarks,
      this.options
    );
  }
  //#endregion
  //#region : Inventory Purchase Orders Http Order
  GetInventoryGRBasedOnUser(fromDate, toDate) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryGRBasedOnUser/" + fromDate + "/" + toDate,
      this.options
    );
  }

  GetInventoryGRDetails(GoodsReceiptId) {
    return this.http.get<any>(
      "/api/Verification/GetInventoryGRDetails/" + GoodsReceiptId,
      this.options
    );
  }

  ApproveGR(GoodsReceipt, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/ApproveGoodsReceipt/" + VerificationRemarks, GoodsReceipt,
      this.options
    );
  }

  RejectGR(GoodsReceiptId, CurrentVerificationLevel, CurrentVerificationLevelCount, MaxVerificationLevel, VerificationRemarks) {
    return this.http.post<any>(
      "/api/Verification/RejectGoodsReceipt/" + GoodsReceiptId + "/" + CurrentVerificationLevel + "/" + CurrentVerificationLevelCount + "/" + MaxVerificationLevel, VerificationRemarks,
      this.options
    );
  }
  //#endregion

  GetPharmacyPurchaseOrdersBasedOnUser(fromDate, toDate) {
    return this.http.get(`/api/Verification/PharmacyPurchaseOrdersBasedOnUser?fromDate=${fromDate}&toDate=${toDate}`, this.options);
  }

  GetPharmacyPurchaseOrderInfo(PurchaseOrderId) {
    return this.http.get(`/api/Verification/PharmacyPurchaseOrderInfo?purchaseOrderId=${PurchaseOrderId}`, this.options);
  }

  ApprovePharmacyPurchaseOrder(purchaseOrderDTO: PharmacyPurchaseOrder_DTO) {
    return this.http.post(`/api/Verification/ApprovePharmacyPurchaseOrder`, purchaseOrderDTO, this.options);
  }

  RejectPharmacyPurchaseOrder(PurchaseOrderId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    return this.http.post(`/api/Verification/RejectPharmacyPurchaseOrder?purchaseOrderId=${PurchaseOrderId}&currentVerificationLevel=${CurrentVerificationLevel}&currentVerificationLevelCount=${CurrentVerificationLevelCount}&maxVerificationLevel=${MaxVerificationLevel}&verificationRemarks=${VerificationRemarks}`, this.options)
  }

  GetPharmacyRequisitionsBasedOnUser(fromDate, toDate) {
    return this.http.get(`/api/Verification/PharmacyRequisitionsBasedOnUser?fromDate=${fromDate}&toDate=${toDate}`, this.options);
  }

  GetPharmacyRequisitionInfo(RequisitionId) {
    return this.http.get(`/api/Verification/PharmacyRequisitionInfo?requisitionId=${RequisitionId}`, this.options);
  }

  ApprovePharmacyRequisition(requisitionDTO: PharmacySubStoreRequisitionVerification_DTO) {
    return this.http.post(`/api/Verification/ApprovePharmacyRequisition`, requisitionDTO, this.options);
  }

  RejectPharmacyRequisition(RequisitionId: number, CurrentVerificationLevel: number, CurrentVerificationLevelCount: number, MaxVerificationLevel: number, VerificationRemarks: string) {
    return this.http.post(`/api/Verification/RejectPharmacyRequisition?requisitionId=${RequisitionId}&currentVerificationLevel=${CurrentVerificationLevel}&currentVerificationLevelCount=${CurrentVerificationLevelCount}&maxVerificationLevel=${MaxVerificationLevel}&verificationRemarks=${VerificationRemarks}`, this.options)
  }
}
