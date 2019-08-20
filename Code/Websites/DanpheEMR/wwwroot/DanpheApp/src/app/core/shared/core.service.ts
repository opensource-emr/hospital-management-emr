import { Injectable, Directive } from '@angular/core';
import { ParameterModel } from './parameter.model'
import { CoreBLService } from './core.bl.service';
import { CommonMaster } from '../../shared/common-masters.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { DanpheAppSettings } from '../../shared/common-models';


@Injectable()
export class CoreService {
  //the value of below property is getting assigned in the appcomponent (i.e: the first loaded component).
  public Parameters: Array<ParameterModel> = null;
  public Masters: CommonMaster = new CommonMaster();
  public LookUps: Array<LookupsModel> = new Array<LookupsModel>();

  public AppSettings: DanpheAppSettings = null;//sud:25Dec'18

  //TAX PARAMETER
  public taxLabel: string = "";
  public currencyUnit: string = "";
  constructor(public coreBlService: CoreBLService, public msgBoxServ: MessageboxService) {

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
      this.Masters.Taxes = masters.Taxes;
      this.Masters.Departments = masters.Departments;
      this.Masters.UniqueDataList = masters.UniqueDataList;
    }
  }

  public GetAllLookups() {
    return this.coreBlService.GetLookups();
  }

  public SetAllLookUps(res) {
    if (res.Status == "OK") {
      let allLookups: Array<LookupsModel> = res.Results;
      allLookups.forEach(lkp => {
        this.LookUps.push({ ModuleName: lkp.ModuleName, LookupName: lkp.LookupName, LookupDataJson: lkp.LookupDataJson });
      });
    }
  }

  public GetModuleLookups(moduleName: string) {
    if (moduleName) {
      return this.LookUps.filter(a => a.ModuleName == moduleName);
    }
  }

  public SetCurrencyUnit() {
    var currParameter = this.Parameters.find(a => a.ParameterName == "Currency")
    if (currParameter)
      this.currencyUnit = JSON.parse(currParameter.ParameterValue).CurrencyUnit;
    else
      this.msgBoxServ.showMessage("error", ["Please set currency unit in parameters."]);
  }
  public GetHospitalDetail() {
    var currParameter = this.Parameters.find(a => a.ParameterName == "HospitalDetail")
    if (currParameter)
      return JSON.parse(currParameter.ParameterValue);
    else
      this.msgBoxServ.showMessage("error", ["Please set hospital detail in parameters."]);
  }
  public SetTaxLabel() {
    var currParameter = this.Parameters.find(a => a.ParameterName == "TaxInfo")
    if (currParameter) {
      this.taxLabel = JSON.parse(currParameter.ParameterValue).TaxLabel;
    }
    else
      this.msgBoxServ.showMessage("error", ["Please set Tax Info in parameters."]);
  }

  //public GetRadImgUploadConfig() {
  //  var currParameter = this.Parameters.find(a => a.ParameterGroupName=="Radiology" && a.ParameterName == "ImageUpload")
  //  if (currParameter)
  //    return JSON.parse(currParameter.ParameterValue).enableImgUpload;
  //  else
  //    this.msgBoxServ.showMessage("error", ["Please set radiology image upload configuration."]);
  //}

  public GetEnableHealthCard(): boolean {
    var currParameter = this.Parameters.find(a => a.ParameterName == "EnableHealthCard")
    if (currParameter) {
      return JSON.parse(currParameter.ParameterValue).enableHealthCard;
    }
    else {
      console.log("Healthcard information is not set in parameters.");
      //this.msgBoxServ.showMessage("notice", ["Please set health card configuration."]);
      return false;
    }

  }

  public GetServiceIntegrationName(srvDeptName: string): string {
    let srvDepts = this.Masters.ServiceDepartments;
    let srvDept = srvDepts.find(a => a.ServiceDepartmentName == srvDeptName);
    return srvDept ? srvDept.IntegrationName : null;
  }
  //ashim: 22Aug2018: Used in visit-patient-info.component
  public GetDefaultCountry() {
    let countryJson = this.Parameters.find(a => a.ParameterName == 'DefaultCountry');
    if (countryJson)
      return JSON.parse(countryJson.ParameterValue);

  }
  public GetDefaultCountrySubDivision() {
    let subDivisionJSON = this.Parameters.find(a => a.ParameterName == "DefaultCountrySubDivision");
    if (subDivisionJSON)
      return JSON.parse(subDivisionJSON.ParameterValue);

  }
  public GetLabReportHeaderSetting() {
    let labReportHeaderJSON = this.Parameters.find(val => val.ParameterName == 'LabReportHeader');
    if (labReportHeaderJSON) {
      return JSON.parse(labReportHeaderJSON.ParameterValue);
    }
  }
  //ashim: 06Sep2018 displaying default signatoire in lab
  public GetDefaultEmpIdForLabSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(val => val.ParameterGroupName.toLowerCase() == 'lab' && val.ParameterName == 'DefaultSignatoriesEmpId');
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  //anish: 28Nov2018 displaying default signatoire for histo/cyto in lab
  public GetDefaultHistoCytoEmpIdForLabSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(val => val.ParameterGroupName.toLowerCase() == 'lab' && val.ParameterName == 'DefaultHistoCytoSignatoriesEmpId');
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  public GetDefEmpIdForRadSignatories(): Array<number> {
    let empIdList = [];
    let empIdListJSON = this.Parameters.find(val => val.ParameterGroupName.toLowerCase() == 'radiology' && val.ParameterName == 'DefaultSignatoriesEmployeeId');
    if (empIdListJSON) {
      empIdList = JSON.parse(empIdListJSON.ParameterValue).empIdList;
    }
    return empIdList;
  }

  //anish: 15 Sept for getting the name of Hospital for which it is made
  public GetHospitalName() {
    var hospitalName = this.Parameters.find(val => (val.ParameterName == 'HospitalName' && val.ParameterGroupName == 'Common'));
    if (hospitalName) {
      let name = hospitalName.ParameterValue.toLowerCase();
      name = name.replace(/ +/g, "");
      return name;
    } else {
      this.msgBoxServ.showMessage("error", ["Please set Hospital Name in parameters."]);
    }
  }

  //anish: for getting the name of Hospital for which it is made
  public ShowLoggedInUserSignatory() {
    var show = this.Parameters.find(val => (val.ParameterName == 'ShowLoggedInUserSignatory' && val.ParameterGroupName.toLowerCase()  == 'lab'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }

  public ShowPrintInformationInLabReport() {
    var show = this.Parameters.find(val => (val.ParameterName == 'DisplayingPrintInfo' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }


  //anish: for showing or hiding BarCode in LabReport
  public ShowBarCodeInLabReport() {
    var show = this.Parameters.find(val => (val.ParameterName == 'ShowLabBarCodeInReport' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
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
    var show = this.Parameters.find(val => (val.ParameterName == 'LabReportVerificationNeededB4Print' && val.ParameterGroupName == 'LAB'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }

  public AllowOutpatientWithProvisional() {
    var show = this.Parameters.find(val => (val.ParameterName == 'AllowLabReportToPrintOnProvisional' && val.ParameterGroupName == 'LAB'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public AllowPatientRegistrationFromBilling() {
    var show = this.Parameters.find(val => (val.ParameterName == 'AllowNewPatRegistrationFromBilling' && val.ParameterGroupName.toLowerCase() == 'billing'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
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
    var code = this.Parameters.find(val => (val.ParameterName == 'HospitalCode' && val.ParameterGroupName.toLowerCase() == 'common'));
    if (code) {
      return code.ParameterValue.toLowerCase();
    } else {
      this.msgBoxServ.showMessage("error", ["Please set HospitalCode."]);
    }
  }

  public GetEmailSettings() {
    var param = this.Parameters.find(val => (val.ParameterName == 'EmailSettings' && val.ParameterGroupName.toLowerCase() == 'radiology'));
    if (param) {
      var obj = JSON.parse(param.ParameterValue);
      return obj;
    } else {
      this.msgBoxServ.showMessage("error", ["Please set EmailSettingParameters"]);
    }
  }

  public ShowIntermediateResultOfCulture() {
    var show = this.Parameters.find(val => (val.ParameterName == 'ShowCultureIntermediateResults' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      this.msgBoxServ.showMessage("error", ["Please set Value for showing/hiding Intermediate Result of Culture in Lab Report in parameters."]);
    }
  }

  public ShowHideAbnormalFlag() {
    var show = this.Parameters.find(val => (val.ParameterName == 'ShowHighLowNormalFlag' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }

  public EnableRangeInRangeDescriptionStep() {
    var show = this.Parameters.find(val => (val.ParameterName == 'ShowRangeInRangeDescription' && val.ParameterGroupName == 'LAB'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }
    } else {
      this.msgBoxServ.showMessage("error", ["Please set Value for using Range in Range Description in Lab Report in parameters."]);
    }
  }

  //Anish: 2 Oct for getting the time of Refreshment in Lab Requisition Page
  public GetRefreshmentTime() {
    var refreshtime = this.Parameters.find(val => (val.ParameterName == 'LabRequisitionReloadTimeInSec' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (refreshtime) {
      let time = refreshtime.ParameterValue;
      return time;
    } else {
      //this.msgBoxServ.showMessage("error", ["Please set Refreshment time in parameters."]);
    }
  }

  public GetRequisitionListColumnArray() {
    var colArray = this.Parameters.find(val => (val.ParameterName == 'ListRequisitionGridColumns' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    }
    else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetAddResultListColumnArray() {
    var colArray = this.Parameters.find(val => (val.ParameterName == 'AddResultResultGridColumns' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    }
    else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetPendingReportListColumnArray() {
    var colArray = this.Parameters.find(val => (val.ParameterName == 'PendingReportGridColumns' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    }
    else {
      return null;
      //this.msgBoxServ.showMessage("error", ["Please set Column array"]);
    }
  }

  public GetFinalReportListColumnArray() {
    var colArray = this.Parameters.find(val => (val.ParameterName == 'FinalReportGridColumns' && val.ParameterGroupName.toLowerCase() == 'lab'));
    if (colArray) {
      return JSON.parse(colArray.ParameterValue);
    }
    else {
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
    this.appVersionNum = null;//reset app version number before assigning the correct value.

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
    var maxNumber = this.Parameters.find(val => val.ParameterName == 'MaximumTransferNumber' && val.ParameterGroupName == 'Accounting');
    if (maxNumber) {
      let number = maxNumber.ParameterValue;
      return number;
    } else {

    }
  }
  // check manual accounting transfer.
  public CheckManualTransferData() {
    var check = false;
    var data = this.Parameters.find(val => val.ParameterName == 'AccountingTransfer' && val.ParameterGroupName == 'Accounting');
    if (data) {
      check = JSON.parse(data.ParameterValue).ManualTransfer;
      return check;
    } else {

    }
  }
  //get Exchange Rate for Foreigner Patient
  public GetExchangeRate() {
    var rate;
    var data = this.Parameters.find(val => val.ParameterName == 'ExchangeRate' && val.ParameterGroupName == 'Billing');
    if (data) {
      rate = JSON.parse(data.ParameterValue);
      return rate;
    } else {

    }
  }

  public AllowDuplicateItem() {
    var show = this.Parameters.find(val => (val.ParameterName == 'AllowDuplicateItemsEntryInBillingTransaction' && val.ParameterGroupName.toLowerCase() == 'billing'));
    if (show) {
      let val = show.ParameterValue.toLowerCase();
      if (val == 'true') {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }

  public EnableDepartmentLevelAppointment(): boolean {
    var param = this.Parameters.find(val => (val.ParameterName == 'EnableDepartmentLevelAppointment' && val.ParameterGroupName.toLowerCase() == 'visit'));
    if (param && param.ParameterValue.toLowerCase() == "true") {
      return true;
    }
    else {
      return false;
    }
  }
  // check death type
  public CheckDeathType() {
    var check =[];
    var data = this.Parameters.find(val => val.ParameterName == 'DeathDischargeType' && val.ParameterGroupName == 'ADT');
    if (data) {
      check = JSON.parse(data.ParameterValue);
      return check;
    } else {

    }
  }

  public GetBirthType(){
    var check =[];
    var data = this.Parameters.find(val => val.ParameterName == 'BabyBirthType' && val.ParameterGroupName == 'ADT');
    if (data) {
      check = JSON.parse(data.ParameterValue);
      return check;
    } else {

    }
  }
  public GetHospital() {
    var currParameter = this.Parameters.find(a => a.ParameterName == "CustomerHeader"  && a.ParameterGroupName == 'Common')
    if (currParameter)
      return JSON.parse(currParameter.ParameterValue);
    else
      this.msgBoxServ.showMessage("error", ["Please set hospital detail in parameters."]);
  }

}


export class LookupsModel {
  public ModuleName: string = null;
  public LookupName: string = null;
  public LookupDataJson: string = null;

}
