import { HttpClient, HttpHeaders, HttpXhrBackend } from "@angular/common/http"
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { resolve, reject } from "q";
import { ENUM_LocalStorageKeys } from "../shared-enums";
export enum MasterType {
  Country = "country",
  ICD = "icd",
  Employee = "employee",
  BillingCounter="BillingCounter",
  PhrmCounter="PhrmCounter",
  SubDivision="SubDivision",
  AllMasters="allMasters",   // including departments,taxes,servicesDepartments.
  COA="coa",//mumbai-team-june2021-danphe-accounting-cache-change
  VoucherType="voucherType", //mumbai-team-june2021-danphe-accounting-cache-change
  VoucherHead="voucherHead",//mumbai-team-june2021-danphe-accounting-cache-change
  PrimaryGroup="primaryGroup",//mumbai-team-june2021-danphe-accounting-cache-change
  CodeDetails="codeDetails",//mumbai-team-june2021-danphe-accounting-cache-change
  AuditReportType="auditReportType",//mumbai-team-june2021-danphe-accounting-cache-change
  LedgerGroups="ledgerGroups",//mumbai-team-june2021-danphe-accounting-cache-change
  Ledgers="ledgers",//mumbai-team-june2021-danphe-accounting-cache-change
  LedgersAll="ledgersAll",//mumbai-team-june2021-danphe-accounting-cache-change
  SubLedgerAll ="SubLedgerAll",
  CostCenters = "CostCenters"
}
const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));

/* 
Krishna/Sud:18Jan'23
------------------------
  since 'const' defined outside of the class are loaded before the app.component class, we couldn't find the LocalStorageValue here
  which was set from app.component.
  Hence we've moved the common code here inside GetApiData and GetAccApiData functions. 

// const loginToken = `Bearer ${localStorage.getItem(ENUM_LocalStorageKeys.LoginTokenName)}`;
// const headerOptions = {
//   headers: new HttpHeaders({ 
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Authorization': loginToken
//  })
// };

*/



@Injectable()
export class DanpheCache {
  private static Data: Array<object> = new Array<object>();

  static GetData(type: MasterType, id): any {

    if (DanpheCache.Data[type] == null) {
      switch (type) {
        case MasterType.Country: {                            //get country data from master api completed
          var country = this.getservice(type, null);
          if (country != undefined) {
            return country;
          }
        }
          break;
        case MasterType.ICD: {                                //get icd data from master api completed
          var ICD = this.getservice(type, null);
          return ICD;
        }
          break;
        case MasterType.Employee: {
          var Employee = this.getservice(type, null);        //get employee data from  api completed
        }
          break;
        case MasterType.BillingCounter: {
          var Employee = this.getservice(type, null);            //get counter data from billing api completed
          return Employee;
        }
          break;
        case MasterType.PhrmCounter: {
          var PhrmCounter = this.getservice(type, null);          //get counter data from phamracy api completed
          return PhrmCounter;
        }
          break;
        case MasterType.SubDivision: {
          var subdivisions = this.getservice(type, null);         //get subdivision data from settings api completed
          return subdivisions;
        }
          break;
        case MasterType.AllMasters: {
          var subdivisions = this.getservice(type, null);         //get data from master api like departments, taxes,serivce departmens.
          return subdivisions;
        }
          break;
      }

    }
    else {
      return DanpheCache.Data[type];
    }
  }

  static getservice(type, id) {
    this.GetApiData(type, id).subscribe(res => {
      this.Data[type] = res;
      return this.Data[type];
    });
  }

  static GetApiData(reqUrl, countryId) {
    const loginToken = `Bearer ${localStorage.getItem(ENUM_LocalStorageKeys.LoginTokenName)}`;
    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': loginToken
      })
    };
    let url;

    switch (reqUrl) {
      case MasterType.Country: {
        url = '/api/Master/Countries';
      }
        break;
      case MasterType.ICD: {
        url = '/api/Master/ICDCode';
      }
        break;
      case MasterType.Employee: {
        url = '/api/EmployeeSettings/Employees';
      }
        break;
      case MasterType.PhrmCounter: {
        url = '/api/pharmacy?reqType=getCounter';
      }
        break;
      case MasterType.BillingCounter: {
         url = '/api/billing/BillingCounters';
      }
        break;
      case MasterType.SubDivision: {
        url = '/api/Settings/CountrySubDivisions';
      }
        break;
      case MasterType.AllMasters: {
        url = '/api/Master/GetMasterData';
      }
        break;

    }

    return httpClient.get<any>(url, headerOptions).pipe(map(response => {
      if (response.Status === 'OK') {
        //console.log(response.Results);
        return response.Results;
      }
    }));
  }

  //mumbai-team-june2021-danphe-accounting-cache-change
  static async GetAccCacheData(type: MasterType, id) {

    if (DanpheCache.Data[type] == null) {
      switch (type) {
        case MasterType.VoucherType: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.VoucherHead: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.Ledgers: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.LedgerGroups: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.PrimaryGroup: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.CodeDetails: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.COA: {
          var res = await this.getAccService(type, null)
          return res;
        }
          break;
        case MasterType.LedgersAll: {
          var res = await this.getAccService(type, null)
          return res;
        }
        break;
        case MasterType.SubLedgerAll: {
          let res = await this.getAccService(type,null)
          return res;
        }
        break;
        case MasterType.CostCenters: {
          let res = await this.getAccService(type, null);
          return res;
        }
        break;
      }

    }
    else {
      return await DanpheCache.Data[type];
    }
  }

  //mumbai-team-june2021-danphe-accounting-cache-change
  static async getAccService(type, id) {
    this.Data[type] = await this.GetAccApiData(type, id);
    return this.Data[type];
  }

  //mumbai-team-june2021-danphe-accounting-cache-change
  static async GetAccApiData(type, id) {
    const loginToken = `Bearer ${localStorage.getItem(ENUM_LocalStorageKeys.LoginTokenName)}`;
    const headerOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': loginToken
      })
    };
    let url;

    switch (type) {
      case MasterType.VoucherType: {
        url = '/api/Accounting/Vouchers';
      }
        break;
      case MasterType.VoucherHead: {
        url = '/api/Accounting/VoucherHeads';
      }
        break;
      case MasterType.Ledgers: {
        url = '/api/Accounting/Ledgers';
      }
        break;
      case MasterType.LedgerGroups: {
        url = '/api/AccountingSettings/LedgerGroups';
      }
        break;
      case MasterType.CodeDetails: {
        url = '/api/Accounting/AccountingCodes';
      }
        break;
      case MasterType.PrimaryGroup: {
        url = '/api/AccountingSettings/PrimaryList';
      }
        break;
      case MasterType.COA: {
        url = '/api/AccountingSettings/ChartofAccount';
      }
        break;
      case MasterType.LedgersAll: {
        url = '/api/AccountingSettings/LedgersList';
      }
        break;
        case MasterType.SubLedgerAll: {
          url = `/api/AccountingSettings/GetSubLedgers`;
        }
        break;
        case MasterType.CostCenters: {
          url = `/api/AccountingSettings/CostCenters`;
        }
        break;
    }

    var res = await httpClient.get<any>(url, headerOptions).pipe(map(response => {
      if (response.Status === 'OK') {
        return response.Results;
      }
      else if (response.Status === "Failed") {
        console.log(response.ErrorMessage);
        alert(response.ErrorMessage);
        return null;
      }
    })).toPromise();
    return res;
  }

  //mumbai-team-june2021-danphe-accounting-cache-change
  static clearDanpheCacheByType(type) {
    this.Data[type] = null;
  }
}
