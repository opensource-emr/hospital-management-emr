
import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';

import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { AppointmentDLService } from '../../appointments/shared/appointment.dl.service';
import { LabsDLService } from '../../labs/shared/labs.dl.service';
import { ImagingDLService } from '../../radiology/shared/imaging.dl.service';
import { BillingDLService } from './billing.dl.service';
import { BillItemRequisition } from './bill-item-requisition.model';
import { BillingTransaction } from './billing-transaction.model';
import { BillingDeposit } from './billing-deposit.model';
import { BillingTransactionItem } from './billing-transaction-item.model';
import { LabTestRequisition } from '../../labs/shared/lab-requisition.model';
import { ImagingItemRequisition } from '../../radiology/shared/imaging-item-requisition.model';
import { BillReturnRequest } from './bill-return-request.model';
import { Patient } from '../../patients/shared/patient.model';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';
import { RouteFromService } from '../../shared/routefrom.service';
import { CommonFunctions } from '../../shared/common.functions';
import { Observable } from 'rxjs';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { SecurityDLService } from "../../security/shared/security.dl.service";
import { BillSettlementModel } from "./bill-settlement.model";
import { BillInvoiceReturnModel } from "./bill-invoice-return.model";
import { CoreService } from '../../core/shared/core.service';
import { AdmissionDLService } from '../../admission/shared/admission.dl.service';
import { BillingReceiptModel } from './billing-receipt.model';
import { Visit } from '../../appointments/shared/visit.model';
import { DischargeDetailBillingVM } from '../ip-billing/shared/discharge-bill.view.models';
import { BedDurationTxnDetailsVM } from '../ip-billing/shared/discharge-bill.view.models';
import { LabsBLService } from '../../labs/shared/labs.bl.service';
import { CurrentVisitContextVM } from '../../appointments/shared/current-visit-context.model';
import { HandOverModel } from './hand-over.model';
import { DenominationModel } from './denomination.model';
import { BillingOpPatientVM } from '../op-patient-add/bill-op-patientVM';

@Injectable()
export class BillingBLService {

  constructor(public billingDLService: BillingDLService,
    public securityService: SecurityService,
    public visitDLService: VisitDLService,
    public labsBLService: LabsBLService,
    public labsDLService: LabsDLService,
    public patientDLService: PatientsDLService,
    public appointmentDLService: AppointmentDLService,
    public admissionDLService: AdmissionDLService,
    public routeFromService: RouteFromService,
    public imagingDLService: ImagingDLService,
    public securityDlService: SecurityDLService,
    public coreService: CoreService) {

  }

  public GetUnpaidTotalBills() {
    return this.billingDLService.GetUnpaidTotalBills()
      .map((responseData) => {
        return responseData;
      })
  }

  public GetUnpaidInsuranceTotalBills() {
    return this.billingDLService.GetUnpaidInsuranceTotalBills()
      .map((responseData) => {
        return responseData;
      })
  }

  public GetUnclaimedInvoices(fromDate: any, toDate: any) {
    return this.billingDLService.GetUnclaimedInvoices(fromDate, toDate)
      .map((responseData) => {
        return responseData;
      })
  }
  public GetPendingBillsForSettlement() {
    return this.billingDLService.GetPendingBillsForSettlement()
      .map((responseData) => {
        return responseData;
      })
  }

  //used in bill-settlements.
  public GetCreditInvoicesByPatient(patientId: number) {
    return this.billingDLService.GetCreditInvoicesByPatient(patientId)
      .map((responseData) => {
        return responseData;
      })
  }
  public GetInvoiceDetailsForDuplicatebill() {
    return this.billingDLService.GetInvoiceDetailsForDuplicatebill()
      .map((responseData) => {
        return responseData;
      })
  }

  public GetProvisionalReceiptDetailsForDuplicatebill() {
    return this.billingDLService.GetProvisionalReceiptDetailsForDuplicatebill()
      .map((responseData) => {
        return responseData;
      })
  }

  public GetProvisionalItemsByPatientId(patientId: number) {
    return this.billingDLService.GetProvisionalItemsByPatientId(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  public GetInsuranceProvisionalItemsByPatientId(patientId: number) {
    return this.billingDLService.GetInsuranceProvisionalItemsByPatientId(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  //Get Inpatient Orders from Nursing Module
  public GetProvItemsByPatIdAndVisitId(patientId: number, patientVisitId: number) {
    return this.billingDLService.GetProvItemsByPatIdAndVisitId(patientId, patientVisitId)
      .map((responseData) => {
        return responseData;
      })
  }

  public GetInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number, getVisitInfo: boolean, isInsuranceReceipt: boolean) {
    return this.billingDLService.GetInvoiceByReceiptNo(receiptNo, fiscalYrId, getVisitInfo, isInsuranceReceipt)
      .map((responseData) => {
        return responseData;
      });
  }

  //get Receiptby Receipt no for Provisional duplicate slip
  public GetProvInvoiceByReceiptNo(receiptNo: number, fiscalYrId: number) {
    return this.billingDLService.GetProvInvoiceByReceiptNo(receiptNo, fiscalYrId)
      .map((responseData) => {
        return responseData;
      });
  }
  //Gets the latest billing receipt no. (for disabling the next button)
  public GetlatestBillingReceiptNo() {
    return this.billingDLService.GetlatestBillingReceiptNo().map(res => { return res; })
  }


  // Load the Deposit amount of the Patient 
  public GetDepositFromPatient(patientId: number) {
    return this.billingDLService.GetDepositFromPatient(patientId)
      //.map(res => res);
      .map((responseData) => {
        return responseData;
      })
  }

  // Load the Deposit amount of the Patient 
  public GetPreviousAmount() {
    return this.billingDLService.GetPreviousAmount()
      //.map(res => res);
      .map((responseData) => {
        return responseData;
      })
  }


  // Load the User List 
  public GetUserList() {
    return this.billingDLService.GetUserList()
      //.map(res => res);
      .map((responseData) => {
        return responseData;
      })
  }


  // Credit Cancellation
  public GetCreditForCancellationbyPatientIdonBillTxnItems(patientId: number) {
    return this.billingDLService.GetCreditForCancellationbyPatientIdonBillTxnItems(patientId)
      .map((responseData) => {
        return responseData;
      })
  }



  public GetPendingDoctorOrdersTotal() {
    return this.billingDLService.GetPendingDoctorOrdersTotal()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetAllBillingCounters() {
    return this.billingDLService.GetCounter()
      .map((responseDate) => {
        return responseDate;
      });
  }



  //returns all service departments.
  public GetServiceDepartments() {
    return this.billingDLService.GetServiceDepartments()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetServiceDepartmentItems(serviceDeptId: number) {
    return this.billingDLService.GetServiceDepartmentItems(serviceDeptId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetBillItemList() {
    return this.billingDLService.GetBillItemList()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetInsuranceBillingItems() {
    return this.billingDLService.GetInsuranceBillingItems()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetInsurancePackages() {
    return this.billingDLService.GetInsurancePackages()
      .map(res => {
        var responseData = res;
        if (responseData.Results) {
          responseData.Results.forEach(billPackage => {
            billPackage.BillingItemsXML = JSON.parse(billPackage.BillingItemsXML);
          });
        }
        return responseData;
      });
  }
  public GetOrganizationList() {
    return this.billingDLService.GetOrganizationList()
      .map((responseData => {
        return responseData;
      }))
  }

  public GetDoctorOrdersFromAllDepartments(patientId: number) {
    return this.billingDLService.GetDoctorOrdersFromAllDepartments(patientId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetPendingRequisitionsByDepartment(patientId: number, srvDeptId: number) {
    return this.billingDLService.GetPendingRequisitionsByDepartment(patientId, srvDeptId)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetFractionApplicableItems() {
    return this.billingDLService.GetFractionApplicableItems()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetBillItemForOPDVisit(patientVisitId: number) {
    //patientvisitid is requisitionid for opd-ticket
    return this.billingDLService.GetBillItemForOPDVisit(patientVisitId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetPatients() {
    return this.patientDLService.GetPatients()
      .map(res => res);
  }

  public GetPatientsWithVisitsInfo() {
    return this.patientDLService.GetPatientsWithVisitsInfo()
      .map(res => res);
  }

  public GetMembershipType() {
    return this.billingDLService.GetMembershipType()
      .map(res => res);
  }

  public GetPatientMembershipInfo(patientId) {
    return this.billingDLService.GetPatientMembershipInfo(patientId)
      .map(res => res);
  }

  //sud: 19Jun'18--for RequestingDepartment and BillingType.
  public GetPatientById(patientId) {
    return this.patientDLService.GetPatientById(patientId)
      .map(res => res);
  }


  public GetTxnItemsForEditDoctor() {
    return this.billingDLService.GetTxnItemsForEditDoctor()
      .map(res => res);
  }

  //Sud/yub: 11Aug'19--to get txn items by date - duplicate implementation needed for date filter.
  public GetTxnItemsForEditDoctorByDate(fromDate: string, toDate: string) {
    return this.billingDLService.GetTxnItemsForEditDoctorByDate(fromDate, toDate)
      .map(res => res);
  }

  // Get Doctor List -- use GetDoctorsList instead of this: sud--19May'18,
  //check for dependencies before removing this. 
  public GetProviderList() {
    return this.billingDLService.GetProviderList()
      .map(res => res);
  }

  public GetDoctorsList() {
    return this.billingDLService.GetDoctorsList()
      .map(res => res);
  }


  //get the list of patient visit provider wise
  public GetPatientVisitsProviderWise(patientId: number) {
    return this.visitDLService.GetPatientVisitsProviderWise(patientId)
      .map(res => res);
  }
  public GetCurrentFiscalYear() {
    return this.billingDLService.GetCurrentFiscalYear()
      .map(res => res);
  }
  public GetAllFiscalYears() {
    return this.billingDLService.GetAllFiscalYears()
      .map(res => res);
  }

  public GetDepositList() {
    return this.billingDLService.GetDepositList()
      .map(res => res);
  }

  public GetPastTestList(patientId) {
    return this.billingDLService.GetPastTestList(patientId)
      .map(res => res);
  }

  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, IsInsurance = false, IMISCode = null) {
    return this.patientDLService.GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, IsInsurance, IMISCode)
      .map(res => res);
  }

  ////Getting Patient List excluding insurance patient..
  //public GetPatientList() {
  //  return this.patientDLService.GetPatientList()
  //    .map(res => res);
  //}

  //mapping with billingDLServices
  public UpdateInsBalance(patientId: number, insuranceProviderId: number, updatedInsBalance: number) {
    return this.billingDLService.UpdateInsuranceBalance(patientId, insuranceProviderId, updatedInsBalance)
      .map(res => res);
  }

  public GetPatientBillHistoryDetail(patientId: number) {
    return this.billingDLService.GetPatientBillHistoryDetail(patientId)
      .map(res => res);
  }
  public GetPatientReturnedReceiptList(patientId: number) {
    return this.billingDLService.GetPatientReturnedReceiptList(patientId)
      .map(res => res);
  }
  //unclaimed Insurance
  public UpdateInsuranceClaimed(unclaimedInvoices, counterId) {
    let billingTransactionIdList = unclaimedInvoices.map(invoice => {
      return invoice.BillingTransactionId;
    });
    return this.billingDLService.UpdateInsuranceClaimed(billingTransactionIdList, counterId)
      .map(res => res);
  }
  public PostBillingTransactionItems(billTranItems: Array<BillingTransactionItem>) {
    //this map is javascript map not rxjs map.. 
    //remove itemlist from each of transactionitem since they're not needed and also are VERY HEAVY-ARRAY..
    //also remove validators, since 1. we dont need them as a part of data, 2. It causes Circular object exception while stringifying.
    let billTransItemTemp = billTranItems.map(function (item) {
      item.Patient = Patient.GetClone(item.Patient);
      //set requestedby to null when zero (Foreign key won't allow Zero in db so)
      if (item.RequestedBy == 0) {
        item.RequestedBy = null;
      }
      if (item.PatientVisitId == 0)
        item.PatientVisitId = null;
      var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);

      return temp;
    });

    //var temp = _.omit(billTranItems, ['BillingTransactionValidator']);
    return this.billingDLService.PostBillingTransactionItems(billTransItemTemp)

      .map((responseData) => {
        return responseData;
      });
  }

  public PostBillingTransaction(billTxnModel: BillingTransaction) {

    let billTransItemTemp = billTxnModel.BillingTransactionItems.map(function (item) {
      item.Patient = Patient.GetClone(item.Patient);
      //set requestedby to null when zero (Foreign key won't allow Zero in db so)
      if (item.RequestedBy == 0) {
        item.RequestedBy = null;
      }
      if (item.PatientVisitId == 0)
        item.PatientVisitId = null;
      var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);
      return temp;
    });
    var billTxn: any;
    billTxn = Object.assign({}, billTxnModel);
    billTxn.BillingTransactionItems = billTransItemTemp;
    return this.billingDLService.PostBillingTransaction(billTxn)
      .map((responseData) => {
        return responseData;
      });
  }

  public PostPackageBillingTransaction(billTxnModel: BillingTransaction) {

    let txnItems: Array<any> = billTxnModel.BillingTransactionItems.map(bil => {
      return _.omit(bil, ['ServiceDepartment', 'ItemList', 'BillingTransactionItemValidator', 'Patient']);
    });
    let tempBillTxn = Object.assign({}, billTxnModel);

    tempBillTxn.BillingTransactionItems = txnItems;

    return this.billingDLService.PostPackageBillingTransaction(tempBillTxn)
      .map((responseData) => {
        return responseData;
      });

  }
  public PostIpBillingTransaction(billTxnModel: BillingTransaction) {
    let items = billTxnModel.BillingTransactionItems.map(a => Object.assign({}, a));
    let billTransItemTemp = items.map(function (item) {
      item.Patient = Patient.GetClone(item.Patient);
      //set requestedby to null when zero (Foreign key won't allow Zero in db so)
      if (item.RequestedBy == 0) {
        item.RequestedBy = null;
      }
      if (item.PatientVisitId == 0)
        item.PatientVisitId = null;
      var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);
      return temp;
    });
    var billTxn: any;
    billTxn = Object.assign({}, billTxnModel);
    billTxn.BillingTransactionItems = billTransItemTemp;
    return this.billingDLService.PostIpBillingTransaction(billTxn)
      .map((responseData) => {
        return responseData;
      });
  }

  public PostBillingDeposit(deposit: BillingDeposit) {
    return this.billingDLService.PostBillingDeposit(deposit)
      .map((responseData) => {
        return responseData;
      });
  }

  public PostHandoverDetails(handover: HandOverModel) {
    var temp = _.omit(handover, ['HandoverValidator']);
    //'denomination.denominationValidator'        
    // temp=_.omit(temp.denomination, ['DenominationValidator'])
    //var temp = _.omit(temp.denomination, ['denominationValidator']);

    return this.billingDLService.PostHandoverDetails(temp)
      .map((responseData) => {
        return responseData;
      });
  }


  //To cancel the Credit Bill 
  public PutBillStatusOnBillTxnItemCancellation(billTxnItemReq: BillingTransactionItem) {
    let billStatus = "cancel";
    let txnItemId = billTxnItemReq.BillingTransactionItemId;
    //let BillTxnItemIds = billTxnItemReq.map(function (item) {
    //    return item.BillingTransactionItemId;
    //});
    return this.billingDLService.PutBillStatusOnBillTxnItemCancellation(txnItemId, billStatus, billTxnItemReq.CancelRemarks, billTxnItemReq.CancelledBy)
      .map((responseData) => {
        return responseData;
      })
  }

  //update PrintCount for print on Billingtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.billingDLService.PutPrintCount(printCount, billingTransactionId)
      .map((responseData) => {
        return responseData;
      })
  }

  //Group Discount on Billingtransaction:: Yubraj 29th Nov '18
  public UpdateBillTxnItems(modifiedItems: Array<BillingTransactionItem>) {
    let txnItems: Array<any> = modifiedItems.map(bil => {
      return _.omit(bil, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);
    });
    let tempBillTxnItems = Object.assign({}, modifiedItems);
    tempBillTxnItems = txnItems;
    return this.billingDLService.PutBillTxnItems(tempBillTxnItems)
      .map((responseData) => {
        return responseData;
      })
  }

  //Update procedure type: 20th Dec '18
  public UpdateProcedure(admissionPatId, ProcedureType) {
    return this.billingDLService.UpdateProcedure(admissionPatId, ProcedureType)
      .map((responseData) => {
        return responseData;
      })
  }


  public PutBillStatusForDepartmentRequisition(billTxnItems: Array<BillingTransactionItem>, departmentName: string, billStatus: string) {
    let requisitionIds = billTxnItems.map(function (item) {
      return item.RequisitionId;
    });
    let integratonName = this.coreService.GetServiceIntegrationName(departmentName);
    if (integratonName == "LAB") {
      return this.labsDLService.PutLabBillStatus(requisitionIds, billStatus)
        .map(res => res);
    }
    else if (integratonName == "Radiology") {
      return this.imagingDLService.PutImagingReqsBillingStatus(requisitionIds, billStatus)
        .map(res => res)
    }
    else if (integratonName == "OPD") {
      return this.visitDLService.PutVisitsBillingStatus(requisitionIds, billStatus)
        .map((responseData) => {
          return responseData;
        });
    }
    else {
      //since we are only working on OPD, the subscribe functions returns the null values to the other ServiceDepartment, 
      //to handle this we used EmtyObservable
      return (new EmptyObservable());
    }
  }


  //updates BillStatus of BillItemRequisition table.
  public UpdateBillStatus_BillItemRequisitions(billItemReqIds: Array<number>, status) {
    return this.billingDLService.PutStatusOfBillItemReqisitions(billItemReqIds, status)
      .map(res => res);
  }

  //updates BillStatus of ServiceDepartment's Requisition tables.-- default status=paid
  //once the billing is processed from Pending-Bills page to BillingTransaction the Billingstatus in 
  //service dept's tables et: LabRequisition, ImagingRequisition, Visit, etc will be paid.
  //even though the BillStatus is unpaid in BillingTransactionItem table.
  public UpdateRequisitionsBillingStatus(billTransactionItems: Array<BillingTransactionItem>, srvDeptName: string) {
    let billStatus = "provisional";
    let requisitionIds = billTransactionItems.map(function (item) {
      return item.RequisitionId;
    });
    let integratonName = this.coreService.GetServiceIntegrationName(srvDeptName);
    if (integratonName == "LAB") {
      return this.labsDLService.PutLabBillStatus(requisitionIds, billStatus)
        .map(res => res);
    }
    else if (integratonName == "Radiology") {
      return this.imagingDLService.PutImagingReqsBillingStatus(requisitionIds, billStatus)
        .map(res => res)
    }
    else if (integratonName == "OPD" || integratonName == "ER") {
      return this.visitDLService.PutVisitsBillingStatus(requisitionIds, billStatus)
        .map((responseData) => {
          return responseData;
        });
    }
    else {
      return (new EmptyObservable());
    }
  }

  // update doctor after doctor edit feature
  public UpdateDoctorafterDoctorEdit(BillTxnItemId: number, ProviderName: string, ProviderId: number) {
    return this.billingDLService.PutAssignedToDoctor(BillTxnItemId, ProviderName, ProviderId)
      .map((responseData) => {
        return responseData;
      });
  }

  //start: billingPackage
  public GetBillingPackageList() {
    return this.billingDLService.GetBillingPackageList()
      .map(res => {
        var responseData = res;
        if (responseData.Results) {
          responseData.Results.forEach(billPackage => {
            billPackage.BillingItemsXML = JSON.parse(billPackage.BillingItemsXML);
          });
        }
        return responseData;
      });
  }


  //This method Post all dept related BillingOrders
  //and after post it take response and add requisitionId to respective billRequisitionItems
  //It return single billRequisitionItem object with or without requisitionId
  public PostDepartmentOrders(billingTransactionItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string, insuranceApplicable: boolean, currPatVisitContext?: CurrentVisitContextVM): Observable<any> {
    let labItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for lab department items
    let imgingItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for Imaging/Radiology department
    let visitItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
    //updating info for Lab and Radiology list on service departmetn name
    //Because we post separately Lab and Radiology to DB
    for (var s = 0; s < billingTransactionItems.length; s++) {
      let integrationName = this.coreService.GetServiceIntegrationName(billingTransactionItems[s].ServiceDepartmentName);

      //ashim : 12Dec2018 : Incase of copy from earlier invoice don't post those lab/imaging items to lab/imaging requisition that was already added in the earlier invoice.
      if (integrationName == "Radiology" && !billingTransactionItems[s].RequisitionId) {
        imgingItems.push(billingTransactionItems[s]);
      } else if (integrationName == "LAB" && !billingTransactionItems[s].RequisitionId) {
        labItems.push(billingTransactionItems[s]);    //Push only Lab items
      }
      //ashim: 24Sep2018 : Create only Emergency Registration item's visit .
      else if (integrationName == "ER" && billingTransactionItems[s].ItemName.toLowerCase() == "emergency registration" && !billingTransactionItems[s].RequisitionId) {
        visitItems.push(billingTransactionItems[s]); //push only opd items.
      }
      else if (integrationName == "OPD" && billingTransactionItems[s].ItemName.toLowerCase() == "consultation charge") {
        visitItems.push(billingTransactionItems[s]); //push only opd items.
      }
    }

    let wardName = "outpatient";
    if (currPatVisitContext && currPatVisitContext.VisitType == "inpatient") {
      wardName = currPatVisitContext.Current_WardBed;
    }
    let labItms = this.GetLabItemsMapped(labItems, orderStatus, billStatus, wardName, insuranceApplicable); //after mapping lab items
    let imgItems = this.GetImagingItemsMapped(imgingItems, orderStatus, billStatus, insuranceApplicable); //after mapping imaging items

    //added: Ashim: 23Sep2018 : Added for OPD from BillingTransaction.
    let visititems = this.GetVisitItemsMapped(visitItems, orderStatus, billStatus);
    let deptHttpRequests = [];
    let dptRequestIndexes = [];
    let currIndex = 0;
    if (labItms && labItms.length > 0) {
      deptHttpRequests.push(this.labsDLService.PostToRequisition(labItms).map(res => res));
      dptRequestIndexes.push({ dptName: "lab", index: currIndex });
      currIndex++;
    }
    if (imgItems && imgItems.length > 0) {
      deptHttpRequests.push(this.imagingDLService.PostRequestItems(imgItems).map(res => res));
      dptRequestIndexes.push({ dptName: "radiology", index: currIndex });
      currIndex++;
    }
    if (visititems && visititems.length > 0) {
      deptHttpRequests.push(this.visitDLService.PostVisitsFromBillingTransaction(visititems).map(res => res));
      dptRequestIndexes.push({ dptName: "visit", index: currIndex });
      currIndex++;
    }
    if (deptHttpRequests.length == 0) {
      return Observable.of({ Status: "OK", ErrorMessage: null, Results: billingTransactionItems });
    }
    else {
      //ForkJoin functionality it wait for all response from all dept and then do functionality and return one single object        
      return Observable.forkJoin(deptHttpRequests).map((data: any[]) => {
        let labResponse: any = dptRequestIndexes.filter(a => a.dptName == "lab").length > 0 && (a => a.Status == "OK") ? data[dptRequestIndexes.find(a => a.dptName == "lab").index] : null;
        let imgResponse: any = dptRequestIndexes.filter(a => a.dptName == "radiology").length > 0 && (a => a.Status == "OK") ? data[dptRequestIndexes.find(a => a.dptName == "radiology").index] : null;
        let visitResponse: any = dptRequestIndexes.filter(a => a.dptName == "visit").length > 0 && (a => a.Status == "OK") ? data[dptRequestIndexes.find(a => a.dptName == "visit").index] : null;
        billingTransactionItems.forEach(billItem => {
          let integrationName = this.coreService.GetServiceIntegrationName(billItem.ServiceDepartmentName);
          billItem.SrvDeptIntegrationName = integrationName;
          if (labResponse && labResponse.Results.length > 0) {
            let labResponseResults: Array<LabTestRequisition> = labResponse.Results;
            //Ashim: 28May'18 Added check for service dept since it was taking RequisitionId of wrong item where ItemId of Lab and Radiology Item was same.
            let labItm = labResponseResults.find(i => i.LabTestId == billItem.ItemId
              && integrationName == "LAB");
            if (labItm && !billItem.RequisitionId) {
              billItem.RequisitionId = labItm.RequisitionId;
              //This is added to Use Ditinct RequisitionId for same tests requested Multiple times at a same time
              var index = labResponseResults.findIndex(val => val.RequisitionId == labItm.RequisitionId);
              labResponseResults = labResponseResults.splice(index, 1);
            }
          }
          if (imgResponse && imgResponse.Results.length > 0) {
            let imgResponseResults: Array<ImagingItemRequisition> = imgResponse.Results;
            //Ashim: 28May'18 Added check for service dept since it was taking RequisitionId of wrong item where ItemId of Lab and Radiology Item was same.
            let imgItm = imgResponseResults.find(i => i.ImagingItemId == billItem.ItemId
              && (integrationName == "Radiology"));
            if (imgItm && !billItem.RequisitionId) {
              billItem.RequisitionId = imgItm.ImagingRequisitionId;
            }
          }
          //ashim: 24Sep2018, modifications of ER visit.
          if (visitResponse && visitResponse.Results.length > 0) {
            let visitResponseResults: Array<Visit> = visitResponse.Results;
            let visItem = visitResponseResults.find(visit => billItem.ItemName.toLowerCase() == "emergency registration"
              && visit.ProviderId == billItem.ProviderId)
            if (visItem && !billItem.RequisitionId) {
              billItem.RequisitionId = visItem.PatientVisitId;
              billItem.PatientVisitId = visItem.PatientVisitId;
              let index = visitResponse.Results.findIndex(a => a.PatientVisitId == visItem.PatientVisitId);
              visitResponse.Results.splice(index, 1);
            }
          }
        });
        return { Status: billingTransactionItems.length > 0 ? "OK" : "Failed", Results: billingTransactionItems };
      });
    }
  }

  //public Method: Map all transactionItems  for post against Labs Department
  public GetLabItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string, wardName: string, insuranceApplicable: boolean): string {

    let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
    let labItems: Array<LabTestRequisition> = new Array<LabTestRequisition>();
    billItems.forEach(bill => {
      labItems.push({
        RequisitionId: 0,
        PatientId: bill.PatientId,
        //as patientvisitid is nullableForeignKey, it doesn't accept ZERO
        PatientVisitId: bill.PatientVisitId != 0 ? bill.PatientVisitId : null,
        //ProviderId is AssignedToDr in BillTransactionItem
        //RequestedBy Doctor is ProviderId in LabRequisition.
        ProviderId: bill.RequestedBy != 0 ? bill.RequestedBy : null,
        LabTestId: bill.ItemId,
        ProcedureCode: bill.ProcedureCode,
        LOINC: "",//Need to change this later to actual loinc code.
        LabTestName: bill.ItemName,
        LabTestSpecimen: null,
        LabTestSpecimenSource: null,
        PatientName: null,//this will be assigned from server side.
        Diagnosis: null,
        Urgency: "normal",//default for Billing
        OrderDateTime: null,
        ProviderName: null,
        BillingStatus: billStatus,
        OrderStatus: orderStatus,
        SampleCode: null,
        RequisitionRemarks: null,
        CreatedBy: bill.CreatedBy,
        CreatedOn: bill.CreatedOn,
        SampleCreatedBy: null,
        SampleCreatedOn: null,
        Comments: null,
        ReportTemplateId: 0,
        DiagnosisId: null,//default null to avoid foreign key conflict
        VisitType: bill.VisitType,
        RunNumberType: '',
        LabReportId: null,
        WardName: wardName,
        IsActive: true,
        IsVerified: null,
        VerifiedBy: null,
        VerifiedOn: null,
        ResultingVendorId: 0,
        HasInsurance: insuranceApplicable
      });
    });

    let retValue = null;
    if (billItems && billItems.length > 0) {
      let labTestReqtemp = labItems.map(function (item) {
        //item. = Patient.GetClone(item.Patient);
        var temp = _.omit(item, ['ItemList']);
        return temp;
      });
      retValue = JSON.stringify(labItems);
    }

    return retValue;
  }
  //public Method: Map all transactionItems (Nursing Requisition) for post against Imaging/Radiology department
  public GetImagingItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string, insuranceApplicable: boolean): Array<ImagingItemRequisition> {
    let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
    let imgItems: Array<ImagingItemRequisition> = new Array<ImagingItemRequisition>();
    billItems.forEach(bill => {
      imgItems.push({
        ImagingItemId: bill.ItemId,
        //as patientvisitid is nullableForeignKey, it doesn't accept ZERO
        PatientVisitId: bill.PatientVisitId != 0 ? bill.PatientVisitId : null,
        PatientId: bill.PatientId,
        ProviderName: null,
        ImagingTypeName: bill.ServiceDepartmentName,
        ImagingTypeId: null,//this will be filled from server side. Try to load it in client side from Coreservice.Masters
        RequisitionRemarks: null,
        ImagingDate: bill.PaidDate,
        OrderStatus: orderStatus,
        ProviderId: bill.RequestedBy,
        ImagingRequisitionId: 0,//this will also be filled from server side.
        ImagingItemName: bill.ItemName,
        ProcedureCode: bill.ProcedureCode,
        BillingStatus: billStatus,
        Urgency: "normal",//default when sending from billing
        DiagnosisId: null,//default null to avoid foreign key conflict
        HasInsurance: insuranceApplicable//sud:21Jul'19--For Insurnace 
      });
    });

    return imgItems;
  }

  public GetVisitItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string): string {
    let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
    let visitItems: Array<any> = new Array<any>();
    billItems.forEach(bill => {
      let visit = new Visit();

      visit.PatientId = bill.PatientId;
      if (bill.ItemName.toLowerCase() == "emergency registration")
        visit.VisitType = "emergency";
      else
        visit.VisitType = "outpatient";


      visit.DepartmentId = bill.RequestingDeptId;

      visit.ProviderId = bill.ProviderId;
      visit.ProviderName = bill.ProviderName;
      visit.BillingStatus = billStatus;
      visit.VisitStatus = "initiated";
      visit.CreatedOn = moment().format('YYYY-MM-DDTHH:mm');
      visit.AppointmentType = "New";
      visit.CreatedBy = currentUser;
      var tempVisitModel = _.omit(visit, ['VisitValidator']);
      visitItems.push(tempVisitModel);
    });

    return JSON.stringify(visitItems);
  }

  public ActivateCounter(counterId: number) {
    return this.billingDLService.ActivateBillingCounter(counterId)
      .map(res => {
        return res;
      });
  }

  public DeActivateCounter() {
    return this.billingDLService.DeActivateBillingCounter()
      .map(res => {
        return res;
      });
  }

  public PostSettlementInvoice(settlement) {

    let stlmntToPost: any = _.omit(settlement, ["Patient"]);


    //omit BillingTransactionItem and Patient from each of BillingTransactions objects
    let txns: Array<BillingTransaction> = settlement.BillingTransactions.map(bil => {
      return _.omit(bil, ["Patient", "BillingTransactionItems"]);
    });

    stlmntToPost.BillingTransactions = txns;


    return this.billingDLService.PostBillSettlement(stlmntToPost)
      .map((responseData) => {
        return responseData;
      });
  }

  public UpdateDepositPrintCount(depositId: number) {
    return this.billingDLService.PutDepositPrintCount(depositId)
      .map(res => res);
  }


  //sud: 10may'18 -- to cancel multiple txn items at once.
  //earlier we wer able to cancel only one item at a time.
  public CancelMultipleTxnItems(bilTxnItems: Array<BillingTransactionItem>) {
    let billTransItemTemp = bilTxnItems.map(function (item) {
      //item.Patient = Patient.GetClone(item.Patient);
      //set requestedby to null when zero (Foreign key won't allow Zero in db so)
      if (item.RequestedBy == 0) {
        item.RequestedBy = null;
      }
      if (item.PatientVisitId == 0)
        item.PatientVisitId = null;
      var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);

      return temp;
    });

    return this.billingDLService.CancelMultipleBillTxnItems(billTransItemTemp)
      .map(res => res);
  }

  //sud: 10may'18 -- to cancel multiple txn items at once.
  public GetPatientPastBillSummary(patientId: number) {
    return this.billingDLService.GetPatientPastBillSummary(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  //Yubraj: 8th July '19 -- to show in bill history of insurance provisional billing
  public GetPatientPastInsuranceBillSummary(patientId: number) {
    return this.billingDLService.GetPatientPastInsuranceBillSummary(patientId)
      .map((responseData) => {
        return responseData;
      })
  }

  public UpdateSettlementPrintCount(settlementId: number) {
    return this.billingDLService.PutSettlementPrintCount(settlementId)
      .map(res => res);
  }

  public GetAllSettlements() {
    return this.billingDLService.GetAllSettlements()
      .map(res => res);
  }

  //added: sud: 21May'18
  public GetSettlementInfoBySettlmentId(settlementId: number) {
    return this.billingDLService.GetSettlementInfoBySettlmentId(settlementId)
      .map(res => res);
  }

  //added: sud: 21May'18
  public GetPatientBillingContext(patientId: number) {
    return this.billingDLService.GetPatientBillingContext(patientId)
      .map(res => res);
  }
  //added: ashim : 20Aug2018 : to display admission detail in provisional page.
  public GetLatestAdmissionDetail(patientId: number) {
    return this.admissionDLService.GetLatestAdmissionDetail(patientId)
      .map(res => res);
  }

  //added: ashim : 20Aug2018 : to display admission detail in provisional page.
  public GetAdmissionNDepositsInfoForDischarge(patientVisitId: number) {
    return this.billingDLService.GetAdmissionNDepositsInfoForDischarge(patientVisitId)
      .map(res => res);
  }


  //added: ashim : 16Sep2018 : to display admission detail in provisional page.
  public GetAdditionalInfoForDischarge(patientVisitId: number, billingTxnId: number) {
    return this.billingDLService.GetAdditionalInfoForDischarge(patientVisitId, billingTxnId)
      .map(res => res);
  }
  //added: ashim : 16Sep2018 : to display admission detail in provisional page.
  public GetBillItemsForIPReceipt(patientId: number, billingTxnId: number, billStatus) {
    return this.billingDLService.GetBillItemsForIPReceipt(patientId, billingTxnId, billStatus)
      .map(res => res);
  }


  //added: ashim: 17Aug'18
  //this function is moved from bill-return-request.component
  public PostReturnReceipt(billingReceipt: BillingReceiptModel, returnRemarks: string) {
    let retModel: BillInvoiceReturnModel = new BillInvoiceReturnModel();
    retModel.RefInvoiceNum = billingReceipt.ReceiptNo;
    retModel.PatientId = billingReceipt.Patient.PatientId;
    retModel.BillingTransactionId = billingReceipt.BillingTransactionId;
    retModel.SubTotal = billingReceipt.SubTotal;
    retModel.DiscountAmount = billingReceipt.DiscountAmount;
    retModel.TaxableAmount = billingReceipt.TaxableAmount;
    retModel.TaxTotal = billingReceipt.TaxTotal;
    retModel.TotalAmount = billingReceipt.TotalAmount;
    retModel.Remarks = returnRemarks;
    retModel.CounterId = this.securityService.getLoggedInCounter().CounterId;
    retModel.IsActive = true;
    retModel.InvoiceCode = billingReceipt.InvoiceCode;
    retModel.TaxId = billingReceipt.TaxId;
    return this.billingDLService.PostReturnReceipt(retModel)
      .map(res => res);
  }


  public AddNewOutpatienPatient(outPatient: BillingOpPatientVM) {
    let newPatObject = _.omit(outPatient, ['OutPatientValidator'])
    let patString = JSON.stringify(newPatObject);
    return this.patientDLService.PostBillingOutPatient(patString);
  }



  //Update quantity price doctor etc of billingtransaction item.
  //Sud: 25Sept'18
  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let itmToSend = _.omit(billTxnItem, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment'])

    return this.billingDLService.UpdateBillItem_PriceQtyDiscNDoctor(itmToSend)
      .map(res => res);
  }

  //ashim: 30Sep2018

  public DischargePatient(dischargePatient: DischargeDetailBillingVM) {
    return this.admissionDLService.DischargePatient(dischargePatient)
      .map(res => res);
  }

  //ashim: 09Sep2018
  public UpdateBedDurationBillTxn(bedDurationDetail: Array<BedDurationTxnDetailsVM>) {
    return this.billingDLService.PutBedDurationBillTxn(bedDurationDetail)
      .map(res => res);
  }

  public GetDataOfInPatient(patId: number, visitId: number) {
    return this.billingDLService.GetDataOfInPatient(patId, visitId)
      .map(res => {
        return res
      })
  }

  public GetInpatientList() {
    return this.patientDLService.GetInpatientList()
      .map(res => res);
  }

  public CloseInsurancePackage(patientInsurancePkgId: number) {
    return this.billingDLService.CloseInsurancePackage(patientInsurancePkgId)
      .map((responseData) => {
        return responseData;
      });
  }

  //start: Yubaraj: 18Jul'19--For Insurance Billing
  public GetInsurancePatients() {
    return this.billingDLService.GetInsurancePatients()
      .map(res => res);
  }
  //end: Yubaraj: 18Jul'19--For Insurance Billing
}


