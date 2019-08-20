import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Bed } from "../../admission/shared/bed.model";

@Injectable()
export class SettingsDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) { }

  //start: adt
  public GetBedList() {
    return this.http.get<any>("/api/Settings?reqType=adt-bed");
  }
  public GetBedFeatureList() {
    return this.http.get<any>("/api/Settings?reqType=adt-bedFeature");
  }
  public GetAutoBillingItemList() {
    return this.http.get<any>("/api/Settings?reqType=adt-auto-billing-items");
  }

  public GetSelectedBedFeatureMapList(bedId: number) {
    return this.http.get<any>("/api/Settings?reqType=adt-map-bedFeatures&bedId=" + bedId);
  }
  public GetWardList() {
    return this.http.get<any>("/api/Settings?reqType=adt-ward");
  }

  public GetMembershipType() {
    return this.http.get<any>("/api/Settings?reqType=membership-types", this.options);
  }
  public PostBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.post<any>("/api/Settings?reqType=adt-bed", data, this.options);
  }
  public PostBedFeature(bedFeature) {
    let data = JSON.stringify(bedFeature);
    return this.http.post<any>("/api/Settings?reqType=adt-bedFeature", data, this.options);
  }
  public PostBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.post<any>("/api/Settings?reqType=adt-map-bedFeatures", data, this.options);
  }
  public Postparametervalue() {
    return this.http.post<any>("/api/Settings?reqType=post-parameter-value", this.options);
  }
  public PostWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.post<any>("/api/Settings?reqType=adt-ward", data, this.options);
  }


  public PutBed(CurrentBedMain) {
    let data = JSON.stringify(CurrentBedMain);
    return this.http.put<any>("/api/Settings?reqType=adt-bed", data, this.options);
  }
  public PutBedFeature(bedFeature) {
    let data = JSON.stringify(bedFeature);
    return this.http.put<any>("/api/Settings?reqType=adt-bedFeature", data, this.options);
  }
  public PutBedFeaturesMap(bedFeaturesMap) {
    let data = JSON.stringify(bedFeaturesMap);
    return this.http.put<any>("/api/Settings?reqType=adt-map-bedFeatures", data, this.options);
  }
  public PutWard(CurrentWard) {
    let data = JSON.stringify(CurrentWard);
    return this.http.put<any>("/api/Settings?reqType=adt-ward", data, this.options);
  }
  //end: adt

  //start: department
  //add new service department
  public GetDepartments() {
    return this.http.get<any>("/api/Settings?reqType=departments");
  }

  public GetCFGParameters() {
    return this.http.get<any>("/api/Settings?reqType=cfgparameters");
  }

  public GetServiceDepartments() {
    return this.http.get<any>("/api/Settings?reqType=service-departments");
  }

  public GetIntegrationName() {
    return this.http.get<any>("/api/Settings?reqType=integrationName");
  }

  public PostDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/Settings?reqType=department", data, this.options);
  }
  public PostServiceDepartment(CurrentServiceDepartment) {
    let data = JSON.stringify(CurrentServiceDepartment);
    return this.http.post<any>("/api/Settings?reqType=servicedepartment", data, this.options);
  }

  public PutDepartment(department) {
    let data = JSON.stringify(department);
    return this.http.put<any>("/api/Settings?reqType=department", department, this.options);
  }
  public PutServDepartment(servDepartment) {
    let data = JSON.stringify(servDepartment);
    return this.http.put<any>("/api/Settings?reqType=service-department", servDepartment, this.options);
  }
  //end: department



  //start : radiology
  public GetImgTypes() {
    return this.http.get<any>("/api/Settings?reqType=rad-imaging-type");
  }
  public GetImgItems() {
    return this.http.get<any>("/api/Settings?reqType=rad-imaging-item");
  }
  //Get Raddiology report  template list
  public GetRADReportTemplateList() {
    try {
      return this.http.get<any>("/api/Settings?reqType=rad-report-template");
    } catch (exception) {
      throw exception;
    }
  }
  //Get template data by templateId
  GetRADReportTemplateById(templateId: number) {
    try {
      return this.http.get<any>("/api/Settings?reqType=rad-report-template-byid&templateId=" + templateId, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PostImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.post<any>("/api/Settings?reqType=rad-imaging-item", data, this.options);
  }

  public PostImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.post<any>("/api/Settings?reqType=rad-imaging-type", data, this.options);
  }
  public PostRadiologyReportTemplate(radiologyReportTemplate) {
    try {
      let data = JSON.stringify(radiologyReportTemplate);
      return this.http.post<any>("/api/Settings?reqType=rad-report-template", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  public PutImagingItem(imagingItem) {
    let data = JSON.stringify(imagingItem);
    return this.http.put<any>("/api/Settings?reqType=rad-imaging-item", data, this.options);
  }

  public PutImagingType(imagingType) {
    let data = JSON.stringify(imagingType);
    return this.http.put<any>("/api/Settings?reqType=rad-imaging-type", data, this.options);
  }

  //update radiology report template
  public PutRadiologyReportTemplate(radReportTemplate) {
    try {
      let data = JSON.stringify(radReportTemplate);
      return this.http.put<any>("/api/Settings?reqType=rad-report-template", data, this.options);
    } catch (exception) {
      throw exception;
    }
  }
  //end : radiology

  //start: employee
  public GetEmployeeList() {
    return this.http.get<any>("/api/Settings?reqType=employee");
  }
  public GetEmployeeRoleList() {
    return this.http.get<any>("/api/Settings?reqType=employee-role");
  }
  public GetEmployeeTypeList(ShowIsActive: boolean) {
    return this.http.get<any>("/api/Settings?reqType=employee-type&ShowIsActive=" + ShowIsActive);
  }
  public GetDisBilItemPriceCFGByServDeptName(servDeptName: string) {
    return this.http.get<any>("/api/Settings?reqType=billing-items-by-servdeptname&servDeptName=" + servDeptName);
  }
  public GetBilItemPriceDetails(itemId: number, servDeptName: string) {
    return this.http.get<any>("/api/Settings?reqType=billing-items-by-servdeptitemid&servDeptName=" + servDeptName + "&itemId=" + itemId);
  }
  public GetCreditOrganizationList() {
    return this.http.get<any>("/api/Settings?reqType=get-credit-organization");
  }
  public GetSignatoryImage(employeeId: number) {
    return this.http.get<any>("/api/Settings?reqType=signatory-image&employeeId=" + employeeId);
  }
  public PostEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.post<any>("/api/Settings?reqType=employee", data, this.options);
  }

  public PostEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.post<any>("/api/Settings?reqType=employee-role", data, this.options);
  }
  public PostEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.post<any>("/api/Settings?reqType=employee-type", data, this.options);
  }
  public PostCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.post<any>("/api/Settings?reqType=post-credit-organization", data, this.options);
  }
  public PostMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.post<any>("/api/Settings?reqType=post-membership", data, this.options);
  }
  public PutEmployee(employee) {
    let data = JSON.stringify(employee);
    return this.http.put<any>("/api/Settings?reqType=employee", data, this.options);
  }
  public PutEmployeeRole(employeeRole) {
    let data = JSON.stringify(employeeRole);
    return this.http.put<any>("/api/Settings?reqType=employee-role", data, this.options);
  }
  public PutEmployeeType(employeeType) {
    let data = JSON.stringify(employeeType);
    return this.http.put<any>("/api/Settings?reqType=employee-type", data, this.options);
  }
  //end : employee

  //start: billing
  public PutCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.put<any>("/api/Settings?reqType=put-credit-organization", data, this.options);
  }
  public PutMembership(membership) {
    let data = JSON.stringify(membership);
    return this.http.put<any>("/api/Settings?reqType=put-membership", data, this.options);
  }
  //end: billing

  //start: security
  public GetApplicationList() {
    return this.http.get<any>("/api/Settings?reqType=security-application");
  }
  public GetPermissionList() {
    return this.http.get<any>("/api/Settings?reqType=security-permission");
  }
  public GetRoleList() {
    return this.http.get<any>("/api/Settings?reqType=security-role");
  }
  public GetUserList() {
    return this.http.get<any>("/api/Settings?reqType=security-user");
  }
  public GetRolePermissionList(roleId: number) {
    return this.http.get<any>("/api/Settings?reqType=security-rolepermission&roleId=" + roleId);
  }
  public GetUserRoleList(userId: number) {
    return this.http.get<any>("/api/Settings?reqType=security-userrole&userId=" + userId);
  }
  public GetRouteList() {
    return this.http.get<any>("/api/Settings?reqType=security-route");
  }
  public PostUser(user) {
    let data = JSON.stringify(user);
    return this.http.post<any>("/api/Settings?reqType=security-user", data, this.options);
  }
  public PutUserPassword(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/Settings?reqType=security-reset-password", data, this.options);
  }
  public PutUserIsActive(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/Settings?reqType=security-user-isactive", data, this.options);
  }
  public PostRole(role) {
    let data = JSON.stringify(role);
    return this.http.post<any>("/api/Settings?reqType=security-role", data, this.options);
  }
  public PostRolePermissions(rolePermissions) {
    let data = JSON.stringify(rolePermissions);
    return this.http.post<any>("/api/Settings?reqType=security-rolePermission", data, this.options);
  }
  public PostUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.post<any>("/api/Settings?reqType=security-userRole", data, this.options);
  }
  public PutUser(user) {
    let data = JSON.stringify(user);
    return this.http.put<any>("/api/Settings?reqType=security-user", data, this.options);
  }
  public PutRole(role) {
    let data = JSON.stringify(role);
    return this.http.put<any>("/api/Settings?reqType=security-role", data, this.options);
  }
  public PutRolePermissions(rolePermissions) {
    let data = JSON.stringify(rolePermissions);
    return this.http.put<any>("/api/Settings?reqType=security-rolePermission", data, this.options);
  }
  public PutUserRoles(userRoles) {
    let data = JSON.stringify(userRoles);
    return this.http.put<any>("/api/Settings?reqType=security-userRole", data, this.options);
  }
  //end: security

  //start: billing
  public GetBillingItemList(showInactiveItems) {
    return this.http.get<any>("/api/Settings?reqType=billing-itemList&showInactiveItems=" + showInactiveItems);
  }

  public PostBillingItem(item) {
    let data = JSON.stringify(item);
    return this.http.post<any>("/api/Settings?reqType=billing-item", data, this.options);
  }

  public PutBillingItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/Settings?reqType=billing-item", data, this.options);
  }

  //GET: Price Change History List of Bill Item by ItemId and ServiceDepartmentId
  public GetBillItemChangeHistoryList(itemId: number, serviceDeptId: number) {
    return this.http.get<any>("/api/Settings?reqType=billItemPriceChangeHistory&itemId=" + itemId + "&serviceDeptId=" + serviceDeptId);
  }
  //start: billing-package
  public GetBillingPackageList() {
    return this.http.get<any>("/api/Settings?reqType=billing-packageList");
  }

  public PostBillingPackage(pkgItem) {
    let data = JSON.stringify(pkgItem);
    return this.http.post<any>("/api/Settings?reqType=billing-package", data, this.options);
  }

  public PutBillingPackage(pkgItem) {
    let data = JSON.stringify(pkgItem);
    return this.http.put<any>("/api/Settings?reqType=billing-package", data, this.options);
  }

  public UpdateAutoBillingItems(autoBillingItemList) {
    let data = JSON.stringify(autoBillingItemList);
    return this.http.put<any>("/api/Settings?reqType=auto-billing-items", data, this.options);
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
  public PutCountry(country) {
    let data = JSON.stringify(country);
    return this.http.put<any>("/api/Settings?reqType=country", country, this.options);
  }

  public GetSubdivisions() {
    return this.http.get<any>("/api/Settings?reqType=subdivisions");
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



}
