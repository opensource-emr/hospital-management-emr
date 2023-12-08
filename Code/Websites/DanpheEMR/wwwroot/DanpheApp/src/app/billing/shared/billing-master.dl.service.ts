import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DanpheHTTPResponse } from "../../shared/common-models";

@Injectable()
export class BillingMasterDlService {

  private headerOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private apiUrl: string = "/api/BillingMaster" //! Krishna, 17thMarch'23, Do not change this unless needed, if changed here please check all the API's that are hit using this API Url
  constructor(private httpClient: HttpClient) {

  }
  GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/ServiceItems?serviceBillingContext=${serviceBillingContext}&schemeId=${schemeId}&priceCategoryId=${priceCategoryId}`, this.headerOptions);
  }

  GetServiceItemSchemeSetting(serviceBillingContext: string, schemeId: number) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/ServiceItemSchemeSetting?serviceBillingContext=${serviceBillingContext}&schemeId=${schemeId}`, this.headerOptions);
  }
  GetAdditionalServiceItems(groupName: string, priceCategoryId: number) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/AdditionalServiceItems?groupName=${groupName}&priceCategoryId=${priceCategoryId}`, this.headerOptions);
  }

  GetVisitAdditionalServiceItems(groupName: string) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/VistAdditionalServiceItems?groupName=${groupName}`, this.headerOptions);
  }
  GetServicePackages(schemeId: number, priceCategoryId: number) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/ServicePackages?schemeId=${schemeId}&priceCategoryId=${priceCategoryId}`, this.headerOptions);
  }
  GetCurrencies() {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/Currencies`, this.headerOptions);
  }
  GetServiceItemsByPriceCategoryId(priceCategoryId: number) {
    return this.httpClient.get<DanpheHTTPResponse>(`${this.apiUrl}/ServiceItemsByPriceCategory?priceCategoryId=${priceCategoryId}`, this.headerOptions);
  }

}
