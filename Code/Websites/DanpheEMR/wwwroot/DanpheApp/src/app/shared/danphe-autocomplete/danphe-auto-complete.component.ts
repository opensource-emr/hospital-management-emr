import {
    Component,
    ElementRef,
    Input,
    Output,
    OnInit,
    ViewEncapsulation,
    EventEmitter,
    ViewChild
} from "@angular/core";
import { DanpheAutoComplete } from "./danphe-auto-complete";

/**
 * show a selected date in monthly calendar
 * Each filteredList item has the following property in addition to data itself
 *   1. displayValue as string e.g. Allen Kim
 *   2. dataValue as any e.g.
 */
@Component({
    selector: "danphe-auto-complete",
    template: `
  <div class="danphe-auto-complete">

    <!-- keyword input -->
    <input *ngIf="showInputTag"
           #autoCompleteInput class="keyword"
           placeholder="{{placeholder}}"
           (focus)="showDropdownList($event)"
           (blur)="hideDropdownList()"
           (keydown)="inputElKeyHandler($event)"
           (input)="reloadListInDelay($event)"
           [(ngModel)]="keyword" />

    <!-- dropdown that user can select -->
    <ul *ngIf="dropdownVisible" [class.empty]="emptyList">
      <li *ngIf="isLoading" class="loading">{{loadingText}}</li>
      <li *ngIf="minCharsEntered && !isLoading && !filteredList.length"
           (mousedown)="selectOne('')"
           class="no-match-found">{{noMatchFoundText || 'No Result Found'}}</li>
      <li *ngIf="blankOptionText && filteredList.length"
          (mousedown)="selectOne('')"
          class="blank-item">{{blankOptionText}}</li>
      <li class="item"
          *ngFor="let item of filteredList; let i=index"
          (mousedown)="selectOne(item)"
          [ngClass]="{selected: i === itemIndex}"
          [innerHtml]="autoComplete.getFormattedListItem(item)">
      </li>
    </ul>

  </div>`
    ,
    providers: [DanpheAutoComplete],
    styles: [`
  @keyframes slideDown {
    0% {
      transform:  translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  .danphe-auto-complete {
    background-color: transparent;
  }
  .danphe-auto-complete > input {
    outline: none;
    border: 0;
    padding: 2px; 
    box-sizing: border-box;
    background-clip: content-box;
  }

  .danphe-auto-complete > ul {
    background-color: #fff;
    margin: 0;
    width : 100%;
    overflow-y: auto;
    list-style-type: none;
    padding: 0;
    border: 1px solid #ccc;
    box-sizing: border-box;
    animation: slideDown 0.1s;
  }
  .danphe-auto-complete > ul.empty {
    display: none;
  }

  .danphe-auto-complete > ul li {
    padding: 2px 5px;
    border-bottom: 1px solid #eee;
  }

  .danphe-auto-complete > ul li.selected {
    background-color: #ccc;
  }

  .danphe-auto-complete > ul li:last-child {
    border-bottom: none;
  }

  .danphe-auto-complete > ul li:hover {
    background-color: #ccc;
  }`
    ],
    encapsulation: ViewEncapsulation.None
})
export class DanpheAutoCompleteComponent implements OnInit {

    /**
     * public input properties
     */
    @Input("list-formatter") listFormatter: (arg: any) => string;
    @Input("source") source: any;
    @Input("grid-sort") gridsort: string;
    @Input("path-to-data") pathToData: string;
    @Input("min-chars") minChars: number = 0;
    @Input("placeholder") placeholder: string;
    @Input("blank-option-text") blankOptionText: string;
    @Input("no-match-found-text") noMatchFoundText: string;
    @Input("accept-user-input") acceptUserInput: boolean;
    @Input("loading-text") loadingText: string = "Loading";
    @Input("max-num-list") maxNumList: number;
    @Input("show-input-tag") showInputTag: boolean = true;
    @Input("show-dropdown-on-init") showDropdownOnInit: boolean = false;
    @Input("tab-to-select") tabToSelect: boolean = true;
    @Input("match-formatted") matchFormatted: boolean = false;
    //sud:23May'21--Precondition: matchFormatted should be true.
    //if propertyNameToMatch is given, then the matching function checks only for the given property name's value.
    //Check in its implementation for details.
    @Input("match-property-csv") propertyNamesToMatchCSV: string;
 
    @Output() valueSelected = new EventEmitter();
    @ViewChild('autoCompleteInput') autoCompleteInput: ElementRef;

    el: HTMLElement;

    dropdownVisible: boolean = false;
    isLoading: boolean = false;

    filteredList: any[] = [];
    minCharsEntered: boolean = false;
    itemIndex: number = 0;
    keyword: string;

    isSrcArr(): boolean {
        return (this.source.constructor.name === "Array");
    }

    /**
     * constructor
     */
    constructor(
        elementRef: ElementRef,
        public autoComplete: DanpheAutoComplete
    ) {
        this.el = elementRef.nativeElement;
    }

    /**
     * user enters into input el, shows list to select, then select one
     */
    ngOnInit(): void {
        this.autoComplete.source = this.source;
        this.autoComplete.pathToData = this.pathToData;
        this.autoComplete.listFormatter = this.listFormatter;

        setTimeout(() => {
            if (this.autoCompleteInput) {
                this.autoCompleteInput.nativeElement.focus()
            }
            if (this.showDropdownOnInit) {
                this.showDropdownList({ target: { value: '' } });
            }
        });
    }

    reloadListInDelay = (evt: any): void => {
        let delayMs = this.isSrcArr() ? 10 : 500;
        let keyword = evt.target.value;

        // executing after user stopped typing
        this.delay(() => this.reloadList(keyword), delayMs);
    };

    showDropdownList(event: any): void {
        this.dropdownVisible = true;
        this.reloadList(event.target.value);
    }

    hideDropdownList(): void {
        this.dropdownVisible = false;
    }

    findItemFromSelectValue(selectText: string): any {
        let matchingItems = this.filteredList
            .filter(item => ('' + item) === selectText);
        return matchingItems.length ? matchingItems[0] : null;
    }

    reloadList(keyword: string): void {
        //console.log("Reload lists called..");
        this.itemIndex = 0;//sud:1-Oct'18 -- this should be reset everytime item list is changed..
        this.filteredList = [];
        if (keyword.length < (this.minChars || 0)) {
            this.minCharsEntered = false;
            return;
        } else {
            this.minCharsEntered = true;


        }

        if (this.isSrcArr()) {    // local source
            this.isLoading = false;
            this.filteredList = this.autoComplete.filter(this.source, keyword, this.matchFormatted, this.propertyNamesToMatchCSV);

            //sort the filtered data if it's it's enabled.
            if (this.gridsort && this.gridsort.length != 0) {
                this.SortFilteredList(keyword);
            }

            if (this.maxNumList) {
                this.filteredList = this.filteredList.slice(0, this.maxNumList);
            }

        } else {                 // remote source
            this.isLoading = true;

            if (typeof this.source === "function") {
                // custom function that returns observable
                this.source(keyword).subscribe(
                    resp => {

                        if (this.pathToData) {
                            let paths = this.pathToData.split(".");
                            paths.forEach(prop => resp = resp[prop]);
                        }

                        this.filteredList = resp;

                        //sud:23May'21: sort the filtered data if it's it's enabled.
                        if (this.gridsort && this.gridsort.length != 0) {
                            this.SortFilteredList(keyword);
                        }

                        if (this.maxNumList) {
                            this.filteredList = this.filteredList.slice(0, this.maxNumList);
                        }


                    },
                    error => null,
                    () => this.isLoading = false // complete
                );
            } else {
                // remote source

                this.autoComplete.getRemoteData(keyword)
                    .subscribe(resp => {
                        this.filteredList = (<any>resp);

                        //sud:23May'21: sort the filtered data if it's it's enabled.
                        if (this.gridsort && this.gridsort.length != 0) {
                            this.SortFilteredList(keyword);
                        }

                        if (this.maxNumList) {
                            this.filteredList = this.filteredList.slice(0, this.maxNumList);
                        }
                    },
                        error => null,
                        () => this.isLoading = false // complete
                    );
            }
        }
    }

    selectOne(data: any) {
        this.valueSelected.emit(data);
    };

    inputElKeyHandler = (evt: any) => {
        let totalNumItem = this.filteredList.length;

        switch (evt.keyCode) {
            case 27: // ESC, hide auto complete
                break;

            case 38: // UP, select the previous li el
                this.itemIndex = (totalNumItem + this.itemIndex - 1) % totalNumItem;

                //start:sud:1oct'18--to scroll to current element.
                let scrollToHeight1 = this.itemIndex * 21.5;
                let ulElement1 = document.querySelector(".danphe-auto-complete ul");
                if (ulElement1) {
                    ulElement1.scrollTo(0, scrollToHeight1);  //   el.scrollTo(scrollToHeight + 'px');
                }
                //end:sud:1oct'18--to scroll to current element.

                break;

            case 40: // DOWN, select the next li el or the first one
                this.dropdownVisible = true;
                this.itemIndex = (totalNumItem + this.itemIndex + 1) % totalNumItem;

                //start:sud:1oct'18--to scroll to current element.
                let scrollToHeight2 = this.itemIndex * 21.5;
                let ulElement2 = document.querySelector(".danphe-auto-complete ul");
                if (ulElement2) {
                    ulElement2.scrollTo(0, scrollToHeight2);  //   el.scrollTo(scrollToHeight + 'px');
                }
                //end:sud:1oct'18--to scroll to current element.


                break;

            case 13: // ENTER, choose it!!
                if (this.filteredList.length > 0) {
                    this.selectOne(this.filteredList[this.itemIndex]);
                }
                evt.preventDefault();
                break;

            case 9: // TAB, choose if tab-to-select is enabled
                if (this.tabToSelect && this.filteredList.length > 0) {
                    this.selectOne(this.filteredList[this.itemIndex]);
                }
                break;
        }
    };

    get emptyList(): boolean {
        return !(
            this.isLoading ||
            (this.minCharsEntered && !this.isLoading && !this.filteredList.length) ||
            (this.filteredList.length)
        );
    }

    public delay = (function () {
        let timer: number;
        return function (callback: any, ms: number) {
            clearTimeout(timer);
            timer = window.setTimeout(callback, ms);
        };
    })();


    // sort has 9 combinations 
    // first of a/b , middle of a/b and last of a/b
    // using permutation and bubble sort logic
    public SortFilteredList(keyword: string) {
        if (this.gridsort.toLowerCase() != 'sortonbasicdatatype') {
            this.filteredList.sort((a, b) => {
                var stra: string = a[this.gridsort];
                var strb: string = b[this.gridsort];
                stra = stra && stra.toLowerCase();
                strb = strb && strb.toLowerCase();
                keyword = keyword.toLowerCase();
                // if equal with the first
                if (stra == keyword) {
                    return -1;
                }
                if (strb == keyword) {
                    return 1;
                }
                // covers 2 combinations
                if ((stra == keyword) || ( stra && stra.startsWith(keyword))) {
                    if (strb.startsWith(keyword)) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                }
                // covers 1 combination
                if ( stra && stra.endsWith(keyword)) {
                    if ( strb.endsWith(keyword)) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                }
                // covers 1 combination
                var newKeyword = "";
                if (keyword.includes("(")) {
                    newKeyword = keyword.replace(/\(/gi, "\\\(");
                } else if (keyword.includes(")")) {
                    newKeyword = keyword.replace(/\)/gi, "\\\)");
                } else if (keyword.includes("+")) {
                    newKeyword = keyword.replace(/\+/gi, "\\\+");
                } else if (keyword.includes("*")) {
                    newKeyword = keyword.replace(/\*/gi, "\\\*");
                }
                else {
                    newKeyword = keyword;
                }
                var regcheckbetween = new RegExp(".*" + newKeyword + ".*");
                if (regcheckbetween.test(stra)) {
                    if ( strb && strb.startsWith(keyword)) {
                        return 1;
                    }
                    if ( strb && strb.endsWith(keyword)) {
                        return -1;
                    }
                }
                // all rest 3 combinations
                return 0;
            });
        } else {
            this.filteredList.sort((a, b) => {
                var stra: string = a;
                var strb: string = b;
                stra = stra.toLowerCase();
                strb = strb.toLowerCase();
                keyword = keyword.toLowerCase();
                // if equal with the first
                if (stra == keyword) {
                    return -1;
                }
                if (strb == keyword) {
                    return 1;
                }
                // covers 2 combinations
                if ((stra == keyword) || stra.startsWith(keyword)) {
                    if (strb.startsWith(keyword)) {
                        return 0;
                    }
                    else {
                        return -1;
                    }
                }
                // covers 1 combination
                if (stra.endsWith(keyword)) {
                    if (strb.endsWith(keyword)) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                }
                // covers 1 combination
                var newKeyword = "";
                if (keyword.includes("(")) {
                    newKeyword = keyword.replace(/\(/gi, "\\\(");
                } else if (keyword.includes(")")) {
                    newKeyword = keyword.replace(/\)/gi, "\\\)");
                } else if (keyword.includes("+")) {
                    newKeyword = keyword.replace(/\+/gi, "\\\+");
                } else if (keyword.includes("*")) {
                    newKeyword = keyword.replace(/\*/gi, "\\\*");
                }
                else {
                    newKeyword = keyword;
                }
                var regcheckbetween = new RegExp(".*" + newKeyword + ".*");
                if (regcheckbetween.test(stra)) {
                    if (strb.startsWith(keyword)) {
                        return 1;
                    }
                    if (strb.endsWith(keyword)) {
                        return -1;
                    }
                }
                // all rest 3 combinations
                return 0;
            });
        }
    }


}
