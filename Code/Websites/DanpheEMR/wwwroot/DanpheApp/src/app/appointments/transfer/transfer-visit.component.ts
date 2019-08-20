import { Component, Directive, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { Visit } from '../shared/visit.model';
import { VisitBLService } from '../shared/visit.bl.service';
import { Employee } from '../../employee/shared/employee.model';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';

@Component({
    selector: "danphe-transfer-visit",
    templateUrl: "./transfer-visit.html"
})
export class TransferVisitComponent {
    public showTransferPage: boolean = false;
    @Input("visit")
    public selectedVisit: Visit;
    @Output("callback-transfer")
    callBackTransfer: EventEmitter<Object> = new EventEmitter<Object>();
    public providerList: Array<Employee> = new Array<Employee>();
    public selectedProvider: Employee = new Employee();
    public doctorList: Array<any> = [];
    public departmentId: number = 0;
    public departmentList: any;
    
    public loading: boolean = false;//to restrict double click

    constructor(public visitBLService: VisitBLService,
        public msgBoxServ: MessageboxService) {

    }

    @Input("showTransferPage")
    public set value(val: boolean) {
        if (val) {
            this.GetDepartmentList(val);
            this.GetDoctorList();
        }
        this.showTransferPage = val;
    }

    public GetDepartmentList(val: boolean): void {
        this.visitBLService.GetDepartmentList()
            .subscribe(res => {
                this.departmentList = [];
                if (res && res.Results) {
                    this.departmentList = res.Results;
                }

            });
    }


    //load doctor  list according to department.
    //does a get request in employees table using departmentId.
    GetDoctorList(): void {
        //erases previously selected doctor and clears respective schedule list
        this.selectedProvider = null;
        this.visitBLService.GetDoctorList(this.departmentId)
            .subscribe(res => this.CallBackGenerateDoctor(res));

    }

    AssignSelectedDoctor() {
        this.departmentId = this.selectedProvider.DepartmentId;
    }

    //this is a success callback of GenerateDoctorList function.
    CallBackGenerateDoctor(res) {
        if (res.Status == "OK") {
            this.providerList = [];
            //format return list into Key:Value form, since it searches also by the property name of json.
            if (res && res.Results) {
                res.Results.forEach(a => {
                    this.providerList.push(a);
                });
            }
        }
        else {
            this.msgBoxServ.showMessage("failed", [res.ErrorMessage]);
        }
    }

    myListFormatter(data: any): string {
        let html = data["Value"];
        return html;
    }

    Transfer() {
        this.loading = true;//disables Transfer button
        if (this.selectedProvider && this.selectedProvider.EmployeeId) {
            this.selectedVisit.TransferredProviderId = this.selectedVisit.ProviderId;
            this.visitBLService.ContinueNextVisit(this.selectedVisit, this.selectedProvider, "transfer")
                .subscribe(res => {
                    if (res.Status == "OK") {
                        this.msgBoxServ.showMessage("success", ["Transferred successfully."]);
                        this.showTransferPage = false;
                        this.callBackTransfer.emit({ visit: res.Results });
                    }
                    else {
                        this.msgBoxServ.showMessage("failed", ["Unable to transfer visit."]);
                        console.log(res.ErrorMessage);
                    }
                    this.loading = false;
                });

            //this.callBackTransfer.emit({ provider: this.selectedProvider });
        }
        else
            this.msgBoxServ.showMessage("error", ["Please!!!Select proper doctor to transfer to."]);
        this.loading = false;//enable Transfer button once function completed

    }

    Close() {
        this.showTransferPage = false;
    }

    //used to format the display of item in ng-autocomplete.
    ProviderListFormatter(data: any): string {
        let html = data["FullName"];//FullName is a property in the Employee Model.
        //let html = data["Salutation"] + "." + data["FirstName"] + "  " + data["LastName"];
        return html;
    }
}
