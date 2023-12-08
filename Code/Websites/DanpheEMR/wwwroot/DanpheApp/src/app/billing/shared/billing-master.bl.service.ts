import { Injectable } from "@angular/core";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { ENUM_DanpheHTTPResponses } from "../../shared/shared-enums";
import { BillingMasterDlService } from "./billing-master.dl.service";
import { BillingAdditionalServiceItem_DTO } from "./dto/bill-additional-service-item.dto";
import { Currency_DTO } from "./dto/other-currency.dto";
import { ServiceItemDetails_DTO } from "./dto/service-item-details.dto";

@Injectable({
  providedIn: "root"
})
export class BillingMasterBlService {

  public ServiceItems = new Array<ServiceItemDetails_DTO>();
  public PriceCategoryId: number = null;
  public SchemeId: number = null;
  public ServiceItemsForIp = new Array<ServiceItemDetails_DTO>();
  public AdditionalServiceItems = new Array<BillingAdditionalServiceItem_DTO>();
  public Currencies = new Array<Currency_DTO>();
  public ServiceItemsForProvisionalClearance = new Array<ServiceItemDetails_DTO>();
  constructor(private billingMasterDlService: BillingMasterDlService) {

  }

  GetServiceItems(serviceBillingContext: string, schemeId: number, priceCategoryId: number) {
    return this.billingMasterDlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId).map(res => {
      return res;
    });
  }

  GetServiceItemSchemeSetting(serviceBillingContext: string, schemeId: number) {
    return this.billingMasterDlService.GetServiceItemSchemeSetting(serviceBillingContext, schemeId).map(res => {
      return res;
    });
  }

  GetAdditionalServiceItems(groupName: string, priceCategoryId: number) {
    return this.billingMasterDlService.GetAdditionalServiceItems(groupName, priceCategoryId).map(res => {
      return res;
    });
  }

  GetVisitAdditionalServiceItems(groupName: string) {
    return this.billingMasterDlService.GetVisitAdditionalServiceItems(groupName).map(res => {
      return res;
    });
  }

  FetchServiceItemsBasedOnCurrentVisitSchemeAndPriceCategory(serviceBillingContext: string, schemeId: number, priceCategoryId: number) {
    this.PriceCategoryId = priceCategoryId;
    this.billingMasterDlService.GetServiceItems(serviceBillingContext, schemeId, priceCategoryId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.ServiceItems = res.Results;
      }
    });
  }
  FetchAdditionalServiceItems(groupName: string, priceCategoryId: number) {
    this.billingMasterDlService.GetAdditionalServiceItems(groupName, priceCategoryId).subscribe((res: DanpheHTTPResponse) => {
      if (res.Status === ENUM_DanpheHTTPResponses.OK) {
        this.AdditionalServiceItems = res.Results;
      }
    });
  }

  GetServicePackages(schemeId: number, priceCategoryId: number) {
    return this.billingMasterDlService.GetServicePackages(schemeId, priceCategoryId).map(res => {
      return res;
    });
  }
  GetCurrencies() {
    return this.billingMasterDlService.GetCurrencies().map(res => {
      return res;
    });
  }
  GetServiceItemsByPriceCategoryId(priceCategoryId: number) {
    return this.billingMasterDlService.GetServiceItemsByPriceCategoryId(priceCategoryId).map(res => {
      return res;
    });
  }

}
