import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SupplierLedgerService {
    private baseUrl: string;
    option = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
    optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    constructor(
        private http: HttpClient,) {
        this.baseUrl = '/api/phrmsupplierledger';
    }
    getAllSuppliersLedgerTxn() {
        return this.http.get<any>(this.baseUrl);
    }
    findSupplierGRDetails(supplierId): Observable<any> {
        return this.http.get(`${this.baseUrl}/findSupplierGRDetails?supplierId=${supplierId}`);
    }
    // makeSupplierLedgerPayment(ledgerTxn:any[], paidAmount: number): Observable<any> {
    //     return this.http.put<any>(`${this.baseUrl}/makeSupplierLedgerPayment?value=${ledgerTxn}&paidAmount=${paidAmount}`, this.option);
    // }
    makeSupplierLedgerPayment(ledgerTxn: any[]): Observable<any> {
        return this.http.put<any>(this.baseUrl, ledgerTxn, this.optionJson);
    }
}