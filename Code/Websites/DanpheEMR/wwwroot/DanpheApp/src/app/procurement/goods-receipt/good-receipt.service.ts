import { Injectable } from '@angular/core';
import { GoodReceiptEndPoint } from './good-receipt.endpoint';
import { GoodsReceipt } from './goods-receipt.model';
import { Observable } from 'rxjs';

@Injectable()
export class GoodReceiptService {

    public _Id: number = null;

    get Id(): number {
        return this._Id;
    }
    set Id(Id: number) {
        this._Id = Id;
    }

    constructor(public goodReceiptEndPoint: GoodReceiptEndPoint) {

    }

    public GetGoodReceiptList() {
        return this.goodReceiptEndPoint.GetGoodReceiptList()
            .map(res => { return res });
    }

    public AddGoodReceipt(CurrentReceipt: GoodsReceipt) {
        return this.goodReceiptEndPoint.AddGoodReceipt(CurrentReceipt)
            .map(res => {
                return res;
            })
            .catch((e: any) => Observable.throw(this.errorHandler(e)));
    }

    public UpdateGoodReceipt(CurrentReceipt: GoodsReceipt) {
        return this.goodReceiptEndPoint.UpdateGoodReceipt(CurrentReceipt)
          .map(res => { return res });
    }

    public GetGoodReceipt(id: number) {
        return this.goodReceiptEndPoint.GetGoodReceipt(id)
            .map(res => { return res });
    }

    public GetVendorList() {
        return this.goodReceiptEndPoint.GetVendorList()
            .map(res => { return res })
            .catch((e: any) => Observable.throw(this.errorHandler(e)));
    }

    errorHandler(error: any): void {
        console.log(error)
    }

    globalInvGoodReceipt: GoodsReceipt = new GoodsReceipt();
    public GetGlobalInvReceipt(): GoodsReceipt {
        return this.globalInvGoodReceipt;
    }

}
