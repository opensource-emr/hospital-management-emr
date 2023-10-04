import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../../shared/shared-enums";

export class ReverseTransactionModel {
    public ReverseTransactionId: number = 0;
    public TransactionDate: string = null;
    public Section: number = 0;
    public JsonData: string = null;
    public Reason: string = null;
    public TUId: number = 0;
    public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public CreatedBy: number = 0;
    public FiscalYearId: number = 0;
}