import { Injectable, Directive } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import * as moment from 'moment/moment';
import { IncentiveFractionItemsModel } from './incentive-fraction-item.model';
import { IncentiveTransactionItemsVM } from './incentive-transaction-items-vm';


export class IncentiveService {


  constructor() {

  } 

  // add optional parameter 'fractionalItems', which is required for getting fraction items.
  public static GetFractionItemsFromTxnItems(itemsToFormat: Array<IncentiveTransactionItemsVM>, fractionalItems = null): Array<IncentiveFractionItemsModel> {
    let retArray: Array<IncentiveFractionItemsModel> = [];
    itemsToFormat.forEach(itm => {
      let frcItm_assigned = new IncentiveFractionItemsModel();
      let frcItm_referred = new IncentiveFractionItemsModel();
      let frcItm_hospital = new IncentiveFractionItemsModel();
      if (itm.AssignedToEmpId) {
        frcItm_assigned = this.GetSingleFractionItemByType(itm, "AssignedTo");
        // to get fraction items
        if (fractionalItems && fractionalItems.length > 0) {
          fractionalItems.forEach(element => {
            itm.AssignedToEmpId = element.EmployeeId;
            itm.AssignedToEmpName = element.EmployeeName;
            itm.AssignedToPercent = element.FinalPercent;
            itm.AssignedToAmount = element.FinalAmount;
            const item = this.GetSingleFractionItemByType(itm, 'AssignedTo');
            item.IsMainDoctor = frcItm_assigned.IncentiveReceiverId == element.EmployeeId;    // assigned doctor is main doctor so true & for rest assign false
            retArray.push(item);
          });
        } else {
          frcItm_assigned.IsMainDoctor = true; // this is only assigned doctor so is the Main Doctor
          retArray.push(frcItm_assigned);
        }

      }
      if (itm.ReferredByEmpId) {
        frcItm_referred = this.GetSingleFractionItemByType(itm, "ReferredBy");
        retArray.push(frcItm_referred);
      }

      //no need to add hospital amount--sud:16Feb'20-- after incentive ui and logic change..

      //frcItm_hospital = this.GetSingleFractionItemByType(itm, "hospital");
      //frcItm_hospital.IncentivePercent = 100 - (frcItm_assigned.IncentivePercent + frcItm_referred.IncentivePercent);
      //frcItm_hospital.IncentiveAmount = itm.TotalAmount - (frcItm_assigned.IncentiveAmount + frcItm_referred.IncentiveAmount);
      //retArray.push(frcItm_hospital);
    });


    return retArray;
  }

  public static GetSingleFractionItemByType(txnItem: IncentiveTransactionItemsVM, incentiveType: string): IncentiveFractionItemsModel {

    let frcItem: IncentiveFractionItemsModel = new IncentiveFractionItemsModel();
    //frcItem.BillingTransacactionId = txnItem.BillingTransacactionId;
    frcItem.BillingTransactionItemId = txnItem.BillingTransactionItemId;
    frcItem.PatientId = txnItem.PatientId;
    frcItem.InvoiceNoFormatted = txnItem.InvoiceNo;
    frcItem.ItemName = txnItem.ItemName;
    frcItem.PriceCategory = txnItem.PriceCategory;
    frcItem.TotalBillAmount = txnItem.TotalAmount;
    frcItem.TransactionDate = txnItem.TransactionDate;
    

    if (incentiveType == "AssignedTo") {
      frcItem.IncentiveType = "assigned";//move this hard-code to enum.
      frcItem.IncentiveReceiverId = txnItem.AssignedToEmpId;
      frcItem.IncentiveReceiverName = txnItem.AssignedToEmpName;
      frcItem.IncentiveAmount = txnItem.AssignedToAmount;
      frcItem.IncentivePercent = txnItem.AssignedToPercent;
    }
    else if (incentiveType == "ReferredBy") {
      frcItem.IncentiveType = "referral";//move this hard-code to enum.
      frcItem.IncentiveReceiverId = txnItem.ReferredByEmpId;
      frcItem.IncentiveReceiverName = txnItem.ReferredByEmpName;
      frcItem.IncentiveAmount = txnItem.ReferralAmount;
      frcItem.IncentivePercent = txnItem.ReferredByPercent;
    }
    else if (incentiveType == "hospital") {
      frcItem.IncentiveType = "hospital";//move this hard-code to enum.
      frcItem.IncentiveReceiverId = 0
      frcItem.IncentiveReceiverName = "Hospital";
      //BELOW TWO will be calcualted after calculating referral and assigned to percentages
      //frcItem.IncentiveAmount
      //frcItem.IncentivePercent
    }



    frcItem.CreatedBy = 1;//this.securityService.loggedInUser.EmployeeId;
    frcItem.CreatedOn = moment().format("YYYY-MM-DD HH:mm:ss");

    frcItem.BillItemPriceId = txnItem.BillItemPriceId;
    frcItem.BillingTransactionId = txnItem.BillingTransactionId;
    //frcItem.

    return frcItem;
  }


}
