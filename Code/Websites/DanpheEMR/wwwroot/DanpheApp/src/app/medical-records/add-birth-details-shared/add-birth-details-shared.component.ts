import { Input, Output } from '@angular/core';
import { Component, ChangeDetectorRef } from '@angular/core'
import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from '../../core/shared/core.service';
import { BabyBirthDetails } from '../../adt/shared/baby-birth-details.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

import { MedicalRecordsMasterDataVM } from '../shared/DischargeMasterData.model';
import { MR_BLService } from '../shared/mr.bl.service';
import { Employee } from '../../employee/shared/employee.model';
import { MasterType } from '../../shared/danphe-cache-service-utility/cache-services';
import { DanpheCache } from '../../shared/danphe-cache-service-utility/cache-services';

@Component({
    selector: 'add-birth-details-shared',
    templateUrl: 'add-birth-details-shared.html'
})
export class AddBirthDetailsSharedComponent {

    @Input('NoOfBabies')
    public NoOfBabies: number;

    @Input('MotherPatientId')
    public MotherPatientId: number;

    public BirthDetail: BabyBirthDetails = new BabyBirthDetails();
    public BabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
    public allMasterDataForMR: MedicalRecordsMasterDataVM = new MedicalRecordsMasterDataVM();
    public IsEditMode: boolean = false;
    public birthCertificatesNumber: any;
    public SelectedPatient: any;
    public providerList: Array<Employee> = new Array<Employee>();
    public BirthTypeList: Array<any> = new Array<any>();
    public ValidPatient: boolean = true;
    public IssuedSignatory: any = '';
    public CertifiedSignatory: any = '';
    public showEditbuttion: boolean = true;
    public selectedBirthCertIndex: number = -1;
    public loading: boolean = false;
    public AllNewBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
    public duplicateCertificateNumber: boolean = false;
    // public BirthConditionList: Array<BabyBirthConditionModel> = new Array<BabyBirthConditionModel>();

    @Output('CallBack')
    public emitter: EventEmitter<object> = new EventEmitter<object>();

    @Output('on-submit')
    public emitter1: EventEmitter<object> = new EventEmitter<object>();

    @Input('on-submit')
    public onSubmit: boolean = false;
    public showSelectMother: boolean = false;

    public AllBirthCertificateNumbers: Array<any> = Array<any>();
    public CertificateNoBeforeEdit: string;
    constructor(
        public medicalRecordsBLService: MR_BLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef,
        public coreService: CoreService) {
        this.BirthDetail = new BabyBirthDetails();
        this.BirthDetail.BirthConditionId = null;//this will keep -select- as default selection..
        this.GetAllTheMasterDataForMrRecords();
        this.GetAllBirthCertificateNumbers();
    }

    ngOnInit() {

        this.providerList = DanpheCache.GetData(MasterType.Employee, null);
        this.GetBirthType();
        if (this.MotherPatientId && this.MotherPatientId > 0) {
            this.GetBabyDetailsListByMotherPatientId();

        } else {
            this.showSelectMother = true;
        }
    }


    ValidateBirthDetails(): boolean {
        for (var i in this.BirthDetail.BabyBirthDetailsValidator.controls) {
            this.BirthDetail.BabyBirthDetailsValidator.controls[i].markAsDirty();
            this.BirthDetail.BabyBirthDetailsValidator.controls[i].updateValueAndValidity();
        }
        if (this.BirthDetail.IsValidCheck(undefined, undefined)) {
            return true;
        } else {
            return false;
        }
    }

    public AutoSelectBirthType() {

        if (this.NoOfBabies > 2) {
            this.BirthDetail.BirthNumberType = "multiple"
        }
        else if (this.NoOfBabies == 2) {
            this.BirthDetail.BirthNumberType = "twins"
        }
        else {
            this.BirthDetail.BirthNumberType = "single"
        }
    }

    public AutoSelectDeliveryType(DeliveryType: string) {

        // Note: DeleveryType is not so dynamic (Confirmed with BA team) so, we have mapped it with Birth Type mannually in code
        // DeliveryType >>>>> to >>>>> Birth Type
        // Normal --------> spontaneous vaginal delivery
        // Forceps, Vacuum and Breech -----> Instrumental delivery
        // C/S -----------> Cesarean Section

        if (!DeliveryType) {
            this.BirthDetail.BirthType = undefined;
        }
        else if (DeliveryType && DeliveryType == "Normal") {
            this.BirthDetail.BirthType = "Spontaneous Vaginal Delivery"
        }
        else if (DeliveryType && DeliveryType == "C/S") {
            this.BirthDetail.BirthType = "Cesarean Section"
        }
        else if (DeliveryType && (DeliveryType == "Forceps" || DeliveryType == "Vacuum" || DeliveryType == "Breech")) {
            this.BirthDetail.BirthType = "Instrumental Delivery"
        }
        else {
            this.BirthDetail.BirthType = 'Other';
        }
    }

    PatientListFormatter(data: any): string {
        let html: string = "";
        html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
            + data["PatientId"] + "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
        return html;
    }

    public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

        return this.medicalRecordsBLService.GetAllFemalePatients(keyword)


    }
    public PatientInfoChanged() {

        if (this.SelectedPatient && this.SelectedPatient.PatientId) {
            this.MotherPatientId = this.SelectedPatient.PatientId;
            this.GetBabyDetailsListByMotherPatientId();
        }

    }

    public Close() {
        if (this.BabyBirthDetails.length > 0) {
            if (confirm("Do you want to discard added birth details?")) {
                this.BirthDetail = new BabyBirthDetails();
                this.emitter.emit({ Close: true, Add: false, Edit: false });
            }
        } else {
            this.BirthDetail = new BabyBirthDetails();
            this.emitter.emit({ Close: true, Add: false, Edit: false });
        }


    }


    public AddBirthDetailToList() {
        var IsDataValid: boolean;

        if (this.MotherPatientId == 0) {
            this.msgBoxServ.showMessage("Warning", ["Select Patient (Mother) First! Its required!"]);
            IsDataValid = false;
            this.loading = true;
            return;

        }

        this.BirthDetail.CertifiedBy = this.CertifiedSignatory.EmployeeId;
        this.BirthDetail.IssuedBy = this.IssuedSignatory.EmployeeId;

        // if (!this.BirthDetail.BirthType) {
        //     this.msgBoxServ.showMessage("Warning", ["Please select birth type"]);
        //     return;
        // }

        IsDataValid = this.ValidateBirthDetails();
        if (this.loading == false && IsDataValid == true) {

            if (this.IsEditMode && this.selectedBirthCertIndex > -1) { // For edit case
                this.BabyBirthDetails[this.selectedBirthCertIndex] = this.BirthDetail;
            } else if (this.selectedBirthCertIndex == -1) {

                var newObj = Object.assign({}, this.BirthDetail);
                this.BabyBirthDetails.push(newObj);
                let NewlyBabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
                NewlyBabyBirthDetails = this.BabyBirthDetails;
                NewlyBabyBirthDetails.forEach(a => (a.PatientId = this.MotherPatientId));
                NewlyBabyBirthDetails = NewlyBabyBirthDetails.filter(a => a.BabyBirthDetailsId == 0);
                this.AllNewBirthDetails = NewlyBabyBirthDetails;
                this.emitter1.emit(NewlyBabyBirthDetails);
            }
            let tempDate = this.BirthDetail.BirthDate;

            let tempFather = this.BirthDetail.FathersName;
            let tempTime = this.BirthDetail.BirthTime;
            let tempBirthTypeNumber = this.BirthDetail.BirthNumberType;
            let tempBirthType = this.BirthDetail.BirthType;
            let tempIssuedBy = this.IssuedSignatory;
            let tempCertified = this.CertifiedSignatory;
            this.BirthDetail = new BabyBirthDetails();

            this.CertifiedSignatory = tempCertified;
            this.IssuedSignatory = tempIssuedBy;
            this.BirthDetail.BirthNumberType = tempBirthTypeNumber;
            this.BirthDetail.BirthType = tempBirthType;
            this.BirthDetail.BirthTime = tempTime; // to make same date as that of 1st Added Birth details.
            this.BirthDetail.BirthDate = tempDate; // to make same date as that of 1st Added Birth details.
            this.BirthDetail.BabyBirthDetailsValidator.get('BirthDate').setValue(this.BirthDetail.BirthDate);
            this.BirthDetail.BabyBirthDetailsValidator.get('BirthTime').setValue(this.BirthDetail.BirthTime);

            this.changeDetector.detectChanges();

            this.BirthDetail.FathersName = tempFather; // to make same father name as that of 1st Added Birth details.
            this.selectedBirthCertIndex = -1;
            this.IsEditMode = false;
            this.loading = false;
        } else {
            this.msgBoxServ.showMessage("Warning", ["Invalid fields! Some Birth Details Missing!"]);
        }
    }

    public GetBirthType() {
        var birthTypeList = this.coreService.GetBirthType();
        this.BirthTypeList = birthTypeList.map(birthType => { return { type: birthType, IsSelected: false } });
    }

    public AssignCertAndIssuedSignatory() {
        var issuedBy = this.providerList.find(p => p.EmployeeId == this.BirthDetail.IssuedBy);
        var cetrBy = this.providerList.find(c => c.EmployeeId == this.BirthDetail.CertifiedBy);
        if (issuedBy) { this.IssuedSignatory = issuedBy; }
        if (cetrBy) { this.CertifiedSignatory = cetrBy; }
    }

    public OnChangeIssuedSignatory() {

    }

    public OnChangeCertifiedSignatory() {

    }

    public SaveBirthDetail() {
        this.loading = true;
        var IsDataValid: boolean = this.ValidateBirthDetails();
        // var errorMessages: string[] = [];
        // if (!this.BirthDetail.BirthNumberType) {
        //     errorMessages.push("Birth Number (single, twin, multiple) field is missing in Birth Certificate.");
        //     IsDataValid = false;
        //   }
        //   if (!this.BirthDetail.BirthType) {
        //     errorMessages.push("Birth Type field is missing in Birth Certificate.");
        //     IsDataValid = false;
        //   }
        //   if (!this.IssuedSignatory || !this.IssuedSignatory.EmployeeId) {
        //     errorMessages.push("Issued By field is missing in Birth Certificate.");
        //     IsDataValid = false;
        //   }
        //   if (!this.CertifiedSignatory || !this.CertifiedSignatory.EmployeeId) {
        //     errorMessages.push("Certified By field is missing in Birth Certificate.");
        //     IsDataValid = false;
        //   }
        if (IsDataValid) {
            if (this.BirthDetail.BabyBirthDetailsId && this.BirthDetail.BabyBirthDetailsId > 0) {
                this.medicalRecordsBLService.PutBirthDetail(this.BirthDetail).subscribe(res => {
                    if (res.Status == 'OK') {
                        this.BabyBirthDetails[this.selectedBirthCertIndex] = this.BirthDetail;
                        this.BirthDetail = new BabyBirthDetails();
                        // this.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
                        this.selectedBirthCertIndex = -1;
                        this.IsEditMode = false;
                        this.msgBoxServ.showMessage('success', ["Birth Detail is Updated."]);
                    }
                });
            } else {
                this.BabyBirthDetails[this.selectedBirthCertIndex] = this.BirthDetail;
                let NewlyBabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
                NewlyBabyBirthDetails = this.BabyBirthDetails;
                this.emitter1.emit(NewlyBabyBirthDetails);
                this.BirthDetail = new BabyBirthDetails();
                // this.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
                this.selectedBirthCertIndex = -1;
                this.IsEditMode = false;
            }
            this.loading = false;
        }
    }

    public EditCurrentBirthDetail(brthIndex: number) {
        this.selectedBirthCertIndex = brthIndex;
        var currBrth = this.BabyBirthDetails[brthIndex];
        this.CertificateNoBeforeEdit = null;
        if (currBrth) {
            this.IsEditMode = true;
            this.BirthDetail = Object.assign(new BabyBirthDetails(), currBrth);
            this.CertificateNoBeforeEdit = this.BirthDetail.CertificateNumber;
        }
    }

    public RemoveCurrentBirthDetail(brthIndex: number) {
        this.BabyBirthDetails.splice(brthIndex, 1);
    }

    public ResetBirthDetail() {
        this.selectedBirthCertIndex = -1;
        this.BirthDetail = new BabyBirthDetails();
        // this.BirthDetail.BirthDate = moment().format("YYYY-MM-DD");
        this.IsEditMode = false;
    }
    public GetBabyDetailsListByMotherPatientId() {
        this.loading = false;
        this.medicalRecordsBLService.GetBabyDetailsListByMotherPatientId(this.MotherPatientId).subscribe(
            (res: any) => {
                if (res.Status == 'OK') {
                    this.BabyBirthDetails = new Array<BabyBirthDetails>();
                    this.BabyBirthDetails = res.Results;

                }
            }
        );
    }

    public GetAllTheMasterDataForMrRecords() {

        this.medicalRecordsBLService.GetAllMasterDataForMR().subscribe(
            res => {
                if (res.Status == 'OK') {
                    this.allMasterDataForMR.AllBirthConditions = res.Results.AllBirthConditions;

                }
                else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
            });
    }

    public BirthCertificateNumberDuplicationCheck() {

        this.duplicateCertificateNumber = undefined;
        let a = this.AllBirthCertificateNumbers.some(a => a.CertificateNumber == this.BirthDetail.CertificateNumber.trim());
        let b = this.AllNewBirthDetails.some(b => b.CertificateNumber == this.BirthDetail.CertificateNumber.trim());
        if (this.BirthDetail.CertificateNumber && (a || b)) {
            if (this.CertificateNoBeforeEdit != this.BirthDetail.CertificateNumber) {
                this.duplicateCertificateNumber = true;
            }

        } else {
            this.duplicateCertificateNumber = false;

        }
    }

    public GetAllBirthCertificateNumbers() {
        this.medicalRecordsBLService.GetAllBirthCertificateNumbers().subscribe(
            res => {
                if (res.Status == 'OK') {
                    this.AllBirthCertificateNumbers = res.Results;
                }
            }
        )
    }

    public myListFormatter(data: any): string {
        let html = data["FullName"];
        return html;
    }

    public CancelUpdate() {
        this.BirthDetail = new BabyBirthDetails();
        this.IsEditMode = false;
    }

}
