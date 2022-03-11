import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable()
export class DLService {
    public http: HttpClient;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(_http: HttpClient) {
        this.http = _http;
    }
    public getWard() {
        return this.http.get<any>("/api/Admission?reqType=WardList", this.options);
    }
    public getDepartment() {
        return this.http.get<any>("/api/Admission?reqType=DepartmentList", this.options);
    }
    public getBedFeature() {
        return this.http.get<any>("/api/Admission?reqType=BedFeatureList", this.options);
    }
    public getLabTest() {
        return this.http.get<any>("/api/LabSetting?reqType=labTestsList", this.options);
    }
    public getCategory() {
        return this.http.get<any>("/api/Lab?reqType=all-lab-category", this.options);
    }
    public Read(url: string) {
        return this.http.get<any>(url, this.options);
    }
    public Add(data: string, url: string) {
        return this.http.post<any>(url, data, this.options);
    }
    public Update(data: string, url: string) {
        return this.http.put<any>(url, data, this.options);
    }
    public ReadExcel(url: string) {
        return this.http.get(url, { responseType: 'blob' }) // responseType: ResponseContentType.Blob
    }

    public ActivateLab(labId: number, labName: string) {
        return this.http.put<any>("/api/Security?reqType=activateLab&labId=" + labId + "&labName=" + labName, this.options);
    }

    public GetDepartment() {
        return this.http.get<any>("/api/Appointment?reqType=department");
    }

    public GetAllMembershipType() {
        return this.http.get<any>("/api/BillSettings?reqType=get-membership-types", this.options);
    }
}
