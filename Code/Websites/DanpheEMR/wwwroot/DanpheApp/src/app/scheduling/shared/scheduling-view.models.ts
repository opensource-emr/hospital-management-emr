import { ShiftsMasterModel } from './shifts-master.model';
import { EmployeeShiftMapModel } from "./employee-shift-map.model";

export class ManageWorkingHoursVM {
    public EmployeeId: number = null;
    public EmployeeName: string = null;
    public NoOfShifts: number = 0;
    public Shifts: Array<ShiftsMasterModel> = new Array<ShiftsMasterModel>();
    public TotalWorkingHrs: number = 0;
}

export class WorkingHoursTxnVM {
    public Shifts: Array<ShiftsMasterModel> = new Array<ShiftsMasterModel>();
    public Maps: Array<EmployeeShiftMapModel> = new Array<EmployeeShiftMapModel>();
}