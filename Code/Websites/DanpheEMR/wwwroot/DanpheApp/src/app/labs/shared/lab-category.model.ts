import * as moment from "moment";
import { ENUM_DateTimeFormat } from "../../shared/shared-enums";
export class LabCategoryModel {
  public TestCategoryId: number = 0;
  public TestCategoryName: string = null;
  public CreatedOn: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day_Hour_Minute);
  public CreatedBy: number = 0;
  public ModifiedOn: string = null;
  public ModifiedBy: number = null;
  public IsDefault: boolean = false;
  public IsActive: boolean = true;
}
