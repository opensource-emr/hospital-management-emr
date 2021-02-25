import { Injectable } from "@angular/core";
import { Requisition } from "../../inventory/shared/requisition.model";
import { PurchaseRequestModel } from "../../inventory/shared/purchase-request.model";
import { PurchaseOrder } from "../../inventory/shared/purchase-order.model";
import { GoodsReceipt } from "../../inventory/shared/goods-receipt.model";

@Injectable()
export class VerificationService {
  public Requisition : Requisition;
  public PurchaseRequest : PurchaseRequestModel;
  public PurchaseOrder: PurchaseOrder;
  public GoodsReceipt: GoodsReceipt;
  constructor() {}
}
