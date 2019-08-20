import { Visit } from './visit.model';
import { Employee } from '../../employee/shared/employee.model';
import { Injectable, Directive } from '@angular/core';
import { VisitDLService } from './visit.dl.service';
import { AppointmentDLService } from './appointment.dl.service';
import { BillItemRequisition } from '../../billing/shared/bill-item-requisition.model';
import { BillingDLService } from '../../billing/shared/billing.dl.service';
import { SecurityService } from '../../security/shared/security.service';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import * as _ from 'lodash';
import * as cloneDeep from 'lodash/cloneDeep';
import * as moment from 'moment/moment';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';
import { BillInvoiceReturnModel } from '../../billing/shared/bill-invoice-return.model';
import { QuickVisitVM } from './quick-visit-view.model';

@Injectable()
export class VisitBLService {

  constructor(public visitDLService: VisitDLService,
    public billingDLService: BillingDLService,
    public appointmentDLService: AppointmentDLService,
    public patientDLService: PatientsDLService,
    public securityService: SecurityService) { }

  //gets all the visit of a patient
  public GetPatientVisits(patientId: number) {
    return this.visitDLService.GetPatientVisitList(patientId)
      .map(res => res);
  }

  public GetPatientVisitList(patientId: number) {
    return this.visitDLService.GetPatientVisitList(patientId)
      .map(res => res);
  }

  public GetPatientVisits_Today(patientId: number) {
    return this.visitDLService.GetPatientVisitList_Today(patientId)
      .map(res => res);
  }



  public GetVisitList(claimCode: string) {
    return this.visitDLService.GetVisitList(claimCode)
      .map(res => res);
  }

  public GetPatientById(patientId: number) {
    return this.patientDLService.GetPatientById(patientId)
      .map(res => res);
  }
  public GetAdditionalBillingItems() {
    return this.visitDLService.GetAdditionalBillingItems()
      .map(res => res);
  }
  //post new visit
  public AddVisit(currentVisit: Visit) {
    currentVisit.VisitStatus = "initiated";
    var tempVisitModel = _.omit(currentVisit, ['VisitValidator']);
    return this.visitDLService.PostVisit(tempVisitModel)
      .map(res => res);
  }
  //get visit list according to status
  public GetVisitsByStatus(status: string, maxlimitdays: number) {
    //var status = "initiated";
    return this.visitDLService.GetVisitsByStatus(status, maxlimitdays)
      .map(res => res);
  }

  public GetDoctorOpdPrices() {
    return this.visitDLService.GetDoctorOpdPrices()
      .map(res => res);
  }
  //mapping to BillItemRequistion model and posting to BillingRequisitionItem Table
  //requested by is the employeeid of the frontdesk user. 
  public PostToBilling(visit: Visit, requestedBy: number) {
    let currentUser: number = 1;//logged in receptionist id--needs revision
    let billItems: Array<BillItemRequisition> = new Array<BillItemRequisition>();
    billItems.push({
      BillItemRequisitionId: 0,
      ItemId: visit.ProviderId,//itemid is set as providerid, needs revision.
      RequisitionId: visit.PatientVisitId,
      ProcedureCode: visit.ProviderId.toString(),
      //RequestedBy: requestedBy,
      PatientId: visit.PatientId,
      PatientVisitId: visit.PatientVisitId,
      ServiceDepartment: "OPD", //service department OPD by default for now
      DepartmentName: "OPD",
      ServiceDepartmentId: 0,
      Quantity: 1,
      ProviderId: visit.ProviderId,
      CreatedBy: this.securityService.GetLoggedInUser().EmployeeId,
      CreatedOn: moment().format('YYYY-MM-DD'),
      ItemName: null,
      Price: 0,////check for proper price and change it later.
      AssignedTo: visit.ProviderId //need to change this later on.. sud: 20may
    });

    return this.billingDLService.PostBillingItemRequisition(billItems)
      .map(bill => bill);
  }

  //once visit is created updating the appointment status
  public UpdateAppointmentStatus(appointmentId: number, status: string) {
    return this.appointmentDLService.PutAppointmentStatus(appointmentId, status)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetVisitInfoforStickerPrint(PatientVisitId: number) {
    return this.visitDLService.GetVisitInfoforStickerPrint(PatientVisitId)
      .map((responseData) => {
        return responseData;
      });
  }


  public GetDoctorList(departmentId: number) {
    return this.appointmentDLService.GetDoctorFromDepartmentId(departmentId)
      .map(res => res);
  }
  public GetDepartmentList() {
    return this.visitDLService.GetDepartmentList()
      .map(res => res);
  }
  public GetDepartmentByEmployeeId(employeeId: number) {
    return this.visitDLService.GetDepartmentByEmployeeId(employeeId)
      .map(res => res);
  }

  public ContinueNextVisit(visit: Visit, referredProvider: Employee, continuationType: string) {
    visit.ReferredByProviderId = continuationType == "followup" ? null : visit.ProviderId;
    visit.ParentVisitId = visit.PatientVisitId;

    visit.ProviderId = referredProvider ? referredProvider.EmployeeId : 0;
    visit.ProviderName = referredProvider ? referredProvider.FullName : null;
    visit.AppointmentType = continuationType;


    visit.VisitDate = moment().format('YYYY-MM-DD');
    visit.VisitTime = moment().add((5 - moment().minute() % 5), 'minutes').format('HH:mm');
    visit.VisitCode = null;
    visit.IsVisitContinued = false;
    visit.IsActive = true;
    visit.BillingStatus = 'paid';
    visit.VisitStatus = 'initiated';
    visit.VisitDuration = 0;
    //added createdon and createdby for referral visit--sud:19Aug
    visit.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    visit.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
    //used to post billingtransaction during transfer and referral
    visit.CurrentCounterId = this.securityService.getLoggedInCounter().CounterId;
    var tempVisitModel = _.omit(visit, ['VisitValidator', 'Patient']);
    return this.visitDLService.PostVisit(tempVisitModel)
      .map(res => res)
  }

  //Below Added by Nagesh
  //get doctors list using department Id  
  public GenerateDoctorList(departmentId: number) {
    return this.visitDLService.GetDoctorFromDepartmentId(departmentId)
      .map(res => res);
  }
  // getting the CountrySubDivision from dropdown
  public GetCountrySubDivision(countryId: number) {
    return this.patientDLService.GetCountrySubDivision(countryId)
      .map(res => { return res })
  }
  public GetCountries(countryId: number) {
    return this.patientDLService.GetCountries()
      .map(res => { return res })
  }
  //getting membership deatils by membershiptype id 
  public GetMembershipDeatilsByMembershipTyepId(membershipTypeId) {
    return this.visitDLService.GetMembershipDeatilsByMembershipTyepId(membershipTypeId)
      .map(res => { return res });
  }

  //It's no need -Nagesh
  //gets providers availablity using visitDate and ProviderId.
  //public ShowProviderAvailability(selProviderId: number, visitDate: string) {
  //    if ((visitDate != "" && visitDate != null) && (selProviderId != 0 && selProviderId != null)) {
  //        return this.visitDLService.GetProviderAvailability(selProviderId, visitDate)
  //            .map(res => res);
  //    }
  //    else {
  //        alert("select correct date and/or provider.");
  //    }
  //}

  //getting total amoutn opd by doctorId
  public GetTotalAmountByProviderId(providerId) {
    return this.visitDLService.GetTotalAmountByProviderId(providerId)
      .map(res => { return res });

  }
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

    return this.visitDLService.PostVisitToDB(visDataJson)
      .map(res => res);
  }


  //Get Matching Patient Details by FirstName,LastName,PhoneNumber for showing registered matching patient on Visit Creation time
  public GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, IsInsurance = false, IMISCode = null) {
    return this.patientDLService.GetExistedMatchingPatientList(FirstName, LastName, PhoneNumber, IsInsurance,IMISCode)
      .map(res => { return res });
  }
  //ashim: 17Aug'2018
  //this function is used in return visit billing during transfer visit case.
  public PostReturnTransaction(billingTransaction: BillingTransaction, returnRemarks: string) {
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
    return this.billingDLService.PostReturnReceipt(returnReceipt)
      .map(res => res);
  }
  public GetHealthCardBillItem() {
    return this.billingDLService.GetHealthCardBillItem().map(res => {
      return res
    });
  }

  public GetBillTxnByRequisitionId(requisitionId: number, patientId: number) {
    return this.billingDLService.GetBillTxnByRequisitionId(requisitionId, patientId, "OPD")
      .map(res => res);
  }

  public GetMemberShipTypes() {
    return this.patientDLService.GetMembershipTypes()
      .map(res => res);
  }
  public GetPatHealthCardStatus(patId: number) {
    return this.visitDLService.GetPatHealthCardStatus(patId)
      .map(res => res);
  }
  public GetPatientBillingContext(patientId: number) {
    return this.billingDLService.GetPatientBillingContext(patientId)
      .map(res => res);
  }

  public PostFreeReferralVisit(visit: Visit) {
    var visitData = _.omit(visit, [
      'VisitValidator'
    ]);




    let visitJson = JSON.stringify(visitData);
    return this.visitDLService.PostFreeReferralVisit(visitJson);
  }


  //sud: 19June'19--For Department OPD
  public GetDepartmentOpdItems() {
    return this.visitDLService.GetDepartmentOpdItems();
  }

  //sud: 21June'19--For Department followup
  public GetDepartmentFollowupItems() {
    return this.visitDLService.GetDepartmentFollowupItems();
  }


  //sud: 21June'19--For Doctor followup
  public GetDoctorFollowupItems() {
    return this.visitDLService.GetDoctorFollowupItems();
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDoctorOldPatientPrices() {
    return this.visitDLService.GetDoctorOldPatientPrices();
  }

  //sud: 31Jul'19-For Old Patient Opd
  public GetDepartmentOldPatientPrices() {
    return this.visitDLService.GetDepartmentOldPatientPrices();
  }
   
  public GetVisitDoctors() {
    return this.visitDLService.GetVisitDoctors();
  }

  public PostFreeFollowupVisit(fwUpVisit: Visit, parentVisitId: number) {

    let fwUpVisToPost = new Visit();
    fwUpVisToPost.PatientId = fwUpVisit.PatientId;
    fwUpVisToPost.ProviderId = fwUpVisit.ProviderId;
    fwUpVisToPost.ProviderName = fwUpVisit.ProviderName;
    fwUpVisToPost.DepartmentId = fwUpVisit.DepartmentId;
    fwUpVisToPost.AppointmentType = "followup";
    fwUpVisToPost.VisitType = "outpatient";
    fwUpVisToPost.VisitStatus = "Initiated";
    fwUpVisToPost.ParentVisitId = parentVisitId;

    fwUpVisToPost.VisitDate = moment().format('YYYY-MM-DD');
    fwUpVisToPost.VisitTime = moment().add((5 - moment().minute() % 5), 'minutes').format('HH:mm');
    fwUpVisToPost.IsActive = true;
    fwUpVisToPost.BillingStatus = 'paid';
    fwUpVisToPost.VisitDuration = 0;

    //added createdon and createdby for fwup visit-sud:26une'19
    fwUpVisToPost.CreatedOn = moment().format('YYYY-MM-DD HH:mm:ss');
    fwUpVisToPost.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;

    //used to post billingtransaction during transfer and referral
    fwUpVisToPost.CurrentCounterId = this.securityService.getLoggedInCounter().CounterId;
    var tempVisitModel = _.omit(fwUpVisToPost, ['VisitValidator']);
    return this.visitDLService.PostFreeFollowupVisit(tempVisitModel);
  }


  //Post Visit data to Database with Patient, BillTransaction, BillTransactionItems and Patient details
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

    return this.visitDLService.PostPaidFollowupVisit(visDataJson)
      .map(res => res);

  }




}
