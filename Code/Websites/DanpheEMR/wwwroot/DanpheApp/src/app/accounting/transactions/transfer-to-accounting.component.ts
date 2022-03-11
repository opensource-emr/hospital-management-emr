import { Component, ChangeDetectorRef } from '@angular/core';
import * as moment from 'moment/moment';
import { AccountingBLService } from '../shared/accounting.bl.service';
import { LedgerModel } from '../settings/shared/ledger.model';
import { ledgerGroupModel } from '../settings/shared/ledgerGroup.model';
import { TransactionModel } from './shared/transaction.model';
import { TransactionItem } from './shared/transaction-item.model';
import { TransactionItemDetailModel } from './shared/transaction-item-detail.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { VoucherModel } from "../settings/shared/voucher.model";
import { SecurityService } from "../../security/shared/security.service";
import { CoreService } from "../../core/shared/core.service";
import { CommonFunctions } from '../../shared/common.functions';
import { VoucherHeadModel } from "../settings/shared/voucherhead.model";
import { VoucherHead } from "./shared/VoucherHead";
import { TransactionViewModel } from "./shared/transaction.model";
import { SectionModel } from '../settings/shared/section.model';
import { FiscalYearModel } from '../settings/shared/fiscalyear.model';
import { SettingsBLService } from '../../settings-new/shared/settings.bl.service';
import { AccountingService } from '../shared/accounting.service';
import { Voucher } from './shared/voucher';
@Component({
  templateUrl: "./transfer-to-accounting.html"
})
export class TransferToAccountingComponent {
  public voucherList: Array<Voucher> = new Array<Voucher>();
  public itemList: Array<any> = new Array<any>();
  public accTxnFromBilling: Array<TransactionModel> = new Array<TransactionModel>();
  public accTxnForInv: Array<TransactionModel> = new Array<TransactionModel>();
  public accTxnForPhrm: Array<TransactionModel> = new Array<TransactionModel>();
  public sectionList: Array<SectionModel> = [];
  public sectionId: number = 2;//Section like 1-Inventory, 2-Billing, 3-Pharmacy (for now it's hardcoded) you can get from parameter table also
  public selectedSectionName: string = null;
  public selectAll: boolean = false;
  public selectAllLedger: boolean = true;
  public loading: boolean = false;
  public saveLoading: boolean = false;
  public ledgerList: Array<LedgerModel> = new Array<LedgerModel>();
  public ledgerGroupList: Array<ledgerGroupModel> = new Array<ledgerGroupModel>();
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
  public transactionItem: Array<TransactionItem> = new Array<TransactionItem>();
  public transactionDate: any;
  public drTotal: number = 0;
  public crTotal: number = 0;
  public disablebutton: boolean = false;
  public ledgerMappingDetail: any;
  public transaction: Array<TransactionViewModel> = new Array<TransactionViewModel>();
  public ShowItemsList: boolean = false;
  public manualTransfer: boolean = false;
  public loadingScreen: boolean = false;
  public showExportbtn: boolean = false;
  public showunavailableList: boolean = false;
  public selectedDate: string = "";
  public fiscalYearId: number = null;
  public validDate: boolean = true;

  //for get paycal year
  public year: number;
  public month: string;
  public syncedlist: Array<any> = new Array<any>();
  public postitem: Array<any> = new Array<any>();
  public showResultlist: boolean = false;
  public todaysDate: string = null;
  public fiscalYearList: Array<FiscalYearModel> = new Array<FiscalYearModel>();
  public selectedFiscalYear: any = null;

  public pendingtxnList: Array<any> = new Array<any>();
  public permissions: Array<any> = new Array<any>();
  public applicationList: Array<any> = new Array<any>();
  constructor(public accountingBLService: AccountingBLService,
    public msgBoxServ: MessageboxService,
    public changeDetectorRef: ChangeDetectorRef,
    public securityService: SecurityService,
    public coreService: CoreService,
    public settingsBLService: SettingsBLService,
    public accountingService: AccountingService) {
    this.CheckManualTransferData();
    if (this.manualTransfer == true) {
      this.accTxnDetail.fromDate = moment().format('YYYY-MM-DD');
      this.accTxnDetail.toDate = moment().format('YYYY-MM-DD');
      this.GetSection();
      this.GetVoucherList();
      this.GetLedgerGroupList();
     // this.GetChangedSection();
      this.GetVoucherHeadList();
      this.GetLedgerMappingDetails();
      this.showExport();

    }
  }
  // reusable fiscalyear calendar component output method 
  selectDate(event) {
    if (event) {
      this.selectedDate = "";
      this.fromDate = moment(event.fromDate).format('YYYY-MM-DD');
      this.toDate = moment(event.toDate).format("YYYY-MM-DD");
      this.fiscalYearId = event.fiscalYearId;
      this.validDate = true;
    }
    else {
      this.validDate = false;
      this.fromDate = null;
      this.todaysDate = null;
      this.fiscalYearId = 0;
    }
  }
  CheckManualTransferData() {
    this.manualTransfer = this.coreService.CheckManualTransferData();
  }
  //==============START:: Common Section ===============
  //Below are common function for all inventory, pharmacy and billing module   
  //when section /module name changed by user

  GetSection() {
    this.settingsBLService.GetApplicationList()
      .subscribe(res => {
        if (res.Status == 'OK') {
          this.applicationList = res.Results;
          let sectionApplication = this.applicationList.filter(a => a.ApplicationCode == "ACC-Section" && a.ApplicationName == "Accounts-Sections")[0];
          if (sectionApplication != null || sectionApplication != undefined) {
            this.permissions = this.securityService.UserPermissions.filter(p => p.ApplicationId == sectionApplication.ApplicationId);
          }
          let sList = this.accountingService.accCacheData.Sections.filter(sec => sec.SectionId != 4); // 4 is Manual_Voucher (FIXED for DanpheEMR) //mumbai-team-june2021-danphe-accounting-cache-change
          sList.forEach(s => {
            let sname = s.SectionName.toLowerCase();
            let pp = this.permissions.filter(f => f.PermissionName.includes(sname))[0];
            if (pp != null || pp != undefined) {
              this.sectionList.push(s);
              this.sectionList = this.sectionList.slice();//mumbai-team-june2021-danphe-accounting-cache-change
            }
          })
          let defSection = this.sectionList.find(s => s.IsDefault == true);
          if (defSection) {
            this.sectionId = defSection.SectionId;
          }
          else {
            this.sectionId = this.sectionList[0].SectionId;
          }
          this.GetChangedSection();
        }

      });    
  }
  public GetVoucherList() {
    try {
      if (!!this.accountingService.accCacheData.VoucherType && this.accountingService.accCacheData.VoucherType.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
        this.voucherList = this.accountingService.accCacheData.VoucherType//mumbai-team-june2021-danphe-accounting-cache-change
      }
    }
    catch (exception) {
      this.ShowCatchErrMessage(exception);
    }
  }
  public GetLedgerGroupList() {
    try {
      if (!!this.accountingService.accCacheData.LedgerGroups && this.accountingService.accCacheData.LedgerGroups.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledgerGroupList = new Array<ledgerGroupModel>();//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledgerGroupList = this.accountingService.accCacheData.LedgerGroups//mumbai-team-june2021-danphe-accounting-cache-change
      }
    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  public GetChangedSection() {
    try {
      this.clearDisplay()
      this.selectedSectionName = this.sectionList.find(s => s.SectionId == this.sectionId).SectionName;
      this.syncedlist = new Array<any>();
      this.itemList = new Array<any>();
      this.ShowItemsList = false;
      this.pendingtxnList = new Array<any>();

    } catch (ex) {
      this.ShowCatchErrMessage(ex);
    }

  }
  ChangedVoucherHead() {
    try {
      this.clearDisplay();
      var selVoucherHeadId = this.selVoucherHead.VoucherHeadId;
      this.setVoucherHeadId(selVoucherHeadId);
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  GetVoucherHeadList() {
    try {
      if (!!this.accountingService.accCacheData.VoucherHead && this.accountingService.accCacheData.VoucherHead.length > 0) {//mumbai-team-june2021-danphe-accounting-cache-change
        this.voucherHeadList = this.accountingService.accCacheData.VoucherHead;//mumbai-team-june2021-danphe-accounting-cache-change
        if (this.voucherHeadList && this.voucherHeadList.length > 0) {
          var defaultVH = this.voucherHeadList.filter(vh => vh.IsDefault == true);
          if (defaultVH.length > 0) {
            this.selVoucherHead.VoucherHeadId = defaultVH[0].VoucherHeadId;
          } else {
            this.selVoucherHead.VoucherHeadId = this.voucherHeadList[0].VoucherHeadId;
          }
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
  showExport() {

    let exportshow = this.coreService.Parameters.find(a => a.ParameterName == "AllowOtherExport" && a.ParameterGroupName == "Accounting").ParameterValue;
    if (exportshow == "true") {
      this.showExportbtn = true;
    }
    else {
      this.showExportbtn = false;
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
            this.itemList = new Array<any>();
            this.itemList = Object.assign(this.itemList, unselectedItems);
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
    this.syncedlist = new Array<any>();
    this.itemList = new Array<any>();
    this.selectedDate = "";
    this.saveLoading = false;
    this.loadingScreen = false;
  }
  //==============END:: Common Section ===============
  Close() {
    this.showUnavailableLedList = false;
    this.loading = false;
    this.saveDataPopup = false;
    this.showunavailableList = false;
    this.loadingScreen = false;
  }  
  setVoucherHeadId(selVoucherHeadId) {
    this.itemList.forEach(s => {
      s.VoucherHeadId = selVoucherHeadId;
    });
  }
  // Get transaction dates from all section which is not synced.
  LoadTxnDates() {
    this.pendingtxnList = [];
    if (this.CheckValidDate()) {
      this.pendingtxnList = new Array<any>();
      this.accountingBLService.LoadTxnDates(this.fromDate, this.toDate, this.sectionId)
        .subscribe(res => {
          if (res.Status == "OK") {
            if (res.Results.length > 0) {
              this.pendingtxnList = res.Results.sort((a, b) => {
                return moment(moment(a.TransactionDate).format("YYYY-MM-DD")).diff(moment(b.TransactionDate).format("YYYY-MM-DD"));
              });
              this.pendingtxnList.forEach(d => {
                d["TxnEnDate"] = d.TransactionDate;
              });
              this.ShowItemsList = true;
            }
            else {
              this.msgBoxServ.showMessage("Notice", ['Data is Not Available Between Selected dates...Try Different Dates'])
              console.log(res.Errors);
            }
          }
          else {
            this.msgBoxServ.showMessage("Notice", ['Something wrong'])
            console.log(res.Errors);
          }
        });
    
    }
  }
  Load(index) {
    this.loadingScreen = true;
    this.selectedDate = moment(this.pendingtxnList[index].TxnEnDate).format('YYYY-MM-DD');
    this.clearDisplay();
    if (this.CheckValidDate()) {
    this.IsVAlidDate = true;
    this.ShowItemsList = true;
    this.itemList = new Array<any>();
    this.selectedVoucherId = -1;
    this.showResultlist = false;
    if (this.selectedSectionName == "Inventory") {
      this.GetInventoryItemsForTransferToACC();
    } else if (this.selectedSectionName == "Billing") {
      this.GetBilTxnItemsForTransferToACC();
    } else if (this.selectedSectionName == "Pharmacy") {
      this.GetPharmItemsForTransferToACC();
    } else if (this.selectedSectionName == "Incentive") {
      this.GetIncentiveForTransferToACC();
    } else {
      this.msgBoxServ.showMessage("notice", ["pleaes select module name"])
    }
    this.loading = true;
    this.saveLoading = false;
    this.ShowItemsList = true;    
  
     }
     this.loadingScreen= false;
  }

  clearDisplay() {
    this.showunavailableList = false;
    this.unavailableLedgerList = new Array<LedgerModel>();
    this.syncedlist = new Array<any>();
    this.itemList = new Array<any>();
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
  public CheckValidDate() {
    let aftertoDate = moment(moment(this.toDate)).isAfter(moment(this.securityService.AccHospitalInfo.TodaysDate));
    if (aftertoDate == true || !this.validDate) {
      this.msgBoxServ.showMessage("error", ["Future date not allowed"]);
      return false;
    } else if (moment(this.selectedDate).format('YYYY-MM-DD') == moment(this.securityService.AccHospitalInfo.TodaysDate).format('YYYY-MM-DD')) {
      this.msgBoxServ.showMessage("warning", ["Today transfer not allowed."]);
      return false;
    }
    else {
      return true;
    }
  }
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
  // Export table not created ledger in excel.L
  ExportToExcelLedger(tableId) {
    if (tableId) {
      let workSheetName = this.selectedSectionName + 'Ledgers To Be Create';
      let Heading = this.selectedSectionName + 'Ledgers To Be Create';
      let filename = 'Ledgers To Be Create';
      CommonFunctions.ConvertHTMLTableToExcel(tableId, moment(this.selectedDate).format('YYYY-MM-DD'), this.accTxnDetail.toDate, workSheetName,
        Heading, filename);
    }
  }

  //=====================start:code for automatic get and map data=======================================
  //automatic get and map all gr items from inventory for transfer to accounting
  public GetInventoryItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetInventoryItemsForTransferToACC(this.selectedDate, this.fiscalYearId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetTransferData(this.itemList);
                this.showunavailableList = false;
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.Errors);
                this.loadingScreen = false;
              }
            }
            else if (res.Status == "Failed" && res.Results.length > 0) {
              this.unavailableLedgerList = res.Results;
              this.showunavailableList = true;
              this.loadingScreen = false;
            }
            else {
              this.msgBoxServ.showMessage("Error", ['Failed to get data'])
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
      this.loadingScreen = false;
    }
  }
  //automatic get and map billing txn 
  public GetBilTxnItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetBilTxnItemsForTransferToACC(this.selectedDate, this.fiscalYearId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetTransferData(this.itemList);
                this.showunavailableList = false;
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.Errors);
                this.loadingScreen = false;
              }
            }
            else if (res.Status == "Failed" && res.Results.length > 0) {
              this.unavailableLedgerList = res.Results;
              this.showunavailableList = true;
              this.loadingScreen = false;
            }
            else{
              this.loadingScreen = false;
            }
          },
          err=>{
            this.loadingScreen = false;
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
      this.loadingScreen = false;
    }
  }
  //temp get and mapped pharmacy txns
  public GetPharmItemsForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetPharmItemsForTransferToACC(this.selectedDate, this.fiscalYearId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetTransferData(this.itemList);
                this.showunavailableList = false;
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.Errors);
                this.loadingScreen = false;
              }
            }
            else if (res.Status == "Failed" && res.Results.length > 0) {
              this.unavailableLedgerList = res.Results;
              this.showunavailableList = true;
              this.loadingScreen = false;
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
      this.loadingScreen = false;
    }
  }
  //temp get and mapped incentive txns
  public GetIncentiveForTransferToACC(): void {
    try {
      if (this.IsVAlidDate) {
        this.accountingBLService.GetIncentivesForTransferToACC(this.selectedDate, this.fiscalYearId)
          .subscribe(res => {
            if (res.Status == "OK") {
              if (res.Results) {
                this.changeDetectorRef.detectChanges();
                this.itemList = res.Results;
                this.GetTransferData(this.itemList);
                this.showunavailableList = false;
              }
              else {
                this.msgBoxServ.showMessage("notice-message", ['Data is Not Available Between Selected dates...Try Different Dates'])
                console.log(res.ErrorMessage);
                this.loadingScreen = false;
              }
            }
            else if (res.Status == "Failed" && res.Results.length > 0) {
              this.unavailableLedgerList = res.Results;
              this.showunavailableList = true;
              this.loadingScreen = false;
            }
          });
      }
    } catch (exception) {
      this.ShowCatchErrMessage(exception);
      this.loadingScreen = false;
    }
  }

  public GetTransferData(itmList: Array<any>) {
    try {
      if (!!this.accountingService.accCacheData.Ledgers && this.accountingService.accCacheData.Ledgers.length) {//mumbai-team-june2021-danphe-accounting-cache-change
        this.ledgerList = new Array<LedgerModel>();
        this.ledgerList = this.accountingService.accCacheData.Ledgers;//mumbai-team-june2021-danphe-accounting-cache-change
        if (this.itemList.length > 0) {
          this.itemList.forEach(a => {
            a.TransactionDate = moment(a.TransactionDate).format('YYYY-MM-DD');
            a.Remarks = (a.TransactionType == "ConsultantIncentive") ? ('Incetives Transaction entries to Accounting  on date:' + a.TransactionDate) : (a.Remarks);
            a.TransactionItemList = a.TransactionItems;
            a.TransactionItemList.forEach(b => {
              let led = this.ledgerList.find(x => x.LedgerId == b.LedgerId)
              if (led) {
                b.LedgerName = led.LedgerName;
                b.Code = led.Code;
              } else {
                let lname = b.LedgerId;
                b.LedgerName = "";
              }
              b.DrCr = b.DrCr;
 
            });
            //NBB-now we are getting voucherid from server so no need here again mapping 
            //a.VoucherId = this.mappingRuleList.find(c => c.Description == a.TransactionType).VoucherId;
            a.VoucherName = this.voucherList.find(v => v.VoucherId == a.VoucherId).VoucherName;
          });
          if (!this.IsPreview) {
            this.SaveToAccounting();
          }
          else {
            this.showPreview = true;
          }
        }
      }
 
    }
    catch (ex) {
      this.ShowCatchErrMessage(ex);
    }
  }
  //grp by
  GroupViewData(data) {
    try {
      let dramt = 0, cramt = 0;
      if (this.itemList) {

        var helper = {};
        var res = this.itemList.reduce(function (r, o) {
          var key = o.TransactionDate;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o);
            r.push(helper[key]);
          }
          return r;
        }, []);
        return res;
      }
    } catch (exception) {
      console.log(exception);
    }
    return new TransactionViewModel();
  }

  //Post txns to the accounting
  public SaveToAccounting() {
    try {
      if (this.selVoucherHead.VoucherHeadId) {
        if (this.itemList.length > 0) {
          this.setVoucherHeadId(this.selVoucherHead.VoucherHeadId);
          this.ShowItemsList = false;
          this.saveLoading = true;
          this.loadingScreen = true;
          if (this.saveLoading) {
            this.accountingBLService.PostTxnListToACC(this.itemList)
              .subscribe(res => {
                //if (res.Status == "OK") {
                //  this.msgBoxServ.showMessage('success', ['record transfered to accounting']);
                if (res.Status == "OK") {
                  this.msgBoxServ.showMessage('success', ['record transfered to accounting']);
                  this.spliceDateList(this.selectedDate);
                  this.Clear();
                  this.loadingScreen = false;
                }
                else{
                  this.loadingScreen = false;
                  this.saveLoading = false;
                  this.msgBoxServ.showMessage("error", ['There is problem, please try again']);
                }
              //}
            },
                err => {
                  this.loadingScreen = false;
                  this.saveLoading = false;
                  this.msgBoxServ.showMessage("error", ['There is problem, please try again']);
                });
          }

        }
        else {
          this.saveLoading = false;
          this.msgBoxServ.showMessage("warning", ["Load the record first"]);
        }
      } else {
        this.saveLoading = false;
        this.msgBoxServ.showMessage("error", ['Please select voucher head !']);
      }
    } catch (ex) {
      this.loadingScreen = false;
      this.saveLoading = false;
      this.ShowCatchErrMessage(ex);
    }
  }
  //public index:number;
  spliceDateList(date) {
    const index:number = this.pendingtxnList.findIndex(d => moment(d.TransactionDate).format('YYYY-MM-DD') == date);
    if (this.selectedDate) {
      this.pendingtxnList.splice(index, 1);
     //this.selectedDate="";
      this.LoadTxnDates();
    }
    else{
      this.loadingScreen = false;
    }
  }
  //=====================End:code for automatic get and map data=======================================

  // 
  public showCreateLedger: boolean = false;
  public ledgerType:String = '';
  public ledReferenceId: number = 0;
  public ledgerData:any;
  createLedger(led) {
    this.ledgerData = led;
    this.ledgerType = led.LedgerType;
    this.ledReferenceId = led.LedgerReferenceId;
    this.showCreateLedger = true;
  }

  OnNewLedgerAdded($event) {
    this.showCreateLedger = false;
    this.unavailableLedgerList.forEach( (l, index) => {
      if(l.LedgerType === $event.ledger.LedgerType && l.LedgerReferenceId == $event.ledger.LedgerReferenceId)
      {
        this.unavailableLedgerList.splice(index,1);
      }
    });
    this.showunavailableList = (this.unavailableLedgerList.length > 0) ? true :false;
  }
  IsPreview:boolean = false; 
  showPreview:boolean= false;
  Preview(index){
    this.loadingScreen = true;
    this.IsPreview = true;
    this.Load(index);
  }
  ClosePreview(){
    this.IsPreview = false;
    this.showPreview = false;

    this.showUnavailableLedList = false;
    this.loading = false;
    this.saveDataPopup = false;
    this.showunavailableList = false;
    this.loadingScreen = false;
    this.itemList = new Array<any>();
  }
}
