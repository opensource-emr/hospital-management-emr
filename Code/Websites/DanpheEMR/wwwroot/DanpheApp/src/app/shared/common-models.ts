/**
 * This file contains all common models used across client side.
Created: sud:12May'18
Remarks: Need to add other modules in this file and import required models at once.
 */
export class DanpheHTTPResponse {
    public Status: string = null;
    public ErrorMessage: string = null;
    public Results: any = null;
}

//this class is called as MyConfiguration in server side.
export class DanpheAppSettings {

    public ApplicationVersionNum: string = null;
    public highlightAbnormalLabResult: boolean = false;
    public CacheExpirationMinutes: number = 0;

    //all below properties are available in server side, but due to security restrictions we're using only few(above) properties in client side.
    //public string Connectionstring { get; set; }
    // public string ConnectionStringAdmin { get; set; }
    // public string ConnectionStringPACSServer { get; set; }
    // public string FileStorageRelativeLocation { get; set; }
    // public bool RealTimeRemoteSyncEnabled { get; set; }
}

//sud:6June'20--to Centralize the date options in Grid and from-to-date select component.
//Earlier this was taking multiple input parameters in grid, to centralize this we can use this option.
//It's in In-Progress state, we have to extend this to allow other settings as well.
export class DateRangeOptions {

    public show: boolean = false;
    public defaultDateRange: string = "";//available values: today, last1week, last1month, last3month, last6month
    //User can give what all ranges they want in this grid. default: all
    public validDateRangesCSV: string = "1W,1M,3M,6M";
    public allowPastDate:boolean = true;
    public allowFutureDate:boolean= true;
    
    constructor() {
        this.show = false;
        this.defaultDateRange = "";
        this.validDateRangesCSV = "1W,1M,3M,6M";
    }

    // //Custom will be available all the time,  other are parameterized.
    // @Input("date-range-options")
    // public dateRangeOptionsStr: string = "1W,1M,3M,6M";

    // public dateRangeOptions = {
    //     week1: true,
    //     month1: true,
    //     month3: true,
    //     month6: true,
    // };

}

export class CancelStatusHoldingModel {
  public radiologyStatus: Array<string> = [];
  public labStatus: Array<string> = [];
}
