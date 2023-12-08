import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AdtBedFeatureSchemePriceCategoryMap_DTO } from '../../adt/shared/DTOs/adt-bedfeature-scheme-pricecategory-map.dto';
import { BillingPackages_DTO } from '../../billing/shared/dto/billing-packages.dto';
import { IntakeOutputParameterListModel } from '../../clinical/shared/intake-output-parameterlist.model';
import { DanpheHTTPResponse } from "../../shared/common-models";
import { SchemeVsPriceCategoryModel } from '../billing/map-scheme-and-pricecategory/shared/MapSchemeVsPriceCategory.model';
import { MinimumDepositAmount_DTO } from './DTOs/minimum-deposit-amount.dto';

@Injectable()
export class SettingsDLService {

  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })

  };
  public jsonOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) { }

  //start: adt
  public GetBedList() {
    return this.http.get<any>("/api/ADTSettings/Beds");
  }
  public GetBedFeatureList() {
    return this.http.get<any>("/api/ADTSettings/BedFeatures");
  }
  public ADT_GetAutoBillingItemList() {
    return this.http.get<any>("/api/ADTSettings/AutoBillingItems");
  }

  public UpdateAutoBillingItems(autoBillingItemList) {
    let data = JSON.stringify(autoBillingItemList);
    return this.http.put<any>("/api/ADTSettings/AutoBillingItem", data, this.options);
  }

  public AddAutoBillingItems(autoBillingItem) {
    //let data = JSON.stringify(autoBillingItem);
    return this.http.post<any>("/api/ADTSettings/AdtAutoBillingItem", autoBillingItem, this.jsonOptions);
  }
  public UpdateAdtAutoBillingItems(autoBillingItem) {
    return this.http.put<any>("/api/ADTSettings/AdtAutoBillingItem", autoBillingItem, this.jsonOptions);
  }

  public GetSelectedBedFeatureMapList(bedId: number) {
    return this.http.get<any>("/api/ADTSettings/BedFeaturesMap?bedId=" + bedId);
  }
  public GetWardList() {
    return this.http.get<any>("/api/ADTSettings/Wards");
  }

  public GetSchemePriceCategoryMappedItems() {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/SchemePriceCategoryMappedItems");
  }


  public PostBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.post<any>("/api/ADTSettings/Bed", data, this.options);
  }
  public PostBedFeature(bedFeature) {
    // let data = JSON.stringify(bedFeature);
    return this.http.post<any>("/api/ADTSettings/BedFeature", bedFeature, this.jsonOptions);
  }
  public PostBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.post<any>("/api/ADTSettings/BedFeaturesMap", data, this.options);
  }

  public ADT_PostAutoAddBillItmValues() {
    return this.http.post<any>("/api/ADTSettings/AutoBillingItem", this.options);
  }
  public PostWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.post<any>("/api/ADTSettings/Ward", data, this.options);
  }

  public PostSchemePriceCategoryMapItems(SchemePriceCategoryMapList: SchemeVsPriceCategoryModel[]) {
    return this.http.post<DanpheHTTPResponse>(`/api/BillSettings/SchemePriceCategoryMap`, SchemePriceCategoryMapList, this.jsonOptions);
  }
  public UpdateSchemePriceCategoryMapItems(SchemePriceCategoryMap: SchemeVsPriceCategoryModel) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/SchemePriceCategoryMap`, SchemePriceCategoryMap, this.jsonOptions);
  }

  public PutBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.put<any>("/api/ADTSettings/Bed", data, this.options);
  }
  public PutBedFeature(bedFeature) {
    return this.http.put<any>("/api/ADTSettings/BedFeatures", bedFeature, this.jsonOptions);
  }
  public PutBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.put<any>("/api/ADTSettings/BedFeaturesMap", data, this.options);
  }
  public PutWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.put<any>("/api/ADTSettings/Ward", data, this.options);
  }


  //end: adt



  //start: department
  //add new service department
  public GetDepartments() {
    return this.http.get<DanpheHTTPResponse>("/api/Settings/Departments");
  }
  public GetStoreList() {
    return this.http.get<any>("/api/Settings/PharmacyStores");
  }
  public GetActiveStoreList() {
    return this.http.get<any>("/api/WardSupply/ActiveSubstores");
  }
  public GetStoreVerifiers(StoreId: number) {
    return this.http.get<any>("/api/Settings/GetStoreVerifiers/" + StoreId);
  }

  public GetCFGParameters() {
    return this.http.get<any>("/api/Settings/CoreCfgParameter");
  }

  public GetServiceDepartments() {
    return this.http.get<any>("/api/BillSettings/ServiceDepartments");
  }

  public GetServiceCategories() {
    return this.http.get<any>("/api/BillSettings/ServiceCategories");
  }

  public GetIntegrationNameList() {
    return this.http.get<any>("/api/Settings/IntegrationNames");
  }

  public GetOPDServiceItems() {
    return this.http.get<DanpheHTTPResponse>("/api/Settings/OPDServiceItems");
  }

  public PostDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/Settings/Department", data, this.options);
  }
  public PostStore(CurrentStore) {
    let data = JSON.stringify(CurrentStore);
    return this.http.post<any>("/api/Settings/PharmacyStore", data, this.options);
  }
  public PostServiceDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/BillSettings/ServiceDepartment", data, this.options);
  }

  public PutDepartment(department) {
    let data = JSON.stringify(department);
    return this.http.put<DanpheHTTPResponse>("/api/Settings/Department", department, this.options);
  }
  public PutStore(store) {
    let data = JSON.stringify(store);
    return this.http.put<any>("/api/Settings/PharmacyStore", data, this.options);
  }
  public PutStoreActiveStatus(storeId) {
    let data = JSON.stringify(storeId);
    return this.http.put<any>("/api/Settings/ActivateDeactivatePharmacyStore", data, this.options);
  }
  public PutServDepartment(servDepartment) {
    let data = JSON.stringify(servDepartment);
    return this.http.put<any>("/api/BillSettings/ServiceDepartment", servDepartment, this.options);
  }
  //end: department



  //start : radiology
  public GetImgTypes() {
    return this.http.get<any>("/api/RadiologySettings/ImagingTypes");
  }
  public GetImgItems() {
    return this.http.get<any>("/api/RadiologySettings/ImagingItems");
  }
  //Get Raddiology report  template list
  public GetRADReportTemplateList() {
    try {
      return this.http.get<any>("/api/RadiologySettings/ReportTemplates");
    } catch (exception) {
      throw exception;
    }
  }
  //Get template data by templateId
  GetRADReportTemplateById(templateId: number) {
    try {
      return this.http.get<any>(`/api/RadiologySettings/ReportTemplate?templateId=${templateId}`, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PostImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.post<any>("/api/RadiologySettings/ImagingItem", data, this.options);
  }

  public PostImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.post<any>("/api/RadiologySettings/ImagingType", data, this.options);
  }
  public PostRadiologyReportTemplate(radiologyReportTemplate) {
    try {
      let data = JSON.stringify(radiologyReportTemplate);
      return this.http.post<any>("/api/RadiologySettings/ReportTemplate", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PutImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.put<any>("/api/RadiologySettings/ImagingItem", data, this.options);
  }

  public PutImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.put<any>("/api/RadiologySettings/ImagingType", data, this.options);
  }

  //update radiology report template
  public PutRadiologyReportTemplate(radReportTemplate) {
    try {
      let data = JSON.stringify(radReportTemplate);
      return this.http.put<any>("/api/RadiologySettings/ReportTemplate", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }

  public GetRadSignatoryEmps() {
    return this.http.get<any>("/api/Master/Signatories?departmentName=radiology");
  }



  //end : radiology

  //start: employee
  public GetEmployeeList() {
    return this.http.get<any>("/api/EmployeeSettings/Employees");
  }
  public GetEmployeeRoleList() {
    return this.http.get<DanpheHTTPResponse>("/api/EmployeeSettings/EmployeeRoles");
  }
  public GetEmployeeTypeList(ShowIsActive: boolean) {
    return this.http.get<DanpheHTTPResponse>("/api/EmployeeSettings/EmployeeTypes?ShowIsActive=" + ShowIsActive);
  }
  public GetSignatoryImage(employeeId: number) {
    return this.http.get<any>("/api/EmployeeSettings/EmployeeSignatoryImage?employeeId=" + employeeId);
  }


  public PostEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.post<any>("/api/EmployeeSettings/Employees", data, this.options);
  }

  public PostEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.post<any>("/api/EmployeeSettings/EmployeeRoles", data, this.options);
  }
  public PostEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.post<any>("/api/EmployeeSettings/EmployeeTypes", data, this.options);
  }

  public PutEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.put<any>("/api/EmployeeSettings/Employees", data, this.options);
  }
  public PutEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.put<any>("/api/EmployeeSettings/EmployeeRoles", data, this.options);
  }
  public PutEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.put<any>("/api/EmployeeSettings/EmployeeTypes", data, this.options);
  }

  //end : employee


  //start: External-Referrals

  public GetExtReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings/ExternalReferrers");
  }

  public GetAllReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings/Referrers", this.options);
  }

  public GetBankList() {
    return this.http.get<any>("/api/Billing/Banks");
  }

  public GetPrinterSettingList() {
    return this.http.get<any>("/api/BillSettings/AllPrinterSettings");
  }

  public PostExtReferrer(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.post<any>("/api/EmployeeSettings/ExternalReferrer", data, this.options);
  }


  public PutExtReferrer(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.put<any>("/api/EmployeeSettings/ExternalReferrer", data, this.options);
  }
  //end: External-Referrals

  public PostPrinterSetting(printerSettingObj) {
    let data = JSON.stringify(printerSettingObj);
    return this.http.post<any>("/api/BillSettings/PrinterSetting", data, this.options);
  }

  public PutPrinterSetting(printerSettingObj) {
    let data = JSON.stringify(printerSettingObj);
    return this.http.put<any>("/api/BillSettings/PrinterSetting", data, this.options);
  }

  public PostBank(banksObj) {
    let data = JSON.stringify(banksObj);
    return this.http.post<any>("/api/Settings/Bank", data, this.options);
  }

  public PutBank(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.put<any>("/api/Settings/Bank", data, this.options);
  }
  //start: security
  public GetApplicationList() {
    return this.http.get<any>("/api/SecuritySettings/Applications");
  }
  public GetPermissionList() {
    return this.http.get<any>("/api/SecuritySettings/Permissions");
  }
  public GetRoleList() {
    return this.http.get<any>("/api/SecuritySettings/Roles");
  }
  public GetUserList() {
    return this.http.get<any>("/api/SecuritySettings/Users");
  }
  public GetSchemeList() {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/SchemesForBillingReport");
  }
  public GetRolePermissionList(roleId: number) {
    return this.http.get<any>("/api/SecuritySettings/RolePermissions?roleId=" + roleId);
  }
  public GetUserRoleList(userId: number) {
    return this.http.get<any>("/api/SecuritySettings/UserRoles?userId=" + userId);
  }
  public GetRouteList() {
    return this.http.get<any>("/api/SecuritySettings/Routes");
  }
  public PostUser(user) {
    let data = JSON.stringify(user);
    return this.http.post<any>("/api/SecuritySettings/User", data, this.options);
  }
  public PutUserPassword(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings/ResetPassword", data, this.options);
  }
  public PutUserIsActive(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings/UserIsActive", data, this.options);
  }
  public PostRole(role) {
    let data = JSON.stringify(role);
    return this.http.post<any>("/api/SecuritySettings/Role", data, this.options);
  }
  public PostRolePermissions(rolePermissions, roleId: number) {
    let data = JSON.stringify(rolePermissions);
    return this.http.post<any>("/api/SecuritySettings/RolePermissions?roleId=" + roleId, data, this.options);
  }
  public PostUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.post<any>("/api/SecuritySettings/UserRoles", data, this.options);
  }
  public PutUser(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings/User", data, this.options);
  }
  public PutRole(role) {
    let data = JSON.stringify(role);
    return this.http.put<any>("/api/SecuritySettings/Role", data, this.options);
  }
  public PutRolePermissions(rolePermissions) {
    let data = JSON.stringify(rolePermissions);
    return this.http.put<any>("/api/SecuritySettings/RolePermissions", data, this.options);
  }
  public PutUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.put<any>("/api/SecuritySettings/UserRoles", data, this.options);
  }
  //end: security

  //start: billing

  public GetDisBilItemPriceCFGByServDeptName(servDeptName: string) {
    return this.http.get<any>("/api/BillSettings/BillItemsByServiceDepartmentName?servDeptName=" + servDeptName);
  }
  public GetDisBilItemPriceCFGByIntegrationName(integrationName: string) {
    return this.http.get<any>("/api/BillSettings/BillItemsByIntegrationName?integrationName=" + integrationName);
  }

  public GetBillingItemList(showInactiveItems) {
    return this.http.get<any>("/api/BillSettings/BillingItemList?showInactiveItems=" + showInactiveItems);
  }

  public GetServiceItemList() {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/ServiceItemList");
  }


  public GetReportingItemList() {
    return this.http.get<any>("/api/BillSettings/ReportingItemsList");
  }

  public GetDynamicReportNameList() {
    return this.http.get<any>("/api/BillSettings/DynamicReportingNameList");
  }

  public PostReportingItemAndBillItemMapping(freeServiceBillItem) {
    let data = JSON.stringify(freeServiceBillItem);
    return this.http.post<any>("/api/BillSettings/BillingToReportingItemMapping", data, this.options);
  }

  public GetReportingItemBillItemList(reportingItemsId: number) {
    return this.http.get<any>("/api/BillSettings/BillingToReportingItemMapping?reportingItemsId=" + reportingItemsId);
  }

  // public PostBillingItem(item) {
  //   let data = JSON.stringify(item);
  //   return this.http.post<any>("/api/BillSettings/BillingItem", data, this.options);
  // }
  public PutReportingItemAndBillItemMapping(reportingItemsBillItem) {
    let data = JSON.stringify(reportingItemsBillItem);
    return this.http.put<any>("/api/BillSettings/BillingAndReportingItemMapping", data, this.options);
  }

  public PostReportingItem(item) {
    let data = JSON.stringify(item);
    return this.http.post<any>("/api/BillSettings/ReportingItem", data, this.options);
  }

  public PutBillingItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/BillSettings/BillingItem", data, this.options);
  }

  public UpdateReportingItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/BillSettings/ReportingItem", data, this.options);
  }

  //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId
  public GetBillItemChangeHistoryList(itemId: number, serviceDeptId: number) {
    return this.http.get<any>("/api/BillSettings/BillItemPriceChangeHistory?itemId=" + itemId + "&serviceDeptId=" + serviceDeptId);
  }

  public GetMembershipType() {
    return this.http.get<any>("/api/BillSettings/MembershipTypes", this.options);
  }
  public PutCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.put<any>("/api/BillSettings/CreditOrganization", data, this.options);
  }
  public PutMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.put<any>("/api/BillSettings/MembershipType", data, this.options);
  }
  //start: billing-package
  public GetBillingPackageList() {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/BillingPackageList");
  }

  public GetBillingPackageServiceItemList(BillingPackageId: number, PriceCategoryId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/BillSettings/BillingPackageServiceItemList?BillingPackageId=${BillingPackageId}&PriceCategoryId=${PriceCategoryId}`, this.options);
  }

  public PostBillingPackage(BillingPackage: BillingPackages_DTO) {
    return this.http.post<DanpheHTTPResponse>("/api/BillSettings/BillingPackage", BillingPackage, this.jsonOptions);
  }

  public ActivateDeactivateBillingPackage(BillingPackageId: number) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/ActivateDeactivateBillingPackage?BillingPackageId=${BillingPackageId}`, this.options);
  }

  public PutBillingPackage(BillingPackage: BillingPackages_DTO) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/BillingPackage`, BillingPackage, this.jsonOptions);
  }

  public PostCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.post<any>("/api/BillSettings/CreditOrganization", data, this.options);
  }
  public PostMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.post<any>("/api/BillSettings/MembershipType", data, this.options);
  }
  public PostBillScheme(billScheme) {
    let data = JSON.stringify(billScheme);
    return this.http.post<any>("/api/BillSettings/BillScheme", data, this.options);
  }

  public GetBilItemPriceDetails(itemId: number, servDeptName: string) {
    return this.http.get<any>("/api/BillSettings/BillingItems?servDeptName=" + servDeptName + "&itemId=" + itemId);
  }

  public GetBilItemPriceDetails_IntegrationName_ItemId(integrationName: string, itemId: number) {
    return this.http.get<any>("/api/BillSettings/BillingItemsByIntegrationName?integrationName=" + integrationName + "&itemId=" + itemId);
  }


  public GetCreditOrganizationList() {
    return this.http.get<any>("/api/BillSettings/CreditOrganizations");
  }
  //end: billing-package

  //end: billing

  //START: Lab
  //GET- Lab- LabTestGroup List
  GetLabTestGroupList() {
    //calling Lab Controller api get method
    return this.http.get<any>("/api/Lab?reqType=labTestGroupList", this.options)
  }
  //POST: Lab- LabTest Item Insert to dB
  public PostLabItem(labItem) {
    let data = JSON.stringify(labItem);
    return this.http.post<any>("/api/Settings/LabTest", data, this.options);
  }

  //END: Lab


  //start: Geolocation
  public GetCountries() {
    return this.http.get<any>("/api/Settings/Countries");
  }
  public PostCountry(Country) {
    let data = JSON.stringify(Country);
    return this.http.post<any>("/api/Settings/Country", data, this.options);
  }

  public AddUpdateMunicipality(municipality) {
    let data = JSON.stringify(municipality);
    return this.http.post<any>("/api/Settings/Municipality", data, this.options);
  }

  public UpdateMunicipalityStatus(municipalityId: number) {
    return this.http.put<any>("/api/Settings/MunicipalityStatus?municipalityId=" + municipalityId, this.options);
  }

  public PutCountry(country) {
    let data = JSON.stringify(country);
    return this.http.put<any>("/api/Settings/Country", country, this.options);
  }

  public GetSubdivisions() {
    return this.http.get<any>("/api/Settings/CountrySubDivisions");
  }

  public GetMunicipalities() {
    return this.http.get<any>("/api/Settings/Municipalities");
  }

  public PostSubdivision(SubDivision) {
    let data = JSON.stringify(SubDivision);
    return this.http.post<any>("/api/Settings/CountrySubDivision", data, this.options);
  }

  public PutSubdivision(subdivision) {
    return this.http.put<any>("/api/Settings/CountrySubDivision", subdivision, this.options);
  }
  //end: Geolocation

  //start: Clinical
  public GetReactions() {
    return this.http.get<any>("/api/Settings/Reactions");
  }
  public PostReaction(reaction) {
    let data = JSON.stringify(reaction);
    return this.http.post<any>("/api/Settings/Reaction", data, this.options);
  }
  public PutReaction(reaction) {
    return this.http.put<any>("/api/Settings/Reaction", reaction, this.options);

  }

  //end: Clinical

  public UpdateParameterValue(data: string) {
    return this.http.put<any>("/api/Settings/CoreCfgParameter", data, this.options);
  }

  //start: TaxInfo
  public PutTaxInfo(data: string) {
    return this.http.put<any>("/api/Parameters?reqType=bill-tax", data, this.options);
  }
  //end: TaxInfo

  //start: ICD10 Groups
  public GetICDGroups() {
    return this.http.get<any>("/api/Settings/GetICD10Groups");
  }

  public PostConfiguration(value) {
    let data = JSON.stringify(value);
    return this.http.post<any>("/api/Settings/PrintExportConfiguration", data, this.options);
  }

  public PutConfiguration(value) {
    let data = JSON.stringify(value);
    return this.http.put<any>("/api/Settings/PrintExportConfiguration", data, this.options);
  }

  public PutPaymentModeSetting(value) {
    let data = JSON.stringify(value);
    return this.http.put<any>("/api/Settings/UpdatePaymentModeSettings", data, this.options);
  }

  public PutServiceDepartmentStatus(value) {
    let data = JSON.stringify(value);
    return this.http.put<any>("/api/Settings/UpdateServiceDepartmentStatus", data, this.options);
  }
  public GetBilCfgItemsVsPriceCategory(BillItemPriceId: number) {

    return this.http.get<any>(`/api/BillSettings/BilCfgItemsVsPriceCategory?BillItemPriceId=${BillItemPriceId}`, this.options);
  }

  public GetServiceItemsVsPriceCategory(ServiceItemId: number) {

    return this.http.get<any>(`/api/BillSettings/ServiceItemsVsPriceCategory?ServiceItemId=${ServiceItemId}`, this.options);
  }
  public UpdateBillItemsPriceCategoryMap(value, PriceCategoryMapId) {
    let data = JSON.stringify(value);
    return this.http.put<any>(`/api/BillSettings/BillItemsPriceCategoryMap?PriceCategoryMapId=${PriceCategoryMapId}`, data, this.options);
  }
  public AddBillItemsPriceCategoryMap(value) {
    let data = JSON.stringify(value);
    return this.http.post<any>("/api/BillSettings/BillItemsPriceCategoryMap", data, this.options);
  }
  public AddPriceCategory(priceCategory) {
    return this.http.post<any>("/api/Settings/PriceCategory", priceCategory, this.jsonOptions);
  }

  public GetPriceCategory() {
    return this.http.get<any>("/api/Settings/PriceCategories");
  }
  public GetBillingSchemes() {
    return this.http.get<any>("/api/BillSettings/BillingSchemes");
  }
  public GetBillingSchemeById(schemeId: number) {
    return this.http.get<any>("/api/BillSettings/BillingScheme?schemeId=" + schemeId);
  }

  public GetPharmacyCreditOrganization() {
    return this.http.get<any>("/api/Settings/PharmacyCreditOrganization");
  }
  public GetBillingCreditOrganization() {
    return this.http.get<any>("/api/Settings/BillingCreditOrganization");
  }
  public UpdatePriceCategory(priceCategory) {
    return this.http.put<any>("/api/Settings/PriceCategory", priceCategory, this.jsonOptions);
  }
  public UpdateBillScheme(billSchemes) {
    return this.http.put<any>("/api/billSettings/BillingScheme", billSchemes, this.jsonOptions);
  }
  public GetPaymentModes() {
    return this.http.get<any>("/api/Settings/GetPaymentModes");
  }
  public PriceCategoryActivation(PriceCategoryId: number, IsActive: boolean) {
    return this.http.put<any>("/api/Settings/PriceCategoryActivation?PriceCategoryId=" + PriceCategoryId + "&IsActive=" + IsActive, this.options);
  }

  public PostServiceItems(billingserviceitem) {
    return this.http.post<any>("/api/BillSettings/ServiceItem", billingserviceitem, this.jsonOptions);
  }
  public BillSchemeActivation(SchemeId: number, IsActive: boolean) {
    return this.http.put<any>("/api/billSettings/BillSchemeActivation?SchemeId=" + SchemeId + "&IsActive=" + IsActive, this.options);
  }

  public PutServiceItem(item) {

    return this.http.put<DanpheHTTPResponse>("/api/BillSettings/ServiceItem", item, this.jsonOptions);
  }

  public AddBillServiceItemsPriceCategoryMap(value) {
    return this.http.post<DanpheHTTPResponse>("/api/BillSettings/BillServiceItemsPriceCategoryMap", value, this.jsonOptions);
  }

  public ActivateDeactivateServiceItem(item) {
    return this.http.put<DanpheHTTPResponse>("/api/BillSettings/ActivateDeactivateServiceItem", item, this.jsonOptions);
  }
  public UpdateBillServiceItemsPriceCategoryMap(value, PriceCategoryServiceItemMapId) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/BillServiceItemsPriceCategoryMap?PriceCategoryServiceItemMapId=${PriceCategoryServiceItemMapId}`, value, this.jsonOptions);
  }

  //Start: Sud-10March'23--For Billing Structural Changes---
  public GetBillingSchemesDtoList(serviceBillingContext: string) {
    return this.http.get<any>("/api/BillingMaster/Schemes?serviceBillingContext=" + serviceBillingContext, this.options);
  }

  //End: Sud-10March'23--For Billing Structural Changes---

  public GetServiceItemSchemeSettings(SchemeId: number) {
    return this.http.get<any>(`/api/BillingMaster/ServiceItemSettings?SchemeId=${SchemeId}`, this.options);
  }

  public PostServiceItemSchemeSettings(value) {
    return this.http.post<DanpheHTTPResponse>("/api/BillingMaster/ServiceItemSetting", value, this.jsonOptions);
  }
  public PostNursingWardSupplyMap(nursingWardSupply) {
    return this.http.post<DanpheHTTPResponse>("/api/Settings/NursingWardSupplyMap", nursingWardSupply, this.jsonOptions);
  }
  public GetSubstoreWardMap() {
    return this.http.get<any>(`/api/Settings/NursingWardSupplyMap`);
  }
  public GetSubstoreWardMapByWardId(WardId: number) {
    return this.http.get<any>(`/api/Settings/NursingWardSupplyMapByWardId?WardId=${WardId}`);
  }
  public UpdateSubstoreMapData(nursingWardSupply) {
    return this.http.put<DanpheHTTPResponse>("/api/Settings/NursingWardSupplyMap", nursingWardSupply, this.jsonOptions);
  }
  public GetAdditionalServiceItems() {
    return this.http.get<DanpheHTTPResponse>("/api/BillSettings/AdditionalServiceItems");
  }
  public PostAdditionalServiceItems(CurrentAdditionalServiceItem) {
    return this.http.post<DanpheHTTPResponse>(`/api/BillSettings/AdditionalServiceItem`, CurrentAdditionalServiceItem, this.jsonOptions);
  }
  public PutAdditionalServiceItems(CurrentAdditionalServiceItem) {
    return this.http.put<DanpheHTTPResponse>("/api/BillSettings/AdditionalServiceItem", CurrentAdditionalServiceItem, this.jsonOptions);
  }
  public PutActivateDeactivateAdditionalServiceItemStatus(additionalServiceItemId: number, isActive: boolean) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/ActivateDeactivateAdditionalServiceItem?additionalServiceItemId=${additionalServiceItemId}&isActive=${isActive}`, this.jsonOptions);
  }
  public GetBillingSchmes(): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/BillSettings/BillingSchemes`, this.jsonOptions);
  }
  public GetAutoBillingItemsList(): Observable<DanpheHTTPResponse> {
    return this.http.get<DanpheHTTPResponse>(`/api/ADTSettings/AdtAutoBillingItems`, this.jsonOptions);
  }
  public BillingItemActivation(AdtAutoBillingItemId: number, IsActive: boolean) {
    return this.http.put<any>("/api/ADTSettings/ActivateDeactivateAutoBillingItem?AdtAutoBillingItemId=" + AdtAutoBillingItemId + "&IsActive=" + IsActive, this.jsonOptions);
  }
  public ActivateDeactivateSchemePriceCategoryMapItem(PriceCategorySchemeMapId: number, Status: boolean) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/ActivateDeactivateSchemePriceCategoryMapItem?PriceCategorySchemeMapId=${PriceCategorySchemeMapId}&Status=${Status}`, this.jsonOptions);
  }

  public PostDepositHead(currentDepositHead) {
    return this.http.post<DanpheHTTPResponse>(`/api/BillSettings/DepositHead`, currentDepositHead, this.jsonOptions);
  }
  public PutDepositHead(currentDepositHead) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/DepositHead`, currentDepositHead, this.jsonOptions);
  }
  public PutActivateDeactivateDepositHeadStatus(depositHeadId: number) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/ActivateDeactivateDepositHead?depositHeadId=${depositHeadId}`, this.jsonOptions);
  }
  public SaveBedFeatureSchemePriceCategory(bedfeatureschemepricecategoryData) {
    return this.http.post<DanpheHTTPResponse>("/api/ADTSettings/BedFeatureSchemePriceCategoryMap", bedfeatureschemepricecategoryData, this.jsonOptions);
  }
  public GetBedFeatureSchemePriceCategoryMap() {
    return this.http.get<DanpheHTTPResponse>("/api/ADTSettings/BedFeatureSchemePriceCataegoryMap", this.jsonOptions)
  }
  public UpdateBedFeatureSchemePriceCategory(BedFeatureSchemePriceCategory: AdtBedFeatureSchemePriceCategoryMap_DTO) {
    return this.http.put<DanpheHTTPResponse>("/api/ADTSettings/BedFeatureSchemePriceCategoryMap", BedFeatureSchemePriceCategory, this.jsonOptions);
  }
  ActivateDeactivateBedFeatureSchemePriceCategoryMap(BedFeatureSchemePriceCategoryMapId: number, IsActive: boolean) {
    return this.http.put<DanpheHTTPResponse>(`/api/ADTSettings/ActivateDeactivateBedFeatureSchemePriceCategoryMap?BedFeatureSchemePriceCategoryMapId=${BedFeatureSchemePriceCategoryMapId}&IsActive=${IsActive}`, this.jsonOptions);
  }
  public ActivateDeactivateSubScheme(SubSchemeId: number) {
    return this.http.put<DanpheHTTPResponse>(`/api/BillSettings/ActivateDeactivateSubScheme?SubSchemeId=${SubSchemeId}`, this.jsonOptions);
  }

  public GetBillingSubSchemesBySchemeId(SchemeId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/BillSettings/BillingSubSchemesBySchemeId?SchemeId=${SchemeId}`);
  }
  public GetDepositHead() {
    return this.http.get<DanpheHTTPResponse>("/api/BillingDeposit/AllDepositHeads", this.options);
  }
  public SaveMinimumDepositAmount(MinimumDepositAmount) {
    return this.http.post<DanpheHTTPResponse>("/api/ADTSettings/MinimumDepositSetting", MinimumDepositAmount, this.jsonOptions);
  }
  public GetSettingDepositAmount() {
    return this.http.get<DanpheHTTPResponse>(`/api/ADTSettings/MinimumDepositSettings`, this.jsonOptions);
  }
  public UpdateSettingDepositAmount(SettingDepositAmountToUpdate: MinimumDepositAmount_DTO) {
    return this.http.put<DanpheHTTPResponse>("/api/ADTSettings/MinimumDepositSetting", SettingDepositAmountToUpdate, this.jsonOptions);
  }
  ActivateDeactivateSettingDepositAmount(AdtDepositSettingId: number) {
    return this.http.put<DanpheHTTPResponse>(`/api/ADTSettings/ActivateDeactivateMinimumDepositSetting?AdtDepositSettingId=${AdtDepositSettingId}`, this.jsonOptions);
  }
  public GetTemplateTypeList() {
    return this.http.get<DanpheHTTPResponse>("/api/DynamicTemplate/TemplateTypes");
  }
  public GetTemplateList() {
    return this.http.get<DanpheHTTPResponse>("/api/DynamicTemplate/Templates");
  }
  public PutTemplateSettings(templateId) {
    return this.http.put<DanpheHTTPResponse>(`/api/DynamicTemplate/ActivateDeactivate?templateId=${templateId}`, this.options);
  }
  public GetFieldMasterList(templateTypeId: number = null) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/FieldMaster?templateTypeId=${templateTypeId}`);
  }
  public GetTemplateType() {
    return this.http.get<DanpheHTTPResponse>("/api/DynamicTemplate/TemplateTypes");
  }
  AddNewTemplate(TemplateData) {
    let data = JSON.stringify(TemplateData);
    return this.http.post<DanpheHTTPResponse>("/api/DynamicTemplate/AddNewTemplate", data, this.jsonOptions);
  }
  public PutDynTemplate(dynTemplate) {
    try {
      let data = JSON.stringify(dynTemplate);
      return this.http.put<DanpheHTTPResponse>("/api/DynamicTemplate/UpdateDynamicTemplate", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public GetDynTemplateDataById(templateId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/GetSelectedTemplateData?templateId=${templateId}`);
  }
  public GetFieldMasterByTemplateId(templateId: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/DynamicTemplate/GetFieldMasterByTemplateId?templateId=${templateId}`);
  }
  AddUpdateFieldMapping(selectedFields) {
    let data = JSON.stringify(selectedFields);
    return this.http.post<DanpheHTTPResponse>("/api/DynamicTemplate/AddUpdateFieldMapping", data, this.jsonOptions);
  }
  public GetIntakeOutputTypeList() {
    return this.http.get<any>("/api/Settings/IntakeOutputType", this.options);
  }
  public PostIntakeOutputVariable(data: IntakeOutputParameterListModel) {
    let value = JSON.stringify(data);
    return this.http.post<any>("/api/Settings/PostIntakeOutputVariable", value, this.jsonOptions)
  }
  public GetIntakeOutputTypeListForGrid() {
    return this.http.get<any>("/api/Settings/IntakeOutputTypeForGrid", this.options);
  }
  public PutActivateDeactivateVariableStatus(selectedIntakeOutputData) {
    let intakeOutputVariable = JSON.stringify(selectedIntakeOutputData);
    return this.http.put<any>("/api/Settings/activate-deactivate-intakeoutput-variables", intakeOutputVariable, this.jsonOptions);
  }
  public PutIntakeOutputVariable(data: IntakeOutputParameterListModel) {
    let value = JSON.stringify(data);
    return this.http.put<any>("/api/Settings/UpdateIntakeOutputVariable", value, this.jsonOptions)
  }
}
