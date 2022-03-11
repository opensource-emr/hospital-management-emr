//file: FromToDateSettings
//created: 6June'20-Sud
//Description: 
/*
 This file contains settings for each module, page, report etc.
 we can later move these to parameters if it's required differently for different hospitals.
 for now pls keep adding 'else-if' conditions.

 * Usage: in DanpheGrid with custome-date=true, and from-to-date-select component. mostly in reports.

 IMPORTANT: Think of this file as 'grid-column-settings'
*/
export class FromToDateSettings {

  public defaultRangeName: string = "";//available values: today, last1week, last1month, last3month, last6month
  //User can give what all ranges they want in this grid. default: all
  public validDateRangesCSV: string = "1W,1M,3M,6M";
  public allowPastDate: boolean = true;
  public allowFutureDate: boolean = false;
  //if: 90 then total days between fromdate and todate can't be more than 90
  //Zero means this validation will not be checked.
  //IMPORTANT !! make sure that You're not allowing more than this value by RangeSettings  !!!
  //eg: if 3Months is allowed via range, then no point in keeping maxDays less than 90.
  public maxDaysInRange: number = 0;


  public static GetDateSettingsByName(name: string) {
    let retValue = new FromToDateSettings();
    //Keep adding more CASES if your module requires different settings
    //Don't forget to add break at the end.
    //don't change the default one..
    switch (name) {
      case "billing-reports":
        {
          retValue.defaultRangeName = "today";
          retValue.allowFutureDate = false;
          retValue.validDateRangesCSV = "1D,1W,1M,3M";
          retValue.maxDaysInRange = 0;
          break;
        }
      case "common-range-with-today":
        {
          retValue.defaultRangeName = "today";
          retValue.allowFutureDate = false;
          retValue.validDateRangesCSV = "1D,1W,1M,3M";
          break;
        }
      case "rad-grid":
        {
          retValue.defaultRangeName = "last1week";
          retValue.allowFutureDate = false;
          retValue.validDateRangesCSV = "1D,1W,1M,3M";
          break;
        }
      case "inctv-txns":
        {
          retValue.defaultRangeName = "last1week";
          retValue.allowFutureDate = false;
          retValue.validDateRangesCSV = "1D,1W,1M,3M";
          break;
        }
      case "nursing-opd-list":
        {
          retValue.defaultRangeName = "last1week";
          retValue.allowFutureDate = false;
          retValue.validDateRangesCSV = "1D,1W,1M,3M";
          break;
        }
      default: //Don't remove/Change this..
        {
          retValue.allowFutureDate = false;
          retValue.defaultRangeName = "last1week";
          retValue.validDateRangesCSV = "1W,1M,3M";
          break;
        }
    }
    return retValue;

  }
}
