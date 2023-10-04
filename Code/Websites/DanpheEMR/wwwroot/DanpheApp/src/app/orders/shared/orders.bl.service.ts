import { Injectable, Directive } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as _ from 'lodash';
import 'rxjs/add/observable/forkJoin';

import { BillingDLService } from "../../billing/shared/billing.dl.service";
import { LabsDLService } from "../../labs/shared/labs.dl.service";
import { ImagingDLService } from "../../radiology/shared/imaging.dl.service";
import { SecurityService } from "../../security/shared/security.service";

import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { BillItemRequisition } from '../../billing/shared/bill-item-requisition.model';


@Injectable()
export class OrdersBLService {

    constructor(
        public imagingDLService: ImagingDLService,
        public billingDLService: BillingDLService,
        public labsDLService: LabsDLService,
        public securityService: SecurityService) {
    }

    public PostItemsToBilling(res: Array<BillItemRequisition>){
        return this.billingDLService.PostBillingItemRequisition(res)
            .map(res => res);
    }

    ////This method Post all dept related BillingOrders
    ////and after post it take response and add requisitionId to respective billRequisitionItems
    ////It return single billRequisitionItem object with or without requisitionId
    //public PostDepartmentOrders(billingTransactionItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string): Observable<any> {
    //    let labItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for lab department items
    //    let imgingItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for Imaging/Radiology department

    //    //updating info for Lab and Radiology list on service departmetn name
    //    //Because we post separately Lab and Radiology to DB
    //    for (var s = 0; s < billingTransactionItems.length; s++) {
    //        if (billingTransactionItems[s].ServiceDepartmentName == "USG" || billingTransactionItems[s].ServiceDepartmentName == "X-Ray" || billingTransactionItems[s].ServiceDepartmentName == "MRI" || billingTransactionItems[s].ServiceDepartmentName == "CT Scan") {
    //            imgingItems.push(billingTransactionItems[s]);
    //        } else if (billingTransactionItems[s].ServiceDepartmentName == "Lab") {
    //            labItems.push(billingTransactionItems[s]);    //Push only Lab items
    //        }
    //    }
    //    let labItms = this.GetLabItemsMapped(labItems, orderStatus, billStatus); //after mapping lab items
    //    let imgItems = this.GetImagingItemsMapped(imgingItems, orderStatus, billStatus); //after mapping imaging items
    //    let deptHttpRequests = [];
    //    let dptRequestIndexes = [];
    //    let currIndex = 0;
    //    if (labItms && labItms.length > 0) {
    //        deptHttpRequests.push(this.labsDLService.PostToRequisition(labItms).map(res => res));
    //        dptRequestIndexes.push({ dptName: "lab", index: currIndex });
    //        currIndex++;
    //    }
    //    if (imgItems && imgItems.length > 0) {
    //        deptHttpRequests.push(this.imagingDLService.PostRequestItems(imgItems).map(res => res));
    //        dptRequestIndexes.push({ dptName: "radiology", index: currIndex });
    //        currIndex++;
    //    }
    //    //ForkJoin functionality it wait for all response from all dept and then do functionality and return one single object        
    //    return Observable.forkJoin(deptHttpRequests).map((data: any[]) => {
    //        let labResponse: any = dptRequestIndexes.filter(a => a.dptName == "lab").length > 0 && (a => a.Status == "OK") ? data[dptRequestIndexes.find(a => a.dptName == "lab").index] : null;
    //        let imgResponse: any = dptRequestIndexes.filter(a => a.dptName == "radiology").length > 0 && (a => a.Status == "OK") ? data[dptRequestIndexes.find(a => a.dptName == "radiology").index] : null;
    //        billingTransactionItems.forEach(billItem => {
    //            if (labResponse && labResponse.Results.length > 0) {
    //                let labResponseResults: Array<LabTestRequisition> = labResponse.Results;
    //                let labItm = labResponseResults.find(i => i.LabTestId == billItem.ItemId);
    //                if (labItm) {
    //                    billItem.RequisitionId = labItm.RequisitionId;
    //                }
    //            }
    //            if (imgResponse && imgResponse.Results.length > 0) {
    //                let imgResponseResults: Array<ImagingItemRequisition> = imgResponse.Results;
    //                let imgItm = imgResponseResults.find(i => i.ImagingItemId == billItem.ItemId);
    //                if (imgItm) {
    //                    billItem.RequisitionId = imgItm.ImagingRequisitionId;
    //                }
    //            }
    //        });
    //        return { Status: billingTransactionItems.length > 0 ? "OK" : "Failed", Results: billingTransactionItems };
    //    });
    //}

    ////public Method: Map all transactionItems (Nursing Requisition) for post against Lag Department
    //public GetLabItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string): string {
    //    let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
    //    let labItems: Array<LabTestRequisition> = new Array<LabTestRequisition>();
    //    billItems.forEach(bill => {
    //        labItems.push({
    //            RequisitionId: 0,
    //            PatientId: bill.PatientId,
    //            //as patientvisitid is nullableForeignKey, it doesn't accept ZERO
    //            PatientVisitId: bill.PatientVisitId != 0 ? bill.PatientVisitId : null,
    //            ProviderId: bill.ProviderId,
    //            LabTestId: bill.ItemId,
    //            ProcedureCode: bill.ProcedureCode,
    //            LOINC: "",//Need to change this later to actual loinc code.
    //            LabTestName: bill.ItemName,
    //            LabTestSpecimen: null,
    //            LabTestSpecimenSource: null,
    //            PatientName: null,
    //            Diagnosis: null,
    //            Urgency: null,
    //            OrderDateTime: null,
    //            ProviderName: null,
    //            BillingStatus: billStatus,
    //            OrderStatus: orderStatus,
    //            SampleCode: null,
    //            RequisitionRemarks: null,
    //            CreatedBy: null,
    //            CreatedOn: null,
    //            SampleCreatedBy: null,
    //            SampleCreatedOn: null,
    //            Comments: null,
    //        });
    //    });
    //    let labTestReqtemp = labItems.map(function (item) {
    //        //item. = Patient.GetClone(item.Patient);
    //        var temp = _.omit(item, ['ItemList']);
    //        return temp;
    //    });
    //    let data = JSON.stringify(labItems);
    //    return data;
    //}
    ////public Method: Map all transactionItems (Nursing Requisition) for post against Imaging/Radiology department
    //public GetImagingItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string): any {
    //    let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
    //    let imgItems: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
    //    billItems.forEach(bill => {
    //        imgItems.push({
    //            ImagingItemId: bill.ItemId,
    //            //as patientvisitid is nullableForeignKey, it doesn't accept ZERO
    //            PatientVisitId: bill.PatientVisitId != 0 ? bill.PatientVisitId : null,
    //            PatientId: bill.PatientId,
    //            ProviderName: bill.ProviderName,
    //            ImagingTypeName: bill.ServiceDepartmentName,
    //            ImagingTypeId: null,//this will be filled from server side. Try to load it in client side from Coreservice.Masters
    //            RequisitionRemarks: null,
    //            ImagingDate: bill.PaidDate,
    //            OrderStatus: orderStatus,
    //            ProviderId: bill.ProviderId,
    //            ImagingRequisitionId: 0,//this will also be filled from server side.
    //            ImagingItemName: bill.ItemName,
    //            ProcedureCode: bill.ProcedureCode,
    //            BillingStatus: billStatus,
    //            Urgency: null,
    //        });
    //    });
    //    return imgItems;
    //}



  


}
