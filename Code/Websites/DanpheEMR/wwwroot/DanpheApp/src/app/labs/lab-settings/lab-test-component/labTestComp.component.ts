import { Component, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import LabGridColumnSettings from '../../shared/lab-gridcol-settings';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { SettingsBLService } from '../../../settings-new/shared/settings.bl.service';
import { DanpheHTTPResponse } from '../../../shared/common-models';
import { GridEmitModel } from '../../../../../src/app/shared/danphe-grid/grid-emit.model';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';

@Component({
    templateUrl: './labtestComp-component.html'
})

export class LabTestCompComponent{
    public labTestComponentList: Array<LabComponentModel> = new Array<LabComponentModel>();
    public labTestComponentGridCol: Array<any> = null;

    public selectedLabTestComponent: LabComponentModel = new LabComponentModel();

    public showAddLabComponent: boolean = false;

    public update: boolean = false;

    public LookUpNames: Array<CoreCFGLookUp> = new Array<CoreCFGLookUp>(); 

    constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef, public settingsBLService: SettingsBLService) {
        this.labTestComponentGridCol = LabGridColumnSettings.LabComponentList;
        this.GetAllLabTestComponents();
        this.GetAllLookUpNames();
    }

    ngOnInit() {       

    }

    GetAllLookUpNames(){        
        this.labSettingBlServ.GetAllLabLookUpNames()
        .subscribe(res => {
            if(res.Status == "OK"){
                this.LookUpNames = res.Results;
            } else {
                this.msgBoxServ.showMessage("failed", ["Cannot Get the LookUp Name list for Lab Test Components"]);
            }
        });

    }

    public GetAllLabTestComponents(){
        this.labSettingBlServ.GetAllLabTestComponents()
        .subscribe((res: DanpheHTTPResponse) => {
            if(res.Status == "OK"){
                this.labTestComponentList = res.Results;
            } else {
                this.msgBoxServ.showMessage("failed", ["Cannot Get the List of Lab Test Components"]);
            }
        });
    }

    public EditComponent(event: GridEmitModel){
        switch(event.Action){
            case "edit": {
                if(this.LookUpNames && this.LookUpNames.length){
                    this.selectedLabTestComponent = new LabComponentModel();
                    this.selectedLabTestComponent = Object.assign(this.selectedLabTestComponent, event.Data);
                    if(this.selectedLabTestComponent.ValueType == 'number'){
                        this.selectedLabTestComponent.GetRangeValue(this.selectedLabTestComponent,'Range');
                        this.selectedLabTestComponent.GetRangeValue(this.selectedLabTestComponent,'MaleRange');
                        this.selectedLabTestComponent.GetRangeValue(this.selectedLabTestComponent,'FemaleRange');
                        this.selectedLabTestComponent.GetRangeValue(this.selectedLabTestComponent,'ChildRange');
                    }

                    if(this.selectedLabTestComponent.ValueLookup && this.selectedLabTestComponent.ValueLookup.trim() != ''){
                        var valueLookUpObj = this.LookUpNames.find(val => val.LookUpName == this.selectedLabTestComponent.ValueLookup);
                        if(valueLookUpObj){
                            this.selectedLabTestComponent.LookUp = valueLookUpObj;
                        }
                    }

                    console.log(this.selectedLabTestComponent);
                    this.showAddLabComponent = false;
                    this.changeDetector.detectChanges();
                    this.showAddLabComponent = true;                
                    this.update = true;
                } else {
                    this.msgBoxServ.showMessage("notification", ["Please try after some seconds, after LookUpName list is rendered"]);
                }
                
            }

            default: 
                break;            
        }
    }

    public AddNewLabTestComponent(){
        if(this.LookUpNames && this.LookUpNames.length){
            this.selectedLabTestComponent = new LabComponentModel();       
            this.showAddLabComponent = false;
            this.changeDetector.detectChanges();
            this.showAddLabComponent = true;
            this.update = false;
        } else {
            this.msgBoxServ.showMessage("notification", ["Please try after some seconds, after LookUpName list is rendered"]);
        }
        
    }

    public GetAddedAndUpdatedData($event){
      if ($event.success) {
        this.GetAllLabTestComponents();
        this.showAddLabComponent = true;
        this.changeDetector.detectChanges();
        this.showAddLabComponent = false;
        this.update = false;
      } else {
        this.Close();
      }   
    }

    Close() {
        this.selectedLabTestComponent = new LabComponentModel();
        this.showAddLabComponent = false;
    }
}
