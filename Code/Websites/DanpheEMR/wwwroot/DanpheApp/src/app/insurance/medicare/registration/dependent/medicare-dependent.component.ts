import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CoreService } from '../../../../core/shared/core.service';
import { InsuranceProviderModel } from '../../../../patients/shared/insurance-provider.model';
import { Department } from '../../../../settings-new/shared/department.model';
import { DanpheHTTPResponse } from '../../../../shared/common-models';
import { MessageboxService } from '../../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_DateTimeFormat, ENUM_MessageBox_Status } from '../../../../shared/shared-enums';
import { MedicareDependentModel } from '../../shared/dto/medicare-dependent.model';
import { Medicare_EmployeeDesignation_DTO } from '../../shared/dto/medicare-employee-designation.dto';
import { MedicalCareType, MedicareInstitute, MedicareMemberModel } from '../../shared/medicare-member.model';
import { MedicareBLService } from '../../shared/medicare.bl.service';
import { MedicareService } from '../../shared/service/medicare.service';

@Component({
  selector: 'app-dependent',
  templateUrl: './medicare-dependent.component.html',
  styleUrls: ['./medicare-dependent.component.css']
})
export class MedicareDependentComponent {

  @Output("callback-add-dependent")
  callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
  departmentsList: any;
  showAddPage: boolean = false;
  showBirthType: boolean = false;
  showAddDepartmentPage: boolean;
  showAddEmployeeRolePage: boolean = false;
  designationList: Array<Medicare_EmployeeDesignation_DTO> = [];
  medicalCareTypeList: Array<MedicalCareType> = [];
  medicareInstituteList: Array<MedicareInstitute> = [];
  @Input('rowData') rowData;
  dependentDetails: MedicareDependentModel = new MedicareDependentModel();
  selectedDesignation: Medicare_EmployeeDesignation_DTO = null;
  selectedDepartment: Department = null;
  invalidParentMedicareNo: boolean = false;
  selectedInstitute: MedicareInstitute = null;
  memberObj: any;
  memberNo: number;
  dependentObj: any;
  insuranceProvidersList: Array<InsuranceProviderModel> = [];
  parentDetails: MedicareMemberModel = new MedicareMemberModel();
  @Input('isUpdate') isUpdate: boolean = false;
  disableBtn: boolean;
  patientId: number;
  instituteList: MedicareInstitute[];
  selectedInsuranceProvider: InsuranceProviderModel;
  loading: boolean = false;
  MedicareType: MedicalCareType = new MedicalCareType();
  SelectedMedicareInstitute: MedicareInstitute = new MedicareInstitute();
  selectedMedicareType: MedicalCareType = new MedicalCareType();
  constructor(public medicareBlService: MedicareBLService, public coreService: CoreService, public medicareService: MedicareService,
    public changeDetector: ChangeDetectorRef, public msgBoxService: MessageboxService) {
    this.GetAllDesignations();

  }
  ngOnInit() {
    this.medicalCareTypeList = this.medicareService.medicalCareTypeList;
    this.departmentsList = this.medicareService.departmentList;
    this.medicareInstituteList = this.medicareService.medicareInstituteList;
    this.instituteList = this.medicareService.medicareInstituteList
    this.insuranceProvidersList = this.medicareService.insuranceProvidersList;
    this.designationList = this.medicareService.designationList;
    if (this.isUpdate) {
      this.SetMedicareDependent();
    }
  }


  SetMedicareDependent() {
    this.memberNo = this.rowData.MedicareNo;
    this.dependentDetails.MedicareInstituteCode = this.rowData.Institution;
    this.dependentDetails.ParentName = this.rowData.Employee;
    this.dependentDetails.Age = this.rowData.Age;
    this.dependentDetails.DateOfBirth = this.rowData.DateOfBirth;
    this.showBirthType = true;
    this.dependentDetails.Gender = this.rowData.Gender;
    this.dependentDetails.InsuranceProviderId = this.rowData.InsuranceProviderId;
    this.dependentDetails.Remarks = this.rowData.Remarks;
    this.dependentDetails.Relation = this.rowData.Relation.toLowerCase();
    this.dependentDetails.MedicareMemberId = this.rowData.MedicareMemberId;
    this.dependentDetails.MedicareTypeId = this.rowData.MedicareTypeId;
    let obj = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.dependentDetails.MedicareTypeId);
    this.selectedMedicareType = obj;
    this.dependentDetails.HospitalNo = this.rowData.HospitalNo;
    this.dependentDetails.InsurancePolicyNo = this.rowData.InsurancePolicyNo;
    this.dependentDetails.MemberNo = this.rowData.MedicareNo;
    this.dependentDetails.LedgerId = this.rowData.LedgerId;
    this.dependentDetails.MedicareTypeName = this.rowData.Category;
    this.dependentDetails.MedicareMemberId = this.rowData.MedicareMemberId;
    this.dependentDetails.ParentMedicareMemberId = this.rowData.ParentMedicareMemberId;
    this.dependentDetails.DepartmentId = this.rowData.DepartmentId;
    this.dependentDetails.DesignationId = this.rowData.DesignationId;
    this.dependentDetails.PatientId = this.rowData.PatientId;
    this.dependentDetails.FullName = this.rowData.Name;
    this.dependentDetails.IsActive = this.rowData.IsActive;
    this.dependentDetails.MedicareStartDate = this.rowData.MedicareStartDate;
    this.selectedDesignation = this.designationList.find(x => x.DesignationId === this.rowData.DesignationId);
    this.selectedInstitute = this.instituteList.find(x => x.MedicareInstituteCode === this.rowData.Institution);
    this.selectedInsuranceProvider = this.insuranceProvidersList.find(x => x.InsuranceProviderId === this.rowData.InsuranceProviderId);
    this.selectedDepartment = this.departmentsList.find(x => x.DepartmentId === this.rowData.DepartmentId);
    this.dependentDetails.MedicareInstituteCode = this.selectedInstitute.MedicareInstituteCode;
    let med = this.medicareInstituteList.find(a => a.MedicareInstituteCode === this.dependentDetails.MedicareInstituteCode);
    this.SelectedMedicareInstitute = med;
    this.dependentDetails.MedicareDependentValidator.controls['MedicareStartDate'].setValue(this.rowData.MedicareStartDate);
    this.dependentDetails.MedicareDependentValidator.controls['MedicareStartDate'].disable();
    this.dependentDetails.MedicareDependentValidator.controls['PatientId'].setValue(this.rowData.PatientId);
    this.dependentDetails.MedicareDependentValidator.controls['FullName'].setValue(this.rowData.Name);
    this.dependentDetails.MedicareDependentValidator.controls['HospitalNo'].setValue(this.rowData.HospitalNo);
    this.dependentDetails.MedicareDependentValidator.controls['InsuranceProviderId'].setValue(this.rowData.InsuranceProviderId);
    this.dependentDetails.MedicareDependentValidator.controls['Relation'].setValue(this.rowData.Relation.toLowerCase());
    this.dependentDetails.MedicareDependentValidator.controls['MedicareInstituteCode'].setValue(this.rowData.Institution);
    this.dependentDetails.MedicareDependentValidator.controls['Remarks'].setValue(this.rowData.Remarks);
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

  Close() {
    this.callbackAdd.emit(true);
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
  GetAllMedicareInstitutes(): void {
    this.medicareBlService.GetAllMedicareInstitutes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareInstituteList = res.Results;
        }
      }
    );
  }
  OnSubmit(): void {
    if (this.ValidateMedicareDependentDetails()) {
      if (this.dependentDetails.LedgerId !== null) {
        if (this.isUpdate === true) {
          this.medicareBlService.PutMedicareDependentDetails(this.dependentDetails).subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.isUpdate = false;
                this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Details has been Updated Successfully']);
                this.callbackAdd.emit(true);
                this.Close();
              }
              else {
                this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to Update member Details']);
              }
            },
            (err: DanpheHTTPResponse) => {
              this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Something went wrong ${err.ErrorMessage}`]);
            });
        }
        else {
          this.medicareBlService.PostMedicareDependentDetails(this.dependentDetails).subscribe(
            (res: DanpheHTTPResponse) => {
              if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
                this.msgBoxService.showMessage(ENUM_MessageBox_Status.Success, ['Member has been added Successfully']);
                this.callbackAdd.emit(true);
                this.Close();
              } else {
                this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Could not add Member']);
              }
            },
            (err: DanpheHTTPResponse) => {
              this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Something went wrong ${err.ErrorMessage}`]);
            });
        }
        this.ResetVariables();
      }
      else {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Notice, ['Selected Medicare Type is Not-Mappped to Ledger']);
      }
    }
  }

  private ResetVariables(): void {
    this.dependentDetails = new MedicareDependentModel();
    this.memberObj = null;
    this.selectedDesignation = null;
    this.selectedDepartment = null;
    this.selectedInstitute = null;
    this.memberNo = null;
  }

  public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {
    return this.medicareBlService.GetPatientsWithVisitsInfo(keyword);
  }

  SelectParentMember() {
    this.dependentDetails.MedicareDependentValidator.controls["ParentMedicareMemberId"].setValue(this.dependentObj.MedicareMemberNo);
    this.dependentDetails.MedicareDependentValidator.controls["ParentFullName"].setValue(this.dependentObj.ShortName);
  }
  SelectDependentMember(): void {
    this.disableBtn = false;
    this.dependentDetails.MedicareDependentValidator.controls["PatientId"].setValue(this.memberObj.PatientId);
    this.dependentDetails.MedicareDependentValidator.controls["HospitalNo"].setValue(this.memberObj.PatientCode);
    this.dependentDetails.MedicareDependentValidator.controls["FullName"].setValue(this.memberObj.ShortName);
    this.dependentDetails.Age = this.memberObj.Age;
    this.showBirthType = true;
    this.dependentDetails.PatientId = this.memberObj.PatientId;
    this.dependentDetails.HospitalNo = this.memberObj.PatientCode;
    this.dependentDetails.DateOfBirth = this.memberObj.DateOfBirth;
    this.dependentDetails.FullName = this.memberObj.ShortName;
    this.dependentDetails.Gender = this.memberObj.Gender;
    if (this.memberObj.MedicareMemberNo !== null) {
      this.isUpdate = true;
      this.GetMemberDetailsByPatientId(this.memberObj.PatientId);
    }
  }

  AssignSelectedDesignation(): void {
    this.dependentDetails.MedicareDependentValidator.controls["DesignationId"].setValue(this.selectedDesignation.DesignationId);
  }
  AssignSelectedDepartment(): void {
    this.dependentDetails.DepartmentId = this.selectedDepartment.DepartmentId;
    this.dependentDetails.MedicareDependentValidator.controls["DepartmentId"].setValue(this.selectedDepartment.DepartmentId);
  }

  ValidateMedicareDependentDetails(): boolean {
    for (let i in this.dependentDetails.MedicareDependentValidator.controls) {
      this.dependentDetails.MedicareDependentValidator.controls[i].markAsDirty();
      this.dependentDetails.MedicareDependentValidator.controls[i].updateValueAndValidity();
    }
    if (this.dependentDetails.IsValidCheck(undefined, undefined)) {
      return true;
    } else {
      return false;
    }
  }
  SearchMedicareMemByParentMedicareNo(): void {
    this.invalidParentMedicareNo = false;
    this.medicareBlService.GetMedicareMemberDetailByMedicareNumber(this.memberNo).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.parentDetails = res.Results;
          if (this.parentDetails) {

            Object.assign(this.dependentDetails, this.parentDetails);
            this.dependentDetails.IsDependent = true;
            this.dependentDetails.ParentName = this.parentDetails.FullName;
            this.dependentDetails.FullName = '';
            this.dependentDetails.Remarks = '';
            this.dependentDetails.ParentMedicareMemberId = this.parentDetails.MedicareMemberId;
            this.dependentDetails.IsActive = true;
            this.SelectedMedicareInstitute = this.instituteList.find(x => x.MedicareInstituteCode === this.parentDetails.MedicareInstituteCode);
            this.selectedMedicareType = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.parentDetails.MedicareTypeId);

            const medicareType = this.medicalCareTypeList.find(
              (type) => type.MedicareTypeId === this.parentDetails.MedicareTypeId
            );
            if (medicareType) {
              this.dependentDetails.MedicareTypeName = medicareType.MedicareTypeName;
              this.dependentDetails.LedgerId = medicareType.LedgerId;
            }

          }
          else {
            this.msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["No record found. Please check Parent Medicare No"]);
            this.dependentDetails.MedicareDependentValidator.invalid;
          }
        }
        else if (res.Status === ENUM_DanpheHTTPResponseText.Failed) {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ["No record found. Please check Parent Medicare No"]);
          this.dependentDetails.MedicareDependentValidator.invalid;
        }
        else {
          this.invalidParentMedicareNo = true;
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ["Something went wrong please check logs."]);
        }
      },
      (err: DanpheHTTPResponse) => {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Something went wrong! ${err.ErrorMessage}`]);
      });
  }
  GetMemberDetailsByPatientId(patientId: number): void {
    this.disableBtn = true;
    this.medicareBlService.GetMedicareDependentMemberDetailByPatientId(patientId).subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          let dependentMedicareMember = res.Results ? res.Results.MedicareDependent : null;
          let parentMedicareMember = res.Results ? res.Results.ParentMedicareMember : null;
          this.disableBtn = false;
          if (dependentMedicareMember) {
            Object.assign(this.dependentDetails, dependentMedicareMember);
            this.memberNo = parentMedicareMember.ParentMedicareNumber;
            this.dependentDetails.ParentName = parentMedicareMember.ParentMedicareMemberName
            this.dependentDetails.MedicareStartDate = dependentMedicareMember.MedicareStartDate;
            this.dependentDetails.DepartmentId = dependentMedicareMember.DepartmentId;
            this.dependentDetails.MedicareTypeId = dependentMedicareMember.MedicareTypeId;
            this.selectedInstitute = this.medicareInstituteList.find(x => x.MedicareInstituteCode === dependentMedicareMember.MedicareInstituteCode);
            this.selectedDesignation = this.designationList.find(x => x.DesignationId === dependentMedicareMember.DesignationId);
            this.selectedDepartment = this.departmentsList.find(x => x.DepartmentId === dependentMedicareMember.DepartmentId);
            this.dependentDetails.MedicareDependentValidator.controls["Remarks"].setValue(dependentMedicareMember.Remarks);
            this.dependentDetails.MedicareDependentValidator.controls["Relation"].setValue(dependentMedicareMember.Relation);
          }
        }
        else if (res.Status === ENUM_DanpheHTTPResponseText.Failed) {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Warning, ['This patient has already been registered as dependent.Please select another one.']);
          this.disableBtn = true;
          this.isUpdate = false;
        }
        else {
          this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, ['Unable to get member details Check Console']);
          this.disableBtn = true;
          this.isUpdate = false;
        }
      },
      (err: DanpheHTTPResponse) => {
        this.msgBoxService.showMessage(ENUM_MessageBox_Status.Error, [`Something went wrong! ${err.ErrorMessage}`]);
      });
  }

  PatientListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }
  ParentMemberListFormatter(data: any): string {
    let html: string = "";
    html = "<font size=03>" + "[" + data["MedicareMemberNo"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
      "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    return html;
  }


  AssignSelectedMedicareType() {
    this.dependentDetails.MedicareTypeId = this.selectedMedicareType.MedicareTypeId;
    this.dependentDetails.LedgerId = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.selectedMedicareType.MedicareTypeId).LedgerId;
    this.dependentDetails.MedicareTypeName = this.medicalCareTypeList.find(x => x.MedicareTypeId === this.selectedMedicareType.MedicareTypeId).MedicareTypeName;
  }
  MedicareTypeListFormatter(data: any): string {
    let html: string = ""
    html = data["MedicareTypeName"];
    return html;
  }
  AssignSelectedInstitute() {
    this.dependentDetails.MedicareInstituteCode = this.SelectedMedicareInstitute.MedicareInstituteCode;
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

