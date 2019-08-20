import {Tax } from "../billing/shared/tax-model";
import { Department } from "../settings/shared/department.model";
import { UniquePastDataModel } from "../core/shared/allUniquePast.data.model";
export class CommonMaster {

    ServiceDepartments: Array<ServiceDepartmentVM> = new Array<ServiceDepartmentVM>();
    Departments: Array<Department> = new Array<Department>();
    Taxes: Array<Tax> = new Array<Tax>();
    UniqueDataList: UniquePastDataModel = new UniquePastDataModel();
    constructor() {

    }
}


export class ServiceDepartmentVM {
    public ServiceDepartmentId: number = 0;
    public ServiceDepartmentName: string = null;
    public DepartmentName: string = null;
    public DepartmentId: number = 0;
    public IntegrationName: string = null;
}