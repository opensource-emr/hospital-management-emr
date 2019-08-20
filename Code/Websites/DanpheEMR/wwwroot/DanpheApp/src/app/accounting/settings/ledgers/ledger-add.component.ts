
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
  public selLedger: Array<LedgerModel> = null;
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
  public typesupplier: any = false;
  public typevendor: any = false;
  public phrmSupplierList: any;
  public ledgerMappingList: any;
  constructor(public accountingSettingsBLService: AccountingSettingsBLService,
    public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public accountingBLService: AccountingBLService) {
    this.GetLedgerGroup();
    this.getLedgerList();
    //this.AddNewLedger();
  }
  //ngOnInit() {
  //  this.update = false;
  //}
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
    this.primaryGroupList = [];
    this.coaList = [];
    this.ledgerList = new Array<LedgerModel>();
    this.primaryGroupList = Array.from([new Set(this.sourceLedGroupList.map(i => i.PrimaryGroup))][0]);
  }
  //adding new Ledger
  AddLedger() {
    if (this.checkUniqueLedgerName()) {
      this.CheckDrCrValidation();
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
      if (ledgerValidation && this.CheckLedgerTypeValidation()) {
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
  //AddLedger() {
  //  if (this.checkUniqueLedgerName()) {
  //    this.CheckDrCrValidation();
  //    //for checking validations, marking all the fields as dirty and checking the validity.
  //    for (var i in this.CurrentLedger.LedgerValidator.controls) {
  //      this.CurrentLedger.LedgerValidator.controls[i].markAsDirty();
  //      this.CurrentLedger.LedgerValidator.controls[i].updateValueAndValidity();
  //    }
  //    if (this.CurrentLedger.IsValidCheck(undefined, undefined) && this.CheckLedgerTypeValidation()) {
  //      this.loading = true;
  //      ///During First Time Add Current Balance and Opening Balance is Equal                 
  //      this.accountingSettingsBLService.AddLedgers(this.CurrentLedger)
  //        .subscribe(
  //          res => {
  //            if (res.Status == "OK") {
  //              this.msgBoxServ.showMessage("success", ["Ledger Added"]);
  //              // this.CurrentLedger
  //              this.CallBackAddLedger(res);
  //              this.CurrentLedger = new LedgerModel();
  //              this.selLedgerGroup = null; ////Null the Selected Ledger Group 
  //              this.loading = false;
  //            }
  //            else {
  //              this.msgBoxServ.showMessage("error", ["Duplicate ledger not allowed"]);
  //              this.loading = false;
  //            }
  //          },
  //          err => {
  //            this.logError(err);
  //            this.loading = false;
  //          });
  //    } else {
  //      this.loading = false;
  //    }
  //  }
  //}
  //update Ledger
  //UpdateLedger() {
  //  if (this.checkUniqueLedgerName()) {
  //    this.CheckDrCrValidation();
  //    //for checking validations, marking all the fields as dirty and checking the validity.
  //    for (var i in this.CurrentLedger.LedgerValidator.controls) {
  //      this.CurrentLedger.LedgerValidator.controls[i].markAsDirty();
  //      this.CurrentLedger.LedgerValidator.controls[i].updateValueAndValidity();
  //    }
  //    if (this.CurrentLedger.IsValidCheck(undefined, undefined)) {
  //      this.loading = true;
  //      this.accountingSettingsBLService.UpdateLedger(this.CurrentLedger)
  //        .subscribe(
  //          res => {
  //            if (res.Status == "OK") {
  //              this.msgBoxServ.showMessage("success", ["Ledger Updated !"]);
  //              this.CallBackAddLedger(res);
  //              this.CurrentLedger = new LedgerModel();
  //              this.selLedgerGroup = null;
  //              this.loading = false;
  //            }
  //            else {
  //              this.msgBoxServ.showMessage("error", ["error in update, please try again !"]);
  //              this.loading = false;
  //            }
  //          },
  //          err => {
  //            this.logError(err);
  //            this.loading = false;
  //          });
  //    } else {
  //      this.loading = false;
  //    }
  //  }
  //}
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
      this.selLedgerGroup = this.ledgergroupList.filter(s => s.LedgerGroupName == this.CurrentLedger.LedgerGroupName)[0];
      if ((this.selLedgerGroup.LedgerGroupId != 0) && (this.selLedgerGroup.LedgerGroupId != null)) {
        this.CurrentLedger.LedgerGroupId = this.selLedgerGroup.LedgerGroupId;
        this.CurrentLedger.LedgerGroupName = this.selLedgerGroup.LedgerGroupName;
        //  this.ledgerList = new Array<LedgerModel>();
        //  this.CurrentLedger.LedgerId = 0;
        //  this.CurrentLedger.LedgerName = null;
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
    if (this.CurrentLedger.PrimaryGroup) {
      this.coaList = [];
       this.ledgergroupList = [];
        this.selLedgerGroup = null;
      this.CurrentLedger.LedgerGroupName = null;
      //  this.CurrentLedger.LedgerName = null;
      //  this.ledgerList = new Array<LedgerModel>();
      let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == this.CurrentLedger.PrimaryGroup);
      this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
      this.CurrentLedger.COA = this.coaList[0];
      this.COAChanged();
    }
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
    //if (this.CurrentLedger.LedgerName) { //&& this.update == false
    //  this.changeDetector.detectChanges();
    //  let count = this.sourceLedgerList.filter(s => s.LedgerName == this.CurrentLedger.LedgerName).length;
    //  if (count > 0) {
    //    this.CurrentLedger.LedgerName = null;
    //    this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
    //  }
    //}
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      let count = this.sourceLedgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      if (count > 0 || check > 0) {
        this.NewledgerList[index].LedgerName = null;
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
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
    return data["LedgerName"];
  }
  ChangeOpeningBalType(e, index: number) {
    this.loading = false;
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

  //below code for create new ledger from pharmacy supplier and inventory vendor
  GetPharmacySupplierList() {
    this.accountingSettingsBLService.GetPharmacySupplier()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.phrmSupplierList = res.Results;
        }
      });
  }
  GetLedgerMapping() {
    this.accountingBLService.GetLedgerMappingDetails()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.ledgerMappingList = res.Results;
        }
      });
  }
  SupplierListFormatter(data: any): string {
    return data["SupplierName"];
  }
  ToggleLedgerType(ledgerType) {
    this.ledgerType = ledgerType;
    this.CurrentLedger = new LedgerModel();

    if (ledgerType == 'ledger') {
      this.typeledger = true;
      this.typesupplier = false;
      this.typevendor = false;
    }
    if (ledgerType == 'pharmacysupplier') {
      this.typeledger = false;
      this.typesupplier = true;
      this.typevendor = false;
      this.SetSupplierData();
    }
    if (ledgerType == 'inventoryvendor') {
      this.typeledger = false;
      this.typesupplier = false;
      this.typevendor = true;
    }
  }
  SetSupplierData() {
    this.GetLedgerMapping();
    this.GetPharmacySupplierList();
    let supplierLedger = this.sourceLedGroupList.find(a => a.Name == 'LCL_SUNDRY_CREDITORS');
    let selectedPrimaryGroupList = this.sourceLedGroupList.filter(a => a.PrimaryGroup == supplierLedger.PrimaryGroup);

    this.coaList = Array.from([new Set(selectedPrimaryGroupList.map(i => i.COA))][0]);
    this.ledgergroupList = this.sourceLedGroupList.filter(a => a.COA == supplierLedger.COA);

    this.CurrentLedger.PrimaryGroup = supplierLedger.PrimaryGroup;
    this.CurrentLedger.COA = supplierLedger.COA;
    this.CurrentLedger.LedgerGroupName = supplierLedger.LedgerGroupName;
    this.NewledgerList.forEach(a => {
      a.PrimaryGroup = this.CurrentLedger.PrimaryGroup;
      a.COA = this.CurrentLedger.COA;
      a.LedgerGroupName = this.CurrentLedger.LedgerGroupName;
      a.LedgerGroupId = this.CurrentLedger.LedgerGroupId;
      a.CreatedBy = this.CurrentLedger.CreatedBy;
    });
  }
  CheckDuplicateSupplierLedger(index: number) {
    if (this.NewledgerList[index].LedgerName) {
      this.changeDetector.detectChanges();
      let led = this.ledgerMappingList.supplier.find(s => s.LedgerName == this.CurrentLedger.LedgerName);
      let check = this.NewledgerList.filter(s => s.LedgerName == this.NewledgerList[index].LedgerName).length;
      if (led || check > 0) {
        this.CurrentLedger.LedgerName = null;
        this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
      }
    }
  }
  CheckLedgerTypeValidation() {
    var temp = true;
    if (this.ledgerType != 'ledger') {
      if (this.ledgerType == 'pharmacysupplier') {
       
        this.NewledgerList.forEach(itm => {
          let supp = this.phrmSupplierList.find(s => s.SupplierName == itm.LedgerName);
          if (!supp) {
            itm.LedgerName = null;
            this.msgBoxServ.showMessage("notice", ['ledger not allowed']);
            temp = false;
          } else {
           itm.LedgerType = this.ledgerType;
          itm.LedgerReferenceId = supp.SupplierId;
            itm.LedgerName = supp.SupplierName;
          }
        });
    
      }
    }
    return temp;
  }
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
     //if (this.CurrentLedger.LedgerName) {
     //  this.changeDetector.detectChanges();
     //  let count = this.sourceLedgerList.filter(s => s.LedgerName == this.CurrentLedger.LedgerName).length;
     //  if (count > 0) {
     //    this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
     //    return false;
     //  }
     //  else return true;
     //}
     //else {
     //  this.msgBoxServ.showMessage("notice", ['LedgerName required.']);
     //}
    if (this.NewledgerList.length) {
      this.changeDetector.detectChanges();
      var temp = true;
      this.NewledgerList.forEach(itm => {
        let count = this.sourceLedgerList.filter(s => s.LedgerName == itm.LedgerName).length;
        let check = this.NewledgerList.filter(s => s.LedgerName == itm.LedgerName).length;
        if (count > 0 || check > 1 ) {
          this.msgBoxServ.showMessage("notice", ['duplicate ledger not allowed']);
          temp = false;
        }
      });
      return temp;
    }
    else {
      this.msgBoxServ.showMessage("notice", ['LedgerName required.']);
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
        if (this.ledgerType == "pharmacysupplier") {
          this.SetSupplierData();
        }
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
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
}
