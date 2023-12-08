import { ChangeDetectorRef, Component } from "@angular/core";
import { AccountingBLService } from "../../../../accounting/shared/accounting.bl.service";
import { AccountingService } from "../../../../accounting/shared/accounting.service";
import { CoreService } from "../../../../core/shared/core.service";
import { SecurityService } from "../../../../security/shared/security.service";
import { MessageboxService } from "../../../../shared/messagebox/messagebox.service";
import { ENUM_ACC_ADDLedgerLedgerType, ENUM_DanpheHTTPResponseText, ENUM_Data_Type, ENUM_MessageBox_Status } from "../../../../shared/shared-enums";
import { SubLedger_DTO } from "../../../transactions/shared/DTOs/subledger-dto";
import { AccountingSettingsBLService } from "../../shared/accounting-settings.bl.service";
import { CostCenterModel } from "../../shared/cost-center.model";
import { LedgerModel } from "../../shared/ledger.model";
import { ledgerGroupModel } from "../../shared/ledgerGroup.model";


@Component({
    selector: 'inventory-subcategory-ledger-mapping',
    templateUrl: "./inv-subcategory-ledger-mapping.component.html"
})

export class InventorySubcategoryLedgerMappingComponent {

    public Loading: boolean = false;

    public CurrentLedger: LedgerModel;
    public CurrentLedgerGroup: ledgerGroupModel;
    public SelLedgerGroup: any;
    //public showAddLedgerGroupPopUp: boolean = false;
    public SelLedger: Array<LedgerModel> = new Array<LedgerModel>();
    //public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public LedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public PrimaryGroupList: any[];
    public ChartOfAccountList: any[];
    public LedgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public SourceLedgerGroupList: Array<LedgerModel> = new Array<LedgerModel>();
    public SourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();

    public Dr: boolean;
    public Cr: boolean;

    public LedgerMappingList: any;

    // for sub-navigation data info
    public IsSelectAll: boolean = false;
    public LedgerTypeParamter: any;
    public SelectedLedgerCount: number = 0;
    public SelectedLedgerData: any;
    public TotalLedger: number;
    public MappedLedger: number;
    public NotmappedLedger: number;
    public LedgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();
    public CostCenters: Array<CostCenterModel> = new Array<CostCenterModel>();
    public SelectedCostCenter: Array<CostCenterModel> = new Array<CostCenterModel>();


    // START: Inventory Subcategory Ledger 
    // public typeinventorysubcategory: boolean = false;
    public ShowInventorySubCategoryAllLedgers: boolean = false;
    public InventorySubCategoryLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
    public InventorySubList: any;
    // END: Inventory Subcategory Ledger

    public ProvisionalLedgerCode: number = 0;

    public ConsultantfilterType: string = "all";
    public DisabledRow: boolean = true;
    public AllCostOfAccountingList: any[];
    public SubLedgerAndCostCenterSetting = {
        "EnableSubLedger": false,
        "EnableCostCenter": false
    };
    public SelectedSubLedger: Array<any> = [];
    public SubLedgerListForInventorySubStore: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public SubLedgerMaster: Array<SubLedger_DTO> = new Array<SubLedger_DTO>();
    public InventorySubCategoryLedgerParam = {
        LedgergroupUniqueName: "",
        LedgerType: "",
        COA: "",
        LedgerName: ""
    }

    constructor(public accountingSettingsBLService: AccountingSettingsBLService,
        public securityService: SecurityService,
        public changeDetector: ChangeDetectorRef,
        public msgBoxServ: MessageboxService,
        public accountingBLService: AccountingBLService,
        public coreService: CoreService,
        public accountingService: AccountingService) {
        this.SubLedgerMaster = this.accountingService.accCacheData.SubLedgerAll ? this.accountingService.accCacheData.SubLedgerAll : [];
        //this.GetProvisionalLedgerCode();
        this.GetLedgerGroup();
        this.getLedgerList();
        this.Getledgers();
        this.GetLedgerMapping();
        this.getPrimaryGroupList();
        this.getCoaList();
        this.CostCenters = this.accountingService.accCacheData.CostCenters ? this.accountingService.accCacheData.CostCenters : [];
    }

    public getCoaList() {
        if (!!this.accountingService.accCacheData.COA && this.accountingService.accCacheData.COA.length > 0) { //mumbai-team-june2021-danphe-accounting-cache-change
            this.AllCostOfAccountingList = this.accountingService.accCacheData.COA; //mumbai-team-june2021-danphe-accounting-cache-change
            this.AllCostOfAccountingList = this.AllCostOfAccountingList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public getPrimaryGroupList() {
        if (!!this.accountingService.accCacheData.PrimaryGroup && this.accountingService.accCacheData.PrimaryGroup.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.PrimaryGroupList = this.accountingService.accCacheData.PrimaryGroup;//mumbai-team-june2021-danphe-accounting-cache-change
            this.PrimaryGroupList = this.PrimaryGroupList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
        }
    }
    public Getledgers() {
        try {
            let ledgers = this.coreService.Parameters.filter(p => p.ParameterGroupName === "Accounting" && p.ParameterName === "LedgerGroupMapping");
            if (ledgers.length > 0) {
                this.LedgerTypeParamter = JSON.parse(ledgers[0].ParameterValue);
                this.InventorySubCategoryLedgerParam = this.LedgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.InventoryConsumption);
            } else {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ['Ledgers type not found.']);
            }
            let subLedgerParam = this.coreService.Parameters.find(a => a.ParameterGroupName === "Accounting" && a.ParameterName === "SubLedgerAndCostCenter");
            if (subLedgerParam) {
                this.SubLedgerAndCostCenterSetting = JSON.parse(subLedgerParam.ParameterValue);
            }
        } catch (ex) {
            this.ShowCatchErrMessage(ex);
        }
    }
    ngOnInit() {
        this.NewledgerList = new Array<LedgerModel>();
        this.Cr = this.Dr = null;
        this.Loading = false;
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
        this.SourceLedgerGroupList = new Array<LedgerModel>();
        this.SourceLedgerGroupList = res;
        this.SourceLedgerGroupList = this.SourceLedgerGroupList.slice();
        this.LedgergroupList = [];
        this.ChartOfAccountList = [];
        this.LedgerList = new Array<LedgerModel>();
    }
    //adding new Ledger
    AddLedger() {
        this.NewledgerList = this.InventorySubList.filter(a => a.IsSelectAll = true);
        this.CheckDrCrValidation();
        if (this.CurrentLedger.LedgerGroupId === 0 || this.CurrentLedger.LedgerGroupId === null) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Please select ledger group"]);
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
                this.Loading = true;
                ///During First Time Add Current Balance and Opening Balance is Equal                 
                this.accountingSettingsBLService.AddLedgerList(this.NewledgerList)
                    .subscribe(
                        res => {
                            if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Success, ["Ledgers Added"]);
                                this.CallBackAddLedger(res);
                                //this.GetProvisionalLedgerCode();
                                this.Loading = false;
                            }
                            else {
                                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Duplicate ledger not allowed"]);
                                this.Loading = false;
                            }
                        },
                        err => {
                            this.logError(err);
                            this.Loading = false;
                        });
            } else {
                this.Loading = false;
            }
        }
    }

    //after adding Ledger is succesfully added  then this function is called.
    CallBackAddLedger(res) {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results != null) {
            res.Results.forEach(ledger => {//mumbai-team-june2021-danphe-accounting-cache-change
                ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
                ledger.COA = this.CurrentLedger.COA;
                ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
                this.getLedgerList();
                this.SourceLedgerList.push(ledger);
                this.accountingService.accCacheData.LedgersALL.push(ledger);//mumbai-team-june2021-danphe-accounting-cache-change
            });
        }
        else if (res.Status === ENUM_DanpheHTTPResponseText.OK && res.Results === null) {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ["Ledger under LedgerGroup already exist.Please deactivate the previous ledger to add a new one with same name"]);
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, ["Check log for details"]);
            console.log(res.ErrorMessage);
        }
    }
    logError(err: any) {
        console.log(err);
    }
    CheckProperSelectedLedger(SelLedgerGroup) {
        try {
            for (var i = 0; i < this.LedgergroupList.length; i++) {
                if (this.LedgergroupList[i].LedgerGroupId === SelLedgerGroup.LedgerGroupId) {
                    this.CurrentLedger.checkSelectedLedger = false;
                    break;
                }
                else {
                    ////if LedgerGroupId is Undefined meanse Wrong Ledger Is Selected
                    if (SelLedgerGroup.LedgerGroupId === undefined) {
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
            let AllowToCreateLedgers = JSON.parse(this.coreService.Parameters.filter(p => p.ParameterGroupName === "Accounting" && p.ParameterName == "AllowToCreateAllLedgersFromDefaultTab")[0].ParameterValue);
            this.SelLedgerGroup = this.LedgergroupList.filter(s => s.LedgerGroupName === this.CurrentLedger.LedgerGroupName)[0];

            if (!AllowToCreateLedgers) {
                let ledgerGroupUnqName = this.LedgerTypeParamter.filter(l => l.LedgergroupUniqueName === this.SelLedgerGroup.Name);
                if (ledgerGroupUnqName.length > 0) {
                    this.DisabledRow = false;
                    this.msgBoxServ.showMessage('Notice', ['Create ledger for this ledgerGroup from respective tab']);
                }
                else {
                    this.DisabledRow = true;
                }
            }

            if ((this.SelLedgerGroup.LedgerGroupId != 0) && (this.SelLedgerGroup.LedgerGroupId != null)) {
                this.CurrentLedger.LedgerGroupId = this.SelLedgerGroup.LedgerGroupId;
                this.CurrentLedger.LedgerGroupName = this.SelLedgerGroup.LedgerGroupName;
                this.LedgerList = this.SourceLedgerList.filter(a => a.LedgerGroupName === this.CurrentLedger.LedgerGroupName);
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
        this.ChartOfAccountList = [];
        this.LedgergroupList = [];
        this.SelLedgerGroup = null;
        this.CurrentLedger.LedgerGroupName = null;
        let primaryGroupId = this.PrimaryGroupList.filter(p => p.PrimaryGroupName === this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
        this.ChartOfAccountList = this.AllCostOfAccountingList.filter(c => c.PrimaryGroupId === primaryGroupId);
        this.CurrentLedger.COA = this.ChartOfAccountList[0].ChartOfAccountName;
        this.COAChanged();
    }
    public COAChanged() {
        if (this.CurrentLedger.COA) {
            this.LedgergroupList = [];
            this.SelLedgerGroup = null;
            this.CurrentLedger.LedgerGroupName = null;
            this.LedgergroupList = this.SourceLedgerGroupList.filter(a => a.COA === this.CurrentLedger.COA);
        }
    }
    //on default ledger creation time
    public CheckDuplicateLedger(index: number) {
        if (this.NewledgerList[index].LedgerName) {
            this.changeDetector.detectChanges();
            let count = this.SourceLedgerList.filter(s => s.LedgerName === this.NewledgerList[index].LedgerName).length;
            let check = this.NewledgerList.filter(s => s.LedgerName === this.NewledgerList[index].LedgerName).length;

            if (count > 0 || check > 1) {
                this.NewledgerList[index].LedgerName = null;
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Duplicate ledger not allowed']);
                this.Loading = false;
            }

        }
    }
    public getLedgerList() {
        if (!!this.accountingService.accCacheData.LedgersALL && this.accountingService.accCacheData.LedgersALL.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
            this.SourceLedgerList = this.accountingService.accCacheData.LedgersALL;//mumbai-team-june2021-danphe-accounting-cache-change
            this.SourceLedgerList = this.SourceLedgerList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
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
        this.Loading = false;
        if (e.target.name === "Dr") {
            if (e.target.checked) {
                this.InventorySubList[index].DrCr = true;
                this.InventorySubList[index].DrCr = true;
                this.InventorySubList[index].Cr = false;
                this.InventorySubList[index].Dr = true;
            }
        }
        if (e.target.name === "Cr") {
            if (e.target.checked) {
                this.InventorySubList[index].DrCr = false;
                this.InventorySubList[index].Dr = false;
                this.InventorySubList[index].Cr = true;
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
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.LedgerMappingList = res.Results;
                }
            });
    }

    DeleteLedgerRow(index: number) {
        try {
            if (this.NewledgerList.length > 1) {
                this.NewledgerList.splice(index, 1);
                this.SelLedger.splice(index, 1);
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

                if (this.ConsultantfilterType === 'withacchead') {
                    this.InventorySubList = this.InventorySubCategoryLedgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType === 'withoutacchead') {
                    this.InventorySubList = this.InventorySubCategoryLedgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId === 0);
                }
                else {
                    this.InventorySubList = this.InventorySubCategoryLedgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
                }
            }
            else {
                if (this.ConsultantfilterType === 'withacchead') {
                    this.InventorySubList = this.InventorySubCategoryLedgerList.filter(l => l.LedgerId > 0);
                }
                else if (this.ConsultantfilterType === 'withoutacchead') {
                    this.InventorySubList = this.InventorySubCategoryLedgerList.filter(l => l.LedgerId == 0);
                }
                else {
                    this.InventorySubList = this.InventorySubCategoryLedgerList;
                }
            }
        }
        catch (ex) {

        }
    }

    AssignSelectedLedger(index) {
        try {
            let oldLedgerId = this.InventorySubList[index] ? this.InventorySubList[index].LedgerId : 0;
            var ledgerNameSelected = (typeof (this.InventorySubList[index].LedgerName) === 'object') ? this.InventorySubList[index].LedgerName.LedgerName.trim().toLowerCase() : this.InventorySubList[index].LedgerName.trim().toLowerCase();
            var ledger = this.LedgerListAutoComplete.filter(l => l.LedgerName.trim().toLowerCase() === ledgerNameSelected);
            if (ledger.length > 0) {
                this.InventorySubList[index].Code = ledger[0].Code;
                this.InventorySubList[index].LedgerId = ledger[0].LedgerId;
                this.InventorySubList[index].LedgerName = ledger[0].LedgerName;
            } else {
                this.InventorySubList[index].Code = "";
                this.InventorySubList[index].LedgerId = 0;
            }
            if (oldLedgerId !== this.InventorySubList[index].LedgerId) {
                this.InventorySubList[index].SubLedgerName = "";
                this.InventorySubList[index].SubLedgerId = 0;
                this.SelectedSubLedger[index] = new SubLedger_DTO();
            }
        }
        catch (ex) {

        }
    }

    SelectAllChkOnChange() {
        if (this.IsSelectAll) {
            let ledgerObj = this.LedgerListAutoComplete.find(a => a.Name === this.InventorySubCategoryLedgerParam.LedgerName)
            if (this.SubLedgerAndCostCenterSetting.EnableSubLedger && !ledgerObj) {
                this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, [`Please set default ledger in LedgerGroupMapping parameter for inventory consumption.`]);
            }
            else {
                this.InventorySubList.forEach((a, index) => {
                    a.IsSelected = true;
                    a.IsActive = true;
                    if (a.IsSelected) {
                        if (a.IsMapped === false) {
                            a.LedgerName = this.SubLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj.LedgerName) : a.StoreName;
                            a.Code = this.SubLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.Code : "") : "";
                            a.LedgerId = this.SubLedgerAndCostCenterSetting.EnableSubLedger ? (ledgerObj ? ledgerObj.LedgerId : 0) : 0;
                            a.SubLedgerName = a.StoreName;
                            this.SelectedSubLedger[index] = a.StoreName;
                        }
                    }
                    a.LedgerValidator.get("LedgerName").enable();
                });
            }
        }
        else {

            this.InventorySubList.forEach((a, index) => {
                if (a.IsMapped === false) {
                    a.LedgerName = "";
                    a.Code = "";
                    a.LedgerId = 0;
                    a.SubLedgerName = "";
                    this.SelectedSubLedger[index] = "";
                }
                else {
                    var ledger = this.LedgerListAutoComplete.filter(l => l.LedgerName === a.LedgerName);
                    if (ledger.length === 0) {
                        let data = this.LedgerListAutoComplete.filter(l => l.LedgerId === a.LedgerId);
                        if (data.length > 0) {
                            a.Code = data[0].Code;
                            a.LedgerId = data[0].LedgerId;
                            a.LedgerName = data[0].LedgerName;
                        }
                    }
                }
                a.IsSelected = false;
                a.LedgerValidator.get("LedgerName").disable();
            });
        }
        this.ShowSaveButtonOnCkboxChange();
    }



    SingleCkboxChange(index) {
        this.SelectedLedgerCount = this.InventorySubList.filter(a => a.IsSelected === true).length;

        if (this.InventorySubList[index].IsSelected) {
            if (this.InventorySubList[index].IsMapped === false) {
                this.InventorySubList[index].LedgerName = "";//remove autocomplete Ledgername
                this.InventorySubList[index].Code = "";
                this.InventorySubList[index].LedgerId = 0;
                this.SelectedSubLedger[index] = "";

            }
        }
        else if ((this.InventorySubList[index].IsSelected === false)) {
            if (this.InventorySubList[index].IsMapped === false) {
                this.InventorySubList[index].LedgerName = "";
                this.InventorySubList[index].Code = "";
                this.InventorySubList[index].LedgerId = 0;
                this.SelectedSubLedger[index] = "";
            }
            else {
                // LedgerListAutoComplete empty becaose of in invsubcategory ledgergroup on coa
                // var ledger = this.LedgerListAutoComplete.filter(l => l.LedgerName == this.InventorySubList[index].LedgerName);
                // if (ledger.length == 0) {
                //   let data = this.LedgerListAutoComplete.filter(l => l.LedgerId == this.InventorySubList[index].LedgerId);
                //   this.InventorySubList[index].Code = data[0].Code;
                //   this.InventorySubList[index].LedgerId = data[0].LedgerId;
                //   this.InventorySubList[index].LedgerName = data[0].LedgerName;
                // }
            }
        }
    }

    ShowSaveButtonOnCkboxChange() {
        this.IsSelectAll = this.InventorySubList.every(a => a.IsSelected === true);
        this.SelectedLedgerCount = this.InventorySubList.filter(a => a.IsSelected === true).length;
    }

    // START:Inventory Subcategory ledger
    SetInventorySubcategoryData() {
        this.SelectedLedgerCount = 0;
        this.changeDetector.detectChanges();
        this.getInventorySubcategorylist();
        this.CurrentLedger = new LedgerModel();
        let LedgerGroupData = this.LedgerTypeParamter.find(a => a.LedgerType === ENUM_ACC_ADDLedgerLedgerType.InventoryConsumption).LedgergroupUniqueName;
        let consultLedger = this.SourceLedgerGroupList.find(a => a.LedgerGroupName === LedgerGroupData);

        if (consultLedger != null || consultLedger != undefined) {
            let primaryGroupId = this.PrimaryGroupList.filter(p => p.PrimaryGroupName === consultLedger.PrimaryGroup)[0].PrimaryGroupId;
            this.ChartOfAccountList = this.AllCostOfAccountingList.filter(c => c.PrimaryGroupId === primaryGroupId);

            this.LedgergroupList = this.SourceLedgerGroupList.filter(a => a.COA === consultLedger.COA);
            this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
            this.CurrentLedger.COA = consultLedger.COA;
            this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
            this.LedgerListAutoComplete = this.SourceLedgerList.filter(emp => emp.LedgerGroupId === this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
            this.SubLedgerListForInventorySubStore = this.SubLedgerMaster.filter(a => this.LedgerListAutoComplete.some(b => a.LedgerId === b.LedgerId));
        }
        else {
            this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Notice, ['Please first create ledger group for Inventory Subcategory ']);
        }
    }
    onledgerGroupChange() {
        this.InventorySubList.forEach(a => {
            a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
            a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        });
        this.LedgerListAutoComplete = this.SourceLedgerList.filter(emp => emp.LedgerGroupId === this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");

    }
    //get inventory subcategory list
    getInventorySubcategorylist() {
        this.accountingSettingsBLService.GetInvSubcategoryList()
            .subscribe(res => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                    this.InventorySubCategoryLedgerList = new Array<LedgerModel>();
                    let data = res.Results;
                    data.forEach((emp, index) => {
                        var led = new LedgerModel();
                        led = Object.assign(led, emp);
                        led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
                            led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
                            led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : "",
                            led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.StoreId,
                            led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
                            led.Dr = (emp.DrCr === true) ? emp.DrCr : null;
                        led.Cr = (emp.DrCr === false) ? true : null;
                        led.LedgerType = ENUM_ACC_ADDLedgerLedgerType.InventoryConsumption,
                            led.LedgerValidator.get("COA").setValue(this.CurrentLedger.COA);
                        led.LedgerValidator.get("PrimaryGroup").setValue(this.CurrentLedger.PrimaryGroup);
                        led.LedgerValidator.get("LedgerGroupName").setValue(this.CurrentLedger.LedgerGroupName);
                        this.InventorySubCategoryLedgerList.push(led);
                        this.SelectedSubLedger[index] = emp.SubLedgerName;
                        let costCenter = this.CostCenters.find(a => a.CostCenterId === emp.CostCenterId);
                        if (!led.IsSelected)
                            led.LedgerValidator.get("LedgerName").disable();
                        led.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
                        if (costCenter) {
                            this.SelectedCostCenter[index] = costCenter;
                        }
                    });
                    this.InventorySubList = this.InventorySubCategoryLedgerList;
                    if (this.InventorySubList.length > 0) {
                        this.ShowInventorySubCategoryAllLedgers = true;
                    }
                    this.TotalLedger = this.InventorySubList.length;
                    this.MappedLedger = this.InventorySubList.filter(l => l.IsMapped === true).length;
                    this.NotmappedLedger = this.InventorySubList.filter(l => l.IsMapped === false).length;
                }
            });
    }


    ToggleInventorySubcategory(mapped) {
        if (mapped === 'true') {
            this.ConsultantfilterType = 'withacchead';
            this.InventorySubList = this.InventorySubCategoryLedgerList.filter(emp => emp.LedgerId > 0);
            this.SelectedLedgerData = null;
        }
        else if (mapped === 'false') {
            this.ConsultantfilterType = 'withoutacchead';
            this.InventorySubList = this.InventorySubCategoryLedgerList.filter(emp => emp.LedgerId === 0);
            this.SelectedLedgerData = null;
        }
        else {
            this.ConsultantfilterType = 'all';
            this.InventorySubList = this.InventorySubCategoryLedgerList;
            this.SelectedLedgerData = null;
        }
    }
    //END : Inventory subcategory Ledger 

    //Get Provisional Ledger code , this code used for show for new ledger before ledger creation
    //provisional ledger code is not final may be it will different than showed 
    GetProvisionalLedgerCode() {
        try {
            this.accountingSettingsBLService.GetProvisionalLedgerCode()
                .subscribe(res => {
                    if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                        this.ProvisionalLedgerCode = parseInt(res.Results);
                    }
                    else {
                        this.msgBoxServ.showMessage(ENUM_MessageBox_Status.Error, [res.ErrorMessage]);
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
        if (typeof this.SelectedCostCenter[index] === ENUM_Data_Type.Object && this.SelectedCostCenter[index] !== null) {
            this.InventorySubList[index].CostCenterId = this.SelectedCostCenter[index].CostCenterId
        }
    }
    public SubLedgerListFormatter(subLedger: SubLedger_DTO): string {
        return `${subLedger["SubLedgerName"]} (${subLedger["LedgerName"]})`;
    }
    AssignSelectedSubLedger(index) {
        if (typeof this.SelectedSubLedger[index] === ENUM_Data_Type.Object && this.SelectedSubLedger[index].SubLedgerId > 0) {
            this.InventorySubList[index].Code = this.SelectedSubLedger[index].SubLedgerCode
            this.InventorySubList[index].LedgerId = this.SelectedSubLedger[index].LedgerId;
            this.InventorySubList[index].SubLedgerName = this.SelectedSubLedger[index].SubLedgerName;
            this.InventorySubList[index].SubLedgerId = this.SelectedSubLedger[index].SubLedgerId;
            var Ledger = this.LedgerListAutoComplete.find(a => a.LedgerId === this.SelectedSubLedger[index].LedgerId);
            if (Ledger) {
                this.InventorySubList[index].LedgerName = Ledger.LedgerName;
            }
        }
        else {
            if (this.SelectedSubLedger[index] === ENUM_Data_Type.String) {
                if (this.SelectedSubLedger[index].trim() === "") {
                    this.InventorySubList[index].LedgerId = 0;
                    this.InventorySubList[index].SubLedgerId = 0;
                    this.InventorySubList[index].LedgerName = "";
                    this.InventorySubList[index].SubLedgerName = "";
                }
                else {
                    this.InventorySubList[index].SubLedgerName = this.SelectedSubLedger[index];
                }
            }
        }
    }
}