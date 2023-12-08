import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DanpheHTTPResponse } from '../../shared/common-models';

@Injectable()
export class CoreDLService {

    public options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
    };
    public jsonOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
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
        return this.http.get<any>('/api/Master/CoreLookups' + '?lookUpType=' + type, this.options);
    }

    //input value won't be passed if the modulename is null or empty.
    public GetLookups(moduleName: string) {
        if (moduleName && moduleName != '') {
            return this.http.get<any>("/api/Core/Lookups" + '?inputValue=' + moduleName, this.options);
        }
        else {
            return this.http.get<any>("/api/Core/Lookups", this.options);
        }
    }


    public GetAllMasterEntities() {
        return this.http.get<any>("/api/Master/GetMasterData", this.options);
    }

    //sud: 25Dec'18--to load appsettings from server into client side.
    public GetAppSettings() {
        return this.http.get<any>("/api/Core/AppSettings", this.options);
    }

    // public GetCounter() {
    //     return this.http.get<any>('/api/billing/GetCounter', this.options);
    // }

    // GetCodeDetails
    public GetCodeDetails() {
        return this.http.get<any>("/api/Accounting/AccountingCodes", this.options);
    }
    // GetFiscalYearList
    public GetFiscalYearList() {
        return this.http.get<any>("/api/Accounting/FiscalYears", this.options);
    }
    //GET section  list
    public GetsectionList() {
        return this.http.get<any>("/api/AccountingSettings/SectionsList");
    }
    //getCalenderDatePreference
    public getCalenderDatePreference() {
        return this.http.get<any>("/api/Core/EmployeeDatePreference");
    }

    public GetPrinterSettingList() {
        return this.http.get<any>("/api/BillSettings/PrinterSettings");
    }

    public GetAllMunicipalities() {
        return this.http.get<any>("/api/Master/Municipalities", this.options);
    }

    public GetLabTypes() {
        return this.http.get<any>("/api/Lab/LabTypes", this.options);
    }

    public GetAllGovLabComponents() {
        return this.http.get<any>("/api/LabSetting/LabGovReportingItems", this.options);
    }

    public GetPaymentModeSettings() {
        return this.http.get<any>("/api/Settings/GetPaymentModeSettings", this.options);
    }

    public GetPrintExportConfiguration() {
        return this.http.get<any>("/api/Settings/PrintExportConfiguration", this.options);
    }

    public GetPaymentModes() {
        return this.http.get<any>("/api/Settings/GetPaymentModes", this.options);
    }
    public GetPaymentPages() {
        return this.http.get<any>("/api/Billing/PaymentPages", this.options);
    }
    public GetPriceCategories() {
        return this.http.get<DanpheHTTPResponse>("/api/Master/GetPriceCategories", this.jsonOptions);
    }

    public GetMembershipTypeVsPriceCategory() {
        return this.http.get<any>("/api/BillingMaster/SchemePriceCategoriesMap", this.options);
    }

    public GetBillingSchemesDtoList(serviceBillingContext: string) {
        return this.http.get<any>("/api/BillingMaster/Schemes?serviceBillingContext=" + serviceBillingContext, this.options);
    }

}

