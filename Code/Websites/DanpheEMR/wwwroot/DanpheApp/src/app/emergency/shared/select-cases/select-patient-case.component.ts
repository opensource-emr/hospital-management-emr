import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MessageboxService } from "../../../shared/messagebox/messagebox.service";
import { EmergencyService } from "../emergency.service";

@Component({
    selector: 'patient-cases',
    templateUrl: './select-patient-case.html'
})

export class PatientCasesSelectComponent {
    public allCasesMaster: any;
    public nestedCases: any = [];
    public selectedData: any = [];
    public selectedMainCase: any = [];

    @Input("selectedCases")
    public selectedCases: Array<any>;

    @Output("selected-cases-list")
    public items: EventEmitter<Object> = new EventEmitter<Object>();

    constructor(public erService: EmergencyService,
        public msgBoxServ: MessageboxService) {
        this.allCasesMaster = this.erService.casesLookUpDetail;
    }

    ngOnInit() {
        if(this.allCasesMaster && this.allCasesMaster.length >= 1){
            this.allCases();
        } else {            
            setTimeout(() => {this.allCasesMaster = this.erService.casesLookUpDetail; this.allCases()},2000);
        }
    }

    public allCases() {
        if (this.allCasesMaster && this.allCasesMaster.length >= 1) {
            this.selectedMainCase = 0;

            this.items.emit({ mainDetails: this.selectedMainCase, nestedDetails: this.selectedData });
        } else {
            this.msgBoxServ.showMessage('failed', ['Cannot Load Patient Cases Type.']);
        }
    }

    CasesOnChange($event) {
        this.items.emit({mainDetails: this.selectedMainCase, nestedDetails: $event});
    }

    assignNestedCases(id) {
        this.nestedCases = [];
        if(id == "0"){
            this.selectedMainCase = 0;
            this.items.emit({ mainDetails: this.selectedMainCase, nestedDetails: this.selectedData });
        }else{
            if (this.allCasesMaster && this.allCasesMaster.length >= 1) {
                if (this.allCasesMaster.ChildLookUpDetails && this.allCasesMaster.ChildLookUpDetails.length > 1) {
                    this.allCasesMaster.ChildLookUpDetails.forEach(c => {
                        let val = Object.assign({}, c);
                        this.selectedData.push(val);
                    });
                }
    
                var data = this.allCasesMaster.filter(a => a.Id == +id);
                if (data[0].ChildLookUpDetails && data[0].ChildLookUpDetails.length > 1) {
                    data[0].ChildLookUpDetails.forEach(a => {
                        this.nestedCases.push(a);
                        this.selectedData.push(a);
                    });
    
                }
                
                this.selectedMainCase = +id;
                this.items.emit({ mainDetails: this.selectedMainCase, nestedDetails: this.selectedData });
            }
        }
       
    }
}