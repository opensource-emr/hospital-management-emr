import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";

import { SecurityService } from '../../../security/shared/security.service';
import { Bed } from '../../../adt/shared/bed.model';
import { BedFeature } from '../../../adt/shared/bedfeature.model';
import { BedFeaturesMap } from '../../../adt/shared/bedfeature-map.model';
import { Ward } from '../../../adt/shared/ward.model';

import { SettingsBLService } from '../../shared/settings.bl.service';
import { MessageboxService } from '../../../shared/messagebox/messagebox.service';
import * as moment from 'moment/moment';
import { CommonFunctions } from "../../../shared/common.functions";
@Component({
    selector: "bed-add",
    templateUrl: "./bed-add.html"

})
export class BedAddComponent {

    public CurrentBed: Bed = new Bed();

    public showAddPage: boolean = false;

    public showRange: boolean = false;

    @Input("selectedItem")
    public selectedItem: Bed;
    @Input("bedList")
    public bedList: Array<Bed>;
    @Output("callback-add")
    callbackAdd: EventEmitter<Object> = new EventEmitter<Object>();
    public bedView: any = {};
    public update: boolean = false;
    public wardCode: string = null;
    public lastBedNumber: number = 0;
    public wardName: string = null;
    public wardList: Array<Ward> = new Array<Ward>();
    public bedFeatureList: Array<BedFeature> = new Array<BedFeature>();

    public CurrentBedList: Array<Bed> = new Array<Bed>();

    public selectedBedFeatureMapList: Array<BedFeaturesMap>;
    public existingBedFeatureMapList: Array<BedFeaturesMap>;
    public existingModifiedBedFeatureMapList: Array<BedFeaturesMap>;

    constructor(
        public settingsBLService: SettingsBLService,
        public securityService: SecurityService,
        public msgBoxServ: MessageboxService,
        public changeDetector: ChangeDetectorRef) {
        this.GetWardList();
    }
    @Input("showAddPage")
    public set value(val: boolean) {
        this.showAddPage = val;
        this.selectedBedFeatureMapList = new Array<BedFeaturesMap>();
        this.existingModifiedBedFeatureMapList = new Array<BedFeaturesMap>();
        this.existingBedFeatureMapList = new Array<BedFeaturesMap>();
        this.GetBedFeatureList();
        if (this.selectedItem) {
            this.SetWardCode();
            this.GetLastBedNumber(this.selectedItem.WardId);
            this.update = true;
            this.CurrentBed = Object.assign(this.CurrentBed, this.selectedItem);
            this.CurrentBed.ModifiedBy = this.securityService.GetLoggedInUser().EmployeeId;
        }
        else {
            this.CurrentBed = new Bed();
            this.CurrentBed.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
            this.update = false;
        }
    }


    public GetWardList() {
        this.settingsBLService.GetWardList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                      this.wardList = res.Results;
                      CommonFunctions.SortArrayOfObjects(this.wardList, "WardName");//this sorts the wardlist by WardName.
                    }
                    else {
                        this.showMessageBox("Failed", "Check log for error message.");
                        this.logError(res.ErrorMessage);
                    }
                }
            },
            err => {
                this.showMessageBox("Failed to get wards", "Check log for error message.");
                this.logError(err.ErrorMessage);
            });
    }
    public SetWardCode() {
        if (this.CurrentBed.WardId) {
            var selectedWard = this.wardList.find(a => a.WardId == this.CurrentBed.WardId);
            this.wardCode = selectedWard.WardCode;
            this.wardName = selectedWard.WardName;
            this.GetLastBedNumber(this.CurrentBed.WardId);
        }
    }
    public GetLastBedNumber(wardId) {
        var filteredList = this.bedList.filter(a => a.WardId == wardId);
        if (filteredList.length) {
            var lastBed = filteredList.reduce(function (l, e) {
                return e.BedNumber > l.BedNumber ? e : l;
            });
            this.lastBedNumber = lastBed.BedNumber;
        }
    }
    public GetSelectedBedFeatureMapList() {
        this.settingsBLService.GetSelectedBedFeatureMapList(this.selectedItem.BedId)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.existingBedFeatureMapList = res.Results;
                        this.SelectExistingFromList();
                    }
                }
            },
            err => {
                this.showMessageBox("Failed to get wards", "Check log for error message.");
                this.logError(err.ErrorMessage);
            });
    }

    public GetBedFeatureList() {
        this.settingsBLService.GetBedFeatureList()
            .subscribe(res => {
                if (res.Status == 'OK') {
                    if (res.Results.length) {
                        this.bedFeatureList = res.Results;
                        if (this.selectedItem)
                            this.GetSelectedBedFeatureMapList();
                    }
                    else {
                        this.showMessageBox("Failed", "Check log for error message.");
                        this.logError(res.ErrorMessage);
                    }
                }
            },
            err => {
                this.showMessageBox("Failed to get wards", "Check log for error message.");
                this.logError(err.ErrorMessage);
            });
    }


    Add() {
        this.CurrentBed.BedCode = this.wardCode;
        
        for (var i in this.CurrentBed.BedMainValidator.controls) {
            this.CurrentBed.BedMainValidator.controls[i].markAsDirty();
            this.CurrentBed.BedMainValidator.controls[i].updateValueAndValidity();
        }


        if (this.CurrentBed.IsValidCheck(undefined, undefined)) {
            if (this.CurrentBed.BedNumber) {
                if (!this.CheckBedNumber() ) {
                    this.CurrentBed.BedNumFrm = this.CurrentBed.BedNumber;
                    this.CurrentBed.BedNumTo = this.CurrentBed.BedNumber;
                    this.settingsBLService.AddBed(this.CurrentBed)
                        .subscribe(
                            res => {
                                this.showMessageBox("Success", "Bed Added");
                                this.MapWithBedView(res);
                            },
                            err => {
                                this.logError(err);
                            });
                }               
                else {
                    this.showMessageBox("Failed", "Either this Bed Number already exist in the selected Ward");
                }
            }
            else if ((this.CurrentBed.BedNumFrm && this.CurrentBed.BedNumTo && ((this.CurrentBed.BedNumTo - this.CurrentBed.BedNumFrm) > 0) && ((this.CurrentBed.BedNumFrm - this.lastBedNumber) >= 1) )) {
                this.settingsBLService.AddBed(this.CurrentBed)
                    .subscribe(
                        res => {
                            this.showMessageBox("Success", "Multiple Beds Added");
                            this.MapWithBedView(res);
                        },
                        err => {
                            this.logError(err);
                    });

            }
            else {
                this.showMessageBox("Failed","Your Bed Range must start From Last Number Greater than Last Bed Number");
            }
        }
    }

    Update() {
        this.CurrentBed.BedCode = this.wardCode + '-' + this.CurrentBed.BedNumber;
        for (var i in this.CurrentBed.BedMainValidator.controls) {
            this.CurrentBed.BedMainValidator.controls[i].markAsDirty();
            this.CurrentBed.BedMainValidator.controls[i].updateValueAndValidity();
        }
        if (this.CurrentBed.IsValidCheck(undefined, undefined)) {
            if (!this.CheckBedNumber()) {
                this.CurrentBed.BedNumFrm = this.CurrentBed.BedNumber;
                this.CurrentBed.BedNumTo = this.CurrentBed.BedNumber;
                this.settingsBLService.UpdateBed(this.CurrentBed)
                    .subscribe(
                    res => {
                        this.showMessageBox("Success", "Bed Details Updated");
                        this.MapWithBedView(res)
                    },
                    err => {
                        this.logError(err);

                    });
            }
            else {
                this.showMessageBox("failed", "This Bed Number already exist in the selected Ward.");
            }
        }
    }


    MapWithBedView(res) {
        if (res.Status == "OK") {
            this.CurrentBed.BedId = res.Results[0].BedId;
            this.CurrentBed.WardId = res.Results[0].WardId;
            this.bedView.BedId = res.Results[0].BedId;
            this.bedView.WardId = res.Results[0].WardId;
            this.bedView.BedCode = res.Results[0].BedCode;
            this.bedView.BedNumber = res.Results[0].BedNumber;
            this.bedView.IsOccupied = res.Results[0].IsOccupied;
            this.bedView.IsActive = res.Results[0].IsActive;
            this.bedView.CreatedOn = res.Results[0].CreatedOn;
            this.bedView.CreatedBy = res.Results[0].CreatedBy;

            for (let ward of this.wardList) {
                if (ward.WardId == res.Results[0].WardId) {
                    this.bedView.WardName = ward.WardName;
                    break;
                }
            };

      //       this.callbackAdd.emit({ bed: res.Results});
           
                this.selectedBedFeatureMapList.forEach(a => {
                    a.WardId = this.CurrentBed.WardId;
                    a.BedId = this.CurrentBed.BedId;
                    a.Len = res.Results.length;
                });
            
            this.selectedBedFeatureMapList = this.selectedBedFeatureMapList.filter(sel => (!sel.BedFeatureCFGId));
            if (this.selectedBedFeatureMapList.length || this.existingModifiedBedFeatureMapList.length)
                this.SubmitBedFeaturesMap();
            else
                this.EmitBed();

        }
        else {
            this.showMessageBox("Error", "Check log for details");
            console.log(res.ErrorMessage);
        }
    }

    public EmitBed() {
        this.callbackAdd.emit({ bed: this.bedView });
    }


    CheckBedNumber() {
        if (this.CurrentBed.BedId) {
            var index = this.bedList.findIndex(a => a.BedId == this.CurrentBed.BedId);
            this.bedList.splice(index, 1);
        }
        var filteredList = this.bedList.filter(a => a.WardId == this.CurrentBed.WardId)
        if (filteredList) {
            var bed = filteredList.find(a => a.BedNumber == this.CurrentBed.BedNumber);
            if (bed)
                return true;
            else
                return false;
        }
        else
            return false;
    }
    public checkFeatureInExistingList(bedFeatureId): BedFeaturesMap {
        for (let existingItem of this.existingBedFeatureMapList) {
            if (existingItem.BedFeatureId == bedFeatureId) {
                return existingItem;
            }
        }
    }
    public CheckIfACSelected(featureName: string) {
        if (featureName == 'Single Cabin (With A/C)') {
            var feature = this.bedFeatureList.find(a => a.BedFeatureName == 'Single Cabin (Without A/C)');
            var bedFeatureMap = this.checkFeatureInExistingList(feature.BedFeatureId);
            if (bedFeatureMap)
                this.ModifyExistingBedFeature(bedFeatureMap, true)
            else {
                //check if without AC is already selected
                if (!this.selectedBedFeatureMapList.find(a => a.BedFeatureId == feature.BedFeatureId)) {
                    this.selectedBedFeatureMapList.push(this.MapNewBedFeature(feature.BedFeatureId));
                    this.ChangeMainListSelectStatus(feature.BedFeatureId, true);
                }
            }
        }
    }
    public BedFeatureEventHandler(currItem: BedFeature) {
        if (currItem.IsSelected) {
            //add item to selectedItemList or exisitingModifiedList depending on condition
            var bedFeatureMap: BedFeaturesMap = new BedFeaturesMap();
            bedFeatureMap = this.checkFeatureInExistingList(currItem.BedFeatureId);
            if (bedFeatureMap) {
                //add item to exisitingModifiedList
                this.ModifyExistingBedFeature(bedFeatureMap, true);
            }
            else {
                //add item to selectedList
                bedFeatureMap = this.MapNewBedFeature(currItem.BedFeatureId);
            }
            //either modified or newly added item should be displayed on the selected list
            this.selectedBedFeatureMapList.push(bedFeatureMap);
            this.CheckIfACSelected(currItem.BedFeatureName);

        }
        //remove item from selectedList ofr exisitingModifiedList
        else {
            //for existing item add to exisitingModifiedList for update
            for (let map of this.existingBedFeatureMapList) {
                if (map.BedFeatureId == currItem.BedFeatureId)
                    this.ModifyExistingBedFeature(map, false);
            }
            //remove from selectedList
            var index = this.selectedBedFeatureMapList.findIndex(x => x.BedFeatureId == currItem.BedFeatureId);
            this.selectedBedFeatureMapList.splice(index, 1);
            this.ChangeMainListSelectStatus(currItem.BedFeatureId, false);
        }
    }
    MapNewBedFeature(bedFeatureId): BedFeaturesMap {
        var bedFeatureMap = new BedFeaturesMap();
        bedFeatureMap.BedFeatureId = bedFeatureId;
        bedFeatureMap.IsActive = true;
        bedFeatureMap.CreatedBy = this.securityService.GetLoggedInUser().EmployeeId;
        bedFeatureMap.CreatedOn = moment().format('YYYY-MM-DD HH:mm');
        return bedFeatureMap;
    }
    //change the IsActive Status of already exisiting item based on condition
    ModifyExistingBedFeature(bedFeaturesMap: BedFeaturesMap, activeStatus: boolean) {
        bedFeaturesMap.ModifiedBy = this.securityService.GetLoggedInUser().UserId;
        bedFeaturesMap.ModifiedOn = moment().format('YYYY-MM-DD HH:mm');
        bedFeaturesMap.IsActive = activeStatus;
        //bedFeaturesMap.IsSelected = activeStatus;
        var index = this.existingModifiedBedFeatureMapList.findIndex(x => x.BedFeatureId == bedFeaturesMap.BedFeatureId);
        if (index >= 0)
            this.existingModifiedBedFeatureMapList.splice(index, 1);
        else
            this.existingModifiedBedFeatureMapList.push(bedFeaturesMap);
        this.ChangeMainListSelectStatus(bedFeaturesMap.BedFeatureId, activeStatus);

    }
    //for initially selecting the items in main list existing item from the existingItemList
    SelectExistingFromList() {
        this.existingBedFeatureMapList.forEach(ex => {
            if (ex.IsActive) {
                //ex.IsSelected = ex.IsActive;
                this.selectedBedFeatureMapList.push(ex);
                this.ChangeMainListSelectStatus(ex.BedFeatureId, true)
            }
        });
    }
    ChangeMainListSelectStatus(featureId: number, val: boolean) {
        for (let bedFeature of this.bedFeatureList) {
            if (bedFeature.BedFeatureId == featureId) {
                bedFeature.IsSelected = val;
                break;
            }

        }
    }




    SubmitBedFeaturesMap() {
        if (this.selectedBedFeatureMapList.length || this.existingBedFeatureMapList.length) {
            if (this.selectedBedFeatureMapList.length) {
                this.selectedBedFeatureMapList.forEach(a => {
                    a.WardId = this.CurrentBed.WardId;
                    a.BedId = this.CurrentBed.BedId;
                });
                this.settingsBLService.AddBedFeaturesMap(this.selectedBedFeatureMapList)
                    .subscribe(res => {
                        if (res.Status == 'OK') {
                            if (this.existingModifiedBedFeatureMapList.length) {
                                this.UpdateBedFeaturesMap();
                                this.msgBoxServ.showMessage("success", ["Added and Updated Features"]);
                            }
                            else {
                                this.EmitBed();
                                this.msgBoxServ.showMessage("success", ["Added Features"]);
                            }
                        }
                        else {
                            this.msgBoxServ.showMessage("error", ["Failed to Add New Features.Check log for error message."]);
                            this.logError(res.ErrorMessage);
                        }
                    });
            }
            else if (this.existingModifiedBedFeatureMapList.length) {
                this.UpdateBedFeaturesMap();
                this.msgBoxServ.showMessage("success", ["Updated Features"]);
            }
        }

    }
    UpdateBedFeaturesMap() {
        this.existingModifiedBedFeatureMapList.forEach(a => {
            a.WardId = this.CurrentBed.WardId;
            a.BedId = this.CurrentBed.BedId;
        });
        this.settingsBLService.UpdateBedFeaturesMap(this.existingModifiedBedFeatureMapList)
            .subscribe(res => {
                if (res.Status == 'OK') {
                    this.EmitBed();
                }
                else {
                    this.msgBoxServ.showMessage("error", ["Failed to Update Existing Features.Check log for error message."]);
                    this.logError(res.ErrorMessage);
                }
            });
    }
    logError(err: any) {
        console.log(err);
    }
    Close() {
        this.selectedItem = null;
        this.update = false;
        this.showAddPage = false;
    }
    showMessageBox(status: string, message: string) {
        this.msgBoxServ.showMessage(status, [message]);
    }

    changeRange(state: string) {
        if (state == "single") {
            this.showRange = false;
            this.CurrentBed.BedNumber = 0;
        } else {
            this.showRange = true;
            this.CurrentBed.BedNumTo = null;
            this.CurrentBed.BedNumFrm = null;
        }
    }

}
