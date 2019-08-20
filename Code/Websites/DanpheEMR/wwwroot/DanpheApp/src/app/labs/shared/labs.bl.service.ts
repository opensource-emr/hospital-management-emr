import { Injectable, Directive } from '@angular/core';

import { BillingDLService } from '../../billing/shared/billing.dl.service';
import { LabsDLService } from './labs.dl.service';
import { CoreDLService } from "../../core/shared/core.dl.service";
import { LabTestRequisition } from './lab-requisition.model';
import { BillItemRequisition } from '../../billing/shared/bill-item-requisition.model';
import { PatientLabSample, LabTestSpecimenModel } from '../shared/lab-view.models';
import { LabTestComponent } from './lab-component.model';
import { SecurityService } from '../../security/shared/security.service';
import * as moment from 'moment/moment';
import * as _ from 'lodash';

import { CommonFunctions } from '../../shared/common.functions';
import { LabReport } from './lab-report';
import { LabReportVM } from '../reports/lab-report-vm';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { InPatientLabTest } from './InpatientLabTest';
//Note: mapping is done here by blservice, component will only do the .subscribe().
@Injectable()
export class LabsBLService {

    constructor(public labDLService: LabsDLService,
        public billingDLService: BillingDLService,
        public patientDLService: PatientsDLService,
        public securityService: SecurityService,
        public visitDLService: VisitDLService,
        public coreDlService: CoreDLService) {

    }
    //getting the labtest, labgroup and labcategory
    public GetAllLabTests() {
        return this.labDLService.GetAllLabTests()
            .map(res => { return res })
    }
    // getting the lab-templates
    public GetAllReportTemplates() {
        return this.labDLService.GetAllReportTemplates()
            .map(res => { return res })
    }


    //getting the requsitions...(used in requsition.component)
    public GetLabRequisition() {
        return this.labDLService.GetLabRequisition()
            .map(res => { return res })
    }
    public GetPrintIdfromTestComponentResult() {
        return this.labDLService.GetPrintIdfromTestComponentResult()
            .map(res => { return res })
    }


    //Getting the test along with SampleCode on CollectSample Page
    GetLabSamplesWithCodeByPatientId(patientId: number, visitType: string, runNumberType: string, requisitionId: number, wardName: string) {
        return this.labDLService.GetLabSamplesWithCodeByPatientId(patientId, visitType, runNumberType, requisitionId, wardName)
            .map(res => { return res })
    }


    // getting the test of selected patient on basis of patientId....(used in collect-sample.component)
    GetLabSamplesByPatientId(patientId: number, visitType: string) {
        return this.labDLService.GetLabSamplesByPatientId(patientId, visitType)
            .map(res => { return res })
    }

    //getting latest Sample code
    GetLatestSampleCode(visitType: string, sampleDate: string, runNumberType: string) {
        return this.labDLService.GetLatestSampleCode(visitType, sampleDate, runNumberType)
            .map(res => { return res })
    }


    //getting Pending Lab results  whose labOrder is not final and sample code is not null..(used in lab-tests-pending-lab-results.component)
    public GetPendingLabResults() {
        return this.labDLService.GetPendingLabResults()
            .map(res => { return res })
    }
    //getting multiple template under single parent where orderstatus is final and isprint is false..(used in patient-template-list.component)
    GetPatientTemplateList(patientId: number) {
        return this.labDLService.GetPatientTemplateList(patientId)
            .map(res => { return res })
    }

    GetLabTestPendingReports() {
        return this.labDLService.GetLabTestPendingReports()
            .map(res => { return res });
    }
    GetLabTestFinalReports(frmdate,todate) {
        return this.labDLService.GetLabTestFinalReports(frmdate,todate)
            .map(res => { return res });
    }

    GetTestListOfSelectedInPatient(patId: number, patVisitId: number) {
        return this.labDLService.GetTestListOfSelectedInPatient(patId, patVisitId)
            .map(res => { return res });
    }

    //Get all Lab Data of a patient by Barcode Number
    GetAllLabDataByBarcodeNumber(barcodeNumber: number) {
        return this.labDLService.GetAllLabDataByBarcodeNumber(barcodeNumber)
            .map(res => { return res });
    }

    //Get all Lab Data of a patient by Barcode Number
    GetAllLabDataByRunNumber(formattedSampleCode: string) {
        return this.labDLService.GetAllLabDataByRunNumber(formattedSampleCode)
            .map(res => { return res });
    }

    GetAllThePatientList() {
        return this.labDLService.GetAllPatientList()
            .map(res => { return res });
    }

    GetAllLabDataByPatientName(patientId: number) {
        return this.labDLService.GetAllLabDataByPatientName(patientId)
            .map(res => { return res });
    }





    //getting report for patient view..(used in view-report.component)
    GetReportByTemplateId(templateId: number, patientId: number) {
        return this.labDLService.GetReportByTemplateId(templateId, patientId)
            .map(res => { return res })
    }
    //getting report for patient view..(used in view-report.component)
    GetReportByRequisitionId(requisitionId: number) {
        return this.labDLService.GetReportByRequisitionId(requisitionId)
            .map(res => { return res })
    }


    //getting report for printing..(used in view-report.component)
    GetReportToPrintBytemplateIdandpatientId(templateId: number, patientId: number) {
        return this.labDLService.GetReportToPrintBytemplateIdandpatientId(templateId, patientId)
            .map(res => { return res })
    }
    //this is to get lab preference for the employee
    public GetEmpPreference(employeeId) {

        return this.labDLService.GetEmpPreference(employeeId)
            .map(res => { return res })
    }
    public GetLastSampleCode(labTestSpecimen: string, requisitionId: number) {

        return this.labDLService.GetLastSampleCode(labTestSpecimen, requisitionId)
            .map(res => { return res })
    }

    public GetSampleCodeCompared(SampleNumber: number, visitType: string, sampleCreatedOn: string, RunNumberType: string) {
        return this.labDLService.GetSampleCodeCompared(SampleNumber, visitType, sampleCreatedOn, RunNumberType)
            .map(res => { return res })
    }
    public GetReportFromReqIdList(requisitionIdList: Array<number>) {
        return this.labDLService.GetReportFromReqIdList(JSON.stringify(requisitionIdList))
            .map(res => {
                return res
            })
    }
    public GetDoctorsList() {
        return this.billingDLService.GetDoctorsList()
            .map(res => res);
    }

    public GetLabBillingItems() {
        return this.billingDLService.GetLabBillingItems()
            .map(res => res);
    }
    public GetInpatientList() {
        return this.patientDLService.GetInpatientList()
            .map(res => res);
    }
    public GetPatientVisitsProviderWise(patientId: number) {
        return this.visitDLService.GetPatientVisitsProviderWise(patientId)
            .map(res => res);
    }
    public GetSpecimen(reqId: number) {
        return this.labDLService.GetSpecimen(reqId)
            .map(res => { return res })
    }

    public GetLabRequisitionsFromReqIdList(requisitionIdList: Array<number>) {
        return this.labDLService.GetLabRequisitionsFromReqIdList(JSON.stringify(requisitionIdList))
            .map(res => {
                return res
            })
    }

    public GetDataOfInPatient(patId: number, visitId: number) {
        return this.labDLService.GetDataOfInPatient(patId, visitId)
            .map(res => {
                return res
            })
    }

    public GetAllTestsForExternalLabs(){
        return this.labDLService.GetAllTestsForExternalLabs()
        .map(res => {
            return res
        })
    }

    public GetAllTestsSendToExternalVendors(){
        return this.labDLService.GetAllTestsSendToExternalVendors()
        .map(res => {
            return res
        })
    }



    //posting the requisitions in requistion table..(tests-order.component)
    PostToRequisition(labObj: Array<LabTestRequisition>) {
        let data = JSON.stringify(labObj);

        return this.labDLService.PostToRequisition(data)
            .map(res => { return res })
    }

    PostToBilling(res: Array<LabTestRequisition>) {
        let currentUser: number = 1;//logged in doctor
        let billItems: Array<BillItemRequisition> = new Array<BillItemRequisition>();
        res.forEach(req => {
            billItems.push({
                BillItemRequisitionId: 0,
                ItemId: req.LabTestId,
                RequisitionId: req.RequisitionId,
                ItemName: req.LabTestName,
                ProcedureCode: req.ProcedureCode,
                PatientId: req.PatientId,
                PatientVisitId: req.PatientVisitId,
                ServiceDepartment: "Lab",
                DepartmentName: "Lab",
                ServiceDepartmentId: 0,
                ProviderId: req.ProviderId,
                Quantity: 1,
                CreatedBy: this.securityService.GetLoggedInUser().EmployeeId,
                CreatedOn: moment().format('YYYY-MM-DD'),
                Price: 0,//check for proper price and change it later.
                AssignedTo: req.ProviderId//need to change this later on.. sud: 20may
            });
        });
        return this.billingDLService.PostBillingItemRequisition(billItems)
            .map(res => res)

    }
    PostLabReport(labReport: LabReport) {
        let data = JSON.stringify(labReport);
        return this.labDLService.PostLabReport(data)
            .map(res => { return res })
    }

    VerifyAllLabTests(labReport: LabReport) {
        let data = JSON.stringify(labReport);
        return this.labDLService.VerifyAllLabTests(data)
            .map(res => { return res })
    }

    VerifyAllLabTestsDirectly(requisitionIdList: Array<number>) {
        return this.labDLService.VerifyAllLabTestsDirectly(JSON.stringify(requisitionIdList))
            .map(res => {
                return res
            })
    }

    PutLabReport(labReport: LabReport) {
        let data = JSON.stringify(labReport);
        return this.labDLService.PutLabReport(data)
            .map(res => { return res })
    }

    //Update IsPrinted Value in LabReport Table
    public UpdateIsPrintedFlag(reportId: number) {
        return this.labDLService.UpdateIsPrintedFlag(reportId)
            .map(res => { return res })
    }

    

    //posting test component in LAB_TXN_TestComponentResult table..(used in add-result.component)
    PostComponent(labTestComponents: Array<LabTestComponent>, specimenData: Array<LabTestSpecimenModel>) {

        ////omiting the validators during post because it causes cyclic error during serialization in server side.

        let componentsNew = labTestComponents.map(comp => {
            return _.omit(comp, ['ComponentValidator']);
        });

        let dataToPost = JSON.stringify(componentsNew);
        let specienToPost = JSON.stringify(specimenData);

        return this.labDLService.PostComponent(dataToPost, specienToPost)
            .map(res => { return res });

    }

    //adding the samplecode...(used in collect-sample.component)
    public PutSampleCode(patLabSample: Array<PatientLabSample>, currentUser) {
        //let reqIds = patLabSample.Tests.map(function (test) {
        //    return test.RequisitionId;
        //});
        return this.labDLService.PutSampleCode(patLabSample, currentUser)
            .map(res => { return res })
    }

    //ashim: 20Sep2018 
    //update sample code using reqIdList used in view report page.
    public PutSampleCodeReqIdList(reqIdList: Array<number>, RunNumber: number, SampleDate: string, visitType: string, RunNumberType: string) {
        return this.labDLService.PutSampleCodeReqIdList(reqIdList, RunNumber, SampleDate, visitType, RunNumberType)
            .map(res => { return res })
    }

    //Update Specimen of CUlture
    public PutSpecimen(specimen: string, reqId: number) {
        return this.labDLService.PutSpecimen(specimen, reqId)
            .map(res => { return res })
    }


    //updating the labOrderStatus in requisition table..(used in add-result.component)
    PutLabOrderStatus(labTestComponents: Array<LabTestComponent>) {
        let componentsNew = labTestComponents.map(comp => {
            return _.omit(comp, ['ComponentValidator']);
        });

        let dataToPut = JSON.stringify(componentsNew);

        ///let data = JSON.stringify(labTestComponents);

        return this.labDLService.PutLabOrderStatus(dataToPut)
            .map(res => { return res })
    }
    public PutPrintStatusForReport(requisitionlist: Array<number>, labReportId) {
        let data = JSON.stringify(requisitionlist);
        return this.labDLService.PutPrintStatusForReport(requisitionlist, labReportId)
            .map((responseData) => {
                return responseData;
            })
    }

    public PutCommentsOnTestRequisition(requisitionlist: Array<number>, comments) {
        let data = JSON.stringify(requisitionlist);
        return this.labDLService.PutCommentsOnTestRequisition(requisitionlist, comments)
            .map((responseData) => {
                return responseData;
            })
    }

    UndoSampleCode(requisitionlist: Array<number>) {
        return this.labDLService.UndoSampleCode(requisitionlist)
            .map((responseData) => {
                return responseData;
            })
    }

    // to update the lab result
    PutLabTestResult(labTestComponents: Array<LabTestComponent>, specimenData: Array<LabTestSpecimenModel>) {
        let componentsNew = labTestComponents.map(comp => {
            return _.omit(comp, ['ComponentValidator']);
        });
        let data = JSON.stringify(componentsNew);
        let specienToPost = JSON.stringify(specimenData);

        return this.labDLService.PutLabTestResult(data, specienToPost)
            .map((responseData) => {
                return responseData;
            })
    }

    //Update ReferredBy Doctor
    PutDoctor(id: number, reqList: number[]) {
        return this.labDLService.PutDoctor(id, reqList)
            .map(res => { return res })
    }

    //Update ReferredByDoctor Name in LabReport Table
    PutDoctorNameInLabReport(id, doctorName) {
        return this.labDLService.PutDoctorNameInLabReport(id, doctorName)
            .map(res => { return res })
    }

    //Update labtest with aother of samePrice
    ChangeLabTestOfSamePrice(reqId: number, changedLabtest) {
        let data = JSON.stringify(changedLabtest);
        return this.labDLService.ChangeLabTestOfSamePrice(reqId, data)
            .map(res => { return res })
    }

    //To Update Tables to cancel the LabTest Request for Inpatient
    CancelInpatientCurrentLabTest(currentInpatientLabTest: InPatientLabTest) {
        let data = JSON.stringify(currentInpatientLabTest);
        return this.labDLService.CancelInpatientCurrentLabTest(data)
            .map(res => { return res });
    }


    SaveLabStickersHTML(printerName: string, filePath: string, stickerHtmlContent: string, numOfCopies: number) {
        return this.labDLService.PostLabStickerHTML(printerName, filePath, stickerHtmlContent, numOfCopies)
            .map(res => {
                return res;
            });
    }

    public UpdateVendorToLabTest(requisitionlist: Array<number>,vendorId: number){
        let data = JSON.stringify(requisitionlist);
        return this.labDLService.UpdateVendorToLabTest(data, vendorId)
            .map((responseData) => {
                return responseData;
            })
    }





    //public GetTemplateStoragePath() {
    //    return this.labDLService.GetTemplateStoragePath()
    //        .map(res => { return res })
    //}
    //delete this:ashim
    //getting multiple template under single parent where orderstatus is final..(all the reports against that patient from the beginning)
    //GetViewAllReportsTemplate(patientId: number) {
    //    return this.labDLService.GetViewAllReportsTemplate(patientId)
    //        .map(res => { return res })
    //}

    //getting the data from requisition and component to add 
    //in the labresult service ....(used in collect-sample.component)
    //public GetLabTestsAndRequisitionBySampleCode(SampleCode) {
    //    return this.labDLService.GetLabTestsAndRequisitionBySampleCode(SampleCode)
    //        .map(res => {
    //            return res
    //        })
    //}
    //getting the data from requisition and component to add 
    //in the labresult service ....(used in pending-lab-results.component)
    //public GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId, PatientId, sCode, sDate) {
    //    return this.labDLService.GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId, PatientId, sCode, sDate)
    //        .map(res => {
    //            return res
    //        })
    //}

    //getting list of patient report who labOrder is final and isprint is false ..(used in list-report.component)
    //public GetListPatientWithReport() {
    //    return this.labDLService.GetListPatientWithReport()
    //        .map(res => { return res })
    //}
    //getting list of patient report who labOrder is final..(list all the patient from the beginning to view the report)
    //public GetListAllPatientsReport() {
    //    return this.labDLService.GetListAllPatientsReport()
    //        .map(res => { return res })
    //}




    //getting report for patient view..(all the reports from the beginning)
    //GetAllReportByTemplateId(templateId: number, patientId: number, labReportId) {
    //    return this.labDLService.GetAllReportByTemplateId(templateId, patientId, labReportId)
    //        .map(res => { return res })
    //}

    //GetComponentValueLookups() {
    //    let moduleName = "Lab";
    //    return this.coreDlService.GetLookups("Lab")
    //        .map(res => {
    //            return res;
    //        });
    //}


    // this can be  used in future ..<revisit by dharm 05'April'2017>
    // Updating doctors Remark in result table ..(used in view-report.component)
    //PutDoctorsRemark(labResult: Array<LabTestResult>) {   
    //    let data = labResult;
    //    return this.labDLService.PutDoctorsRemark(data)
    //        .map(res => { return res })
    //}

    ////start: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

    //public GetLabReport_New_Temp(labReportId) {
    //    return this.labDLService.GetLabReport_New_Temp(labReportId)
    //        .map((res) => {
    //            return res;
    //        })
    //}

    ////end: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

    //start: sud:16May'19--for lab-external vendors.
    GetLabVendors() {
        return this.labDLService.GetLabVendors();
    }
    //end: sud:16May'19--for lab-external vendors.
}