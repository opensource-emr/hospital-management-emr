export class EmployeeSchedulesModel {
    public EmployeeSCHId: number = 0;
    public EmployeeId: number = null;
    public Date: string = null;
    public DayName: string = null;
    public IsWorkingDay: boolean = null;
    public IsPresent: boolean = null;

    //not mapped
    public TxnType: string = "";
}