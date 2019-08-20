import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
@Injectable()
export class DLService {
    public http: HttpClient;
public options =  {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(_http: HttpClient) {
        this.http = _http;
    }
    public Read(url: string) {
        return this.http.get<any>(url, this.options);
    }
    public Add(data: string, url: string) {
        return this.http.post<any>(url, data, this.options);
    }
    public Update(data: string, url: string) {
        return this.http.put<any>(url, data, this.options);
    }
    public ReadExcel(url: string) {
      return this.http.get(url, { responseType: 'blob' }) // responseType: ResponseContentType.Blob
    }
}
