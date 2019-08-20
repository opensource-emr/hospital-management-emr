import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { AccountingBLService } from '../shared/accounting.bl.service';
import { LedgerModel } from '../settings/shared/ledger.model';
import { ledgerGroupModel } from '../settings/shared/ledgerGroup.model';
import { TransactionModel } from './shared/transaction.model';
import { ItemModel } from '../settings/shared/item.model';
import { TransactionItem } from './shared/transaction-item.model';
import { TransactionItemDetailModel } from './shared/transaction-item-detail.model';
import { TransactionInventoryItem } from './shared/transaction-inventory-item.model';
import { TransactionCostCenterItem } from './shared/transaction-costcenter-item.model'
import { Voucher } from './shared/voucher'
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VoucherModel } from "../settings/shared/voucher.model";
import { InventoryTransferAccountingModel, BillingTransferAccountingModel, PharmacyTransferAccountingModel } from "./shared/transfer-to-accounting.model";
import { FiscalYearModel } from "../settings/shared/fiscalyear.model";
import { SecurityService } from "../../security/shared/security.service";
import { CoreService } from "../../core/shared/core.service";
import { TransactionLink } from "./shared/transaction-link.model";
import { GroupMappingModel } from "./shared/group-mapping.model";
import { CommonFunctions } from '../../shared/common.functions';
import { VoucherHeadModel } from "../settings/shared/voucherhead.model";
import { VoucherHead } from "./shared/VoucherHead";

import { DLService } from "../../shared/dl.service"
import { TransactionViewModel } from "./shared/transaction.model";
import { detectChanges } from '@angular/core/src/render3';
@Component({
  templateUrl: "./transfer-to-accounting.html"
})
export class TransferToAccountingComponent {
  //public moduleName: string = "Inventory";//now hardcoded in ui
  public transactionId: number = null;
  public voucherList: Array<VoucherModel> = new Array<VoucherModel>();

  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
  public currentFiscalYear: FiscalYearModel = new FiscalYearModel();
  public itemList: Array<any> = new Array<any>();// Array<InventoryTransferAccountingModel> = new Array<InventoryTransferAccountingModel>();       
  //public itemListVoucherWise: Array<any> = new Array<any>();
  public accTxn: TransactionModel = new TransactionModel();
  public accTxnFromBilling: Array<TransactionModel> = new Array<TransactionModel>();
  public accTxnForInv: Array<TransactionModel> = new Array<TransactionModel>();
  public accTxnForPhrm: Array<TransactionModel> = new Array<TransactionModel>();
  public sectionList = Array<{ SectionId: number, SectionName: string }>();//=new Array<SectionId:number,SectionName:string>();
  public sectionId: number = 2;//Section like 1-Inventory, 2-Billing, 3-Pharmacy (for now it's hardcoded) you can get from parameter table also
  public selectedSectionName: string = null;
  public selectAll: boolean = false;
  public selectAllLedger: boolean = true;
  public loading: boolean = false;
  public saveLoading: boolean = false;
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
  public mappingRuleList: Array<GroupMappingModel> = new Array<GroupMappingModel>();
  public unavailableLedgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public showUnavailableLedList: boolean = false;
  public voucherHeadList: Array<VoucherHeadModel> = new Array<VoucherHeadModel>();
  public selectedLedgers: Array<LedgerModel> = new Array<LedgerModel>();
  public selVoucherHead: VoucherHead = new VoucherHead();
  public accTxnDetail: TransactionItemDetailModel = new TransactionItemDetailModel();
  public IsVAlidDate: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public selectedVoucherId: number = -1;//default voucher is All
  public voucherNumber: string = null;
  public postData: any;
  public saveDataPopup: boolean = false;
  public saveData: boolean = false;
  public transactionItem: Array<TransactionItem> = new Array<TransactionItem>();
  public transactionDate: any;
  public transactionModel: any;
  public ledgerGroup: any;
  public fiscalYearName: any;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public disablebutton: boolean = false;
  public ledgerMappingDetail: any;
  public transaction: Array<TransactionViewModel> = new Array<TransactionViewModel>();
  public ShowItemsList: boolean = false;
  public maxTransferNumber: number = 0;
  public manualTransfer: boolean = false;
  public activeYear: boolean = false;
  constructor(
    public accountingBLService: AccountingBLService, public dlService: DLService,
    public msgBoxServ: MessageboxService,
    public changeDetectorRef: ChangeDetectorRef,
    public securityService: SecurityService,
    public coreService: CoreService,
    public router: Router
  ) {
    this.CheckManualTransferData();
    if (this.manualTransfer == true) {
      this.accTxnDetail.fromDate = moment().format('YYYY-MM-DD');
      this.accTxnDetail.toDate = moment().format('YYYY-MM-DD');
      this.GetACCTransferRule();
      this.GetSection();
      this.GetVoucherList();
      this.GetLedgerList();
      this.GetLedgerGroupList();
      this.GetFiscalYearList();
      this.GetChangedSection();
      this.GetVoucherHeadList();
      this.GetMaxTransferNumber();
      this.GetLedgerMappingDetails();
    }
  }

  CheckManualTransferData() {
    this.manualTransfer = this.coreService.CheckManualTransferData();
  }
  GetMaxTransferNumber() {
    this.maxTransferNumber = this.coreService.GetMaxNumberForTransferData();
  }
  //===============START:: Common Section ===============
  //Below are common function for all inventory, pharmacy and billing module   
  //when section /module name changed by user
  public GetChangedSection() {
    try {
      this.selectedSectionName = this.sectionList.find(s => s.SectionId == this.sectionId).SectionName;
      this.itemList = new Array<any>();
      //this.itemListVoucherWise = new Array<any>();
      //if (this.selectedSectionName == "Inventory") {
      //    this.GetInventoryItemsForTransferToACC();
      //} else if (this.selectedSectionName == "Billing") {
      //    this.GetBilTxnItemsForTransferToACC();
      //} else if (this.selectedSectionName == "Pharmacy") {
      //    this.GetPharmItemsForTransferToACC();
      //} else {
      //    this.msgBoxServ.showMessage("notice", ["pleaes select module name"])
      //}
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }

  }
  //this function get all transfer rule with details
  public GetACCTransferRule() {
    try {
      this.accountingBLService.GetACCTransferRule()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.mappingRuleList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Unable to transfer rule list"]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public GetVoucherList() {
    try {
      this.accountingBLService.GetVoucher()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.voucherList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Unable to get voucher list"]);
              console.log(res.Errors);
            }
          }
        });

    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public GetLedgerList() {
    try {
      this.accountingBLService.GetLedgers()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.ledgerList = new Array<LedgerModel>();
              this.ledgerList = res.Results;
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Unable to get ledger list"]);
              console.log(res.Errors);
            }
          }
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public GetLedgerGroupList() {
    try {
      this.accountingBLService.GetLedgerGroup()
        .subscribe(res => {
          if (res.Status == "OK") {
            this.ledgerGroupList = new Array<ledgerGroupModel>();
            this.ledgerGroupList = res.Results;
          }
        })
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public GetFiscalYearList() {
    try {
      this.accountingBLService.GetFiscalYearList()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              var data = res.Results;
              this.fiscalYearList = data;
              var activeFiscalYear = data.filter(a => a.IsActive == true);
              if(activeFiscalYear.length == 1){
                this.currentFiscalYear = data.find(a=> a.IsActive == true);
                this.activeYear = true;
              }
              else{
                this.activeYear = false;
              }
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Unable to get fiscalyear list"]);
              // console.log(res.Errors);
            }
          }
        });
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public GetSection() {
    try {
      let sectionListData = this.coreService.Parameters.filter(p => p.ParameterGroupName == "Accounting" && p.ParameterName == "SectionList");
      if (sectionListData.length > 0) {
        this.sectionList = JSON.parse(sectionListData[0].ParameterValue).SectionList;
      } else {
        this.msgBoxServ.showMessage("error", ['Please provide section (Module) name(s) !']);
      }
    } catch (ex) {
      this.sectionId = 2;//default billing selected
      this.ShowCatchErrMessage(ex);
    }
  }

  GetVoucherHeadList() {
    try {
      this.accountingBLService.GetVoucherHead()
        .subscribe(res => {
          this.voucherHeadList = res.Results;
          this.selVoucherHead = Object.assign(this.selVoucherHead, this.voucherHeadList.find(v => v.VoucherHeadName == "Hospital"));
        });
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //This function only for show catch messages
  public ShowCatchErrMessage(exception) {
    if (exception) {
      let ex: Error = exception;
      this.msgBoxServ.showMessage("error", ["Check error in Console log !"]);
      console.log("Error Messsage =>  " + ex.message);
      console.log("Stack Details =>   " + ex.stack);
    }
  }
  public ToggleSelectAll() {
    try {
      if (this.selectAll) {
        this.itemList.forEach(itm => {
          itm.IsSelected = false;
        });
        let selectedCount = this.itemList.length;
        if (selectedCount < this.maxTransferNumber) {
          this.maxTransferNumber = selectedCount;
        }

        for (let i = 0; i < this.maxTransferNumber; i++) {
          this.itemList[i].IsSelected = true;
        }
        this.msgBoxServ.showMessage("notice", [this.maxTransferNumber + " records selected for transfer!"]);
        this.maxTransferNumber = null;
        this.GetMaxTransferNumber();

      }
      else {
        this.itemList.forEach(itm => {
          itm.IsSelected = false;
        });
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public ToggleItemSelection(index: number) {
    try {
      if (this.itemList[index].IsSelected) {
        let selectedCount = this.itemList.filter(s => s.IsSelected == true).length;
        if (selectedCount > this.maxTransferNumber) {
          this.changeDetectorRef.detectChanges();
          this.itemList[index].IsSelected = false;
          this.msgBoxServ.showMessage("notice", ['maximum ' + this.maxTransferNumber + ' records allowed one time !']);
          this.changeDetectorRef.detectChanges();
        }
        for (let itm of this.itemList) {
          if (!itm.IsSelected) {
            this.selectAll = false;
            return;
          }
        }
        this.selectAll = true;
      }
      else {
        this.selectAll = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  // Selection of all Ledgers to create new ledgers
  public ToggleSelectAllLedger() {
    try {
      if (this.selectAllLedger) {
        this.unavailableLedgerList.forEach(led => {
          led.IsSelected = true;
        });
      }
      else {
        this.unavailableLedgerList.forEach(led => {
          led.IsSelected = false;
        });
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //select new ledgers 
  public ToggleLedgerSelection(index: number) {
    try {
      if (this.unavailableLedgerList[index].IsSelected) {
        for (let led of this.unavailableLedgerList) {
          if (!led.IsSelected) {
            this.selectAllLedger = false;
            return;
          }
        }
        this.selectAllLedger = true;
      }
      else {
        this.selectAllLedger = false;
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //save section/module data to accounting for all section this is common function
  //public SaveToAccounting() {
  //    try {
  //        if (this.itemList.length > 0) {
  //            //if (this.selectedVoucherId == -1)
  //            //{
  //            //    this.msgBoxServ.showMessage("error", ['please select voucher']);
  //            //    return;
  //            //}
  //            this.loading = true;
  //            this.accTxn = new TransactionModel();
  //            this.unavailableLedgerList = new Array<LedgerModel>();
  //            this.showUnavailableLedList = false;
  //            if (this.selectedSectionName == "Inventory") {
  //                this.MapInventoryToAccTxn();
  //                if (this.unavailableLedgerList.length > 0) {
  //                    this.showUnavailableLedList = true;
  //                } else {
  //                    this.PostTxnListToACC();
  //                }
  //            }
  //            else if (this.selectedSectionName == "Billing") {
  //                this.MapBillingForACCTxnPost();
  //                if (this.unavailableLedgerList.length > 0) {
  //                    this.showUnavailableLedList = true;
  //                } else {
  //                    this.PostTxnListToACC();
  //                }
  //            }
  //            else if (this.selectedSectionName == "Pharmacy") {
  //                this.MapPharmacyForACCTxnPost();
  //                if (this.unavailableLedgerList.length > 0) {
  //                    this.showUnavailableLedList = true;
  //                } else {
  //                    this.PostTxnListToACC();
  //                }
  //            }
  //        }
  //        else {
  //            this.msgBoxServ.showMessage("warning", ["No Record selected to transfer"]);
  //        }
  //    } catch (ex) {
  //        this.ShowCatchErrMessage(ex);
  //    }

  //}

  //here common post method for all type of section pharmacy, billing, inventory
  public PostTxnListToACC() {
    try {
      this.postData = (this.selectedSectionName == "Inventory") ? this.accTxnForInv : (this.selectedSectionName == "Pharmacy") ? this.accTxnForPhrm : this.accTxnFromBilling;
      this.transactionDate = moment().format('YYYY-MM-DD');
      if (this.postData.length > 0) {
        this.saveDataPopup = true;
        for (let i = 0; i < this.postData.length; i++) {
          for (let j = 0; j < this.postData[i].TransactionItems.length; j++) {
            let txnItm = this.postData[i].TransactionItems[j];
            this.transactionItem.push(txnItm);
          }
        }

        for (let i = 0; i < this.transactionItem.length; i++) {
          this.transactionItem[i].LedgerName = this.ledgerList.find(a => a.LedgerId == this.transactionItem[i].LedgerId).LedgerName;
          this.transactionItem[i].LedgerGroupName = this.ledgerList.find(a => a.LedgerId == this.transactionItem[i].LedgerId).LedgerGroupName;
        }
        this.Calculate();

      } else {

        this.loading = false;
        this.msgBoxServ.showMessage("notice", ['select item(s) and try again']);
      }


    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  SaveConfirm() {
    try {
      this.disablebutton = true;
      let unselectedItems = this.itemList.filter(a => a.IsSelected != true);
      this.accountingBLService.PostTxnListToACC(this.postData)
        .subscribe(res => {
          if (res.Status == "OK" && res.Results != null) {
            this.loading = false;
            this.msgBoxServ.showMessage('success', ['record transfered to accounting']);
            //this.ViewTransactionDetails(res.Results);
            this.itemList = new Array<any>();
            this.itemList = Object.assign(this.itemList, unselectedItems);
            //this.ItemListFilterByVoucher();
            this.saveDataPopup = false;
            this.Clear();
          }
          else if (res.Status == "Failed") {
            this.loading = false;
            this.msgBoxServ.showMessage("error", ['There is problem, please try again']);
          }
        },
          err => {
            this.loading = false;
            this.msgBoxServ.showMessage("error", ['There is problem, please try again']);
          });
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  Calculate() {
    try {
      if (this.transactionItem) {
        var helper = {};
        var Result = this.transactionItem;
        var result1 = Result.reduce(function (r, o) {
          var key = o.LedgerGroupName + o.LedgerName;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            if (helper[key].DrCr != true) {
              helper[key].LedgerCr = helper[key].Amount;
            }
            else {
              helper[key].LedgerDr = helper[key].Amount;
            }
            r.push(helper[key]);
          }
          else {
            helper[key].LedgerGroupName = o.LedgerGroupName;
            helper[key].LedgerName = o.LedgerName;
            if (o.DrCr) {
              helper[key].LedgerDr += o.Amount;
            }
            else {
              helper[key].LedgerCr += o.Amount;
            }
          }
          return r;
        }, []);

        this.transactionItem = result1;
        this.transactionItem.forEach(txnItm => {
          if (txnItm.LedgerDr != 0 || txnItm.LedgerCr != 0) {
            if (txnItm.LedgerDr >= txnItm.LedgerCr) {
              this.drTotal += CommonFunctions.parseAmount(txnItm.LedgerDr - txnItm.LedgerCr);
              txnItm.DrCr = true;
            }
            else {
              this.crTotal += CommonFunctions.parseAmount(txnItm.LedgerCr - txnItm.LedgerDr);
              txnItm.DrCr = false;
            }
          }
        });
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  Clear() {
    this.saveDataPopup = false;
    this.postData = null;
    this.disablebutton = false;
    this.transactionItem = new Array<TransactionItem>();;
    this.drTotal = 0;
    this.crTotal = 0;
    for (let i = 0; i < this.itemList.length; i++) {

      if (this.itemList[i].IsSelected = true) {
        this.itemList[i].IsSelected = false;
      }
    }
  }

  //this function shows popup for voucher after transaction
  ViewTransactionDetails(voucherNumber: string) {
    try {
      this.voucherNumber = null;
      this.changeDetectorRef.detectChanges();
      this.voucherNumber = voucherNumber;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //this function check LedgerId is valid or not if there is no Ledger id means no ledger in db
  public CheckValidTxn(accTxnItm: TransactionModel) {
    try {
      let flag = true;
      if (accTxnItm.TransactionItems.length > 0) {
        accTxnItm.TransactionItems.forEach(s => {
          if (!s.LedgerId) {
            flag = false;
          }
        });

      } else {
        flag = false;
      }
      return flag;
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public GetLedgerId(ledgerNameString, ledgerGroupId, ledgerReferenceId) {
    try {
      if (ledgerNameString && ledgerGroupId > 0) {
        let ledger = this.ledgerList.filter(x => x.LedgerName == ledgerNameString)[0];
        if (ledger) {
          return ledger.LedgerId;
        } else {
          let ledGrp = this.ledgerGroupList.filter(y => y.LedgerGroupId == ledgerGroupId)[0];
          let tempLed = new LedgerModel();
          tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
          tempLed.COA = ledGrp.COA;
          tempLed.LedgerGroupId = ledgerGroupId;
          tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
          tempLed.LedgerName = ledgerNameString;
          tempLed.LedgerReferenceId = ledgerReferenceId;
          let flag = true;
          this.unavailableLedgerList.forEach(l => {
            if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
              && l.LedgerName == tempLed.LedgerName) {
              flag = false;
            }
          });
          if (flag) {
            this.unavailableLedgerList.push(tempLed);
          }
          return 0;
        }
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  public GetLedgerMappingDetails() {
    try {
      this.accountingBLService.GetLedgerMappingDetails()
        .subscribe(res => {
          if (res.Status == 'OK') {
            this.ledgerMappingDetail = res.Results;
          }
        });
    } catch (ex) {

    }
  }
  //==============END:: Common Section ===============


  //=====================START: Inventory module (Section) Code =======================     
  ////get all gr items from inventory for transfer to accounting
  //public GetInventoryItemsForTransferToACC(): void {
  //    try {
  //        if (this.IsVAlidDate) {
  //            this.accountingBLService.GetInventoryItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
  //                .subscribe(res => {
  //                    if (res.Status == "OK") {
  //                        if (res.Results) {
  //                            //var goodsReceiptItems1 = res.Results.goodsReceiptItems1;
  //                            var goodsReceiptItems = res.Results.goodsReceiptItems;
  //                            var writeOffItems = res.Results.writeOffItems;
  //                            var returnToVender = res.Results.returnToVender;
  //                            this.itemList = goodsReceiptItems.concat(writeOffItems, returnToVender);
  //                            this.itemList.forEach(a => {
  //                                a.VoucherId = this.mappingRuleList.find(c => c.Description == a.TransactionType).VoucherId;
  //                                a.VoucherName = this.voucherList.find(v => v.VoucherId == a.VoucherId).VoucherName;
  //                                a.Remarks = a.Remarks + moment(a.CreatedOn).format('YYYY-MM-DD');;
  //                            });
  //                            if (this.itemList.length <= 0) {
  //                                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
  //                            }
  //                            //  this.ItemListFilterByVoucher();
  //                        }
  //                        else {
  //                            // this.msgBoxServ.showMessage("failed", ["NO Record Found."]);
  //                            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
  //                            console.log(res.Errors);
  //                        }
  //                    }
  //                });
  //        }
  //    } catch (exception) {
  //        this.ShowCatchErrMessage(exception);
  //    }
  //}

  // public GetLedgerIdFromVendor(VendorId, ledgerGroupId, VendorName) {
  //     try {
  //         let ledger = this.ledgerMappingDetail.vendor.find(a => a.VendorId == VendorId);
  //         if (ledger) {
  //             return ledger.LedgerId;
  //         } else {
  //             let ledGrp = this.ledgerGroupList.filter(y => y.LedgerGroupId == ledgerGroupId)[0];
  //             let tempLed = new LedgerModel();
  //             tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
  //             tempLed.COA = ledGrp.COA;
  //             tempLed.LedgerGroupId = ledgerGroupId;
  //             tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
  //             tempLed.LedgerName = VendorName;
  //             tempLed.LedgerReferenceId = VendorId;
  //             tempLed.LedgerType = 'inventoryvendor';
  //             let flag = true;
  //             this.unavailableLedgerList.forEach(l => {
  //                 if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
  //                     && l.LedgerName == tempLed.LedgerName && l.LedgerReferenceId == tempLed.LedgerReferenceId) {
  //                     flag = false;
  //                 }
  //             });
  //             if (flag) {
  //                 this.unavailableLedgerList.push(tempLed);
  //             }
  //             return 0;
  //         }
  //     } catch (ex) {
  //         console.log(ex);
  //     }
  //     return 0;
  // }

  // public MapInventoryToAccTxn() {
  //     try {
  //         this.accTxnForInv = new Array<TransactionModel>();
  //         for (let i = 0; i < this.itemList.length; i++) {
  //             if (this.itemList[i].IsSelected == true) {
  //                 let itm = new InventoryTransferAccountingModel();
  //                 itm = this.itemList[i];
  //                 let accTxntemp = new TransactionModel();
  //                 accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                 accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                 accTxntemp.Remarks = itm.Remarks + moment(itm.CreatedOn).format('YYYY-MM-DD');
  //                 accTxntemp.SectionId = this.sectionId;
  //                 accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                 accTxntemp.TransactionDate = itm.CreatedOn;
  //                 let txnLink = new TransactionLink();
  //                 txnLink.ReferenceId = itm.ReferenceIds.join();
  //                 accTxntemp.TransactionLinks.push(txnLink);


  //                 switch (itm.TransactionType) {
  //                     case "INVCashGoodReceipt1": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVCashGoodReceipt1").VoucherId;
  //                         let transferRule1 = this.mappingRuleList.find(s => s.Description == "INVCashGoodReceipt1").MappingDetail;
  //                         if (transferRule1) {
  //                             transferRule1.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = "INVCashGoodReceipt1";//itm.TransactionType;
  //                                 if (ruleRow.Description == "INVCashGoodReceipt1SundryCreditors") {
  //                                   accTxnItems.Amount = itm.TotalAmount + itm.VATAmount;
  //                                     //getting LedgerId from LedgerMapping
  //                                   ledId = this.GetLedgerIdFromVendor(itm.VendorId, ruleRow.LedgerGroupId, itm.VendorName);
  //                                   //Adding TransactionDetails With Vendor Id

  //                                   accTxnItems.IsTxnDetails = true;
  //                                   let accTxnItemDetail = new TransactionItemDetailModel();
  //                                   accTxnItemDetail.ReferenceId = itm.VendorId;
  //                                   accTxnItemDetail.ReferenceType = "Vendor";
  //                                   accTxnItemDetail.Amount = itm.SalesAmount;
  //                                   accTxnItemDetail.Description = "Inventory GoodReceipt";
  //                                   accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                 } else if (ruleRow.Description == "INVCashGoodReceipt1Inventory") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVCashGoodReceipt1DutiesandTaxes") {
  //                                     accTxnItems.Amount = itm.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }

  //                         if (this.CheckValidTxn(accTxntemp)) {
  //                             this.accTxnForInv.push(accTxntemp);
  //                             accTxntemp = new TransactionModel();
  //                             accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                             accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                             accTxntemp.Remarks = itm.Remarks + moment(itm.CreatedOn).format('YYYY-MM-DD');
  //                             accTxntemp.SectionId = this.sectionId;
  //                             accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                             accTxntemp.TransactionDate = itm.CreatedOn;

  //                             let txnLink = new TransactionLink();
  //                             txnLink.ReferenceId = itm.ReferenceIds.join();
  //                             accTxntemp.TransactionLinks.push(txnLink);
  //                         } else {
  //                             this.itemList[i].IsSelected = false;
  //                         }

  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVCashGoodReceipt2").VoucherId;
  //                         let transferRule2 = this.mappingRuleList.find(s => s.Description == "INVCashGoodReceipt2").MappingDetail;
  //                         if (transferRule2) {
  //                             transferRule2.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = "INVCashGoodReceipt2";//itm.TransactionType;
  //                                 if (ruleRow.Description == "INVCashGoodReceipt2SundryCreditors") {
  //                                   accTxnItems.Amount = itm.SalesAmount + itm.VATAmount;
  //                                     //getting LedgerId from LedgerMapping
  //                                     ledId = this.GetLedgerIdFromVendor(itm.VendorId, ruleRow.LedgerGroupId, itm.VendorName);
  //                                 } else if (ruleRow.Description == "INVCashGoodReceipt2CashInHand") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVCashGoodReceipt2DutiesandTaxes") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "INVCashGoodReceipt2DiscountIncome") {
  //                                     accTxnItems.Amount = itm.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "INVCreditGoodReceipt": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVCreditGoodReceipt").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "INVCreditGoodReceipt").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = itm.TransactionType;
  //                                 if (ruleRow.Description == "INVCreditGoodReceiptSundryCreditors") {
  //                                     accTxnItems.Amount = itm.TotalAmount + itm.VATAmount;
  //                                     //getting LedgerId from LedgerMapping
  //                                     ledId = this.GetLedgerIdFromVendor(itm.VendorId, ruleRow.LedgerGroupId, itm.VendorName);
  //                                 } else if (ruleRow.Description == "INVCreditGoodReceiptInventory") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVCreditGoodReceiptDutiesandTaxes") {
  //                                     accTxnItems.Amount = itm.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "INVCreditPaidGoodReceipt": {
  //                         //not handled on server side
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVCreditPaidGoodReceipt").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "INVCreditPaidGoodReceipt").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = itm.TransactionType;
  //                                 if (ruleRow.Description == "INVCreditPaidGoodReceiptSundryCreditors") {
  //                                     accTxnItems.Amount = itm.SalesAmount;
  //                                     //getting LedgerId from LedgerMapping
  //                                     ledId = this.GetLedgerIdFromVendor(itm.VendorId, ruleRow.LedgerGroupId, itm.VendorName);
  //                                 } else if (ruleRow.Description == "INVCreditPaidGoodReceiptCashInHand") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVCreditPaidGoodReceiptDutiesandTaxes") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "INVCreditPaidGoodReceiptDiscountIncome") {
  //                                     accTxnItems.Amount = itm.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "INVWriteOff": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVWriteOff").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "INVWriteOff").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = itm.TransactionType;
  //                                 if (ruleRow.Description == "INVWriteOffCostofGoodsSold") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     //Adding Item Details With VendorId
  //                                     //let accTxnItemDetail = new TransactionItemDetailModel();
  //                                     //accTxnItemDetail.ReferenceId = itm.VendorId;
  //                                     //accTxnItemDetail.ReferenceType = "Vendor";
  //                                     //accTxnItemDetail.Amount = itm.TotalAmount;
  //                                     //accTxnItemDetail.Description = "Inventory WriteOff COGS";
  //                                     //accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                 } else if (ruleRow.Description == "INVWriteOffInventory") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "INVReturnToVendorCashGR": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVReturnToVendorCashGR").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "INVReturnToVendorCashGR").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = itm.TransactionType;
  //                                 if (ruleRow.Description == "INVReturnToVendorCashGRInventory") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxnItems.VendorId = itm.VendorId;
  //                                     accTxntemp.TransactionType = itm.TransactionType;
  //                                 } else if (ruleRow.Description == "INVReturnToVendorCashGRDiscountIncome") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes" && ruleRow.DrCr == false) {
  //                                     accTxnItems.Amount = itm.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "INVReturnToVendorCashGRCashInHand") {
  //                                     accTxnItems.Amount = itm.TotalAmount + itm.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "INVReturnToVendorCashGRDutiesandTaxes") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "INVReturnToVendorCreditGR": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "INVReturnToVendorCreditGR").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "INVReturnToVendorCreditGR").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 accTxntemp.TransactionType = itm.TransactionType;
  //                                 if (ruleRow.Description == "INVReturnToVendorCreditGRInventory") {
  //                                     accTxnItems.Amount = itm.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY-HOSPITAL"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxnItems.VendorId = itm.VendorId;
  //                                     //  accTxnItems.IsTxnDetails = true;
  //                                     accTxntemp.TransactionType = itm.TransactionType;
  //                                 } else if (ruleRow.Description == "INVReturnToVendorCreditGRSundryCreditors") {
  //                                     accTxnItems.Amount = itm.TotalAmount + itm.VATAmount;
  //                                     //getting LedgerId from LedgerMapping 
  //                                     ledId = this.GetLedgerIdFromVendor(itm.VendorId, ruleRow.LedgerGroupId, itm.VendorName);
  //                                 } else if (ruleRow.Description == "INVReturnToVendorCreditGRDutiesandTaxes") {
  //                                     accTxnItems.Amount = itm.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                 }
  //                 if (this.CheckValidTxn(accTxntemp)) {
  //                     this.accTxnForInv.push(accTxntemp);
  //                 } else {
  //                     this.itemList[i].IsSelected = false;
  //                 }
  //             }
  //         }
  //     } catch (exception) {
  //         this.ShowCatchErrMessage(exception);
  //     }
  // }
  //=====================END: Inventory module (Section) Code================================




  //==============START: Billing module (Section) Code ======================
  //GetBillVoucherId(transactionType: string) {
  //    if (transactionType) {
  //        switch (transactionType) {
  //            case "CashBill": {
  //               return this.voucherList.find(a => a.VoucherName == "Sales Voucher").VoucherId;                    
  //            }
  //            case "CashBillReturn": {
  //                return this.voucherList.find(a => a.VoucherName == "Credit Note").VoucherId;                    
  //            } 
  //            case "CreditBill": {
  //                return this.voucherList.find(a => a.VoucherName == "Sales Voucher").VoucherId;                    
  //            } 
  //            case "CreditBillPaid": {
  //                return this.voucherList.find(a => a.VoucherName == "Payment Voucher").VoucherId;                    
  //            } 
  //            case "CreditBillReturn": {
  //                return this.voucherList.find(a => a.VoucherName == "Credit Note").VoucherId;                    
  //            }
  //            case "DepositAdd": {
  //                return this.voucherList.find(a => a.VoucherName == "Receipt Voucher").VoucherId;                    
  //            } 
  //            case "DepositReturn": {
  //                return this.voucherList.find(a => a.VoucherName == "Payment Voucher").VoucherId;                    
  //            } 
  //        }
  //    }
  //}
  //get all bil txn items from billing for transfer to accounting

  //public GetBilTxnItemsForTransferToACC(): void {
  //    try {
  //        if (this.IsVAlidDate) {
  //            this.accountingBLService.GetBilTxnItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
  //                .subscribe(res => {
  //                    if (res.Status == "OK") {
  //                        if (res.Results.length) {
  //                            this.itemList = res.Results;
  //                            this.itemList.forEach(a => {
  //                                a.TransactionDate = moment(a.TransactionDate).format('YYYY-MM-DD');
  //                                a.Remarks = a.Remarks + a.TransactionDate;
  //                                a.SalesAmount = CommonFunctions.parseAmount(a.SalesAmount);
  //                                a.TaxAmount = CommonFunctions.parseAmount(a.TaxAmount);
  //                                a.DiscountAmount = CommonFunctions.parseAmount(a.DiscountAmount);
  //                                a.TotalAmount = CommonFunctions.parseAmount(a.TotalAmount);
  //                                a.SettlementDiscountAmount = CommonFunctions.parseAmount(a.SettlementDiscountAmount);
  //                                a.VoucherId = this.mappingRuleList.find(c => c.Description == a.TransactionType).VoucherId;
  //                                a.VoucherName = this.voucherList.find(v => v.VoucherId == a.VoucherId).VoucherName;
  //                                // a.VoucherId = this.GetBillVoucherId(a.TransactionType);                                                                        
  //                            });
  //                            //this.ItemListFilterByVoucher();
  //                        }
  //                        else {
  //                            // this.msgBoxServ.showMessage("failed", ["NO Record Found."]);
  //                            this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
  //                            console.log(res.Errors);
  //                        }
  //                    }
  //                });
  //        }
  //    } catch (exception) {
  //        this.ShowCatchErrMessage(exception);
  //    }
  //}
  //billing txn map for acc transaction 
  // public MapBillingForACCTxnPost() {
  //     try {
  //         this.accTxnFromBilling = new Array<TransactionModel>();
  //         for (let i = 0; i < this.itemList.length; i++) {
  //             if (this.itemList[i].IsSelected == true) {
  //                 let record = new BillingTransferAccountingModel();
  //                 record = this.itemList[i];
  //                 let accTxntemp = new TransactionModel();
  //                 accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                 accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                 accTxntemp.Remarks = record.Remarks; // + moment(record.TransactionDate).format('YYYY-MM-DD');
  //                 accTxntemp.SectionId = this.sectionId;

  //                 accTxntemp.TransactionDate = record.TransactionDate;
  //                 accTxntemp.BillSyncs = record.BillSyncs;
  //                 // accTxntemp.VoucherId = this.GetBillVoucherId(record.TransactionType);
  //                 accTxntemp.VoucherId = this.mappingRuleList.find(c => c.Description == record.TransactionType).VoucherId;
  //                 accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                 var referenceIdArray: string[] = record.BillTxnItemIds;
  //                 //referenceIdArray.forEach(r => {
  //                 //    let txnLink = new TransactionLink();
  //                 //    txnLink.ReferenceId = parseInt(r);
  //                 //    accTxntemp.TransactionLinks.push(txnLink);
  //                 //});
  //                 let txnLink = new TransactionLink();
  //                 txnLink.ReferenceId = referenceIdArray.join();
  //                 accTxntemp.TransactionLinks.push(txnLink);
  //                 switch (record.TransactionType) {
  //                     case "CashBill": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "CashBillSales") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
  //                                 } else if (ruleRow.Description == "CashBillCashInHand" || ruleRow.Name == "ACA_BANK") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
  //                                     let ledName = (record.PaymentMode == "cash") ? this.GetLedgerName("ACA_CASH_IN_HAND_CASH") : this.GetLedgerName("ACA_BANK_HAMS_BANK");
  //                                     ledId = this.GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.CreatedBy;
  //                                         accTxnItemDetail.ReferenceType = "User";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CashBill->Cash -> Created By";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "CashBillDutiesandTaxes") {
  //                                     accTxnItems.Amount = record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "CashBillAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "CreditBill": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "CreditBillSales") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
  //                                 } else if (ruleRow.Description == "CreditBillSundryDebtors") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //   accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "Patient";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CreditBill->Sundry Debtors->Receivable";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "CreditBillDutiesandTaxes") {
  //                                     accTxnItems.Amount = record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "CreditBillAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "CashBillReturn": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "CashBillReturnSales") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
  //                                 } else if (ruleRow.Description == "CashBillReturnCashInHand" || ruleRow.Name == "ACA_BANK") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
  //                                     let ledName = (record.PaymentMode == "cash") ? this.GetLedgerName("ACA_CASH_IN_HAND_CASH") : this.GetLedgerName("ACA_BANK_HAMS_BANK");
  //                                     ledId = this.GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.CreatedBy;
  //                                         accTxnItemDetail.ReferenceType = "User";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CashBillReturn->Cash -> Created By";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "CashBillReturnDutiesandTaxes") {
  //                                     accTxnItems.Amount = record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "CashBillReturnAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "CreditBillPaid": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "CreditBillPaidCashInHand" || ruleRow.Name == "ACA_BANK") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount - record.SettlementDiscountAmount) + record.TaxAmount;
  //                                     let ledName = (record.PaymentMode == "cash") ? this.GetLedgerName("ACA_CASH_IN_HAND_CASH") : this.GetLedgerName("ACA_BANK_HAMS_BANK");
  //                                     ledId = this.GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.CreatedBy;
  //                                         accTxnItemDetail.ReferenceType = "User";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CreditBillPaid->Cash -> Created By";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "CreditBillPaidSundryDebtors") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //   accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "Patient";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CreditBillPaid->Sundry Debtors->Receivable";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 }
  //                                 //} else if (ruleRow.LedgerGroupName == "Duties and Taxes") {
  //                                 //    accTxnItems.Amount = record.TaxAmount;
  //                                 //    ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 //}
  //                                 else if (ruleRow.Description == "CashBillReturnAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.SettlementDiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "CreditBillReturn": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "CreditBillReturnSales") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(record.IncomeLedgerName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);    //here service deptname are income ledgers for Hospital
  //                                 } else if (ruleRow.Description == "CreditBillReturnSundryDebtors") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //   accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "Patient";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "CreditBillReturn->Sundry Debtors->Receivable";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "CreditBillReturnDutiesandTaxes") {
  //                                     accTxnItems.Amount = record.TaxAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "CreditBillReturnAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "DepositAdd": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "DepositAddCashInHand" || ruleRow.Name == "ACA_BANK") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     let ledName = (record.PaymentMode == "cash") ? this.GetLedgerName("ACA_CASH_IN_HAND_CASH") : this.GetLedgerName("ACA_BANK_HAMS_BANK");
  //                                     ledId = this.GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.CreatedBy;
  //                                         accTxnItemDetail.ReferenceType = "User";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "DepositAdd->Cash -> Created By";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "DepositAddPatientDeposits(Liability)") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "Patient";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "DepositAdd->Patient Deposits (Liability)->Advance From Patient";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "DepositReturn": {
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == record.TransactionType).MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "DepositReturnCashInHand" || ruleRow.Name == "ACA_BANK") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     let ledName = this.GetLedgerName("ACA_CASH_IN_HAND_CASH");//(record.PaymentMode == "cash") ? this.GetLedgerName("ACA_CASH_IN_HAND_CASH") : this.GetLedgerName("ACA_BANK_HAMS_BANK");
  //                                     ledId = this.GetLedgerId(ledName, ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.CreatedBy;
  //                                         accTxnItemDetail.ReferenceType = "User";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "DepositReturn->Cash -> Created By";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 } else if (ruleRow.Description == "DepositReturnPatientDeposits(Liability)") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_PATIENT_DEPOSITS_(LIABILITY)_ADVANCE_FROM_PATIENT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxntemp.BillSyncs.forEach(r => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "Patient";
  //                                         accTxnItemDetail.Amount = r.TotalAmount;
  //                                         accTxnItemDetail.Description = "DepositReturn->Patient Deposits (Liability)->Advance From Patient";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                     accTxnItems.IsTxnDetails = true;
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionType = record.TransactionType;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }

  //                 }
  //                 if (this.CheckValidTxn(accTxntemp)) {
  //                     this.accTxnFromBilling.push(accTxntemp);
  //                 } else {
  //                     this.itemList[i].IsSelected = false;
  //                 }
  //             }
  //         }
  //     } catch (ex) {
  //         this.ShowCatchErrMessage(ex);
  //     }
  // }
  //==============END: Billing module (Section) Code ======================


  //==============START: pharmacy module (Section) Code========================      
  //get all pharmacy item for transfer to accounting
  //  public GetPharmItemsForTransferToACC(): void {
  //      try {
  //          if (this.IsVAlidDate) {
  //              this.accountingBLService.GetPharmItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
  //                  .subscribe(res => {
  //                      if (res.Status == "OK") {
  //                          if (res.Results) {
  //                              let CashInvoice = res.Results.CashInvoice;
  //                              let CashInvoiceReturn = res.Results.CashInvoiceReturn;
  //                              let writeoff = res.Results.writeoff;
  //                              let returnToSupplier = res.Results.returnToSupplier;
  //                              let goodReceipt = res.Results.goodsReceiptItems;
  //                              this.itemList = CashInvoice.concat(returnToSupplier, writeoff, goodReceipt, CashInvoiceReturn);
  //                              this.itemList.forEach(a => {
  //                                  a.VoucherId = this.mappingRuleList.find(c => c.Description == a.TransactionType).VoucherId;
  //                                  a.VoucherName = this.voucherList.find(v => v.VoucherId == a.VoucherId).VoucherName;
  //                                  a.Remarks = a.Remarks + moment(a.CreatedOn).format('YYYY-MM-DD');
  //                              });
  //                              if (this.itemList.length <= 0) {
  //                                  this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
  //                              }
  //                              //this.ItemListFilterByVoucher();
  //                          }
  //                          else {
  //                              this.msgBoxServ.showMessage("failed", ["NO Record Found."]);
  //                              console.log(res.Errors);
  //                          }
  //                      }
  //                  });
  //          }
  //      } catch (exception) {
  //          this.ShowCatchErrMessage(exception);
  //      }
  //}


  public GetLedgerIdFromSupplier(supplierid, ledgerGroupId, SupplierName) {
    try {
      let ledger = this.ledgerMappingDetail.supplier.find(a => a.SupplierId == supplierid);
      if (ledger) {
        return ledger.LedgerId;
      } else {
        let ledGrp = this.ledgerGroupList.filter(y => y.LedgerGroupId == ledgerGroupId)[0];
        let tempLed = new LedgerModel();
        tempLed.PrimaryGroup = ledGrp.PrimaryGroup;
        tempLed.COA = ledGrp.COA;
        tempLed.LedgerGroupId = ledgerGroupId;
        tempLed.LedgerGroupName = ledGrp.LedgerGroupName;
        tempLed.LedgerName = SupplierName;
        tempLed.LedgerReferenceId = supplierid;
        tempLed.LedgerType = 'pharmacysupplier';
        let flag = true;
        this.unavailableLedgerList.forEach(l => {
          if (l.PrimaryGroup == tempLed.PrimaryGroup && l.COA == tempLed.COA && l.LedgerGroupId == tempLed.LedgerGroupId
            && l.LedgerName == tempLed.LedgerName && l.LedgerReferenceId == tempLed.LedgerReferenceId) {
            flag = false;
          }
        });
        if (flag) {
          this.unavailableLedgerList.push(tempLed);
        }
        return 0;
      }
    } catch (ex) {
      console.log(ex);
    }
    return 0;
  }
  //pharmacy txn map for acc transaction 
  // public MapPharmacyForACCTxnPost() {
  //     try {
  //         this.accTxnForPhrm = new Array<TransactionModel>();
  //         for (let i = 0; i < this.itemList.length; i++) {
  //             if (this.itemList[i].IsSelected == true) {
  //                 let record = new PharmacyTransferAccountingModel();
  //                 record = this.itemList[i];
  //                 let accTxntemp = new TransactionModel();
  //                 accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                 accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                 accTxntemp.Remarks = record.Remarks; //+ moment(record.CreatedOn).format('YYYY-MM-DD');
  //                 accTxntemp.SectionId = this.sectionId;
  //                 accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                 accTxntemp.TransactionDate = record.CreatedOn;
  //                 accTxntemp.TransactionType = record.TransactionType;

  //                 //record.ReferenceIds.forEach(i => {
  //                 //    let txnLink = new TransactionLink();
  //                 //    txnLink.ReferenceId = parseInt(i);
  //                 //    accTxntemp.TransactionLinks.push(txnLink);
  //                 //});
  //                 let txnLink = new TransactionLink();
  //                 txnLink.ReferenceId = record.ReferenceIds.join();
  //                 accTxntemp.TransactionLinks.push(txnLink);



  //                 switch (record.TransactionType) {
  //                     case "PHRMCashInvoice1": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoice1").VoucherId;
  //                         let transferRule1 = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoice1").MappingDetail;
  //                         if (transferRule1) {
  //                             transferRule1.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashInvoice1Sales") {
  //                                     accTxnItems.Amount = record.SalesAmount //- record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashInvoice1SundryDebtors") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.VATAmount;//+ record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxnItems.IsTxnDetails = true;
  //                                     accTxntemp.TransactionType = "PHRMCashInvoice1";//record.TransactionType;
  //                                     //Adding Item Details With PatientId
  //                                     record.BillSyncs.forEach(a => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "PHRMPatient";
  //                                         accTxnItemDetail.ReferenceId = a.PatientId;
  //                                         accTxnItemDetail.Amount = a.TotalAmount;
  //                                         accTxnItemDetail.Description = "Pharmacy Cash Invoice Sale";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                 } else if (ruleRow.Description == "PHRMCashInvoice1DutiesandTaxes") {
  //                                     accTxnItems.Amount = record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashInvoice1AdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }

  //                         if (this.CheckValidTxn(accTxntemp)) {
  //                             this.accTxnForPhrm.push(accTxntemp);
  //                             accTxntemp = new TransactionModel();
  //                             accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                             accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                             accTxntemp.Remarks = record.Remarks;
  //                             accTxntemp.SectionId = this.sectionId;
  //                             accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                             accTxntemp.TransactionDate = record.CreatedOn;

  //                             let txnLink = new TransactionLink();
  //                             txnLink.ReferenceId = record.ReferenceIds.join();
  //                             accTxntemp.TransactionLinks.push(txnLink);
  //                         } else {
  //                             this.itemList[i].IsSelected = false;
  //                         }

  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoice2").VoucherId;
  //                         let transferRule2 = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoice2").MappingDetail;
  //                         if (transferRule2) {
  //                             transferRule2.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashInvoice2CashInHand") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.VATAmount;//+ record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashInvoice2SundryDebtors") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_SUNDRY_DEBTORS_RECEIVABLES"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxnItems.IsTxnDetails = true;
  //                                     accTxntemp.TransactionType = "PHRMCashInvoice2";//record.TransactionType;
  //                                     //Adding ItemDetails with PatientId
  //                                     record.BillSyncs.forEach(a => {
  //                                         let accTxnItemDetail = new TransactionItemDetailModel();
  //                                         //  accTxnItemDetail.PatientId = r.PatientId;
  //                                         accTxnItemDetail.ReferenceType = "PHRMPatient";
  //                                         accTxnItemDetail.ReferenceId = a.PatientId;
  //                                         accTxnItemDetail.Amount = a.TotalAmount;
  //                                         accTxnItemDetail.Description = "Pharmacy Cash Invoice Sale";
  //                                         accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                     });
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashInvoice2AdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "PHRMCashInvoiceReturn": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoiceReturn").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "PHRMCashInvoiceReturn").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashInvoiceReturnSales") {
  //                                     accTxnItems.Amount = record.SalesAmount;                // record.TotalAmount - record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RDI_SALES_SALES-PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashInvoiceReturnCashInHand") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashInvoiceReturnDutiesandTaxes") {
  //                                     accTxnItems.Amount = record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashInvoiceReturnAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_TRADE_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashInvoiceReturnAdministrationExpenses") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EIE_ADMINISTRATION_EXPENSES_CASH_DISCOUNT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "PHRMCashReturnToSupplier": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashReturnToSupplier").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "PHRMCashReturnToSupplier").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashReturnToSupplierInventory") {
  //                                     accTxnItems.Amount = record.SalesAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                     accTxnItems.SupplierId = record.SupplierId;
  //                                     //accTxnItems.IsTxnDetails = true;
  //                                     accTxntemp.TransactionType = record.TransactionType;
  //                                 } else if (ruleRow.Description == "PHRMCashReturnToSupplierCashInHand") {
  //                                     accTxnItems.Amount = (record.SalesAmount - record.DiscountAmount) + record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes" && ruleRow.DrCr == false) {
  //                                     accTxnItems.Amount = record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashReturnToSupplierDutiesandTaxes") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashReturnToSupplierDiscountIncome") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "PHRMCashGoodReceipt1": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashGoodReceipt1").VoucherId;
  //                         let transferRule1 = this.mappingRuleList.find(s => s.Description == "PHRMCashGoodReceipt1").MappingDetail;
  //                         if (transferRule1) {
  //                             transferRule1.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashGoodReceipt1SundryCreditors") {
  //                                     accTxnItems.Amount = record.TotalAmount + record.VATAmount;
  //                                     //getting LedgerId From Ledger-Supplier mapping
  //                                     ledId = this.GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
  //                                     accTxnItems.IsTxnDetails = true;
  //                                     accTxntemp.TransactionType = "PHRMCashGoodReceipt1";//record.TransactionType;
  //                                     accTxnItems.SupplierId = record.SupplierId;
  //                                     //Adding Transaction details with SupplierId
  //                                     let accTxnItemDetail = new TransactionItemDetailModel();
  //                                     //accTxnItemDetail.SupplierId = record.SupplierId;
  //                                     accTxnItemDetail.ReferenceId = record.SupplierId;
  //                                     accTxnItemDetail.ReferenceType = "Supplier";
  //                                     accTxnItemDetail.Amount = record.SalesAmount;
  //                                     accTxnItemDetail.Description = "Pharmacy GoodReceipt";
  //                                     accTxnItems.TransactionItemDetails.push(accTxnItemDetail);
  //                                 } else if (ruleRow.Description == "PHRMCashGoodReceipt1Inventory") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashGoodReceipt1DutiesandTaxes") {
  //                                     accTxnItems.Amount = record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_VAT"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }

  //                         if (this.CheckValidTxn(accTxntemp)) {
  //                             this.accTxnForPhrm.push(accTxntemp);
  //                             accTxntemp = new TransactionModel();
  //                             accTxntemp.FiscalYearId = this.currentFiscalYear.FiscalYearId;
  //                             accTxntemp.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                             accTxntemp.Remarks = record.Remarks;
  //                             accTxntemp.SectionId = this.sectionId;
  //                             accTxntemp.VoucherHeadId = this.selVoucherHead.VoucherHeadId;
  //                             accTxntemp.TransactionDate = record.CreatedOn;
  //                             let txnLink = new TransactionLink();
  //                             txnLink.ReferenceId = record.ReferenceIds.join();
  //                             accTxntemp.TransactionLinks.push(txnLink);

  //                         } else {
  //                             this.itemList[i].IsSelected = false;
  //                         }


  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMCashGoodReceipt2").VoucherId;
  //                         let transferRule2 = this.mappingRuleList.find(s => s.Description == "PHRMCashGoodReceipt2").MappingDetail;
  //                         if (transferRule2) {
  //                             transferRule2.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMCashGoodReceipt2SundryCreditors") {
  //                                     accTxnItems.Amount = record.SalesAmount //record.TotalAmount - record.VATAmount;
  //                                     ledId = this.GetLedgerIdFromSupplier(record.SupplierId, ruleRow.LedgerGroupId, record.SupplierName);
  //                                     accTxntemp.TransactionType = "PHRMCashGoodReceipt2";//record.TransactionType;
  //                                     accTxnItems.SupplierId = record.SupplierId;
  //                                 } else if (ruleRow.Description == "PHRMCashGoodReceipt2CashInHand") {
  //                                     accTxnItems.Amount = record.TotalAmount - record.VATAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_CASH_IN_HAND_CASH"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMCashGoodReceipt2DutiesandTaxes") {
  //                                     accTxnItems.Amount = 0;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("LCL_DUTIES_AND_TAXES_TDS_PAYABLE"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 else if (ruleRow.Description == "PHRMCashGoodReceipt2DiscountIncome") {
  //                                     accTxnItems.Amount = record.DiscountAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("RII_DISCOUNT_INCOME_CASH_DISCOUNT_INCOME"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     }
  //                     case "PHRMWriteOff": {
  //                         accTxntemp.VoucherId = this.mappingRuleList.find(s => s.Description == "PHRMWriteOff").VoucherId;
  //                         let transferRule = this.mappingRuleList.find(s => s.Description == "PHRMWriteOff").MappingDetail;
  //                         if (transferRule) {
  //                             transferRule.forEach(ruleRow => {
  //                                 let accTxnItems = new TransactionItem();
  //                                 let ledId = 0;
  //                                 if (ruleRow.Description == "PHRMWriteOffInventory") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("ACA_INVENTORY_INVENTORY_PHARMACY"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 } else if (ruleRow.Description == "PHRMWriteOffCostofGoodsSold") {
  //                                     accTxnItems.Amount = record.TotalAmount;
  //                                     ledId = this.GetLedgerId(this.GetLedgerName("EDE_COST_OF_GOODS_SOLD_COGS"), ruleRow.LedgerGroupId, ruleRow.LedgerReferenceId);
  //                                 }
  //                                 accTxnItems.DrCr = ruleRow.DrCr;
  //                                 accTxnItems.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
  //                                 accTxnItems.LedgerId = (ledId > 0) ? ledId : 0;
  //                                 accTxntemp.TransactionItems.push(accTxnItems);
  //                             });
  //                         }
  //                         break;
  //                     } 
  //                 }
  //                 if (this.CheckValidTxn(accTxntemp)) {
  //                     this.accTxnForPhrm.push(accTxntemp);
  //                 } else {
  //                     this.itemList[i].IsSelected = false;
  //                 }
  //             }
  //         }
  //     } catch (exception) {
  //         this.ShowCatchErrMessage(exception);
  //     }

  // }
  //==============END: pharmacy module (Section) Code========================  

  public CreateLedger() {
    try {
      this.selectedLedgers = this.unavailableLedgerList.filter(a => a.IsSelected == true);
      let unselectedItems = this.unavailableLedgerList.filter(a => a.IsSelected != true);
      if (this.selectedLedgers.length > 0) {
        this.accountingBLService.AddLedgers(this.selectedLedgers)
          .subscribe(
            res => {
              this.msgBoxServ.showMessage("success", ["Ledger Added"]);
              this.GetLedgerList();
              this.GetLedgerMappingDetails();
              this.Close();
            });
      }
      else {
        this.loading = false;
        this.msgBoxServ.showMessage("notice", ['select ledger(s) and try again']);
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  Close() {
    this.showUnavailableLedList = false;
    this.loading = false;
    this.saveDataPopup = false;
  }

  GetLedgerName(Name) {
    try {
      return this.ledgerList.find(a => a.Name == Name).LedgerName;
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }

  CheckValidDates(){
    var temp =false;
    var td = moment(this.accTxnDetail.toDate, 'YYYY/MM/DD');
    var fd = moment(this.accTxnDetail.fromDate, 'YYYY/MM/DD');
    this.fiscalYearList.forEach(years =>{
      if ((moment(years.StartDate, 'YYYY/MM/DD') <= fd && moment(years.EndDate, 'YYYY/MM/DD') >= td)) {
         return temp = true;
      }
    });
    return temp;
  }
  Load() {
    if(this.activeYear){
    if (this.accTxnDetail.fromDate != null && this.accTxnDetail.toDate != null) {
      var td = moment(this.accTxnDetail.toDate, 'YYYY/MM/DD');
      var fd = moment(this.accTxnDetail.fromDate, 'YYYY/MM/DD');
      var days = td.diff(fd, 'days');
       if (days > 32) {
         this.msgBoxServ.showMessage("error", ['Please select dates between 32 days..']);
         return;
       }
      if (this.accTxnDetail.toDate >= this.accTxnDetail.fromDate && this.CheckValidDates()) {
        this.IsVAlidDate = true;
        this.ShowItemsList = true;
        this.itemList = new Array<any>();
        this.selectedVoucherId = -1;
        if (this.selectedSectionName == "Inventory") {
          this.GetInventoryItemsForTransferToACC();
        } else if (this.selectedSectionName == "Billing") {
          this.GetBilTxnItemsForTransferToACC();
        } else if (this.selectedSectionName == "Pharmacy") {
          this.GetPharmItemsForTransferToACC();
        } else {
          this.msgBoxServ.showMessage("notice", ["pleaes select module name"])
        }
        this.loading = true;
        this.saveLoading = false;
        this.ShowItemsList = true;
        //this.GetChangedSection();               
      }
      else {
        this.msgBoxServ.showMessage("error", ['Selected dates must be from single fiscal year..']);
        this.itemList = new Array<any>();
      }
    }
    else {
      this.msgBoxServ.showMessage("error", ['Please provide date..']);
    }
  }
  else{
    this.msgBoxServ.showMessage("error", ["No fiscal year is active or more than one fiscal years are active."]);
  }
  }
  onDateChange() {
    this.IsVAlidDate = false;
  }
  // Export table data in excel.
  ExportToExcel(tableId) {
    if (tableId) {
      let workSheetName = this.selectedSectionName + 'Transport to account';
      let Heading = this.selectedSectionName + 'Transport to account';
      let filename = 'Transport to account';
      //need enhancement in this function
      //here from date and todate for show date range for excel sheet data
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.accTxnDetail.fromDate, this.accTxnDetail.toDate, workSheetName,
        Heading, filename);
    }
  }
  //ExportToExcel() {
  //    let jsonStrTransactionData = JSON.stringify(this.itemListVoucherWise);
  //    this.dlService.ReadExcel("/ReportingNew/ExportToExcelTransferToAccount?FromDate=" + this.accTxnDetail.fromDate + "&ToDate=" + this.accTxnDetail.toDate + "&transactionData=" + jsonStrTransactionData)
  //        .map(res => res.blob())
  //        .subscribe(data => {
  //            let blob = data;
  //            let a = document.createElement("a");
  //            a.href = URL.createObjectURL(blob);
  //            a.download = "Transporttoaccount" + moment().format("DD-MMM-YYYY_HHmmA") + '.xls';
  //            document.body.appendChild(a);
  //            a.click();
  //        },

  //        res => this.ErrorMsg(res));
  //}
  ErrorMsg(err) {
    this.msgBoxServ.showMessage("error", ["Sorry!!! Not able export the excel file."]);
    console.log(err.ErrorMessage);
  }
  //Print selected table data.
  Print() {
    let popupWinindow;
    var printContents = '<b>Transport to account: ' + this.accTxnDetail.fromDate + ' To ' + this.accTxnDetail.toDate + '</b>';
    printContents += document.getElementById("printpage").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  //OnVoucherChange() {
  //    if (this.selectedVoucherId > 0 || this.selectedVoucherId == -1) {            
  //        if (this.itemList.length > 0) {
  //            this.itemList.forEach(i => {
  //                i.IsSelected = false;
  //            });
  //        }
  //        this.ItemListFilterByVoucher();            
  //    }
  //}
  //ItemListFilterByVoucher() {
  //    if (this.selectedVoucherId > 0 || this.selectedVoucherId == -1) {
  //        this.itemListVoucherWise = new Array<any>();
  //        if (this.selectedVoucherId == -1) {
  //            this.itemListVoucherWise = this.itemList; // here -1 voucher means all we can show all vouchers details                 
  //        } else {
  //            this.itemListVoucherWise = this.itemList.filter(i => i.VoucherId == this.selectedVoucherId);
  //        }
  //    } else {
  //        this.itemListVoucherWise = new Array<any>();
  //    }
  //}
  //Print not added ledgers
  PrintLedger() {
    let popupWinindow;
    var printContents = document.getElementById("PrintLedger").innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../themes/theme-default/DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../themes/theme-default/DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  // Export table not created ledger in excel.
  ExportToExcelLedger(tableId) {
    if (tableId) {
      let workSheetName = this.selectedSectionName + 'Ledgers To Be Create';
      let Heading = this.selectedSectionName + 'Ledgers To Be Create';
      let filename = 'Ledgers To Be Create';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, this.accTxnDetail.fromDate, this.accTxnDetail.toDate, workSheetName,
        Heading, filename);
    }
  }


  //=====================start:code for automatic get and map data=======================================
  //automatic get and map all gr items from inventory for transfer to accounting
  public GetInventoryItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetInventoryItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetLedgerList();
                this.GetTransferData(this.itemList);
                //  this.ItemListFilterByVoucher();
              }
              else {
                // this.msgBoxServ.showMessage("failed", ["NO Record Found."]);
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.Errors);
              }
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //automatic get and map billing txn 
  public GetBilTxnItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetBilTxnItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results.length) {
                this.itemList = res.Results;
                this.changeDetectorRef.detectChanges();
                this.GetLedgerList();
                this.GetTransferData(this.itemList);
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.Errors);
              }
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  //temp get and mapped pharmacy txns
  public GetPharmItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetPharmItemsForTransferToACC(this.accTxnDetail.fromDate, this.accTxnDetail.toDate)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetLedgerList();
                this.GetTransferData(this.itemList);
              }
              else {
                this.msgBoxServ.showMessage("failed", ["NO Record Found."]);
                console.log(res.ErrorMessage);
              }
            } else {
              this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
              console.log(res.ErrorMessage);
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }

  public GetTransferData(itmList: Array<any>) {
    try {
      //this.GetLedgerList();
      this.accountingBLService.GetLedgers()
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length) {
              this.ledgerList = new Array<LedgerModel>();
              this.ledgerList = res.Results;
              this.itemList = this.itemList.filter(a => moment(a.TransactionDate).format('YYYY-MM-DD') >= this.accTxnDetail.fromDate && moment(a.TransactionDate).format('YYYY-MM-DD') <= this.accTxnDetail.toDate);
              if (this.itemList.length) {
                this.itemList.forEach(a => {
                  a.TransactionDate = moment(a.TransactionDate).format('YYYY-MM-DD');
                  a.Remarks = a.Remarks;
                  a.TransactionItemList = a.TransactionItems;
                  a.TransactionItemList.forEach(b => {
                    b.LedgerName = this.ledgerList.find(x => x.LedgerId == b.LedgerId).LedgerName;
                    b.DrCr = b.DrCr;
                  });
                  a.VoucherId = this.mappingRuleList.find(c => c.Description == a.TransactionType).VoucherId;
                  a.VoucherName = this.voucherList.find(v => v.VoucherId == a.VoucherId).VoucherName;
                });
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates.'])
                // console.log(res.Errors);
              }
              if (this.itemList.length <= 0) {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
              }
            }
            else {
              this.msgBoxServ.showMessage("failed", ["Unable to get ledger list"]);
              console.log(res.Errors);
            }
          }
        });

    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //Post txns to the accounting
  public SaveToAccounting() {
    try {
      if (this.itemList.length > 0) {
        this.ShowItemsList = false;
        this.saveLoading = true;
        if (this.saveLoading) {
          this.accountingBLService.PostTxnListToACC(this.itemList)
            .subscribe(res => {
              if (res.Status == "OK") {
                this.msgBoxServ.showMessage('success', ['record transfered to accounting']);
                this.itemList = new Array<any>();
                this.saveLoading = false;
                this.Clear();
              }
            },
              err => {
                this.saveLoading = false;
                this.msgBoxServ.showMessage("error", ['There is problem, please try again']);
              });
        }

      }
      else {
        this.saveLoading = false;
        this.msgBoxServ.showMessage("warning", ["Load the record first"]);
      }
    } catch (ex) {
      this.saveLoading = false;
      this.ShowCatchErrMessage(ex);
    }

  }
  //=====================End:code for automatic get and map data=======================================


}
