import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TransferEndpointService } from './transfer-endpoint.service';
import { StockTransferModel } from './transfer.model';

@Injectable()
export class TransferService {
  constructor(public transferEndpoint: TransferEndpointService) { }
  GetAllStores() {
    return this.transferEndpoint.GetAllStores().map(res => res);
  }
  GetDispensariesStock(DispensaryId: number) {
    return this.transferEndpoint.GetDispensariesStock(DispensaryId).map(res => { return res; });
  }
  GetAllTransferRecordById(StoreId: number) {
    return this.transferEndpoint.GetAllTransferRecordById(StoreId).map(res => { return res; });
  }
  PostStockTransfer(stockTransfer: Array<StockTransferModel>) {
    try {
      let tempArray = [];
      stockTransfer.forEach(item => {
        let temp = _.omit(item, ['StockTransferValidator']);
        tempArray.push(temp);
      })
      return this.transferEndpoint.PostStockTransfer(tempArray)
        .map(res => { return res });
    }
    catch (ex) { throw ex; }
  }
}
