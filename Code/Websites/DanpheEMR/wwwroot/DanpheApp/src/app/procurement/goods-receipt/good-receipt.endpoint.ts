import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class GoodReceiptEndPoint {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
  
    constructor(public http: HttpClient) {

    }

    //GET: list of companies
    public GetGoodReceiptList() {
        return this.http.get<any>("/api/InventoryGoodReceipt", this.options);
    }

    // POST: add new company
    public AddGoodReceipt(CurrentReceipt) {
        let goodReceipt: any = _.omit(CurrentReceipt, ['GoodsReceiptValidator']);
        let goodReceiptItems = CurrentReceipt.GoodsReceiptItem.map(item => {
            return _.omit(item, ['GoodsReceiptItemValidator']);
        });

        goodReceipt.GoodsReceiptItem = goodReceiptItems;
        let data = JSON.stringify(goodReceipt);

        return this.http.post<any>("/api/InventoryGoodReceipt", data, this.options);
        
    }

    // PUT: update company
    public UpdateGoodReceipt( CurrentReceipt) {
      var temp = _.omit(CurrentReceipt, ['CompanyValidator', 'GoodsReceiptValidator','dateValidator']);
      let goodReceiptItems = CurrentReceipt.GoodsReceiptItem.map(item => {
        return _.omit(item, ['GoodsReceiptItemValidator']);
      });
      temp.GoodsReceiptItem = goodReceiptItems;
      let data = JSON.stringify(temp);
      return this.http.put<any>("/api/InventoryGoodReceipt", data, this.options);
    }

    // Get: Company By Id
    public GetGoodReceipt(id: number) {
        return this.http.get<any>("/api/InventoryGoodReceipt/" + id, this.options);
    }

    // Get: Vendor List for good receipt
    public GetVendorList() {
        return this.http.get<any>("/api/GetVendorList", this.options);
    }

    
}
