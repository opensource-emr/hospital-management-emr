import {
    ChangeDetectorRef,
    Component
} from '@angular/core';
import { CoreService } from '../../../core/shared/core.service';
import { SecurityService } from '../../../security/shared/security.service';
import LabLISGridColumnSettings from '../shared/lis-grid-col.settings';
import { LabLISBLService } from '../shared/lis.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import { LabTestComponent } from '../../shared/lab-component.model';
import { CommonFunctions } from '../../../shared/common.functions';

@Component({
    templateUrl: "./lis-machine-result.html",
    styles: ['.res-table tbody tr td{font-size: 11px; font-weight: normal;} .res-table thead tr th{font-size: 11px;} .res-table{background: #fff;}']
})

export class LISMachineResultComponent {
    public selectedMachineId: number = 0;
    public allMachines: Array<any> = [];
    public allResults: Array<any> = [];
    public selectedAll: boolean = false;
    public anySelected: boolean;
    public componentsToPost: Array<LabTestComponent> = new Array<LabTestComponent>();


    constructor(public coreService: CoreService, public securityService: SecurityService, public labLISBlService: LabLISBLService,
        public changeDetector: ChangeDetectorRef, public messageService: MessageboxService) {
        this.GetAllMachineMaster();
    }

    GetAllMachineMaster() {
        this.coreService.loading = true;
        this.labLISBlService.GetAllMachinesMaster().subscribe(res => {
            if (res.Status == "OK") {
                this.allMachines = res.Results;
                if (this.allMachines && this.allMachines.length == 1) {
                    this.selectedMachineId = this.allMachines[0].MachineId;
                }
                this.coreService.loading = false;
            }
        }, (err) => {
            console.log(err.error.ErrorMessage); this.coreService.loading = false; this.messageService.showMessage('error', ['Could not get Machine List Now. Please try again later.']);
        });
    }

    LoadMachineData() {
        this.coreService.loading = true;
        this.labLISBlService.GetAllMachineResult(this.selectedMachineId).subscribe(res => {
            if (res.Status == "OK") {
                this.allResults = res.Results;
                this.CheckComponentValueIsValidAndNormal();
                this.coreService.loading = false;
            }
        }, (err) => { this.coreService.loading = false; console.log(err.error.ErrorMessage); this.messageService.showMessage('error', ['Could not get Machine Data Now. Please try again later.']); });
    }


    SelectComps(ind: number) {
        if (ind) {
            this.allResults = this.allResults.map(p => { p.Data.forEach(d => d.IsSelected = (this.selectedAll && d.IsValueValid)); return p; });
            this.anySelected = this.selectedAll;
        } else {
            let anyFalse = false;
            let anyTrue = false;
            this.allResults.forEach(p => {
                if (p.Data.some(d => d.IsSelected == false)) {
                    anyFalse = true;
                }
                if (p.Data.some(d => d.IsSelected == true)) {
                    anyTrue = true;
                }
            });
            this.anySelected = anyTrue;
            this.selectedAll = !anyFalse;
        }
    }

    SaveMachineDataToDanphe() {
        this.coreService.loading = true;
        let dataToPost = this.allResults.reduce(function (acc, currVal) {
            currVal.Data.forEach(elm => {
                if (elm.IsSelected) {
                    acc.push(elm);
                }
            });
            return acc;
        }, []);


        this.labLISBlService.AddLisDataToResult(dataToPost).subscribe(res => {
            if (res.Status == "OK") {
                this.coreService.loading = false;
                this.LoadMachineData();
            }
        }, (err) => {
            this.coreService.loading = false; console.log(err.error.ErrorMessage); this.messageService.showMessage('error', ['Could not save the Machine Result Now. Please try again later.']);
        });

    }


    CheckComponentValueIsValidAndNormal() {
        this.allResults.forEach(dt => {
            dt.Data.forEach(singleData => {
                if (singleData.Value == null || singleData.Value == "" || singleData.Value.trim() == "") {
                    singleData.IsValueValid = false;
                    singleData.IsAbnormal = false;
                } else {
                    ///for ValueType other than "number" -- non-empty values are normal
                    if (singleData.Component.ValueType != "number") {
                        singleData.IsValueValid = true;
                    } else {
                        //assinging the value to a variable to maintain "," or "02" in the display value even if the value is parsed as Number()
                        let value = Number(singleData.Value.replace(/,/g, ""));
                        //check if the value is number or not.
                        if (isNaN(value)) { singleData.IsValueValid = false; }
                        ///if the value is number then then it is Valid
                        else { singleData.IsValueValid = true; singleData.Value = ((value) * (singleData.ConversionFactor)).toString() }
                    }
                }

                let valueType: string = singleData.Component.ValueType;
                if (valueType && valueType == "string") {
                    valueType = "number";
                }
                var dob = singleData.DateOfBirth;
                var patGender = singleData.Gender;
                var patAge = CommonFunctions.GetFormattedAge(dob);
                patAge = patAge.toUpperCase();

                let comp = singleData.Component;


                if (patAge.includes("Y")) {
                    var ageArr = patAge.split("Y");
                    var actualAge = Number(ageArr[0]);
                    //Patient is not child
                    if (actualAge > 16) {
                        //Use validation according to Gender
                        if (
                            patGender.toLowerCase() == "male" &&
                            comp.MaleRange &&
                            comp.MaleRange.trim() != "" &&
                            comp.MaleRange.length
                        ) {
                            comp.Range = comp.MaleRange;
                        } else if (
                            patGender.toLowerCase() == "female" &&
                            comp.FemaleRange &&
                            comp.FemaleRange.trim() != "" &&
                            comp.FemaleRange.length
                        ) {
                            comp.Range = comp.FemaleRange;
                        } else {
                        }
                    }
                    //Patient is Child
                    else {
                        //If Child validation is present
                        if (
                            comp.ChildRange &&
                            comp.ChildRange.trim() != "" &&
                            comp.ChildRange.length
                        ) {
                            comp.Range = comp.ChildRange;
                        } else {
                            if (
                                patGender.toLowerCase() == "male" &&
                                comp.MaleRange &&
                                comp.MaleRange.trim() != "" &&
                                comp.MaleRange.length
                            ) {
                                comp.Range = comp.MaleRange;
                            } else if (
                                patGender.toLowerCase() == "female" &&
                                comp.FemaleRange &&
                                comp.FemaleRange.trim() != "" &&
                                comp.FemaleRange.length
                            ) {
                                comp.Range = comp.FemaleRange;
                            } else {
                            }
                        }
                    }
                }
                //this means there is either M or D, i.e. Patient is Child so use child Validation if available
                else {
                    comp.Range = comp.ChildRange;
                }

                if (singleData.IsValueValid) {
                    singleData.IsAbnormal = false;
                    singleData.AbnormalType = "normal";
                    //comp.Range && comp.ValueType  => True only if these fields are present & has some value.
                    //check abnormal only for valuetype=number, for string we cannot detect which value is abnormal.--sud:11Apr'18
                    if (comp.Range && valueType && valueType == "number") {
                        let value = Number(singleData.Value.replace(/,/g, ""));
                        if (comp.Range.includes("-")) {
                            comp.Range = comp.Range.replace(/,/g, "");
                            let range = comp.Range.split("-");
                            if (value < Number(range[0]) || value > Number(range[1])) {
                                //comp.IsAbnormal = false;
                                //this.changeDetector.detectChanges();
                                if (value < Number(range[0])) {
                                    singleData.AbnormalType = "low";
                                } else {
                                    singleData.AbnormalType = "high";
                                }
                                singleData.IsAbnormal = true;
                            }
                        } else if (comp.Range.includes("<")) {
                            let range = comp.Range.split("<");
                            if (value >= Number(range[1])) {
                                //comp.IsAbnormal = false;
                                //this.changeDetector.detectChanges();
                                singleData.AbnormalType = "high";
                                singleData.IsAbnormal = true;
                            }
                        } else if (comp.Range.includes(">")) {
                            let range = comp.Range.split(">");
                            if (value <= Number(range[1])) {
                                //comp.IsAbnormal = false;
                                //this.changeDetector.detectChanges();
                                singleData.AbnormalType = "low";
                                singleData.IsAbnormal = true;
                            }
                        }
                    }
                }
            });
        });

    }


}
