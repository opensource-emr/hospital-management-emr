import { Component, ChangeDetectorRef } from "@angular/core";
import { GovernmentItems } from "../../shared/lab-government-items.model";
import { LabTest } from "../../shared/lab-test.model";
import { LabSettingsBLService } from "../shared/lab-settings.bl.service";
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { MappedGovernmentItems } from "../../shared/map-government-items.model";
import LabGridColumnSettings from "../../shared/lab-gridcol-settings";
import { GridEmitModel } from "../../../shared/danphe-grid/grid-emit.model";

@Component({
    selector: "map-government-items-component",
    templateUrl: "map-government-items.html"
})

export class MapGovernmentItemsComponent{
    public showMapGovItemsPage: boolean = false;
    public allgovitems: Array<GovernmentItems> = new Array<GovernmentItems>();
    public selectedLabTest: LabTest = new LabTest();

    public mappedComponents: Array<MappedGovernmentItems> = new Array<MappedGovernmentItems>();
    
    public selectedItem: MappedGovernmentItems = new MappedGovernmentItems();

    public update: boolean = false;
    public index: number = 0;

    public mappedCompGridCol: Array<any> = null;

    constructor(public labSettingBlServ: LabSettingsBLService,
                public changeDetector: ChangeDetectorRef,
                public msgBoxServ: MessageboxService){
                    this.mappedCompGridCol = LabGridColumnSettings.MappedCompList;               
        this.GetAllMappedComponents();
    }

    public AddNewMappedComponent(){
        this.showMapGovItemsPage = false;
        this.selectedItem = new MappedGovernmentItems();
        this.changeDetector.detectChanges();
        this.showMapGovItemsPage = true;
        this.update = false;
    }

    GetAllMappedComponents(){
        this.labSettingBlServ.GetAllMappedComponents()
            .subscribe((res) =>{
                if(res.Status == "OK"){
                    this.mappedComponents = res.Results;
                }else {
                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
                }
            },
            err => {
                this.msgBoxServ.showMessage("error", ["Failed to get ReportTemplate List"]);
            } );
    }

    EditAction(event: GridEmitModel) {
        switch (event.Action) {
            case "edit": {
                this.selectedItem = new MappedGovernmentItems();
                this.index = event.RowIndex;//assign index
                this.showMapGovItemsPage = false;
                this.changeDetector.detectChanges();
                this.selectedItem = Object.assign(this.selectedItem, event.Data);
                this.update = true;
                this.showMapGovItemsPage = true;
            }
            break;
            case "add": {
                this.showMapGovItemsPage = false;
                this.selectedItem = new MappedGovernmentItems();
                this.changeDetector.detectChanges();
                this.selectedItem = Object.assign(this.selectedItem, event.Data);
                this.showMapGovItemsPage = true;
                this.update = false;
            }break;
            default:
                break;
        }
    }

    CallBackData($event){
        if($event.action == "add"){
            this.changeDetector.detectChanges();
            this.GetAllMappedComponents();
            this.showMapGovItemsPage = false;
        }else if($event.action == "edit"){
            this.changeDetector.detectChanges();
            this.GetAllMappedComponents();
            this.showMapGovItemsPage = false;
        }else if($event.close){
            this.showMapGovItemsPage = false;
        }
    }
}