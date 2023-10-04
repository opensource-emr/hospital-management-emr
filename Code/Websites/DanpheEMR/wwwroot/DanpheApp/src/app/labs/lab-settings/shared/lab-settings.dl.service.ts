import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { _ } from 'ag-grid-community';

@Injectable()
export class LabSettingsDLService {
  public http: HttpClient;
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(_http: HttpClient) {
    this.http = _http;
  }

  GetAllReportTemplates() {
    return this.http.get<any>("/api/LabSetting/ReportTemplates", this.options);
  }

  GetAllLabTests() {
    return this.http.get<any>("/api/LabSetting/LabTests", this.options);
  }
  GetLabDefaultSignatories() {
    return this.http.get<any>("/api/LabSetting/LabSignatories", this.options);
  }

  GetAllLabTestComponents() {
    return this.http.get<any>("/api/LabSetting/LabTestComponents", this.options);
  }

  GetAllLookUpNames() {
    return this.http.get<any>("/api/LabSetting/LabLookupList", this.options);
  }

  //Start: These API are being called from LabController instead of LabSettingsController
  public GetAllLabCategory() {
    return this.http.get<any>("/api/Lab/LabCategories", this.options);
  }

  public GetAllLabSpecimen() {
    return this.http.get<any>("/api/Lab/LabSpecimens", this.options);
  }
  //End: These API are being called from LabController instead of LabSettingsController

  PostNewReportTemplate(reportTemplateData: string) {
    let data = reportTemplateData;
    return this.http.post<any>("/api/LabSetting/LabReportTemplate", data, this.options);
  }

  PostNewLabTest(labTest: string) {
    let data = labTest;
    return this.http.post<any>("/api/LabSetting/LabTest", data, this.options);
  }

  PostLabTestComponent(components: string) {
    let data = components;
    return this.http.post<any>("/api/LabSetting/LabComponentsInBulk", data, this.options);
  }

  PostLabLookUp(components: string) {
    let data = components;
    return this.http.post<any>("/api/LabSetting/LabLookup", data, this.options);
  }

  PostNewLabCategory(data: string) {
    let stringData = data;
    return this.http.post<any>("/api/LabSetting/LabCategory", stringData, this.options);
  }
  PostNewLabSpecimen(data: string) {
    let stringData = data;
    return this.http.post<any>("/api/LabSetting/LabSpecimen", stringData, this.options);
  }



  PutLabCategory(labCategory: string) {
    let data = labCategory;
    return this.http.put<any>("/api/LabSetting/LabCategory", data, this.options);
  }

  PutNewReportTemplate(reportTemplateData: string) {
    let data = reportTemplateData;
    return this.http.put<any>("/api/LabSetting/LabReportTemplate", data, this.options);
  }

  PutNewLabTest(labTest: string) {
    let data = labTest;
    return this.http.put<any>("/api/LabSetting/LabTest", data, this.options)
  }

  UpdateDefaultSignatories(signatoriesList: string) {
    let data = signatoriesList;
    return this.http.put<any>("/api/LabSetting/LabDefaultSignatories", data, this.options);
  }

  UpdateLabTestComponent(components: string) {
    let data = components;
    return this.http.put<any>("/api/LabSetting/LabComponentsInBulk", data, this.options);
  }
  UpdateLabLookUpComponent(components: string) {
    let data = components;
    return this.http.put<any>("/api/LabSetting/LabLookup", data, this.options);
  }

  //start: sud:28Apr'19--for lab-external vendors.
  GetLabVendors() {
    return this.http.get<any>("/api/LabSetting/LabVendors", this.options);
  }


  PostLabVendor(labVendor: string) {
    let data = labVendor;
    return this.http.post<any>("/api/LabSetting/LabVendor", data, this.options);
  }

  PutLabVendor(labVendor: string) {
    let data = labVendor;
    return this.http.put<any>("/api/LabSetting/LabVendor", data, this.options);
  }
  //end: sud:28Apr'19--for lab-external vendors.

  //start: Anjana: 8/31/2020 : getting all gov specified lab components
  GetAllGovLabComponents() {
    return this.http.get<any>("/api/LabSetting/LabGovReportingItems", this.options);
  }

  GetAllMappedComponents() {
    return this.http.get<any>("/api/LabSetting/LabGovReportMappingDetail", this.options);
  }

  MapGovLabComponent(comp) {
    let data = comp;
    return this.http.post<any>("/api/LabSetting/GovReportMapping", data, this.options);
  }

  UpdateMappedGovLabComponent(comp) {
    let data = comp;
    return this.http.put<any>("/api/LabSetting/GovReportMapping", data, this.options);
  }
  //end: Anjana: 8/31/2020 : getting all gov specified lab components

  //activate deactivate lab test
  public PutLabTestIsActive(test) {
    let data = JSON.stringify(test);
    return this.http.put<any>("/api/LabSetting/LabTestActiveStatus", data, this.options);
  }

  public PutLabCategoryIsActive(cat) {
    let data = JSON.stringify(cat);
    return this.http.put<any>("/api/LabSetting/LabCategoryActiveStatus", data, this.options);
  }

  public PutLabReportTemplateIsActive(rep) {
    let data = JSON.stringify(rep);
    return this.http.put<any>("/api/LabSetting/LabReportTemplateActiveStatus", data, this.options);
  }

  public PutLabVendorIsActive(vendor) {
    let data = JSON.stringify(vendor);
    return this.http.put<any>("/api/LabSetting/LabVendorActiveStatus", data, this.options);
  }
}
