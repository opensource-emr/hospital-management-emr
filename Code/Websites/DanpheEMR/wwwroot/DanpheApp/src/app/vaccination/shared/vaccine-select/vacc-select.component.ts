import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DanpheHTTPResponse } from "../../../shared/common-models";
import { SecurityService } from "../../../security/shared/security.service";
import { VaccinationBLService } from "../vaccination.bl.service";

@Component({
    selector: "vaccine-select",
    templateUrl: "./vaccine-select.html",
})
export class VaccineSelectComponent {
    public allVaccines: Array<any> = new Array<any>();
    public selectedData: any = [];

    @Output("selected-vaccine-list")
    public items: EventEmitter<any[]> = new EventEmitter<any[]>();

    @Input("selectedVaccines")
    public selectedVaccines: Array<any>;

    constructor(
        public msgBoxServ: MessageboxService,
        public http: HttpClient,
        public securityService: SecurityService,
        public vaccinationBlService: VaccinationBLService
    ) {
        this.GetAllVaccines();
    }


    public GetAllVaccines() {
        this.vaccinationBlService.GetAllVaccinesListWithDosesMapped(false).subscribe(res => {
            if (res.Status == "OK") {
                this.allVaccines = res.Results;
            } else {
                this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
            }
        });
    }

    VaccineOnChange($event) {
        this.items.emit($event);
    }

}
