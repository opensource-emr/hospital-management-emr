import * as moment from "moment";

export class NursingOpdVisitList_DTO {
    public PatientId: number = 0;
    public PatientCode: string = '';
    public ShortName: string = '';
    public Age: string = "";
    public Gender: string = "";
    public Address: string = "";
    public PhoneNumber: string = "";
    public VisitTime: string = moment().add(5, 'minutes').format('HH:mm');
    public DepartmentName: string = null
    public PerformerName: string = null;
}