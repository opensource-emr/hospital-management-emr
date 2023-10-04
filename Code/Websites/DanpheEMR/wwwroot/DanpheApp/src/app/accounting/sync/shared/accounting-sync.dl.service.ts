import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class AccountingSyncDLService {
    public http: HttpClient;
    constructor(_http: HttpClient) {
        this.http = _http;
    }
    public Read(url: string) {
        return this.http.get<any>(url);
    }
    public Add(data: string, url: string) {
        this.http.post<any>(url, data);
    }
    public Update(data: string, url: string) {
        this.http.put<any>(url, data);
    }
    public ReadExcel(url:string) {
        return this.http.get<any>(url)
    }
}