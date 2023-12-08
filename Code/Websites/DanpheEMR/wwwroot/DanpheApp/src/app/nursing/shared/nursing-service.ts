import { Injectable } from "@angular/core";
import { Employee } from "../../employee/shared/employee.model";
import { Department } from "../../settings-new/shared/department.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { NursingBLService } from "./nursing.bl.service";

@Injectable()

export class NursingService {
    public DepartmentList = new Array<Department>();
    public DoctorList = new Array<Employee>();
    constructor(
        private _nursingBLService: NursingBLService,
        private _messageBoxService: MessageboxService
    ) {
    }
    public SetDepartmentList(Department: Array<Department>) {
        this.DepartmentList = Department;;
    }

    public GetDepartmentList(): Array<Department> {
        return this.DepartmentList;
    }

    public SetDoctorList(Employee: Array<Employee>) {
        this.DoctorList = Employee;
    }

    public GetDoctorList(): Array<Employee> {
        return this.DoctorList;
    }
}
