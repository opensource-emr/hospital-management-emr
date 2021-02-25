import { Injectable, Directive } from "@angular/core";
//import { ParameterModel } from './parameter.model'
import { CoreBLService } from "./core.bl.service";
import { CommonMaster } from "../../shared/common-masters.model";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { DanpheAppSettings } from "../../shared/common-models";
import { CFGParameterModel } from "../../settings-new/shared/cfg-parameter.model";
import { Employee } from "../../employee/shared/employee.model";
import { CodeDetailsModel } from "../../shared/code-details.model";
import { DanpheRoute } from "../../security/shared/danphe-route.model";
import { NepaliCalendarService } from "../../shared/calendar/np/nepali-calendar.service";

@Injectable()
export class CoreService {
  //the value of below property is getting assigned in the appcomponent (i.e: the first loaded component).
  public Parameters: Array<CFGParameterModel> = null; //sud:26Sept'19--Changed from parametermodel to CFGPrameterModel since it's a duplicate.
  public Masters: CommonMaster = new CommonMaster();
  public LookUps: Array<LookupsModel> = new Array<LookupsModel>();

  public AppSettings: DanpheAppSettings = null; //sud:25Dec'18
  public CodeDetails: Array<CodeDetailsModel> = new Array<CodeDetailsModel>(); //for accounting codes..
  public accFiscalYearList: Array<any> = new Array<any>();
  //sud:28Jan'20 // to cache referrer list for External-Referral component.
  //this will be get/set from that component itself.
  public AllReferrerList: Array<Employee> = null;

  //TAX PARAMETER
  public taxLabel: string = "";
  public currencyUnit: string = "";
  public currSelectedSecRoute: DanpheRoute = null;
  accountingSettingsBLService: any;
  public DatePreference: string = "np";
  constructor(
    public coreBlService: CoreBLService,
    public msgBoxServ: MessageboxService
  ) { }

  public RemoveSelectedSecRoute() {
    this.currSelectedSecRoute = null;
  }

  //we're initializing parameters in the First component that will be loaded into the application.
  //i.e: appcomponent for now.
  public InitializeParameters() {
    return this.coreBlService.GetParametersList();
  }

  public GetMasterEntities() {
    return this.coreBlService.GetMasterEntities();
  }

  public SetMasterEntities(res) {
    if (res.Status == "OK") {
      let masters: CommonMaster = res.Results;
      this.Masters.ServiceDepartments = masters.ServiceDepartments;
      this.Masters.PriceCategories = masters.PriceCategories;
      this.Masters.Taxes = masters.Taxes;
      this.Masters.Departments = masters.Departments;
      this.Masters.UniqueDataList = masters.UniqueDataList;
      this.Masters.ICD10List = masters.ICD10List;
    }
  }

  public GetAllLookups() {
    return this.coreBlService.GetLookups();
  }

  public SetAllLookUps(res) {
    if (res.Status == "OK") {
      let allLookups: Array<LookupsModel> = res.Results;
      allLookups.forEach((lkp) => {
        this.LookUps.push({
          ModuleName: lkp.ModuleName,
          LookupName: lkp.LookupName,
          LookupDataJson: lkp.LookupDataJson,
        });
      });
    }
  }

  public GetModuleLookups(moduleName: string) {
    if (moduleName) {
      return this.LookUps.filter((a) => a.ModuleName == moduleName);
    }
  }

  public SetCurrencyUnit() {
    var currParameter = this.Parameters.find(
      (a) => a.ParameterName == "Currency"
    );
    if (currParameter)
      this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
    else
      this.msgBoxServ.showMessage("error", [
        "Please set currency unit in parameters.",
      ]);
  }
  public GetHospitalDetail() {
    var currParameter = this.Parameters.find(
      (a) => a.ParameterName == "HospitalDetail"
    );
    if (currParameter) return JSON.parse(currParameter.ParameterValue);
    else
      this.msgBoxServ.showMessage("error", [
        "Please set hospital detail in parameters.",
      ]);
  }
  public SetTaxLabel() {
    var currParameter = this.Parameters.find(
      (a) => a.ParameterName == "TaxInfo"
    );
    if (currParameter) {
      this.taxLabel = JSON.parse(currParameter.ParameterValue).TaxLabel;
    } else
      this.msgBoxServ.showMessage("error", [
        "Please set Tax Info in parameters.",
      ]);
  }

  //public GetRadImgUploadConfig() {
  //  var currParameter = this.Parameters.find(a => a.ParameterGroupName=="Radiology" && a.ParameterName == "ImageUpload")
  //  if (currParameter)
  //    return JSON.parse(currParameter.ParameterValue).enableImgUpload;
  //  else
  //    this.msgBoxServ.showMessage("error", ["Please set radiology image upload configuration."]);
  //}

  public GetEnableHealthCard(): boolean {
    var currParameter = this.Parameters.find(
      (a) => a.ParameterName == "EnableHealthCard"
    );
    if (currParameter) {
      return JSON.parse(currParameter.ParameterValue).enableHealthCard;
    } else {
      console.log("Healthcard information is not set in parameters.");
      //this.msgBoxServ.showMessage("notice", ["Please set health card configuration."]);
      return false;
    }
  }

  public GetServiceIntegrationName(srvDeptName: string): string {
    let srvDepts = this.Masters.ServiceDepartments;
    let srvDept = srvDepts.find((a) => a.ServiceDepartmentName == srvDeptName);
    return srvDept ? srvDept.IntegrationName : null;
  }
  //ashim: 22Aug2018: Used in visit-patient-info.component
  public GetDefaultCountry() {
    let countryJson = this.Parameters.find(
      (a) => a.ParameterName == "DefaultCountry"
    );
    if (countryJson) return JSON.parse(countryJson.ParameterValue);
  }
  public GetDefaultCountrySubDivision() {
    let subDivisionJSON = this.Parameters.find(
      (a) => a.ParameterName == "DefaultCountrySubDivision"
    );
    if (subDivisionJSON) return JSON.parse(subDivisionJSON.ParameterValue);
  }
  public GetLabReportHeaderSetting() {
    let labReportHeaderJSON = this.Parameters.find(
      (val) => val.ParameterName == "LabReportHeader"
    );
    if (labReportHeaderJSON) {
      return JSON.parse(labReportHeaderJSON.ParameterValue);
    }
  }
  //ashim: 06Sep2018 displaying default signatoire in lab
  public GetDefaultEmpIdForLabSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(
      (val) =>
        val.ParameterGroupName.toLowerCase() == "lab" &&
        val.ParameterName == "DefaultSignatoriesEmpId"
    );
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  //anish: 28Nov2018 displaying default signatoire for histo/cyto in lab
  public GetDefaultHistoCytoEmpIdForLabSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(
      (val) =>
        val.ParameterGroupName.toLowerCase() == "lab" &&
        val.ParameterName == "DefaultHistoCytoSignatoriesEmpId"
    );
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  public GetDefEmpIdForRadSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(
      (val) =>
        val.ParameterGroupName.toLowerCase() == "radiology" &&
        val.ParameterName == "DefaultSignatoriesEmployeeId"
    );
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  //anish: 15 Sept 2019 for getting the name of Hospital for which it is made
  public GetHospitalName() {
    var hospitalName = this.Parameters.find(
      (val) =>
        val.ParameterName == "HospitalName" &&
        val.ParameterGroupName == "Common"
    );
    if (hospitalName) {
      let name = hospitalName.ParameterValue.toLowerCase();
      name = name.replace(/ +/g, "");
      return name;
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please set Hospital Name in parameters.",
      ]);
    }
  }

  //anish: 17 Feb 2020 for getting the format of Vitals printing
  public GetVitalsPrintFormat() {
    var format = this.Parameters.find(
      (val) =>
        val.ParameterName == "VitalFormat" &&
        val.ParameterGroupName.toLowerCase() == "clinical"
    );
    if (format) {
      return format.ParameterValue.toLowerCase();
    } else {
      return "format1";
    }
  }

  public GetERDepartmentName() {
    var dept = this.Parameters.find(
      (val) =>
        val.ParameterName == "ERDepartmentName" &&
        val.ParameterGroupName.toLowerCase() == "common"
    );
    if (dept) {
      return dept.ParameterValue;
    } else {
      return null;
    }
  }

  public GetCareofPersonNoMandatory() {
    var currParameter = this.Parameters.find(
      (a) =>
        a.ParameterName == "IsCareOfPersonContactNoMandatory" &&
        a.ParameterGroupName == "ADT"
    );
    if (currParameter) {
      let careofPersonNumberMandatory = JSON.parse(
        currParameter.ParameterValue
      );
      return careofPersonNumberMandatory;
    } else {
      return false;
    }
  }

  //Get customer Header Parameter from Core Service (Database) assign to local variable
  GetReportHeaderParameterHTML(fromDate, toDate, rptHeaderTxt): string {
    let headerDetail: {
      CustomerName;
      Address;
      Email;
      CustomerRegLabel;
      CustomerRegNo;
      Tel;
    };
    let header = "Report";
    var bilHeadparam = this.Parameters.find(
      (a) =>
        a.ParameterName == "BillingHeader" &&
        a.ParameterGroupName.toLowerCase() == "bill"
    );

    if (bilHeadparam) {
      headerDetail = JSON.parse(bilHeadparam.ParameterValue);
      let frmToTxt = "";
      let nepaliFromDate = "";
      let nepaliToDate = "";
      if (fromDate && toDate && fromDate.length && toDate.length) {        
        nepaliFromDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(fromDate,
          "YYYY-MM-DD"
        );
        nepaliToDate = NepaliCalendarService.ConvertEngToNepaliFormatted_static(toDate,
          "YYYY-MM-DD"
        );
        frmToTxt = ` From: ` + fromDate + ` to ` + toDate + ` (B.S. From: ` +nepaliFromDate + ` to ` + nepaliToDate + `)`;
      }
      header =
        `<div class="bl-report-header text-center"><h3>` +
        headerDetail.CustomerName +
        `</h3><h3>` +
        headerDetail.Address +
        `</h3><h3>` +
        headerDetail.CustomerRegLabel +
        `</h3>` +
        `<h3 id="mainReportName">` +
        rptHeaderTxt +
        frmToTxt +
        `</h3></div>`;
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please enter parameter values for BillingHeader",
      ]);
    }

    return header;
  }

  GetReportHeaderTextForProperty(headrPropName: string) {
    var repHead = this.Parameters.find(
      (val) =>
        val.ParameterName == "ReportHeaderText" &&
        val.ParameterGroupName.toLowerCase() == "reportingheader"
    );
    if (repHead) {
      var paramData = JSON.parse(repHead.ParameterValue);
      return paramData[headrPropName] ? paramData[headrPropName] : "Report";
    } else {
      return "Report";
    }
  }
  public ADTReservationBuffer() {
    var dept = this.Parameters.find(
      (val) =>
        val.ParameterName == "TimeBufferForReservation" &&
        val.ParameterGroupName.toLowerCase() == "adt"
    );
    if (dept) {
      return JSON.parse(dept.ParameterValue);
    } else {
      return { days: 30, minutes: 30 };
    }
  }

  public GetQryStrToGetLabItems() {
    var qrstr = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabDepartmentNameInQuery" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (qrstr) {
      return qrstr.ParameterValue;
    } else {
      return "lab";
    }
  }

  public EnablePartialProvBilling() {
    var enable = this.Parameters.find(
      (val) =>
        val.ParameterName == "EnablePartialProvBilling" &&
        val.ParameterGroupName.toLowerCase() == "billing"
    );
    if (enable) {
      let val = enable.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //anish: for getting the name of Hospital for which it is made
  public ShowLoggedInUserSignatory() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowLoggedInUserSignatory" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  public ShowLabReportDispatcherSignatory() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowReportDispatcherSignature" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public ShowPrintInformationInLabReport() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "DisplayingPrintInfo" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public GetMaxNumberOfIsolatedOrganismCount() {
    var data = this.Parameters.find(
      (val) =>
        val.ParameterName == "MaxIsolatedOrganismCount" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (data) {
      let val = +data.ParameterValue;
      if (val) {
        return val;
      } else {
        return 5;
      }
    } else {
      return 5;
    }
  }

  //anish: for showing or hiding BarCode in LabReport
  public ShowBarCodeInLabReport() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowLabBarCodeInReport" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public ShowEmptyReportSheetPrint() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowEmptyReportSheet" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //anish: 10 May
  public EnableVerificationStep() {
    var parameter = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabReportVerificationNeededB4Print" &&
        val.ParameterGroupName == "LAB"
    );
    if (parameter) {
      var verificationParam = JSON.parse(parameter.ParameterValue);
    }
    if (parameter && verificationParam) {
      let val = verificationParam.EnableVerificationStep;
      if (val == "true" || val == true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public GetPreliminaryNoteText() {
    var parameter = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabReportVerificationNeededB4Print" &&
        val.ParameterGroupName == "LAB"
    );
    if (parameter) {
      var verificationParam = JSON.parse(parameter.ParameterValue);
    }
    if (parameter && verificationParam) {
      let val = verificationParam.PreliminaryReportText;
      if (val && val != "" && val.length > 0) {
        return val;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  public GetPreliminaryReportSignatureText() {
    var parameter = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabReportVerificationNeededB4Print" &&
        val.ParameterGroupName == "LAB"
    );
    if (parameter) {
      var verificationParam = JSON.parse(parameter.ParameterValue);
    }
    if (parameter && verificationParam) {
      let val = verificationParam.PreliminaryReportSignature;
      if (val && val != "" && val.length > 0) {
        return val;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  public EnableVerifierSignatureInLab() {
    var parameter = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabReportVerificationNeededB4Print" &&
        val.ParameterGroupName == "LAB"
    );
    if (parameter) {
      var verificationParam = JSON.parse(parameter.ParameterValue);
    }
    if (parameter && verificationParam) {
      let val = verificationParam.ShowVerifierSignature;
      if (val == "true" || val == true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public EnableDigitalSignatureInLabReport() {
    var enable = this.Parameters.find(
      (val) =>
        val.ParameterName == "EnableDigitalSignatureInLab" &&
        val.ParameterGroupName == "LAB"
    );
    if (enable) {
      let val = enable.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public AllowOutpatientWithProvisional() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "AllowLabReportToPrintOnProvisional" &&
        val.ParameterGroupName == "LAB"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public AllowPatientRegistrationFromBilling() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "AllowNewPatRegistrationFromBilling" &&
        val.ParameterGroupName.toLowerCase() == "billing"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //sud:7Aug'19--We shouldn't use hospital code since it's used by PatientCode format and might impact in larger scale
  //it's against best practice, so revise it and make necessary corrections after checking the impacts.
  public GetHospitalCode() {
    var code = this.Parameters.find(
      (val) =>
        val.ParameterName == "HospitalCode" &&
        val.ParameterGroupName.toLowerCase() == "common"
    );
    if (code) {
      return code.ParameterValue.toLowerCase();
    } else {
      this.msgBoxServ.showMessage("error", ["Please set HospitalCode."]);
    }
  }

  public GetHospitalNameForeHealthCard() {
    var code = this.Parameters.find(
      (val) =>
        val.ParameterName == "HospitalNameForHealthCard" &&
        val.ParameterGroupName.toLowerCase() == "common"
    );
    if (code) {
      return code.ParameterValue.toLowerCase();
    } else {
      return "default";
    }
  }

  public GetLabReportFormat() {
    var format = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabReportFormat" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (format) {
      return format.ParameterValue.toLowerCase();
    } else {
      return "format1";
    }
  }

  public GetEmailSettings() {
    var param = this.Parameters.find(
      (val) =>
        val.ParameterName == "EmailSettings" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (param) {
      var obj = JSON.parse(param.ParameterValue);
      return obj;
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please set EmailSettingParameters",
      ]);
    }
  }

  public ShowIntermediateResultOfCulture() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowCultureIntermediateResults" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please set Value for showing/hiding Intermediate Result of Culture in Lab Report in parameters.",
      ]);
    }
  }

  public ShowHideAbnormalFlag() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowHighLowNormalFlag" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public ShowLabStickerPrintOption() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowLabStickerPrintOption" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public IsReserveFeatureEnabled() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ReservePreviousBedDuringTransferFromNursing" &&
        val.ParameterGroupName.toLowerCase() == "nursing"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public IsTransferRemarksMandatory() {
    var remMandatory = this.Parameters.find(
      (val) =>
        val.ParameterName == "IsTransferRemarksMandatory" &&
        val.ParameterGroupName.toLowerCase() == "adt"
    );
    if (remMandatory) {
      let val = remMandatory.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public EnableRangeInRangeDescriptionStep() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ShowRangeInRangeDescription" &&
        val.ParameterGroupName == "LAB"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      this.msgBoxServ.showMessage("error", [
        "Please set Value for using Range in Range Description in Lab Report in parameters.",
      ]);
    }
  }

  //Anish: 2 Oct for getting the time of Refreshment in Lab Requisition Page
  public GetRefreshmentTime() {
    var refreshtime = this.Parameters.find(
      (val) =>
        val.ParameterName == "LabRequisitionReloadTimeInSec" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (refreshtime) {
      let time = refreshtime.ParameterValue;
      return time;
    } else {
      //this.msgBoxServ.showMessage("error", ["Please set Refreshment time in parameters."]);
    }
  }

  public GetTimeFrameForPatReceiveVitalsEntry() {
    var bufferTime = this.Parameters.find(
      (val) =>
        val.ParameterName == "TimeFrameInMinForVitalsOfPatToBeReceived" &&
        val.ParameterGroupName.toLowerCase() == "nursing"
    );
    if (bufferTime) {
      let time = bufferTime.ParameterValue;
      return time;
    } else {
      return 480;
      //this.msgBoxServ.showMessage("error", ["Please set Refreshment time in parameters."]);
    }
  }

  public GetRadRequisitionListColmArr() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "ImagingRequestGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetRadReportListColmArr() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "ImagingReportGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }


  public GetRequisitionListColumnArray() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "ListRequisitionGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetAddResultListColumnArray() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "AddResultGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetPendingReportListColumnArray() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "PendingReportGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetFinalReportListColumnArray() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "FinalReportGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "lab"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetBillingInvoiceDetailsColArray() {
    var colArray = this.Parameters.find(
      (val) =>
        val.ParameterName == "MaterializedViewGridColumns" &&
        val.ParameterGroupName.toLowerCase() == "systemadmin"
    );
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    } else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  //start: Sud:24Dec-to display application version in landing page..
  public InitializeAppSettings() {
    return this.coreBlService.GetAppSettings();
  }

  public appVersionNum: string = null;

  public SetAppVersionNum() {
    this.appVersionNum = null; //reset app version number before assigning the correct value.

    let appVerNum = this.AppSettings.ApplicationVersionNum;
    if (appVerNum) {
      this.appVersionNum = appVerNum;
    }

    //use below logic if we have to get the values from parameters.
    //let param = this.Parameters.find(a => a.ParameterGroupName == "Common" && a.ParameterName == 'ApplicationVersionNum');
    //if (param) {
    //    this.appVersionNum = param.ParameterValue;
    //}
  }
  //end: Sud:24Dec-to display application version in landing page..

  // get max number of item selection.
  public GetMaxNumberForTransferData() {
    var maxNumber = this.Parameters.find(
      (val) =>
        val.ParameterName == "MaximumTransferNumber" &&
        val.ParameterGroupName == "Accounting"
    );
    if (maxNumber) {
      let number = maxNumber.ParameterValue;
      return number;
    } else {
    }
  }
  // check manual accounting transfer.
  public CheckManualTransferData() {
    var check = false;
    var data = this.Parameters.find(
      (val) =>
        val.ParameterName == "AccountingTransfer" &&
        val.ParameterGroupName == "Accounting"
    );
    if (data) {
      check = JSON.parse(data.ParameterValue).ManualTransfer;
      return check;
    } else {
    }
  }
  //get Exchange Rate for Foreigner Patient
  public GetExchangeRate() {
    var rate;
    var data = this.Parameters.find(
      (val) =>
        val.ParameterName == "ExchangeRate" &&
        val.ParameterGroupName == "Billing"
    );
    if (data) {
      rate = JSON.parse(data.ParameterValue);
      return rate;
    } else {
    }
  }

  public AllowDuplicateItem() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "AllowDuplicateItemsEntryInBillingTransaction" &&
        val.ParameterGroupName.toLowerCase() == "billing"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public EnableDepartmentLevelAppointment(): boolean {
    var param = this.Parameters.find(
      (val) =>
        val.ParameterName == "EnableDepartmentLevelAppointment" &&
        val.ParameterGroupName.toLowerCase() == "visit"
    );
    if (param && param.ParameterValue.toLowerCase() == "true") {
      return true;
    } else {
      return false;
    }
  }
  // check death type
  public CheckDeathType() {
    var check = [];
    var data = this.Parameters.find(
      (val) =>
        val.ParameterName == "DeathDischargeType" &&
        val.ParameterGroupName == "ADT"
    );
    if (data) {
      check = JSON.parse(data.ParameterValue);
      return check;
    } else {
    }
  }

  public GetBirthType() {
    var check = [];
    var data = this.Parameters.find(
      (val) =>
        val.ParameterName == "BabyBirthType" && val.ParameterGroupName == "ADT"
    );
    if (data) {
      check = JSON.parse(data.ParameterValue);
      return check;
    } else {
    }
  }
  public GetHospital() {
    var currParameter = this.Parameters.find(
      (a) =>
        a.ParameterName == "CustomerHeader" && a.ParameterGroupName == "Common"
    );
    if (currParameter) return JSON.parse(currParameter.ParameterValue);
    else
      this.msgBoxServ.showMessage("error", [
        "Please set hospital detail in parameters.",
      ]);
  }
  public CheckTransferPrintReceipt() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "TransferPrintReceipt" &&
        val.ParameterGroupName == "ADT"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  public CheckReverseTransfer() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "ReverseTxnEnable" &&
        val.ParameterGroupName == "Accounting"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //Start: pratik :18 Feb2020 --- for item search in IP/OP billing transaction by itemcode
  public UseItemCodeItemSearch(): boolean {
    var currParameter = this.Parameters.find(
      (a) =>
        a.ParameterName == "UseItemCodeInItemSearch" &&
        a.ParameterGroupName == "Billing"
    );
    if (currParameter) {
      let val = currParameter.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  //End: pratik :18 Feb2020 --- for item search in IP/OP billing transaction by itemcode

  public SetShowProviderNameFlag() {
    var currval = this.Parameters.find(
      (a) =>
        a.ParameterGroupName == "Bill Print" &&
        a.ParameterName == "ShowAssignedDoctorInReceipt"
    ).ParameterValue;
    if (currval == "true") {
      return true;
    } else {
      return false;
    }
  }

  public LoadFooterNoteSettingsFromParameter() {
    let param = this.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Billing" &&
        p.ParameterName == "ProvisionalSlipFooterNoteSettings"
    );
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        var provSlipFooterParam = JSON.parse(paramValueStr);
        return provSlipFooterParam;
      }
    }
  }

  public LoadCreditOrganizationMandatory() {
    var currParameter = this.Parameters.find(
      (a) =>
        a.ParameterName == "CreditOrganizationMandatory" &&
        a.ParameterGroupName == "Billing"
    );
    if (currParameter) {
      let val = currParameter.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  public GetQueueNoSetting() {
    var currParameter = this.Parameters.find(
      (a) =>
        a.ParameterName == "QueueNoSetting" &&
        a.ParameterGroupName == "Appointment"
    );
    if (currParameter) {
      var val = JSON.parse(currParameter.ParameterValue);
      return val;
    }
  }




  public LoadOPBillRequestDoubleEntryWarningTimeHrs() {
    let param = this.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Billing" &&
        p.ParameterName == "OPBillRequestDoubleEntryWarningTimeHrs"
    );
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        var provSlipFooterParam = JSON.parse(paramValueStr);
        return provSlipFooterParam;
      }
    }
  }

  //to prevent scroll on number field, needed for Qty, Price, Discount etc in billing and related pages.
  //It can be re-used over all modules.
  public PreventNumberChangeOnScroll(evt) {
    evt.preventDefault();
  }

  public selectAutoCom(resTableWithAutoComHolder: HTMLInputElement) {
    if (
      resTableWithAutoComHolder.style.overflow &&
      resTableWithAutoComHolder.style.overflow === "inherit"
    ) {
      resTableWithAutoComHolder.style.overflow = "auto";
    } else {
      resTableWithAutoComHolder.style.overflow = "inherit";
    }
  }

  //start:mumbai team: 25Feb2020- for Accounting code details.
  public GetCodeDetails() {
    return this.coreBlService.GetCodeDetails();
  }

  public GetFiscalYearList() {
    return this.coreBlService.GetFiscalYearList();
  }
  public SetCodeDetails(res) {
    if (res.Status == "OK") {
      this.CodeDetails = res.Results;
    }
  }
  public SetFiscalYearList(res) {
    if (res.Status == "OK") {
      this.accFiscalYearList = res.Results;
    }
  }
  //End:mumbai team: 25Feb2020- for Accounting code details.

  // START:VIKAS: 22 Apr 2020: get user level date preference
  public getCalenderDatePreference() {
    return this.coreBlService.getCalenderDatePreference();
  }
  public SetCalenderDatePreference(res) {
    if (res.Status == "OK") {
      let data = res.Results;
      this.DatePreference = data != null ? data.PreferenceValue : "np";//sud:8Aug'20--hardcoded for temporary purpose.. pls correct this later..
      //sud:29May'20-Re-writing the logic and adding null check on this.Parameters.
      //sometimes this.parameters is not yet loaded when this funciton is called.. 
      if (this.DatePreference == "" && this.Parameters && this.Parameters.length > 0) {
        let param = this.Parameters.find(p => p.ParameterName == "CalendarDatePreference" && p.ParameterGroupName.toLowerCase() == "common");
        if (param) {
          let paramValueObj = JSON.parse(param.ParameterValue);
          if (paramValueObj != null) {
            if (paramValueObj.np) {
              this.DatePreference = "np";
            } else {
              this.DatePreference = "en";
            }
          }
        }

      }
    }
  }
  //END:VIKAS : 22 Apr 2020: get user level date preference

  public GetExcludedOPpages(pageName: string) {
    let retVal = [];
    let param = this.Parameters.find(p => p.ParameterName == 'ExcludeInOp' && p.ParameterGroupName.toLowerCase() == 'nursing');
    if (param) {
      let jsonData = JSON.parse(param.ParameterValue);
      if (pageName && pageName.length > 0 && jsonData) {
        if (jsonData[pageName]) {
          return jsonData[pageName];
        }
      }
    }
    return retVal;
  }

  public GetBufferTimeForReceivedOn() {
    let param = this.Parameters.find(p => p.ParameterName == 'ReceivedOnDateBufferTime' && p.ParameterGroupName.toLowerCase() == 'nursing');
    if (param) {
      let min = +param.ParameterValue;
      return min;
    }
    return 10;
  }

  //sud:29May'20--for Calendar Settings.
  public GetSoftwareStartYear_Np(): number {
    let retValue = 2073;//this is the year our software was started.. (1st Version in MNK Hospital)
    if (this.Parameters) {
      let param = this.Parameters.find(p => p.ParameterName == 'SoftwareStartYearInBS' && p.ParameterGroupName.toLowerCase() == 'common');
      if (param) {
        retValue = +param.ParameterValue;//it changes string to number
      }
    }
    return retValue;
  }

  public HoldRadIPBillBeforeScan() {
    var hold = this.Parameters.find(
      (val) =>
        val.ParameterName == "RadHoldIPBillBeforeScan" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (hold) {
      let val = hold.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public GetRadiologyScanCondition() {
    var scan = this.Parameters.find(
      (val) =>
        val.ParameterName == "EnableRadScan" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (scan) {
      let val = scan.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public GetIpBillCancellationRule() {
    var canclrule = this.Parameters.find(
      (val) =>
        val.ParameterName == "CancellationRules" &&
        val.ParameterGroupName.toLowerCase() == "common"
    );

    if (canclrule) {
      return JSON.parse(canclrule.ParameterValue);
    }
    return canclrule;
  }

  public GetOpBillCancellationRule() {
    var canclrule = this.Parameters.find(
      (val) =>
        val.ParameterName == "CancellationRules" &&
        val.ParameterGroupName.toLowerCase() == "common"
    );

    if (canclrule) {
      return JSON.parse(canclrule.ParameterValue);
    }
    return canclrule;
  }

  public GetIpBillOrderStatusSettingB4Discharge() {
    var DischargeRule = this.Parameters.find(
      (val) =>
        val.ParameterName == "OrderStatusSettingB4Discharge" &&
        val.ParameterGroupName == "Billing"
    );
    if (DischargeRule) {
      return JSON.parse(DischargeRule.ParameterValue);
    }

    return DischargeRule;
  }

  //sud: Copied from IpBilling-OrderStatus, this can be overwritten later after merging. 
  public LoadIPBillRequestDoubleEntryWarningTimeHrs(): number {
    let param = this.Parameters.find(
      (p) =>
        p.ParameterGroupName == "Billing" &&
        p.ParameterName == "IPBillRequestDoubleEntryWarningTimeHrs"
    );
    if (param) {
      let paramValueStr = param.ParameterValue;
      if (paramValueStr) {
        var provSlipFooterParam = JSON.parse(paramValueStr);
        return parseInt(provSlipFooterParam);
      }
    }
    else {
      return 0;
    }
  }

  public UpdateAssignedToDoctorFromAddReportSignatory() {
    var show = this.Parameters.find(
      (val) =>
        val.ParameterName == "Rad_UpdateAssignedToDoctorOnAddReport" &&
        val.ParameterGroupName.toLowerCase() == "radiology"
    );
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == "true") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

export class LookupsModel {
  public ModuleName: string = null;
  public LookupName: string = null;
  public LookupDataJson: string = null;
}
