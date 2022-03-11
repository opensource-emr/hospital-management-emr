import { Component, Input, Output, EventEmitter, Renderer2, OnInit } from '@angular/core'
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../../security/shared/security.service';
import { DLService } from '../../../shared/dl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';

import * as moment from 'moment/moment';

import { IncentiveBLService } from '../incentive.bl.service';
import { IncentiveFractionItemsModel } from '../incentive-fraction-item.model';
import { CoreService } from '../../../core/shared/core.service';


@Component({
  selector: 'inctv-edit-fraction',
  templateUrl: "./inctv-edit-fraction.html"
})
export class INCTV_EditFractionComponent {

  @Input("selectedTxnItem")
  public selTxnItem: any = null;

  @Input("EmpIncentiveInfo")
  public empIncentiveInfo: Array<any> = [];

  @Input("employeeList")
  public allEmpList = [];

  //Decides the show/hide of PatientName, InvoiceNumber, InvoiceDate
  //false while coming from Invoice page since those information are already there in that part..
  @Input("show-invoice-hdr-info")
  public showInvoiceHeaderInfo: boolean = true;

  @Output("on-close")
  public onEditWindowClose = new EventEmitter<object>();

  public fractionItems: Array<IncentiveFractionItemsModel> = [];

  public TDS = { "TDSEnabled": true, "TDSPercent": 15 };

  public allowAdjustment: boolean = false;

  public EmployeeBillItemsList: Array<any> = [];

  constructor(public msgBoxServ: MessageboxService,
    public incentiveBLService: IncentiveBLService,
    public dlService: DLService,
    public securityService: SecurityService,
    public coreService: CoreService) {
    this.LoadAllBillingItems();
  }


  ngOnInit() {
    if (this.selTxnItem && this.selTxnItem.BillingTransactionItemId) {
      this.dlService.Read("/api/Incentive?reqType=get-fractionof-billtxnitem&billTxnItemId=" + this.selTxnItem.BillingTransactionItemId)
        .map(res => res)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.fractionItems = res.Results;
            if (this.fractionItems && this.fractionItems.length > 0) {
              this.fractionItems.forEach(a => {
                a.DocObj = { EmployeeId: a.IncentiveReceiverId, FullName: a.IncentiveReceiverName };
                if (a.IsActive == false) {
                  a.IsRemoved = true;
                }
              });
            }
            else {
              //sud:3May'20--If Fraction is not there then add new empty row in the list. for efficiency.
              // this.SetFocusOnButton("btn_AddNewRow");
              this.AddNewRow_FractionItem();
            }
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Unable to get transaction items."]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  SaveFractionItems() {

    let validationObj = this.ChekValidation(this.fractionItems);

    if (validationObj.isValid) {
      let frcItemsToSave = this.fractionItems;
      this.TDScalculation(frcItemsToSave);

      let url = "/api/Incentive?reqType=save-fraction-items";
      let data = JSON.stringify(frcItemsToSave);
      this.dlService.Add(data, url)
        .map(res => res).
        subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            console.log("saved successfully");
            this.msgBoxServ.showMessage("success", ["Fraction saved successfully.."]);
            this.fractionItems = res.Results;
            // we need to re-format the doctor object again after saving them.
            if (this.fractionItems && this.fractionItems.length > 0) {
              this.fractionItems.forEach(a => {
                a.DocObj = { EmployeeId: a.IncentiveReceiverId, FullName: a.IncentiveReceiverName };
                if (a.IsActive == false) {
                  a.IsRemoved = true;
                }
              });
            }
            this.onEditWindowClose.emit({ action: "save", data: { TxnItemId: this.selTxnItem.BillingTransactionItemId, fractionItems: this.fractionItems } });
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Couldn't save fraction. Please check log for details.."]);
            console.log(res.ErrorMessage);
          }
        });
    }
    else {
      this.msgBoxServ.showMessage("warning", validationObj.messageArr);
    }


  }

  //check for the validation in current fraction entries.
  //returns a object with True/False  and Error messages if False.
  ChekValidation(frcItemsToValidate: Array<IncentiveFractionItemsModel>): any {

    let validationObj = { isValid: true, messageArr: [] };


    //Start: Validation before saving-- move it to separate function if required.. 
    //validation-1: save without adding anything.. 
    if (!frcItemsToValidate || frcItemsToValidate.length == 0) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Please add at-least one fraction..");

      return validationObj;
    }

    //validation-2: Check Type, AssignedTo, IncentivePercent
    if (frcItemsToValidate.find(a => !a.IncentiveType)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Incentive Type..");
    }

    if (frcItemsToValidate.find(a => !a.IncentiveReceiverId)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Employee/Consultant.");
    }

    if (frcItemsToValidate.find(a => !a.IncentivePercent || a.IncentivePercent < 0)) {// == null || a.IncentivePercent == undefined
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Incentive Percent.");
    }


    //Validation:3 -- Duplicate Consultant Validation -- Can't have one employee in more than one place..
    //loop on each item and try to find if there's more than one object of same employee. 


    for (let i = 0; i < frcItemsToValidate.length; i++) {
      let curEmpId = frcItemsToValidate[i].IncentiveReceiverId;
      if (frcItemsToValidate.filter(a => a.IncentiveReceiverId == curEmpId).length > 1) {
        validationObj.isValid = false;
        validationObj.messageArr.push("One Employee can't be at more than one place.");
        break;
      }
    }




    //validation-3: TotalPercent>100.
    //totalpercent of ActiveFraction Items should not exceed 100..
    let activeFrcItems = frcItemsToValidate.filter(a => a.IsActive == true);

    let totalPercent = 0;
    activeFrcItems.forEach(a => {
      if ((a.IncentiveType != 'adjustment')) {
        let currPercent = a.IncentivePercent ? a.IncentivePercent : 0;
        totalPercent += currPercent;
      }
    });

    if (totalPercent > 100) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Sum of Percentages can't' be greater than 100. now it's " + totalPercent);
    }

    return validationObj;
  }




  public TDScalculation(frcItems) {
    frcItems.forEach(a => {
      var EmpInctvInfoObj = this.empIncentiveInfo.find(b => b.EmployeeId == a.IncentiveReceiverId);
      if (EmpInctvInfoObj) {
        a.TDSPercentage = EmpInctvInfoObj.TDSPercent;
        a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
        a.IncentiveReceiverName = a.IncentiveReceiverName ? a.IncentiveReceiverName : EmpInctvInfoObj.FullName;
      }
      else {
        a.TDSPercentage = this.TDS.TDSPercent;
        a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
      }
    });
  }

  OnIncentivePercentChange(currFrcItem: IncentiveFractionItemsModel) {
    if (currFrcItem.IncentivePercent >= 0) {
      let incPercent = currFrcItem.IncentivePercent ? currFrcItem.IncentivePercent : 0;
      currFrcItem.IncentiveAmount = currFrcItem.TotalBillAmount * incPercent / 100;
    }
    else {
      this.msgBoxServ.showMessage("warning", ["Enter Positive Incentive Percentage."]);
      currFrcItem.IncentiveAmount = 0;
    }

  }

  RemoveFractionItem_Single(itm: IncentiveFractionItemsModel, indx) {
    //if current item is old one then just set as removed status, if it's new item then remove it..
    if (itm.InctvTxnItemId) {
      itm.IsRemoved = true;
      itm.IsActive = false;
    }
    else {
      this.fractionItems.splice(indx, 1);
    }
  }

  UndoRemove_FractionItem_Single(itm: IncentiveFractionItemsModel) {
    itm.IsRemoved = false;
    itm.IsActive = true;
  }

  AddNewRow_FractionItem() {
    let newRow: IncentiveFractionItemsModel = new IncentiveFractionItemsModel();

    //assign values to newRow from available variables (Invoice and TxnItem)
    newRow.InvoiceNoFormatted = this.selTxnItem.InvoiceNo;
    newRow.TransactionDate = this.selTxnItem.TransactionDate;
    newRow.PriceCategory = "Normal";//use the billitempriceid of the current transactionitem.
    newRow.BillingTransactionId = this.selTxnItem.BillingTransactionId;
    newRow.BillingTransactionItemId = this.selTxnItem.BillingTransactionItemId;

    newRow.PatientId = this.selTxnItem.PatientId;
    newRow.BillItemPriceId = 0;
    newRow.Quantity = this.selTxnItem.Quantity;
    newRow.ItemName = this.selTxnItem.ItemName;
    newRow.TotalBillAmount = this.selTxnItem.TotalAmount;
    newRow.IsPaymentProcessed = false;
    newRow.CreatedBy = this.securityService.loggedInUser.EmployeeId;//change this and assign from server side..
    newRow.IsActive = true;
    newRow.IsMainDoctor = false;

    this.fractionItems.push(newRow);

    this.SetFocusOnEmployeeName(this.fractionItems.length - 1);
  }


  //used to format the display of item in ng-autocomplete.
  EmployeeListFormatter(data: any): string {
    let html = data["FullName"];
    return html;
  }


  ChangeDoctor(frcItem) {
    frcItem.IncentiveReceiverId = frcItem.DocObj.EmployeeId;
    frcItem.IncentiveReceiverName = frcItem.DocObj.FullName;
    this.GetEmployeeBillItemsList(frcItem);
    // this.AssignPercentage(frcItem);
  }

  AssignPercentage(frcItem, empIncentiveInfo) {
    var BillItmObj = this.allItemList.find(a => a.ItemId == this.selTxnItem.ItemId && a.ItemName == this.selTxnItem.ItemName);
    if (empIncentiveInfo && empIncentiveInfo.EmployeeId) {
      var bilItmMapObj = empIncentiveInfo.EmployeeBillItemsMap.find(a => a.BillItemPriceId == BillItmObj.BillItemPriceId);
      if (bilItmMapObj && bilItmMapObj.EmployeeBillItemsMapId) {
        if (frcItem.IncentiveType == 'assigned') {
          if (!bilItmMapObj.HasGroupDistribution) {
            frcItem.IncentivePercent = bilItmMapObj.AssignedToPercent;
          }
          else {
            var grpDist = bilItmMapObj.GroupDistribution.find(a => a.DistributeToEmployeeId == frcItem.IncentiveReceiverId);
            frcItem.IncentivePercent = grpDist.DistributionPercent;
          }
        }
        else if (frcItem.IncentiveType == 'referral') {
          frcItem.IncentivePercent = bilItmMapObj.ReferredByPercent;
        }
        else {
          frcItem.IncentivePercent = 0;
        }
      }
    }
    this.OnIncentivePercentChange(frcItem);
  }

  //adjustment = { text: "Adjustment", value: "adjustment" }  will be dynamically added/removed from this list.. 
  public inctvTypeArray = [{ text: "Assigned", value: "assigned" }, { text: "Referral", value: "referral" }, { text: "Adjustment", value: "adjustment" }];

  //sud:4May'20-- Below functionality is incomplete.. so continue this later on..
  EnableDisableAdjustment() {

    if (this.allowAdjustment) {
      if (this.inctvTypeArray.find(a => a.value == "adjustment") == null) {
        this.inctvTypeArray.push({ text: "Adjustment", value: "adjustment" });
      }
    }
    else {
      let indx = this.inctvTypeArray.findIndex(a => a.value == "adjustment");
      if (indx > -1) {
        this.inctvTypeArray.splice(indx, 1);
      }

      //if there's something already in adjustment and if adjustment is removed, then we should remove that as well.
      this.fractionItems.filter(a => a.IncentiveType == "adjustment").forEach(itm => {
        itm.IncentiveType = null;
      });

    }

    if (this.fractionItems) {

      this.fractionItems.forEach(itm => {
        console.log(itm.IncentiveType);
      });
    }

  }


  //start: sud:3May'20-- For User Efficiecny-- We've added Auto focus on Add-New, Save Fraction buttons, EmployeeDropdown on certain conditions.
  GoToNextInput(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
      nextEl.select();
    }
  }

  SetFocusOnButton(idToSelect: string) {
    if (document.getElementById(idToSelect)) {
      let nextEl = <HTMLInputElement>document.getElementById(idToSelect);
      nextEl.focus();
    }
  }

  // public showMsgLabel: boolean = false;
  // public msgLabelText: string = "";
  // SaveBtn_OnFocus() {
  //   this.showMsgLabel = true;
  //   this.msgLabelText = "hit ENTER  key to SAVE";
  // }

  ///html -> (focus)="SaveBtn_OnFocus()" (focusout)="SaveBtn_OnFocusOut()"
  // SaveBtn_OnFocusOut() {
  //   this.showMsgLabel = false;
  // }

  //html -> (focus)="AddNewBtn_OnFocus()" (focusout)="AddNewBtn_OnFocusOut()"
  // AddNewBtn_OnFocus() {
  //   this.showMsgLabel = true;
  //   this.msgLabelText = "hit ENTER key to Add New Row";
  // }

  // AddNewBtn_OnFocusOut() {
  //   this.showMsgLabel = false;
  // }


  private SetFocusOnEmployeeName(index: number) {
    window.setTimeout(function () {
      let itmNameBox = document.getElementById("empIp_" + index);
      if (itmNameBox) {
        itmNameBox.focus();
      }
    }, 600);
  }

  //end: sud:3May'20-- For User Efficiecny-- We've added Auto focus on Add-New, Save Fraction buttons, EmployeeDropdown on certain conditions.

  public allItemList: Array<any> = [];

  public LoadAllBillingItems() {
    this.incentiveBLService.GetBillItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allItemList = res.Results;
        }
        else {
          console.log("Couldn't load bill item prices. (billing-main)");
        }
      });
  }


  public GetEmployeeBillItemsList(frcItem) {
    if (frcItem && frcItem.IncentiveReceiverId) {
      this.EmployeeBillItemsList = [];
      this.incentiveBLService.GetEmployeeBillItemsList(frcItem.IncentiveReceiverId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.EmployeeBillItemsList = res.Results;
            this.AssignPercentage(frcItem, this.EmployeeBillItemsList);
          }
          else {
            this.msgBoxServ.showMessage("failed", ["Unable to get Data."]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  public IncentiveTypeChange(frcItem) {
    if (frcItem.IncentiveType != 'adjustment') {
      this.GetEmployeeBillItemsList(frcItem);
    }
    else {
      frcItem.IncentivePercent = 0;
    }

  }
}
