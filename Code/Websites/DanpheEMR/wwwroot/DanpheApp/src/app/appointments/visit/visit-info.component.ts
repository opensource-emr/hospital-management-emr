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
import { Visit } from "../shared/visit.model";
import { VisitBLService } from "../shared/visit.bl.service";
import { MessageboxService } from "../../shared/messagebox/messagebox.service";
import { CoreService } from "../../core/shared/core.service";
import { Department } from "../../settings/shared/department.model";
import { VisitBillItemVM } from "../shared/quick-visit-view.model";
import { AppointmentService } from "../shared/appointment.service";
import { VisitService } from "../shared/visit.service";
import { Subscription } from "rxjs";

@Component({
  selector: "visit-info",
  templateUrl: "./visit-info.html"
})
export class VisitInfoComponent implements OnInit {
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
  constructor(public visitBLService: VisitBLService,
    public msgBoxServ: MessageboxService,
    public coreService: CoreService,
    public appointmentService: AppointmentService,
    public visitService: VisitService) {
    this.GetVisitDoctors();
    this.GetDepartments();

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
    this.visitService.TriggerBillChangedEvent({ ChangeType: "DepartmentLevelAppointment", DepartmentLevelAppointment: paramValue });

    //Subscriber as it get the change made from visit-info.component.ts
    this.priceCategoryChanged = visitService.ObserveBillChanged.subscribe(
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
  }

  ngOnInit() {
    this.AssignAppoinementDetails();
    if (this.visitService.appointmentType.toLowerCase() == "transfer") {
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.visit.TransferredProviderId = this.visitService.ParentVisitInfo.ProviderId;
    }
    else if (this.visitService.appointmentType.toLowerCase() == "referral") {
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;
      this.visit.ReferredByProviderId = this.visitService.ParentVisitInfo.ProviderId;
    }
    else if (this.visitService.appointmentType.toLowerCase() == "followup") {
      //sud:26June'19-- for Followup - By default assign Past Department and Past provider to current One. User will change it if required.
      this.visit.ParentVisitId = this.visitService.ParentVisitInfo.PatientVisitId;

      this.selectedDepartment.DepartmentName = this.visitService.ParentVisitInfo.DepartmentName;
      this.selectedDepartment.DepartmentId = this.visitService.ParentVisitInfo.DepartmentId;

      this.visit.DepartmentId = this.visitService.ParentVisitInfo.DepartmentId;
      this.visit.DepartmentName = this.visitService.ParentVisitInfo.DepartmentName;

      this.visit.ProviderId = this.visitService.ParentVisitInfo.ProviderId;

      //if Parent visit has DepartmentID, then load only doctors of that department at the beginning.
      if (this.visitService.ParentVisitInfo.DepartmentId) {
        this.departmentId = this.visitService.ParentVisitInfo.DepartmentId;
        this.FilterDoctorList();
      }
      //If earlier appointment was made for a Doctor (DoctorId Not Null)  then Set that doctor by default for followup.
      //user can change the doctor or Department if required. 
      if (this.visitService.ParentVisitInfo.ProviderId) {
        this.selectedDoctor.ProviderName = this.visitService.ParentVisitInfo.ProviderName;
        this.selectedDoctor.ProviderId = this.visitService.ParentVisitInfo.ProviderId;
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

  }

  //needed for Bill-Change events..
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.priceCategoryChanged.unsubscribe();
  }


  AssignAppoinementDetails() {
    if (this.appointmentService.getGlobal().AppointmentId) {
      let appointment = this.appointmentService.getGlobal();

      //assign values if the property of appointment and visit are same.
      Object.keys(appointment).forEach(property => {
        if (property in this.visit) {
          this.visit[property] = appointment[property];
        }
      });
      this.selectedDoctor.ProviderName = this.visit.ProviderName;
      this.selectedDoctor.ProviderId = this.visit.ProviderId;
    }
  }



  GetDepartments() {
    this.departmentList = this.visitService.ApptApplicableDepartmentList;
  }

  GetVisitDoctors() {
    //sud:25June'19--get the list from pre-loaded functions.
    this.filteredDocList = this.doctorList = this.visitService.ApptApplicableDoctorsList;
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

        this.visitService.TriggerBillChangedEvent({ ChangeType: "Doctor", SelectedDoctor: this.selectedDoctor });
      }
      else {
        this.visit.ProviderId = null;
        this.visit.ProviderName = null;
        this.visit.IsValidSelProvider = false;

        //if (!this.enableDepartmentLevelAppointment || this.visitService.PriceCategory != "Normal") {

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
        this.selectedDoctor = null;
        this.FilterDoctorList();

        //getting emergency name from the parameterized data
        let erdeptnameparam = this.coreService.Parameters.find(p => p.ParameterGroupName.toLowerCase() == "common" && p.ParameterName.toLowerCase() == "erdepartmentname");
        if (erdeptnameparam) {
          let erdeptname = erdeptnameparam.ParameterValue.toLowerCase();
          //temporary solution for : er-visit based on departmentname. yubaraj:20june'19-- get these from server side or from configuration for proper solution.
          if (department.DepartmentName.toLowerCase() == erdeptname) {
            this.visit.VisitType = "emergency";
          }
          else {
            this.visit.VisitType = "outpatient";
          }
        }
        this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
        //emit is also done directly from FilterDoctorList() function in case of enableDepartmentLevelAppointment is false, therefore the condiiton is recheck for correct emit.
        //if (!this.enableDepartmentLevelAppointment) {
        //  this.visitService.TriggerBillChangedEvent({ ChangeType: "Department", SelectedDepartment: this.selectedDepartment });
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


}
