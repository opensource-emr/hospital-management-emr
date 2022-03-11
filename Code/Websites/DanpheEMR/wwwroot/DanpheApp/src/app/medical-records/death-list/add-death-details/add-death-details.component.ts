import { Component, Output, EventEmitter } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { MR_BLService } from "../../shared/mr.bl.service";
import { Observable } from "rxjs-compat";
import { DeathDetails } from "../../../adt/shared/death.detail.model";

@Component({
    selector: 'add-death-details',
    templateUrl: 'add-death-details.component.html'
})

export class AddDeathDetailsComponent {

    public DeathDetails: DeathDetails = new DeathDetails();
    public IsEditMode: boolean = false;
    @Output('CallBack') public emitter: EventEmitter<object> = new EventEmitter<object>();
    public SelectedPatient: any;
    public ValidPatient: boolean = true;
    public submitValidData: boolean=false;
    public AllDeathCertificateNumbers: Array<any> = [];

    public duplicateCertificateNumber: boolean = false;
    public IsLoading: boolean = false;
    constructor(public medicalRecordsBLService: MR_BLService, public msgBoxServ: MessageboxService) {

    }




    //  public SaveDeathDetails() {
    //     this.IsLoading = true;
    //     if (!this.DeathDetails.PatientId) {
    //         this.msgBoxServ.showMessage("Warning", ["Select Patient First! Its required!"]);
    //        this.IsLoading = false;
    //         return;
    //     }
    //         else if(!this.DeathDetails.DeathTime|| !this.DeathDetails.DeathDate){
    //             this.msgBoxServ.showMessage("warning",["Invalid fields!!! Please provide missing data "]);
    //         }
    //     else
    //         if (this.DeathDetails.DeathId && this.DeathDetails.DeathId > 0) {
    //             this.PutDeathCertificate();
    //         } else {
    //             this.PostDeathCertificate();
    //         }
    // }

    // ValidateDeathDetails(): boolean {
    //     for (var i in this.DeathDetails.DeathDetailsValidator.controls) {
    //         this.DeathDetails.DeathDetailsValidator.controls[i].markAsDirty();
    //         this.DeathDetails.DeathDetailsValidator.controls[i].updateValueAndValidity();
    //     }
    //     if (this.DeathDetails.IsValidCheck(undefined, undefined)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }
    PostDeathCertificate() {
        this.IsLoading=true;
        this.medicalRecordsBLService.PostDeathDetails(this.DeathDetails).subscribe(res => {
            if (res.Status = "OK") {
                this.emitter.emit({ Close: false, Add: true, Edit: false });
                this.msgBoxServ.showMessage('success', ['Death Details added successfully!']);
                this.IsLoading=false;
            }
             this.IsLoading=false;
        })
        
    }
    PutDeathCertificate() {
        this.medicalRecordsBLService.PutDeathDetails(this.DeathDetails).subscribe(res => {
            if (res.Status == 'OK') {
                this.IsEditMode = false;
                this.emitter.emit({ Close: false, Add: false, Edit: true });
                this.msgBoxServ.showMessage('success', ["Death Detail is Updated."])
            }
        });
    }

    // PatientListFormatter(data: any): string {
    //     let html: string = "";
    //     html = "<font size=03>" + "[" + data["PatientCode"] + "]" + "</font>&nbsp;-&nbsp;&nbsp;<font color='blue'; size=03 ><b>" + data["ShortName"] +
    //         "</b></font>&nbsp;&nbsp;" + "(" + data["Age"] + '/' + data["Gender"] + ")" + '' + "</b></font>";
    //     return html;
    // }

    // public AllPatientSearchAsync = (keyword: any): Observable<any[]> => {

    //     return this.medicalRecordsBLService.GetAllPatients(keyword);

    // }

    // public GetAllDeathCertificatesNumbers() {
    //     this.medicalRecordsBLService.GetAllDeathCertificateNumbers().subscribe(
    //         res => {
    //             if (res.Status == 'OK') {

    //                 this.AllDeathCertificateNumbers = res.Results;
    //             } else {
    //                 this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //             }
    //         },
    //         err => {
    //             this.msgBoxServ.showMessage("error", [err.ErrorMessage]);

    //         }
    //     );
    // }

    // OnDeathCertificateChange(){
    //     this.duplicateCertificateNumber = this.isDeathCertificateNoDuplicate(this.DeathDetails.CertificateNumber);
    // }
    // /**
    //  * Find if entered certificate number is already registered before
    //  * @param deathCertificateNumber 
    //  * @returns true if duplicate is found
    //  */
    // public isDeathCertificateNoDuplicate(deathCertificateNumber) {
    //     return this.AllDeathCertificateNumbers.some(a => a.CertificateNumber == deathCertificateNumber.trim());
    // }
    // public PatientInfoChanged() {
    //     this.ValidPatient = true;
    // }

    //   OnPressedEnterKeyInItemField(index) {
    //     if (this.SelecetdItemList[index].SelectedItem != null && this.SelecetdItemList[index].ItemId != 0) {
    //         this.FocusElementById(`qtyip${index}`);
    //     }
    //     else {
    //       if (this.SelecetdItemList.length == 1) {
    //         this.FocusElementById('itemName0')
    //     }
    //     else {
    //       this.SelecetdItemList.splice(index, 1);
    //       this.FocusElementById('save');
    //     }
    //     }
    //   }

    public Close() {
        this.DeathDetails = new DeathDetails();
        this.emitter.emit({ Close: true, Add: false, Edit: false });
    }
   
    callBackForDeathDetails(parentData) {
        if(parentData.Status='Submit' && parentData.data){
            this.DeathDetails= parentData.data ;
            if(this.DeathDetails.DeathId && this.DeathDetails.DeathId>0){
                this.PutDeathCertificate();
            }
            else{
                this.PostDeathCertificate();
            }
        }else{
            this.Close();
        }
    }
}