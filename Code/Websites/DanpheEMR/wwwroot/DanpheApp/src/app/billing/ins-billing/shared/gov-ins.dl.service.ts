import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class GovInsuranceDLService {
  public options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })  };
  constructor(public http: HttpClient) {

  }

  //Getting Patient List excluding insurance patient..
  public GetAllPatientsForInsurance(searchText: string) {
    return this.http.get<any>("/api/BillInsurance?reqType=all-patients-for-insurance&searchText=" + searchText, this.options);
  }

  //public GetPatientByKey(key:string) {
  //  return this.http.get<any>("/api/Patient?reqType=patient-search-by-text&search="+key, this.options);
  //}
   
}








