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
    return this.http.get<any>("/api/LabSetting?reqType=labReportList", this.options);
  }

  GetAllLabTests() {
    return this.http.get<any>("/api/LabSetting?reqType=labTestsList", this.options);
  }
  GetLabDefaultSignatories() {
    return this.http.get<any>("/api/LabSetting?reqType=labSignatories", this.options);
  }
  GetAllDoctors() {
    return this.http.get<any>("/api/LabSetting?reqType=allLabDoctorsList", this.options);
  }
  GetAllLabTestComponents() {
    return this.http.get<any>("/api/LabSetting?reqType=allLabTestComponentList", this.options);
  }

  GetAllLookUpNames() {
    return this.http.get<any>("/api/LabSetting?reqType=allLookUp", this.options);
  }
  public GetAllLabCategory() {
    return this.http.get<any>("/api/Lab?reqType=all-lab-category", this.options);
  }
  public GetAllLabSpecimen() {
    return this.http.get<any>("/api/Lab?reqType=all-lab-specimen", this.options);
  }




  PostNewReportTemplate(reportTemplateData: string) {
    let data = reportTemplateData;
    return this.http.post<any>("/api/LabSetting?reqType=postLabReport", data, this.options);
  }

  PostNewLabTest(labTest: string) {
    let data = labTest;
    return this.http.post<any>("/api/LabSetting?reqType=postLabTest", data, this.options);
  }

  PostLabTestComponent(components: string) {
    let data = components;
    return this.http.post<any>("/api/LabSetting?reqType=postLabComponents", data, this.options);
  }

  PostLabLookUp(components: string) {
    let data = components;
    return this.http.post<any>("/api/LabSetting?reqType=postLabLookUp", data, this.options);
  }

  PostNewLabCategory(data: string) {
    let stringData = data;
    return this.http.post<any>("/api/LabSetting?reqType=postLabCategory", stringData, this.options);
  }
  PostNewLabSpecimen(data: string) {
    let stringData = data;
    return this.http.post<any>("/api/LabSetting?reqType=postLabSpecimen", stringData, this.options);
  }



  PutLabCategory(labCategory: string) {
    let data = labCategory;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabCategory", data, this.options);
  }

  PutNewReportTemplate(reportTemplateData: string) {
    let data = reportTemplateData;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabReport", data, this.options);
  }

  PutNewLabTest(labTest: string) {
    let data = labTest;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabTest", data, this.options)
  }

  UpdateDefaultSignatories(signatoriesList: string) {
    let data = signatoriesList;
    return this.http.put<any>("/api/LabSetting?reqType=updateDefaultSignatories", data, this.options);
  }

  UpdateLabTestComponent(components: string) {
    let data = components;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabTestComponent", data, this.options);
  }
  UpdateLabLookUpComponent(components: string) {
    let data = components;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabLookUpComponent", data, this.options);
  }

  //start: sud:28Apr'19--for lab-external vendors.
  GetLabVendors() {
    return this.http.get<any>("/api/LabSetting?reqType=lab-vendors-list", this.options);
  }


  PostLabVendor(labVendor: string) {
    let data = labVendor;
    return this.http.post<any>("/api/LabSetting?reqType=add-vendor", data, this.options);
  }

  PutLabVendor(labVendor: string) {
    let data = labVendor;
    return this.http.put<any>("/api/LabSetting?reqType=updateLabVendor", data, this.options);
  }
  //end: sud:28Apr'19--for lab-external vendors.

  //start: Anjana: 8/31/2020 : getting all gov specified lab components
  GetAllGovLabComponents(){
    return this.http.get<any>("/api/LabSetting?reqType=allGovLabTestComponentList", this.options);
  }

  GetAllMappedComponents(){
    return this.http.get<any>("/api/LabSetting?reqType=all-mapped-components", this.options);
  }

  MapGovLabComponent(comp){
    let data = comp;
    return this.http.post<any>("/api/LabSetting?reqType=post-mapped-component", data, this.options);
  }

  UpdateMappedGovLabComponent(comp){
    let data = comp;
    return this.http.put<any>("/api/LabSetting?reqType=edit-mapped-component", data, this.options);
  }
  //end: Anjana: 8/31/2020 : getting all gov specified lab components

  //activate deactivate lab test
  public PutLabTestIsActive(test){
    let data = JSON.stringify(test);
    return this.http.put<any>("/api/LabSetting?reqType=put-labtest-isactive",data, this.options);
  }

  public PutLabCategoryIsActive(cat){
    let data = JSON.stringify(cat);
    return this.http.put<any>("/api/LabSetting?reqType=put-labcategory-isactive", data, this.options);
  }

  public PutLabReportTemplateIsActive(rep){
    let data = JSON.stringify(rep);
    return this.http.put<any>("/api/LabSetting?reqType=put-lab-report-template-isactive", data, this.options);
  }

  public PutLabVendorIsActive(vendor){
    let data = JSON.stringify(vendor);
    return this.http.put<any>("/api/LabSetting?reqType=put-lab-vendor-isactive", data, this.options);
  } 
}
