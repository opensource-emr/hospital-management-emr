import { Component } from "@angular/core";
import { Router } from '@angular/router';

import { VisitService } from '../../appointments/shared/visit.service';
import { PatientService } from '../../patients/shared/patient.service';
import { BillingBLService } from '../shared/billing.bl.service';
import { BillingService } from '../shared/billing.service';

import { SecurityService } from '../../security/shared/security.service';
import { CallbackService } from '../../shared/callback.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { RouteFromService } from '../../shared/routefrom.service';

import GridColumnSettings from '../../shared/danphe-grid/grid-column-settings.constant';
import { GridEmitModel } from "../../shared/danphe-grid/grid-emit.model";

import { DanpheHTTPResponse } from "../../shared/common-models";
import { BillItemRequisition } from "../shared/bill-item-requisition.model";
import { BillingTransactionItem } from "../shared/billing-transaction-item.model";


@Component({
    templateUrl: "./bill-order-request.html"// "/BillingView/BillOrderRequest"
})
export class BillOrderRequestComponent {
    public requestList: any;
    public pendingOrdersGridColumns: Array<any> = null;
    constructor(public BillingBLService: BillingBLService,
        public visitService: VisitService,
        public billingService: BillingService,
        public securityService: SecurityService,
        public routeFromService: RouteFromService,
        public patientService: PatientService,
        public callbackService: CallbackService,
        public router: Router,
        public messageBoxService: MessageboxService) {
        this.pendingOrdersGridColumns = GridColumnSettings.BillPendingOrderSearch;
        if (this.securityService.getLoggedInCounter().CounterId < 1) {
            this.callbackService.CallbackRoute = '/Billing/BillOrderRequest'
        }
        this.GetPendingDoctorOrderList();
    }
    GetPendingDoctorOrderList(): void {
        this.BillingBLService.GetPendingDoctorOrdersTotal()
            .subscribe(res => {
                if (res.Status == "OK") {
                    this.requestList = res.Results
                }
                else {
                    this.messageBoxService.showMessage("error", [res.ErrorMessage]);
                    console.log(res.ErrorMessage);
                }
            });

    }
    PayForSingleDept(details) {
        this.BillingBLService.GetPendingRequisitionsByDepartment(details.Patient.PatientId, details.ServiceDepatmentId)
            .subscribe((response: DanpheHTTPResponse) => {
                if (response.Status == "OK" && response.Results.length) {
                    this.patientService.setGlobal(details.Patient);
                    this.patientService.getGlobal().CountrySubDivisionName = details.Patient.CountrySubDivision;
                    this.MapOrderItemWithGlobalTransaction(response.Results);
                }
                else {
                    this.messageBoxService.showMessage("failed", ["Unable to get Order List."]);
                    console.log(response.ErrorMessage);
                }
            });
    }

    PayForAllDept(details) {

        this.BillingBLService.GetDoctorOrdersFromAllDepartments(details.Patient.PatientId)
            .subscribe((response: DanpheHTTPResponse) => {
                if (response.Status == "OK" && response.Results.length) {
                    this.patientService.setGlobal(details.Patient);
                    this.patientService.getGlobal().CountrySubDivisionName = details.Patient.CountrySubDivision;
                    this.MapOrderItemWithGlobalTransaction(response.Results);
                }
                else {
                    this.messageBoxService.showMessage("failed", ["Unable to get Order List."]);
                    console.log(response.ErrorMessage);
                }
            });
    }



    DocOrderGridActions($event: GridEmitModel) {
        switch ($event.Action) {
            case "payOne":
                {
                    var data = $event.Data;
                    this.PayForSingleDept(data);
                }
                break;
            case "payAll":
                {
                    var data = $event.Data;
                    this.PayForAllDept(data);
                }
                break;
            default:
                break;
        }
    }

    MapOrderItemWithGlobalTransaction(reqList: Array<BillItemRequisition>) {
        let transaction = this.billingService.CreateNewGlobalBillingTransaction();
        transaction.PatientVisitId = reqList[0].PatientVisitId;
        transaction.PatientId = reqList[0].PatientId;

        reqList.forEach(req => {
            let billItem = new BillingTransactionItem();
            billItem.RequisitionId = req.RequisitionId;
            billItem.PatientId = req.PatientId;
            billItem.ItemId = req.ItemId;
            billItem.Price = req.Price;
            billItem.BillItemRequisitionId = req.BillItemRequisitionId;
            billItem.RequisitionId = req.RequisitionId;
            if (req.DepartmentName == "OPD")
                billItem.PerformerId = Number(req.ProcedureCode);
            else {
                billItem.PerformerId = req.AssignedTo;
                billItem.ProcedureCode = req.ProcedureCode;
            }
            billItem.ServiceDepartmentId = req.ServiceDepartmentId;
            billItem.ServiceDepartmentName = req.DepartmentName;
            billItem.ItemName = req.ItemName;
            billItem.Quantity = req.Quantity;
            billItem.PrescriberId = req.PerformerId;
            billItem.PatientVisitId = req.PatientVisitId;
            billItem.Price = req.Price;
            transaction.BillingTransactionItems.push(billItem);
        });
        this.routeFromService.RouteFrom = "Orders";
        console.log(transaction);
        this.router.navigate(['/Billing/BillingTransaction']);
    }

    logError(err: any) {
        console.log(err);
    }
}
