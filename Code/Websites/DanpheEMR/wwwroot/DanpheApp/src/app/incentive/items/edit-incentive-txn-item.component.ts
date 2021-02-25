import { Component, Input, Output, EventEmitter, Renderer2, OnInit } from '@angular/core'
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { DLService } from '../../shared/dl.service';
import { IncentiveTransactionItemsVM } from '../shared/incentive-transaction-items-vm';
import { IncentiveFractionItemsModel } from '../shared/incentive-fraction-item.model';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';
import { IncentiveService } from '../shared/incentive-service';
import { IncentiveBLService } from '../shared/incentive.bl.service';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import { CommonFunctions } from '../../shared/common.functions';
import { CoreService } from '../../core/shared/core.service';

@Component({
  selector: 'edit-incentive-txn-item',
  templateUrl: "./edit-incentive-txn-item.html"
})
export class EditIncentiveTxnItemComponent implements OnInit {

  @Input("incentive-txn-item")
  ipTxnItem: IncentiveTransactionItemsVM = null;

  public txnItemToEdit: IncentiveTransactionItemsVM = new IncentiveTransactionItemsVM();
  public billtxnItem: BillingTransactionItem = new BillingTransactionItem();

  @Output("on-close")
  onPopupClose: EventEmitter<object> = new EventEmitter<object>();

  @Input("emp-list")
  public allEmpList: Array<any> = [];

  showAddFractionDiv: boolean = false;
  fractionTransactionItems = [];
  isFractionValid: boolean = true;
  constructor(public msgBoxServ: MessageboxService,
    public incentiveBLService: IncentiveBLService,
    public dlService: DLService,
    public securityService: SecurityService,
    public coreService: CoreService) {

  }

  ngOnInit() {
    if (this.ipTxnItem) {
      //object.assign copies property values from source Object (RIGHT) to target object (Left).
      this.txnItemToEdit = Object.assign(new IncentiveTransactionItemsVM(), this.ipTxnItem);
      //from edit incentive item component
      console.log(this.ipTxnItem);
    }
  }

  public refEmpId: number = 0;
  public assignedEmpId: number = 0;
  public isPercentagesValid: boolean = true;

  ClosePopup() {
    // this.txnItemToEdit = new IncentiveTransactionItemsVM;
    this.onPopupClose.emit({ action: "close", data: null });
  }

  OnReferredByPercentChange() {
    this.CheckIfPercentValid();

    this.txnItemToEdit.ReferralAmount = this.txnItemToEdit.TotalAmount * this.txnItemToEdit.ReferredByPercent / 100;
  }

  OnAssignedToPercentChange() {
    this.CheckIfPercentValid();

    this.txnItemToEdit.AssignedToAmount = this.txnItemToEdit.TotalAmount * this.txnItemToEdit.AssignedToPercent / 100;
    if (this.showAddFractionDiv) {
      this.fractionTransactionItems[0].FinalPercent = this.txnItemToEdit.AssignedToPercent;
      this.fractionTransactionItems[0].FinalAmount = this.txnItemToEdit.AssignedToAmount;
      this.onFinalPercentChange(null);
    }
  }


  CheckIfPercentValid() {
    this.txnItemToEdit.AssignedToPercent = this.txnItemToEdit.AssignedToPercent ? this.txnItemToEdit.AssignedToPercent : 0;
    this.txnItemToEdit.ReferredByPercent = this.txnItemToEdit.ReferredByPercent ? this.txnItemToEdit.ReferredByPercent : 0;

    let totalPecent = this.txnItemToEdit.ReferredByPercent + this.txnItemToEdit.AssignedToPercent;
    if (totalPecent > 100) {
      this.isPercentagesValid = false;
    }
    else {
      this.isPercentagesValid = true;
    }

  }

  SaveTxnItem() {
    // check if entry is valid or not before proceeding
    if (this.isPercentagesValid && this.checkIfFractionValid()) {
      // passing optional parameter to function, in order to receive fraction items..
      let frcItemsToSave = IncentiveService.GetFractionItemsFromTxnItems([this.txnItemToEdit], this.fractionTransactionItems);
      //this.http.post<any>('/api/Incentive?reqType=addEmpProfileMap', strData, this.options);
      let url = "/api/Incentive?reqType=save-fraction-items";
      let data = JSON.stringify(frcItemsToSave);
      this.dlService.Add(data, url).map(res => res).subscribe(res => {
        if (res.Status == "OK") {
          this.onPopupClose.emit({ action: "save", data: null });

          this.billtxnItem.ProviderId = this.txnItemToEdit.AssignedToEmpId;
          this.billtxnItem.ProviderName = this.txnItemToEdit.AssignedToEmpName;
          this.billtxnItem.RequestedBy = this.txnItemToEdit.ReferredByEmpId;
          this.billtxnItem.BillingTransactionItemId = this.txnItemToEdit.BillingTransactionItemId;
          this.billtxnItem.BillingTransactionId = this.txnItemToEdit.BillingTransactionId;
          this.PutTransactionItems([this.billtxnItem]);

          //this.msgBoxServ.showMessage("success", ["Data saved successfully."]);
        }
        else {
          this.msgBoxServ.showMessage("failed", ["Couldn't save data. Pls try again."]);
        }
      });
    }
    else {
      // this.msgBoxServ.showMessage("failed", ["Total of Referral% and Assigned% Can't be more than 100."]);
      this.msgBoxServ.showMessage('error', ['Fix the highlighted error(s) before proceeding.']);
    }

  }

  PutTransactionItems(modifiedItems: Array<BillingTransactionItem>) {//Array<BillingTransactionItem>
    this.incentiveBLService.UpdateBillTxnItems(modifiedItems)
      .subscribe(res => {
        if (res.Status == 'OK') {
          // this.msgBoxServ.showMessage("success", ["Item/s updated successfully"]);
          this.msgBoxServ.showMessage("success", ["Data saved successfully."]);
        }
      },
        err => {
          //this.msgBoxServ.showMessage("error", ["Bill transaction items are not updated "]);
        });
  }

  OnReferredByEmpChange() {
    if (!this.txnItemToEdit.ReferredByEmpId || this.txnItemToEdit.ReferredByEmpId.toString() == "0") {
      this.txnItemToEdit.ReferredByPercent = 0;
      this.txnItemToEdit.ReferralAmount = 0;
    }
    else {
      let refId = parseInt(this.txnItemToEdit.ReferredByEmpId.toString());
      let refEmp = this.allEmpList.find(e => e.EmployeeId == refId);
      if (refEmp) {
        this.txnItemToEdit.ReferredByEmpName = refEmp.FullName;
      }
    }
  }

  OnAssignedToEmpChange() {
    if (!this.txnItemToEdit.AssignedToEmpId || this.txnItemToEdit.AssignedToEmpId.toString() == "0") {
      this.txnItemToEdit.AssignedToPercent = 0;
      this.txnItemToEdit.AssignedToAmount = 0;
    }
    else {
      let assignedEmpId = parseInt(this.txnItemToEdit.AssignedToEmpId.toString());
      let assignedEmp = this.allEmpList.find(e => e.EmployeeId == assignedEmpId);
      if (assignedEmp) {
        this.txnItemToEdit.AssignedToEmpName = assignedEmp.FullName;
      }
      if (this.showAddFractionDiv) {
        this.fractionTransactionItems[0].EmployeeId = parseInt(this.txnItemToEdit.AssignedToEmpId.toString());
      }
    }
  }

  // to show fraction div on click of Add Fraction button.
  addFraction() {
    this.fractionTransactionItems.push({
      EmployeeId: this.txnItemToEdit.AssignedToEmpId,
      EmployeeName: this.txnItemToEdit.AssignedToEmpName,
      FinalPercent: this.txnItemToEdit.AssignedToPercent,
      FinalAmount: this.txnItemToEdit.AssignedToAmount
    });
    this.showAddFractionDiv = true;
  }

  // delete selected row and calculate percentage overall.
  deleteRow(index) {
    this.fractionTransactionItems.splice(index, 1);
    this.onFinalPercentChange(null);
  }

  // on employee change -> assign EmployeeName and checks for double entry of employee within list.
  onFractionEmpChange(index) {
    if (this.fractionTransactionItems[index].EmployeeId.toString() == '0') {
      // giving custom flag to show Error
      this.fractionTransactionItems[index].hasError = true;
    }
    else {
      const emp = this.allEmpList.find(a => a.EmployeeId == this.fractionTransactionItems[index].EmployeeId);
      this.fractionTransactionItems[index].EmployeeName = emp ? emp.FullName : '';
      for (let i = 0; i < this.fractionTransactionItems.length; i++) {
        this.fractionTransactionItems[i].hasError = false;
        if (i != index) {
          const element = this.fractionTransactionItems[i];
          if (element.EmployeeId == this.fractionTransactionItems[index].EmployeeId) {
            this.fractionTransactionItems[index].hasError = true;
            // this.msgBoxServ.showMessage('error', ['This Employee already selected. Select other employee.']);
            break;
          }
        }
      }
    }
  }

  // calculate total of final %
  onFinalPercentChange(index) {
    let tPercent = 0;
    for (let i = 1; i < this.fractionTransactionItems.length; i++) {
      const element = this.fractionTransactionItems[i];
      tPercent += element.FinalPercent;
    }
    if (tPercent > this.txnItemToEdit.AssignedToPercent) {
      // error: total final percentage cannot be greater than assignedTo percentage
      this.isFractionValid = false;
    }
    else {
      this.isFractionValid = true;
      // updating final percent, amount of 0th Index record and also updating the FinalAmount of currentRow record.
      this.fractionTransactionItems[0].FinalPercent = this.txnItemToEdit.AssignedToPercent - tPercent;
      this.fractionTransactionItems[0].FinalAmount =
        this.txnItemToEdit.TotalAmount * this.fractionTransactionItems[0].FinalPercent / 100;
      if (index != null) {
        this.fractionTransactionItems[index].FinalAmount =
          this.txnItemToEdit.TotalAmount * this.fractionTransactionItems[index].FinalPercent / 100;
      }
    }
  }

  // adds new entry to fraction
  addFractionRow() {
    this.fractionTransactionItems.push({
      EmployeeId: 0,
      EmployeeName: '',
      FinalPercent: 0,
      FinalAmount: 0
    });
  }

  // returns boolean, check if added fraction is correct or not
  checkIfFractionValid() {
    let isValid = true;
    if (this.showAddFractionDiv) {
      if (!this.isFractionValid) {
        isValid = false;
      }
      this.fractionTransactionItems.map(a => {
        if (a.EmployeeId == 0) {
          a.hasError = true;
        }
        return a;
      });
      if (this.fractionTransactionItems.some(a => a.hasError)) {
        isValid = false;
      }
    }
    return isValid;
  }
}
