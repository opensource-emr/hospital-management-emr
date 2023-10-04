import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as _ from "lodash";
import { SecurityService } from '../../../security/shared/security.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import GridColumnSettings from '../../../shared/danphe-grid/grid-column-settings.constant';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { ENUM_DanpheHTTPResponseText, ENUM_MessageBox_Status } from '../../../shared/shared-enums';
import { MedicarePatient_DTO } from '../shared/dto/mecicare-patient-dto';
import { MedicareDependentModel } from '../shared/dto/medicare-dependent.model';
import { MedicalCareType } from '../shared/medicare-member.model';
import { MedicareBLService } from '../shared/medicare.bl.service';
import { MedicareService } from '../shared/service/medicare.service';
@Component({
  templateUrl: './medicare-registration-main.component.html'
})
export class MedicareRegistrationMainComponent implements OnInit {
  validRoutes: any;
  dependentDetails: MedicareDependentModel = new MedicareDependentModel();
  memberDetails: any;
  showAddDependentPage: boolean = false;
  isEditForm: boolean = false;
  showAddMemberPage: boolean = false;
  medicarePatientGridColumns: Array<any> = null;
  medicarePatients: Array<MedicarePatient_DTO> = new Array<MedicarePatient_DTO>();
  index: number;
  totalMedicare: number;
  activeMedicare: number;
  inActiveMedicare: number;
  showInactiveMembers: boolean = false;
  showEditDependentPage: boolean = false;
  showEditMemberPage: boolean = false;
  showMedicarePatientList: boolean = true;
  filteredMedicarePatients: any[] = [];
  isInitialLoad: boolean = true;
  public medicarePatientsList: any[] = [];
  public copiedMedicarePatientsList: any[] = [];
  categoryList: Array<MedicalCareType> = new Array<MedicalCareType>();
  selectedCategoryList = [];
  selectedcategories: any[] = [];
  selectedCategories: string = '';

  constructor(public medicareBlService: MedicareBLService, public securityService: SecurityService,
    public changeDetector: ChangeDetectorRef, private messageboxService: MessageboxService, public medicareService: MedicareService,) {
    this.medicarePatientGridColumns = GridColumnSettings.medicarePatientList;
    this.GetMedicarePatients();
  }

  ngOnInit() {
    if (this.isInitialLoad) {
      this.AssignDesignationList();
      this.AssingnInsuranceProvider();
      this.AsssignMedicareInstitute()
      this.AssingDepartments();
      this.AssignMedicareType();
      this.isInitialLoad = false;
    }
  }

  public AssignMedicareType() {
    this.medicareBlService.GetAllMedicareTypes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareService.medicalCareTypeList = res.Results;
          let Categories = res.Results;


          Categories.forEach((p) => {
            let val = _.cloneDeep(p);
            this.selectedCategoryList.push(val);
          });
          this.categoryList = Categories;
        }
      }
    );
  }

  public AssignDesignationList() {
    this.medicareBlService.GetAllDesignations().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareService.designationList = res.Results;
        }
      }
    );
  }
  gridExportOptions = {
    fileName: 'MedicareRegistrationReport' + '.xls',
  };

  public AssingDepartments() {
    this.medicareBlService.GetAllDepartment().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareService.departmentList = res.Results;
        }
      }
    );
  }

  public AsssignMedicareInstitute() {
    this.medicareBlService.GetAllMedicareInstitutes().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareService.medicareInstituteList = res.Results;
        }
      }
    );
  }

  public AssingnInsuranceProvider(): void {
    this.medicareBlService.GetAllInsuranceProviderList().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicareService.insuranceProvidersList = res.Results;
        }
      }
    );
  }

  public GetMedicarePatients(): void {
    this.medicareBlService.GetMedicarePatientList().subscribe(
      (res: DanpheHTTPResponse) => {
        if (res.Status === ENUM_DanpheHTTPResponseText.OK) {
          this.medicarePatients = res.Results;
          this.medicarePatients.forEach(a => {
            a.Age = this.getAgeFromDateOfBirth(a.DateOfBirth);
          });
          this.medicarePatientsList = this.medicarePatients;
          this.copiedMedicarePatientsList = this.medicarePatientsList;

        }
        else {
          this.messageboxService.showMessage(ENUM_MessageBox_Status.Failed, ['Failed To Load Data' + res.ErrorMessage]);
        }
      },
      err => {
        this.messageboxService.showMessage(ENUM_MessageBox_Status.Error, [err]);
      });
  }

  getAgeFromDateOfBirth(dateofbirth: any) {

    let today = new Date();

    let birthDate = new Date(dateofbirth);

    let age = today.getFullYear() - birthDate.getFullYear();

    let m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {

      age--;

    }

    return age;

  }
  AddMedicareDependent() {
    this.index = null;
    this.changeDetector.detectChanges();
    this.showAddDependentPage = true;
    this.isEditForm = false;
  }
  AddMedicareMember() {
    this.isEditForm = false;
    this.index = null;
    this.changeDetector.detectChanges();
    this.showAddMemberPage = true;
  }

  CallBackAdd($event) {
    this.showAddDependentPage = false;
    this.GetMedicarePatients();
  }
  CallBackAddMember($event) {
    this.showAddMemberPage = false;
    this.GetMedicarePatients();
  }
  MedicarePatientsGridAction($event) {
    {
      let rowAction = $event.Action;
      let rowData = $event.Data;
      if (rowAction === 'medicarePatient' && rowData.IsDependent) {
        this.dependentDetails = rowData;
        this.showAddDependentPage = true;
        this.isEditForm = true;

      }
      else if (rowAction === 'medicarePatient' && !rowData.IsDependent) {
        this.memberDetails = rowData;
        this.showAddMemberPage = true;
        this.isEditForm = true;
      }
      else {
      }
    }
  }

  openAddMemberModal(_rowData) {
    this.index = null;
    this.changeDetector.detectChanges();
    this.showAddMemberPage = true;
  }

  openAddDependentModal(_rowData) {
    this.index = null;
    this.changeDetector.detectChanges();
    this.showAddDependentPage = true;
  }
  ToggleMedicareMemberList(isActive) {
    if (isActive === 'true') {
      this.medicarePatientsList = this.medicarePatients.filter(med => med.IsActive === true);
    }
    else if (isActive === 'false') {
      this.medicarePatientsList = this.medicarePatients.filter(med => med.IsActive === false);
    }
    else {
      this.medicarePatientsList = this.medicarePatients;
    }
  }
  AssignCategories(event) {
    const mediCareType = event.map(x => x.MedicareTypeName);
    this.selectedCategories = mediCareType;
    this.medicarePatientsList = this.copiedMedicarePatientsList;
    const filteredPatientsList = this.medicarePatientsList.filter(item => this.selectedCategories.includes(item.Category));
    this.medicarePatientsList = filteredPatientsList;
  }
}



