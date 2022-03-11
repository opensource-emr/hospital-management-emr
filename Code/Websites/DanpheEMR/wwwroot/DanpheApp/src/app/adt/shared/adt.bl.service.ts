import { Injectable, Directive } from '@angular/core';
import { Admission } from './admission.model';
import { PatientBedInfo } from './patient-bed-info.model';
import { DischargeSummary } from '../shared/discharge-summary.model';
import { ADT_DLService } from './adt.dl.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { ImagingDLService } from '../../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../../labs/shared/labs.dl.service';
import { BillingDLService } from '../../billing/shared/billing.dl.service';
import { Employee } from "../../employee/shared/employee.model";
import { BillingDeposit } from '../../billing/shared/billing-deposit.model';
import { Visit } from '../../appointments/shared/visit.model';
import { BillingTransactionItem } from '../../billing/shared/billing-transaction-item.model';
import * as moment from 'moment/moment';
import * as _ from 'lodash';
import { AdmissionCancelVM, AdmittingDocInfoVM } from './admission.view.model';
import { CoreService } from "../../core/shared/core.service";
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { PatientBedInfoVM } from '../shared/admission.view.model';
import { DischargeCancel } from '../shared/dischage-cancel.model';
import { ENUM_BillingStatus, ENUM_VisitStatus, ENUM_AppointmentType, ENUM_VisitType } from '../../shared/shared-enums';
import { BedReservationInfo } from './bed-reservation-info.model';
import { BillingTransaction } from '../../billing/shared/billing-transaction.model';

@Injectable()
export class ADT_BLService {
  public currencyUnit: string = "";

  constructor(public coreService: CoreService,
    public msgBoxServ: MessageboxService,
    public admissionDLService: ADT_DLService,
    public visitDLService: VisitDLService,
    public imagingDLService: ImagingDLService,
    public labsDLService: LabsDLService,
    public billingDLService: BillingDLService) {
    this.GetCurrencyUnit;
  }
  public GetBillItemList(srvItemsList?: Array<number>, itemIdList?: Array<number>) {
    let srvItemsListStr = "";
    let itemIdListStr = "";
    if (srvItemsList && srvItemsList.length) { srvItemsListStr = JSON.stringify(srvItemsList); }
    if (itemIdList && itemIdList.length) { itemIdListStr = JSON.stringify(itemIdList); }
    return this.visitDLService.GetBillItemList(srvItemsListStr, itemIdListStr);
  }
  public GetCurrencyUnit() {
    var currParameter = this.coreService.Parameters.find(a => a.ParameterName == "Currency")
    if (currParameter)
      this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
    else
      this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
  }
  public GetAdmittedPatients() {
    let admissionStatus = "admitted";
    return this.admissionDLService.GetADTList(admissionStatus)
      .map(res => { return res })
  }
  public GetPatients(searchTxt) {
    return this.admissionDLService.GetPatientList(searchTxt)
      .map(res => { return res })
  }

  //sud:29Nov--Needed Separate API to get the patient list quicker.
  public GetPatientListForADT(searchTxt) {
    return this.admissionDLService.GetPatientListForADT(searchTxt)
      .map(res => { return res })
  }
  public GetPatientDeposits(patId) {
    return this.billingDLService.GetDepositFromPatient(patId)
      .map(res => { return res })
  }

  public IsPatientAdmitted(patientId: number) {
    return this.admissionDLService.GetCheckPatientAdmission(patientId)
      .map(res => { return res })
  }
  public CheckPatProvisionalInfo(patientId: number) {
    return this.admissionDLService.CheckPatProvisionalInfo(patientId)
      .map(res => { return res })
  }
  public GetWards() {
    return this.admissionDLService.GetWards()
      .map(res => { return res })
  }
  public GetWardBedFeatures(wardId: number) {
    return this.admissionDLService.GetWardBedFeatures(wardId)
      .map(res => { return res })
  }

  public GetAdmittedPatientInfo(patientVisitId: number) {
    return this.admissionDLService.GetAdmittedPatInfo(patientVisitId)
      .map(res => { return res })
  }

  public GetSimilarBedFeatures(ward: number, bedFeatureId: number) {
    return this.admissionDLService.GetSimilarBedFeatures(ward, bedFeatureId)
      .map(res => { return res })
  }
  public GetAvailableBeds(wardId: number, bedFeatureId: number) {
    return this.admissionDLService.GetAvailableBeds(wardId, bedFeatureId)
      .map(res => { return res })
  }
  public GetDischargeSummary(patientVisitId: number) {
    return this.admissionDLService.GetDischargeSummary(patientVisitId)
      .map(res => res);
  }
  public GetAdmittingDoctor() {
    return this.admissionDLService.GetAdmittingDocInfo()
      .map(res => res);
  }

  public CheckAdmissionCancelled(cancelAdmission: AdmissionCancelVM) {
    return this.admissionDLService.CheckAdmissionCancelled(cancelAdmission)
      .map(res => res);
  }

  public GetDischargeType() {
    return this.admissionDLService.GetDischargeType()
      .map(res => res);
  }
  public GetLabReportByVisitId(patientVisitId: number) {
    return this.labsDLService.GetReportByPatientVisitId(patientVisitId)
      .map(res => res);
  }
  public GetImagingReportsReportsByVisitId(patientVisitId: number) {
    return this.imagingDLService.GetPatientVisitReports(patientVisitId)
      .map(res => res);
  }
  public CheckPatientCreditBillStatus(patientVisitId: number) {
    return this.billingDLService.GetCreditBalanceByPatientId(patientVisitId)
      .map(res => res);
  }

  public GetProviderList() {

    return this.visitDLService.GetVisitDoctors()
      .map(res => { return res });

    //sud:20Sept'19-- we need providername, dept etc, which was not coming from below api,
    //so using above api from visit service.
    //return this.admissionDLService.GetProviderList()
    //  .map(res => { return res });
  }

  public GetDocDptAndWardList(patId: number, visitId: number) {
    return this.admissionDLService.GetDocDptAndWardList(patId, visitId)
      .map(res => { return res });
  }

  //get list of employee from Anasthetists dept
  public GetAnasthetistsEmpList() {
    return this.admissionDLService.GetAnasthetistsEmpList()
      .map(res => { return res });
  }
  public GetDischargedPatientsList(fromDt, toDt) {
    let admissionStatus = "discharged"
    return this.admissionDLService.GetDischargedPatientsList(admissionStatus, fromDt, toDt)
      .map(res => { return res });
  }
  // for discharge summary
  public GetAdmittedPatientsList(fromDt, toDt) {
    let admissionStatus = "admitted"
    return this.admissionDLService.GetAdmittedPatientsList(admissionStatus, fromDt, toDt)
      .map(res => { return res });
  }
  public GetPatientPlusBedInfo(PatientId, PatientVisitId) {

    return this.admissionDLService.GetPatientPlusBedInfo(PatientId, PatientVisitId)
      .map(res => { return res });
  }
  //gets only the requisitions made on give visits: added for temporary purpose (to display in discharge-summary, remove later if not required)  sud: 9Aug'17
  public GetLabRequestsByPatientVisit(patientId: number, patientVisitId: number) {
    return this.labsDLService.GetRequisitionsByPatientVisitId(patientId, patientVisitId)
      .map(res => res);
  }

  public GetAdmissionBillItems() {
    return this.admissionDLService.GetAdmissionBillItems()
      .map(res => { return res });
  }

  public GetBedChargeBilItem(patId, patVisitId) {
    return this.admissionDLService.GetBedChargeBillItem(patId, patVisitId)
      .map(res => { return res });
  }
  public GetAllWardBedInfo() {
    return this.admissionDLService.GetAllWardBedInfo()
      .map(res => { return res });
  }
  public GetNewClaimcode() {
    return this.admissionDLService.GetNewClaimcode()
      .map(res => { return res });
  }
  public GetOldClaimcode(patId: number) {
    return this.admissionDLService.GetOldClaimcode(patId)
      .map(res => { return res });
  }
  public GetInsVisitList(claimCode: number, patId: number) {
    return this.admissionDLService.GetInsVisitList(claimCode, patId)
      .map(res => res);
  }
  public PostAdmission(currentAdmission: Admission, currentPatientBedInfo: PatientBedInfo, currentDeposit: BillingDeposit, billTransaction: BillingTransaction) {
    currentAdmission.AdmissionStatus = "admitted";
    currentPatientBedInfo.Action = "admission";
    var tempAdmission: any;
    tempAdmission = _.omit(currentAdmission, ['AdmissionValidator']);
    var tempBedInfo = _.omit(currentPatientBedInfo, ['PatientBedInfoValidator']);

    billTransaction.BillingTransactionItems.forEach((b, i) => {
      let dt = b;
      let omitedDt = _.omit(dt, ['BillingTransactionItemValidator', 'Patient']);
      billTransaction.BillingTransactionItems[i] = omitedDt;
    });

    tempAdmission.PatientBedInfos.push(tempBedInfo);
    tempAdmission.BilDeposit = currentDeposit;
    tempAdmission.BillingTransaction = billTransaction;
    //let billTransItemTemp = bilItms.map(function (item) {
    //    var temp = _.omit(item, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
    //    return temp;
    //});
    //tempAdmission.BilTxnItems = billTransItemTemp;

    return this.admissionDLService.PostAdmission(tempAdmission)
      .map((responseData) => {
        return responseData;
      });
  }

  public PostVisitForAdmission(currentAdmission: Admission) {
    let VisitItems: Visit = new Visit();

    VisitItems.PatientId = currentAdmission.PatientId;
    VisitItems.VisitType = ENUM_VisitType.inpatient;// "inpatient";
    VisitItems.ProviderId = currentAdmission.AdmittingDoctorId;
    VisitItems.BillingStatus = ENUM_BillingStatus.unpaid;// "unpaid";
    VisitItems.VisitStatus = ENUM_VisitStatus.initiated;// "initiated";
    VisitItems.CreatedOn = moment().format('YYYY-MM-DDTHH:mm');
    VisitItems.AppointmentType = ENUM_AppointmentType.new;// "New";
    VisitItems.CreatedBy = currentAdmission.CreatedBy;
    VisitItems.VisitDate = moment(currentAdmission.AdmissionDate).format("YYYY-MM-DD");
    VisitItems.VisitTime = moment(currentAdmission.AdmissionDate).format("HH:mm");
    var tempVisitModel = _.omit(VisitItems, ['VisitValidator']);
    return this.visitDLService.PostVisit(tempVisitModel)
      .map(res => res)
  }

  public PostDischargeSummary(dischargeSummary: DischargeSummary) {
    var tempVisitModel = _.omit(dischargeSummary, ['DischargeSummaryValidator']);
    return this.admissionDLService.PostDischargeSummary(tempVisitModel)
      .map(res => res)
  }
  public PostDischargeCancelBill(dischargeCancel: DischargeCancel) {
    var cancelModel = _.omit(dischargeCancel, ['DischargeCancelValidator']);
    return this.admissionDLService.PostDischargeCancelBill(cancelModel)
      .map(res => res);
  }
  public PostAdmissionRemark(admission: AdmissionCancelVM) {
    var tempAdmissionCancel = _.omit(AdmissionCancelVM, ['AdmissionValidator']);
    return this.admissionDLService.PostAdmissionRemark(tempAdmissionCancel)
      .map(res => res)
  }

  public PostADTBedReservation(bedreservedInfo: BedReservationInfo, actionForDpt: string) {
    var data = _.omit(bedreservedInfo, ['BedReservationInfoValidator']);
    return this.admissionDLService.PostADTBedReservation(data, actionForDpt)
      .map(res => res)
  }

  public DischargePatient(admission: Admission, bedInfoId: number) {
    admission.AdmissionStatus = "discharged";
    var tempAdmission: any;
    tempAdmission = _.omit(admission, ['AdmissionValidator', 'BilTxnItems']);
    return this.admissionDLService.PutPatientDischarge(tempAdmission, bedInfoId)
      .map((responseData) => {
        return responseData;
      });

  }
  public TransferBed(patBedInfo: PatientBedInfo, prevBedInfoId: number, bilItm: BillingTransactionItem, transferredFrom: string = "") {
    patBedInfo.Action = "transfer";
    var tempBedInfo = _.omit(patBedInfo, ['PatientBedInfoValidator']);
    var tempBilItm = _.omit(bilItm, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
    tempBedInfo['BedChargeBilItm'] = tempBilItm;
    return this.admissionDLService.PutPatientBedInfo(tempBedInfo, prevBedInfoId, transferredFrom)
      .map((responseData) => {
        return responseData;
      });
  }
  //Hom
  public UpdateAdmittedPatientInfo(admittedPatInfo: PatientBedInfoVM) {
    return this.admissionDLService.PutAdmissionDates(admittedPatInfo)
      .map((responseData) => {
        return responseData;
      });
  }
  public ChangeAdmittingDoc(admittingDocInfo: AdmittingDocInfoVM) {
    return this.admissionDLService.PutAdmittingDoctor(admittingDocInfo)
      .map((responseData) => {
        return responseData;
      });
  }
  public UpgradeBedFeature(patBedInfo: PatientBedInfo, prevBedInfoId: number, bilItm: BillingTransactionItem, transferredFrom: string = "") {
    patBedInfo.Action = "upgrade";
    var tempBedInfo = _.omit(patBedInfo, ['PatientBedInfoValidator']);
    var tempBilItm = _.omit(bilItm, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
    tempBedInfo['BedChargeBilItm'] = tempBilItm;
    return this.admissionDLService.PutPatientBedInfo(tempBedInfo, prevBedInfoId, transferredFrom)
      .map((responseData) => {
        return responseData;
      });
  }

  public UpdateDischargeSummary(dischargeSummary: DischargeSummary) {
    //to fix serializaiton problem in server side
    if (dischargeSummary.CreatedOn)
      dischargeSummary.CreatedOn = moment(dischargeSummary.CreatedOn).format('YYYY-MM-DD HH:mm');
    if (dischargeSummary.ModifiedOn)
      dischargeSummary.ModifiedOn = moment(dischargeSummary.ModifiedOn).format('YYYY-MM-DD HH:mm');
    var tempVisitModel = _.omit(dischargeSummary, ['DischargeSummaryValidator']);
    return this.admissionDLService.PutDischargeSummary(tempVisitModel)
      .map(res => { return res });
  }

  public UpdateADTBedReservation(bedToBeUpdatedInfo: BedReservationInfo, actionForDpt: string) {
    var data = _.omit(bedToBeUpdatedInfo, ['BedReservationInfoValidator']);
    return this.admissionDLService.UpdateADTBedReservation(data, actionForDpt)
      .map(res => res)
  }

  public CancelADTBedReservation(reservationIdToCancel: number, actionForDpt: string) {
    return this.admissionDLService.CancelADTBedReservation(reservationIdToCancel, actionForDpt)
      .map(res => res)
  }

  public ClearDue(ipVisitId: number) {
    //admission.BillStatusOnDischarge = "paid";
    //var tempAdmission: any;
    //tempAdmission = _.omit(admission, ['AdmissionValidator']);
    return this.admissionDLService.PutAdmissionClearDue(ipVisitId)
      .map((responseData) => {
        return responseData;
      });
  }

  //sud: 20Jun'18
  public GetDepartments() {
    return this.admissionDLService.GetDepartments()
      .map(res => res);
  }

  //sud:7Jan'19--to save wristband html file to server for printing..
  SaveWristBandHtmlFile(printerName: string, filePath: string, wristBandHtmlContent: string) {
    return this.admissionDLService.PostWristBandStickerHTML(printerName, filePath, wristBandHtmlContent)
      .map(res => {
        return res;
      });
  }
  GetAdmissionHistory(patinetId) {
    return this.admissionDLService.GetAdmissionHistory(patinetId).map(res => res);
  }

}


