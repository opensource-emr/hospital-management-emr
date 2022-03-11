import { Component, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { BabyBirthDetails } from "../../../adt/shared/baby-birth-details.model";
import { MR_BLService } from "../../shared/mr.bl.service";
import { BabyBirthConditionModel } from "../../shared/babyBirthConditions.model";
import { MedicalRecordsMasterDataVM } from "../../shared/DischargeMasterData.model";


@Component({
    selector: 'add-birth-details',
    templateUrl: 'add-birth-details.component.html'
})

export class AddBirthDetailsComponent {

    public BirthDetail: BabyBirthDetails = new BabyBirthDetails();
    public newBabyBirthDetail: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
    public BabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
    public allMasterDataForMR: MedicalRecordsMasterDataVM = new MedicalRecordsMasterDataVM();
    public IsEditMode: boolean = false;

    @Output('CallBack')
    public emitter: EventEmitter<object> = new EventEmitter<object>();
    public ValidPatient: boolean = true;
    public showEditbuttion: boolean = true;
    public motherDetail: Array<any> = Array<any>();
    public selectedBirthCertIndex: number = -1;
    public loading: boolean = false;
    public motherId: any;
    public allFemalePatientList: Array<any> = Array<any>();
    public BirthConditionList: Array<BabyBirthConditionModel> = new Array<BabyBirthConditionModel>();
    public submitCalled: boolean = false;

    public babyBirthCount: any;
    public selectedPatientId: any;
    constructor(
        public medicalRecordsBLService: MR_BLService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.BirthDetail = new BabyBirthDetails();
    }
    public Submit() {
        this.loading = true;

        let NewlyBabyBirthDetails: Array<BabyBirthDetails> = new Array<BabyBirthDetails>();
        NewlyBabyBirthDetails = this.BabyBirthDetails
        this.babyBirthCount = this.BabyBirthDetails.length;
        // if(this.babyBirthCount==2){
        //     NewlyBabyBirthDetails.
        // }
        // .filter(a => a.BabyBirthDetailsId == 0);
        this.PostBirthCertificate(NewlyBabyBirthDetails);

    }
    PostBirthCertificate(NewBabyBirthDetails) {
        if (this.BabyBirthDetails && this.BabyBirthDetails.length != 0) {
            this.medicalRecordsBLService.PostBirthCertificateDetail(NewBabyBirthDetails)
                .finally(() => { this.loading = false; })
                .subscribe(res => {
                    if (res.Status = "OK") {
                        this.emitter.emit({ Close: false, Add: true, Edit: false });
                        this.msgBoxServ.showMessage('', ['Birth Details added successfully!']);
                    }
                });
        }
        else {
            this.loading = false;
            this.msgBoxServ.showMessage('warning', ["Please fill the birth details first!!!!"]);
            this.loading = false;
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

    onSubmit($event) {
        this.BabyBirthDetails = $event;
    }

}
