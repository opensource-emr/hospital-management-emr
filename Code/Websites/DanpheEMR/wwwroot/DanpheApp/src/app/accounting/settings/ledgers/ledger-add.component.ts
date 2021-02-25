
import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { AccountingSettingsBLService } from '../shared/accounting-settings.bl.service';
import { AccountingBLService } from '../../shared/accounting.bl.service';
import { ledgerGroupModel } from '../shared/ledgerGroup.model';
import { LedgerModel } from '../shared/ledger.model';
import { SecurityService } from '../../../security/shared/security.service';
import * as moment from 'moment/moment';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { element } from "@angular/core/src/render3";
import { retry } from "rxjs-compat/operator/retry";
import { $$iterator } from "rxjs/internal/symbol/iterator";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import { Employee } from "../../../employee/shared/employee.model";
import { CoreService } from "../../../core/shared/core.service";

@Component({
  selector: 'ledger-add',
  templateUrl: './ledger-add.html'
})
export class LedgersAddComponent {

  public showAddPage: boolean = false;
  //@Input("selectedLedger")
  //public selectedLedger: LedgerModel;
  @Output("callback-add")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  ///public update: boolean = false;
  public CurrentLedger: LedgerModel;
  public CurrentLedgerGroup: ledgerGroupModel;
  public selLedgerGroup: any;
  public showAddLedgerGroupPopUp: boolean = false;
  public selLedger: Array<LedgerModel> = new Array<LedgerModel>();
  loading: boolean = false;
  public completeledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public NewledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public primaryGroupList: any[];
  public coaList: any[];
  public ledgergroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedGroupList: Array<LedgerModel> = new Array<LedgerModel>();
  public sourceLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public butDisabled: boolean = true;
  public Dr: boolean;
  public Cr: boolean;
  public ledgerType: string;
  public typeledger: any = true;
  //public typesupplier: any = false;----------->
  public typevendor: any = false;
  // public phrmSupplierList: any;--------->
  public ledgerMappingList: any;
  // START Pharmacy Supplier
  public typesupplier: boolean = false;
  public showpharmsuplierALLLedger: boolean = false;
  public phrmsupplierList: Array<LedgerModel> = new Array<LedgerModel>();
  public phrmSupplierList: any;
  // for mapped Phrm supplier
  public MappedphrmSupplierList: any;
  //END Pharmacy Supplier
  // START: Consultant Ledger   
  public showEmpAllLedgers: boolean = false;
  public employeeList: any;
  public isSelectAll: boolean = false;
  public ledgerTypeParamter: any;
  public empLed = [];
  public selectedLedgerCount: number = 0;
  public NewEmpledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public typeConsultant: boolean = false;
  public selectedLedgerData: any;
  public totalLedger: number;
  public mappedLedger: number;
  public notmappedLedger: number;
  public ledgerListAutoComplete: Array<LedgerModel> = new Array<LedgerModel>();

  // END: Consultant Ledger

  // START: Credit Organization Ledger 
  public typeCreditOrganization: boolean = false;
  public showcreditorgAllLedgers: boolean = false;
  public creditOrgledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public creditOrgizerList: any;
  // END: Credit Organization Ledger

  // START: Inventory Vendor Ledger 
  public typeInventoryVendor: boolean = false;
  public showinventoryvAllLedgers: boolean = false;
  public inventoryvledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public inventoryVendorList: any;
  // END: Inventory Vendor Ledger
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
    public settingBlService: SettingsBLService,
    public coreService: CoreService) {
    this.GetProvisionalLedgerCode();
    this.GetLedgerGroup();
    this.getLedgerList();
    this.Getledgers();
    this.GetLedgerMapping();
    this.getPrimaryGroupList();
    this.getCoaList();
  }
  //ngOnInit() {
  //  this.update = false;
  //}
  public getCoaList() {
    this.accountingSettingsBLService.GetChartofAccount()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.allcoaList = res.Results;
        }
      });
  }
  public getPrimaryGroupList() {
    this.accountingSettingsBLService.getPrimaryGroupList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.primaryGroupList = res.Results;
        }
      });
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
  @Input("showAddPage")
  public set value(val: boolean) {
    this.showAddPage = val;
    this.NewledgerList = new Array<LedgerModel>();
    this.AddNewLedger()
    this.Cr = this.Dr = null;
    this.ledgerType = 'ledger';
    this.loading = false;
    this.typeledger = true;
    this.typesupplier = false;
    this.typevendor = false;
    this.CurrentLedger = new LedgerModel();
    this.CurrentLedgerGroup = new ledgerGroupModel();
    this.CurrentLedger.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  }
  GetLedgerGroup() {
    this.accountingSettingsBLService.GetLedgerGroup()
      .subscribe(res => this.CallBackLedgerGroup(res));
  }

  CallBackLedgerGroup(res) {
    this.sourceLedGroupList = new Array<LedgerModel>();
    this.sourceLedGroupList = res.Results;
    this.ledgergroupList = [];
   // this.primaryGroupList = [];
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();
   // this.primaryGroupList = Array.from([new Set(this.sourceLedGroupList.map(i => i.PrimaryGroup))][0]);
  }
  //adding new Ledger
  AddLedger() {
    if (this.typeConsultant) {
      this.NewledgerList = this.employeeList.filter(a => a.IsSelected == true);

      this.NewledgerList.forEach(emp => {
        var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
        if (empData.length == 0) {
          emp.Code = "";
          emp.LedgerId = 0;
        }
      });

    }
    else if (this.typeCreditOrganization) {
      this.NewledgerList = this.creditOrgizerList.filter(a => a.IsSelected == true);
      this.NewledgerList.forEach(emp => {
        var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
        if (empData.length == 0) {
          emp.Code = "";
          emp.LedgerId = 0;
        }
      });
    }
    else if (this.typesupplier) {
      this.NewledgerList = this.phrmSupplierList.filter(a => a.IsSelected == true);
      this.NewledgerList.forEach(emp => {
        var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
        if (empData.length == 0) {
          emp.Code = "";
          emp.LedgerId = 0;
        }
      });
    }
    else if (this.typeInventoryVendor) {
      this.NewledgerList = this.inventoryVendorList.filter(a => a.IsSelected == true);
      this.NewledgerList.forEach(emp => {
        var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
        if (empData.length == 0) {
          emp.Code = "";
          emp.LedgerId = 0;
        }
      });
    }
    else if (this.typeinventorysubcategory) {
      this.NewledgerList = this.inventorySubList.filter(a => a.IsSelected == true);
      this.NewledgerList.forEach(emp => {
        var empData = this.ledgerListAutoComplete.filter(l => l.LedgerName == emp.LedgerName);
        if (empData.length == 0) {
          emp.Code = "";
          emp.LedgerId = 0;
        }
      });
    }
    // if (this.checkUniqueLedgerName()) {
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
                // this.CurrentLedger
                this.CallBackAddLedger(res);
                this.CurrentLedger = new LedgerModel();
                this.NewledgerList = new Array<LedgerModel>();
                this.selLedgerGroup = null; ////Null the Selected Ledger Group   
                this.GetProvisionalLedgerCode();
                // this.loading = false;
                // this.typeConsultant = false;
                this.Close();
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
    //}
  }

  Close() {
    //this.selectedLedger = null;
    this.ledgerList = this.completeledgerList;
    this.CurrentLedger = new LedgerModel();
    this.selLedgerGroup = null;
    this.NewledgerList = new Array<LedgerModel>();;
    this.ledgergroupList = new Array<LedgerModel>();
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();
    this.showAddPage = false;
    this.typeConsultant = false;

    this.NewEmpledgerList = new Array<LedgerModel>();
    this.loading = false;
    //Pharmacy Supplier
    this.typesupplier = false;
    this.phrmsupplierList = new Array<LedgerModel>();
    this.phrmSupplierList = null;
    this.MappedphrmSupplierList = null;
    // credit organizations ledger
    this.typeCreditOrganization = false;
    this.creditOrgledgerList = new Array<LedgerModel>();
    this.creditOrgizerList = null;

    //Inventory Vendor ledger
    this.typeInventoryVendor = false;
    this.inventoryvledgerList = new Array<LedgerModel>();
    this.inventoryVendorList = null;

    //inventory sobcategory ledger
    this.typeinventorysubcategory = false;
    this.inventorysubcategoryledgerList = new Array<LedgerModel>();
    this.inventorySubList = null;
    this.selLedger = new Array<LedgerModel>();
    this.employeeList = new Array<LedgerModel>();
    this.showinventorysubcategoryAllLedgers = false;
    this.ledgerSearchKey = null;
    this.disabledRow = true;
    this.getLedgerList();
  }
  //after adding Ledger is succesfully added  then this function is called.
  CallBackAddLedger(res) {
    if (res.Status == "OK" && res.Results != null) {
      let temp = new LedgerModel();
      temp = Object.assign(temp, res.Results);
      temp.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
      temp.COA = this.CurrentLedger.COA;
      temp.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
      temp.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
      temp.LedgerName = this.CurrentLedger.LedgerName;
      this.sourceLedgerList.push(temp);
      this.ledgergroupList = new Array<LedgerModel>();
      this.ledgerList = new Array<LedgerModel>();
      this.callbackAdd.emit({ ledger: temp });
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
   // if (this.CurrentLedger.PrimaryGroup) {
      this.coaList = [];
      this.ledgergroupList = [];
      this.selLedgerGroup = null;
      this.CurrentLedger.LedgerGroupName = null;
      //  this.CurrentLedger.LedgerName = null;
      //  this.ledgerList = new Array<LedgerModel>();
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == this.CurrentLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == this.CurrentLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
      this.CurrentLedger.COA = this.coaList[0].ChartOfAccountName;
      this.COAChanged();
    //}
  }
  public COAChanged() {
    if (this.CurrentLedger.COA) {
      this.ledgergroupList = [];
      this.selLedgerGroup = null;
      this.CurrentLedger.LedgerGroupName = null;
      //   this.CurrentLedger.LedgerName = null;
      //   this.ledgerList = new Array<LedgerModel>();
      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == this.CurrentLedger.COA);
    }
  }

  public CheckDuplicateLedger(index: number) {
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      if (count > 0 || check > 0) {
        this.NewledgerList[index].LedgerName = null;
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
        this.loading = false;
      }
      else {

      }
    }
  }
  public getLedgerList() {
    this.accountingSettingsBLService.GetLedgerList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.sourceLedgerList = res.Results;
        }
        else {
          alert("Failed ! " + res.ErrorMessage);
        }

      });
  }
  LedgerGroupListFormatter(data: any): string {
    return data["LedgerGroupName"];
  }
  LedgerListFormatter(data: any): string {
    //return data["LedgerName"];
    return data["Code"] + "-" + data["LedgerName"] + " | " + data["PrimaryGroup"] + " -> " + data["LedgerGroupName"];
  }
  LedgerListFormatter2(data: any): string {

    return data["EmployeeName"];;
  }
  ChangeOpeningBalType(e, index: number) {
    this.loading = false;

    if (this.typeConsultant) {
      if (e.target.name == "Dr") {
        if (e.target.checked) {
          this.employeeList[index].DrCr = true;
          this.employeeList[index].Cr = false;
          this.employeeList[index].Dr = true;
        }
      }
      if (e.target.name == "Cr") {
        if (e.target.checked) {
          this.employeeList[index].DrCr = false;
          this.employeeList[index].Dr = false;
          this.employeeList[index].Cr = true;
        }
      }
    }
    else if (this.typeCreditOrganization) {
      if (e.target.name == "Dr") {
        if (e.target.checked) {
          this.creditOrgizerList[index].DrCr = true;
          this.creditOrgizerList[index].Cr = false;
          this.creditOrgizerList[index].Dr = true;
        }
      }
      if (e.target.name == "Cr") {
        if (e.target.checked) {
          this.creditOrgizerList[index].DrCr = false;
          this.creditOrgizerList[index].Dr = false;
          this.creditOrgizerList[index].Cr = true;
        }
      }
    }
    else if (this.typesupplier) {
      if (e.target.name == "Dr") {
        if (e.target.checked) {
          this.phrmSupplierList[index].DrCr = true;
          this.phrmSupplierList[index].Cr = false;
          this.phrmSupplierList[index].Dr = true;
        }
      }
      if (e.target.name == "Cr") {
        if (e.target.checked) {
          this.phrmSupplierList[index].DrCr = false;
          this.phrmSupplierList[index].Dr = false;
          this.phrmSupplierList[index].Cr = true;
        }
      }
    }
    else if (this.typeInventoryVendor) {
      if (e.target.name == "Dr") {
        if (e.target.checked) {
          this.inventoryVendorList[index].DrCr = true;
          this.inventoryVendorList[index].Cr = false;
          this.inventoryVendorList[index].Dr = true;
        }
      }
      if (e.target.name == "Cr") {
        if (e.target.checked) {
          this.inventoryVendorList[index].DrCr = false;
          this.inventoryVendorList[index].Dr = false;
          this.inventoryVendorList[index].Cr = true;
        }
      }
    }
    else if (this.typeinventorysubcategory) {
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
    else {
      if (e.target.name == "Dr") {
        if (e.target.checked) {
          this.NewledgerList[index].DrCr = true;
          this.NewledgerList[index].Cr = false;
          this.NewledgerList[index].Dr = true;
        }
      }
      if (e.target.name == "Cr") {
        if (e.target.checked) {
          this.NewledgerList[index].DrCr = false;
          this.NewledgerList[index].Dr = false;
          this.NewledgerList[index].Cr = true;
        }
      }
    }

  }
  CheckDrCrValidation() {
    //if Opening balance is greater than 0 then add required validation to opening balance type
    //if (this.CurrentLedger.OpeningBalance > 0) {
    //  //set validator on
    //  this.CurrentLedger.UpdateValidator("on", "Dr", "required");
    //  this.CurrentLedger.UpdateValidator("on", "Cr", "required");
    //}
    //else {
    //  //set validator off
    //  this.CurrentLedger.UpdateValidator("off", "Dr", "required");
    //  this.CurrentLedger.UpdateValidator("off", "Cr", "required");
    //}
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
  // SupplierListFormatter(data: any): string {
  //   return data["SupplierName"];
  // }
  ToggleLedgerType(ledgerType) {
    this.ledgerType = ledgerType;
    this.CurrentLedger = new LedgerModel();

    if (ledgerType == 'ledger') {
      this.typeledger = true;
      this.typesupplier = false;
      this.typevendor = false;
      this.typeConsultant = false;
      this.typeCreditOrganization = false;
      this.typeInventoryVendor = false;
      this.typeinventorysubcategory = false;
      this.ledgerSearchKey = null;
      this.showinventorysubcategoryAllLedgers = false;
      this.disabledRow = true;
      // this.getLedgerList();
    }
    else if (ledgerType == 'pharmacysupplier') {
      this.typeledger = false;
      this.typesupplier = true;
      this.typevendor = false;
      this.typeConsultant = false;
      this.typeCreditOrganization = false;
      this.typeInventoryVendor = false;
      this.typeinventorysubcategory = false;
      this.ledgerSearchKey = null;
      this.showinventorysubcategoryAllLedgers = false;
      // this.getLedgerList();
      this.SetSupplierData();
      this.disabledRow = true;
    }
    else if (ledgerType == 'inventoryvendor') {
      this.typeledger = false;
      this.typesupplier = false;
      this.typevendor = true;
      this.typeConsultant = false;
      this.typeCreditOrganization = false;
      this.typeInventoryVendor = true;
      this.typeinventorysubcategory = false;
      this.ledgerSearchKey = null;
      this.showinventorysubcategoryAllLedgers = false;
      // this.getLedgerList();
      this.SetInventoryVendorData();
      this.disabledRow = true;
    }
    else if (ledgerType == 'consultant') {
      this.typeledger = false;
      this.typesupplier = false;
      this.typevendor = false;
      this.typeConsultant = true;
      this.typeCreditOrganization = false;
      this.typeInventoryVendor = false;
      this.typeinventorysubcategory = false;
      this.ledgerSearchKey = null;
      this.showinventorysubcategoryAllLedgers = false;
      // this.getLedgerList();
      this.SetConsultantData();
      this.disabledRow = true;
    }
    else if (ledgerType == 'creditorganization') {
      this.typeledger = false;
      this.typesupplier = false;
      this.typevendor = false;
      this.typeConsultant = false;
      this.typeCreditOrganization = true;
      this.typeInventoryVendor = false;
      this.typeinventorysubcategory = false;
      this.ledgerSearchKey = null;
      this.showinventorysubcategoryAllLedgers = false;
      // this.getLedgerList();
      this.SetCreditOrganizationData();
      this.disabledRow = true;
    }
    else if (ledgerType == 'inventorysubcategory') {
      this.typeledger = false;
      this.typesupplier = false;
      this.typevendor = false;
      this.typeConsultant = false;
      this.typeCreditOrganization = false;
      this.typeInventoryVendor = false;
      this.typeinventorysubcategory = true;
      this.ledgerSearchKey = null;
      // this.getLedgerList();
      this.SetInventorySubcategoryData();
      this.disabledRow = true;
    }
  }
  CheckDuplicateSupplierLedger(index: number) {
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      let led = this.ledgerMappingList.supplier.find(s => s.LedgerName == this.CurrentLedger.LedgerName);
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      if (led || check > 0) {
        this.CurrentLedger.LedgerName = null;
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
        this.loading = false;
      }
    }
  }
  // CheckLedgerTypeValidation() {
  // //   var temp = true;
  // //   if (this.ledgerType != 'ledger') {
  // //     // if (this.ledgerType == 'creditorganization') {
  // //     //   this.NewledgerList.forEach(itm => {
  // //     //     let emp = this.creditOrgizerList.find(s => s.OrganizationName == itm.LedgerName);
  // //     //     if (!emp) {
  // //     //       itm.LedgerName = null;
  // //     //       this.msgBoxServ.showMessage("notice", ['ledger not allowed']);
  // //     //       temp = false;
  // //     //     }
  // //     //     else {
  // //     //       itm.LedgerType = this.ledgerType;
  // //     //       itm.LedgerReferenceId = emp.OrganizationId;
  // //     //       itm.LedgerName = emp.OrganizationName;
  // //     //     }
  // //     //   });
  // //     // }

  // //     // else if (this.ledgerType == 'inventorysubcategory') {
  // //     //   this.NewledgerList.forEach(itm => {
  // //     //     let emp = this.inventorySubList.find(s => s.SubCategoryName == itm.LedgerName);//change here occourding to result
  // //     //     if (!emp) {
  // //     //       itm.LedgerName = null;
  // //     //       this.msgBoxServ.showMessage("notice", ['ledger not allowed']);
  // //     //       temp = false;
  // //     //     }
  // //     //     else {
  // //     //       itm.LedgerType = this.ledgerType;
  // //     //       itm.LedgerReferenceId = emp.SubCategoryId;
  // //     //       itm.LedgerName = emp.SubCategoryName;
  // //     //     }
  // //     //   });
  // //     // }
  // //   }
  // //   return temp;
  //  }
  //for LedgerGroup add popup
  AddLedgerGroupPopUp() {
    this.showAddLedgerGroupPopUp = false;
    this.changeDetector.detectChanges();
    this.showAddLedgerGroupPopUp = true;
  }
  OnNewLedgerGroupAdded($event) {
    this.showAddLedgerGroupPopUp = false;
    var ledgerGroup = new LedgerModel();
    ledgerGroup.LedgerGroupId = $event.currentLedger.LedgerGroupId;
    ledgerGroup.PrimaryGroup = $event.currentLedger.PrimaryGroup;
    ledgerGroup.COA = $event.currentLedger.COA;
    ledgerGroup.LedgerGroupName = $event.currentLedger.LedgerGroupName;
    ledgerGroup.IsActive = $event.currentLedger.IsActive;
    ledgerGroup.Description = $event.currentLedger.Description;
    ledgerGroup.Name = $event.currentLedger.Name;
    this.ledgergroupList.push(ledgerGroup);
    this.ledgergroupList = this.ledgergroupList.slice();
    this.GetLedgerGroup();
  }
  checkUniqueLedgerName() {
    if (this.NewledgerList.length) {
      this.changeDetector.detectChanges();
      var temp = true;
      if (!this.typeConsultant) {
        this.NewledgerList.forEach(itm => {
          let count = this.sourceLedgerList.filter(s => s.LedgerName == itm.LedgerName).length;
          let check = this.NewledgerList.filter(s => s.LedgerName == itm.LedgerName).length;
          if (count > 0 || check > 1) {
            this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
            this.loading = false;
            temp = false;
          }
        });
      }
      return temp;
    }
    else {
      this.msgBoxServ.showMessage("notice", ['LedgerName required.']);
      this.loading = false;
    }
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
  AddNewLedger() {
    try {
      var ledger = new LedgerModel();
      if (this.CurrentLedger) {
        ledger.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
        ledger.COA = this.CurrentLedger.COA;
        ledger.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
        ledger.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
        ledger.CreatedBy = this.CurrentLedger.CreatedBy;

      }
      if (this.NewledgerList.length > 0) {
        if (this.checkUniqueLedgerName()) {
          this.NewledgerList.push(ledger);
        }
      }
      else {
        this.NewledgerList.push(ledger);
      }
      this.SetProvisionalLedgerCode();
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  // START: Consultant Ledger   
  SetConsultantData() {
    this.selectedLedgerCount = 0;
    this.changeDetector.detectChanges();
    this.getEmpList();
    this.CurrentLedger = new LedgerModel();
    let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == 'consultant').LedgergroupUniqueName;
    let consultLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName); // 'LCL_CONSULTANT(CREDIT_A/C)'

    if (consultLedger != null || consultLedger != undefined) {
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == consultLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

      this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
      this.CurrentLedger.COA = consultLedger.COA;
      this.CurrentLedger.LedgerGroupName = consultLedger.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
    }
    else {
      this.msgBoxServ.showMessage('notice', ['Please first create ledger group for Consultant(Credit A/C)']);
    }

  }
  getEmpList() {

    this.accountingSettingsBLService.GetEmployeeList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.NewEmpledgerList = new Array<LedgerModel>();
          let data = res.Results;
          data.forEach(emp => {
            var led = new LedgerModel();
            led = Object.assign(led, emp);
            led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
              led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
              led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : "",
              led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.EmployeeId,
              led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
              led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
            led.Cr = (emp.DrCr == false) ? true : null;
            led.LedgerType = "consultant",
              this.NewEmpledgerList.push(led);
          });
          this.employeeList = this.NewEmpledgerList;
          this.totalLedger = this.employeeList.length;
          this.mappedLedger = this.employeeList.filter(l => l.IsMapped == true).length;
          this.notmappedLedger = this.employeeList.filter(l => l.IsMapped == false).length;
        }
      });
  }

  //sud:1June'20- implementaiton changed after Searchbox is  replaced by Textbox for Searching
  public ledgerSearchKey: string = null;
  filterSelectedLedger(searchKey: string) {
    try {
      if (searchKey && searchKey.trim()) {

        if (this.ConsultantfilterType == 'withacchead') {
          this.employeeList = this.NewEmpledgerList.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
          this.phrmSupplierList = this.phrmsupplierList.filter(l => l.SupplierName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
          this.inventoryVendorList = this.inventoryvledgerList.filter(l => l.VendorName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
          this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);
          this.creditOrgizerList = this.creditOrgledgerList.filter(l => l.OrganizationName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId > 0);

        }
        else if (this.ConsultantfilterType == 'withoutacchead') {

          this.employeeList = this.NewEmpledgerList.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
          this.phrmSupplierList = this.phrmsupplierList.filter(l => l.SupplierName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
          this.inventoryVendorList = this.inventoryvledgerList.filter(l => l.VendorName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
          this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);
          this.creditOrgizerList = this.creditOrgledgerList.filter(l => l.OrganizationName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 && l.LedgerId == 0);

        }
        else {
          this.employeeList = this.NewEmpledgerList.filter(l => l.EmployeeName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
          this.phrmSupplierList = this.phrmsupplierList.filter(l => l.SupplierName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
          this.inventoryVendorList = this.inventoryvledgerList.filter(l => l.VendorName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
          this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.SubCategoryName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);
          this.creditOrgizerList = this.creditOrgledgerList.filter(l => l.OrganizationName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1);

        }
      }
      else {
        if (this.ConsultantfilterType == 'withacchead') {
          this.employeeList = this.NewEmpledgerList.filter(l => l.LedgerId > 0);
          this.phrmSupplierList = this.phrmsupplierList.filter(l => l.LedgerId > 0);

          this.inventoryVendorList = this.inventoryvledgerList.filter(l => l.LedgerId > 0);
          this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.LedgerId > 0);
          this.creditOrgizerList = this.creditOrgledgerList.filter(l => l.LedgerId > 0);
        }
        else if (this.ConsultantfilterType == 'withoutacchead') {

          this.employeeList = this.NewEmpledgerList.filter(l => l.LedgerId == 0);

          this.phrmSupplierList = this.phrmsupplierList.filter(l => l.LedgerId == 0);
          this.inventoryVendorList = this.inventoryvledgerList.filter(l => l.LedgerId == 0);
          this.inventorySubList = this.inventorysubcategoryledgerList.filter(l => l.LedgerId == 0);
          this.creditOrgizerList = this.creditOrgledgerList.filter(l => l.LedgerId == 0);
        }
        else {
          this.employeeList = this.NewEmpledgerList;
          this.phrmSupplierList = this.phrmsupplierList;

          this.inventoryVendorList = this.inventoryvledgerList;
          this.inventorySubList = this.inventorysubcategoryledgerList;
          this.creditOrgizerList = this.creditOrgledgerList;

        }
      }
    }
    catch (ex) {

    }
  }

  AssignSelectedLedger(index) {
    try {
      if (this.typesupplier) {  // pharmacy supplier
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.phrmSupplierList[index].LedgerName);
        if (ledger.length > 0) {
          this.phrmSupplierList[index].Code = ledger[0].Code;
          this.phrmSupplierList[index].LedgerId = ledger[0].LedgerId;
          this.phrmSupplierList[index].LedgerName = ledger[0].LedgerName;
        }
      }
      else if (this.typeConsultant) { // consultant ledger
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.employeeList[index].LedgerName);
        if (ledger.length > 0) {
          this.employeeList[index].Code = ledger[0].Code;
          this.employeeList[index].LedgerId = ledger[0].LedgerId;
          this.employeeList[index].LedgerName = ledger[0].LedgerName;
        }
      }

      else if (this.typeCreditOrganization) { // billing credit organization
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.creditOrgizerList[index].LedgerName);
        if (ledger.length > 0) {
          this.creditOrgizerList[index].Code = ledger[0].Code;
          this.creditOrgizerList[index].LedgerId = ledger[0].LedgerId;
          this.creditOrgizerList[index].LedgerName = ledger[0].LedgerName;
        }
      }
      else if (this.typeInventoryVendor) { // inventory vendor
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.inventoryVendorList[index].LedgerName);
        if (ledger.length > 0) {
          this.inventoryVendorList[index].Code = ledger[0].Code;
          this.inventoryVendorList[index].LedgerId = ledger[0].LedgerId;
          this.inventoryVendorList[index].LedgerName = ledger[0].LedgerName;
        }
      }
      else if (this.typeinventorysubcategory) {   // inventory items subcategory
        var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.inventorySubList[index].LedgerName);
        if (ledger.length > 0) {
          this.inventorySubList[index].Code = ledger[0].Code;
          this.inventorySubList[index].LedgerId = ledger[0].LedgerId;
          this.inventorySubList[index].LedgerName = ledger[0].LedgerName;
        }
      }

    }
    catch (ex) {

    }
  }
  SelectAllChkOnChange() {
    if (this.isSelectAll) {
      if (this.typeConsultant) {
        this.employeeList.forEach(a => {
          a.IsSelected = true;
          a.IsActive = true;
          if (a.IsSelected) {
            if (a.IsMapped == false) {
              a.LedgerName = a.EmployeeName;
              a.Code = "";
              a.LedgerId = 0;
            }
          }
        });
      }
      else if (this.typeCreditOrganization) {
        this.creditOrgizerList.forEach(a => {
          a.IsSelected = true;
          a.IsActive = true;
          if (a.IsSelected) {
            if (a.IsMapped == false) {
              a.LedgerName = a.OrganizationName;
              a.Code = "";
              a.LedgerId = 0;
            }
          }
        });
      }
      else if (this.typesupplier) {
        this.phrmSupplierList.forEach(a => {
          a.IsSelected = true;
          a.IsActive = true;
          if (a.IsSelected) {
            if (a.IsMapped == false) {
              a.LedgerName = a.SupplierName;
              a.Code = "";
              a.LedgerId = 0;
            }
          }

        });
      }
      else if (this.typeInventoryVendor) {
        this.inventoryVendorList.forEach(a => {
          a.IsSelected = true;
          a.IsActive = true;
          if (a.IsSelected) {
            if (a.IsMapped == false) {
              a.LedgerName = a.VendorName;
              a.Code = "";
              a.LedgerId = 0;
            }
          }
        });
      }
      else if (this.typeinventorysubcategory) {
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
    }
    else {
      if (this.typeConsultant) {
        this.employeeList.forEach(a => {
          if (a.IsMapped == false) {
            a.LedgerName = "";
            a.Code = "";
            a.LedgerId = 0;
          }
          else {
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
            if (ledger.length == 0) {
              let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
              a.Code = data[0].Code;
              a.LedgerId = data[0].LedgerId;
              a.LedgerName = data[0].LedgerName;
            }
          }
          a.IsSelected = false;
        });
      }
      else if (this.typeCreditOrganization) {
        this.creditOrgizerList.forEach(a => {
          if (a.IsMapped == false) {
            a.LedgerName = "";
            a.Code = "";
            a.LedgerId = 0;
          }
          else {
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
            if (ledger.length == 0) {
              let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
              a.Code = data[0].Code;
              a.LedgerId = data[0].LedgerId;
              a.LedgerName = data[0].LedgerName;
            }
          }
          a.IsSelected = false;
        });
      }
      else if (this.typesupplier) {
        this.phrmSupplierList.forEach(a => {
          if (a.IsMapped == false) {
            a.LedgerName = "";
            a.Code = "";
            a.LedgerId = 0;
          }
          else {
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
            if (ledger.length == 0) {
              let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
              a.Code = data[0].Code;
              a.LedgerId = data[0].LedgerId;
              a.LedgerName = data[0].LedgerName;
            }
          }
          a.IsSelected = false;
        });
      }
      else if (this.typeInventoryVendor) {
        this.inventoryVendorList.forEach(a => {
          if (a.IsMapped == false) {
            a.LedgerName = "";
            a.Code = "";
            a.LedgerId = 0;
          }
          else {
            var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
            if (ledger.length == 0) {
              let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
              a.Code = data[0].Code;
              a.LedgerId = data[0].LedgerId;
              a.LedgerName = data[0].LedgerName;
            }
          }
          a.IsSelected = false;
        });
      }
      else if (this.typeinventorysubcategory) {
        this.inventorySubList.forEach(a => {
          if (a.IsMapped == false) {
            a.LedgerName = "";
            a.Code = "";
            a.LedgerId = 0;
          }
          else {
            //ledgerListAutoComplete empty becaose of in invsubcategory ledgergroup on coa
            // var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == a.LedgerName);
            // if (ledger.length == 0) {
            //   let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == a.LedgerId);
            //   a.Code = data[0].Code;
            //   a.LedgerId = data[0].LedgerId;
            //   a.LedgerName = data[0].LedgerName;
            //}
          }
          a.IsSelected = false;
        });
      }
    }
    this.ShowSaveButtonOnCkboxChange();
  }

  SingleCkboxChange(index) {
    if (this.ledgerType == 'consultant') {
      this.selectedLedgerCount = this.employeeList.filter(a => a.IsSelected == true).length;

      if (this.employeeList[index].IsSelected) {
        if (this.employeeList[index].IsMapped == false) {
          //NBB- we will keep empty ledgername so, user will type username and he can find existing ledger from autocomplete        
          this.employeeList[index].LedgerName = ""//this.employeeList[index].EmployeeName;
          this.employeeList[index].Code = "";
          this.employeeList[index].LedgerId = 0;
        }
      }
      else if ((this.employeeList[index].IsSelected == false)) {
        if (this.employeeList[index].IsMapped == false) {
          this.employeeList[index].LedgerName = "";
          this.employeeList[index].Code = "";
          this.employeeList[index].LedgerId = 0;
        }
        else {
          var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.employeeList[index].LedgerName);
          if (ledger.length == 0) {
            let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.employeeList[index].LedgerId);
            this.employeeList[index].Code = data[0].Code;
            this.employeeList[index].LedgerId = data[0].LedgerId;
            this.employeeList[index].LedgerName = data[0].LedgerName;
          }
        }
      }

    }
    else if (this.ledgerType == 'pharmacysupplier') {
      this.selectedLedgerCount = this.phrmSupplierList.filter(a => a.IsSelected == true).length;

      if (this.phrmSupplierList[index].IsSelected) {
        if (this.phrmSupplierList[index].IsMapped == false) {
          this.phrmSupplierList[index].LedgerName = "";//remove autocomplete Ledgername
          this.phrmSupplierList[index].Code = "";
          this.phrmSupplierList[index].LedgerId = 0;
        }
      }
      else if ((this.phrmSupplierList[index].IsSelected == false)) {
        if (this.phrmSupplierList[index].IsMapped == false) {
          this.phrmSupplierList[index].LedgerName = "";
          this.phrmSupplierList[index].Code = "";
          this.phrmSupplierList[index].LedgerId = 0;
        }
        else {
          var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.phrmSupplierList[index].LedgerName);
          if (ledger.length == 0) {
            let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.phrmSupplierList[index].LedgerId);
            this.phrmSupplierList[index].Code = data[0].Code;
            this.phrmSupplierList[index].LedgerId = data[0].LedgerId;
            this.phrmSupplierList[index].LedgerName = data[0].LedgerName;
          }
        }
      }
    }
    else if (this.ledgerType == 'inventoryvendor') {
      this.selectedLedgerCount = this.inventoryVendorList.filter(a => a.IsSelected == true).length;

      if (this.inventoryVendorList[index].IsSelected) {
        if (this.inventoryVendorList[index].IsMapped == false) {
          this.inventoryVendorList[index].LedgerName = "";//remove autocomplete Ledgername
          this.inventoryVendorList[index].Code = "";
          this.inventoryVendorList[index].LedgerId = 0;
        }
      }
      else if ((this.inventoryVendorList[index].IsSelected == false)) {
        if (this.inventoryVendorList[index].IsMapped == false) {
          this.inventoryVendorList[index].LedgerName = "";
          this.inventoryVendorList[index].Code = "";
          this.inventoryVendorList[index].LedgerId = 0;
        }
        else {
          var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.inventoryVendorList[index].LedgerName);
          if (ledger.length == 0) {
            let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.inventoryVendorList[index].LedgerId);
            this.inventoryVendorList[index].Code = data[0].Code;
            this.inventoryVendorList[index].LedgerId = data[0].LedgerId;
            this.inventoryVendorList[index].LedgerName = data[0].LedgerName;
          }
        }
      }
    }
    else if (this.ledgerType == 'inventorysubcategory') {
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
    else if (this.ledgerType == 'creditorganization') {
      this.selectedLedgerCount = this.creditOrgizerList.filter(a => a.IsSelected == true).length;

      if (this.creditOrgizerList[index].IsSelected) {
        if (this.creditOrgizerList[index].IsMapped == false) {
          this.creditOrgizerList[index].LedgerName = "";//remove autocomplete Ledgername
          this.creditOrgizerList[index].Code = "";
          this.creditOrgizerList[index].LedgerId = 0;
        }
      }
      else if ((this.creditOrgizerList[index].IsSelected == false)) {
        if (this.creditOrgizerList[index].IsMapped == false) {
          this.creditOrgizerList[index].LedgerName = "";
          this.creditOrgizerList[index].Code = "";
          this.creditOrgizerList[index].LedgerId = 0;
        }
        else {
          var ledger = this.ledgerListAutoComplete.filter(l => l.LedgerName == this.creditOrgizerList[index].LedgerName);
          if (ledger.length == 0) {
            let data = this.ledgerListAutoComplete.filter(l => l.LedgerId == this.creditOrgizerList[index].LedgerId);
            this.creditOrgizerList[index].Code = data[0].Code;
            this.creditOrgizerList[index].LedgerId = data[0].LedgerId;
            this.creditOrgizerList[index].LedgerName = data[0].LedgerName;
          }
        }
      }
    }
  }

  ShowSaveButtonOnCkboxChange() {
    if (this.typeConsultant) {
      this.isSelectAll = this.employeeList.every(a => a.IsSelected == true);
      this.selectedLedgerCount = this.employeeList.filter(a => a.IsSelected == true).length;
    }
    else if (this.typeCreditOrganization) {
      this.isSelectAll = this.creditOrgizerList.every(a => a.IsSelected == true);
      this.selectedLedgerCount = this.creditOrgizerList.filter(a => a.IsSelected == true).length;
    }
    else if (this.typesupplier) {
      this.isSelectAll = this.phrmSupplierList.every(a => a.IsSelected == true);
      this.selectedLedgerCount = this.phrmSupplierList.filter(a => a.IsSelected == true).length;
    }
    else if (this.typeInventoryVendor) {
      this.isSelectAll = this.inventoryVendorList.every(a => a.IsSelected == true);
      this.selectedLedgerCount = this.inventoryVendorList.filter(a => a.IsSelected == true).length;
    }
    else if (this.typeinventorysubcategory) {
      this.isSelectAll = this.inventorySubList.every(a => a.IsSelected == true);
      this.selectedLedgerCount = this.inventorySubList.filter(a => a.IsSelected == true).length;
    }

  }
  ToggleEmpLedger(mapped) {
    if (mapped == 'true') {
      this.ConsultantfilterType = 'withacchead';
      this.employeeList = this.NewEmpledgerList.filter(emp => emp.LedgerId > 0);
      this.selectedLedgerData = null;
    }
    else if (mapped == 'false') {
      this.ConsultantfilterType = 'withoutacchead';
      this.employeeList = this.NewEmpledgerList.filter(emp => emp.LedgerId == 0);
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.employeeList = this.NewEmpledgerList;
      this.selectedLedgerData = null;
    }

  }
  // END: Consultant Ledger   

  // START: Consultant Ledger   
  SetCreditOrganizationData() {
    this.selectedLedgerCount = 0;
    this.changeDetector.detectChanges();
    // this.GetLedgerMapping();
    this.getCreditOrgList();
    this.CurrentLedger = new LedgerModel();
    let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == 'creditorganization').LedgergroupUniqueName;
    let consultLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName);

    if (consultLedger != null || consultLedger != undefined) {
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == consultLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
      // this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == consultLedger.COA);
      this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
      this.CurrentLedger.COA = consultLedger.COA;
      this.CurrentLedger.LedgerGroupName = consultLedger.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");

    }
    else {
      this.msgBoxServ.showMessage('notice', ['Please first create ledger group for Credit Organizations']);
    }

  }


  getCreditOrgList() {
    this.accountingSettingsBLService.GetCreditOrgList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.creditOrgledgerList = new Array<LedgerModel>();
          let data = res.Results;
         // data = data.filter(d => d.LedgerGroupId == this.CurrentLedger.LedgerGroupId || d.LedgerGroupId == null);
          data.forEach(emp => {
            var led = new LedgerModel();
            led = Object.assign(led, emp);
            led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
              led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
              led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : "",
              led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.OrganizationId,
              led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
              led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
            led.Cr = (emp.DrCr == false) ? true : null;
            led.LedgerType = "creditorganization",
              this.creditOrgledgerList.push(led);
          });
          this.creditOrgizerList = this.creditOrgledgerList;
          this.totalLedger = this.creditOrgizerList.length;
          this.mappedLedger = this.creditOrgizerList.filter(l => l.IsMapped == true).length;
          this.notmappedLedger = this.creditOrgizerList.filter(l => l.IsMapped == false).length;

        }

      });
  }


  ToggleCreditOrgLedger(mapped) {
    if (mapped == 'true') {
      this.ConsultantfilterType = 'withacchead';
      this.creditOrgizerList = this.creditOrgledgerList.filter(emp => emp.LedgerId > 0);
      this.selectedLedgerData = null;
    }
    else if (mapped == 'false') {
      this.ConsultantfilterType = 'withoutacchead';
      this.creditOrgizerList = this.creditOrgledgerList.filter(emp => emp.LedgerId == 0);
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.creditOrgizerList = this.creditOrgledgerList;
      this.selectedLedgerData = null;
    }
  }
  // END: Consultant Ledger


  // START:Inventory Vendor ledger
  SetInventoryVendorData() {
    this.selectedLedgerCount = 0;
    this.changeDetector.detectChanges();
    // this.GetLedgerMapping();
    this.getInventoryVendorlist();
    this.CurrentLedger = new LedgerModel();
    let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == 'inventoryvendor').LedgergroupUniqueName;
    let consultLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName);

    if (consultLedger != null || consultLedger != undefined) {
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == consultLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
      // this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == consultLedger.COA);
      this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
      this.CurrentLedger.COA = consultLedger.COA;
      this.CurrentLedger.LedgerGroupName = consultLedger.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = consultLedger.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");
    }
    else {
      this.msgBoxServ.showMessage('notice', ['Please first create ledger group for Inventory Vendor ']);
    }

  }


  //get inventory vendor list
  getInventoryVendorlist() {
    this.accountingSettingsBLService.GetInvVendorList()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.inventoryvledgerList = new Array<LedgerModel>();
          let data = res.Results;

          data.forEach(emp => {
            var led = new LedgerModel();
            led = Object.assign(led, emp);
            led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
              led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
              led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : '',
              led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.VendorId,
              led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
              led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
            led.Cr = (emp.DrCr == false) ? true : null;
            led.LedgerType = "inventoryvendor",
              this.inventoryvledgerList.push(led);
          });
          this.inventoryVendorList = this.inventoryvledgerList;
          this.totalLedger = this.inventoryVendorList.length;
          this.mappedLedger = this.inventoryVendorList.filter(l => l.IsMapped == true).length;
          this.notmappedLedger = this.inventoryVendorList.filter(l => l.IsMapped == false).length;

        }

      });
  }
  ToggleInventoryVendor(mapped) {
    if (mapped == 'true') {
      this.ConsultantfilterType = 'withacchead';
      this.inventoryVendorList = this.inventoryvledgerList.filter(emp => emp.LedgerId > 0);
      this.selectedLedgerData = null;
    }
    else if (mapped == 'false') {
      this.ConsultantfilterType = 'withoutacchead';
      this.inventoryVendorList = this.inventoryvledgerList.filter(emp => emp.LedgerId == 0);
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.inventoryVendorList = this.inventoryvledgerList
      this.selectedLedgerData = null;
    }
  }
  //END : Inventory Vendor Ledger  


  //SART : Pharmacy Supplier Ledger


  SetSupplierData() {

    this.selectedLedgerCount = 0;
    this.changeDetector.detectChanges();
    this.GetPharmacySupplierList();
    this.changeDetector.detectChanges();
    this.CurrentLedger = new LedgerModel();
    ///let employeeLedger = this.sourceLedGroupList.find(a => a.Name == 'LCL_SUNDRY_CREDITORS');


    let LedgerGroupName = this.ledgerTypeParamter.find(a => a.LedgerType == 'pharmacysupplier').LedgergroupUniqueName;
    let employeeLedger = this.sourceLedGroupList.find(a => a.Name == LedgerGroupName);

    if (employeeLedger != null || employeeLedger != undefined) {
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == employeeLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);

      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == employeeLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);
      // this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == employeeLedger.COA);

      this.CurrentLedger.PrimaryGroup = employeeLedger.PrimaryGroup;
      this.CurrentLedger.COA = employeeLedger.COA;
      this.CurrentLedger.LedgerGroupName = employeeLedger.LedgerGroupName;
      this.CurrentLedger.LedgerGroupId = employeeLedger.LedgerGroupId;
      this.ledgerListAutoComplete = this.sourceLedgerList.filter(emp => emp.LedgerGroupId == this.CurrentLedger.LedgerGroupId && emp.LedgerName != "");

    }
    else {
      this.msgBoxServ.showMessage('notice', ['Please first create ledger group for Credit Organizations']);
    }
  }
  //below code for create new ledger from pharmacy supplier and inventory vendor
  GetPharmacySupplierList() {
    this.accountingSettingsBLService.GetPharmacySupplier()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.phrmsupplierList = new Array<LedgerModel>();
          let data = res.Results;

          data.forEach(emp => {
            var led = new LedgerModel();
            led = Object.assign(led, emp);
            led.LedgerId = (emp.LedgerId != null) ? emp.LedgerId : 0,
              led.LedgerGroupId = (emp.LedgerGroupId != null) ? emp.LedgerGroupId : this.CurrentLedger.LedgerGroupId,
              led.LedgerName = (emp.LedgerName != null) ? emp.LedgerName : '',
              led.LedgerReferenceId = (emp.LedgerReferenceId != null) ? emp.LedgerReferenceId : emp.SupplierId,
              led.IsActive = (emp.IsActive != null) ? emp.IsActive : false,
              led.Dr = (emp.DrCr == true) ? emp.DrCr : null;
            led.Cr = (emp.DrCr == false) ? true : null;
            led.LedgerType = "pharmacysupplier",
              this.phrmsupplierList.push(led);
          });
          this.phrmSupplierList = this.phrmsupplierList;
          this.totalLedger = this.phrmSupplierList.length;
          this.mappedLedger = this.phrmSupplierList.filter(l => l.IsMapped == true).length;
          this.notmappedLedger = this.phrmSupplierList.filter(l => l.IsMapped == false).length;
        }
      });
  }
  TogglePhrmSupplierLedger(mapped) {
    if (mapped == 'true') {
      this.ConsultantfilterType = 'withacchead';
      this.phrmSupplierList = this.phrmsupplierList.filter(emp => emp.LedgerId > 0);
      this.selectedLedgerData = null;
    }
    else if (mapped == 'false') {
      this.ConsultantfilterType = 'withoutacchead';
      this.phrmSupplierList = this.phrmsupplierList.filter(emp => emp.LedgerId == 0);
      this.selectedLedgerData = null;
    }
    else {
      this.ConsultantfilterType = 'all';
      this.phrmSupplierList = this.phrmsupplierList
      this.selectedLedgerData = null;
    }
  }
  //END : Pharmacy Supplier Ledger


  // START:Inventory Subcategory ledger
  SetInventorySubcategoryData() {
    this.selectedLedgerCount = 0;
    this.changeDetector.detectChanges();
    // this.GetLedgerMapping();
    this.getInventorySubcategorylist();
    this.CurrentLedger = new LedgerModel();
    let LedgerGroupData = this.ledgerTypeParamter.filter(a => a.LedgerType == 'inventorysubcategory');
    let consultLedger = this.sourceLedGroupList.find(a => a.COA == LedgerGroupData[0].COA);

    if (consultLedger != null || consultLedger != undefined) {
      // let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == consultLedger.PrimaryGroup);
      // this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      let primaryGroupId = this.primaryGroupList.filter(p => p.PrimaryGroupName == consultLedger.PrimaryGroup)[0].PrimaryGroupId;
      this.coaList = this.allcoaList.filter(c => c.PrimaryGroupId == primaryGroupId);

      this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == consultLedger.COA);
      this.CurrentLedger.PrimaryGroup = consultLedger.PrimaryGroup;
      this.CurrentLedger.COA = consultLedger.COA;
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
          data.forEach(emp => {
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
  //This function we will call every list item remove or add in ledger creation page
  //This function will generate all provisional ledger and reassign provisional ledger code and arrange 
  //Provisioanl Ledger code only for Normal Ledger not for Consultant, Credit Organization, Inventory vendor, etc type ledger
  SetProvisionalLedgerCode() {
    try {
      if (this.provisionalLedgerCode == 0) {
        this.GetProvisionalLedgerCode();
      }
      var pLedCode = this.provisionalLedgerCode;
      this.NewledgerList.forEach(l => {
        if (!l.Code) {
          l.Code = pLedCode.toString();

        }
        pLedCode++;
      });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
}
