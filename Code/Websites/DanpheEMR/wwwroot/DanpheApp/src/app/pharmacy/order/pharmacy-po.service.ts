import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { PHRMPurchaseOrder } from '../shared/phrm-purchase-order.model';
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
  findPurchaseOrder(POId: number) {
    return this.pharmacyPOEndpoint.findPurchaseOrder(POId).map(res => res);;
  }
  UpdatePurchaseOrder(currentPO: PHRMPurchaseOrder) {
    let newPO: any = _.omit(currentPO, ['PurchaseOrderValidator']);
    let newPoItems = currentPO.PHRMPurchaseOrderItems.map(item => {
      return _.omit(item, ['PurchaseOrderItemValidator','PHRMItemMaster']);
    });
    newPO.PHRMPurchaseOrderItems = newPoItems;
    let data = JSON.stringify(newPO);
    return this.pharmacyPOEndpoint.UpdatePurchaseOrder(data).map(res => { return res});;
  }
}
