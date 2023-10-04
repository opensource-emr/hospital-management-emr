import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../shared/shared-enums";

export class LabReport {

    public LabReportId: number = 0;
    public PatientId: number;
    public PatientCode: string;
    public TemplateId: number;
    public ReceivingDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public ReportingDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public IsPrinted: boolean = false;
    public Signatories: string;
    public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public CreatedBy: number = 0;
    public IsActive: boolean = true;
    public PrescriberName: string = null; // Dev : 16June'22 -- Changed ReferredByDr to PrescriberName
    public Comments: string = null;
    //not mapped 
    public ComponentIdList: Array<number> = new Array<number>();

    public VerificationEnabled: boolean = null;
}
