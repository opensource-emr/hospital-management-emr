import { Injectable, Directive } from '@angular/core';
import { LedgerModel } from "../shared/ledger.model";
import { FiscalYearModel } from "../shared/fiscalyear.model";
import { CostCenterItemModel } from "../shared/cost-center-item.model";
import { ledgerGroupModel } from "../shared/ledgerGroup.model";
import { ledgerGroupCategoryModel } from "../shared/ledger-group-category.model";
import { VoucherLedgerGroupMapModel } from "../shared/voucher-ledger-group-map.model";
import { AccountingSettingsDLService } from '../shared/accounting-settings.dl.service'
import { ItemModel } from "../shared/item.model";
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { VoucherModel } from './voucher.model';
import { VoucherHeadModel } from './voucherhead.model';
import { SectionModel } from './section.model';
import { ChartofAccountModel } from './chart-of-account.model';

@Injectable()
export class AccountingSettingsBLService {

    constructor(public accountingSettingsDLService: AccountingSettingsDLService) {
    }
    //#region Ledger Settings Calls
    //Get
    public GetLedgerList() {
        return this.accountingSettingsDLService.GetLedgersList()
            .map(res => { return res});
    }   
    public getPrimaryGroupList() {
        return this.accountingSettingsDLService.getPrimaryGroupList()
            .map(res => { return res});
    }  
    public GetLedgers() {
        return this.accountingSettingsDLService.GetLedgers()
            .map(res => { return res });
    }
    public GetFiscalYearList() {
        return this.accountingSettingsDLService.GetFiscalYearList()
            .map(res => { return res });
    }
    public GetCostCenterItemList() {
        return this.accountingSettingsDLService.GetCostCenterItemList()
            .map(res => { return res });
    }

    //get pharmacy supplier
    GetPharmacySupplier() {
        try {
            return this.accountingSettingsDLService.GetPharmacySupplier()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
      
    //
    GetEmployeeList() {
        try {
            return this.accountingSettingsDLService.GetEmployeeList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    GetCreditOrgList() {
        try {
            return this.accountingSettingsDLService.GetCreditOrgList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }
    GetInvVendorList(){
        try{
            return this.accountingSettingsDLService.GetInvVendorList()
                .map((responseData) =>{
                    return responseData;
                });
        }
        catch (ex){
            throw ex;
        }
    }
    //get inventory subcategory list
    GetInvSubcategoryList(){
    try{
        return this.accountingSettingsDLService.GetInvSubcategoryList()
            .map((responseData) =>{
                return responseData;
            });
    }
    catch (ex){
        throw ex;
    }
    }
    GetBillingItemsList(){
        try {
            return this.accountingSettingsDLService.GetBillingItemsList()
                .map((responseData) => {
                    return responseData;
                });
        } catch (ex) {
            throw ex;
        }
    }

//get fiscal year activity details 
public getfsyearactivitydetail() {
    return this.accountingSettingsDLService.getfsyearactivitydetail()
        .map(res => { return res});
} 
    //public GetLedgerGroupwithMultipleVoucher() {

    //    return this.accountingSettingsDLService.GetLedgerGroupwithMultipleVoucher()
    //        .map((responseData) => {
    //            return responseData;
    //        });
    //}
    //Post
    public AddLedgers(CurrentLedger: LedgerModel) {  //for Single Ledger 
        //omiting the LedgerValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentLedger, ['LedgerValidator']);
        return this.accountingSettingsDLService.PostLedgers(temp)
            .map(res => { return res });
    }
   
    public AddSection(CurrentSection :SectionModel) {  
      //  omiting the SectionValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentSection, ['SectionValidator']);
        return this.accountingSettingsDLService.PostSection(temp)
            .map(res => { return res });
    } 
    public AddLedgerList(CurrentLedgers: Array<LedgerModel>) { //postong Multiple Ledgers
        //omiting the LedgerValidator during post because it causes cyclic error during serialization in server side.
        var newLed: any = CurrentLedgers.map(led => {
            return _.omit(led, ['LedgerValidator']);
        });
        return this.accountingSettingsDLService.PostLedgersList(newLed)
            .map(res => { return res });
    }
    public AddFiscalYear(fiscalyear: FiscalYearModel) {
        //omiting the FiscalYearValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(fiscalyear, ['FiscalYearValidator']);
        return this.accountingSettingsDLService.PostFiscalYear(temp)
            .map(res => { return res });
    }
    public AddCostCenterItem(costCenterItem: CostCenterItemModel) {
        //omiting the FiscalYearValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(costCenterItem, ['CostCenterItemValidator']);
        return this.accountingSettingsDLService.PostCostCenterItem(temp)
            .map(res => { return res });
    }
    public AddLedgersGroupCategory(currentLedgerGroupCategory: ledgerGroupCategoryModel) {
        var temp = _.omit(currentLedgerGroupCategory, ['LedgerGroupCategoryValidator']);
        return this.accountingSettingsDLService.PostLedgersGroupCategory(temp)
            .map(res => { return res });
    }
    //Put
    public UpdateLedgerStatus(selectedLedger) {
        ////var temp = _.omit(user, ['UserProfileValidator']);
        return this.accountingSettingsDLService.PutLedgerIsActive(selectedLedger)
            .map(res => { return res });
    }
    public UpdateFiscalYearStatus(selectedLedger) {
        ////var temp = _.omit(user, ['UserProfileValidator']);
        return this.accountingSettingsDLService.PutFiscalYearStatus(selectedLedger)
            .map(res => { return res });
    }
    public PutReopenFiscalYear(selectedLedger) {
        return this.accountingSettingsDLService.PutReopenFiscalYear(selectedLedger)
            .map(res => { return res });
    }

    public UpdateCostCenterItemStatus(selectedCostCenterItm) {
        return this.accountingSettingsDLService.PutCostCenterItemStatus(selectedCostCenterItm)
            .map(res => { return res });
    }
    public UpdateLedgerGrpCategoryIsActive(selectedLedgerGrpCategory) {
        return this.accountingSettingsDLService.PutLedgerGrpCategoryIsActive(selectedLedgerGrpCategory)
            .map(res => { return res });
    }
    public UpdateLedger(CurrentLedger: LedgerModel) {
        //omiting the LedgerValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentLedger, ['LedgerValidator']);
        return this.accountingSettingsDLService.PutLedger(temp)
            .map(res => { return res });
    }
    public UpdateVoucherHead(CurrentVoucherhead: VoucherHeadModel) {
        //omiting the LedgerValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentVoucherhead, ['VoucherHeadValidator']);
        return this.accountingSettingsDLService.PutVoucherHead(temp)
            .map(res => { return res });
    }
    //update section
    public UpdateSection(CurrentSection: SectionModel) {
        //omiting the SectionValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentSection, ['SectionValidator']);
        return this.accountingSettingsDLService.PutSection(temp)
            .map(res => { return res });
    }
    public UpdateCOA(coa: ChartofAccountModel) {
        var temp = _.omit(coa, ['COAValidator']);
        return this.accountingSettingsDLService.PutCOA(temp)
            .map(res => { return res });
    }
    //#endregion Ledger Settings Calls

    //#region voucher Settings Calls
    //public GetVoucherList() {
    //    return this.accountingSettingsDLService.GetVouchersList()
    //        .map(res => { return res });
    //}
    public GetVouchers() {
        return this.accountingSettingsDLService.GetVouchers()
            .map(res => { return res });
    }

    public GetVoucherHead() {
        return this.accountingSettingsDLService.GetVoucherHead()
            .map(res => { return res });
    }

    public GetVoucherswithVOCMap() {
        return this.accountingSettingsDLService.GetVoucherswithVOCMap()
            .map(res => { return res });
    }
    public GetLedgerGrpVoucherByLedgerGrpId(ledgergroupId: number) {
        return this.accountingSettingsDLService.GetLedgerGrpVoucherByLedgerGrpId(ledgergroupId)
            .map(res => { return res });
    }
    public GetLedgerGrpCategory() {
        return this.accountingSettingsDLService.GetLedgerGrpCategory()
            .map(res => { return res });
    }
    public GetLedgerGroupsDetails() {
        return this.accountingSettingsDLService.GetLedgerGroupsDetails()
            .map(res => { return res });
    }

    public GetChartofAccount() {
        return this.accountingSettingsDLService.GetChartofAccount()
            .map(res => { return res });
    }
    public getTrasferRuleData(sectionId: number) {
        return this.accountingSettingsDLService.getTrasferRuleData(sectionId)
            .map(res => { return res });
    }

    //get provisional ledger code
    public GetProvisionalLedgerCode() {
        try {
            return this.accountingSettingsDLService.GetProvisionalLedgerCode()
                .map(res => { return res });
        } catch (ex) {
            throw ex;
        }
    }
    //Post
    public AddVouchers(CurrentVoucher: VoucherModel) {
        //omiting the VoucherValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentVoucher, ['VoucherValidator']);
        return this.accountingSettingsDLService.PostVouchers(temp)
            .map(res => { return res });
    }
    public AddVoucherHead(CurrentVoucherhead: VoucherHeadModel) {
        //omiting the VoucherValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentVoucherhead, ['VoucherHeadValidator']);
        return this.accountingSettingsDLService.PostVoucherHead(temp)
            .map(res => { return res });
    }
    public PostCOA(COA: ChartofAccountModel) {
        var temp = _.omit(COA, ['COAValidator']);
        return this.accountingSettingsDLService.PostCOA(temp)
            .map(res => { return res });
    }
    //Put


    //#endregion voucher Settings Calls


    //#region Item Settings Calls 
    //Get
    public GetItemList() {
        return this.accountingSettingsDLService.GetItemsList()
            .map(res => { return res });
    }
    public GetItems() {
        return this.accountingSettingsDLService.GetItems()
            .map(res => { return res });
    }

    //Post
    public AddItems(CurrentItem: ItemModel) {
        //omiting the VoucherItemValidator during post because it causes cyclic error during serialization in server side.
        var temp = _.omit(CurrentItem, ['ItemValidator']);
        return this.accountingSettingsDLService.PostItems(temp)
            .map(res => { return res });
    }
    //post mapped vouchers with ledgegroup
    public PostManageVoucher(mappedLedgerGroup) {
        let data = mappedLedgerGroup.map(item => {
            return _.omit(item, ['VoucherLedgerGroupMapValidator']);
        });
        return this.accountingSettingsDLService.PostManageVoucher(data)
            .map(res => { return res });
    }

    //Put
    public UpdateItemStatus(selectedItem) {
        ////var temp = _.omit(user, ['UserProfileValidator']);
        return this.accountingSettingsDLService.PutItemIsActive(selectedItem)
            .map(res => { return res });
    }

    //#endregion Item Settings Calls


    //#region LedgerGroup Settings Calls 
    //Get

    public GetLedgerGroup() {
        return this.accountingSettingsDLService.GetLedgerGroup()
            .map((responseData) => {
                return responseData;
            });
    }

    //Post

    public AddLedgersGroup(currentLedgerGroup: ledgerGroupModel) {
        //omiting the LedgerGroupValidator during post because it causes cyclic error during serialization in server side.

        let newRequisitionSVM: any = currentLedgerGroup;

        let newLedGRP: any = _.omit(currentLedgerGroup, ['LedgerGroupValidator']);

        newRequisitionSVM = newLedGRP;
        let data = JSON.stringify(newRequisitionSVM);
        return this.accountingSettingsDLService.PostLedgersGroup(data)
            .map(res => { return res })
    }

    //Put

    public UpdateLedgerGrpIsActive(selectedLedgerGrp) {
        return this.accountingSettingsDLService.PutLedgerGrpIsActive(selectedLedgerGrp)
            .map(res => { return res });
    }


    UpdateLedgersGroup(currentLedgerGroup) {
        //omiting the LedgerGroupValidator 
        let temp: any = _.omit(currentLedgerGroup, ['LedgerGroupValidator']);

        return this.accountingSettingsDLService.PutLedgersGroup(temp)
            .map(res => { return res })
    }

    public UpdateTransferRuleIsActive(ruleName) {
        return this.accountingSettingsDLService.PutTransferRuleIsActive(ruleName)
            .map(res => { return res });
    }
    //#endregion LedgerGroup Settings Calls
}
