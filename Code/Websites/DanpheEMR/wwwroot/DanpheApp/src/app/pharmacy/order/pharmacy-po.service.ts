import { Injectable } from '@angular/core';
import { PharmacyPOEndpoint } from './pharmacy-po.endpoint';

@Injectable()
export class PharmacyPOService {
  _PurchaseOrderId: number;

  constructor(public pharmacyPOEndpoint: PharmacyPOEndpoint) { }
  get PurchaseOrderId(): number {
    return this._PurchaseOrderId;
  }
  set PurchaseOrderId(PurchaseOrderId: number) {
    this._PurchaseOrderId = PurchaseOrderId;
  }

  GetItemsForPO() {
    return this.pharmacyPOEndpoint.GetItemsForPO().map(res => res);;
  }

}
