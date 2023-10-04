import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { MedicareMemberModel } from './medicare-member.model';

@Injectable()
export class MedicareDLService {
    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) {
    }

    public GetAllDepartments() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/Departments");
    }

    public GetAllDesignations() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/Designations");
    }
    public GetAllMedicareTypes() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/MedicareTypes");
    }
    public GetAllMedicareInstitutes() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/MedicareInstitutes");
    }
    public GetAllInsuranceProviderList() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/InsuranceProviders");
    }

    public PostMedicareMemberDetails(medicareMemberDetail: MedicareMemberModel) {
        return this.http.post<DanpheHTTPResponse>("/api/Medicare/MedicareMemberDetails", medicareMemberDetail);
    }
    public PostMedicareDependentDetails(data: MedicareMemberModel) {
        return this.http.post<DanpheHTTPResponse>("/api/Medicare/MedicareMemberDetails", data);
    }
    public GetMedicareMemberDetailByPatientId(patientId: number) {
        return this.http.get(`/api/Medicare/MedicareMemberByPatientId?PatientId=${patientId}`, this.options);
    }
    public GetMedicareDependentMemberDetailByPatientId(patientId: number) {
        return this.http.get(`/api/Medicare/DependentMedicareMember?PatientId=${patientId}`, this.options);
    }
    public GetMedicareMemberDetailByMedicareNumber(medicareNo: string) {
        return this.http.get(`/api/Medicare/MedicareMemberByMemberNo?MedicareNo=${medicareNo}`, this.options);
    }

    public PutMedicareDetails(medicareDetail: MedicareMemberModel) {
        return this.http.put<DanpheHTTPResponse>("/api/Medicare/MedicareMemberDetails", medicareDetail);
    }
    public GetMedicarePatients() {
        return this.http.get<DanpheHTTPResponse>("/api/Medicare/MedicarePatientList");
    }

}
