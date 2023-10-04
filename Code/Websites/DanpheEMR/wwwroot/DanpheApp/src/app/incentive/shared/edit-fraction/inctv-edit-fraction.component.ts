import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { DLService } from '../../../shared/dl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

import * as _ from 'lodash';

import { CoreService } from '../../../core/shared/core.service';
import { CommonFunctions } from '../../../shared/common.functions';
import { IncentiveFractionItemsModel } from '../incentive-fraction-item.model';
import { IncentiveBLService } from '../incentive.bl.service';

@Component({
  selector: "inctv-edit-fraction",
  templateUrl: "./inctv-edit-fraction.html",
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

  public TDS = { TDSEnabled: true, TDSPercent: 15 };

  public allowAdjustment: boolean = false;

  public EmployeeBillItemsList: Array<any> = [];
  public loading: boolean = false;

  public EnableDisableReferral: boolean = false;
  public ReferralPercent: number = 0;
  public ReferralAmount: number = 0;
  public ReferralEmployee: any;
  public RemainingAmount: number = 0;
  public referralFraction: Array<IncentiveFractionItemsModel> = [];
  public TempReferralFraction: Array<IncentiveFractionItemsModel> = [];


  constructor(
    public msgBoxServ: MessageboxService,
    public incentiveBLService: IncentiveBLService,
    public dlService: DLService,
    public securityService: SecurityService,
    public coreService: CoreService
  ) {
    this.LoadAllBillingItems();
  }

  ngOnInit() {
    if (this.selTxnItem && this.selTxnItem.BillingTransactionItemId) {
      this.Initialize();
    }
  }

  public Initialize() {
    this.RemainingAmount = this.selTxnItem.TotalAmount - this.ReferralAmount;
    this.dlService
      .Read(
        `/api/Incentive/FractionOfBillTransactionItems?billTxnItemId=
${this.selTxnItem.BillingTransactionItemId}`
      )
      .map((res) => res)
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.fractionItems = res.Results;
          if (this.fractionItems && this.fractionItems.length > 0) {
            this.fractionItems.forEach((a) => {
              a.DocObj = {
                EmployeeId: a.IncentiveReceiverId,
                FullName: a.IncentiveReceiverName,
              };
              if (a.IsActive == false) {
                a.IsRemoved = true;
              }
              if (a.IncentiveType.toLowerCase() == 'referral' && a.IsActive == true) {
                this.ReferralEmployee = {
                  EmployeeId: a.IncentiveReceiverId,
                  FullName: a.IncentiveReceiverName
                };
                this.ReferralPercent = a.FinalIncentivePercent;
                this.ReferralAmount = a.IncentiveAmount;
                this.EnableDisableReferral = true;
                this.RemainingAmount = this.selTxnItem.TotalAmount - this.ReferralAmount;
              }
            });
            this.TempReferralFraction = this.fractionItems.filter(f => f.IncentiveType.toLowerCase() == 'referral');
            this.referralFraction = this.fractionItems.filter(a => a.IncentiveType.toLowerCase() == 'referral' && a.IsActive == true);
            let index = this.fractionItems.findIndex(a => a.IncentiveType.toLowerCase() == 'referral');
            if (index > -1) {
              this.fractionItems.splice(index, 1);
            }
          } else {
            //sud:3May'20--If Fraction is not there then add new empty row in the list. for efficiency.
            // this.SetFocusOnButton("btn_AddNewRow");
            this.AddNewRow_FractionItem();
          }
        } else {
          this.msgBoxServ.showMessage("failed", [
            "Unable to get transaction items.",
          ]);
          console.log(res.ErrorMessage);
        }
      });
  }

  SaveFractionItems() {


    this.loading = true;
    let frcItemsToSave = _.cloneDeep(this.fractionItems);
    this.TDScalculation(frcItemsToSave);
    if (this.EnableDisableReferral) {
      let referralFractionToSave = this.referralFraction;
      this.TDScalculation(referralFractionToSave);
      frcItemsToSave.push(this.referralFraction[0]);
    }
    if (this.referralFraction.length && this.EnableDisableReferral == false) {
      this.referralFraction.forEach(a => a.IsActive = false);
      frcItemsToSave.push(this.referralFraction[0]);
    }
    let validationObj = this.ChekValidation(frcItemsToSave);
    if (validationObj.isValid) {

      // let frcItemsToSave = this.fractionItems;
      // this.TDScalculation(frcItemsToSave);
      // if(this.EnableDisableReferral){
      //   let referralFractionToSave = this.referralFraction;
      //   this.TDScalculation(referralFractionToSave);
      //   frcItemsToSave.push(this.referralFraction[0]);
      // }
      // if(this.referralFraction.length && this.EnableDisableReferral == false){
      //   this.referralFraction.forEach(a => a.IsActive = false);
      //   frcItemsToSave.push(this.referralFraction[0]);
      // }
      this.CalculateInitialIncentivePercent(frcItemsToSave);
      let url = "/api/Incentive/FractionItems";
      let data = JSON.stringify(frcItemsToSave);
      this.dlService
        .Add(data, url)
        .map((res) => res)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            console.log("saved successfully");
            this.msgBoxServ.showMessage("success", [
              "Fraction saved successfully..",
            ]);
            this.EnableDisableReferral = false;
            this.fractionItems = res.Results;
            this.loading = false;
            // we need to re-format the doctor object again after saving them.
            if (this.fractionItems && this.fractionItems.length > 0) {
              this.fractionItems.forEach((a) => {
                a.DocObj = {
                  EmployeeId: a.IncentiveReceiverId,
                  FullName: a.IncentiveReceiverName,
                };
                if (a.IsActive == false) {
                  a.IsRemoved = true;
                }
              });
            }
            this.onEditWindowClose.emit({
              action: "save",
              data: {
                TxnItemId: this.selTxnItem.BillingTransactionItemId,
                fractionItems: this.fractionItems,
              },
            });
          } else {
            this.msgBoxServ.showMessage("failed", [
              "Couldn't save fraction. Please check log for details..",
            ]);
            console.log(res.ErrorMessage);
            this.loading = false;
          }
        });
    } else {
      this.msgBoxServ.showMessage("warning", validationObj.messageArr);
      this.loading = false;
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
    if (frcItemsToValidate.find((a) => !a.IncentiveType)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Incentive Type..");
    }

    if (frcItemsToValidate.find((a) => !a.IncentiveReceiverId)) {
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Employee/Consultant.");
    }

    if (
      frcItemsToValidate.find(
        (a) => !a.FinalIncentivePercent || a.FinalIncentivePercent < 0
      )
    ) {
      // == null || a.IncentivePercent == undefined
      validationObj.isValid = false;
      validationObj.messageArr.push("Invalid Incentive Percent.");
    }

    //Validation:3 -- Duplicate Consultant Validation -- Can't have one employee in more than one place..
    //loop on each item and try to find if there's more than one object of same employee.

    for (let i = 0; i < frcItemsToValidate.length; i++) {
      let curEmpId = frcItemsToValidate[i].IncentiveReceiverId;
      if (
        frcItemsToValidate.filter((a) => a.IncentiveReceiverId == curEmpId)
          .length > 1
      ) {
        validationObj.isValid = false;
        validationObj.messageArr.push(
          "One Employee can't be at more than one place."
        );
        break;
      }
    }

    //validation-3: TotalPercent>100.
    //totalpercent of ActiveFraction Items should not exceed 100..
    let activeFrcItems = frcItemsToValidate.filter((a) => a.IsActive == true);

    let totalPercent = 0;
    activeFrcItems.forEach((a) => {
      if (a.IncentiveType != "adjustment") {
        let currPercent = a.FinalIncentivePercent ? a.FinalIncentivePercent : 0;
        totalPercent += currPercent;
      }
    });

    if (totalPercent > 100) {
      validationObj.isValid = false;
      validationObj.messageArr.push(
        "Sum of Percentages can't' be greater than 100. now it's " +
        totalPercent
      );
    }

    return validationObj;
  }

  public TDScalculation(frcItems) {
    frcItems.forEach((a) => {
      var EmpInctvInfoObj = this.empIncentiveInfo.find(
        (b) => b.EmployeeId == a.IncentiveReceiverId
      );
      if (EmpInctvInfoObj) {
        a.TDSPercentage = EmpInctvInfoObj.TDSPercent;
        a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
        a.IncentiveReceiverName = a.IncentiveReceiverName
          ? a.IncentiveReceiverName
          : EmpInctvInfoObj.FullName;
      } else {
        a.TDSPercentage = this.TDS.TDSPercent;
        a.TDSAmount = (a.TDSPercentage * a.IncentiveAmount) / 100;
      }
    });
  }

  OnIncentivePercentChange(currFrcItem: IncentiveFractionItemsModel) {
    if (currFrcItem.FinalIncentivePercent >= 0) {
      let incPercent = currFrcItem.FinalIncentivePercent
        ? currFrcItem.FinalIncentivePercent
        : 0;
      // currFrcItem.IncentiveAmount =
      //   (currFrcItem.TotalBillAmount * incPercent) / 100;
      currFrcItem.IncentiveAmount = (this.RemainingAmount * incPercent) / 100
    } else {
      this.msgBoxServ.showMessage("warning", [
        "Enter Positive Incentive Percentage.",
      ]);
      currFrcItem.IncentiveAmount = 0;
    }
  }

  RemoveFractionItem_Single(itm: IncentiveFractionItemsModel, indx) {
    //if current item is old one then just set as removed status, if it's new item then remove it..
    if (itm.InctvTxnItemId) {
      itm.IsRemoved = true;
      itm.IsActive = false;
    } else {
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
    newRow.PriceCategory = "Normal"; //use the billitempriceid of the current transactionitem.
    newRow.BillingTransactionId = this.selTxnItem.BillingTransactionId;
    newRow.BillingTransactionItemId = this.selTxnItem.BillingTransactionItemId;

    newRow.PatientId = this.selTxnItem.PatientId;
    newRow.BillItemPriceId = 0;
    newRow.Quantity = this.selTxnItem.Quantity;
    newRow.ItemName = this.selTxnItem.ItemName;
    newRow.ServiceItemId = this.selTxnItem.ServiceItemId;
    newRow.TotalBillAmount = this.selTxnItem.TotalAmount;
    newRow.IsPaymentProcessed = false;
    newRow.CreatedBy = this.securityService.loggedInUser.EmployeeId; //change this and assign from server side..
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
    var BillItmObj = this.allItemList.find(
      (a) =>
        a.ItemId == this.selTxnItem.ItemId &&
        a.ItemName == this.selTxnItem.ItemName
    );
    if (empIncentiveInfo && empIncentiveInfo.EmployeeId) {
      var bilItmMapObj = empIncentiveInfo.EmployeeBillItemsMap.find(
        (a) => a.ServiceItemId == BillItmObj.ServiceItemId
      );
      if (bilItmMapObj && bilItmMapObj.EmployeeBillItemsMapId) {
        if (frcItem.IncentiveType == "performer") {
          if (!bilItmMapObj.HasGroupDistribution) {
            frcItem.FinalIncentivePercent = bilItmMapObj.PerformerPercent;
          } else {
            var grpDist = bilItmMapObj.GroupDistribution.find(
              (a) => a.DistributeToEmployeeId == frcItem.IncentiveReceiverId
            );
            frcItem.FinalIncentivePercent = grpDist.DistributionPercent;
          }
        } else if (frcItem.IncentiveType == "prescriber") {
          frcItem.FinalIncentivePercent = bilItmMapObj.PrescriberPercent;
        } else if (frcItem.IncentiveType == "referral") {
          frcItem.FinalIncentivePercent = bilItmMapObj.ReferralPercent;
        } else {
          frcItem.FinalIncentivePercent = 0;
        }
      }
    }
    this.OnIncentivePercentChange(frcItem);
  }

  //adjustment = { text: "Adjustment", value: "adjustment" }  will be dynamically added/removed from this list..
  // public inctvTypeArray = [{ text: "Assigned", value: "assigned" }, { text: "Referral", value: "referral" }, { text: "Adjustment", value: "adjustment" }];
  public inctvTypeArray = [
    { text: "Performer", value: "performer" },
    { text: "Prescriber", value: "prescriber" },
    // { text: "Referral", value: "referral" },
    { text: "Adjustment", value: "adjustment" },
  ];

  //sud:4May'20-- Below functionality is incomplete.. so continue this later on..
  EnableDisableAdjustment() {
    if (this.allowAdjustment) {
      if (this.inctvTypeArray.find((a) => a.value == "adjustment") == null) {
        this.inctvTypeArray.push({ text: "Adjustment", value: "adjustment" });
      }
    } else {
      let indx = this.inctvTypeArray.findIndex((a) => a.value == "adjustment");
      if (indx > -1) {
        this.inctvTypeArray.splice(indx, 1);
      }

      //if there's something already in adjustment and if adjustment is removed, then we should remove that as well.
      this.fractionItems
        .filter((a) => a.IncentiveType == "adjustment")
        .forEach((itm) => {
          itm.IncentiveType = null;
        });
    }

    if (this.fractionItems) {
      this.fractionItems.forEach((itm) => {
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
    this.incentiveBLService
      .GetBillItemList()
      .subscribe((res: DanpheHTTPResponse) => {
        if (res.Status == "OK") {
          this.allItemList = res.Results;
        } else {
          console.log("Couldn't load bill item prices. (billing-main)");
        }
      });
  }

  public GetEmployeeBillItemsList(frcItem) {
    if (frcItem && frcItem.IncentiveReceiverId) {
      this.EmployeeBillItemsList = [];
      this.incentiveBLService
        .GetEmployeeBillItemsList(frcItem.IncentiveReceiverId)
        .subscribe((res: DanpheHTTPResponse) => {
          if (res.Status == "OK") {
            this.EmployeeBillItemsList = res.Results;
            this.AssignPercentage(frcItem, this.EmployeeBillItemsList);
          } else {
            this.msgBoxServ.showMessage("failed", ["Unable to get Data."]);
            console.log(res.ErrorMessage);
          }
        });
    }
  }

  public IncentiveTypeChange(frcItem) {
    if (frcItem.IncentiveType != "adjustment") {
      this.GetEmployeeBillItemsList(frcItem);
    } else {
      frcItem.FinalIncentivePercent = 0;
    }
  }

  public EnableDisableReferralIncentive() {
    this.ReferralEmployee = "";
    this.ReferralAmount = 0;
    this.ReferralPercent = 0;
    this.RemainingAmount = this.selTxnItem.TotalAmount - this.ReferralAmount;
    if (this.EnableDisableReferral) {
      if (this.TempReferralFraction.length) {
        this.referralFraction = this.TempReferralFraction;
        this.referralFraction.forEach(a => {
          a.FinalIncentivePercent = 0;
          a.DocObj = {};
          a.IncentiveAmount = 0;
          a.IsActive = true;
        })
      } else {
        this.referralFraction = _.cloneDeep(this.fractionItems);
        this.referralFraction[0].IncentiveType = 'referral';
        this.referralFraction[0].InctvTxnItemId = 0;
        this.referralFraction[0].ModifiedBy = null;
        this.referralFraction[0].ModifiedOn = null;
        this.referralFraction[0].DocObj = {};
      }
    } else {
      this.fractionItems.forEach(a => {
        this.OnIncentivePercentChange(a);
      });
    }
  }

  public ReferralEmployeeDetail: any = {};
  public ReferralEmployeeChanged() {
    if (this.ReferralEmployee) {
      this.referralFraction[0].DocObj.EmployeeId = this.ReferralEmployee.EmployeeId;
      this.referralFraction[0].DocObj.FullName = this.ReferralEmployee.FullName;
      this.referralFraction[0].IncentiveReceiverId = this.ReferralEmployee.EmployeeId;
      this.referralFraction[0].IncentiveReceiverName = this.ReferralEmployee.FullName;
    }
  }

  CalculateReferralAmountAndRemainingAmount(selTxnItem: any) {
    if (this.ReferralPercent < 0) {
      this.msgBoxServ.showMessage("error", ["Invalid Incentive Percent"]);
    } else {
      let ReferralAmount = (selTxnItem.TotalAmount * this.ReferralPercent) / 100;
      this.ReferralAmount = ReferralAmount;
      this.RemainingAmount = selTxnItem.TotalAmount - this.ReferralAmount;
      this.referralFraction[0].FinalIncentivePercent = this.ReferralPercent;
      this.referralFraction[0].IncentiveAmount = this.ReferralAmount;

      this.fractionItems.forEach(a => {
        this.OnIncentivePercentChange(a);
      })
    }
  }

  CalculateInitialIncentivePercent(frcItems: Array<IncentiveFractionItemsModel>) {

    frcItems.forEach(a => {
      if (a.IncentiveType == 'referral') {
        a.InitialIncentivePercent = a.FinalIncentivePercent;
      } else {
        a.InitialIncentivePercent = (a.IncentiveAmount / this.selTxnItem.TotalAmount) * 100;
        CommonFunctions.parseAmount(a.InitialIncentivePercent);
      }
    });
  }
}
