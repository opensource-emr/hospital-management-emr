import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from '../../../core/response.model';
import { MedicalCareType } from '../../../insurance/medicare/shared/medicare-member.model';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { BankReconciliationCategory } from '../../bank-reconciliation/reconcile-bank-transactions/bank-reconciliation.model';
import { SubLedgerForMakePayment } from '../../transactions/shared/DTOs/sub-ledger-for-payment.dto';
import { SubLedgerModel } from './sub-ledger.model';

@Injectable()
export class AccountingSettingsDLService {
    //public headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    public options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
    public jsonOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    constructor(public http: HttpClient) { }
    //#region Ledger Settings Calls
    //GET
    public GetLedgersList() {
        return this.http.get<any>("/api/AccountingSettings/LedgersList");
    }

    public GetSubLedger() {
        return this.http.get<DanpheHTTPResponse>(`/api/AccountingSettings/GetSubLedgers`, this.options);
    }

    public AddSubLedger(subLedger: string) {
        return this.http.post<DanpheHTTPResponse>(`/api/AccountingSettings/AddSubLedger?ledger=${subLedger}`, this.options);
    }

    public UpdateSubLedger(subLedger: SubLedgerModel) {
        let options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };
        return this.http.put<DanpheHTTPResponse>(`/api/AccountingSettings/UpdateSubLedger`, subLedger, options);
    }

    public ActivateDeactiveSubLedger(subLedger: SubLedgerModel) {
        let options = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        };
        return this.http.put<DanpheHTTPResponse>(`/api/AccountingSettings/ActivateDeactiveSubLedger`, subLedger, options);
    }
    public getPrimaryGroupList() {
        return this.http.get<any>("/api/AccountingSettings/PrimaryList");
    }
    public GetLedgers() {
        return this.http.get<any>("/api/AccountingSettings/Ledgers", this.options);
    }
    public GetFiscalYearList() {
        return this.http.get<any>("/api/AccountingSettings/FiscalYearList");
    }

    public GetCostCenterItemList() {
        return this.http.get<any>("/api/AccountingSettings/CostCenterItemList");
    }

    //get pharmacy supplier
    GetPharmacySupplier() {
        try {
            return this.http.get<any>("/api/Accounting/PharmacySupplierLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    // GetEmployeeList
    GetEmployeeList() {
        try {
            return this.http.get<any>("/api/Accounting/ConsultantLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetCreditOrgList() {
        try {
            return this.http.get<any>("/api/Accounting/CreditOrganizationLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }

    GetPaymentModes() {
        try {
            return this.http.get<any>("/api/Accounting/get-paymentmodes", this.options);
        } catch (ex) {
            throw ex
        }
    }

    GetBankReconciliationCategory() {
        try {
            return this.http.get<response>("/api/Accounting/GetBankReconciliationCategory", this.options);
        } catch (ex) {
            throw ex
        }
    }

    UpdateBankReconciliationCategory(bankReconciliation: Array<BankReconciliationCategory>) {
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }
        try {
            return this.http.post<response>("/api/Accounting/UpdateBankReconciliationCategory", bankReconciliation, httpOptions);
        } catch (ex) {
            throw ex
        }
    }

    GetInvVendorList() {
        try {
            return this.http.get<any>("/api/Accounting/InventoryVendorLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetInvSubcategoryList() {
        try {
            return this.http.get<any>("/api/Accounting/InventorySubCategoryLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    GetBillingItemsList() {
        try {
            return this.http.get<any>("/api/AccLedgerMapping/BillingIncomeLedgers", this.options);
        } catch (ex) {
            throw ex
        }
    }
    //fiscal year activity detaols
    public getfsyearactivitydetail() {
        return this.http.get<any>("/api/Accounting/FiscalYearLogs");
    }

    //public GetLedgerGroupwithMultipleVoucher() {
    //    return this.http.get<any>("/api/AccountingSettings?reqType=GetLedgerGroupwithMultipleVoucher");
    //}
    //POST
    public PostLedgers(CurrentLedger) {
        let data = JSON.stringify(CurrentLedger);
        return this.http.post<any>("/api/AccountingSettings/Ledgers", data);
    }

    public PostSection(CurrentSection) {
        let data = JSON.stringify(CurrentSection);
        return this.http.post<any>("/api/AccountingSettings/Section", data);
    }
    public PostLedgersList(CurrentLedger) {
        let data = JSON.stringify(CurrentLedger);
        return this.http.post<any>("/api/AccountingSettings/LedgersList", data);
    }
    public PostFiscalYear(currentFiscalYear) {
        let data = JSON.stringify(currentFiscalYear);
        return this.http.post<any>("/api/AccountingSettings?reqType=AddFiscalYear", data);
    }
    public PostCostCenterItem(currentCostCenterItem) {
        let data = JSON.stringify(currentCostCenterItem);
        return this.http.post<any>("/api/AccountingSettings/CostCenterItem", data);
    }
    public PostLedgersGroupCategory(ledgerGrpCategory) {
        let data = JSON.stringify(ledgerGrpCategory);
        return this.http.post<any>("/api/AccountingSettings/LedgerGroupCategory", data);
    }

    ////PUT
    public PutLedgerIsActive(selectedLedger) {
        let data = JSON.stringify(selectedLedger);
        return this.http.put<any>("/api/AccountingSettings/LedgerISActive", data);
    }
    public PutReopenFiscalYear(selectedFiscalYr) {
        let data = JSON.stringify(selectedFiscalYr);
        return this.http.put<any>("/api/AccountingSettings/ReopenFiscalYear", data);
    }
    public PutFiscalYearStatus(selectedFiscalYr) {
        let data = JSON.stringify(selectedFiscalYr);
        return this.http.put<any>("/api/AccountingSettings?reqType=updateFiscalYearStatus", data);
    }
    public PutCostCenterItemStatus(selectedCostCenterItm) {
        let data = JSON.stringify(selectedCostCenterItm);
        return this.http.put<any>("/api/AccountingSettings/CostCenterItemStatus", data);
    }
    public PutLedgerGrpCategoryIsActive(selectedLedgerGrpCategory) {
        let data = JSON.stringify(selectedLedgerGrpCategory);
        return this.http.put<any>("/api/AccountingSettings/LedgerGroupCategoryActivateDeactivate", data);
    }
    public PutLedger(CurrentLedger) {
        let data = JSON.stringify(CurrentLedger);
        return this.http.put<any>("/api/AccountingSettings/Ledger", data);
    }

    public PutVoucherHead(CurrentVoucherhead) {
        let data = JSON.stringify(CurrentVoucherhead);
        return this.http.put<any>("/api/AccountingSettings/VoucherHead", data);
    }
    //update section 
    public PutSection(CurrentSection) {
        let data = JSON.stringify(CurrentSection);
        return this.http.put<any>("/api/AccountingSettings/Section", data);
    }
    public PutCOA(coa) {
        let data = JSON.stringify(coa);
        return this.http.put<any>("/api/AccountingSettings/ChartOfAccount", data);
    }
    //#endregion Ledger Settings Calls

    //#region  Vouchar Settings Calls
    //GET
    //public GetVouchersList() {
    //    return this.http.get<any>("/api/AccountingSettings?reqType=VouchersList");
    //}
    public GetVouchers() {
        return this.http.get<any>("/api/AccountingSettings/Vouchers");
    }

    public GetVoucherHead() {
        return this.http.get<any>("/api/AccountingSettings/VoucherHeads");
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
        return this.http.get<any>("/api/AccountingSettings/LedgerGroupsDetails");
    }
    public GetChartofAccount() {
        return this.http.get<any>("/api/AccountingSettings/ChartofAccount");
    }
    public getTrasferRuleData(sectionId) {
        return this.http.get<any>("/api/AccountingSettings/TransferRules?SectionId=" + sectionId);
    }
    //POST
    public PostVouchers(CurrentVoucher) {
        let data = JSON.stringify(CurrentVoucher);
        return this.http.post<any>("/api/AccountingSettings/Vouchers", data);
    }
    public PostCOA(coa) {
        let data = JSON.stringify(coa);
        return this.http.post<any>("/api/AccountingSettings/ChartOfAccount", data);
    }
    public PostVoucherHead(CurrentVoucherhead) {
        let data = JSON.stringify(CurrentVoucherhead);
        return this.http.post<any>("/api/AccountingSettings/VoucherHead", data);
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
            return this.http.get<any>("/api/Accounting/ProvisionalLedgerCode");
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
        return this.http.get<any>("/api/AccountingSettings/LedgerGroups");
    }

    //Post
    public PostLedgersGroup(ledgerGrpObjString: string) {
        let data = ledgerGrpObjString;
        return this.http.post<any>("/api/AccountingSettings/LedgersGroup", data);
    }

    //Put
    public PutLedgerGrpIsActive(selectedLedgerGrp) {
        let data = JSON.stringify(selectedLedgerGrp);
        return this.http.put<any>("/api/AccountingSettings/LedgerGroupActivateDeactivate", data);
    }
    PutLedgersGroup(currentLedgerGroup) {
        let data = JSON.stringify(currentLedgerGroup);
        return this.http.put<any>("/api/AccountingSettings/LedgerGroup", data);
    }

    public PutTransferRuleIsActive(ruleName) {
        let data = JSON.stringify(ruleName);
        return this.http.put<any>("/api/AccountingSettings/TransferRuleActivateDeactivate", data);
    }
    //#endregion LedgerGroup Settings Calls
    public PutVoucherShowchequeNo(selectedLedger) {
        let data = JSON.stringify(selectedLedger);
        return this.http.put<any>("/api/AccountingSettings/VoucherShowChequeNo", data);
    }
    public PutVoucherShowPayeeName(selectedLedger) {
        let data = JSON.stringify(selectedLedger);
        return this.http.put<any>("/api/AccountingSettings/VoucherShowPayeeName", data);
    }
    public PostCostCenter(currentCostCenter) {
        // let data = JSON.stringify(currentCostCenter);
        return this.http.post("/api/AccountingSettings/CostCenter", currentCostCenter);
    }
    public GetCostCenters() {
        return this.http.get("/api/AccountingSettings/CostCenters");
    }

    public GetParentCostCenter() {
        return this.http.get("/api/AccountingSettings/GetParentCostCenters");
    }

    PutCostCenter(currentCostCenter) {
        // let data = JSON.stringify(currentCostCenter);
        return this.http.put("/api/AccountingSettings/CostCenter", currentCostCenter);
    }

    ActivateDeactivateCostCenter(currentCostCenter) {
        let data = JSON.stringify(currentCostCenter);
        return this.http.put("/api/AccountingSettings/CostCenter/ActivateDeactivate", data);
    }
    UpdateBillingLedgerMappingStatus(BillLedgerMappingId: number, IsActive: boolean) {
        return this.http.put<DanpheHTTPResponse>(`/api/AccLedgerMapping/ActivateDeactivateBillingLedgerMapping?BillLedgerMappingId=${BillLedgerMappingId}&IsActive=${IsActive}`, this.options);
    }
    UpdateMedicareType(medicareType: Array<MedicalCareType>) {
        const httpOptions = {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        }
        try {
            return this.http.post<response>("/api/Accounting/UpdateMedicareTypes", medicareType, httpOptions);
        } catch (ex) {
            throw ex
        }
    }
    AddSubLedgers(subLedgers: Array<SubLedgerForMakePayment>) {
        return this.http.post<DanpheHTTPResponse>("/api/AccountingSettings/SubLedger", subLedgers, this.jsonOptions);
    }
}
