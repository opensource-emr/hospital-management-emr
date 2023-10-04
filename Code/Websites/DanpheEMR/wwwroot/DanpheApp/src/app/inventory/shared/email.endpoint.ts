import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as _ from 'lodash';

@Injectable()
export class EmailEndPoint {
    public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
  
    constructor(public http: HttpClient) {

    }

    // POST: sendiind new email
    public SendEmail(content: string) {

        return this.http.post<any>("/api/InventoryEmail", content, this.options);
    }
    
}