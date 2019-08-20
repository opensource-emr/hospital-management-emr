import { Injectable, Directive } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';
@Injectable()
export class HelpDeskDLService {
   public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })}; 
	constructor(public http: HttpClient) { }

    //get Bedinfo using status.
    public GetBedinfo(status: string) {
        return this.http.get<any>("/api/Helpdesk?&reqType=getBedinfo"
            + "&status=" + status, this.options);
    }
    //get Employeeinfo using status.
    public GetEmployeeinfo(status: string) {
        return this.http.get<any>("/api/Helpdesk?&reqType=getHelpdesk"
            + "&status=" + status, this.options);
    }
    //get Wardinfo using status.
    public GetWardinfo(status: string) {
        return this.http.get<any>("/api/Helpdesk?&reqType=getWardinfo"
            + "&status=" + status, this.options);
    }
}
