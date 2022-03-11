/*
 Description:
    - It handles visit's informations.
    - Get's department list, doctor's list, filter doctor's list according to department, assign selected doctor from autocomplete.
    - Emit's selected doctor to visit.main.component which then passes as @Input to visit-billing-information.component for further calculations.
        
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       ashim/ 23rd Aug 2018           created            
                                                     
 -------------------------------------------------------------------
 */
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Visit } from "../../../appointments/shared/visit.model";
import { VisitBLService } from "../../../appointments/shared/visit.bl.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { CoreService } from "../../../core/shared/core.service";
import { Department } from "../../../settings-new/shared/department.model";
import { AppointmentService } from "../../../appointments/shared/appointment.service";
import { VisitService } from "../../../appointments/shared/visit.service";
import { Subscription } from "rxjs";
import { ENUM_VisitType } from "../../../shared/shared-enums";
import { SettingsBLService } from "../../../settings-new/shared/settings.bl.service";
import * as moment from "moment";
import { InsuranceService } from "../../shared/ins-service";
import { InsuranceBlService } from "../../shared/insurance.bl.service";
import { PatientService } from "../../../patients/shared/patient.service";

@Component({
  selector: "ins-new-visit-info",
  templateUrl: "./ins-new-visit-info.html"
})
export class InsuranceVisitInfoComponent implements OnInit {
  @Input("visit")
  public visit: Visit = new Visit();
  public doctorList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }> = [];
  public filteredDocList: Array<{ DepartmentId: number, DepartmentName: string, ProviderId: number, ProviderName: string, ItemName: string, Price: number, IsTaxApplicable: boolean, SAARCCitizenPrice: number, ForeignerPrice: number }>;
  public selectedDoctor = { DepartmentId: 0, DepartmentName: "", ProviderId: 0, ProviderName: "", ItemName: "", Price: 0, IsTaxApplicable: false, DepartmentLevelAppointment: false };
  public selectedDepartment = { DepartmentId: 0, DepartmentName: "" };

  public departmentList: Array<Department>;
  public departmentId: number;
  public providerId: number;
  @Input("isInsuranceBilling")
  public isInsuranceBilling: boolean = false;

  enableDepartmentLevelAppointment: boolean;
  public priceCategoryChanged: Subscription;
  public showDocMandatory: boolean = false; //this is used to show either doctor is mandatory or not// it is used only in case of EHS price selection --Yubraj 23rd 2019

  public visitTimeDiff: number = null;
  public claimCodeType: string = "new";

  //by default we assume that the patient has last-claim code. 
  //if last claim code not found then we'll disable the checkbox based on this flag value. 
  public isLastClaimCodeFound: boolean = true;

  constructor(
    public insuranceBLService: InsuranceBlService,
    public insuranceService: InsuranceService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public patientService: PatientService) {
    this.GetVisitDoctors();
    this.GetDepartments();

    this.LoadReferrerSettings();
    this.Loadparameters();
    let paramValue = this.coreService.EnableDepartmentLevelAppointment();
    if (paramValue) {
      this.enableDepartmentLevelAppointment = false;
      this.showDocMandatory = false;
      var EHSFlag = this.enableDepartmentLevelAppointment;
    }
    else {
      this.enableDepartmentLevelAppointment = true;
      this.showDocMandatory = true;
      var EHSFlag = this.enableDepartmentLevelAppointment;
    }
    this.insuranceService.TriggerBillChangedEvent({ ChangeType: "DepartmentLevelAppointment", DepartmentLevelAppointment: paramValue });

    //Subscriber as it get the change made from visit-info.component.ts
    this.priceCategoryChanged = insuranceService.ObserveBillChanged.subscribe(
      newBill => {
        if (!EHSFlag) {
          if (newBill.ChangeType == "PriceCategory") {
            if (newBill.PriceCategory == "EHS") {
              this.showDocMandatory = true;
              this.visit.UpdateValidator("on", "Doctor", "required");
              if (this.selectedDoctor != null) {
                this.visit.IsValidSelProvider = true;
              }
              else {
                this.visit.IsValidSelProvider = false;
              }
            }
            else {
              this.showDocMandatory = false;
              this.visit.UpdateValidator("off", "Doctor", null);
              this.visit.IsValidSelProvider = true;
            }
          }
        }
      });

    this.visitTimeDiff = this.coreService.Parameters.find(p => p.ParameterGroupName == "Appointment" && p.ParameterName == "VisitTimeDifferenceMinutes").ParameterValue;
    this.visit.VisitTime = moment().add(this.visitTimeDiff, 'minutes').format('HH:mm');
    setInterval(() => {
      if (this.visit.VisitTime)
        this.visit.VisitTime = moment().add(this.visitTimeDiff, 'minutes').format('HH:mm');;
    }, 1000);

  }

  ngOnInit() {
    if (this.insuranceService.appointmentType.toLowerCase() == "transfer") {
      this.visit.ParentVisitId = this.insuranceService.ParentVisitInfo.PatientVisitId;
      this.visit.TransferredProviderId = this.insuranceService.ParentVisitInfo.ProviderId;
    }
    else if (this.insuranceService.appointmentType.toLowerCase() == "referral") {
      this.visit.ParentVisitId = this.insuranceService.ParentVisitInfo.PatientVisitId;
      this.visit.ReferredByProviderId = this.insuranceService.ParentVisitInfo.ProviderId;
    }
    else if (this.insuranceService.appointmentType.toLowerCase() == "followup") {
      //sud:26June'19-- for Followup - By default assign Past Department and Past provider to current One. User will change it if required.
      this.visit.ParentVisitId = this.insuranceService.ParentVisitInfo.PatientVisitId;

      this.selectedDepartment.DepartmentName = this.insuranceService.ParentVisitInfo.DepartmentName;
      this.selectedDepartment.DepartmentId = this.insuranceService.ParentVisitInfo.DepartmentId;

      this.visit.DepartmentId = this.insuranceService.ParentVisitInfo.DepartmentId;
      this.visit.DepartmentName = this.insuranceService.ParentVisitInfo.DepartmentName;

      this.visit.ProviderId = this.insuranceService.ParentVisitInfo.ProviderId;
      this.visit.ClaimCode = this.insuranceService.ParentVisitInfo.ClaimCode;

      //if Parent visit has DepartmentID, then load only doctors of that department at the beginning.
      if (this.insuranceService.ParentVisitInfo.DepartmentId) {
        this.departmentId = this.insuranceService.ParentVisitInfo.DepartmentId;
        this.FilterDoctorList();
      }
      //If earlier appointment was made for a Doctor (DoctorId Not Null)  then Set that doctor by default for followup.
      //user can change the doctor or Department if required. 
      if (this.insuranceService.ParentVisitInfo.ProviderId) {
        this.selectedDoctor.ProviderName = this.insuranceService.ParentVisitInfo.ProviderName;
        this.selectedDoctor.ProviderId = this.insuranceService.ParentVisitInfo.ProviderId;
      }
    }

    this.enableDepartmentLevelAppointment = this.coreService.EnableDepartmentLevelAppointment();

    //if departmentlevel appointment is allowed then we don't need to validate providerid field.
    if (this.enableDepartmentLevelAppointment) {
      this.visit.UpdateValidator("off", "Doctor", null);
    }
    else {
      this.visit.UpdateValidator("on", "Doctor", "required");
    }

    this.AssignAppointmentDetails();
  }

  // visit info
  public ShowDoctor: boolean = false;
  public ShowReason: boolean = false;
  public ShowReferredBy: boolean = false;
  public EnableAutoGenerate: boolean = false;

  Loadparameters() {
    let Parameter = this.coreService.Parameters;

    let displayfieldsParameter = Parameter.filter(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "InsNewVisitDisplaySettings");
    let parmObj = JSON.parse(displayfieldsParameter[0].ParameterValue);
    this.ShowDoctor = parmObj.ShowDoctor;
    this.ShowReason = parmObj.ShowReason;
    this.ShowReferredBy = parmObj.ShowReferredBy;
    let enableclaimcode = Parameter.filter(parms => parms.ParameterGroupName == 'Insurance' && parms.ParameterName == "ClaimCodeAutoGenerateSettings");
    let claimparmObj = JSON.parse(enableclaimcode[0].ParameterValue);
    this.EnableAutoGenerate = claimparmObj.EnableAutoGenerate;
    if (this.patientService.getGlobal().Ins_HasInsurance == true) {
      this.visit.EnableControl("ClaimCode", true);
      this.GetClaimcode();
    }
    else {
      this.visit.EnableControl("ClaimCode", false);
    }
  }
  GetClaimcode() {
    if (this.claimCodeType == "new") {
      this.GetNewClaimcode();
      this.visit.IsLastClaimCodeUsed = false;//sud:1-Oct'21
    }
    else if (this.claimCodeType == "old") {
      this.GetOldClaimcode();
    }
  }
  GetNewClaimcode() {
    this.insuranceBLService.GetClaimCode()
      .subscribe(res => {
        if (res.Status == "OK") {
          this.visit.ClaimCode = res.Results
        }
        else if (res.Status == "Failed") {
          this.visit.ClaimCode = res.Results;
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          console.log(res.Errors);

        }
        else {
          this.msgBoxServ.showMessage("error", ['Could Not get Claim code!']);
          console.log(res.Errors);
        }
      });
  }
  GetOldClaimcode() {
    this.insuranceBLService.GetOldClaimcode(this.visit.PatientId)
      .subscribe(res => {
        if (res.Status == "OK") {
          this.visit.ClaimCode = res.Results
          this.visit.IsLastClaimCodeUsed = true;//sud:1-Oct'21
        }
        else if (res.Status == "Failed") {
          this.visit.ClaimCode = res.Results;
          this.visit.IsLastClaimCodeUsed = false;//sud:1-Oct'21
          this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
          //get new claim code automatically when Old claimcode is not there or api fails by any reason.
          this.claimCodeType = "new";
          this.isLastClaimCodeFound = false;//this disables the 'Last Code' checkbox so that user can't click on it again and again.
          this.GetNewClaimcode();
          console.log(res.Errors);
        }
        else {
          this.msgBoxServ.showMessage("error", ['Could Not get Claim code!']);
          console.log(res.Errors);
        }
      });
  }

  //needed for Bill-Change events..
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.priceCategoryChanged.unsubscribe();
  }

  AssignAppointmentDetails() {
    if (this.insuranceService.GetInsAppointment().AppointmentId) {
      let appointment = this.insuranceService.GetInsAppointment();

      //assign values if the property of appointment and visit are same.
      Object.keys(appointment).forEach(property => {
        if (property in this.visit) {
          this.visit[property] = appointment[property];
        }
      });

      //assign provider and department information if it was filled during appointment.
      if (this.visit.ProviderName) {
        this.selectedDoctor.ProviderName = this.visit.ProviderName;
        this.selectedDoctor.ProviderId = this.visit.ProviderId;
      }
      if (this.visit.DepartmentId) {
        this.selectedDepartment.DepartmentId = this.visit.DepartmentId;
        let dep = this.departmentList.find(a => a.DepartmentId == this.visit.DepartmentId);
        if (dep) {
          this.selectedDepartment.DepartmentName = dep.DepartmentName;
        }
      }



      ////EMR-999: If doctor was set from Appointment page, then assign the price etc for him/her.-sud:25Oct'19
      //if (this.selectedDoctor && this.selectedDoctor.ProviderId) {
      //  this.AssignSelectedDoctor();
      //}

    }
  }



  GetDepartments() {
    this.insuranceBLService.GetDepartment()
      .subscribe(res => {
        if (res.Status == "OK")
          this.departmentList = res.Results;
        if (this.visit.PatientId) {
          this.SetFocusById('txtDepartment');
        }
      });
  }

  GetVisitDoctors() {
    //sud:25June'19--get the list from pre-loaded functions.
    this.filteredDocList = this.doctorList = this.insuranceService.ApptApplicableDoctorsList;
    this.AssignSelectedDoctor();
  }

  FilterDoctorList() {
    if (this.selectedDoctor != null) {
      if (typeof (this.selectedDoctor) == 'object') {
        this.selectedDoctor.ProviderName = "";
        this.selectedDoctor.ProviderId = 0;
      }
    }
    if (this.departmentId && Number(this.departmentId) != 0) {
      this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);

    }
    else {
      this.filteredDocList = this.doctorList;
    }
  }

  public AssignSelectedDoctor() {
    let doctor = null;
    // check if user has given proper input string for item name
    //or has selected object properly from the dropdown list.
    //        this.emitDoctorDetail.emit({ "selectedDoctor": null });
    if (this.selectedDoctor && this.doctorList && this.doctorList.length) {
      if (typeof (this.selectedDoctor) == 'string') {
        doctor = this.doctorList.find(a => a.ProviderName.toLowerCase() == String(this.selectedDoctor).toLowerCase());
      }
      else if (typeof (this.selectedDoctor) == 'object' && this.selectedDoctor.ProviderId)
        doctor = this.doctorList.find(a => a.ProviderId == this.selectedDoctor.ProviderId);
      if (doctor) {
        //to filter doctor List after department is changed (flow: assigning department by selecting doctor).
        this.departmentId = doctor.DepartmentId;
        this.selectedDepartment = doctor.DepartmentName;
        this.filteredDocList = this.doctorList.filter(doc => doc.DepartmentId == this.departmentId);
        this.selectedDoctor = Object.assign(this.selectedDoctor, doctor);
        this.visit.ProviderId = doctor.ProviderId;//this will give providerid
        this.visit.ProviderName = doctor.ProviderName;
        this.visit.IsValidSelProvider = true;
        this.visit.IsValidSelDepartment = true;
        this.visit.DepartmentId = doctor.DepartmentId;
        this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
      }
      else {
        this.visit.ProviderId = null;
        this.visit.ProviderName = null;
        this.visit.IsValidSelProvider = false;

        //if (!this.enableDepartmentLevelAppointment || this.insuranceService.PriceCategory != "Normal") {

        //}
      }
    }
    else {
      this.visit.ProviderId = null;
      this.visit.ProviderName = null;
      this.AssignSelectedDepartment();//sud:19June'19-- If doctor is not proper then assign bill items that of Department level.
    }
  }

  public AssignSelectedDepartment() {
    let department = null;
    //        this.emitDepartmentDetail.emit({ "selectedDepartment": null });
    if (this.selectedDepartment && this.departmentList && this.departmentList.length) {
      if (typeof (this.selectedDepartment) == 'string') {
        department = this.departmentList.find(a => a.DepartmentName.toLowerCase() == String(this.selectedDepartment).toLowerCase());
      }
      else if (typeof (this.selectedDepartment) == 'object' && this.selectedDepartment.DepartmentId)
        department = this.departmentList.find(a => a.DepartmentId == this.selectedDepartment.DepartmentId);
      if (department) {
        this.selectedDepartment = Object.assign(this.selectedDepartment, department);
        this.departmentId = department.DepartmentId;
        this.visit.IsValidSelDepartment = true;
        this.visit.IsValidSelProvider = true;
        this.visit.DepartmentId = department.DepartmentId;
        this.visit.DepartmentName = department.DepartmentName;
        this.visit.DeptRoomNumber = department.RoomNumber;
        this.selectedDoctor = null;
        this.FilterDoctorList();

        //getting emergency name from the parameterized data
        let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
        if (erdeptnameparam) {
          let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
          //temporary solution for : er-visit based on departmentname. yubaraj:20june'19-- get these from server side or from configuration for proper solution.
          if (department.DepartmentName.toLowerCase() == erdeptname) {
            this.visit.VisitType = ENUM_VisitType.emergency;// "emergency";
          }
          else {
            this.visit.VisitType = ENUM_VisitType.outpatient;// "outpatient";
          }
        }
        this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
        //emit is also done directly from FilterDoctorList() function in case of enableDepartmentLevelAppointment is false, therefore the condiiton is recheck for correct emit.
        //if (!this.enableDepartmentLevelAppointment) {
        //  this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
        //}
      }
      else {
        this.visit.IsValidSelDepartment = false;
        this.visit.IsValidSelProvider = false;
      }
    }
    else {
      this.departmentId = 0;
      this.visit.DepartmentId = 0;
      this.visit.DepartmentName = null;
      this.filteredDocList = this.doctorList;
    }
  }

  myDepartmentListFormatter(data: any): string {
    let html = data["DepartmentName"];
    return html;
  }

  DocListFormatter(data: any): string {
    let html = data["ProviderName"];
    return html;
  }


  //prat: 13sep2019 for internal and external referrer 
  public defaultExtRef: boolean = true;
  selectedRefId: number = null;

  OnReferrerChanged($event) {
    this.selectedRefId = $event.ReferrerId; //EmployeeId comes as ReferrerId from select referrer component.
    if (this.selectedRefId) {
      //assign referredByProviderId if any one is selecteed from Referred By Dropdown.
      this.visit.ReferredByProviderId = this.selectedRefId;
      this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Referral", ReferredBy: this.selectedRefId });
    }
    else {
      this.insuranceService.TriggerBillChangedEvent({ ChangeType: "Referral", ReferredBy: null });
    }
  }


  public ExtRefSettings = { EnableExternal: true, DefaultExternal: true };

  public LoadReferrerSettings() {
    var currParam = this.coreService.Parameters.find(a => a.ParameterGroupName == "Appointment" && a.ParameterName == "ExternalReferralSettings");
    if (currParam && currParam.ParameterValue) {
      this.ExtRefSettings = JSON.parse(currParam.ParameterValue);
    }
  }

  //end: Pratik: 12Sept'19--For External Referrals

  SetFocusById(IdToBeFocused: string) {
    window.setTimeout(function () {
      let elemToFocus = document.getElementById(IdToBeFocused)
      if (elemToFocus != null && elemToFocus != undefined) {
        elemToFocus.focus();
      }
    }, 100);
  }


}

