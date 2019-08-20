import { Component, Input, Output, EventEmitter } from '@angular/core'
import { RouterOutlet, RouterModule, Router } from '@angular/router';

import { OrderService } from '../../orders/shared/order.service';
import { ImagingBLService } from '../shared/imaging.bl.service';
import { MessageboxService } from '../../shared/messagebox/messagebox.service';
import { SecurityService } from '../../security/shared/security.service';

import { ImagingItemRequisition } from '../shared/imaging-item-requisition.model';
import { ImagingItem } from '../shared/imaging-item.model';
import { ImagingType } from '../shared/imaging-type.model';
@Component({
    selector: 'imgitem-select',
    template:'' // "../../view/radiology-view/ImagingRequisition.html" // "/RadiologyView/ImagingRequisition"
})
export class ImagingRequisitionComponent {

    //public searchText: string = null;
    ////this imagingItem is used for search button(means auto complete button)...
    //public imagingItem: any;
    //public imagingTypes: Array<ImagingType> = new Array<ImagingType>();
    ////this is  for storing the imagingItem coming as preference
    //public imagingItemPreference: Array<ImagingItem> = new Array<ImagingItem>();
    //imagingItemServerPath: string = "/api/Radiology?reqType=allImagingItem&inputValue=:keywords";
  
    //public selectAllPreference: boolean = false;
    ////this is used to show the preference of the employee..



    //constructor(public ordServ: OrderService,
    //    public router: Router,
    //    public imagingBLService: ImagingBLService,
    //    public msgBoxServ: MessageboxService,
    //    public securityService: SecurityService) {
    //    this.LoadEmpPreference();
    //    this.LoadImagingTypes();
    //}


    ////this fuction is used to add the item from search box to the imagingItems array ..by calling the SelectTest function..
    //SelectTestFromSearchBox(imagingItem: ImagingItem) {
    //    if (typeof imagingItem === "object" && !Array.isArray(imagingItem) && imagingItem !== null) {
    //        for (var i = 0; i < this.ordServ.imagingItems.length; i++) {
    //            if (this.ordServ.imagingItems[i].ImagingItemId == imagingItem.ImagingItemId) {
    //                var check = true;
    //            }
    //        }
    //        // if the item is not present in the imagingItems array ...then add it
    //        if (check != true) {
    //            imagingItem.IsSelected = true;
    //            // this is used to make the checkbox true from the list of item item
    //            for (var i = 0; i < this.imagingTypes.length; i++)
    //                for (var j = 0; j < this.imagingTypes[i].ImagingItems.length; j++)
    //                    var ImagingItem = this.imagingTypes[i].ImagingItems[j]
    //            if (imagingItem.ImagingItemId == ImagingItem.ImagingItemId) {
    //                ImagingItem.IsSelected = true;

    //            }
    //            this.ordServ.ImagingEventHandler(imagingItem);
    //        }
    //        else {
    //            this.msgBoxServ.showMessage("failed", ["This item is already added"]);
    //        }


    //    }
    //}
    ////this is use to select according to the LabTestGroup 
    ////in this all the item under the selected grp will be selected 
    ////and if the sleceted is unselected then its is removed from the oerder service using splice

    ////load the item item  
    //LoadImagingTypes(): void {
    //    //go to server only if this category is not loaded already..
    //    if (this.imagingTypes == null || this.imagingTypes.length == 0) {
    //        this.imagingBLService.GetImagingType()
    //            .subscribe(res => {
    //                if (res.Status == 'OK') {
    //                    this.imagingTypes = res.Results;
    //                    this.ordServ.imagingTypes = this.imagingTypes;
    //                    //IMPORTANT !! load selected item only after all tests are loaded.
    //                    this.LoadSelectedTests();

    //                } else {
    //                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //                }
    //            },
    //            err => {
    //                this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    //            });

    //    }


    //}

    ////this is used to show the selected item which are present in the labOrder service.
    ////loop through all tests and check those which are present in imagingItems(which has data from laborderservice).
    ////this is used when some laborder is selected and the user move to other tab ..
    ////and after sometime user comesback to labselect item then the selected order will be selected by usig the laborder service
    ////IMPORTANT !! this should be called only after all tests are loaded.
    //LoadSelectedTests(): void {
    //    if (this.ordServ.imagingItems.length != 0) {
    //        // this for loop is for the imagingItems because it has array of imagingItem
    //        for (var l = 0; l < this.ordServ.imagingItems.length; l++) {
    //            //this 3 for loop is for imagingTypes 
    //            for (var i = 0; i < this.imagingTypes.length; i++) {
    //                //then imagingTypes has ImagingItems
    //                for (var j = 0; j < this.imagingTypes[i].ImagingItems.length; j++) {
    //                    //then ImagingItems has LabTests
    //                    var ImagingItem = this.imagingTypes[i].ImagingItems[j];

    //                    if (this.ordServ.imagingItems[l].ImagingItemId == ImagingItem.ImagingItemId) {
    //                        ImagingItem.IsSelected = true;
    //                        //when we change the tab ...the imagingTypes reloads so 
    //                        //the reference of imagingTypes changes and 
    //                        //the connection of orderservice with imagingTypes.labgroup.imagingItems breaks
    //                        //so we are reassigning the value to the orderservice
    //                        this.ordServ.imagingItems[l] = ImagingItem;



    //                    }
    //                    //this is for preference.......
    //                    if (this.imagingItemPreference) {
    //                        for (var m = 0; m < this.imagingItemPreference.length; m++) {
    //                            if (this.ordServ.imagingItems[l].ImagingItemId == this.imagingItemPreference[m].ImagingItemId) {
    //                                this.imagingItemPreference[m].IsSelected = true;
    //                                this.imagingItemPreference[m].IsPreference = true;
    //                                //when we change the tab ...the imagingItem reloads so 
    //                                //the reference of imagingItem changes and
    //                                //the connection of orderservice with imagingItem
    //                                //so we are reassigning the value to the orderservice
    //                                this.ordServ.imagingItems[l] = this.imagingItemPreference[m];
    //                            }

    //                        }
    //                    }
    //                }
    //            }
    //        }
    //    }
    //}

    ////used to format display item in ng-autocomplete
    //myListFormatter(data: any): string {

    //    let html = data["ImagingItemName"];
    //    return html;
    //}


    ////load the prefernce at the start
    //LoadEmpPreference(): void {
    //    if (!this.ordServ.imagingItemPreference || this.ordServ.imagingItemPreference.length == 0) {

    //        var employeeId = this.securityService.GetLoggedInUser().EmployeeId;
    //        this.imagingBLService.GetEmpPreference(employeeId)
    //            .subscribe(res => {
    //                if (res.Status == 'OK') {
    //                    if (res.Results && res.Results.length) {
    //                        this.imagingItemPreference = res.Results;
    //                        //this is to give all the prference item to the order service..

    //                        this.ordServ.imagingItemPreference = this.imagingItemPreference;
    //                        //IMPORTANT !! load selected item only after all tests are loaded.
    //                        this.LoadSelectedTests();
    //                    }
    //                    else {

    //                        //this is if there is no preference then all the imagingItem will be loaded....S
    //                        this.ordServ.showAllImagingItems = true;
    //                        this.LoadImagingTypes();
    //                        this.imagingItemPreference = new Array<ImagingItem>();
    //                    }

    //                } else {
    //                    this.msgBoxServ.showMessage("error", [res.ErrorMessage]);
    //                }
    //            },
    //                err => {
    //                    this.msgBoxServ.showMessage("error", [err.ErrorMessage]);
    //                });
    //    } else {
    //        this.LoadSelectedTests();
    //    }


    //}



    ////this is selecting and unselecting the whole prefernce item in one go
    //SelectAllPreference() {
    //    //if selectAllPreference is true then all the preference item is selected...
    //    if (this.selectAllPreference == true) {

    //        for (var i = 0; i < this.ordServ.imagingItemPreference.length; i++) {
    //            //IsPresent is used to check whether the item item is present or not the ordServ.imagingItems 
    //            //if it is present then,dont push else push
    //            var IsPresent = false;
    //            for (var a = 0; a < this.ordServ.imagingItems.length; a++) {
    //                if (this.ordServ.imagingItems[a].ImagingItemId == this.ordServ.imagingItemPreference[i].ImagingItemId) {
    //                    IsPresent = true;

    //                }
    //            }
    //            if (IsPresent == false) {
    //                this.ordServ.imagingItemPreference[i].IsSelected = true;
    //                this.ordServ.imagingItemPreference[i].IsPreference = true;
    //                this.ordServ.ImagingEventHandler(this.ordServ.imagingItemPreference[i]);
    //            }

    //        }
    //    }
    //    //if selectAllPreference is false then all the preference is unselected...
    //    if (this.selectAllPreference == false && this.ordServ.imagingItems.length != 0) {
    //        for (var a = 0; a < this.ordServ.imagingItemPreference.length; a++) {
    //            for (var i = 0; i < this.ordServ.imagingItems.length; i++) {
    //                if (this.ordServ.imagingItems[i].ImagingItemId == this.ordServ.imagingItemPreference[a].ImagingItemId) {
    //                    this.ordServ.imagingItemPreference[a].IsSelected = false;
    //                    this.ordServ.imagingItems[i].IsSelected = false;
    //                    this.ordServ.ImagingEventHandler(this.ordServ.imagingItemPreference[a]);
    //                }

    //            }
    //        }
    //    }
    //    //this.ordServ.imagingItems = new Array<ImagingItem>();
    //}


}
