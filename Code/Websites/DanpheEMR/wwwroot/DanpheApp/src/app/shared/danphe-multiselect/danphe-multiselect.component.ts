import { Component } from '@angular/core';
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
@Component({
    selector: "danphe-multiselect",
    templateUrl: "./danphe-multiselect.html"
})
export class DanpheMultiSelectComponent implements OnInit {
    //NBB-
    //Note:- This Multiselect dropdown wants id, itemName columns respectivly as valueProperty, displayProperty for dropdown
    //Here we have written 2 filters for filter user data    

    //for dropdownList data--
    //first we replace all valuePropertyKey(provided by User) as id
    //then replace all displayPropertyKey(Provided by User) as itemId

    //for selectedItemsList data--
    //first we replace all id (filtered key name) key name as per user provided valuePropertyKey
    //then replace all itemId(filtered key name) key name as per user provided displayPropertyKey

    //ex:-
    //BeforeFilter- dropdownData=[{"CustId":1,"name":"Nagesh","Mobile":9975665522},{"CustId":2,"name":"Dinesh","Mangesh":9975665522}];
    //AfterFilter- dropdownData[{"id":1,"itemName":"Nagesh","Mobile":9975665522},{"id":2,"itemName":"Dinesh","Mangesh":9975665522}];


    //settings for multiselect dropdown
    //like -placeholder text by user(--select--) is default,    
    dropdownSettings = {};

    //Input decorator - value property of dropdown
    //provide your column name which column values you wan to assign as id for select(dropdown)
    @Input("value-property-name")
    public valuePropertyName = "id";

    //Input decorator- display property/text for dropdown
    //provide your column name which column values you want to see in select(dropdown)
    @Input("display-property-name")
    public dispayPropertyName = "itemName";

    //This input decorator for get List data from client for show in dropdown
    @Input("ddl-data")
    public dropdownList = [];

    @Input("selected-data")
    selectedItems = [];  //any type of List for selected items


    //text	-String	-Text to be show in the dropdown, when no items are selected.	'Select'
    //This input decorator for set placeholder text to dropdown (default is --select--)
    @Input("placeholder-text")
    public text = "--select--";

    //This is output decorator for return selected Items List to user in respective component where you are using multiselect dropdown
    @Output("selected-items-list")
    items: EventEmitter<any[]> = new EventEmitter<any[]>();

    //setting properties
    //Boolean-	To set the dropdown for single item selection only.-false
    @Input("single-selection")
    public singleSelection = false;

    @Input("show-limit")
    public badgeShowLimit = 1;

    @Input("group-by")
    public groupBy = "";

    //preselected item list
    @Input("pre-selected")
    public PreSelected = [];

    //called after data-bound (dropdown list data) have been changed 
    ngOnChanges() {
        if (this.dropdownList) {
            if (this.dropdownList.length > 0) {
                //we assign data with filter property
                this.selectedItems = [];
                this.dropdownList = this.filterDDLData(this.dropdownList);
            } else {
                this.selectedItems = [];
                this.dropdownList = this.dropdownList;
            }
        }
        else {
            this.dropdownList = [];
        }

    }
    //Initialization of dropdown basic setting and other things first time
    ngOnInit() {
        if (this.PreSelected.length > 0) {
            this.MakeFullPropertiesSelectedList();
        } else {
            this.selectedItems = [];
        }
        this.dropdownSettings = {
            //type- description - default value
            //Boolean-	To set the dropdown for single item selection only.-false
            singleSelection: this.singleSelection,
            text: this.text,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: "danaphe-multiselect-style",
            groupBy: this.groupBy,
            badgeShowLimit: this.badgeShowLimit
        };
    }

    //all events 
    onItemSelect(item: any) {
        this.items.emit(this.filterItem(this.selectedItems));
    }
    OnItemDeSelect(item: any) {
        this.items.emit(this.filterItem(this.selectedItems));
    }
    onSelectAll(items: any) {
        this.items.emit(this.filterItem(this.selectedItems));
    }
    onDeSelectAll(items: any) {
        this.items.emit(this.filterItem(this.selectedItems));
    }

    //filter selected items 
    //now we are changing items valueProperty and displayProperty name as per user data    
    filterItem(inputData): any[] {
        let replaceAsId = this.valuePropertyName;
        let replaceThisId = "id"
        let replaceAsItemNameProperty = this.dispayPropertyName;
        let replaceThisItemNameProperty = "itemName"
        //changes of valueProperty
        var strData = JSON.stringify(inputData);//we want only  value type not a reference type
        var jsonData = JSON.parse(strData);
        jsonData.map(function (item) {
            if (replaceThisId in item) {
                var x = item[replaceThisId];
                delete item[replaceThisId];
                item[replaceAsId] = x;
            }
            return item;
        });

        //changes of display property
        var strData1 = JSON.stringify(jsonData);//we want only  value type not a reference type
        var jsonData1 = JSON.parse(strData1);
        jsonData1.map(function (item) {
            if (replaceThisItemNameProperty in item) {
                var y = item[replaceThisItemNameProperty];//new
                delete item[replaceThisItemNameProperty];//new
                item[replaceAsItemNameProperty] = y;
            }
            return item;
        });
        return jsonData1;
    }
    //it filter all data of user
    //replacing id with valueProperty(from user data), itemName with displayProperty(from user data)
    filterDDLData(inputData): any[] {
        let replaceAsId = "id";
        let replaceThisId = this.valuePropertyName;
        let replaceAsName = "itemName";
        let replaceThisName = this.dispayPropertyName;
        //replace id
        var strData = JSON.stringify(inputData);//we want only  value type not a reference type
        var jsonData = JSON.parse(strData);
        jsonData.map(function (item) {
            if (replaceThisId in item) {
                var x = item[replaceThisId];
                delete item[replaceThisId];
                item[replaceAsId] = x;
            }
            return item;
        });

        //replace name
        var strData1 = JSON.stringify(jsonData);//we want only  value type not a reference type
        var jsonData1 = JSON.parse(strData1);
        jsonData1.map(function (item) {
            if (replaceThisName in item) {
                var y = item[replaceThisName];//new
                delete item[replaceThisName];//new
                item[replaceAsName] = y;
            }
            return item;
        });
        return jsonData1;
    }
    //make selected items array with source array by id
    MakeFullPropertiesSelectedList() {
        if (this.dropdownList.length > 0) {
            this.PreSelected = this.filterDDLData(this.PreSelected);
            let res = [];
            this.PreSelected.forEach(i => {
                let index = this.dropdownList.findIndex(t => t.id == i.id);//  (d => d.id == i.id);
                res.push(this.dropdownList[index]);
            });
            this.selectedItems = [];
            this.selectedItems = res;
        }
    }
    //implement below properties as per need
    //other all properties
    //enableCheckAll	-Boolean	-Enable the option to select all items in list	-false
    //selectAllText-	String	-Text to display as the label of select all option	-Select All
    //unSelectAllText-	String	-Text to display as the label of unSelect option	-UnSelect All
    //enableSearchFilter-	Boolean	-Enable filter option for the list.	false
    //maxHeight-	Number	-Set maximum height of the dropdown list in px.	300
    //badgeShowLimit-	Number-	Limit the number of badges/items to show in the input field. If not set will show all selected.	All
    //classes	-String	-Custom classes to the dropdown component. Classes are added to the dropdown selector tag. To add multiple classes, the value should be space separated class names.	''
    //limitSelection-	Number-	Limit the selection of number of items from the dropdown list. Once the limit is reached, all unselected items gets disabled.	none
    //disabled-	Boolean	-Disable the dropdown	false
    //searchPlaceholderText	-String-	Custom text for the search placeholder text. Default value would be 'Search'	'Search'
    //groupBy	-String	-Name of the field by which the list should be grouped.	none

}
