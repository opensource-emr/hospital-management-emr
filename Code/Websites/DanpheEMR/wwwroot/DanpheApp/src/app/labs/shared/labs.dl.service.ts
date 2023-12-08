import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs-compat';
import { DanpheHTTPResponse } from '../../shared/common-models';
import { ExternalLabStatus_DTO } from './DTOs/external-lab-sample-satatus.dto';
import { LoginToTelemed } from './labMasterData.model';

@Injectable()
export class LabsDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) {
  }

  //getting the labtest, labgroup and labcategory
  public GetAllLabTests() {
    return this.http.get<any>("/api/Lab/LabTests", this.options)
  }
  //getting the lab templates.
  public GetAllReportTemplates() {
    return this.http.get<any>("/api/Lab/LabReportTemplates", this.options)
  }

  //getting the requsitions.
  public GetLabRequisition(frmdate, todate) {
    return this.http.get<any>("/api/Lab/Requisition/SamplePending?FromDate=" + frmdate + "&ToDate=" + todate, this.options)
  }

  //getting latest Sample code
  public GetLatestSampleCode(visitType: string, sampleDate: string, runNumberType: string, patId: number, underInsurance: boolean) {
    return this.http.get<any>("/api/Lab/LatestSampleCode?visitType=" + visitType + '&SampleDate=' + sampleDate +
      '&runNumberType=' + runNumberType + '&patientId=' + patId + '&hasInsurance=' + underInsurance, this.options)
  }

  public GetPrintIdfromTestComponentResult() {
    return this.http.get<any>("/api/Lab?reqType=GetPrintIdfromTestComponentResult", this.options)
  }


  //public GetTemplateStoragePath() {
  //    return this.http.get<any>("/api/Lab?reqType=GetTemplateStoragePath", this.options)
  //}

  // gets lab samples with billstatus='paid' and orderstatus not final in Lab Sample collect Page
  public GetLabSamplesWithCodeByPatientId(patientId: number, visitType: string, runNumberType: string, requisitionId: number, wardName: string, isUnderInsurance: boolean) {
    return this.http.get<any>("/api/Lab/Requisition/PatientSamplePending?patientId=" + patientId + "&visitType=" + visitType + "&runNumberType=" + runNumberType + "&requisitionId=" +
      requisitionId + "&wardName=" + wardName + '&hasInsurance=' + isUnderInsurance, this.options);
  }

  //getting report for patient view..(used in view-report.component)
  public GetReportByTemplateId(templateId: number, patientId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReport&patientId=" + patientId + "&templateId=" + templateId, this.options)
  }

  //getting report for patient view by requisition id..(used in patient overview - lab-view report)
  public GetReportByRequisitionId(requisitionId: number) {
    return this.http.get<any>("/api/Lab?reqType=viewReportFromReqId&requisitionId=" + requisitionId, this.options)
  }

  //getting report for patient view..(used in view-report.component)
  public GetReportByPatientVisitId(patientVisitId: number) {
    return this.http.get<any>("/api/Lab/LabResultsByVisitId?patientVisitId=" + patientVisitId, this.options)
  }
  public GetPatientReport(patientId: number) {
    return this.http.get<any>("/api/Lab/LabResultsByPatientId?patientId=" + patientId, this.options)
  }

  //getting report for printing..(used in view-report.component)
  // GetReportToPrintBytemplateIdandpatientId(templateId: number, patientId: number) {
  //   return this.http.get<any>("/api/Lab/LabReportByPatientIdAndTemplateId?patientId=" + patientId + "&templateId=" + templateId, this.options)
  // }

  //getting report for lab results which have pending results..(used in pendinding-lab-results.component)
  public GetPendingLabResults(frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/Result/Pending?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options);

  }

  // public GetPendingLabResultsForWorkList(frmdate, todate, catList) {
  //   return this.http.get<any>("/api/Lab?reqType=pendingLabResultsForWorkList&FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options);

  // }

  //sud/DevN: 9thJan'23 -- WorkList API separated.
  public GetLabWorkListData(fromDate: string, toDate: string, categoryIdCsv: string) {
    return this.http.get<DanpheHTTPResponse>(`/api/Lab/WorkList?fromDate=${fromDate}&toDate=${toDate}&categoryIdCsv=${categoryIdCsv}`, this.options);
  }

  //getting report for pending templates in a single patient where isprint is false..(used in patient-template-list.component)
  public GetPatientTemplateList(patientId: number) {
    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=patientTemplateList", this.options)
  }

  public GetLabTestPendingReports(frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/Report/Pending?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options)
  }
  // public GetLabTestFinalReports(frmdate, todate, searchtxt, catList, isForLabMaster) {
  //   return this.http.get<any>("/api/Lab/FinalReport?FromDate=" + frmdate + "&ToDate=" + todate + "&search=" + searchtxt + "&isForLabMaster=" + isForLabMaster + "&categoryIdList=" + catList, this.options)
  // }

  public GetPatientListInLabFinalReports(frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/PatientListForFinalReport?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options)
  }

  public GetPatientListForReportDispatch(frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/PatientListForReportDispatch?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options)
  }

  public GetFinalReportsInReportDispatchByPatId(patientId, frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/Report/Finalized?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList + "&patientId=" + patientId, this.options)
  }

  // public GetPatientList(frmdate, todate, catList) {
  //   return this.http.get<any>("/api/Lab/FilteredPatientList?FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options)

  // }

  public GetAllLabCategory() {
    return this.http.get<any>("/api/Lab/LabCategories", this.options)

  }

  //getting report for patient view..(used in view-report.component)
  public GetRequisitionsByPatientVisitId(patientId: number, patientVisitId: number) {
    return this.http.get<any>("/api/Lab/LabRequisitionsByVisitId?patientId=" + patientId + "&patientVisitId=" + patientVisitId, this.options)
  }
  //getting report for patient view..(used in view-report.component)
  public GetEmpPreference(employeeId: number) {
    return this.http.get<any>("/api/Lab?reqType=employeePreference&employeeId=" + employeeId, this.options)
  }


  //getting sample code compared --yub 1st sept '18'
  public GetSampleCodeCompared(SampleNumber: number, visitType: string, sampleCreatedOn: string, RunNumberType: string, isUnderIns: boolean) {
    return this.http.get<any>("/api/Lab/IsSampleCodeValid?SampleCode=" + SampleNumber
      + '&visitType=' + visitType
      + '&SampleDate=' + sampleCreatedOn + '&runNumberType=' + RunNumberType + '&hasInsurance=' + isUnderIns, this.options)
  }

  public GetReportFromReqIdList(requisitionIdList: string) {
    return this.http.get<any>("/api/Lab/LabReportByRequisitionIds?requisitionIdList=" + requisitionIdList, this.options)

  }

  public GetReportFromListOfReqIdList(requisitionIdList: string) {
    return this.http.get<any>("/api/Lab/ReportDispatch/LabReportByRequisitionIds?requisitionIdList=" + requisitionIdList, this.options)

  }

  public GetTestListOfSelectedInPatient(patientId: number, patientVisitId: number, module: string) {
    return this.http.get<any>("/api/Billing/InPatientProvisionalItems?patientId=" + patientId + "&patientVisitId=" + patientVisitId + "&module=" + module, this.options)
  }

  public GetSpecimen(reqId: number) {
    return this.http.get<any>("/api/Lab/Requisition/LabSpecimen?requisitionId=" + reqId, this.options);
  }

  public GetAllLabDataByBarcodeNumber(barCodeNumber: number) {
    return this.http.get<any>("/api/Lab/LabDataByBarcodeNumber?barCodeNumber=" + barCodeNumber, this.options);
  }

  public GetAllLabDataByRunNumber(formattedSampleCode: string) {
    return this.http.get<any>("/api/Lab/LabDataByRunNumber?formattedSampleCode=" + formattedSampleCode, this.options);
  }

  public GetAllLabDataByPatientName(patientId: number) {
    return this.http.get<any>("/api/Lab/LabDataByPatientId?patientId=" + patientId, this.options);
  }

  public GetTestListSummaryByPatientId(patientId: number, frmdate, todate, catList) {
    return this.http.get<any>("/api/Lab/PatientNotFinalizedTests?patientId=" + patientId + "&FromDate=" + frmdate + "&ToDate=" + todate + "&categoryIdList=" + catList, this.options);
  }

  public GetLabRequisitionsFromReqIdList(requisitionIdList: string) {
    return this.http.get<any>("/api/Lab/RequisitionsByRequisitionIds?requisitionIdList=" + requisitionIdList, this.options);
  }
  public GetDataOfInPatient(patId: number, patVisitId: number) {
    return this.http.get<any>("/api/Visit/PatientCurrentVisitContext?patientId=" + patId + "&visitId=" + patVisitId, this.options)
  }

  //Sud/DevN:17Jan'23--Instead of getting all patients, Use any other API with Searchkey instead of loading all patients.
  public GetAllPatientList() {
    return this.http.get<any>("/api/Patient", this.options);
  }
  public GetAllTestsForExternalLabs(labTestCSV: string, fromDate: string, toDate: string, patientName: string, hospitalNo: string, vendorId: number, externalLabStatus: string) {
    return this.http.get<any>(`/api/Lab/RequisitionsForExternalLab?LabTestCSV=${labTestCSV}&FromDate=${fromDate}&ToDate=${toDate}&PatientName=${patientName}&HospitalNo=${hospitalNo}&VendorId=${vendorId}&ExternalLabStatus=${externalLabStatus}`, this.options);
  }
  public GetAllTestsSendToExternalVendors() {
    return this.http.get<any>("/api/Lab/RequisitionsSentToExternalLab", this.options);
  }

  // public UpdateAllSampleCodeFormatted() {
  //   return this.http.put<any>("/api/Lab/SampleCodeFormatted", this.options);
  // }


  //posting the requisitions in requistion table
  public PostToRequisition(requisitionObjString: string) {
    let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
    return this.http.post<any>("/api/Lab/Requisitions", data, this.options);

  }
  // public PostFromBillingToRequisition(requisitionObjString: string) {
  //   let data = requisitionObjString;// CommonFunctions.EncodeRequestDataString(requisitionObjString);
  //   return this.http.post<any>("/api/Lab/LabRequisitionFromBilling", data, this.options);

  // }
  //posting test component in LAB_TXN_TestComponentResult table..(used in add-result.component)
  public PostComponent(labTestComponents: string, specimenData: string) {
    let data = labTestComponents;// CommonFunctions.EncodeRequestDataString(labTestComponents);
    return this.http.post<any>("/api/Lab/ComponentResults?specimenData=" + specimenData, data, this.options);

  }
  public PostLabReport(labReport: string) {
    return this.http.post<any>("/api/Lab/LabReport", labReport, this.options);
  }
  public VerifyAllLabTests(labReport: string) {
    return this.http.put<any>("/api/Lab/VerifyTestResultWithSignatory", labReport, this.options);
  }
  public VerifyAllLabTestsDirectly(reqIdList: string) {
    return this.http.put<any>("/api/Lab/VerifyTestResultWithoutSignatory", reqIdList, this.options);
  }
  public PutLabReport(labReport: string) {
    return this.http.put<any>("/api/Lab/UpdateLabReport", labReport, this.options);
  }
  public UpdateVendorToLabTest(requisitionIdlist: string, vendorId) {
    let data = requisitionIdlist;
    return this.http.put<any>("/api/Lab/Requisition/Vendor?" + 'vendorId=' + vendorId, data, this.options);
  }

  // Update IsPrinted Value in LabReport Table
  public UpdateIsPrintedFlag(reportId: number, reqListStr: string) {
    return this.http.put<any>("/api/Lab/Report/PrintCount?reportId=" + reportId + '&requisitionIdList=' + reqListStr, this.options);
  }

  //adding the samplecode
  public PutSampleCode(req, CurrentUser: number) {
    return this.http.put<any>("/api/Lab/GenerateSampleCodeManual?CurrentUser=" + CurrentUser, req, this.options);
  }
  //ashim: 20Sep2018
  //updating sample code from view report page.
  public PutSampleCodeReqIdList(reqIdList: Array<number>, RunNumber: number, SampleDate: string, visitType: string, RunNumberType: string) {
    let data = JSON.stringify(reqIdList);
    return this.http.put<any>("/api/Lab/Report/UpdateSampleCode?RunNumber=" + RunNumber
      + '&SampleDate=' + SampleDate + '&visitType=' + visitType + '&runNumberType=' + RunNumberType, data, this.options);
  }

  //Updating Specimen in Culture Report
  public PutSpecimen(specimen: string, reqId: number) {
    return this.http.put<any>("/api/Lab/Requisition/LabSpecimen?ReqId=" + reqId
      + '&Specimen=' + specimen, this.options);
  }


  //updating the labOrderStatus in requisition table..(used in add-result.component)
  public PutLabOrderStatus(data) {
    return this.http.put<any>("/api/Lab?reqType=updateLabOrderStatus&", data, this.options)
  }


  public PutLabBillStatus(requistionIds, billstatus) {
    let data = requistionIds;
    return this.http.put<any>("/api/Lab/Requisition/BillStatus?billstatus=" + billstatus, data, this.options)
  }

  public PutPrintStatusForReport(requisitionIdlist: Array<number>, labReportId) {
    let data = (requisitionIdlist);
    return this.http.put<any>("/api/Lab?reqType=UpdatePrintStatusForReport" + '&labReportId=' + labReportId, data, this.options);
  }


  // public PutCommentsOnTestRequisition(requisitionIdlist: Array<number>, comments) {
  //   let data = (requisitionIdlist);
  //   return this.http.put<any>("/api/Lab/UpdateCommentsOnTestRequisition?" + 'comments=' + comments, data, this.options);
  // }

  public UndoSampleCode(requisitionIdlist: Array<number>) {
    let data = (requisitionIdlist);
    return this.http.put<any>("/api/Lab/UndoSampleCode", data, this.options);
  }

  // to update the lab result
  public PutLabTestResult(labTestComponents, specimenData: string) {
    let data = (labTestComponents);
    return this.http.put<any>("/api/Lab/ComponentResults?specimenData=" + specimenData, data, this.options);
  }

  public PutDoctor(id: number, reqId: number[]) {
    let data = JSON.stringify(reqId);
    return this.http.put<any>('/api/Lab/UpdateDoctorInLabRequisition?' + 'id=' + id, data, this.options);
  }

  public PutDoctorNameInLabReport(LabReportId: number, doctorName: string) {
    return this.http.put<any>('/api/Lab/UpdateDoctorInLabReport?' + 'id=' + LabReportId, doctorName, this.options);
  }

  public ChangeLabTestOfSamePrice(requisitionId: number, data) {
    return this.http.put<any>('/api/Lab/ChangeLabTestWithSamePrice?' + '&requisitionid=' + requisitionId, data, this.options);
  }

  public CancelInpatientCurrentLabTest(data) {
    return this.http.put<any>('/api/Lab/CancelInpatientLabTest', data, this.options);
  }

  public CancelLabItem(data) {
    return this.http.put<any>('/api/Billing/CancelInpatientItemFromWard', data, this.options);
  }

  //sud: 4-Nov-2018--to send lab sticker to server for file creation.
  public PostLabStickerHTML(printerName: string, filePath: string, stickerHtmlContent: string, numOfCopies: number) {
    return this.http.post<any>("/api/Lab/LabStickerHtml?PrinterName=" + printerName + "&filePath=" + filePath + "&numOfCopies=" + numOfCopies, stickerHtmlContent, this.options);
  }

  // this.http.post<any>(""/api/Billing/saveHTMLfile?PrinterName=" + PrinterName + "&FilePath=" + filePath, printableHTML, this.options)
  //.map(res => res).subscribe(res => {
  //    if (res.Status = "OK") {
  //        this.timerFunction();
  //    }
  //    else {
  //        this.loading = false;
  //        this.showLoading = false;
  //    }
  //});

  //delete ASAP
  //getting the data from requisition and labtest(component) to add
  //in the labresult service ....(used in collect-sample.component)
  //public GetLabTestsAndRequisitionBySampleCode(SampleCode: number) {
  //    return this.http.get<any>("/api/Lab?reqType=labTestsAndRequBySampleCode&SampleCode=" + SampleCode, this.options);
  //}
  //getting the data from requisition and labtest(component) to add
  //in the labresult service ....(used in collect-sample.component)
  //public GetLabTestsAndRequisitionByPatientIdandTemplateId(TemplateId: number, PatientId: number, sCode: number, sDate: number) {
  //    return this.http.get<any>("/api/Lab?reqType=LabTestsAndRequisitionByPatientIdandTemplateId&patientId=" + PatientId + "&templateId=" + TemplateId + "&SampleCode=" + sCode + "&SampleDate=" + sDate, this.options);
  //}

  //getting list of patient report whos labOrder is final and isprint is not true..(used in list-report.component)
  //public GetListPatientWithReport() {
  //    return this.http.get<any>("/api/Lab?reqType=listPatientWithReport", this.options);
  //}

  //getting list of patient report whos labOrder is final..(used in list-report.component)
  //public GetListAllPatientsReport() {
  //    return this.http.get<any>("/api/Lab?reqType=ViewAllReportPatientWise", this.options);
  //}

  //getting report for patient view..(all the reports from the beginning)
  //public GetAllReportByTemplateId(templateId: number, patientId: number, labReportId: number) {
  //    return this.http.get<any>("/api/Lab?reqType=viewallReport&patientId=" + patientId + "&templateId=" + templateId + "&labReportId=" + labReportId, this.options)
  //}

  //getting report for all the templates against that patient..(all the reports contained against that patient)
  //public GetViewAllReportsTemplate(patientId: number) {
  //    return this.http.get<any>("/api/Lab?patientId=" + patientId + "&reqType=viewAllReportTemplate", this.options)
  //}

  ////start: sud: 22Jun'18--for view-report new implementation  [Needs Revision]
  //public GetLabReport_New_Temp(labReportId: number) {
  //    return this.http.get<any>("/api/Lab?reqType=view-report-new&labReportId=" + labReportId, this.options)
  //}
  ////end: sud: 22Jun'18--for view-report new implementation  [Needs Revision]

  //start: sud:16May'19--for lab-external vendors.
  GetLabVendors() {
    return this.http.get<any>("/api/LabSetting/LabVendors", this.options);
  }

  //end: sud:16May'19--for lab-external vendors.


  //activate lab 
  public ActivateLab(labId: number, labName: string) {
    return this.http.put<any>("/api/Security/ActivateLab?labId=" + labId + "&labName=" + labName, this.options);
  }

  public DeactivateLab() {
    return this.http.put<any>("/api/Security/DeactivateLab", this.options);
  }

  public TransfertToLab(reqId: number, labTypeName: string) {
    return this.http.put<any>("/api/Lab/Requisition/ChangeLabType?reqId=" + reqId + "&labTypeName=" + labTypeName, this.options);
  }

  public GetSamplesCollectedData(fromDate, toDate) {
    return this.http.get<any>("/api/Lab/SampleCollectedRequisitions?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetSMSApplicableTest(fromDate, toDate) {
    return this.http.get<any>("/api/Lab/Notification/CovidResults?FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public PostSMS(reqId: string) {
    return this.http.post<any>("/api/Lab/Notification/Sms", reqId, this.options);
  }

  public GetSMSToBeSendMsg(reqId: number) {
    return this.http.get<any>("/api/Lab/Notification/CovidSmsText?requisitionId=" + reqId, this.options);
  }

  // public PutSampleCode(req, CurrentUser: number) {
  //   return this.http.put<any>("/api/Lab?reqType=updateSampleCode&CurrentUser=" + CurrentUser, req, this.options);
  // }

  public GenerateSampleRunNumber(data, CurrentUser: number) {
    return this.http.put<any>("/api/Lab/GenerateSampleCodeAutomatic?CurrentUser=" + CurrentUser, data, this.options);
  }

  public SendPdf(data, reqId: number) {
    return this.http.post<any>("/api/Lab/Notification/UploadCovidReportToGoogleDrive?requisitionId=" + reqId, data, this.options);
  }
  public SendEmail(formData: any) {
    let data = formData;
    try {
      return this.http.post<any>("/api/Lab/EmailLabReport", data, this.options)
    } catch (exception) {
      throw exception;
    }
  }


  uploadFile<T>(url: any, patient: any, formData: FormData): Observable<T> {
    var fullUrl = url + 'api/LabReport';
    var reqHeader = new HttpHeaders({
      'Authorization': 'Bearer ' + (sessionStorage.getItem('TELEMED_Token'))
    });
    return this.http.post<T>(`${fullUrl}/${patient.firstName}/${patient.lastName}/${patient.phoneNumber}/${patient.email}`, formData, { headers: reqHeader });
  }

  TeleMedicineLogin(url: any, login: LoginToTelemed) {
    var fullUrl = url + 'api/account/login';
    return this.http.post<any>(fullUrl, JSON.stringify(login), { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }

  public UpdateFileUploadStatus(requisitionIdList: string) {
    return this.http.put<any>("/api/Lab/updateFileUploadStatus?requisitionIdList=" + requisitionIdList, this.options)

  }

  public GetAllImuData(fromDate: Date, toDate: Date) {
    return this.http.get<any>("/api/IMU/GetAllImuTestList?fromDate=" + fromDate + "&toDate=" + toDate, this.options);
  }

  public PostDataToIMU(data) {
    return this.http.post<any>("/api/IMU/PostDataToIMU?value=" + data, null, this.options);
  }
  public GetMembershipWiselabTestCount(fromDate: string, toDate: string) {
    return this.http.get(`/Reporting/LabDashboardMembershipWiseTestCount?FromDate=${fromDate}&Todate=${toDate}`);
  }
  public GetRankWiselabTestCount(fromDate: string, toDate: string) {
    return this.http.get(`/Reporting/LabDashboardRankWiseTestCount?FromDate=${fromDate}&Todate=${toDate}`);
  }
  public GetTrendinglabTestCount(fromDate: string, toDate: string) {
    return this.http.get(`/Reporting/LabDashboardTrendingTestCount?FromDate=${fromDate}&Todate=${toDate}`);
  }
  public GetLabTestDoneTodayDetails() {
    return this.http.get(`/Reporting/LabDashboardTestDoneToday`);
  }
  public GetDengueTestDetails() {
    return this.http.get(`/Reporting/LabDashboardDengueTestDetails`);
  }
  public GetLabReqDetails() {
    return this.http.get(`/Reporting/LabDashboardLabReqDetails`);
  }
  public GetLabNormalAbnormalDetails(labTestId: number) {
    return this.http.get("/Reporting/LabDashboardNormalAbnormalDetails?labTestId=" + labTestId);
  }

  public GetOutsourceApplicableTests() {
    return this.http.get<DanpheHTTPResponse>(`/api/LabSetting/OutsourceApplicableLabTests`, this.options);
  }

  public AddMachineOrder(data): Promise<any> {
    return this.http.post<any>("/api/LIS/MachineOrder", data, this.optionsJson).toPromise();
  }

  public GetAllMachineResultByBarcodeNumber(barcodeNumber: number) {
    return this.http.get<DanpheHTTPResponse>(`/api/LIS/GetResultByBarcodeNumber?BarcodeNumber=${barcodeNumber}`, this.options);
  }

  public UpdateMachineDataSyncStatus(resultIds: Array<number>) {
    return this.http.put<DanpheHTTPResponse>(`/api/LIS/MachineResultSync`, resultIds, this.optionsJson);
  }


  public UpdateExternalLabStatus(externalLabDataStatus: ExternalLabStatus_DTO) {
    return this.http.put<DanpheHTTPResponse>(`/api/lab/ExternalLabStatus`, externalLabDataStatus, this.optionsJson);
  }
}
