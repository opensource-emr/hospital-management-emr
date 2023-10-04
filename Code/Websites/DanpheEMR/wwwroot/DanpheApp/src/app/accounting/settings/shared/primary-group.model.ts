import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../../shared/shared-enums";

export class PrimaryGroupModel {
    public PrimaryGroupId: number = 0;
    public PrimaryGroupCode: string = '';
    public PrimaryGroupName: string = '';
    public IsActive: boolean = false;
    public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
    public CreatedBy: number = 0;
    public ModifiedOn: string = '';
    public ModifiedBy: number = 0;
}

