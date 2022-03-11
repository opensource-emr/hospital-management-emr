import { Injectable, Directive } from '@angular/core';

import { Role } from "../../../security/shared/role.model";
import { User } from "../../../security/shared/user.model";
import { RolePermissionMap } from "../../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../../security/shared/user-role-map.model";

import { InventorySettingDLService } from './inventory-settings.dl.service';

import { AccountHeadModel } from "./account-head.model";
import { CurrencyModel } from "./currency.model";
import { ItemCategoryModel } from "./item-category.model";
import { ItemModel } from "./item.model";
import { PackagingTypeModel } from "./packaging-type.model";
import { UnitOfMeasurementModel } from "./unit-of-measurement.model";
import { VendorsModel } from "./vendors.model";
import { TermsConditionsMasterModel } from '../../shared/terms-conditions-master.model'

import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { ItemSubCategoryModel } from './item-subcategory.model';

@Injectable()
export class InventorySettingBLService {
  constructor(
    public invSettingDLservice: InventorySettingDLService) {

  }



  //Get

  public GetAccountHeadList() {
    return this.invSettingDLservice.GetAccountHeadList()
      .map(res => { return res });
  }
  public GetTermsConditions(TermsApplicationId) {
    return this.invSettingDLservice.GetTermsConditions(TermsApplicationId)
      .map(res => { return res });
  }
  public GetAccountHead(ShowIsActive: boolean) {
    return this.invSettingDLservice.GetAccountHead(ShowIsActive)
      .map(res => { return res });
  }
  //getMappedledgerlist
  public getMappedledgerlist(ledgerType) {
    return this.invSettingDLservice.getMappedledgerlist(ledgerType)
      .map(res => { return res });
  }
  public GetCurrency() {
    return this.invSettingDLservice.GetCurrencyCode()
      .map(res => { return res });
  }
  public GetItemList() {
    return this.invSettingDLservice.GetItemList()
      .map(res => { return res });
  }
  public GetItem() {
    return this.invSettingDLservice.GetItem()
      .map(res => { return res });
  }
  public GetPackagingType() {
    return this.invSettingDLservice.GetPackagingType()
      .map(res => { return res });
  }
  public GetUnitOfMeasurement() {
    return this.invSettingDLservice.GetUnitOfMeasurement()
      .map(res => { return res });
  }
  public GetItemCategory() {
    return this.invSettingDLservice.GetItemCategory()
      .map(res => { return res });
  }
  public GetItemSubCategory() {
    return this.invSettingDLservice.GetItemSubCategory()
      .map(res => { return res });
  }
  public GetItemCategoryList() {
    return this.invSettingDLservice.GetItemCategoryList()
      .map(res => { return res });
  }
  public GetPackagingTypeList() {
    return this.invSettingDLservice.GetPackagingTypeList()
      .map(res => { return res });
  }
  public GetUnitOfMeasurementList() {
    return this.invSettingDLservice.GetUnitOfMeasurementList()
      .map(res => { return res });
  }
  public GetVendorsList() {
    return this.invSettingDLservice.GetVendorsList()
      .map(res => { return res });
  }
  public GetVendors() {
    return this.invSettingDLservice.GetVendors()
      .map(res => { return res });
  }
  public GetCurrencyCode() {
    return this.invSettingDLservice.GetCurrencyCode()
      .map(res => { return res });
  }

  public getAllRoles() {
    return this.invSettingDLservice.getAllRoles().map(res => res);
  }

  //Post

  public AddAccountHead(CurrentAccountHead: AccountHeadModel) {
    var temp = _.omit(CurrentAccountHead, ['AccountHeadValidator']);

    return this.invSettingDLservice.PostAccountHead(temp)
      .map(res => { return res });
  }
  public AddCurrency(CurrentCurrency: CurrencyModel) {
    var temp = _.omit(CurrentCurrency, ['CurrencyValidator']);

    return this.invSettingDLservice.PostCurrency(temp)
      .map(res => { return res });
  }

  public AddTerms(CurrentData: TermsConditionsMasterModel) {
    var temp = _.omit(CurrentData, ['TermsValidators']);
    return this.invSettingDLservice.PostTerms(temp)
      .map(res => { return res });
  }

  public AddItem(CurrentItem: ItemModel) {
    var temp = _.omit(CurrentItem, ['ItemValidator']);

    return this.invSettingDLservice.PostItem(temp)
      .map(res => { return res });
  }
  public AddItemCategory(CurrentItemCategory: ItemCategoryModel) {
    var temp = _.omit(CurrentItemCategory, ['ItemCategoryValidator']);

    return this.invSettingDLservice.PostItemCategory(temp)
      .map(res => { return res });
  }
  public AddItemSubCategory(CurrentItemCategory: ItemSubCategoryModel) {
    var temp = _.omit(CurrentItemCategory, ['ItemSubCategoryValidator']);

    return this.invSettingDLservice.PostItemSubCategory(temp)
      .map(res => { return res });
  }
  public AddPackagingType(CurrentPackagingType: PackagingTypeModel) {
    var temp = _.omit(CurrentPackagingType, ['PackagingTypeValidator']);

    return this.invSettingDLservice.PostPackagingType(temp)
      .map(res => { return res });
  }
  public AddUnitOfMeasurement(CurrentUnitOfMeasurement: UnitOfMeasurementModel) {
    var temp = _.omit(CurrentUnitOfMeasurement, ['UnitOfMeasurementValidator']);

    return this.invSettingDLservice.PostUnitOfMeasurement(temp)
      .map(res => { return res });
  }
  public AddVendor(CurrentVendor: VendorsModel) {
    var temp = _.omit(CurrentVendor, ['VendorsValidator']);

    return this.invSettingDLservice.PostVendor(temp)
      .map(res => { return res });
  }



  //Put

  public UpdateAccountHead(accounthead: AccountHeadModel) {
    if (accounthead.CreatedOn)
      accounthead.CreatedOn = moment(accounthead.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(accounthead, ['AccountHeadValidator']);

    return this.invSettingDLservice.PutAccountHead(temp)
      .map(res => { return res });
  }
  public UpdateCurrency(currency: CurrencyModel) {
    if (currency.CreatedOn)
      currency.CreatedOn = moment(currency.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(currency, ['CurrencyValidator']);

    return this.invSettingDLservice.PutCurrency(temp)
      .map(res => { return res });
  }
  public UpdateItem(Item: ItemModel) {
    if (Item.CreatedOn)
      Item.CreatedOn = moment(Item.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(Item, ['ItemValidator']);

    return this.invSettingDLservice.PutItem(temp)
      .map(res => { return res });
  }
  public UpdateItemCategory(itemcategory: ItemCategoryModel) {
    if (itemcategory.CreatedOn)
      itemcategory.CreatedOn = moment(itemcategory.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(itemcategory, ['ItemCategoryValidator']);

    return this.invSettingDLservice.PutItemCategory(temp)
      .map(res => { return res });
  }
  public UpdateItemSubCategory(itemsubcategory: ItemSubCategoryModel) {
    if (itemsubcategory.CreatedOn)
      itemsubcategory.CreatedOn = moment(itemsubcategory.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(itemsubcategory, ['ItemSubCategoryValidator']);

    return this.invSettingDLservice.PutItemSubCategory(temp)
      .map(res => { return res });
  }
  public UpdatePackagingType(vendor: PackagingTypeModel) {
    if (vendor.CreatedOn)
      vendor.CreatedOn = moment(vendor.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(vendor, ['PackagingTypeValidator']);

    return this.invSettingDLservice.PutPackagingType(temp)
      .map(res => { return res });
  }
  public UpdateUnitOfMeasurement(unitofmeasurement: UnitOfMeasurementModel) {
    if (unitofmeasurement.CreatedOn)
      unitofmeasurement.CreatedOn = moment(unitofmeasurement.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(unitofmeasurement, ['UnitOfMeasurementValidator']);

    return this.invSettingDLservice.PutUnitOfMeasurement(temp)
      .map(res => { return res });
  }
  public UpdateVendor(vendor: VendorsModel) {
    if (vendor.CreatedOn)
      vendor.CreatedOn = moment(vendor.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(vendor, ['VendorsValidator']);

    return this.invSettingDLservice.PutVendor(temp)
      .map(res => { return res });
  }

  public UpdateTerms(CurrentData: TermsConditionsMasterModel) {
    if (CurrentData.CreatedOn)
      CurrentData.CreatedOn = moment(CurrentData.CreatedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(CurrentData, ['TermsValidators']);

    return this.invSettingDLservice.PutTerms(temp)
      .map(res => { return res });
  }

}
