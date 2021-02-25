import { HttpClient, HttpXhrBackend } from "@angular/common/http"
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { resolve, reject } from "q";
export enum MasterType {
  Country = "country",
  ICD = "icd",
  Employee = "employee",
  BillingCounter="BillingCounter",
  PhrmCounter="PhrmCounter",
  SubDivision="SubDivision",
  AllMasters="allMasters"    // including departments,taxes,servicesDepartments.

}
const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
@Injectable()
export class DanpheCache {
  private static Data: Array<object> = new Array<object>();
 
  static GetData(type: MasterType,id): any{
  
    if (DanpheCache.Data[type] == null) {
      switch (type) {
        case MasterType.Country: {                            //get country data from master api completed
           var country =this.getservice(type,null); 
           if(country !=undefined){
            return country;  
           }                  
        }
        break;        
        case MasterType.ICD: {                                //get icd data from master api completed
              var ICD=this.getservice(type,null);
              return ICD;
        }
        break; 
        case MasterType.Employee: {
              var Employee=this.getservice(type,null);        //get employee data from  api completed
        }
        break;
        case MasterType.BillingCounter: {
          var Employee=this.getservice(type,null);            //get counter data from billing api completed
          return Employee;
        }
        break;
        case MasterType.PhrmCounter: {
          var PhrmCounter=this.getservice(type,null);          //get counter data from phamracy api completed
          return PhrmCounter;
        }
        break;
        case MasterType.SubDivision: {
          var subdivisions=this.getservice(type,null);         //get subdivision data from settings api completed
          return subdivisions;
        }
        break;
        case MasterType.AllMasters: {
          var subdivisions=this.getservice(type,null);         //get data from master api like departments, taxes,serivce departmens.
          return subdivisions;
        }
        break;
      }

    }
    else{
      return DanpheCache.Data[type];
    }
  }

  static getservice(type,id){  
     this.GetApiData(type,id).subscribe(res=> {         
      this.Data[type]= res;
      return this.Data[type];
      });
  }

  static GetApiData(reqUrl,countryId) {    
    //const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
    let url;

    switch(reqUrl){
        case MasterType.Country:{
          url = '/api/Master?type=get-countries';                    
        }
        break;
        case MasterType.ICD:{
          url = '/api/Master?type=icdcode';                           
        }
        break;       
        case MasterType.Employee:{
          url = '/api/EmployeeSettings?reqType=get-employee';            
        }
        break;
        case MasterType.PhrmCounter:{
          url = '/api/pharmacy?reqType=getCounter';
        }
        break;
        case MasterType.BillingCounter:{
          url = '/api/billing?reqType=getCounter';
        }
        break;             
        case MasterType.SubDivision:{
          url = '/api/Settings?reqType=subdivisions';
        }
        break;        
        case MasterType.AllMasters:{
          url = '/api/Master?type=AllMasters';
        }
        break;

    }
 
   return httpClient.get<any>(url).pipe(map(response => {
          if (response.Status === 'OK') {  
            //console.log(response.Results);
            return response.Results;  }
        }));
  }
}


