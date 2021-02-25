import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { DLService } from "../../shared/dl.service";
import { DanpheHTTPResponse } from "../../shared/common-models";
import { IncentiveTransactionItemsVM } from "../shared/incentive-transaction-items-vm";
import { SecurityService } from "../../security/shared/security.service";
import { IncentiveService } from "../shared/incentive-service";
import { CoreService } from "../../core/shared/core.service";
import { IncentiveBLService } from "../shared/incentive.bl.service";

@Component({
  templateUrl: './inctv-txn-items-list.html',
  styleUrls: ['./styles.css']
})
export class IncentiveTxnItemsListComponent {

  //needed to maintain items in 3 different arrays in below sequence.
  //1. for All items, 2. for Radio FilteredItems and 3. for SearchBox filtered Items.
  public allTxnItemsList: Array<IncentiveTransactionItemsVM> = [];
  public radioBtnFilteredItems: Array<IncentiveTransactionItemsVM> = [];
  public finalFilteredList: Array<IncentiveTransactionItemsVM> = [];

  public calType: string = '';
  public searchString: string = null;

  constructor(
    public changeDetector: ChangeDetectorRef,
    public msgBoxServ: MessageboxService,
    public dlService: DLService,
    public securityService: SecurityService,
    public coreservice: CoreService,
    public incentiveBLService: IncentiveBLService) {
    this.LoadAllDocList();
    // this.LoadData();//we may or may not neede this.

    this.LoadCalenderTypes();
  }


  public fromDate: string = moment().format('YYYY-MM-DD');
  public toDate: string = moment().format('YYYY-MM-DD');
  public employeeId: number = 0;

  //public displayOptions = { ShowAll: false, ShowAssigned: true, ShowReferral: false };

  public displayOptions: string = "All";

  LoadIncentiveTxnItemsList() {
    let empIdToSend: number = this.employeeId;
    if (empIdToSend == 0) {
      empIdToSend = null;
    }
    this.dlService.Read("/api/Incentive?reqType=view-txn-items-list&fromDate=" + this.fromDate + "&toDate=" + this.toDate + "&employeeId=" + empIdToSend)
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {


          this.allTxnItemsList = res.Results;

          if (this.allTxnItemsList && this.allTxnItemsList.length > 0) {
            if (this.allTxnItemsList) {
              this.allTxnItemsList.forEach(a => {
                a.IsSelected = false;//this will add a new property even if it's not already there from server.
              });
            }

            this.FilterItemsByRadioBtnSelection();
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Data not available for selected parameters."]);
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });
  }


  public allEmpList: Array<any> = [];

  LoadAllDocList() {
    this.incentiveBLService.GetIncentiveApplicableDocterList()
      .map(res => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          let doclist: Array<any> = res.Results;
          this.allEmpList = doclist.map(a => {
            return { EmployeeId: a.EmployeeId, FullName: a.FullName }
          });
          this.allEmpList.unshift({ EmployeeId: 0, FullName: "--Select--" });

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
          console.log(res.ErrorMessage);
        }
      });
  }

  LoadData() {
    this.LoadIncentiveTxnItemsList();
  }
  //(ngModelChange)="LoadIncentiveTxnItemsList()"

  FilterItemsByRadioBtnSelection() {
    if (this.displayOptions == "All") {
      this.radioBtnFilteredItems = this.allTxnItemsList;
    }
    else if (this.displayOptions == "Assigned") {
      this.radioBtnFilteredItems = this.allTxnItemsList.filter(a => a.AssignedToEmpId);
      if (this.employeeId && this.employeeId.toString() != "0") {
        this.radioBtnFilteredItems = this.radioBtnFilteredItems.filter(a => a.AssignedToEmpId == this.employeeId);
      }
    }
    else {
      this.radioBtnFilteredItems = this.allTxnItemsList.filter(a => a.ReferredByEmpId);
      if (this.employeeId && this.employeeId.toString() != "0") {
        this.radioBtnFilteredItems = this.radioBtnFilteredItems.filter(a => a.ReferredByEmpId == this.employeeId);
      }
    }

    this.FilterArrayBySearchText();

  }

  //start: sud: 22Nov'19-- for saving data of fractions.
  public isSelectAll: boolean = false;
  SelectAllChkOnChange() {
    if (this.isSelectAll) {
      this.finalFilteredList.forEach(a => {
        a.IsSelected = true;
      });
    }
    else {
      this.finalFilteredList.forEach(a => {
        a.IsSelected = false;
      });
    }

    this.ShowSaveButtonOnCkboxChange();
  }



  SaveSelectedItems() {
    //we've to filter from finalFilteredList instead of radioFilteredList
    let itemsToFormat = this.finalFilteredList.filter(a => a.IsSelected);
    if (itemsToFormat && itemsToFormat.length > 0) {

      let frcItemsToSave = IncentiveService.GetFractionItemsFromTxnItems(itemsToFormat);
      //this.http.post<any>('/api/Incentive?reqType=addEmpProfileMap', strData, this.options);
      let url = "/api/Incentive?reqType=save-fraction-items";
      let data = JSON.stringify(frcItemsToSave);
      this.dlService.Add(data, url).map(res => res).subscribe(res => {
        if (res.Status == "OK") {
          this.msgBoxServ.showMessage("success", ["Data saved successfully."]);

          // this.LoadIncentiveTxnItemsList();<--s when last record is save at that time both msg is display data saved and data not found.

          ////after data is saved, remove them from final filter list one by one.  //old cmt-<incomplete: needs revision on below logic>//
          let savedDataRows = this.finalFilteredList.filter(a => a.IsSelected);

          if (savedDataRows && savedDataRows.length > 0) {
            savedDataRows.forEach(itm => {
              let itmIndexFromSrc = this.finalFilteredList.findIndex(b => b.BillingTransactionItemId == itm.BillingTransactionItemId);
              if (itmIndexFromSrc > -1) {
                this.finalFilteredList.splice(itmIndexFromSrc, 1);
              }
            });
          }

        }
        else {
          this.msgBoxServ.showMessage("failed", ["Couldn't save data. Pls try again."]);
        }

      });



    }
    else {
      this.msgBoxServ.showMessage("warning", ["Please select at-least one item to save."]);
    }


  }

  public showUpdateItemsPopup: boolean = false;
  public selItemToEdit: IncentiveTransactionItemsVM = null;
  EditItemBtnOnClick(indx, row) {
    this.selItemToEdit = row;
    this.showUpdateItemsPopup = true;
  }

  OnIncentiveEditPopupClose($event) {
    this.showUpdateItemsPopup = false;
    if ($event.action == "save") {
      this.LoadIncentiveTxnItemsList();
    }
  }


  public showSaveButton: boolean = false;

  ShowSaveButtonOnCkboxChange() {
    this.showSaveButton = this.finalFilteredList.filter(a => a.IsSelected == true).length > 0;
    this.isSelectAll = this.finalFilteredList.every(a => a.IsSelected == true);
  }



  public FilterArrayBySearchText() {

    //let itemList: Array<any> = this.radioBtnFilteredItems;
    let searchText = this.searchString;

    if (!this.radioBtnFilteredItems) { //this is when there's no items after radiobutton filter.
      this.finalFilteredList = [];
    }
    else if (searchText && searchText.trim()) { //this is when there's something in searchtextbox.
      searchText = searchText.toLowerCase();
      this.finalFilteredList = this.radioBtnFilteredItems.filter(val => {
        for (var objProp in val) {
          if (val[objProp] ? val[objProp] : val[objProp] == 0) {
            var srchingTxt: string = val[objProp].toString().toLowerCase();
            if (srchingTxt.includes(searchText)) {
              return true;
            }
          }
        }
        return false;
      });
    }
    else { // this is when search text is empty.
      this.finalFilteredList = this.radioBtnFilteredItems;
    }

    this.ShowSaveButtonOnCkboxChange();

  }

  LoadCalenderTypes() {
    let allParams = this.coreservice.Parameters;
    if (allParams.length) {
      let CalParms = allParams.find(a => a.ParameterName == "CalendarTypes" && a.ParameterGroupName == "Common");
      if (CalParms) {
        let Obj = JSON.parse(CalParms.ParameterValue);
        this.calType = Obj.IncentiveModule;
      }
    }
  }
}
