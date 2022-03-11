import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AccountHeadModel } from "./account-head.model";
import { CurrencyModel } from "./currency.model";
import { ItemCategoryModel } from "./item-category.model";
import { ItemModel } from "./item.model";
import { PackagingTypeModel } from "./packaging-type.model";
import { UnitOfMeasurementModel } from "./unit-of-measurement.model";
import { VendorsModel } from "./vendors.model";

@Injectable()
export class InventorySettingDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) { }



  //GET

  public GetAccountHeadList() {
    return this.http.get<any>("/api/InventorySettings?reqType=AccountHeadList");
  }
  public GetAccountHead(ShowIsActive: boolean) {
    return this.http.get<any>("/api/InventorySettings?reqType=GetAccountHead&ShowIsActive=" + ShowIsActive);
  }
  // getMappedledgerlist
  public getMappedledgerlist(ledgerType) {
    return this.http.get<any>("/api/Accounting?reqType=get-mapped-ledger-list&ledgerType=" + ledgerType);
  }
  public GetCurrencyCode() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetCurrencyCodeList");
  }
  public GetItemList() {
    return this.http.get<any>("/api/InventorySettings?reqType=ItemList");
  }
  public GetTermsConditions(TermsApplicationId) {
    return this.http.get<any>("/api/InventorySettings/GetTermsListByTermsApplicationId/" + TermsApplicationId, this.options);
  }

  public GetItem() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetItem");
  }
  public GetPackagingType() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetPackagingType");
  }
  public GetUnitOfMeasurement() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetUnitOfMeasurement");
  }
  public GetItemCategory() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetItemCategory");
  }
  public GetItemSubCategory() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetItemSubCategory");
  }
  public GetItemCategoryList() {
    return this.http.get<any>("/api/InventorySettings?reqType=VendorsList");
  }
  public GetPackagingTypeList() {
    return this.http.get<any>("/api/InventorySettings?reqType=PackagingTypeList");
  }
  public GetUnitOfMeasurementList() {
    return this.http.get<any>("/api/InventorySettings?reqType=UnitOfMeasurementList");
  }
  public GetVendorsList() {
    return this.http.get<any>("/api/InventorySettings?reqType=VendorsList");
  }
  public GetVendors() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetVendors");
  }

  public getAllRoles() {
    return this.http.get<any>("/api/inventorySettings/getAllRoles");
  }

  //POST

  public PostAccountHead(CurrentAccountHead) {
    let data = JSON.stringify(CurrentAccountHead);
    return this.http.post<any>("/api/InventorySettings?reqType=AddAccountHead", data, this.options);
  }
  public PostCurrency(CurrentCurrency) {
    let data = JSON.stringify(CurrentCurrency);
    return this.http.post<any>("/api/InventorySettings?reqType=AddCurrency", data, this.options);
  }
  public PostTerms(CurrentData) {
    let data = JSON.stringify(CurrentData);
    return this.http.post<any>("/api/InventorySettings?reqType=PostInventoryTerms", data, this.options);
  }

  public PostItem(CurrentItem) {
    let data = JSON.stringify(CurrentItem);
    return this.http.post<any>("/api/InventorySettings?reqType=AddItem", data, this.options);
  }
  public PostItemCategory(CurrentItemCategory) {
    let data = JSON.stringify(CurrentItemCategory);
    return this.http.post<any>("/api/InventorySettings?reqType=AddItemCategory", data, this.options);
  }
  public PostItemSubCategory(CurrentItemSubCategory) {
    let data = JSON.stringify(CurrentItemSubCategory);
    return this.http.post<any>("/api/InventorySettings?reqType=AddItemSubCategory", data, this.options);
  }
  public PostPackagingType(CurrentPackagingType) {
    let data = JSON.stringify(CurrentPackagingType);
    return this.http.post<any>("/api/InventorySettings?reqType=AddPackagingType", data, this.options);
  }
  public PostUnitOfMeasurement(CurrentUnitOfMeasurement) {
    let data = JSON.stringify(CurrentUnitOfMeasurement);
    return this.http.post<any>("/api/InventorySettings?reqType=AddUnitOfMeasurement", data, this.options);
  }
  public PostVendor(CurrentVendor) {
    let data = JSON.stringify(CurrentVendor);
    return this.http.post<any>("/api/InventorySettings?reqType=AddVendors", data, this.options);
  }



  //PUT

  public PutAccountHead(accounthead) {
    let data = JSON.stringify(accounthead);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateAccountHead", accounthead, this.options);
  }
  public PutCurrency(currency) {
    let data = JSON.stringify(currency);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateCurrency", currency, this.options);
  }
  public PutItem(Item) {
    let data = JSON.stringify(Item);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateItem", Item, this.options);
  }
  public PutItemCategory(itemcategory) {
    let data = JSON.stringify(itemcategory);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateItemCategory", itemcategory, this.options);
  }
  public PutItemSubCategory(itemsubcategory) {
    let data = JSON.stringify(itemsubcategory);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateItemSubCategory", itemsubcategory, this.options);
  }
  public PutPackagingType(packagingtype) {
    let data = JSON.stringify(packagingtype);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdatePackagingType", packagingtype, this.options);
  }
  public PutUnitOfMeasurement(unitofmeasurement) {
    let data = JSON.stringify(unitofmeasurement);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateUnitOfMeasurement", unitofmeasurement, this.options);
  }
  public PutVendor(vendor) {
    let data = JSON.stringify(vendor);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateVendors", vendor, this.options);
  }

  public PutTerms(CurrentData) {
    let data = JSON.stringify(CurrentData);
    return this.http.put<any>("/api/InventorySettings?reqType=UpdateInventoryTerms", CurrentData, this.options);
  }
}
