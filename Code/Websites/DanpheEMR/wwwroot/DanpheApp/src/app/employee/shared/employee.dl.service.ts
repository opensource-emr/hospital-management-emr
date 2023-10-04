import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class EmployeeDLService {
    public http: HttpClient;
  public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(_http: HttpClient) {
        this.http = _http;
    }
    // getting the patient
    
    public PutNewPassword(currentPassModel) {
        let data = JSON.stringify(currentPassModel);
        return this.http.put<any>("/Account/ChangePassword", data, this.options);
    }
  
    
}
