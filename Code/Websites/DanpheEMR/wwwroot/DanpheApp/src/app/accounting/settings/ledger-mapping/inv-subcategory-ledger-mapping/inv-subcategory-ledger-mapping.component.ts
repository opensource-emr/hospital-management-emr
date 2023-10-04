import { ChangeDetectorRef, Component } from "@angular/core";
import { AccountingBLService } from "../../../../accounting/shared/accounting.bl.service";
import { AccountingService } from "../../../../accounting/shared/accounting.service";
import { CoreService } from "../../../../core/shared/core.service";
import { SecurityService } from "../../../../security/shared/security.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_Data_Type } from "../../../../shared/shared-enums";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { CostCenterModel } from "../../shared/cost-center.model";
import { LedgerModel } from "../../shared/ledger.model";
import { ledgerGroupModel } from "../../shared/ledgerGroup.model";


@Component({
    selector: 'inventory-subcategory-ledger-mapping',
    templateUrl: "./inv-subcategory-ledger-mapping.component.html"
})

export class InventorySubcategoryLedgerMappingComponent {

    public loading: boolean = false;

    public CurrentLedger: LedgerModel;
    public CurrentLedgerGroup: ledgerGroupModel;
    public selLedgerGroup: any;
    public showAddLedgerGroupPopUp: boolean = false;
    public selLedger: Array<LedgerModel> = new Array<LedgerModel>();
    public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public primaryGroupList: any[];
    public coaList: any[];
    public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();

    public Dr: boolean;
    public Cr: boolean;

    public ledgerMappingList: any;

    // for sub-navigation data info
    public isSelectAll: boolean = false;
    public ledgerTypeParamter: any;
    public selectedLedgerCount: number = 0;
    public selectedLedgerData: any;
    public totalLedger: number;
    public mappedLedger: number;
    public notmappedLedger: number;
    public ledgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();
    public costCenters: Array<CostCenterModel> = new Array<CostCenterModel>();
    public selectedCostCenter: Array<CostCenterModel> = new Array<CostCenterModel>();


    // START: Inventory Subcategory Ledger 
    public typeinventorysubcategory: boolean = false;
    public showinventorysubcategoryAllLedgers: boolean = false;
    public inventorysubcategoryledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public inventorySubList: any;
    // END: Inventory Subcategory Ledger

    public provisionalLedgerCode: number = 0;

    public ConsultantfilterType: string = "all";
    public disabledRow: boolean = true;
    public allcoaList: any[];

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public coreService: CoreService,
        public accountingService: AccountingService) {
        //this.GetProvisionalLedgerCode();
        this.GetLedgerGroup();
        this.getLedgerList();
        this.Getledgers();
        this.GetLedgerMapping();
        this.getPrimaryGroupList();
        this.getCoaList();
        this.costCenters = this.accountingService.accCacheData.CostCenters ? this.accountingService.accCacheData.CostCenters : [];
    }

    public getCoaList() {
        if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
            this.allcoaList = this.accountingService.accCacheData.COA; //mumbai-team-june2021-danphe-accounting-cache-change
            this.allcoaList = this.allcoaList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public getPrimaryGroupList() {
        if (!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.primaryGroupList = this.accountingService.accCacheData.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
            this.primaryGroupList = this.primaryGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public Getledgers() {
        try {
            let ledgers = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "LedgerGroupMapping");
            if (ledgers.length > 0) {
                this.ledgerTypeParamter = JSON.parse(ledgers[0].ParameterValue);
            } else {
                this.msgBoxServ.showMessage("error", ['Ledgers type not found.']);
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    ngOnInit() {
        this.NewledgerList = new Array<LedgerModel>();
        this.Cr = this.Dr = null;
        this.loading = false;
        this.CurrentLedger = new LedgerModel();
        this.CurrentLedgerGroup = new ledgerGroupModel();
        this.CurrentLedger.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        this.SetInventorySubcategoryData();

    }
    GetLedgerGroup() {
        if (!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
            this.CallBackLedgerGroup(this.accountingService.accCacheData.LedgerGroups);//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }

    CallBackLedgerGroup(res) {
        this.sourceLedGroupList = new Array<LedgerModel>();
        this.sourceLedGroupList = res;
        this.sourceLedGroupList = this.sourceLedGroupList.slice();
        this.ledgergroupList = [];
        this.coaList = [];
        this.ledgerList = new Array<LedgerModel>();
    }
    //adding new Ledger
    AddLedger() {
        this.NewledgerList = this.inventorySubList.filter(a => a.isSelectAll = true);
        this.CheckDrCrValidation();
        if (this.CurrentLedger.LedgerGroupId == 0 || this.CurrentLedger.LedgerGroupId == null) {
            this.msgBoxServ.showMessage("error", ["Please select ledger group"]);
        }
        else {
            let ledgerValidation = true;
            //for checking validations, marking all the fields as dirty and checking the validity.
            for (var ledger of this.NewledgerList) {
                for (var b in ledger.LedgerValidator.controls) {
                    ledger.LedgerValidator.controls[b].markAsDirty();
                    ledger.LedgerValidator.controls[b].updateValueAndValidity();
                }
                if (ledger.IsValidCheck(undefined, undefined)) {
                    ledgerValidation = false;
                    return;
                }
            };
            if (ledgerValidation) {
                this.loading = true;
                ///During First Time Add Current Balance and Opening Balance is Equal                 
                this.accountingSettingsBLService.AddLedgerList(this.NewledgerList)
                    .subscribe(
                        res => {
                            if (res.Status == "OK") {
                                this.msgBoxServ.showMessage("success", ["Ledgers Added"]);
                                this.CallBackAddLedger(res);
                                //this.GetProvisionalLedgerCode();
                                this.loading = false;
                            }
                            else {
                                this.msgBoxServ.showMessage("error", ["Duplicate ledger not allowed"]);
                                this.loading = false;
                            }
                        },
                        err => {
                            this.logError(err);
                            this.loading = false;
                        });
            } else {
                this.loading = false;
            }
        }
    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedger(res) {
        if (res.Status == "OK" && res.Results != null) {
            res.Results.forEach(ledger => {//mumbai-team-june2021-danphe-accounting-cache-change
                ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
                ledger.COA = this.CurrentLedger.COA;
                ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
                this.getLedgerList();
                this.sourceLedgerList.push(ledger);
                this.accountingService.accCacheData.LedgersALL.push(ledger);//mumbai-team-june2021-danphe-accounting-cache-change
            });
        }
        else if (res.Status == "OK" && res.Results == null) {
            this.msgBoxServ.showMessage("notice-message", ["Ledger under LedgerGroup already exist.Please deactivate the previous ledger to add a new one with same name"]);
        }
        else {
            this.msgBoxServ.showMessage("error", ["Check log for details"]);
            console.log(res.ErrorMessage);
        }
    }
    logError(err: any) {
        console.log(err);
    }
    CheckProperSelectedLedger(selLedgerGroup) {
        try {
            for (var i = 0; i < this.ledgergroupList.length; i++) {
                if (this.ledgergroupList[i].LedgerGroupId == selLedgerGroup.LedgerGroupId) {
                    this.CurrentLedger.checkSelectedLedger = false;
                    break;
                }
                else {
                    ////if LedgerGroupId is Undefined meanse Wrong Ledger Is Selected
                    if (selLedgerGroup.LedgerGroupId == undefined) {
                        this.CurrentLedger.checkSelectedLedger = true;
                        break;
                    }
                }
            }
        }
        catch (exception) {
            this.ShowCatchErrMessage(exception);
        }
    }
    ShowCatchErrMessage(exception) {
        if (exception) {
            let ex: Error = exception;
            console.log("Error Messsage =>  " + ex.message);
            console.log("Stack Details =>   " + ex.stack);
        }
    }
    public AssignSelectedLedgerGroup() {
        if (this.CurrentLedger.LedgerGroupName) {
            let AllowToCreateLedgers = JSON.parse(this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "AllowToCreateAllLedgersFromDefaultTab")[0].ParameterValue);
            this.selLedgerGroup = this.ledgergroupList.filter(s => s.LedgerGroupName == this.CurrentLedger.LedgerGroupName)[0];

            if (!AllowToCreateLedgers) {
                let ledgerGroupUnqName = this.ledgerTypeParamter.filter(l => l.LedgergroupUniqueName == this.selLedgerGroup.Name);
                if (ledgerGroupUnqName.length > 0) {
                    this.disabledRow = false;
                    this.msgBoxServ.showMessage('Notice', ['Create ledger for this ledgerGroup from respective tab']);
                }
                else {
                    this.disabledRow = true;
                }
            }

            if ((this.selLedgerGroup.LedgerGroupId != 0) && (this.selLedgerGroup.LedgerGroupId != null)) {
                this.CurrentLedger.LedgerGroupId = this.selLedgerGroup.LedgerGroupId;
                this.CurrentLedger.LedgerGroupName = this.selLedgerGroup.LedgerGroupName;
                this.ledgerList = this.sourceLedgerList.filter(a => a.LedgerGroupName == this.CurrentLedger.LedgerGroupName);
            }
            this.NewledgerList.forEach(a => {
                a.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
                a.COA = this.CurrentLedger.COA;
                a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
                a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                a.CreatedBy = this.CurrentLedger.CreatedBy;
            });

        }
    }
    public PrimaryGroupChanged() {
        this.coaList = [];
        this.ledgergroupList = [];
        this.selLedgerGroup = null;
        this.CurrentLedger.LedgerGroupName = null;
        let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
        this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
        this.CurrentLedger.COA = this.coaList[0].ChartOfAccountName;
        this.COAChanged();
    }
    public COAChanged() {
        if (this.CurrentLedger.COA) {
            this.ledgergroupList = [];
            this.selLedgerGroup = null;
            this.CurrentLedger.LedgerGroupName = null;
            this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedger.COA);
        }
    }
    //on default ledger creation time
    public CheckDuplicateLedger(index: number) {
        if (this.NewledgerList[index].LedgerName) {
            this.changeDetector.detectChanges();
            let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
            let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;

            if (count > 0 || check > 1) {
                this.NewledgerList[index].LedgerName = null;
                this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
                this.loading = false;
            }

        }
    }
    public getLedgerList() {
        if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.sourceLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
            this.sourceLedgerList = this.sourceLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    LedgerGroupListFormatter(data: any): string {
        return data["LedgerGroupName"];
    }
    LedgerListFormatter(data: any): string {
        return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
    }
    LedgerListFormatter2(data: any): string {

        return data["EmployeeName"];;
    }
    ChangeOpeningBalType(e, index: number) {
        this.loading = false;
        if (e.target.name == "Dr") {
            if (e.target.checked) {
                this.inventorySubList[index].DrCr = true;
                this.inventorySubList[index].DrCr = true;
                this.inventorySubList[index].Cr = false;
                this.inventorySubList[index].Dr = true;
            }
        }
        if (e.target.name == "Cr") {
            if (e.target.checked) {
                this.inventorySubList[index].DrCr = false;
                this.inventorySubList[index].Dr = false;
                this.inventorySubList[index].Cr = true;
            }
        }
    }
    CheckDrCrValidation() {
        if (this.NewledgerList.length > 0) {
            this.NewledgerList.forEach(itm => {
                if (itm.OpeningBalance > 0) {
                    //set validator on
                    itm.UpdateValidator("on", "Dr", "required");
                    itm.UpdateValidator("on", "Cr", "required");
                }
                else {
                    //set validator off
                    itm.UpdateValidator("off", "Dr", "required");
                    itm.UpdateValidator("off", "Cr", "required");
                }
            })
        }
    }

    GetLedgerMapping() {
        this.accountingBLService.GetLedgerMappingDetails()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.ledgerMappingList = res.Results;
                }
            });
    }

    DeleteLedgerRow(index: number) {
        try {
            if (this.NewledgerList.length > 1) {
                this.NewledgerList.splice(index, 1);
                this.selLedger.splice(index, 1);
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    //sud:1June'20- implementaiton changed after Searchbox is  replaced by Textbox for Searching
    public ledgerSearchKey: string = null;
    filterSelectedLedger(searchKey: string) {
        try {
            if (searchKey && searchKey.trim()) {

                if (this.ConsultantfilterType == 'withacchead') {
                    this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType == 'withoutacchead') {
                    this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
                }
                else {
                    this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
                }
            }
            else {
                if (this.ConsultantfilterType == 'withacchead') {
                    this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType == 'withoutacchead') {
                    this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.LedgerId == 0);
                }
                else {
                    this.inventorySubList = this.inventorysubcategoryledgerList;
                }
            }
        }
        catch (ex) {

        }
    }

    AssignSelectedLedger(index) {
        try {

            var ledgerNameSelected = (typeof (this.inventorySubList[index].LedgerName) == 'object') ? this.inventorySubList[index].LedgerName.LedgerName.trim().toLowerCase() : this.inventorySubList[index].LedgerName.trim().toLowerCase();
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() == ledgerNameSelected);
            if (ledger.length > 0) {
                this.inventorySubList[index].Code = ledger[0].Code;
                this.inventorySubList[index].LedgerId = ledger[0].LedgerId;
                this.inventorySubList[index].LedgerName = ledger[0].LedgerName;
            } else {
                this.inventorySubList[index].Code = "";
                this.inventorySubList[index].LedgerId = 0;
            }
        }
        catch (ex) {

        }
    }
    SelectAllChkOnChange() {
        if (this.isSelectAll) {

            this.inventorySubList.forEach(a => {
                a.IsSelected = true;
                a.IsActive = true;
                if (a.IsSelected) {
                    if (a.IsMapped == false) {
                        a.LedgerName = a.SubCategoryName;
                        a.Code = "";
                        a.LedgerId = 0;
                    }
                }
            });

        }
        else {
            this.inventorySubList.forEach(a => {
                if (a.IsMapped == false) {
                    a.LedgerName = "";
                    a.Code = "";
                    a.LedgerId = 0;
                }
                a.IsSelected = false;
            });
        }
        this.ShowSaveButtonOnCkboxChange();
    }

    SingleCkboxChange(index) {
        this.selectedLedgerCount = this.inventorySubList.filter(a => a.IsSelected == true).length;

        if (this.inventorySubList[index].IsSelected) {
            if (this.inventorySubList[index].IsMapped == false) {
                this.inventorySubList[index].LedgerName = "";//remove autocomplete Ledgername
                this.inventorySubList[index].Code = "";
                this.inventorySubList[index].LedgerId = 0;
            }
        }
        else if ((this.inventorySubList[index].IsSelected == false)) {
            if (this.inventorySubList[index].IsMapped == false) {
                this.inventorySubList[index].LedgerName = "";
                this.inventorySubList[index].Code = "";
                this.inventorySubList[index].LedgerId = 0;
            }
            else {
                // ledgerListAutoComplete empty becaose of in invsubcategory ledgergroup on coa
                // var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.inventorySubList[index].LedgerName);
                // if (ledger.length == 0) {
                //   let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.inventorySubList[index].LedgerId);
                //   this.inventorySubList[index].Code = data[0].Code;
                //   this.inventorySubList[index].LedgerId = data[0].LedgerId;
                //   this.inventorySubList[index].LedgerName = data[0].LedgerName;
                // }
            }
        }
    }

    ShowSaveButtonOnCkboxChange() {
        this.isSelectAll = this.inventorySubList.every(a => a.IsSelected == true);
        this.selectedLedgerCount = this.inventorySubList.filter(a => a.IsSelected == true).length;
    }

    // START:Inventory Subcategory ledger
    SetInventorySubcategoryData() {
        this.selectedLedgerCount = 0;
        this.changeDetector.detectChanges();
        this.getInventorySubcategorylist();
        this.CurrentLedger = new LedgerModel();
        let LedgerGroupData = this.ledgerTypeParamter.find(a => a.LedgerType == 'inventorysubcategory').LedgergroupUniqueName;
        let consultLedger = this.sourceLedGroupList.find(a => a.LedgerGroupName == LedgerGroupData);

        if (consultLedger != null || consultLedger != undefined) {
            let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
            this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

            this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == consultLedger.COA);
            this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
            this.CurrentLedger.COA = consultLedger.COA;
            this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
            this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");

        }
        else {
            this.msgBoxServ.showMessage('notice', ['Please first create ledger group for Inventory Subcategory ']);
        }
    }
    onledgerGroupChange() {
        this.inventorySubList.forEach(a => {
            a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
            a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        });
        this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");

    }
    //get inventory subcategory list
    getInventorySubcategorylist() {
        this.accountingSettingsBLService.GetInvSubcategoryList()
            .subscribe(res => {
                if (res.Status == "OK") {

                    this.inventorysubcategoryledgerList = new Array<LedgerModel>();
                    let data = res.Results;
                    data.forEach((emp, index) => {
                        var led = new LedgerModel();
                        led = Object.assign(led, emp);
                        led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
                            led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
                            led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : "",
                            led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.SubCategoryId,
                            led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
                            led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
                        led.Cr = (emp.DrCr == false) ? true : null;
                        led.LedgerType = "inventorysubcategory",
                            this.inventorysubcategoryledgerList.push(led);
                        let costCenter = this.costCenters.find(a => a.CostCenterId === emp.CostCenterId);
                        if (costCenter) {
                            this.selectedCostCenter[index] = costCenter;
                        }
                    });
                    this.inventorySubList = this.inventorysubcategoryledgerList;
                    if (this.inventorySubList.length > 0) {
                        this.showinventorysubcategoryAllLedgers = true;
                    }
                    this.totalLedger = this.inventorySubList.length;
                    this.mappedLedger = this.inventorySubList.filter(l => l.IsMapped == true).length;
                    this.notmappedLedger = this.inventorySubList.filter(l => l.IsMapped == false).length;
                }
            });
    }


    ToggleInventorySubcategory(mapped) {
        if (mapped == 'true') {
            this.ConsultantfilterType = 'withacchead';
            this.inventorySubList = this.inventorysubcategoryledgerList.filter(emp => emp.LedgerId > 0);
            this.selectedLedgerData = null;
        }
        else if (mapped == 'false') {
            this.ConsultantfilterType = 'withoutacchead';
            this.inventorySubList = this.inventorysubcategoryledgerList.filter(emp => emp.LedgerId == 0);
            this.selectedLedgerData = null;
        }
        else {
            this.ConsultantfilterType = 'all';
            this.inventorySubList = this.inventorysubcategoryledgerList;
            this.selectedLedgerData = null;
        }
    }
    //END : Inventory subcategory Ledger 

    //Get Provisional Ledger code , this code used for show for new ledger before ledger creation
    //provisional ledger code is not final may be it will different than showed 
    GetProvisionalLedgerCode() {
        try {
            this.accountingSettingsBLService.GetProvisionalLedgerCode()
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.provisionalLedgerCode = parseInt(res.Results);
                    }
                    else {
                        this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                    }
                },
                    err => {
                        this.ShowCatchErrMessage(err);
                    });
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }

    AssignCostCenter(index) {
        if (typeof this.selectedCostCenter[index] === ENUM_Data_Type.Object && this.selectedCostCenter[index] !== null) {
            this.inventorySubList[index].CostCenterId = this.selectedCostCenter[index].CostCenterId
        }
    }
}
