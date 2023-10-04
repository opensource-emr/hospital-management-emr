import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { LabComponentModel } from '../../shared/lab-component-json.model';
import * as _ from 'lodash';
import { LabSettingsBLService } from '../shared/lab-settings.bl.service';
import { MessageboxService } from '../../../../../src/app/shared/messagebox/messagebox.service';
import { DanpheHTTPResponse } from '../../../../../src/app/shared/common-models';
import { CoreCFGLookUp } from '../shared/coreCFGLookUp.model';

@Component({
    selector: 'add-labTestComponent',
    templateUrl: './add-lab-test-component.html'
})

export class AddLabTestCompComponent {
    @Input() labTestComponent: LabComponentModel = new LabComponentModel();
    @Input()  allLabTestcomponentList: Array<LabComponentModel> = new Array<LabComponentModel>();

    public update: boolean = false;

    public lbtstcomponentList: Array<LabComponentModel> = new Array<LabComponentModel>();

    public ValueTypeArray = [{ Name: "text", Value: "string", IsSelected: true },
    { Name: "number", Value: "number", IsSelected: false }];
    public ControlTypeArray = [{ Name: "SearchBox", Value: "SearchBox", IsSelected: false },
    { Name: "TextBox", Value: "TextBox", IsSelected: true },
    { Name: "Label", Value: "Label", IsSelected: false }];

    public index: number = 1;

    public loading: boolean = false;

    public initialLoad: boolean = true;

    @Input() lookUpNames: Array<CoreCFGLookUp> = new Array<CoreCFGLookUp>(); 

    @Output("callback-Add") sendDataBack: EventEmitter<object> = new EventEmitter<object>();


    
    constructor(public labSettingBlServ: LabSettingsBLService, public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        //this.lbtstcomponentList.push(new LabComponentJsonModel());
            
    }

   

    ngOnInit() {
        if (this.labTestComponent && this.labTestComponent.ComponentId) {
           this.update = true;
           this.lbtstcomponentList.push(this.labTestComponent);
           
        } else {
            this.update = false;
            this.labTestComponent = new LabComponentModel();
            this.labTestComponent.ValueType = this.ValueTypeArray.find(v => v.IsSelected).Value;
            this.labTestComponent.ControlType = this.ControlTypeArray.find(v => v.IsSelected).Value;
            this.lbtstcomponentList.push(this.labTestComponent);
            this.initialLoad = false;
        }
    }


    DDLValChange(num: number) {
            this.lbtstcomponentList[num].Range = null;
            this.lbtstcomponentList[num].MinValue = null;
            this.lbtstcomponentList[num].MaxValue = null;
            this.lbtstcomponentList[num].RangeDescription = null;
    }

    DDLControlChange() {

    }

    DeleteRow(ind) {
        this.lbtstcomponentList.splice(ind, 1);
    }

    AddRowRequest() {
        let newCompJson = new LabComponentModel();
        //assign default valuetype to the newly added component
        newCompJson.ValueType = this.ValueTypeArray.find(v => v.IsSelected).Value;
        newCompJson.ControlType = this.ControlTypeArray.find(v => v.IsSelected).Value;
        this.lbtstcomponentList.push(newCompJson);
    }

    lookUpListFormatter(data: any): string {
        let html = data["LookUpName"];
        return html;
    }

    LookUpSelected(indx: number){
        if(indx || indx == 0){
            if(this.lbtstcomponentList[indx].LookUp && this.lbtstcomponentList[indx].LookUp.LookUpId){
                this.lbtstcomponentList[indx].ValueLookup = this.lbtstcomponentList[indx].LookUp.LookUpName;
            } else {
                this.lbtstcomponentList[indx].ValueLookup = null; 
            }
        }
    }

    ShowValueChangedData(indx: number){
        if((indx || indx == 0) && (!this.initialLoad)){            
            alert('This LookUp contains ' + this.lbtstcomponentList[indx].LookUp.LookupDataJson + '.');
            this.initialLoad = false;
        } else {
            this.initialLoad = false;
        }
    }

    public CheckIfDataIsValid(){
        let retMsgObj = { IsValid: true, ErrMsg: [] };
        this.lbtstcomponentList.forEach(lbt => {

            if(lbt.ControlType=='Label'){
                lbt.ValueLookup = null;
            } else {
                if(lbt.ValueLookup && lbt.ValueLookup.trim() != ''){
                    var lookup = this.lookUpNames.find(val => val.LookUpName == lbt.ValueLookup);
                    if(!lookup){
                        retMsgObj.IsValid = false;
                        retMsgObj.ErrMsg.push('Please Enter LookUp Name for ' + lbt.ComponentName + ' from List.');
                    }
                } else {
                    lbt.ValueLookup = null;
                }
            }

           
            

            if (lbt.MaxValue) {
                lbt.MaxValue = Number(lbt.MaxValue);
            }

            if (lbt.MinValue) {
                lbt.MinValue = Number(lbt.MinValue);
            }

            if (lbt.MaleMaxValue) {
                lbt.MaleMaxValue = Number(lbt.MaleMaxValue);
            }

            if (lbt.MaleMinValue) {
                lbt.MaleMinValue = Number(lbt.MaleMinValue);
            }

            if (lbt.FemaleMaxValue) {
                lbt.FemaleMaxValue = Number(lbt.FemaleMaxValue);
            }

            if (lbt.FemaleMinValue) {
                lbt.FemaleMinValue = Number(lbt.FemaleMinValue);
            }

            if (lbt.ChildMaxValue) {
                lbt.ChildMaxValue = Number(lbt.ChildMaxValue);
            }

            if (lbt.ChildMinValue) {
                lbt.ChildMinValue = Number(lbt.ChildMinValue);
            }




            if (lbt.ValueType == 'number') {

                if (lbt.MaxValue == null && lbt.MinValue == null) {
                    lbt.Range = null;
                    //retMsgObj.IsValid = false;
                    //retMsgObj.ErrMsg.push('Please Enter Min and Max Values');
                } else {
                    lbt.SetRangeValue(lbt,'Range');
                    if (lbt.MaxValue != null && lbt.MinValue != null && (lbt.MaxValue < lbt.MinValue)) {
                        retMsgObj.IsValid = false;
                        retMsgObj.ErrMsg.push('Maximum Value should be greater than Minimum Value');
                    }
                }

                if (lbt.MaleMaxValue == null && lbt.MaleMinValue == null) {
                    lbt.MaleRange = null;
                } else {
                    lbt.SetRangeValue(lbt,'MaleRange');
                    if (lbt.MaleMaxValue != null && lbt.MaleMinValue != null && (lbt.MaleMaxValue < lbt.MaleMinValue)) {
                        retMsgObj.IsValid = false;
                        retMsgObj.ErrMsg.push('Male Maximum Value should be greater than Minimum Value');
                    }
                }

                if (lbt.FemaleMaxValue == null && lbt.FemaleMinValue == null) {
                    lbt.FemaleRange = null;
                } else {
                    lbt.SetRangeValue(lbt,'FemaleRange');
                    if (lbt.FemaleMaxValue != null && lbt.FemaleMinValue != null && (lbt.FemaleMaxValue < lbt.FemaleMinValue)) {
                        retMsgObj.IsValid = false;
                        retMsgObj.ErrMsg.push('Female Maximum Value should be greater than Minimum Value');
                    }
                }

                if (lbt.ChildMaxValue == null && lbt.ChildMinValue == null) {
                    lbt.ChildRange = null;
                } else {
                    lbt.SetRangeValue(lbt,'ChildRange');
                    if (lbt.ChildMaxValue != null && lbt.ChildMinValue != null && (lbt.ChildMaxValue < lbt.ChildMinValue)) {
                        retMsgObj.IsValid = false;
                        retMsgObj.ErrMsg.push('Child Maximum Value should be greater than Minimum Value');
                    }
                }  

                //If male range is empty
                if((!lbt.MaleRange || !(/\S/.test(lbt.MaleRange))) ){
                    lbt.MaleRange = lbt.Range;
                    //if female range if empty
                    if((!lbt.FemaleRange || !(/\S/.test(lbt.FemaleRange))) ){
                        lbt.FemaleRange = lbt.Range;
                    }
                }  
                //If male range is NOT empty               
                else 
                {
                    //if female range if empty
                    if((!lbt.FemaleRange || !(/\S/.test(lbt.FemaleRange))) ){
                        lbt.FemaleRange = lbt.Range;
                    }
                }

                if ((!lbt.RangeDescription || !(/\S/.test(lbt.RangeDescription))) && retMsgObj.IsValid) {
                    lbt.RangeDescription = lbt.Range;
                }

                
            }


            for (var i in lbt.LabComponentJsonValidator.controls) {
                lbt.LabComponentJsonValidator.controls[i].markAsDirty();
                lbt.LabComponentJsonValidator.controls[i].updateValueAndValidity();
            }
        });


        for (var i = 0; i < this.lbtstcomponentList.length; i++) {
            let lbt = this.lbtstcomponentList[i];
            if (!lbt.IsValidCheck(undefined, undefined)) {
                retMsgObj.IsValid = false;
                retMsgObj.ErrMsg.push('Please Enter the Component Name');
            }

            if ((!lbt.DisplayName || !(/\S/.test(lbt.DisplayName))) && retMsgObj.IsValid) {
                lbt.DisplayName = lbt.ComponentName;
            }

            var filteredComponent = this.allLabTestcomponentList.filter(val => {
                if(val.ComponentName == lbt.ComponentName && val.DisplayName == lbt.DisplayName){
                    return true;
                } else {return false;}               
            });

            var dupItemCount = 0;
            
            if(this.update){
                dupItemCount = 1;
            } 

            if(filteredComponent && filteredComponent.length>dupItemCount){
                retMsgObj.IsValid = false;
                retMsgObj.ErrMsg.push(lbt.ComponentName + ' with same Component Name and Display name found !');
            }

        }   

        return retMsgObj;

    }

    public AddNewComponents(){
        let validationMsg = this.CheckIfDataIsValid();
        if (this.loading) {
            if (validationMsg.IsValid) {
                this.labSettingBlServ.PostLabTestComponent(this.lbtstcomponentList)
                .subscribe((res: DanpheHTTPResponse) => {
                    if(res.Status == "OK"){
                        this.sendDataBack.emit({components: res.Results, success: true});
                        this.msgBoxServ.showMessage("success", ["Labtest component posted successfully!"]);
                    } else {
                        this.msgBoxServ.showMessage("Failed", ["Cannot Post the Labtest component!"]);
                    }
                });                
            }
            else {
                this.msgBoxServ.showMessage("error", validationMsg.ErrMsg);
                this.loading = false;
            }
        }
       
        
        
    }

    public UpdateComponent(){
        let validationMsg = this.CheckIfDataIsValid();
        if (this.loading) {
            if (validationMsg.IsValid) {     
                this.labSettingBlServ.UpdateLabTestComponent(this.lbtstcomponentList)
                .subscribe((res: DanpheHTTPResponse) => {
                    if(res.Status == "OK"){
                        this.sendDataBack.emit({components: this.lbtstcomponentList, success: true});
                        this.msgBoxServ.showMessage("success", [this.lbtstcomponentList[0].ComponentName + "Labtest component Updated successfully!"]);
                    } else {
                        this.msgBoxServ.showMessage("Failed", ["Cannot Update " + this.lbtstcomponentList[0].ComponentName +  "component!"]);
                    }                  
                }); 
            }
            else {
                this.msgBoxServ.showMessage("error", validationMsg.ErrMsg);
                this.loading = false;
            }
        }
  }

  public Cancel() {
    this.sendDataBack.emit({ components: null, success: false });
  }

}
