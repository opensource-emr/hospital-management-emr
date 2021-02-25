import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MappedGovernmentItems } from "../../shared/map-government-items.model";
import { GovernmentItems } from "../../shared/lab-government-items.model";
import { LabTest } from "../../shared/lab-test.model";
import { LabSettingsBLService } from "../shared/lab-settings.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';

@Component({ 
    selector: 'add-government-items',
    templateUrl: 'add-government-items.html'
})

export class AddGovernmentItemsComponent {
    @Input() mapItems: any = new MappedGovernmentItems();
    @Input() showMapGovItemsPage: boolean = false;
    @Input() update: boolean = false;
    @Input('selectedItem') 
    public selectedItem: MappedGovernmentItems;

    @Output("callback-Add") callBackData: EventEmitter<object> = new EventEmitter<object>();

    public allgovitems: Array<GovernmentItems> = new Array<GovernmentItems>();
    public labtestitems: Array<LabTest> = new Array<LabTest>();

    public selectedTest: any;
    public selectedComponent: any;
    public compName: any;

    public MappedComponent: MappedGovernmentItems = new MappedGovernmentItems();
    public loading: boolean = false;

    constructor(public labSettingBlServ: LabSettingsBLService,
        public msgBoxServ: MessageboxService){
            this.GetAllGovLabComponents();
            this.GetLabTestItems();
    }

    ngOnInit(){
        if(this.update){
            this.MappedComponent = Object.assign(new MappedGovernmentItems(), this.selectedItem);
            
            this.labSettingBlServ.GetAllGovLabComponents()
            .subscribe((res) => {
                if(res.Status == "OK"){
                    this.allgovitems = res.Results;
                    var name = this.allgovitems.filter(f => f.ReportItemId == this.selectedItem.ReportItemId);
                    this.selectedComponent = name[0].DisplayName;
                }else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            });
            this.compName = this.selectedItem.ComponentName;
            this.labSettingBlServ.GetAllLabTests()
            .subscribe((res) => {
                if(res.Status == "OK"){
                    this.labtestitems = res.Results;
                    var resTest = this.labtestitems.filter(f => f.LabTestId == this.selectedItem.LabItemId);
                    this.selectedTest = resTest[0].LabTestName;
                }else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            });
            this.MappedComponent.GovItemValidator.controls["ReportItemId"].disable();

        }else{
            this.MappedComponent = new MappedGovernmentItems();
            this.MappedComponent.IsActive = true;
            this.MappedComponent.IsResultCount = true;
            this.update = false;
        }
    }

    GetAllGovLabComponents(){
        this.labSettingBlServ.GetAllGovLabComponents()
            .subscribe((res) => {
                if(res.Status == "OK"){
                    this.allgovitems = res.Results;
                    
                }else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            }, 
                err => {
                    this.msgBoxServ.showMessage("error", ["Failed to get ReportTemplate List"]);
                });
    }

    GetLabTestItems(){
        this.labSettingBlServ.GetAllLabTests()
            .subscribe((res) => {
                if(res.Status == "OK"){
                    this.labtestitems = res.Results;
                }else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get ReportTemplate List"]);
            });
    }

    public Close() {
        this.callBackData.emit({ close: true, MappedComponent: null });
    }
    
   
    MapNewItem(){
        if(this.MappedComponent.IsComponentBased){
            this.MappedComponent.GovItemValidator.controls["LabItemId"].disable();
        }else{
            this.MappedComponent.GovItemValidator.controls["LabItemId"].enable();
        }

        if(this.loading){
            for(var i in this.MappedComponent.GovItemValidator.controls){
                this.MappedComponent.GovItemValidator.controls[i].markAsDirty();
                this.MappedComponent.GovItemValidator.controls[i].updateValueAndValidity();
            }
    
            if(this.MappedComponent.IsValidCheck(undefined, undefined)){
                this.labSettingBlServ.MapGovLabComponent(this.MappedComponent)
                .subscribe(
                    res => {
                        if(res.Status = "OK"){
                            this.callBackData.emit({ action: "add", mappedComponents: this.MappedComponent });
                            this.msgBoxServ.showMessage("success", ["Item mapped successfully."]);
                            
                        }else {
                            this.msgBoxServ.showMessage("error", ['Cannot Add Mapped Item']);
                        }
                    }
                )
            }  else {
                this.msgBoxServ.showMessage("error", ['Please Enter correct data']);
                this.loading = false;
              }  
        }
        
    }

    UpdateMappedItem(){
        if(this.loading){
            for(var i in this.MappedComponent.GovItemValidator.controls){
                this.MappedComponent.GovItemValidator.controls[i].markAsDirty();
                this.MappedComponent.GovItemValidator.controls[i].updateValueAndValidity();
            }
            if(this.MappedComponent.IsValidCheck(undefined, undefined)){
                this.labSettingBlServ.UpdateMappedGovLabComponent(this.MappedComponent)
                .subscribe(
                    res => {
                        if(res.Status = "OK"){
                            this.callBackData.emit({ action: "edit", mappedComponents: this.MappedComponent });
                            this.msgBoxServ.showMessage("success", ["Item Updated successfully."]);
                        }else {
                            this.msgBoxServ.showMessage("error", ['Cannot Update Mapped Item']);
                        }
                    }
                )
            } else {
                this.msgBoxServ.showMessage("error", ['Please Enter correct data']);
                this.loading = false;
              }  
        }
    }

    myListFormatter(data: any): string {
        let html = data["LabTestName"];
        return html;
    }

    componentListFormatter(data: any): string {
        let html = data["DisplayName"];
        return html;
    }

    LabTestOnChange(){
        if(this.selectedTest){
            this.MappedComponent.LabItemId = this.selectedTest.LabTestId;
            console.log(this.MappedComponent.LabItemId);
        }
    }

    LabComponentOnChange(){
        if(this.selectedComponent){
            this.MappedComponent.ReportItemId = this.selectedComponent.ReportItemId;
        }
    }
    
    ComponentNameOnChange(){
        if(this.compName){
            this.MappedComponent.ComponentName = this.compName.DisplayName;
        }
    }
}