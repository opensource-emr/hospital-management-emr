import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
}
