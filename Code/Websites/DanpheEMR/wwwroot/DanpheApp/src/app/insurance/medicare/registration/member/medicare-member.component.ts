import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs-compat';
import { CoreService } from '../../../../core/shared/core.service';
import { InsuranceProviderModel } from '../../../../patients/shared/insurance-provider.model';
import { Department } from '../../../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat, ENUM_MessageBox_Status, ENUM_Relation } from '../../../../shared/shared-enums';
import { MedicarePatient_DTO } from '../../shared/dto/mecicare-patient-dto';
import { Medicare_EmployeeDesignation_DTO } from '../../shared/dto/medicare-employee-designation.dto';
import { MedicalCareType, MedicareInstitute, MedicareMemberModel } from '../../shared/medicare-member.model';
import { MedicareBLService } from '../../shared/medicare.bl.service';
import { MedicareService } from '../../shared/service/medicare.service';

@Component({
  selector: 'app-medicare-member',
  templateUrl: './medicare-member.component.html',
  styleUrls: ['./medicare-member.component.css']
})
export class MedicareMemberComponent {


  @Output("callback-add-member")
  CallBackAddMember: EventEmitter<Object> = new EventEmitter<Object>();

  showAddMemberPage: boolean = false;
  departmentsList: any;
  showAddDepartmentPage: boolean;
  @Input('isEditForm') isUpdate: boolean = false;
  showAddEmployeeRolePage: boolean = false;
  designationList: Array<Medicare_EmployeeDesignation_DTO> = [];
  medicalCareTypeList: Array<MedicalCareType> = [];
  medicareInstituteList: Array<MedicareInstitute> = [];
  insuranceProvidersList: Array<InsuranceProviderModel> = [];
  @Input('rowData') rowData;
  memberDetails: MedicareMemberModel = new MedicareMemberModel();
  MedicareType: MedicalCareType = new MedicalCareType();
  selectedDesignation: Medicare_EmployeeDesignation_DTO = new Medicare_EmployeeDesignation_DTO();
  selectedDepartment: Department = null;
  selectedInstitute: any = null;
  selectedMedicareType: MedicalCareType = new MedicalCareType();
  memberObj: any
  patientId: number;
  showBirthType: boolean = false;
  MedicareTypeId: number;
  disableBtn: boolean = true;
  instituteList: MedicareInstitute[];
  SelectedMedicareInstitute: MedicareInstitute = new MedicareInstitute();
  selectedInsuranceProvider: InsuranceProviderModel = new InsuranceProviderModel();
  medicarePatients: any;
  MedicareTypeName: string = "";
  medicarePatientList: Array<MedicarePatient_DTO> = new Array<MedicarePatient_DTO>();
  selectedDate: string = moment().format(ENUM_DateTimeFormat.Year_Month_Day);

  constructor(public medicareBlService: MedicareBLService, public coreService: CoreService,
    public changeDetector: ChangeDetectorRef, public msgBoxService: MessageboxService, public medicareService: MedicareService) {
  }
  ngOnInit() {
    this.GetMedicarePatients()
    this.memberDetails.MedicareStartDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    this.medicalCareTypeList = this.medicareService.medicalCareTypeList;
    this.departmentsList = this.medicareService.departmentList;
    this.medicareInstituteList = this.medicareService.medicareInstituteList;
    this.designationList = this.medicareService.designationList;
    this.instituteList = this.medicareService.medicareInstituteList
    this.insuranceProvidersList = this.medicareService.insuranceProvidersList;
    if (this.isUpdate) {
      this.SetMedicareMember();
    }
  }
  public GetAllDepartments(): void {
    this.medicareBlService.GetAllDepartment().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.departmentsList = res.Results;
        }
      }
    );
  }
  SetMedicareMember() {
    this.memberDetails.PatientId = this.rowData.PatientId;
    this.memberDetails.DesignationId = this.rowData.DesignationId;
    this.memberDetails.Age = this.rowData.Age;
    this.showBirthType = true;
    this.memberDetails.Gender = this.rowData.Gender;
    this.memberDetails.DateOfBirth = this.rowData.DateOfBirth;
    this.memberDetails.FullName = this.rowData.Name;
    this.memberDetails.Remarks = this.rowData.Remarks;
    this.memberDetails.InsurancePolicyNo = this.rowData.InsurancePolicyNo;
    this.selectedDesignation = this.designationList.find(x => x.DesignationId === this.rowData.DesignationId);
    this.selectedInstitute = this.instituteList.find(x => x.MedicareInstituteCode === this.rowData.Institution);
    this.selectedInsuranceProvider = this.insuranceProvidersList.find(x => x.InsuranceProviderId == this.rowData.InsuranceProviderId);
    this.selectedDepartment = this.departmentsList.find(x => x.DepartmentId === this.rowData.DepartmentId);
    this.memberDetails.MedicareStartDate = this.rowData.MedicareStartDate;
    this.memberDetails.DepartmentId = this.rowData.DepartmentId;
    this.memberDetails.MedicareTypeId = this.rowData.MedicareTypeId;
    this.memberDetails.MedicareTypeName = this.rowData.Category;
    this.memberDetails.MedicareMemberId = this.rowData.MedicareMemberId;
    let obj = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.memberDetails.MedicareTypeId);
    this.selectedMedicareType = obj;
    this.memberDetails.MemberNo = this.rowData.MedicareNo;
    this.memberDetails.HospitalNo = this.rowData.HospitalNo;
    this.memberDetails.InsuranceProviderId = this.rowData.InsuranceProviderId;
    this.memberDetails.MedicareInstituteCode = this.selectedInstitute.MedicareInstituteCode;
    let med = this.medicareInstituteList.find(a => a.MedicareInstituteCode === this.memberDetails.MedicareInstituteCode);
    this.SelectedMedicareInstitute = med;
    this.memberDetails.IsIpLimitExceeded = this.rowData.IsIpLimitExceeded;
    this.memberDetails.IsOpLimitExceeded = this.rowData.IsOpLimitExceeded;
    this.memberDetails.IsActive = this.rowData.IsActive;
    this.memberDetails.MedicareMemberValidator.controls['DesignationId'].setValue(this.rowData.DesignationId);
    this.memberDetails.MedicareMemberValidator.controls['Age'].setValue(this.rowData.Age);
    this.memberDetails.MedicareMemberValidator.controls['Age'].disable();
    this.memberDetails.MedicareMemberValidator.controls['Gender'].setValue(this.rowData.Gender);
    this.memberDetails.MedicareMemberValidator.controls['Gender'].disable();
    this.memberDetails.MedicareMemberValidator.controls['MedicareStartDate'].setValue(this.rowData.MedicareStartDate);
    this.memberDetails.MedicareMemberValidator.controls['MedicareStartDate'].disable();
    this.memberDetails.MedicareMemberValidator.controls['PatientId'].setValue(this.rowData.PatientId);
    this.memberDetails.MedicareMemberValidator.controls['MedicareInstituteCode'].setValue(this.selectedInstitute.MedicareInstituteCode);
    this.memberDetails.MedicareMemberValidator.controls['MemberNo'].setValue(this.rowData.MedicareNo);
    this.memberDetails.MedicareMemberValidator.controls['MemberNo'].disable();
    this.memberDetails.MedicareMemberValidator.controls['MedicareTypeId'].setValue(this.rowData.MedicareTypeId);
    this.memberDetails.MedicareMemberValidator.controls['FullName'].setValue(this.rowData.Name);
    this.memberDetails.MedicareMemberValidator.controls['FullName'].disable();
    this.memberDetails.MedicareMemberValidator.controls['HospitalNo'].setValue(this.rowData.HospitalNo);
    this.memberDetails.MedicareMemberValidator.controls['Remarks'].setValue(this.rowData.Remarks);
    this.memberDetails.MedicareMemberValidator.controls['DepartmentId'].setValue(this.rowData.DepartmentId);
    this.memberDetails.MedicareMemberValidator.controls['InsuranceProviderId'].setValue(this.rowData.InsuranceProviderId);
    this.disableBtn = false;
  }
  Close() {
    this.showAddMemberPage = false;
    this.CallBackAddMember.emit(true);
  }
  public GetAllDesignations(): void {
    this.medicareBlService.GetAllDesignations().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.designationList = res.Results;
        }
      }
    );
  }
  public GetAllMedicareTypes(): void {
    this.medicareBlService.GetAllMedicareTypes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicalCareTypeList = res.Results;
        }
      }
    );
  }

  public GetMedicarePatients(): void {
    this.medicareBlService.GetMedicarePatientList().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicarePatientList = res.Results;
        }
        else {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data' + res.ErrorMessage]);
        }
      },
      err => {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [err]);
      });
  }

  GetAllMedicareInstitutes(): void {
    this.medicareBlService.GetAllMedicareInstitutes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareInstituteList = res.Results;
        }
      }
    );
  }
  GetAllInsuranceProvidersList(): void {
    this.medicareBlService.GetAllInsuranceProviderList().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.insuranceProvidersList = res.Results;
        }
      }
    );
  }
  GetMemberDetailsByPatientId(patientId: number): void {
    this.medicareBlService.GetMedicareMemberDetailByPatientId(patientId).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          const memberDetail = res.Results;

          this.disableBtn = false;
          Object.assign(this.memberDetails, memberDetail);
          this.memberDetails.MedicareStartDate = memberDetail.MedicareStartDate;
          this.memberDetails.DepartmentId = memberDetail.DepartmentId;
          this.memberDetails.MedicareTypeId = memberDetail.MedicareTypeId;
          this.selectedInstitute = this.medicareInstituteList.find(x => x.MedicareInstituteCode === memberDetail.MedicareInstituteCode);
          this.selectedDesignation = this.designationList.find(x => x.DesignationId === memberDetail.DesignationId);
          this.selectedDepartment = this.departmentsList.find(x => x.DepartmentId === memberDetail.DepartmentId);
          this.memberDetails.MedicareMemberValidator.controls["MedicareTypeId"].setValue(memberDetail.MedicareTypeId);
          this.memberDetails.MedicareMemberValidator.controls["Remarks"].setValue(memberDetail.Remarks);
          this.memberDetails.MedicareMemberValidator.controls["DesignationId"].setValue(memberDetail.DesignationId);
          this.memberDetails.MedicareMemberValidator.controls["DepartmentId"].setValue(memberDetail.DepartmentId);
          this.memberDetails.MedicareMemberValidator.controls["MedicareInstituteCode"].setValue(memberDetail.MedicareInstituteCode);
          this.memberDetails.MedicareMemberValidator.controls["InsuranceProviderId"].setValue(memberDetail.InsuranceProviderId);
          this.memberDetails.MedicareMemberValidator.controls["MemberNo"].setValue(memberDetail.MemberNo);
          this.isUpdate = true;
        } else {
          this.disableBtn = true;
          this.isUpdate = false;
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to get member details Check Console']);
        }
      },
      (err: DanpheHTTPResponse) => {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Something went wrong! ${err.ErrorMessage}`]);
      }
    )
  }


  OnSubmit(): void {
    if (!this.memberDetails.MedicareStartDate) {
      this.memberDetails.MedicareStartDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    }
    if (this.memberDetails.LedgerId !== null) {
      this.memberDetails.MedicareMemberValidator.controls['MedicareStartDate'].setValue(this.memberDetails.MedicareStartDate);
      this.memberDetails.FullName = this.memberDetails.MedicareMemberValidator.get("FullName").value;
      if (this.ValidateMedicareMemberDetails()) {
        if (this.isUpdate) {
          this.medicareBlService.PutMedicareMemberDetails(this.memberDetails)
            .finally(() => this.disableBtn = false)
            .subscribe(
              (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                  this.disableBtn = true;
                  this.ResetVariables();
                  this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Member Details has been Updated Successfully']);
                  this.CallBackAddMember.emit(true);
                  this.Close();
                  this.GetMedicarePatients();
                } else {
                  this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to Update member Details']);
                }
              }
            );
        } else {
          this.medicareBlService.PostMedicareMemberDetails(this.memberDetails)
            .finally(() => this.disableBtn = false)
            .subscribe(
              (res: DanpheHTTPResponse) => {
                if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                  this.disableBtn = true;
                  this.ResetVariables();
                  this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Member has been added Successfully']);
                  this.CallBackAddMember.emit(true);
                  this.Close();
                  this.GetMedicarePatients();
                } else {
                  this.msgBoxService.showMessage(ENUM_MessageBox_Status.Failed, ['Something went wrong!, Could not add a member']);
                }
              },
              (err: DanpheHTTPResponse) => {
                this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`something went wrong. ${err.ErrorMessage}`]);
              }
            );
        }
      } else {
        this.msgBoxService.showMessage(ENUM_DanpheHTTPResponseText.Failed, ['Validation error!']);
      }
    }
    else {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Selected Medicare Type is Not-Mappped to Ledger']);
    }
  }


  private ResetVariables(): void {
    this.memberDetails = new MedicareMemberModel();
    this.memberObj = null;
    this.MedicareType = null;
    this.selectedDesignation = null;
    this.selectedDepartment = null;
    this.selectedInstitute = null;
  }

  AddDepartment(): void {
    this.showAddDepartmentPage = true;
  }
  AddEmployeeRole(): void {
    this.showAddEmployeeRolePage = true;
  }
  CallBackAddDepartment($event): void {
    if ($event) {
      if ($event.action === "add" && $event.department) {
        const department = {
          DepartmentCode: $event.department.DepartmentCode,
          DepartmentId: $event.department.DepartmentId,
          DepartmentName: $event.department.DepartmentName
        }

        this.departmentsList.push(department);
      }
      else if ($event.action === "add" && $event.department === null) {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Unable To add Department."]);
      }
      this.changeDetector.detectChanges();
      this.showAddDepartmentPage = false;
      this.departmentsList = this.departmentsList.slice();
    }

  }
  CallBackAddEmployeeRole($event): void {
    if ($event) {
      if ($event.employee) {
        {
          const designations = {
            DesignationName: $event.employee.EmployeeRoleName,
            DesignationId: $event.employee.EmployeeRoleId
          }

          this.designationList.push(designations);
        }
        this.changeDetector.detectChanges();
        this.showAddEmployeeRolePage = false;
      }
      this.designationList = this.designationList.slice();
    }
  }
  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.medicareBlService.GetPatientsWithVisitsInfo(keyword);
  }
  SelectMember(): void {
    let registeredName = this.medicarePatientList.some(item => item.HospitalNo === this.memberObj.PatientCode);
    if (registeredName) {
      this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Member is already registered"]);
    }
    else {
      this.disableBtn = false;
      this.memberDetails = new MedicareMemberModel();
      this.memberDetails.Age = this.memberObj.Age ? +this.memberObj.Age.substring(0, (this.memberObj.Age.length - 1)) : 0;
      this.selectedDepartment = null;
      this.selectedDesignation = null;
      this.selectedInstitute = null;
      this.memberDetails.PatientId = this.memberObj.PatientId;
      this.memberDetails.HospitalNo = this.memberObj.PatientCode;
      this.memberDetails.DateOfBirth = this.memberObj.DateOfBirth;
      this.showBirthType = true;
      this.memberDetails.Gender = this.memberObj.Gender;
      this.memberDetails.Relation = ENUM_Relation.Self;
      this.memberDetails.MedicareMemberValidator.controls["Age"].setValue(this.memberDetails.Age);
      this.memberDetails.MedicareMemberValidator.controls["Gender"].setValue(this.memberDetails.Gender);
      this.memberDetails.MedicareMemberValidator.controls["PatientId"].setValue(this.memberObj.PatientId);
      this.memberDetails.MedicareMemberValidator.controls["HospitalNo"].setValue(this.memberObj.PatientCode);
      this.memberDetails.MedicareMemberValidator.controls["FullName"].setValue(this.memberObj.ShortName);
      if (this.memberObj.MedicareMemberNo !== null) {
        this.isUpdate = true;
        this.GetMemberDetailsByPatientId(this.memberObj.PatientId);
      }
    }
  }

  AssignSelectedDesignation() {
    this.memberDetails.DesignationId = this.selectedDesignation.DesignationId;
  }


  AssignSelectedDepartment() {
    this.memberDetails.DepartmentId = this.selectedDepartment.DepartmentId;
  }
  AssignSelectedInstitute() {
    this.memberDetails.MedicareInstituteCode = this.SelectedMedicareInstitute.MedicareInstituteCode;
  }
  AssignSelectedMedicareType() {
    this.memberDetails.MedicareTypeId = this.selectedMedicareType.MedicareTypeId;
    this.memberDetails.LedgerId = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.selectedMedicareType.MedicareTypeId).LedgerId;
    this.memberDetails.MedicareTypeName = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.selectedMedicareType.MedicareTypeId).MedicareTypeName;
  }
  ValidateMedicareMemberDetails(): boolean {
    for (let i in this.memberDetails.MedicareMemberValidator.controls) {
      this.memberDetails.MedicareMemberValidator.controls[i].markAsDirty();
      this.memberDetails.MedicareMemberValidator.controls[i].updateValueAndValidity();
    }
    if (this.memberDetails.IsValidCheck(undefined, undefined)) {
      return true;
    } else {
      return false;
    }
  }
  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }


  public GetFormattedAgeLabel(dateOfBirth): string {

    let currentDate = moment().format(ENUM_DateTimeFormat.Year_Month_Day);
    let years = moment(currentDate).diff(moment(dateOfBirth).format(ENUM_DateTimeFormat.Year_Month_Day), 'years');
    let totMonths = moment(currentDate).diff(moment(dateOfBirth).format(ENUM_DateTimeFormat.Year_Month_Day), 'months');
    let totDays = moment(currentDate).diff(moment(dateOfBirth).format(ENUM_DateTimeFormat.Year_Month_Day), 'days');
    if (years >= 1) {
      return 'Years';
    }
    else if (totMonths < 1) {
      if (Number(totDays) == 0)
        totDays = 1;
      return 'Days';
    }
    else {
      return 'Months';
    }

  }
}
