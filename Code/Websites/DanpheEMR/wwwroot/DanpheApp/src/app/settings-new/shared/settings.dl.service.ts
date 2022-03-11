import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SettingsDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) { }

  //start: adt
  public GetBedList() {
    return this.http.get<any>("/api/ADTSettings?reqType=adt-bed");
  }
  public GetBedFeatureList() {
    return this.http.get<any>("/api/ADTSettings?reqType=get-adt-bedFeature");
  }
  public ADT_GetAutoBillingItemList() {
    return this.http.get<any>("/api/ADTSettings?reqType=adt-get-auto-billing-items");
  }

  public UpdateAutoBillingItems(autoBillingItemList) {
    let data = JSON.stringify(autoBillingItemList);
    return this.http.put<any>("/api/ADTSettings?reqType=adt-put-auto-billing-items", data, this.options);
  }

  public GetSelectedBedFeatureMapList(bedId: number) {
    return this.http.get<any>("/api/ADTSettings?reqType=adt-map-bedFeatures&bedId=" + bedId);
  }
  public GetWardList() {
    return this.http.get<any>("/api/ADTSettings?reqType=adt-ward");
  }


  public PostBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.post<any>("/api/ADTSettings?reqType=adt-bed", data, this.options);
  }
  public PostBedFeature(bedFeature) {
    let data = JSON.stringify(bedFeature);
    return this.http.post<any>("/api/ADTSettings?reqType=post-adt-bedFeature", data, this.options);
  }
  public PostBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.post<any>("/api/ADTSettings?reqType=adt-map-bedFeatures", data, this.options);
  }

  public ADT_PostAutoAddBillItmValues() {
    return this.http.post<any>("/api/ADTSettings?reqType=adt-post-auto-billitems-param", this.options);
  }
  public PostWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.post<any>("/api/ADTSettings?reqType=adt-ward", data, this.options);
  }


  public PutBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.put<any>("/api/ADTSettings?reqType=adt-bed", data, this.options);
  }
  public PutBedFeature(bedFeature) {
    let data = JSON.stringify(bedFeature);
    return this.http.put<any>("/api/ADTSettings?reqType=put-adt-bedFeature", data, this.options);
  }
  public PutBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.put<any>("/api/ADTSettings?reqType=adt-map-bedFeatures", data, this.options);
  }
  public PutWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.put<any>("/api/ADTSettings?reqType=adt-ward", data, this.options);
  }


  //end: adt



  //start: department
  //add new service department
  public GetDepartments() {
    return this.http.get<any>("/api/Settings?reqType=departments");
  }
  public GetStoreList() {
    return this.http.get<any>("/api/Settings?reqType=phrm-store");
  }
  public GetActiveStoreList() {
    return this.http.get<any>("/api/WardSupply?reqType=active-substore-list");
  }
  public GetStoreVerifiers(StoreId: number) {
    return this.http.get<any>("/api/Settings/GetStoreVerifiers/" + StoreId);
  }

  public GetCFGParameters() {
    return this.http.get<any>("/api/Settings?reqType=cfgparameters");
  }

  public GetServiceDepartments() {
    return this.http.get<any>("/api/BillSettings?reqType=get-service-departments");
  }

  public GetIntegrationNameList() {
    return this.http.get<any>("/api/Settings?reqType=integrationName");
  }

  public PostDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/Settings?reqType=department", data, this.options);
  }
  public PostStore(CurrentStore) {
    let data = JSON.stringify(CurrentStore);
    return this.http.post<any>("/api/Settings?reqType=store", data, this.options);
  }
  public PostServiceDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/BillSettings?reqType=post-service-department", data, this.options);
  }

  public PutDepartment(department) {
    let data = JSON.stringify(department);
    return this.http.put<any>("/api/Settings?reqType=department", department, this.options);
  }
  public PutStore(store) {
    let data = JSON.stringify(store);
    return this.http.put<any>("/api/Settings?reqType=store", data, this.options);
  }
  public PutStoreActiveStatus(storeId) {
    let data = JSON.stringify(storeId);
    return this.http.put<any>("/api/Settings?reqType=storeActivation", data, this.options);
  }
  public PutServDepartment(servDepartment) {
    let data = JSON.stringify(servDepartment);
    return this.http.put<any>("/api/BillSettings?reqType=put-service-department", servDepartment, this.options);
  }
  //end: department



  //start : radiology
  public GetImgTypes() {
    return this.http.get<any>("/api/RadiologySettings?reqType=get-rad-imaging-type");
  }
  public GetImgItems() {
    return this.http.get<any>("/api/RadiologySettings?reqType=get-rad-imaging-item");
  }
  //Get Raddiology report  template list
  public GetRADReportTemplateList() {
    try {
      return this.http.get<any>("/api/RadiologySettings?reqType=get-rad-report-template");
    } catch (exception) {
      throw exception;
    }
  }
  //Get template data by templateId
  GetRADReportTemplateById(templateId: number) {
    try {
      return this.http.get<any>("/api/RadiologySettings?reqType=get-rad-report-template-byid&templateId=" + templateId, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PostImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.post<any>("/api/RadiologySettings?reqType=post-rad-imaging-item", data, this.options);
  }

  public PostImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.post<any>("/api/RadiologySettings?reqType=post-rad-imaging-type", data, this.options);
  }
  public PostRadiologyReportTemplate(radiologyReportTemplate) {
    try {
      let data = JSON.stringify(radiologyReportTemplate);
      return this.http.post<any>("/api/RadiologySettings?reqType=post-rad-report-template", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PutImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.put<any>("/api/RadiologySettings?reqType=put-rad-imaging-item", data, this.options);
  }

  public PutImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.put<any>("/api/RadiologySettings?reqType=put-rad-imaging-type", data, this.options);
  }

  //update radiology report template
  public PutRadiologyReportTemplate(radReportTemplate) {
    try {
      let data = JSON.stringify(radReportTemplate);
      return this.http.put<any>("/api/RadiologySettings?reqType=put-rad-report-template", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }

  public GetRadSignatoryEmps() {
    return this.http.get<any>("/api/Master?type=signatories&departmentName=radiology");
  }



  //end : radiology

  //start: employee
  public GetEmployeeList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-employee");
  }
  public GetEmployeeRoleList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-employee-role");
  }
  public GetEmployeeTypeList(ShowIsActive: boolean) {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-employee-type&ShowIsActive=" + ShowIsActive);
  }
  public GetSignatoryImage(employeeId: number) {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-emp-signatory-image&employeeId=" + employeeId);
  }


  public PostEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.post<any>("/api/EmployeeSettings?reqType=post-employee", data, this.options);
  }

  public PostEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.post<any>("/api/EmployeeSettings?reqType=post-employee-role", data, this.options);
  }
  public PostEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.post<any>("/api/EmployeeSettings?reqType=post-employee-type", data, this.options);
  }

  public PutEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.put<any>("/api/EmployeeSettings?reqType=put-employee", data, this.options);
  }
  public PutEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.put<any>("/api/EmployeeSettings?reqType=put-employee-role", data, this.options);
  }
  public PutEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.put<any>("/api/EmployeeSettings?reqType=put-employee-type", data, this.options);
  }

  //end : employee


  //start: External-Referrals

  public GetExtReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-ext-referrers");
  }

  public GetAllReferrerList() {
    return this.http.get<any>("/api/EmployeeSettings?reqType=get-all-referrer-list", this.options);
  }

  public GetBankList() {
    return this.http.get<any>("/api/Billing?reqType=get-bank-list");
  }

  public GetPrinterSettingList() {
    return this.http.get<any>("/api/BillSettings?reqType=get-all-printer-settings");
  }

  public PostExtReferrer(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.post<any>("/api/EmployeeSettings?reqType=post-ext-referrer", data, this.options);
  }


  public PutExtReferrer(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.put<any>("/api/EmployeeSettings?reqType=put-ext-referrer", data, this.options);
  }
  //end: External-Referrals

  public PostPrinterSetting(printerSettingObj) {
    let data = JSON.stringify(printerSettingObj);
    return this.http.post<any>("/api/BillSettings?reqType=post-printer-setting", data, this.options);
  }

  public PutPrinterSetting(printerSettingObj) {
    let data = JSON.stringify(printerSettingObj);
    return this.http.put<any>("/api/BillSettings?reqType=put-printer-setting", data, this.options);
  }

  public PostBank(banksObj) {
    let data = JSON.stringify(banksObj);
    return this.http.post<any>("/api/Settings?reqType=post-bank", data, this.options);
  }

  public PutBank(extRefObj) {
    let data = JSON.stringify(extRefObj);
    return this.http.put<any>("/api/Settings?reqType=put-bank", data, this.options);
  }
  //start: security
  public GetApplicationList() {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-application");
  }
  public GetPermissionList() {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-permission");
  }
  public GetRoleList() {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-role");
  }
  public GetUserList() {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-user");
  }
  public GetDiscountScheme() {
    return this.http.get<any>("/api/BillSettings?reqType=get-membership-types");
  }
  public GetRolePermissionList(roleId: number) {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-rolepermission&roleId=" + roleId);
  }
  public GetUserRoleList(userId: number) {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-userrole&userId=" + userId);
  }
  public GetRouteList() {
    return this.http.get<any>("/api/SecuritySettings?reqType=get-security-route");
  }
  public PostUser(user) {
    let data = JSON.stringify(user);
    return this.http.post<any>("/api/SecuritySettings?reqType=post-security-user", data, this.options);
  }
  public PutUserPassword(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-reset-password", data, this.options);
  }
  public PutUserIsActive(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-user-isactive", data, this.options);
  }
  public PostRole(role) {
    let data = JSON.stringify(role);
    return this.http.post<any>("/api/SecuritySettings?reqType=post-security-role", data, this.options);
  }
  public PostRolePermissions(rolePermissions, roleId: number) {
    let data = JSON.stringify(rolePermissions);
    return this.http.post<any>("/api/SecuritySettings?reqType=post-security-rolePermission&roleId=" + roleId, data, this.options);
  }
  public PostUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.post<any>("/api/SecuritySettings?reqType=post-security-userRole", data, this.options);
  }
  public PutUser(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-user", data, this.options);
  }
  public PutRole(role) {
    let data = JSON.stringify(role);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-role", data, this.options);
  }
  public PutRolePermissions(rolePermissions) {
    let data = JSON.stringify(rolePermissions);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-rolePermission", data, this.options);
  }
  public PutUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.put<any>("/api/SecuritySettings?reqType=put-security-userRole", data, this.options);
  }
  //end: security

  //start: billing

  public GetDisBilItemPriceCFGByServDeptName(servDeptName: string) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-items-by-servdeptname&servDeptName=" + servDeptName);
  }
  public GetDisBilItemPriceCFGByIntegrationName(integrationName: string) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-items-by-integrationName&integrationName=" + integrationName);
  }

  public GetBillingItemList(showInactiveItems) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-itemList&showInactiveItems=" + showInactiveItems);
  }

  public GetReportingItemList() {
    return this.http.get<any>("/api/BillSettings?reqType=get-reporting-items-List");
  }

  public GetDynamicReportNameList() {
    return this.http.get<any>("/api/BillSettings?reqType=get-dynamic-reporting-name-List");
  }

  public PostReportingItemAndBillItemMapping(freeServiceBillItem) {
    let data = JSON.stringify(freeServiceBillItem);
    return this.http.post<any>("/api/BillSettings?reqType=post-security-reportingItemBillItem", data, this.options);
  }

  public GetReportingItemBillItemList(reportingItemsId: number) {
    return this.http.get<any>("/api/BillSettings?reqType=get-security-reportingItemBillItem&reportingItemsId=" + reportingItemsId);
  }
  
  public PostBillingItem(item) {
    let data = JSON.stringify(item);
    return this.http.post<any>("/api/BillSettings?reqType=post-billing-item", data, this.options);
  }
  public PutReportingItemAndBillItemMapping(reportingItemsBillItem) {
    let data = JSON.stringify(reportingItemsBillItem);
    return this.http.put<any>("/api/BillSettings?reqType=put-security-reportingItemBillItem", data, this.options);
  }

  public PostReportingItem(item) {
    let data = JSON.stringify(item);
    return this.http.post<any>("/api/BillSettings?reqType=post-reportingItem", data, this.options);
  }

  public PutBillingItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/BillSettings?reqType=put-billing-item", data, this.options);
  }

  public UpdateReportingItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/BillSettings?reqType=put-reportingItem", data, this.options);
  }

  //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId
  public GetBillItemChangeHistoryList(itemId: number, serviceDeptId: number) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billItemPriceChangeHistory&itemId=" + itemId + "&serviceDeptId=" + serviceDeptId);
  }

  public GetMembershipType() {
    return this.http.get<any>("/api/BillSettings?reqType=get-membership-types", this.options);
  }
  public PutCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.put<any>("/api/BillSettings?reqType=put-credit-organization", data, this.options);
  }
  public PutMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.put<any>("/api/BillSettings?reqType=put-membership-type", data, this.options);
  }
  //start: billing-package
  public GetBillingPackageList() {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-packageList");
  }

  public PostBillingPackage(pkgItem) {
    let data = JSON.stringify(pkgItem);
    return this.http.post<any>("/api/BillSettings?reqType=post-billing-package", data, this.options);
  }

  public PutBillingPackage(pkgItem) {
    let data = JSON.stringify(pkgItem);
    return this.http.put<any>("/api/BillSettings?reqType=put-billing-package", data, this.options);
  }

  public PostCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.post<any>("/api/BillSettings?reqType=post-credit-organization", data, this.options);
  }
  public PostMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.post<any>("/api/BillSettings?reqType=post-membership-type", data, this.options);
  }

  public GetBilItemPriceDetails(itemId: number, servDeptName: string) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-items-by-servdeptitemid&servDeptName=" + servDeptName + "&itemId=" + itemId);
  }

  public GetBilItemPriceDetails_IntegrationName_ItemId(integrationName: string, itemId: number) {
    return this.http.get<any>("/api/BillSettings?reqType=get-billing-items-by-integrationName-itemid&integrationName=" + integrationName + "&itemId=" + itemId);
  }


  public GetCreditOrganizationList() {
    return this.http.get<any>("/api/BillSettings?reqType=get-credit-organization");
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
    return this.http.post<any>("/api/Settings?reqType=lab-item", data, this.options);
  }

  //END: Lab


  //start: Geolocation
  public GetCountries() {
    return this.http.get<any>("/api/Settings?reqType=countries");
  }
  public PostCountry(Country) {
    let data = JSON.stringify(Country);
    return this.http.post<any>("/api/Settings?reqType=country", data, this.options);
  }

  public AddUpdateMunicipality(municipality) {
    let data = JSON.stringify(municipality);
    return this.http.post<any>("/api/Settings?reqType=municipality", data, this.options);
  }

  public UpdateMunicipalityStatus(municipalityId: number) {
    return this.http.put<any>("/api/Settings?reqType=municipalityStatusUpdate&municipalityId=" + municipalityId, this.options);
  }

  public PutCountry(country) {
    let data = JSON.stringify(country);
    return this.http.put<any>("/api/Settings?reqType=country", country, this.options);
  }

  public GetSubdivisions() {
    return this.http.get<any>("/api/Settings?reqType=subdivisions");
  }

  public GetMunicipalities() {
    return this.http.get<any>("/api/Settings?reqType=municipalities");
  }

  public PostSubdivision(SubDivision) {
    let data = JSON.stringify(SubDivision);
    return this.http.post<any>("/api/Settings?reqType=subdivision", data, this.options);
  }

  public PutSubdivision(subdivision) {
    return this.http.put<any>("/api/Settings?reqType=subdivision", subdivision, this.options);
  }
  //end: Geolocation

  //start: Clinical
  public GetReactions() {
    return this.http.get<any>("/api/Settings?reqType=reactions");
  }
  public PostReaction(reaction) {
    let data = JSON.stringify(reaction);
    return this.http.post<any>("/api/Settings?reqType=reaction", data, this.options);
  }
  public PutReaction(reaction) {
    return this.http.put<any>("/api/Settings?reqType=reaction", reaction, this.options);

  }

  //end: Clinical

  public UpdateParameterValue(data: string) {
    return this.http.put<any>("/api/Settings?reqType=update-parameter", data, this.options);
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
    return this.http.post<any>("/api/Settings?reqType=post-print-export-configuration", data, this.options);
  }

  public PutConfiguration(value) {
    let data = JSON.stringify(value);
    return this.http.put<any>("/api/Settings?reqType=put-print-export-configuration", data, this.options);
  }

}
