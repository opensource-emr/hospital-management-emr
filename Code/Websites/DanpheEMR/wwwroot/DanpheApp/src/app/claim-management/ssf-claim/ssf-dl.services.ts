import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from } from "rxjs";
import { mergeMap } from "rxjs/operators";

@Injectable()
export class SsfDlService {

  constructor(private _httpClient: HttpClient) {
  }

  public GetPharmacyInvoices(PharmacyInvoiceIds: number[]) {
    return from(PharmacyInvoiceIds).pipe(
      mergeMap(id => this._httpClient.get(`/api/Pharmacy/GetInvoiceReceiptByInvoiceId/${id}`))
    );
  }
}
