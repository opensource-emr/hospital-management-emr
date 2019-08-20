import { Injectable, Directive } from '@angular/core';
import { Admission } from './admission.model';
import { PatientBedInfo } from './patient-bed-info.model';
import { DischargeSummary } from '../shared/discharge-summary.model';
import { AdmissionDLService } from './admission.dl.service';
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

@Injectable()
export class AdmissionBLService {
    public currencyUnit: string = "";

    constructor(public coreService: CoreService,
        public msgBoxServ: MessageboxService,
        public admissionDLService: AdmissionDLService,
        public visitDLService: VisitDLService,
        public imagingDLService: ImagingDLService,
        public labsDLService: LabsDLService,
        public billingDLService: BillingDLService) {
        this.GetCurrencyUnit;
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
    public GetPatients() {
        return this.admissionDLService.GetPatientList()
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

    public GetSimilarBedFeatures(bedId: number, bedFeatureId: number) {
        return this.admissionDLService.GetSimilarBedFeatures(bedId, bedFeatureId)
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
        return this.admissionDLService.GetProviderList()
            .map(res => { return res });
    }
    //get list of employee from Anasthetists dept
    public GetAnasthetistsEmpList() {
        return this.admissionDLService.GetAnasthetistsEmpList()
            .map(res => { return res });
    }
    public GetDischargedPatientsList() {
        let admissionStatus = "discharged"
        return this.admissionDLService.GetADTList(admissionStatus)
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

    public GetBedChargeBilItem(patId,patVisitId) {
        return this.admissionDLService.GetBedChargeBillItem(patId, patVisitId)
            .map(res => { return res });
    }

    public PostAdmission(currentAdmission: Admission, currentPatientBedInfo: PatientBedInfo, currentDeposit: BillingDeposit) {
        currentAdmission.AdmissionStatus = "admitted";
        currentPatientBedInfo.Action = "admission";
        var tempAdmission: any;
        tempAdmission = _.omit(currentAdmission, ['AdmissionValidator']);
        var tempBedInfo = _.omit(currentPatientBedInfo, ['PatientBedInfoValidator']);
        tempAdmission.PatientBedInfos.push(tempBedInfo);
        tempAdmission.BilDeposit = currentDeposit;
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
        VisitItems.VisitType = "inpatient";
        VisitItems.ProviderId = currentAdmission.AdmittingDoctorId;
        VisitItems.BillingStatus = "unpaid";
        VisitItems.VisitStatus = "initiated";
        VisitItems.CreatedOn = moment().format('YYYY-MM-DDTHH:mm');
        VisitItems.AppointmentType = "New";
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
    public PostDischargeCancelBill(dischargeCancel : DischargeCancel){
        var cancelModel = _.omit(dischargeCancel, ['DischargeCancelValidator']);
        return this.admissionDLService.PostDischargeCancelBill(cancelModel)
        .map(res =>res);
    }
    public PostAdmissionRemark(admission: AdmissionCancelVM) {
        var tempAdmissionCancel = _.omit(AdmissionCancelVM, ['AdmissionValidator']);
        return this.admissionDLService.PostAdmissionRemark(tempAdmissionCancel)
            .map(res => res)
    }
    
    public DischargePatient(admission: Admission, bedInfoId: number) {
        admission.AdmissionStatus = "discharged";
        var tempAdmission: any;
        tempAdmission = _.omit(admission, ['AdmissionValidator','BilTxnItems']);
        return this.admissionDLService.PutPatientDischarge(tempAdmission, bedInfoId)
            .map((responseData) => {
                return responseData;
            });

    }
    public TransferBed(patBedInfo: PatientBedInfo, prevBedInfoId: number, bilItm: BillingTransactionItem) {
        patBedInfo.Action = "transfer";
        var tempBedInfo = _.omit(patBedInfo, ['PatientBedInfoValidator']);
        var tempBilItm = _.omit(bilItm, ['ItemList', 'BillingTransactionItemValidator', 'Patient']);
        tempBedInfo['BedChargeBilItm'] = tempBilItm;
        return this.admissionDLService.PutPatientBedInfo(tempBedInfo, prevBedInfoId)
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
    public UpgradeBedFeature(patBedInfo: PatientBedInfo, prevBedInfoId: number) {
        patBedInfo.Action = "upgrade";
        var tempBedInfo = _.omit(patBedInfo, ['PatientBedInfoValidator']);
        return this.admissionDLService.PutPatientBedInfo(tempBedInfo, prevBedInfoId)
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
 
}


