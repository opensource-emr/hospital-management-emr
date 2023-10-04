import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CoreService } from "../../../core/shared/core.service";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { ChildDetailsVM, MaternityRegister, MatPatientRegisterVm, RegistrationDetails } from "../../shared/maternity-register.model";
import { MaternityBLService } from "../../shared/maternity.bl.service";
import { ComplicationModel, MaternityService, TypeOfDeliveryModel } from "../../shared/maternity.service";

@Component({
    selector: 'maternity-register',
    templateUrl: './maternity-register.html'
})

export class MaternityRegisterComponent {
    @Input('selected-pat')
    public selectedPatient: any;

    @Output("callBackMatRegisterClose")
    public callBackMatRegisterClose: EventEmitter<Object> = new EventEmitter<Object>();

    public matPatVM: MatPatientRegisterVm = new MatPatientRegisterVm();

    public numBabies: number = 0;
    public matPat: RegistrationDetails = new RegistrationDetails();
    public deliveryTypes: Array<TypeOfDeliveryModel>;
    public complicationTypes: Array<ComplicationModel>;
    public matRegId: number = 0;

    public matRegDataList: Array<RegistrationDetails> = new Array<RegistrationDetails>();

    public multipleChild: Array<ChildDetailsVM> = new Array<ChildDetailsVM>();
    public childDetail: ChildDetailsVM = new ChildDetailsVM();

    constructor(public matService: MaternityService,
        public maternityBlService: MaternityBLService,
        public msgBoxServ: MessageboxService,
        public coreService: CoreService) {
        this.deliveryTypes = this.matService.TypeOfDelivery;
        this.complicationTypes = this.matService.Complication;
    }

    ngOnInit() {
        this.matRegDataList = [];
        this.numBabies = this.matPat.NumberOfBaby;
        for(var i=0; i<this.numBabies; i++){
            let abc = new ChildDetailsVM();
            this.multipleChild.push(abc);
        }
        this.GetAllBabyRegistrationDetails();
    }

    changeNumOfBaby($event) {
        this.numBabies = +$event;
        this.multipleChild = [];
        for(var i=0; i<this.numBabies; i++){
            let abc = new ChildDetailsVM();
            this.multipleChild.push(abc);
        }
    }


    GetAllBabyRegistrationDetails() {
        this.maternityBlService.GetAllChildList(this.selectedPatient.MaternityPatientId, this.selectedPatient.PatientId).subscribe(res => {
            if (res.Status == "OK") {
                this.matRegDataList = res.Results;
            }
        })
    }

    AddNewMatDetails() {
        this.coreService.loading = true;
        for (var i in this.matPat.MaternityRegisterDetailsValidator.controls) {
            this.matPat.MaternityRegisterDetailsValidator.controls[i].markAsDirty();
            this.matPat.MaternityRegisterDetailsValidator.controls[i].updateValueAndValidity();
        }

        if (this.matPat.IsValid(undefined, undefined)) {
            this.matPatVM.MaternityPatient.PatientId = this.selectedPatient.PatientId;
            this.matPatVM.MaternityPatient.MaternityPatientId = this.selectedPatient.MaternityPatientId;
            this.matPatVM.MaternityPatient.Complications = this.matPat.Complications;
            this.matPatVM.MaternityPatient.DeliveryDate = this.matPat.DeliveryDate;
            this.matPatVM.MaternityPatient.PlaceOfDelivery = this.matPat.PlaceOfDelivery;
            this.matPatVM.MaternityPatient.Presentation = this.matPat.Presentation;
            this.matPatVM.MaternityPatient.TypeOfDelivery = this.matPat.TypeOfDelivery;
            for (var j = 0; j < this.matPat.NumberOfBaby; j++) {
                var abc = new MaternityRegister();

                abc.MaternityPatientId = this.selectedPatient.MaternityPatientId;
                abc.PatientId = this.selectedPatient.PatientId;
                abc.OutcomeOfMother = this.multipleChild[j].OutcomeOfMother;
                abc.OutcomeOfBaby = this.multipleChild[j].OutcomeOfBaby;
                abc.Gender = this.multipleChild[j].Gender;
                abc.WeightInGram = this.multipleChild[j].WeightInGram;

                this.matPatVM.MaternityDetails.push(abc);
            }


            this.maternityBlService.RegisterMaternity(this.matPatVM).subscribe(res => {
                if (res.Status == "OK") {
                    this.callBackMatRegisterClose.emit({ close: true });
                    this.msgBoxServ.showMessage('success', ['Registered successfully.']);
                } else {
                    this.msgBoxServ.showMessage('failed', ['Failed to register. Please try again later.']);
                }
                this.matPat = new RegistrationDetails();
                this.coreService.loading = false;
            }, err => {
                this.coreService.loading = false;
                this.msgBoxServ.showMessage('failed', ['Failed to Add Details.']);
            })
        } else {
            this.coreService.loading = false;
        }

    }

    EditDeliveryDetails(selectedData: any) {
        this.matPat.MaternityRegisterId = selectedData.MaternityRegisterId;
        this.matPat.Presentation = selectedData.Presentation;
        this.matPat.Complications = selectedData.Complications;
        this.matPat.TypeOfDelivery = selectedData.TypeOfDelivery;
        this.matPat.DeliveryDate = selectedData.DeliveryDate;
        this.matPat.PlaceOfDelivery = selectedData.PlaceOfDelivery;
        this.multipleChild[0] = Object.assign(new ChildDetailsVM(), selectedData);
    }

    UpdateChildDetails() {
        this.coreService.loading = true;
        this.matPat.Gender = this.multipleChild[0].Gender;
        this.matPat.OutcomeOfBaby = this.multipleChild[0].OutcomeOfBaby;
        this.matPat.OutcomeOfMother = this.multipleChild[0].OutcomeOfMother;
        this.matPat.WeightInGram = this.multipleChild[0].WeightInGram;
        this.maternityBlService.UpdateChildInfo(this.matPat).subscribe(res => {
            if (res.Status == "OK") {
                this.msgBoxServ.showMessage('success', ['Child Details updated successfully.']);
                this.GetAllBabyRegistrationDetails();
                this.coreService.loading = false;
            }
            this.matPat = new RegistrationDetails();
            this.matPat.MaternityRegisterId = this.matPat.MaternityRegisterId;
            this.childDetail = new ChildDetailsVM();
        }, err => {
            this.coreService.loading = false;
            this.msgBoxServ.showMessage('failed', ['Failed to update child details.']);
        });
    }

    UpdateMotherDetails(){
        this.coreService.loading = true;
        this.matPat.MaternityPatientId = this.selectedPatient.MaternityPatientId;
        this.maternityBlService.UpdateMotherInfo(this.matPat).subscribe( res => {
            if(res.Status == "OK"){
                this.msgBoxServ.showMessage('success', ['Mother Details updated successfully.']);
                this.GetAllBabyRegistrationDetails();
                this.coreService.loading = false;
            }
            this.matPat = new RegistrationDetails();
            this.matPat.MaternityRegisterId = this.matPat.MaternityRegisterId;
            this.childDetail = new ChildDetailsVM();
        }, err => {
            this.coreService.loading = false;
            this.msgBoxServ.showMessage('failed', ['Failed to update mother details.']);
        });
    }

    RemoveChildDetails(id){
        if (confirm("Are you Sure want to Remove the child details?")){
            this.maternityBlService.DeleteChild(id).subscribe(res => {
                if(res.Status == "OK"){
                    this.matRegDataList = this.matRegDataList.filter(p => p.MaternityRegisterId != id).slice();
    
                    this.msgBoxServ.showMessage('success', ['Child details removed successfully.']);
                }
            }, err => {
                this.msgBoxServ.showMessage('failed', ['Failed to remove child details.']);
            });
        }        
    }

    Close() {
        this.callBackMatRegisterClose.emit({ close: true });
      }


      Print() {
        let popupWinindow;
        var printContents = "";
        if (document.getElementById("matRegList")) {
          printContents = document.getElementById("matRegList").innerHTML;
        } else {
          this.msgBoxServ.showMessage('failed', ['Failed to Print']);
          return;
        }  
    
        popupWinindow = window.open(
          "",
          "_blank",
          "width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
        );
        popupWinindow.document.open();
        var documentContent = "<html><head>";
        documentContent +=
          `<link rel="stylesheet" type="text/css" href="../../../../../../assets-dph/external/global/plugins/bootstrap/css/bootstrap.min.css" />` +
          `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanpheStyle.css" />` +
          `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/Danphe_ui_style.css" /></head>` +
          `<link rel="stylesheet" type="text/css" href="../../../../../../themes/theme-default/DanphePrintStyle.css" /></head>`;
    
        /// documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
        ///Sud:22Aug'18--added no-print class in below documeentContent
    
        documentContent +=
          '<body>' +
          printContents +
          "</body></html>";
        popupWinindow.document.write(documentContent);
        popupWinindow.document.close();
    
        let tmr = setTimeout(function () {
          popupWinindow.print();
          popupWinindow.close();
        }, 300);
    
        if (tmr) {
          return true;
        }
      }
}