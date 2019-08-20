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
