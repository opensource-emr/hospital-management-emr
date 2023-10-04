import { Injectable } from "@angular/core";
import { InsuranceProviderModel } from "../../../../patients/shared/insurance-provider.model";
import { Medicare_EmployeeDesignation_DTO } from "../dto/medicare-employee-designation.dto";
import { MedicalCareType, MedicareInstitute } from "../medicare-member.model";


@Injectable()
export class MedicareService {

    designationList: Array<Medicare_EmployeeDesignation_DTO> = [];
    medicalCareTypeList: Array<MedicalCareType> = [];
    medicareInstituteList: Array<MedicareInstitute> = [];
    insuranceProvidersList: Array<InsuranceProviderModel> = [];
    departmentList: Array<Departments> = [];

}

export class Departments {

    DepartmentName: string = null;
    DepartmentId: number;
    DepartmentCode: string;
}