import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { PatientsDLService } from '../../../patients/shared/patients.dl.service';
import { MedicareDependentModel } from './dto/medicare-dependent.model';
import { MedicareMemberModel } from './medicare-member.model';
import { MedicareDLService } from './medicare.dl.service';




@Injectable()
export class MedicareBLService {
    constructor(private medicareDlService: MedicareDLService, private patientDLService: PatientsDLService) {

    }

    public GetPatientsWithVisitsInfo(searchTxt) {
        return this.patientDLService.GetPatientsWithVisitsInfo(searchTxt)
            .map(res => res);
    }
    public GetAllDepartment() {
        return this.medicareDlService.GetAllDepartments()
            .map(res => res);
    }

    public GetAllDesignations() {
        return this.medicareDlService.GetAllDesignations()
            .map(res => res);
    }
    public GetAllMedicareTypes() {
        return this.medicareDlService.GetAllMedicareTypes()
            .map(res => res);
    }
    public GetAllMedicareInstitutes() {
        return this.medicareDlService.GetAllMedicareInstitutes()
            .map(res => res);
    }
    public GetAllInsuranceProviderList() {
        return this.medicareDlService.GetAllInsuranceProviderList()
            .map(res => res);
    }

    public PostMedicareMemberDetails(medicareMemDetails: MedicareMemberModel) {
        let memberDetails = _.omit(medicareMemDetails, ['MedicareMemberValidator']);
        return this.medicareDlService.PostMedicareMemberDetails(memberDetails)
            .map(res => res);
    }
    public PutMedicareMemberDetails(medicareMemDetails: MedicareMemberModel) {
        let memberDetails = _.omit(medicareMemDetails, ['MedicareMemberValidator']);
        return this.medicareDlService.PutMedicareDetails(memberDetails)
            .map(res => res);
    }

    public GetMedicareMemberDetailByMedicareNumber(memberNo) {
        return this.medicareDlService.GetMedicareMemberDetailByMedicareNumber(memberNo)
            .map(res => res);
    }
    public GetMedicareMemberDetailByPatientId(patientId) {
        return this.medicareDlService.GetMedicareMemberDetailByPatientId(patientId)
            .map(res => res);
    }
    public GetMedicareDependentMemberDetailByPatientId(patientId) {
        return this.medicareDlService.GetMedicareDependentMemberDetailByPatientId(patientId)
            .map(res => res);
    }

    public PostMedicareDependentDetails(medicareDepDetails: MedicareDependentModel) {
        let dependentDetails = _.omit(medicareDepDetails, ['MedicareDependentValidator']);
        return this.medicareDlService.PostMedicareDependentDetails(dependentDetails)
            .map(res => res);
    }
    public PutMedicareDependentDetails(medicareDepDetails: MedicareDependentModel) {
        let dependentDetails = _.omit(medicareDepDetails, ['MedicareDependentValidator']);
        return this.medicareDlService.PutMedicareDetails(dependentDetails)
            .map(res => res);
    }
    public GetMedicarePatientList() {
        return this.medicareDlService.GetMedicarePatients()
            .map(res => res);
    }
}
