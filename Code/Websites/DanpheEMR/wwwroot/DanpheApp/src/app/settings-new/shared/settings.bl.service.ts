import { Injectable } from '@angular/core';

import { Bed } from '../../adt/shared/bed.model';
import { BedFeature } from '../../adt/shared/bedfeature.model';
import { Ward } from "../../adt/shared/ward.model";
import { BedFeaturesMap } from '../../adt/shared/bedfeature-map.model';

import { Department } from "../shared/department.model";
import { ServiceDepartment } from "../shared/service-department.model";

import { ImagingType } from "../../radiology/shared/imaging-type.model";
import { ImagingItem } from "../../radiology/shared/imaging-item.model";

import { Employee } from "../../employee/shared/employee.model";
import { EmployeeRole } from "../../employee/shared/employee-role.model";
import { EmployeeType } from "../../employee/shared/employee-type.model";

import { Country } from "../shared/country.model";
import { CountrySubdivision, Municipality } from "../shared/country-subdivision.model";

import { Reaction } from "../shared/reaction.model";

import { Role } from "../../security/shared/role.model";
import { User } from "../../security/shared/user.model";
import { RolePermissionMap } from "../../security/shared/role-permission-map.model";
import { UserRoleMap } from "../../security/shared/user-role-map.model";

import { BillingPackageItem } from '../../billing/shared/billing-package-item.model';
import { BillingPackage } from '../../billing/shared/billing-package.model';

import { SettingsDLService } from '../shared/settings.dl.service';
import { BillingDLService } from '../../billing/shared/billing.dl.service';

import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { LabTest } from "../../labs/shared/lab-test.model";
import { RadiologyReportTemplate } from "../../radiology/shared/radiology-report-template.model";
import { BillingItemVM } from '../../billing/shared/billing-item.view-model';
import { CFGParameterModel } from './cfg-parameter.model';
import { CreditOrganization } from './creditOrganization.model';
import { Membership } from './membership.model';
import { ExternalReferralModel } from './external-referral.model';
import { PHRMStoreModel } from '../../pharmacy/shared/phrm-store.model';
import { StoreVerificationMapModel } from './store-role-map.model';
import { BanksModel } from './banks.model';
import { PrinterSettingsModel } from '../printers/printer-settings.model';
import { ReportingItemBillingItemMappingModel } from './reporting-items-bill-item-mapping.model';
import { ReportingItemsModel } from './reporting-items.model';
import { PrintExportConfigurationModel } from './print-export-config.model';

@Injectable()
export class SettingsBLService {

  constructor(public settingsDLService: SettingsDLService, public billingDLService: BillingDLService) {
  }

  //start: adt
  public GetBedList() {
    return this.settingsDLService.GetBedList()
      .map(res => { return res });
  }
  public GetBedFeatureList() {
    return this.settingsDLService.GetBedFeatureList()
      .map(res => { return res });
  }
  public ADT_GetAutoBillingItemList() {
    return this.settingsDLService.ADT_GetAutoBillingItemList()
      .map(res => { return res });
  }
  public GetSelectedBedFeatureMapList(bedId: number) {
    return this.settingsDLService.GetSelectedBedFeatureMapList(bedId)
      .map(res => { return res });
  }
  public GetWardList() {
    return this.settingsDLService.GetWardList()
      .map(res => { return res });
  }

  public GetMembershipType() {
    return this.settingsDLService.GetMembershipType()
      .map(res => { return res })
  }

  public AddBed(CurrentBedMain: Bed) {
    var temp = _.omit(CurrentBedMain, ['BedMainValidator']);
    return this.settingsDLService.PostBed(temp)
      .map(res => { return res });
  }
  public AddBedFeature(CurrentBedFeature: BedFeature) {

    var temp = _.omit(CurrentBedFeature, ['BedFeatureValidator']);
    return this.settingsDLService.PostBedFeature(temp)
      .map(res => { return res });
  }
  public AddBedFeaturesMap(bedFeaturesMapList: Array<BedFeaturesMap>) {

    return this.settingsDLService.PostBedFeaturesMap(bedFeaturesMapList)
      .map(res => { return res });

  }
  public ADT_PostAutoAddBillItmValues() {
    return this.settingsDLService.ADT_PostAutoAddBillItmValues()
      .map(res => { return res });
  }

  public AddWard(CurrentWard: Ward) {
    var temp = _.omit(CurrentWard, ['WardValidator']);
    return this.settingsDLService.PostWard(temp)
      .map(res => { return res });
  }



  public UpdateBed(CurrentBedMain: Bed) {
    //to fix serializaiton problem in server side
    if (CurrentBedMain.CreatedOn)
      CurrentBedMain.CreatedOn = moment(CurrentBedMain.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (CurrentBedMain.ModifiedOn)
      CurrentBedMain.ModifiedOn = moment(CurrentBedMain.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(CurrentBedMain, ['BedMainValidator']);
    return this.settingsDLService.PutBed(temp)
      .map(res => { return res });
  }
  public UpdateBedFeature(CurrentBedFeature: BedFeature) {
    //to fix serializaiton problem in server side
    if (CurrentBedFeature.CreatedOn)
      CurrentBedFeature.CreatedOn = moment(CurrentBedFeature.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (CurrentBedFeature.ModifiedOn)
      CurrentBedFeature.ModifiedOn = moment(CurrentBedFeature.ModifiedOn).format('YYYY-MM-DD HH:mm');

    var temp = _.omit(CurrentBedFeature, ['BedFeatureValidator']);
    return this.settingsDLService.PutBedFeature(temp)
      .map(res => { return res });
  }
  public UpdateBedFeaturesMap(bedFeaturesMapList: Array<BedFeaturesMap>) {
    //to fix serializaiton problem in server side
    bedFeaturesMapList.forEach(bedFeaturesMap => {
      if (bedFeaturesMap.CreatedOn)
        bedFeaturesMap.CreatedOn = moment(bedFeaturesMap.CreatedOn).format('YYYY-MM-DD HH:mm');
      if (bedFeaturesMap.ModifiedOn)
        bedFeaturesMap.ModifiedOn = moment(bedFeaturesMap.ModifiedOn).format('YYYY-MM-DD HH:mm');
    });

    return this.settingsDLService.PutBedFeaturesMap(bedFeaturesMapList)
      .map(res => { return res });
  }
  public UpdateWard(CurrentWard: Ward) {
    //to fix serializaiton problem in server side
    if (CurrentWard.CreatedOn)
      CurrentWard.CreatedOn = moment(CurrentWard.CreatedOn).format('YYYY-MM-DD');
    if (CurrentWard.ModifiedOn)
      CurrentWard.ModifiedOn = moment(CurrentWard.ModifiedOn).format('YYYY-MM-DD');
    var temp = _.omit(CurrentWard, ['WardValidator']);
    return this.settingsDLService.PutWard(temp)
      .map(res => { return res });
  }
  //end: adt

  //start: department
  public GetDepartments() {
    return this.settingsDLService.GetDepartments()
      .map(res => { return res });
  }
  public GetStoreList() {
    return this.settingsDLService.GetStoreList()
      .map(res => { return res });
  }

  public GetActiveStoreList() {
    return this.settingsDLService.GetActiveStoreList()
      .map(res => { return res });
  }
  public GetStoreVerifiers(StoreId: number) {
    return this.settingsDLService.GetStoreVerifiers(StoreId)
      .map(res => { return res; });
  }
  public GetCFGParameters() {
    return this.settingsDLService.GetCFGParameters()
      .map(res => { return res });
  }

  public GetServiceDepartments() {
    return this.settingsDLService.GetServiceDepartments()
      .map(res => { return res });
  }

  public GetIntegrationNameList() {
    return this.settingsDLService.GetIntegrationNameList()
      .map(res => { return res });
  }

  //post new department
  public AddDepartment(CurrentDepartment: Department) {
    //omiting the appointmentvalidator during post because it causes cyclic error during serialization in server side.
    let dptSrvItmList = [];
    CurrentDepartment.ServiceItemsList.map(val => {
      val = _.omit(val, ['BillingItemValidator']);
      dptSrvItmList.push(val);
    });

    var temp = _.omit(CurrentDepartment, ['DepartmentValidator']);
    temp.ServiceItemsList = new Array();
    temp.ServiceItemsList = dptSrvItmList;
    return this.settingsDLService.PostDepartment(temp)
      .map(res => { return res });
  }
  //post new department
  public AddStore(CurrentStore: PHRMStoreModel) {
    var temp = _.omit(CurrentStore, ['StoreValidator']);
    temp.CreatedOn = moment(new Date()).format('YYYY-MM-DD HH:mm');
    temp.ParentStoreId = 1;
    return this.settingsDLService.PostStore(temp)
      .map(res => { return res });
  }
  public UpdateDepartment(department: Department) {
    //to fix serializaiton problem in server side
    if (department.CreatedOn)
      department.CreatedOn = moment(department.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (department.ModifiedOn)
      department.ModifiedOn = moment(department.ModifiedOn).format('YYYY-MM-DD HH:mm');
    let dptSrvItmList = [];
    department.ServiceItemsList.map(val => {
      val = _.omit(val, ['BillingItemValidator']);
      dptSrvItmList.push(val);
    });

    var temp = _.omit(department, ['DepartmentValidator']);
    temp.ServiceItemsList = new Array();
    temp.ServiceItemsList = dptSrvItmList;

    return this.settingsDLService.PutDepartment(temp)
      .map(res => { return res });
  }
  public UpdateStore(store: PHRMStoreModel) {
    //to fix serializaiton problem in server side
    if (store.CreatedOn)
      store.CreatedOn = moment(store.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (store.ModifiedOn)
      store.ModifiedOn = moment(store.ModifiedOn).format('YYYY-MM-DD HH:mm');

    var temp = _.omit(store, ['StoreValidator']);

    return this.settingsDLService.PutStore(temp)
      .map(res => { return res });
  }

  public ActivateDeactivateStore(storeId: number) {

    return this.settingsDLService.PutStoreActiveStatus(storeId)
      .map(res => { return res });
  }

  public AddServiceDepartment(CurrentServiceDepartment: ServiceDepartment) {
    var temp = _.omit(CurrentServiceDepartment, ['ServiceDepartmentValidator']);
    return this.settingsDLService.PostServiceDepartment(temp)
      .map(res => { return res });
  }
  public UpdateServDepartment(servDepartment: ServiceDepartment) {
    //to fix serializaiton problem in server side
    if (servDepartment.CreatedOn)
      servDepartment.CreatedOn = moment(servDepartment.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (servDepartment.ModifiedOn)
      servDepartment.ModifiedOn = moment(servDepartment.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(servDepartment, ['ServiceDepartmentValidator']);
    return this.settingsDLService.PutServDepartment(temp)
      .map(res => { return res });
  }
  //end: department   



  //start: radiology
  public GetRadSignatoryEmps() {
    return this.settingsDLService.GetRadSignatoryEmps()
      .map(res => { return res });
  }

  public GetImgTypes() {
    return this.settingsDLService.GetImgTypes()
      .map(res => { return res });
  }
  public GetImgItems() {
    return this.settingsDLService.GetImgItems()
      .map(res => { return res });
  }

  //Get Raddiology report  template list
  public GetRADReportTemplateList() {
    try {
      return this.settingsDLService.GetRADReportTemplateList()
        .map(res => { return res });

    } catch (exception) {
      throw exception;
    }
  }
  //Get template data by templateId
  GetRADReportTemplateById(templateId: number) {
    try {
      return this.settingsDLService.GetRADReportTemplateById(templateId)
        .map(res => { return res });
    } catch (exception) {
      throw exception;
    }
  }
  public AddImagingItem(imagingItem: ImagingItem) {


    var temp = _.omit(imagingItem, ['ImagingItemValidator']);
    return this.settingsDLService.PostImagingItem(temp)
      .map(res => { return res });
  }

  public AddImagingType(imagingType: ImagingType) {
    var temp = _.omit(imagingType, ['ImagingTypeValidator']);
    return this.settingsDLService.PostImagingType(temp)
      .map(res => { return res });
  }

  //Post Radiology report template data to server
  public AddRadiologyReportTemplate(radReportTemplate: RadiologyReportTemplate) {
    try {
      radReportTemplate.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
      var temp = _.omit(radReportTemplate, ['RadiologyReportTemplateValidator']);
      return this.settingsDLService.PostRadiologyReportTemplate(temp)
        .map(res => { return res });
    } catch (exception) {
      throw exception;
    }
  }
  public UpdateImagingType(imagingType: ImagingType) {
    //to fix serializaiton problem in server side
    if (imagingType.CreatedOn)
      imagingType.CreatedOn = moment(imagingType.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (imagingType.ModifiedOn)
      imagingType.ModifiedOn = moment(imagingType.ModifiedOn).format('YYYY-MM-DD HH:mm');

    var temp = _.omit(imagingType, ['ImagingTypeValidator']);
    return this.settingsDLService.PutImagingType(temp)
      .map(res => { return res });
  }
  public UpdateImagingItem(imagingItem: ImagingItem) {
    //to fix serializaiton problem in server side
    if (imagingItem.CreatedOn)
      imagingItem.CreatedOn = moment(imagingItem.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (imagingItem.ModifiedOn)
      imagingItem.ModifiedOn = moment(imagingItem.ModifiedOn).format('YYYY-MM-DD HH:mm');

    var temp = _.omit(imagingItem, ['ImagingItemValidator']);
    return this.settingsDLService.PutImagingItem(temp)
      .map(res => { return res });
  }
  //update radiology report template
  public UpdateRadiologyReportTemplate(radReportTemplate: RadiologyReportTemplate) {
    try {
      radReportTemplate.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
      var temp = _.omit(radReportTemplate, ['RadiologyReportTemplateValidator']);
      return this.settingsDLService.PutRadiologyReportTemplate(temp)
        .map(res => { return res });
    } catch (exception) {
      throw exception;
    }
  }
  //end: radiology

  //start: employee
  public GetEmployeeList() {
    return this.settingsDLService.GetEmployeeList()
      .map(res => { return res });
  }
  public GetEmployeeRoleList() {
    return this.settingsDLService.GetEmployeeRoleList()
      .map(res => { return res });
  }
  public GetEmployeeTypeList(ShowIsActive: boolean) {
    return this.settingsDLService.GetEmployeeTypeList(ShowIsActive)
      .map(res => { return res });
  }
  public GetDisBilItemPriceCFGByServDeptName(servDeptName: string) {
    return this.settingsDLService.GetDisBilItemPriceCFGByServDeptName(servDeptName)
      .map(res => { return res });
  }
  public GetDisBilItemPriceCFGByIntegrationName(integrationName: string) {
    return this.settingsDLService.GetDisBilItemPriceCFGByIntegrationName(integrationName)
      .map(res => { return res });
  }
  public GetBilItemPriceDetails(itemId: number, servDeptName: string) {
    return this.settingsDLService.GetBilItemPriceDetails(itemId, servDeptName)
      .map(res => { return res });
  }

  public GetBilItemPriceDetails_IntegrationName_ItemId(integrationName: string, itemId: number) {
    return this.settingsDLService.GetBilItemPriceDetails_IntegrationName_ItemId(integrationName, itemId)
      .map(res => { return res });
  }



  public GetCreditOrganizationList() {
    return this.settingsDLService.GetCreditOrganizationList()
      .map(res => { return res });
  }
  public GetSignatoryImage(empId: number) {
    return this.settingsDLService.GetSignatoryImage(empId)
      .map(res => { return res });
  }
  public AddEmployee(employee: Employee) {
    var temp = _.omit(employee, ['EmployeeValidator']);
    return this.settingsDLService.PostEmployee(temp)
      .map(res => { return res });
  }
  public AddEmployeeRole(employeeRole: EmployeeRole) {
    var temp = _.omit(employeeRole, ['EmployeeRoleValidator']);
    return this.settingsDLService.PostEmployeeRole(temp)
      .map(res => { return res });
  }
  public AddEmployeeType(employeeType: EmployeeType) {
    var temp = _.omit(employeeType, ['EmployeeTypeValidator']);
    return this.settingsDLService.PostEmployeeType(temp)
      .map(res => { return res });
  }
  public AddCreditOrganization(creditOrganization: CreditOrganization) {
    var temp = _.omit(creditOrganization, ['CreditOrganizationValidator']);
    return this.settingsDLService.PostCreditOrganization(temp)
      .map(res => { return res });
  }
  public AddMembership(membership: Membership) {
    var temp = _.omit(membership, ['MembershipValidator']);
    return this.settingsDLService.PostMembership(temp)
      .map(res => { return res });
  }
  public UpdateEmployee(employee: Employee) {
    //to fix serializaiton problem in server side
    if (employee.CreatedOn)
      employee.CreatedOn = moment(employee.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (employee.ModifiedOn)
      employee.ModifiedOn = moment(employee.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(employee, ['EmployeeValidator']);
    return this.settingsDLService.PutEmployee(temp)
      .map(res => { return res });
  }
  public UpdateEmployeeRole(employeeRole: EmployeeRole) {
    //to fix serializaiton problem in server side
    if (employeeRole.CreatedOn)
      employeeRole.CreatedOn = moment(employeeRole.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (employeeRole.ModifiedOn)
      employeeRole.ModifiedOn = moment(employeeRole.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(employeeRole, ['EmployeeRoleValidator']);
    return this.settingsDLService.PutEmployeeRole(temp)
      .map(res => { return res });
  }
  public UpdateEmployeeType(employeeType: EmployeeType) {
    //to fix serializaiton problem in server side
    if (employeeType.CreatedOn)
      employeeType.CreatedOn = moment(employeeType.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (employeeType.ModifiedOn)
      employeeType.ModifiedOn = moment(employeeType.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(employeeType, ['EmployeeTypeValidator']);
    return this.settingsDLService.PutEmployeeType(temp)
      .map(res => { return res });
  }
  //end: employee


  //start: External Referrals
  public GetExtReferrerList() {
    return this.settingsDLService.GetExtReferrerList()
      .map(res => { return res });
  }

  public GetPrinterSettingList() {
    return this.settingsDLService.GetPrinterSettingList()
      .map(res => { return res });
  }

  //Get All-Referrer-List
  public GetAllReferrerList() {
    return this.settingsDLService.GetAllReferrerList()
      .map(res => res);
  }

  public GetBankList() {
    return this.settingsDLService.GetBankList()
      .map(res => { return res });
  }

  public AddExtReferrer(extRefObj: ExternalReferralModel) {
    var temp = _.omit(extRefObj, ['ExternalRefValidator', '', '']);
    return this.settingsDLService.PostExtReferrer(temp)
      .map(res => { return res });
  }

  public UpdateExtReferrer(extRefObj: ExternalReferralModel) {
    var temp = _.omit(extRefObj, ['ExternalRefValidator', '', '']);
    return this.settingsDLService.PutExtReferrer(temp)
      .map(res => { return res });
  }
  //end: External Referrals

  public AddPrinterSetting(printerSettingObj: PrinterSettingsModel) {
    var temp = _.omit(printerSettingObj, ['PrinterSettingsValidator', '', '']);
    return this.settingsDLService.PostPrinterSetting(temp)
      .map(res => { return res });
  }

  public UpdatePrinterSetting(printerSettingObj: PrinterSettingsModel) {
    var temp = _.omit(printerSettingObj, ['PrinterSettingsValidator', '', '']);
    return this.settingsDLService.PutPrinterSetting(temp)
      .map(res => { return res });
  }


  public AddBank(bankObj: BanksModel) {
    var temp = _.omit(bankObj, ['BanksValidator', '', '']);
    return this.settingsDLService.PostBank(temp)
      .map(res => { return res });
  }

  public UpdateBank(bankObj: BanksModel) {
    var temp = _.omit(bankObj, ['BanksValidator', '', '']);
    return this.settingsDLService.PutBank(temp)
      .map(res => { return res });
  }


  //start: billing
  public UpdateCreditOrganization(creditOrganization: CreditOrganization) {
    //to fix serializaiton problem in server side
    if (creditOrganization.CreatedOn)
      creditOrganization.CreatedOn = moment(creditOrganization.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (creditOrganization.ModifiedOn)
      creditOrganization.ModifiedOn = moment(creditOrganization.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(creditOrganization, ['CreditOrganizationValidator']);
    return this.settingsDLService.PutCreditOrganization(temp)
      .map(res => { return res });
  }
  public UpdateMembership(membership: Membership) {
    if (membership.CreatedOn)
      membership.CreatedOn = moment(membership.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (membership.ModifiedOn)
      membership.ModifiedOn = moment(membership.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(membership, ['MembershipValidator']);
    return this.settingsDLService.PutMembership(temp)
      .map(res => { return res });
  }
  //end: billing

  //start: security
  public GetApplicationList() {
    return this.settingsDLService.GetApplicationList()
      .map(res => { return res });
  }
  public GetRouteList() {
    return this.settingsDLService.GetRouteList()
      .map(res => { return res });
  }
  public GetPermissionList() {
    return this.settingsDLService.GetPermissionList()
      .map(res => { return res });
  }
  public GetRoleList() {
    return this.settingsDLService.GetRoleList()
      .map(res => { return res });
  }
  public GetUserList() {
    return this.settingsDLService.GetUserList()
      .map(res => { return res });
  }
  public GetDiscountScheme() {
    return this.settingsDLService.GetDiscountScheme()
      .map(res => { return res });
  }
  public GetRolePermissionList(roleId: number) {
    return this.settingsDLService.GetRolePermissionList(roleId)
      .map(res => { return res });
  }
  public GetUserRoleList(userId: number) {
    return this.settingsDLService.GetUserRoleList(userId)
      .map(res => { return res });
  }
  public GetDynamicReportNameList() {
    return this.settingsDLService.GetDynamicReportNameList()
      .map(res => { return res });
  }
  public GetReportingItemBillItemList(reportingItemId: number) {
    return this.settingsDLService.GetReportingItemBillItemList(reportingItemId)
      .map(res => { return res });
  }
  public AddUser(user) {
    var temp = _.omit(user, ['UserProfileValidator']);
    return this.settingsDLService.PostUser(temp)
      .map(res => { return res });
  }

  public UpdatePassword(user) {
    var temp = _.omit(user, ['UserProfileValidator']);
    return this.settingsDLService.PutUserPassword(temp)
      .map(res => { return res });
  }

  public Security_DeactivateUser(user) {
    var temp = _.omit(user, ['UserProfileValidator']);
    return this.settingsDLService.PutUserIsActive(temp)
      .map(res => { return res });
  }

  public AddRole(role) {
    var temp = _.omit(role, ['RoleValidator']);
    return this.settingsDLService.PostRole(temp)
      .map(res => { return res });
  }
  public AddRolePermissions(rolePermissions: Array<RolePermissionMap>, roleId: number) {
    return this.settingsDLService.PostRolePermissions(rolePermissions, roleId)
      .map(res => { return res });
  }
  public AddUserRoles(userRoles: Array<UserRoleMap>) {
    return this.settingsDLService.PostUserRoles(userRoles)
      .map(res => { return res });
  }
  public AddReportingItemsAndBillItemMapping(reportingItemsBillItem: Array<ReportingItemBillingItemMappingModel>) {
    return this.settingsDLService.PostReportingItemAndBillItemMapping(reportingItemsBillItem)
      .map(res => { return res });
  }
  public UpdateUser(user: User) {
    //to fix serializaiton problem in server side
    if (user.CreatedOn)
      user.CreatedOn = moment(user.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (user.ModifiedOn)
      user.ModifiedOn = moment(user.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(user, ['UserProfileValidator']);
    return this.settingsDLService.PutUser(temp)
      .map(res => { return res });
  }
  public UpdateRole(role: Role) {
    //to fix serializaiton problem in server side
    if (role.CreatedOn)
      role.CreatedOn = moment(role.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (role.ModifiedOn)
      role.ModifiedOn = moment(role.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(role, ['RoleValidator']);
    return this.settingsDLService.PutRole(temp)
      .map(res => { return res });
  }
  public UpdateRolePermissions(rolePermissions: Array<RolePermissionMap>) {
    //to fix serializaiton problem in server side
    rolePermissions.forEach(rolePermission => {
      if (rolePermission.CreatedOn)
        rolePermission.CreatedOn = moment(rolePermission.CreatedOn).format('YYYY-MM-DD HH:mm');
      if (rolePermission.ModifiedOn)
        rolePermission.ModifiedOn = moment(rolePermission.ModifiedOn).format('YYYY-MM-DD HH:mm');
    });

    return this.settingsDLService.PutRolePermissions(rolePermissions)
      .map(res => { return res });
  }
  public UpdateUserRoles(userRoles: Array<UserRoleMap>) {
    //to fix serializaiton problem in server side
    userRoles.forEach(userRole => {
      if (userRole.CreatedOn)
        userRole.CreatedOn = moment(userRole.CreatedOn).format('YYYY-MM-DD HH:mm');
      if (userRole.ModifiedOn)
        userRole.ModifiedOn = moment(userRole.ModifiedOn).format('YYYY-MM-DD HH:mm');
    });

    return this.settingsDLService.PutUserRoles(userRoles)
      .map(res => { return res });
  }
  public UpdateReportingItemAndBillItemMapping(reportingItemsBillItem: Array<ReportingItemBillingItemMappingModel>) {
    return this.settingsDLService.PutReportingItemAndBillItemMapping(reportingItemsBillItem)
      .map(res => { return res });
  }

  //end: security

  //start: billing
  public GetBillingItemList(showInactiveItems: boolean = false) {
    return this.settingsDLService.GetBillingItemList(showInactiveItems)
      .map(res => { return res });
  }
  public GetReportingItemList() {
    return this.settingsDLService.GetReportingItemList()
      .map(res => { return res });
  }
  public AddBillingItem(item) {
    var temp = _.omit(item, ['BillingItemValidator']);
    return this.settingsDLService.PostBillingItem(temp)
      .map(res => { return res });
  }

  public AddReportingItem(item:ReportingItemsModel) {
    var temp = _.omit(item, ['ReportingItemsValidator']);
    return this.settingsDLService.PostReportingItem(temp)
      .map(res => { return res });
  }

  public UpdateBillingItem(item) {
    //to fix serializaiton problem in server side
    if (item.CreatedOn)
      item.CreatedOn = moment(item.CreatedOn).format('YYYY-MM-DD HH:mm:ss');
    if (item.ModifiedOn)
      item.ModifiedOn = moment(item.ModifiedOn).format('YYYY-MM-DD HH:mm:ss');
    var temp = _.omit(item, ['BillingItemValidator']);
    return this.settingsDLService.PutBillingItem(temp)
      .map(res => { return res });
  }

  public UpdateReportingItem(item:ReportingItemsModel) {
    var temp = _.omit(item, ['ReportingItemsValidator']);
    return this.settingsDLService.UpdateReportingItem(temp)
      .map(res => { return res });
  }

  //GET: Price Change History List by ItemId and ServiceDepartmentId
  public GetBillItemChangeHistoryList(itemId: number, serviceDepartmentId: number) {
    return this.settingsDLService.GetBillItemChangeHistoryList(itemId, serviceDepartmentId)
      .map(res => { return res });
  }
  //start: billingPackage
  public GetBillingPackageList() {
    return this.settingsDLService.GetBillingPackageList()
      .map(res => {
        var responseData = res;
        if (responseData.Results) {
          responseData.Results.forEach(billPackage => {
            billPackage.BillingItemsXML = JSON.parse(billPackage.BillingItemsXML);
          });
        }
        return responseData;
      });
  }
  public GetBillingServDepartments() {
    return this.billingDLService.GetServiceDepartments()
      .map((responseData) => {
        return responseData;
      });
  }
  public AddBillingPackage(billingPackage: BillingPackage, packageItemList: Array<BillingPackageItem>) {
    billingPackage.BillingItemsXML = this.ConvertPackageItemToJson(packageItemList);
    var temp = _.omit(billingPackage, ['BillingPackageValidator']);
    return this.settingsDLService.PostBillingPackage(temp)
      .map(res => {
        var responseData = res;
        if (responseData.Results)
          responseData.Results.BillingItemsXML = JSON.parse(responseData.Results.BillingItemsXML)
        return responseData;
      });
  }
  public ConvertPackageItemToJson(packageItemList: Array<BillingPackageItem>): string {
    var _itemList: any = [];
    packageItemList.forEach(item => {
      var _item = _.omit(item, ['Price', 'TaxPercent', 'Tax', 'Total', 'FilteredItemList', 'BillingPackageItemValidator']);
      _itemList.push(_item);
    });
    return JSON.stringify(_itemList);
  }

  public UpdateBillingPackage(billingPackage: BillingPackage, packageItemList: Array<BillingPackageItem>) {
    //to fix serializaiton problem in server side
    if (billingPackage.CreatedOn)
      billingPackage.CreatedOn = moment(billingPackage.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (billingPackage.ModifiedOn)
      billingPackage.ModifiedOn = moment(billingPackage.ModifiedOn).format('YYYY-MM-DD HH:mm');

    billingPackage.BillingItemsXML = this.ConvertPackageItemToJson(packageItemList);
    var temp = _.omit(billingPackage, ['BillingPackageValidator']);
    return this.settingsDLService.PutBillingPackage(temp)
      .map(res => {
        var responseData = res;
        if (responseData.Results)
          responseData.Results.BillingItemsXML = JSON.parse(responseData.Results.BillingItemsXML)
        return responseData;
      });
  }
  //end: billingPackage

  public UpdateAutoBillingItems(autoBillingItemList: BillingItemVM) {
    return this.settingsDLService.UpdateAutoBillingItems(autoBillingItemList)
      .map((responseData) => {
        return responseData;
      });
  }

  //end: billing

  //START: Lab

  //GET:Lab- LabTestGroup List
  GetLabTestGroupList() {
    return this.settingsDLService.GetLabTestGroupList()
      .map(res => { return res });
  }

  //POST:Lab-Add Lab Test Item to database
  public AddLabItem(labItem: LabTest) {
    var temp = _.omit(labItem, ['LabTestValidator']);
    return this.settingsDLService.PostLabItem(temp)
      .map(res => { return res });
  }

  //PUT:Lab-


  //END: Lab


  //Start Geolocation
  public GetCountries() {
    return this.settingsDLService.GetCountries()
      .map(res => { return res });
  }

  public AddCountry(CurrentCountry: Country) {
    var temp = _.omit(CurrentCountry, ['CountryValidator']);
    return this.settingsDLService.PostCountry(temp)
      .map(res => { return res });
  }

  public AddUpdateMunicipality(CurrMunicipality: Municipality) {
    var temp = _.omit(CurrMunicipality, ['MunicipalityValidator']);
    return this.settingsDLService.AddUpdateMunicipality(temp)
      .map(res => { return res });
  }

  public UpdateMunicipalityStatus(id: number) {
    return this.settingsDLService.UpdateMunicipalityStatus(id)
      .map(res => { return res });
  }

  public UpdateCountry(country: Country) {
    //to fix serializaiton problem in server side
    if (country.CreatedOn)
      country.CreatedOn = moment(country.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (country.ModifiedOn)
      country.ModifiedOn = moment(country.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(country, ['CountryValidator']);
    return this.settingsDLService.PutCountry(temp)
      .map(res => { return res });
  }

  public GetSubDivisions() {
    return this.settingsDLService.GetSubdivisions()
      .map(res => { return res });
  }

  public GetMunicipalities() {
    return this.settingsDLService.GetMunicipalities()
      .map(res => { return res });
  }

  public AddSubDivision(CurrentSubDivision: CountrySubdivision) {
    var temp = _.omit(CurrentSubDivision, ['SubdivisionValidator']);
    return this.settingsDLService.PostSubdivision(temp)
      .map(res => { return res });
  }

  public UpdateSubdivision(subdivision: CountrySubdivision) {
    //to fix serializaiton problem in server side
    if (subdivision.CreatedOn)
      subdivision.CreatedOn = moment(subdivision.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (subdivision.ModifiedOn)
      subdivision.ModifiedOn = moment(subdivision.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(subdivision, ['SubdivisionValidator']);
    return this.settingsDLService.PutSubdivision(temp)
      .map(res => { return res });
  }
  //End Geolocation


  //Start Clinical
  public GetReactions() {
    return this.settingsDLService.GetReactions()
      .map(res => { return res });
  }
  public AddReaction(CurrentReaction: Reaction) {
    var temp = _.omit(CurrentReaction, ['ReactionValidator']);
    return this.settingsDLService.PostReaction(temp)
      .map(res => { return res });
  }
  public UpdateReaction(CurrentReaction: Reaction) {
    if (CurrentReaction.CreatedOn)
      CurrentReaction.CreatedOn = moment(CurrentReaction.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (CurrentReaction.ModifiedOn)
      CurrentReaction.ModifiedOn = moment(CurrentReaction.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var temp = _.omit(CurrentReaction, ['ReactionValidator']);
    return this.settingsDLService.PutReaction(temp)
      .map(res => { return res });
  }

  //End Clinical

  public UpdateParameterValue(parameterToUpdate: CFGParameterModel) {
    let data = JSON.stringify(parameterToUpdate);
    return this.settingsDLService.UpdateParameterValue(data)
      .map(res => { return res });
  }

  //Start Tax
  public UpdateTaxInfo(taxDetail) {
    return this.settingsDLService.PutTaxInfo(taxDetail)
      .map(res => { return res });
  }

  //End Tax


  //Start ICD10 Groups
  public GetICDGroups() {
    return this.settingsDLService.GetICDGroups()
      .map(res => { return res });
  }
  //End ICD10 Groups

  public AddPrintExportConfiguration(data: PrintExportConfigurationModel) {
    var temp = _.omit(data, ['ConfigurationValidator', '', '']);
    return this.settingsDLService.PostConfiguration(temp)
      .map(res => { return res });
  }

  public UpdatePrintExportConfiguration(data: PrintExportConfigurationModel) {
    var temp = _.omit(data, ['ConfigurationValidator', '', '']);
    return this.settingsDLService.PutConfiguration(temp)
      .map(res => { return res });
  }
}
