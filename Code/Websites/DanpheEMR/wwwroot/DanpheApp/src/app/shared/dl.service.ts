import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class DLService {
    public http: HttpClient;
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public jsonOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }
    constructor(_http: HttpClient) {
        this.http = _http;
    }
    public getWard() {
        return this.http.get<any>("/api/Admission/Wards", this.options);
    }
    public getDepartment() {
        return this.http.get<any>("/api/Admission/Departments", this.options);
    }
    public getBedFeature() {
        return this.http.get<any>("/api/Admission/BedFeatures", this.options);
    }
    public getLabTest() {
        return this.http.get<any>("/api/LabSetting/LabTests", this.options);
    }
    public getCategory() {
        return this.http.get<any>("/api/Lab/LabCategories", this.options);
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
        return this.http.put<any>("/api/Security/ActivateLab?labId=" + labId + "&labName=" + labName, this.options);
    }

    public GetDepartment() {
        return this.http.get<any>("/api/Appointment/AppointmentApplicableDepartments");
    }

    public GetAllMembershipType() {
        return this.http.get<any>("/api/BillSettings/MembershipTypes", this.options);
    }
    LoadReportData(Query) {
        return this.http.post<any>(`/DynamicReporting/GetReportData`, { Query: Query }, this.jsonOptions);
    }

    LoadBillDetailReportData(FromDate: string, ToDate: string, BillingType: string, ItemId: number, UserId: number, RankName: string, MembershipTypeId: number, ServiceDepartmentId: number) {
        return this.http.get<any>(`/BillingReports/BillDetailReport?FromDate=${FromDate}&ToDate=${ToDate}&BillingType=${BillingType}&ItemId=${ItemId}&UserId=${UserId}&RankName=${RankName}&MembershipTypeId=${MembershipTypeId}&ServiceDepartmentId=${ServiceDepartmentId}`, this.options);
    }

    public GetRank() {
        return this.http.get<any>("/api/Visit/GetRank", this.options);
    }
    LoadDepartmentWiseRankCountReportData(FromDate: string, ToDate: string, DepartmentIds: string, RankNames: string) {
        return this.http.get<any>(`/Reporting/DepartmentWiseRankCountReport?FromDate=${FromDate}&ToDate=${ToDate}&DepartmentIds=${DepartmentIds}&RankNames=${RankNames}`, this.options);
    }
    public GetCountrySubDivision(countryId: number) {
        return this.http.get<any>("/api/Master/CountrySubDivisions?countryId=" + countryId, this.options);

    }
    public GetMunicipality(id: number) {
        return this.http.get<any>("/api/Master/Municipalities?countrySubDivisionId=" + id, this.options);
    }
}
