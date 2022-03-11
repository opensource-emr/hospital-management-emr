import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class CoreDLService {

    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    constructor(public http: HttpClient) {
    }

    public GetParametersList() {
        return this.http.get<any>("/api/Parameters", this.options);
    }

    public ConvertEngToNepDate(value: string) {
        return this.http.get<any>('/api/Core?reqType=engToNepDate' + '&value=' + value, this.options);
    }
    public ConvertNepToEngDate(value: string) {
        return this.http.get<any>('/api/Core?reqType=nepToEngDate' + '&value=' + value, this.options);
    }

    public GetAllLookUpDetails(type: number) {
        return this.http.get<any>('/api/Master?type=coreLookUpDetails' + '&lookUpType=' + type, this.options);
    }

    //input value won't be passed if the modulename is null or empty.
    public GetLookups(moduleName: string) {
        if (moduleName && moduleName != '') {
            return this.http.get<any>("/api/Core?reqType=lookups" + '&inputValue=' + moduleName, this.options);
        }
        else {
            return this.http.get<any>("/api/Core?reqType=lookups", this.options);
        }
    }


    public GetAllMasterEntities() {
        return this.http.get<any>("/api/Master?type=AllMasters", this.options);
    }

    //sud: 25Dec'18--to load appsettings from server into client side.
    public GetAppSettings() {
        return this.http.get<any>("/api/Core?reqType=appSettings-limited", this.options);
    }

    public GetCounter() {
        return this.http.get<any>('/api/billing?reqType=getCounter', this.options);
    }

    // GetCodeDetails
    public GetCodeDetails() {
        return this.http.get<any>("/api/Accounting?reqType=code-details", this.options);
    }
    // GetFiscalYearList
    public GetFiscalYearList() {
        return this.http.get<any>("/api/Accounting?reqType=fiscalyear-list", this.options);
    }
    //GET section  list
    public GetsectionList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=SectionsList");
    }
    //getCalenderDatePreference
    public getCalenderDatePreference() {
        return this.http.get<any>("/api/Core?reqType=get-emp-datepreference");
    }

    public GetPrinterSettingList() {
        return this.http.get<any>("/api/BillSettings?reqType=get-printer-settings");
    }

    public GetAllMunicipalities() {
        return this.http.get<any>("/api/Master?type=get-municipalities", this.options);
    }

    public GetLabTypes(){
        return this.http.get<any>("/api/Lab?reqType=get-lab-types", this.options);
    }

    public GetAllGovLabComponents(){
    return this.http.get<any>("/api/LabSetting?reqType=allGovLabTestComponentList", this.options);
  }

  public GetPrintExportConfiguration() {
    return this.http.get<any>("/api/Settings?reqtype=get-print-export-configuration", this.options);
}
}

