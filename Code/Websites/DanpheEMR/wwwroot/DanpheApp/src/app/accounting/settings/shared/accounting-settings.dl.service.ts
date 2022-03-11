import { Injectable, Directive } from '@angular/core';
import { HttpClient,HttpHeaderResponse,HttpHeaders } from '@angular/common/http';
import {response}from '../../../core/response.model'
import { headersToString } from 'selenium-webdriver/http';

@Injectable()
export class AccountingSettingsDLService {
    //public headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    public options =  {headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) { }
    //#region Ledger Settings Calls
    //GET
    public GetLedgersList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=LedgersList");
    }   
    public getPrimaryGroupList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=get-primary-list");
    } 
    public GetLedgers() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgers",this.options);
    }
    public GetFiscalYearList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetFiscalYearList");
    }

    public GetCostCenterItemList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetCostCenterItemList");
    }

    //get pharmacy supplier
    GetPharmacySupplier() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=phrm-supplier", this.options);
        } catch (ex) {
            throw ex
        }
    }
    // GetEmployeeList
    GetEmployeeList() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-employee", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetCreditOrgList() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-creditOrg-list", this.options);
        } catch (ex) {
            throw ex
        }
    }
   
    GetInvVendorList() {
        try {
          return this.http.get<any>("/api/Accounting?reqType=get-invVendor-list", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetInvSubcategoryList(){
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-invSubcategory-list", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetBillingItemsList() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=get-billings-ledgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    //fiscal year activity detaols
    public getfsyearactivitydetail() {
        return this.http.get<any>("/api/Accounting?reqType=get-fsyearactivity");
    } 

    //public GetLedgerGroupwithMultipleVoucher() {
    //    return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroupwithMultipleVoucher");
    //}
    //POST
    public PostLedgers(CurrentLedger) {
        let data = JSON.stringify(CurrentLedger);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddLedgers", data);
    }
    
    public PostSection(CurrentSection) {
        let data = JSON.stringify(CurrentSection);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddSection", data);
    }
  public PostLedgersList(CurrentLedger) {
    let data = JSON.stringify(CurrentLedger);
    return this.http.post<any>("/api/AccountingSettings?reqType=AddLedgersList", data);
  }
    public PostFiscalYear(currentFiscalYear) {
        let data = JSON.stringify(currentFiscalYear);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddFiscalYear", data);
    }
    public PostCostCenterItem(currentCostCenterItem) {
        let data = JSON.stringify(currentCostCenterItem);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddCostCenterItem", data);
    }
    public PostLedgersGroupCategory(ledgerGrpCategory) {
        let data = JSON.stringify(ledgerGrpCategory);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddLedgerGroupCategory", data);
    }

    ////PUT
    public PutLedgerIsActive(selectedLedger) {
        let data = JSON.stringify(selectedLedger);
        return this.http.put<any>("/api/AccountingSettings?reqType=ledgerISActive", data);
    }
    public PutReopenFiscalYear(selectedFiscalYr) {
        let data = JSON.stringify(selectedFiscalYr);
        return this.http.put<any>("/api/AccountingSettings?reqType=reopen-fiscal-year", data);
    }
    public PutFiscalYearStatus(selectedFiscalYr) {
        let data = JSON.stringify(selectedFiscalYr);
        return this.http.put<any>("/api/AccountingSettings?reqType=updateFiscalYearStatus", data);
    }
    public PutCostCenterItemStatus(selectedCostCenterItm) {
        let data = JSON.stringify(selectedCostCenterItm);
         return this.http.put<any>("/api/AccountingSettings?reqType=updateCostCenterItemStatus", data);
    }
    public PutLedgerGrpCategoryIsActive(selectedLedgerGrpCategory) {
        let data = JSON.stringify(selectedLedgerGrpCategory);
        return this.http.put<any>("/api/AccountingSettings?reqType=updateLedgerGrpCategoryIsActive", data);
    }
    public PutLedger(CurrentLedger) {
        let data = JSON.stringify(CurrentLedger);
        return this.http.put<any>("/api/AccountingSettings?reqType=UpdateLedger", data);
    } 

    public PutVoucherHead(CurrentVoucherhead) {
        let data = JSON.stringify(CurrentVoucherhead);
        return this.http.put<any>("/api/AccountingSettings?reqType=UpdateVoucherHead", data);
    }
    //update section 
    public PutSection(CurrentSection)
    {
        let data = JSON.stringify(CurrentSection);
        return this.http.put<any>("/api/AccountingSettings?reqType=UpdateSection", data);
    }
    public PutCOA(coa)
    {
        let data = JSON.stringify(coa);
        return this.http.put<any>("/api/AccountingSettings?reqType=UpdateCOA", data);
    }
    //#endregion Ledger Settings Calls

    //#region  Vouchar Settings Calls
    //GET
    //public GetVouchersList() {
    //    return this.http.get<any>("/api/AccountingSettings?reqType=VouchersList");
    //}
    public GetVouchers() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetVouchers");
    }

    public GetVoucherHead() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetVoucherHead");
    }
    public GetVoucherswithVOCMap() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetVoucherswithVOCMap");
    }

    public GetLedgerGrpVoucherByLedgerGrpId(ledgergroupId) {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGrpVoucherByLedgerGrpId&ledgergroupId=" + ledgergroupId);
    }
    public GetLedgerGrpCategory() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGrpCategory");
    }
    public GetLedgerGroupsDetails() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroupsDetails");
    }
    public GetChartofAccount() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetChartofAccount");
    }
    public getTrasferRuleData(sectionId) {
        return this.http.get<any>("/api/AccountingSettings?reqType=getTrasferRuleDataBySectionId&SectionId=" + sectionId);
    }
    //POST
    public PostVouchers(CurrentVoucher) {
        let data = JSON.stringify(CurrentVoucher);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddVouchers", data);
    }
    public PostCOA(coa) {
        let data = JSON.stringify(coa);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddCOA", data);
    }
    public PostVoucherHead(CurrentVoucherhead) {
        let data = JSON.stringify(CurrentVoucherhead);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddVoucherHead", data);
    }

    ////PUT

    //#endregion Vouchar Settings Calls

    //#region Item Settings Calls 
    //GET
    public GetItemsList() {
        return this.http.get<any>("/api/AccountingSettings?reqType=VoucherItemsList");
    }
    public GetItems() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetItems");
    }
    //get provisional ledger code
    public GetProvisionalLedgerCode() {
        try {
            return this.http.get<any>("/api/Accounting?reqType=provisional-ledger-code");
        } catch (ex) {
            throw ex;
        }
    }
    
    //POST
    public PostItems(CurrentItem) {
        let data = JSON.stringify(CurrentItem);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddItems", data);
    }
    public PostManageVoucher(mappedVoucherList) {
        let data = JSON.stringify(mappedVoucherList);
        return this.http.post<any>("/api/AccountingSettings?reqType=manageVoucherWithLedgegroup", data);
    }
    ////PUT
    public PutItemIsActive(selectedItem) {
        let data = JSON.stringify(selectedItem);
        return this.http.put<any>("/api/AccountingSettings?reqType=itemISActive", data);
    }

    //#endregion Item Settings Calls

    //#region LedgerGroup Settings Calls
    //Get
    public GetLedgerGroup() {
        return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroups");
    }

    //Post
    public PostLedgersGroup(ledgerGrpObjString: string) {
        let data = ledgerGrpObjString;
        return this.http.post<any>("/api/AccountingSettings?reqType=AddLedgersGroup", data);
    }

    //Put
    public PutLedgerGrpIsActive(selectedLedgerGrp) {
        let data = JSON.stringify(selectedLedgerGrp);
        return this.http.put<any>("/api/AccountingSettings?reqType=updateLedgerGrpIsActive", data);
    }
    PutLedgersGroup(currentLedgerGroup) {
        let data = JSON.stringify(currentLedgerGroup);
        return this.http.put<any>("/api/AccountingSettings?reqType=updateLedgerGroup", data);
    }

    public PutTransferRuleIsActive(ruleName) {
        let data = JSON.stringify(ruleName);
        return this.http.put<any>("/api/AccountingSettings?reqType=UpdateTransferRulesActive", data);
    }
    //#endregion LedgerGroup Settings Calls
}
