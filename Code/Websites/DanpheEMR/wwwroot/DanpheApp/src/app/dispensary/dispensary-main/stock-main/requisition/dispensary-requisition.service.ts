import { Injectable } from '@angular/core';
import { PHRMStoreRequisition } from '../../../../pharmacy/shared/phrm-store-requisition.model';
import { DispensaryRequisitionEndpoint } from './dispensary-requisition-endpoint';
import * as _ from 'lodash';

@Injectable()
export class DispensaryRequisitionService {

  private _requisitionId: number;
  get RequisitionId(): number {
    return this._requisitionId;
  }
  set RequisitionId(reqId: number) {
    this._requisitionId = reqId;
  }
  constructor(public dispensaryRequisitionEndpoint: DispensaryRequisitionEndpoint) { }

  GetAllRequisitionList(fromDate: string, toDate: string) {
    return this.dispensaryRequisitionEndpoint.GetAllRequisitionList(fromDate, toDate).map(res => res);
  }
  GetAllRequisitionListByDispensaryId(dispensaryId: number, fromDate: string, toDate: string) {
    return this.dispensaryRequisitionEndpoint.GetAllRequisitionListByDispensaryId(dispensaryId, fromDate, toDate).map(res => res);
  }
  GetItemsForRequisition(isInsurance: boolean = false) {
    return this.dispensaryRequisitionEndpoint.GetItemsForRequisition(isInsurance)
      .map(res => { return res });
  }
  GetRequisitionView(requisitionId) {
    return this.dispensaryRequisitionEndpoint.GetRequisitionView(requisitionId).map(res => res);
  }
  GetDispatchListForItemReceive(requisitionId: number) {
    return this.dispensaryRequisitionEndpoint.GetDispatchListForItemReceive(requisitionId).map(res => res);
  }
  AddRequisition(requisition: PHRMStoreRequisition) {
    let newRequ: any = _.omit(requisition, ['RequisitionValidator']);

    let newRequItems = requisition.RequisitionItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });


    newRequ.RequisitionItems = newRequItems;
    let data = JSON.stringify(newRequ);
    return this.dispensaryRequisitionEndpoint.AddRequisition(data)
      .map(res => { return res })
  }

  ReceiveDispatchedItems(dispatchId: number, receivedRemarks: string) {
    let data = JSON.stringify(receivedRemarks);
    return this.dispensaryRequisitionEndpoint.ReceiveDispatchedItems(dispatchId, data)
      .map(res => { return res })
  }

  ApproveRequisition(requisitionId: number) {
    return this.dispensaryRequisitionEndpoint.ApproveRequisition(requisitionId).map(res => { return res })
  }
  CancelRequisitionItems(cancelRequisitionItemDto: any) {
    let data = JSON.stringify(cancelRequisitionItemDto)
    return this.dispensaryRequisitionEndpoint.CancelRequisitionItems(data).map(res => { return res })
  }
}
