import { Injectable } from "@angular/core";
import { GovInsurancePatientVM } from "./gov-ins-patient.view-model";
import { InsuranceDlService } from "./insurance.dl.service";
import * as _ from "lodash";
import { QuickVisitVM } from "../../appointments/shared/quick-visit-view.model";
import * as cloneDeep from 'lodash/cloneDeep';
import { BillingTransaction, BillingTransactionPost } from "../../billing/shared/billing-transaction.model";
import { BillInvoiceReturnModel } from "../../billing/shared/bill-invoice-return.model";
import { SecurityService } from "../../security/shared/security.service";
import { BillingTransactionItem } from "../../billing/shared/billing-transaction-item.model";
import { CoreService } from "../../core/shared/core.service";
import { ENUM_AppointmentType, ENUM_VisitStatus, ENUM_VisitType, ENUM_BillingStatus } from "../../shared/shared-enums";
import * as moment from 'moment/moment';
import { Observable } from 'rxjs';
import { DanpheCache, MasterType } from "../../shared/danphe-cache-service-utility/cache-services";
import { Visit } from "../../appointments/shared/visit.model";
import { ImagingItemRequisition } from "../../radiology/shared/imaging-item-requisition.model";
import { LabTestRequisition } from "../../labs/shared/lab-requisition.model";
import { Patient } from "../../patients/shared/patient.model";
import { CurrentVisitContextVM } from "../../appointments/shared/current-visit-context.model";
import { PatientsDLService } from "../../patients/shared/patients.dl.service";
import { BedDurationTxnDetailsVM, DischargeDetailBillingVM } from "../ins-ipd-billing/shared/discharge-bill.view.models";
import { BillingDeposit } from "../../billing/shared/billing-deposit.model";
import { InsuranceBalanceAmountHistory } from "./ins-insurance-balance-amount-history.model";
@Injectable({
  providedIn: "root",
})
export class InsuranceBlService {
  constructor(public insuranceDLService: InsuranceDlService,
    public securityService: SecurityService, public coreService: CoreService, public patientDLService: PatientsDLService) {

  }

  GetLatestVisitClaimCode(patientId) {
    return this.insuranceDLService.GetLatestVisitClaimCode(patientId)
      .map(res => { return res });
  }
  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Registration Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance = false, IMISCode = null) {
    return this.insuranceDLService.GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, Age, Gender, IsInsurance, IMISCode)
      .map(res => { return res });
  }
  public GetPatientsListByNshiNumber(Ins_NshiNumber: string) {
    return this.insuranceDLService.GetPatientsListByNshiNumber(Ins_NshiNumber)
      .map(res => { return res });
  }
  public GetInsuranceProviderList() {
    return this.insuranceDLService.GetInsuranceProviderList()
      .map(res => res);
  }
  public PostGovInsPatient(govInsPatientVm: GovInsurancePatientVM) {
    let newPatObject = _.omit(govInsPatientVm, ["GovInsPatientValidator"]);
    let patString = JSON.stringify(newPatObject);
    return this.insuranceDLService.PostGovInsPatient(patString);
  }
  public UpdateInsBalance(patientId: number, insuranceProviderId: number, updatedInsBalance: number, remark: string) {
    let insHistory: InsuranceBalanceAmountHistory = new InsuranceBalanceAmountHistory();
    insHistory.PatientId = patientId;
    insHistory.Remark = remark;
    insHistory.UpdatedAmount = updatedInsBalance;
    insHistory.InsuranceProviderId = insuranceProviderId;
    let insBalString = JSON.stringify(insHistory);
    return this.insuranceDLService.UpdateInsuranceBalance(insBalString)
      .map(res => res);
  }

  public UpdateGovInsPatient(govInsPatientVm: GovInsurancePatientVM) {
    let newPatObject = _.omit(govInsPatientVm, ["GovInsPatientValidator"]);
    let patString = JSON.stringify(newPatObject);
    return this.insuranceDLService.UpdateGovInsPatient(patString);

  }

  public GetInsurancePatients() {
    return this.insuranceDLService.GetInsurancePatients().map((res) => res);
  }

  //sud:10-Oct-21: Needed separate search with key.
  public SearchInsurancePatients(searchText: string) {
    return this.insuranceDLService.SearchInsurancePatients(searchText).map((res) => res);
  }
  public GetInsBalanceHistory(patientId: number) {

    return this.insuranceDLService.GetInsBalanceHistory(patientId).map((res) => res);
  }
  public GetVisitsByStatus(status: string, maxlimitdays: number, searchTxt) {
    return this.insuranceDLService
      .GetVisitsByStatus(status, maxlimitdays, searchTxt)
      .map((res) => res);
  }
  //get insurance patient visit list...
  public GetInsPatientVisits(maxlimitdays: number, searchTxt) {
    return this.insuranceDLService
      .GetInsPatientVisits(maxlimitdays, searchTxt)
      .map((res) => res);
  }
  public GetPatientById(patientId: number) {
    return this.insuranceDLService.GetPatientById(patientId)
      .map(res => res);
  }

  //new visit
  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.insuranceDLService.GetDoctorFollowupItems();
  }
  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.insuranceDLService.GetDepartmentFollowupItems();
  }

  public GetDoctorOpdPrices() {
    return this.insuranceDLService.GetDoctorOpdPrices()
      .map(res => res);
  }
  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.insuranceDLService.GetDepartmentOpdItems();
  }
  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.insuranceDLService.GetDepartmentOldPatientPrices();
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.insuranceDLService.GetDoctorOldPatientPrices();
  }

  //aniket: 30Mar'21 Discharge patient Info
  public GetAdditionalInfoForDischarge(patientVisitId: number, billingTxnId: number) {
    return this.insuranceDLService.GetAdditionalInfoForDischarge(patientVisitId, billingTxnId)
      .map(res => res);
  }

  // getting department list 
  public GetDepartment() {
    return this.insuranceDLService.GetDepartment()
      .map(res => { return res })

  }
  public GetVisitDoctors() {
    return this.insuranceDLService.GetVisitDoctors();
  }
  public GetBillItemList() {
    return this.insuranceDLService.GetBillItemList();
  }

  public GetPatientVisitList(patientId: number) {
    return this.insuranceDLService.GetPatientVisitList(patientId)
      .map(res => res);
  }
  public GetBillTxnByRequisitionId(requisitionId: number, patientId: number) {
    return this.insuranceDLService.GetBillTxnByRequisitionId(requisitionId, patientId, "OPD")
      .map(res => res);
  }

  public GetHealthCardBillItem() {
    return this.insuranceDLService.GetHealthCardBillItem().map(res => {
      return res
    });
  }
  public GetPatHealthCardStatus(patId: number) {
    return this.insuranceDLService.GetPatHealthCardStatus(patId)
      .map(res => res);
  }
  public GetPatientBillingContext(patientId: number) {
    return this.insuranceDLService.GetPatientBillingContext(patientId)
      .map(res => res);
  }

  public GetOrganizationList() {
    return this.insuranceDLService.GetOrganizationList()
      .map((responseData => {
        return responseData;
      }))
  }

  public GetVisitList(claimCode: number, patId: number) {
    return this.insuranceDLService.GetVisitList(claimCode, patId)
      .map(res => res);
  }

  public GetPatientVisits_Today(patientId: number) {
    return this.insuranceDLService.GetPatientVisitList_Today(patientId)
      .map(res => res);
  }
  // getting the CountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.insuranceDLService.GetCountrySubDivision(countryId)
      .map(res => { return res })

  }
  public GetInPatientDetailForPartialBilling(patId: number, patVisitId: number) {
    return this.insuranceDLService.GetInPatientDetailForPartialBilling(patId, patVisitId)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetClaimCode() {
    return this.insuranceDLService.GetClaimCode()
      .map((responseData) => {
        return responseData;
      });
  }
  public GetOldClaimcode(patId: number) {
    return this.insuranceDLService.GetOldClaimcode(patId)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetActiveEmployeesList() {
    return this.insuranceDLService.GetActiveEmployeesList()
      .map(res => res);
  }

  public GetDoctorsList() {
    return this.insuranceDLService.GetDoctorsList()
      .map(res => res);
  }
  //get the list of patient visit provider wise
  public GetPatientVisitsProviderWise(patientId: number) {
    return this.insuranceDLService.GetPatientVisitsProviderWise(patientId)
      .map(res => res);
  }
  public GetDataOfInPatient(patId: number, visitId: number) {
    return this.insuranceDLService.GetDataOfInPatient(patId, visitId)
      .map(res => {
        return res
      })
  }
  public GetInsuranceBillingItems() {
    return this.insuranceDLService.GetInsuranceBillingItems()
      .map((responseData) => {
        return responseData;
      });
  }
  public GetPatientPastBillSummary(patientId: number) {
    return this.insuranceDLService.GetPatientPastBillSummary(patientId)
      .map((responseData) => {
        return responseData;
      })
  }
  // Load the Deposit amount of the Patient 
  public GetDepositFromPatient(patientId: number) {
    return this.insuranceDLService.GetDepositFromPatient(patientId)
      //.map(res => res);
      .map((responseData) => {
        return responseData;
      })
  }
  //check for dependencies before removing this. 
  public GetProviderList() {
    return this.insuranceDLService.GetProviderList()
      .map(res => res);
  }

  public DischargePatientWithZeroItem(obj: any) {
    let data = JSON.stringify(obj);
    return this.insuranceDLService.DischargePatientWithZeroItem(data)
      .map(res => res);
  }

  //Group Discount on Billingtransaction:: Yubraj 29th Nov '18
  public UpdateBillTxnItems(modifiedItems: Array<BillingTransactionItem>) {
    let txnItems: Array<any> = modifiedItems.map(bil => {
      return _.omit(bil, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment']);
    });
    let tempBillTxnItems = Object.assign({}, modifiedItems);
    tempBillTxnItems = txnItems;
    return this.insuranceDLService.PutBillTxnItems(tempBillTxnItems)
      .map((responseData) => {
        return responseData;
      })
  }

  public UpdateBillItem_PriceQtyDiscNDoctor(billTxnItem) {
    let itmToSend = _.omit(billTxnItem, ['ItemList', 'BillingTransactionItemValidator', 'Patient', 'ServiceDepartment'])

    return this.insuranceDLService.UpdateBillItem_PriceQtyDiscNDoctor(itmToSend)
      .map(res => res);
  }
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

    return this.insuranceDLService.CancelMultipleBillTxnItems(billTransItemTemp)
      .map(res => res);
  }
  //POST:
  //Post Visit data to Database with Patient, BillTransaction, BillTransactionItems and Patient details
  public PostVisitToDB(currentVisit: QuickVisitVM) {

    let clonedObject = cloneDeep(currentVisit);
    var visitData = _.omit(currentVisit, [
      'QuickAppointmentValidator',
      'Patient.PatientValidator',
      'Visit.VisitValidator',
      'Patient.Guarantor',
      'Patient.CountrySubDivision',
    ]);


    let txnItms = currentVisit.BillingTransaction.BillingTransactionItems.map(itm => {
      return _.omit(itm, ['BillingTransactionItemValidator', 'Patient']);
    });
    var currVisit = visitData;
    currVisit.BillingTransaction.BillingTransactionItems = txnItms;

    let visDataJson = JSON.stringify(currVisit);


    //Once we create the Json, we need to reassign the validators since it'll give Form-Instance 'control' not defined error
    //when server responds with Failed status.
    currentVisit.Patient.PatientValidator = clonedObject.Patient.PatientValidator;
    currentVisit.Visit.VisitValidator = clonedObject.Visit.VisitValidator;

    //currentVisit.QuickAppointmentValidator = clonedObject.QuickAppointmentValidator;

    return this.insuranceDLService.PostVisitToDB(visDataJson)
      .map(res => res);
  }
  //this function is used in return visit billing during transfer visit case.
  public PostReturnTransaction(billingTransaction: BillingTransaction, returnRemarks: string) {
    let input = new FormData();

    let returnReceipt = new BillInvoiceReturnModel();
    returnReceipt.RefInvoiceNum = billingTransaction.InvoiceNo;
    returnReceipt.PatientId = billingTransaction.PatientId;
    returnReceipt.BillingTransactionId = billingTransaction.BillingTransactionId;
    returnReceipt.SubTotal = billingTransaction.SubTotal;
    returnReceipt.DiscountAmount = billingTransaction.DiscountAmount;
    returnReceipt.TaxableAmount = billingTransaction.TaxableAmount;
    returnReceipt.TaxTotal = billingTransaction.TaxTotal;
    returnReceipt.TotalAmount = billingTransaction.TotalAmount;
    returnReceipt.Remarks = returnRemarks;
    returnReceipt.CounterId = this.securityService.getLoggedInCounter().CounterId;
    returnReceipt.IsActive = true;
    returnReceipt.InvoiceCode = billingTransaction.InvoiceCode;
    returnReceipt.TaxId = billingTransaction.TaxId;
    returnReceipt.Tender = billingTransaction.Tender;

    var data = JSON.stringify(returnReceipt);
    input.append("billInvReturnModel", data);

    return this.insuranceDLService.PostReturnReceipt(input)
      .map(res => res);
  }
  public PostFreeFollowupVisit(fwUpVisit: Visit, parentVisitId: number) {

    let fwUpVisToPost = new Visit();
    fwUpVisToPost.PatientId = fwUpVisit.PatientId;
    fwUpVisToPost.ProviderId = fwUpVisit.ProviderId;
    fwUpVisToPost.ProviderName = fwUpVisit.ProviderName;
    fwUpVisToPost.DepartmentId = fwUpVisit.DepartmentId;
    fwUpVisToPost.AppointmentType = ENUM_AppointmentType.followup;
    fwUpVisToPost.VisitType = ENUM_VisitType.outpatient;
    fwUpVisToPost.VisitStatus = ENUM_VisitStatus.initiated;
    fwUpVisToPost.ParentVisitId = parentVisitId;

    fwUpVisToPost.VisitDate = moment().format('YYYY-MM-DD');
    fwUpVisToPost.VisitTime = moment().add((5 - moment().minute() % 5), 'minutes').format('HH:mm');
    fwUpVisToPost.IsActive = true;
    fwUpVisToPost.BillingStatus = ENUM_BillingStatus.free;//sud:9Aug
    fwUpVisToPost.VisitDuration = 0;

    //added createdon and createdby for fwup visit-sud:26une'19
    fwUpVisToPost.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    fwUpVisToPost.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

    //used to post billingtransaction during transfer and referral
    fwUpVisToPost.CurrentCounterId = this.securityService.getLoggedInCounter().CounterId;
    fwUpVisToPost.ClaimCode = fwUpVisit.ClaimCode;
    var tempVisitModel = _.omit(fwUpVisToPost, ['VisitValidator']);
    return this.insuranceDLService.PostFreeFollowupVisit(tempVisitModel);
  }
  public PostPaidFollowupVisit(fwupVisit: QuickVisitVM) {


    let clonedObject = cloneDeep(fwupVisit);

    var visitData = _.omit(fwupVisit, [
      'QuickAppointmentValidator',
      'Patient.PatientValidator',
      'Visit.VisitValidator',
      'Patient.Guarantor',
      'Patient.CountrySubDivision',
    ]);

    let txnItms = fwupVisit.BillingTransaction.BillingTransactionItems.map(itm => {
      return _.omit(itm, ['BillingTransactionItemValidator', 'Patient']);
    });

    var currVisit = visitData;
    currVisit.BillingTransaction.BillingTransactionItems = txnItms;


    let visDataJson = JSON.stringify(currVisit);
    //Once we create the Json, we need to reassign the validators since it'll give Form-Instance 'control' not defined error
    //when server responds with Failed status.
    fwupVisit.Patient.PatientValidator = clonedObject.Patient.PatientValidator;
    fwupVisit.Visit.VisitValidator = clonedObject.Visit.VisitValidator;

    return this.insuranceDLService.PostPaidFollowupVisit(visDataJson)
      .map(res => res);

  }
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
      }
      else if (integrationName == "LAB" && !billingTransactionItems[s].RequisitionId) {
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
    let imgItems = this.GetImagingItemsMapped(imgingItems, orderStatus, billStatus, wardName, insuranceApplicable); //after mapping imaging items

    //added: Ashim: 23Sep2018 : Added for OPD from BillingTransaction.
    let visititems = this.GetVisitItemsMapped(visitItems, orderStatus, billStatus);
    let deptHttpRequests = [];
    let dptRequestIndexes = [];
    let currIndex = 0;
    if (labItms && labItms.length > 0) {
      deptHttpRequests.push(this.insuranceDLService.PostToRequisition(labItms).map(res => res));
      dptRequestIndexes.push({ dptName: "lab", index: currIndex });
      currIndex++;
    }
    if (imgItems && imgItems.length > 0) {
      deptHttpRequests.push(this.insuranceDLService.PostRequestItems(imgItems).map(res => res));
      dptRequestIndexes.push({ dptName: "radiology", index: currIndex });
      currIndex++;
    }
    if (visititems && visititems.length > 0) {
      deptHttpRequests.push(this.insuranceDLService.PostVisitsFromBillingTransaction(visititems).map(res => res));
      dptRequestIndexes.push({ dptName: "visit", index: currIndex });
      currIndex++;
    }
    //if noRequisition to department then return EMPTY-Observable.
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
              //This is added to Use Distinct RequisitionId for same tests requested Multiple times at a same time
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

              //This is added to Use Distinct RequisitionId for same tests requested Multiple times at a same time
              var index = imgResponseResults.findIndex(val => val.ImagingRequisitionId == imgItm.ImagingRequisitionId);
              imgResponseResults = imgResponseResults.splice(index, 1);

            }
          }
          //ashim: 24Sep2018, modifications of ER visit.
          if (visitResponse && visitResponse.Results.length > 0) {
            let visitResponseResults: Array<Visit> = visitResponse.Results;


            let erVisItem = visitResponseResults.find(visit => billItem.ItemName.toLowerCase() == "emergency registration"
              && visit.ProviderId == billItem.ProviderId);
            if (erVisItem && !billItem.RequisitionId) {
              billItem.RequisitionId = erVisItem.PatientVisitId;
              billItem.PatientVisitId = erVisItem.PatientVisitId;
              let index = visitResponse.Results.findIndex(a => a.PatientVisitId == erVisItem.PatientVisitId);
              visitResponse.Results.splice(index, 1);//sud:13Oct'19-- Why are we splicing it ????
            }

            //integrationName == "OPD" && billingTransactionItems[s].ItemName.toLowerCase() == "consultation charge"
            let opVisitItem = visitResponseResults.find(visit => billItem.SrvDeptIntegrationName == "OPD"
              && visit.ProviderId == billItem.ProviderId);
            if (opVisitItem && !billItem.RequisitionId) {
              billItem.RequisitionId = opVisitItem.PatientVisitId;
              //billItem.PatientVisitId = opVisitItem.PatientVisitId;//I think we shouldn't add different visitIds for same package. <needs revision> sud:13-Oct'19
              let index = visitResponse.Results.findIndex(a => a.PatientVisitId == opVisitItem.PatientVisitId);
              visitResponse.Results.splice(index, 1);
            }

          }
        });

        return { Status: billingTransactionItems.length > 0 ? "OK" : "Failed", Results: billingTransactionItems };
      });
    }
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
    return this.insuranceDLService.PostBillingTransactionItems(billTransItemTemp)

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
    return this.insuranceDLService.PostIpBillingTransaction(billTxn)
      .map((responseData) => {
        return responseData;
      });
  }
  public PostBillingDeposit(deposit: BillingDeposit) {
    return this.insuranceDLService.PostBillingDeposit(deposit)
      .map((responseData) => {
        return responseData;
      });
  }


  public ProceedToOpInsuranceBilling(billingTransaction:BillingTransaction,billingTransactionItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string, insuranceApplicable: boolean, currPatVisitContext?: CurrentVisitContextVM){
    
  let labItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for lab department items
  let imgingItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();//local variable for Imaging/Radiology department
  let visitItems: Array<BillingTransactionItem> = new Array<BillingTransactionItem>();
  let BillingTransactionPostObj: BillingTransactionPost = new BillingTransactionPost();

  billingTransaction.BillingTransactionItems = new Array<BillingTransactionItem>();
  for (let i = 0; i < billingTransactionItems.length; i++) {
    billingTransaction.BillingTransactionItems.push(new BillingTransactionItem());
    billingTransaction.BillingTransactionItems[i] = Object.assign(billingTransaction.BillingTransactionItems[i], billingTransactionItems[i]);
  }

  for (var s = 0; s < billingTransaction.BillingTransactionItems.length; s++) {
    let integrationName = this.coreService.GetServiceIntegrationName(billingTransaction.BillingTransactionItems[s].ServiceDepartmentName);
    integrationName = integrationName ? integrationName.toLowerCase() : '';
    billingTransaction.BillingTransactionItems[s].ItemIntegrationName = integrationName;
   

    if (integrationName == "radiology" && !billingTransaction.BillingTransactionItems[s].RequisitionId) {
      imgingItems.push(billingTransaction.BillingTransactionItems[s]);
    }
    else if (integrationName == "lab" && !billingTransaction.BillingTransactionItems[s].RequisitionId) {
      labItems.push(billingTransaction.BillingTransactionItems[s]);    //Push only Lab items
    }

    else if (integrationName == "er" && billingTransaction.BillingTransactionItems[s].ItemName.toLowerCase() == "emergency registration" && !billingTransaction.BillingTransactionItems[s].RequisitionId) {
      visitItems.push(billingTransaction.BillingTransactionItems[s]); //push only opd items.
    }
    else if (integrationName == "opd" && billingTransaction.BillingTransactionItems[s].ItemName.toLowerCase() == "consultation charge") {
      visitItems.push(billingTransaction.BillingTransactionItems[s]); //push only opd items.
    }
  }

  let wardName = "outpatient";
    if (currPatVisitContext && currPatVisitContext.VisitType == "inpatient") {
      wardName = currPatVisitContext.Current_WardBed;
    }
    let labItms = this.GetLabItemsMapped(labItems, orderStatus, billStatus, wardName, insuranceApplicable); //after mapping lab items
    let imgItems = this.GetImagingItemsMapped(imgingItems, orderStatus, billStatus, wardName, insuranceApplicable); //after mapping imaging items

    let visititems = this.GetVisitItemsMapped(visitItems, orderStatus, billStatus);
    

    let radReq = JSON.stringify(imgItems);
    

  let txnItems = billingTransaction.BillingTransactionItems.map(function(item){
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
    billTxn = Object.assign({}, billingTransaction);
    billTxn.BillingTransactionItems = txnItems;

  BillingTransactionPostObj.LabRequisition = JSON.parse(labItms);
  BillingTransactionPostObj.ImagingItemRequisition = JSON.parse(radReq);
  BillingTransactionPostObj.VisitItems = JSON.parse(visititems);
  BillingTransactionPostObj.Txn = billTxn;

  if(BillingTransactionPostObj.Txn.BillingTransactionItems[0].BillStatus.toLocaleLowerCase() === "provisional"){
    return this.insuranceDLService.PostInsuranceProvisional(BillingTransactionPostObj)
    .map((responseData) => {
      return responseData;
    });
  }
  else{
    return this.insuranceDLService.PostInsuranceOpBilling(BillingTransactionPostObj)
    .map((responseData) => {
      return responseData;
    });
  }
  }

  public PostBillingTransaction(billTxnModel: BillingTransaction) {

    let billTransItemTemp = billTxnModel.BillingTransactionItems.map(function (item) {
      item.Patient = Patient.GetClone(item.Patient);
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
    return this.insuranceDLService.PostBillingTransaction(billTxn)
      .map((responseData) => {
        return responseData;
      });
  }

  //PUT:
  //once visit is created updating the appointment status
  public UpdateAppointmentStatus(appointmentId: number, status: string, providerId: number, providerName: string) {
    return this.insuranceDLService.PutAppointmentStatus(appointmentId, status, providerId, providerName)
      .map((responseData) => {
        return responseData;
      });
  }
  //update PrintCount for print on Billingtransaction
  public PutPrintCount(printCount: number, billingTransactionId: number) {
    return this.insuranceDLService.PutPrintCount(printCount, billingTransactionId)
      .map((responseData) => {
        return responseData;
      })
  }
  //new visit
  public UpdateProcedure(admissionPatId, ProcedureType) {
    return this.insuranceDLService.UpdateProcedure(admissionPatId, ProcedureType)
      .map((responseData) => {
        return responseData;
      })
  }

  //older code
  // public UpdateBedDurationBillTxn(bedDurationDetail: Array<BedDurationTxnDetailsVM>) {
  //   return this.insuranceDLService.PutBedDurationBillTxn(bedDurationDetail)
  //     .map(res => res);
  // }

  public UpdateBedDurationBillTxn(visitId: number) {
    return this.insuranceDLService.PutBedDurationBillTxn(visitId)
      .map(res => res);
  }

  public DischargePatient(dischargePatient: DischargeDetailBillingVM) {
    return this.insuranceDLService.DischargePatient(dischargePatient)
      .map(res => res);
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
        OrderDateTime: bill.CreatedOn,
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
        HasInsurance: insuranceApplicable,
        SampleCollectedOnDateTime: null,
        BillCancelledBy: null,
        BillCancelledOn: null,
        LabTypeName: bill.LabTypeName,
        IsSmsSend: null,
        IsSelected: false
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
  public GetImagingItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string, wardName: string, insuranceApplicable: boolean): Array<ImagingItemRequisition> {
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
        HasInsurance: insuranceApplicable,//sud:21Jul'19--For Insurnace
        WardName: wardName
      });
    });

    return imgItems;
  }

  public GetVisitItemsMapped(billItems: Array<BillingTransactionItem>, orderStatus: string, billStatus: string): string {

    if (billItems && billItems.length) {
      let currentUser: number = this.securityService.GetLoggedInUser().EmployeeId;//logged in doctor
      let visitItems: Array<any> = new Array<any>();
      billItems.forEach(bill => {
        let visit = new Visit();

        visit.PatientId = bill.PatientId;
        if (bill.ItemName.toLowerCase() == "emergency registration")
          visit.VisitType = ENUM_VisitType.emergency;// "emergency";
        else
          visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";


        //sud:26Aug'19--To Assign Departments to VisitDoctors.
        let doctorList = DanpheCache.GetData(MasterType.Employee, null);

        if (doctorList && doctorList.length > 0) {
          let currDoc = doctorList.find(d => d.EmployeeId == bill.ProviderId);
          if (currDoc) {
            visit.DepartmentId = currDoc.DepartmentId;
          }
        }

        // visit.DepartmentId = bill.RequestingDeptId;
        visit.ProviderId = bill.ProviderId;
        visit.ProviderName = bill.ProviderName;
        visit.BillingStatus = billStatus;
        visit.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
        visit.CreatedOn = moment().format('YYYY-MM-DDTHH:mm');
        visit.AppointmentType = ENUM_AppointmentType.new;// "New";
        visit.CreatedBy = currentUser;
        var tempVisitModel = _.omit(visit, ['VisitValidator']);
        visitItems.push(tempVisitModel);
      });

      return JSON.stringify(visitItems);
    }
    else {
      return null;
    }

  }
}
