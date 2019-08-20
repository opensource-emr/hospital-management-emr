import { Component, Directive } from '@angular/core';
import { GridOptions } from 'ag-grid-community'
import { Input, Output, EventEmitter, OnInit } from "@angular/core"
import { GridEmitModel } from "./grid-emit.model"
import { CommonFunctions } from '../common.functions';
import * as moment from 'moment/moment';
import { Subject } from 'rxjs';
import { SearchService } from '../search.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: "danphe-grid",
  templateUrl: "./danphe-grid.html"
})
export class DanpheGridComponent {
  public gridApi;
  public gridColumnApi;
  public gridOptions: GridOptions;
  public showGrid: boolean;

  public filterData: any;
  public PrintRowData: any;
  public dataSource: any;

  public showSelector: boolean = false;
  public fromDate: string = null;
  public toDate: string = null;
  public rangeType: string = "";
  public showLabel: boolean = false;
  public isOutOfFiscalYearDate: boolean = false;

  public apiUrl: string = "";
  public searchTerms = new Subject<any>();
  public searchMinTxtLeng: number = 0;
  @Input("grid-showExport")
  public showExport: boolean = false;

  @Input("grid-showExportNew")
  public showExportNew: boolean = false;

  @Input("grid-showPrint")
  public showPrint: boolean = true;

  @Input("grid-data")
  public rowData: any[];

  @Input("grid-colDefaults")
  public columnDefs: any[];

  @Input("grid-column-filter")
  public gridColumnFilter: any[];

  public rowCount: string;

  @Output("grid-actions")
  gridCellClicked: EventEmitter<GridEmitModel> = new EventEmitter<GridEmitModel>();

  @Input("grid-exportOptions")
  public exportOptions: any;

  @Output("grid-onExport")
  onGridExport: EventEmitter<GridEmitModel> = new EventEmitter<GridEmitModel>();

  @Input("rangeType")
  public set value(val: string) {
    this.rangeType = val ? val : "None";
    this.RangeTypeOnChange();
  }

  //User can give what all ranges they want in this grid. default: all
  //Custom will be available all the time,  other are parameterized.
  @Input("date-range-options")
  public dateRangeOptionsStr: string = "1W,1M,3M,6M";

  public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };


  @Input("show-CustomDate")
  public showCustomDate: boolean = false;

  @Input("show-ServerSideSearch")
  public showServerSideSearch: boolean = false;

  @Output("onDateChange")
  eventDate: EventEmitter<Object> = new EventEmitter<Object>();

  @Output("result-data")
  resultData: EventEmitter<Object> = new EventEmitter<Object>();

  @Input("show-print-button")
  public showPrintButton: boolean = true;

  @Input("api-type")
  public set apiurl(val: string) {
    this.apiUrl = val;
    this.loadRowData();
  }
  constructor(public searchService: SearchService) {
    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.showGrid = true;
    this.searchMinTxtLeng = +this.searchService.getSerachCharLength() + 1;
  }

  ngOnInit() {
    if (this.dateRangeOptionsStr) {

      //public dateRangeOptionsStr: string = "1W,1M,3M,6M";
      //public dateRangeOptions = { week1: true, month1: true, month3: true, month6: true };

      this.dateRangeOptions.week1 = this.dateRangeOptionsStr.indexOf('1W') > -1;
      this.dateRangeOptions.month1 = this.dateRangeOptionsStr.indexOf('1M') > -1;
      this.dateRangeOptions.month3 = this.dateRangeOptionsStr.indexOf('3M') > -1;
      this.dateRangeOptions.month6 = this.dateRangeOptionsStr.indexOf('6M') > -1;

    }

  }

  RangeTypeOnChange() {
    this.showSelector = false;
    this.showLabel = false;
    this.isOutOfFiscalYearDate = false;
    if (this.rangeType == "None") {
      var from = new Date();
      var to = new Date();
      to.setHours(23, 59, 59, 999);
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 1);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last1Week") {
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - 7);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last3Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 3);
      this.fromDate = moment(from).format('YYYY-MM-DD');

      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else if (this.rangeType == "last6Months") {
      //from --> 1st of month 00:00 hrs, to --> (today) 23:59 hrs
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setMonth(from.getMonth() - 6);
      this.fromDate = moment(from).format('YYYY-MM-DD');
      // }
      this.toDate = moment(to).format('YYYY-MM-DD');
      this.showLabel = true;
      this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
    }
    else {
      this.fromDate = this.toDate = moment().format('YYYY-MM-DD');
      this.showSelector = true;
      this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate, type: "custom" });
    }
  }

  ChangeCustomDate() {
    var fDate = moment(this.fromDate).format('YYYY-MM-DD 00:00');
    var tDate = moment(this.toDate).format('YYYY-MM-DD 23:59');
    this.eventDate.emit({ fromDate: fDate, toDate: tDate });
  }


  onBtPrint() {
    let popupWinindow;
    var printContents = '<b>DATA</b>';
    printContents += '<style> table { border-collapse: collapse; border-color: black; } th { color:black; background-color: #599be0; } </style>';

    var htmlTable = this.JsonDataToHTMLTable(this.PrintRowData, this.columnDefs);
    printContents += htmlTable.innerHTML;
    popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    popupWinindow.document.open();
    let documentContent = "<html><head>";
    documentContent += '<link rel="stylesheet" type="text/css" media="print" href="../../../themes/theme-default//DanphePrintStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../themes/theme-default//DanpheStyle.css"/>';
    documentContent += '<link rel="stylesheet" type="text/css" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css"/>';
    documentContent += '</head>';
    documentContent += '<body onload="window.print()">' + printContents + '</body></html>'
    popupWinindow.document.write(documentContent);
    popupWinindow.document.close();
  }
  public JsonDataToHTMLTable(data, gridColList: any[]) {
    var newCol = [];
    for (i = 0; i < gridColList.length; i++) {
      if (gridColList[i].field) {
        newCol.push(gridColList[i].field);
      }
    }

    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
    var tr = table.insertRow(-1);                   // TABLE ROW.
    for (var i = 0; i < newCol.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.setAttribute("style", "font-weight:bold; border:1px solid black;");
      th.style.backgroundColor = "blue";
      th.innerHTML = CommonFunctions.GetKeyName(newCol[i], gridColList);  //newCol[i];            
      tr.appendChild(th);
    }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < data.length; i++) {
      tr = table.insertRow(-1);
      for (var j = 0; j < newCol.length; j++) {
        var tabCell = tr.insertCell(-1);
        tabCell.setAttribute("style", "border:1px solid black;");
        tabCell.innerHTML = data[i][newCol[j]];

      }
    }
    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    table.setAttribute("class", "table table-striped table-hover table-responsive");
    var newdiv = document.createElement("div");
    newdiv.setAttribute("class", "table-responsive");
    newdiv.appendChild(table);
    return newdiv;
  }
  public calculateRowCount() {
    if (this.gridOptions.api && this.rowData) {
      var model = this.gridOptions.api.getModel();
      var totalRows = this.rowData.length;
      var processedRows = model.getRowCount();
      this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
    }

  }

  public onModelUpdated() {
    this.calculateRowCount();
  }

  public onReady() {
    // this.gridApi = this.gridOptions.api;
    // this.gridColumnApi = this.gridOptions.columnApi;

    // this.gridOptions.api.expandAll();
    // console.log('onReady');
    this.calculateRowCount();
    //-- add a property 'isResponsiveColumn:bool, set it as default true, pass false for DYNAMIC REPORTS.'
    this.gridOptions.api.sizeColumnsToFit();
  }



  //we're emiting our custom gridemitobject from here.
  // NOTE: each custom item(eg, image, button, anchor, should have this attribute "danphe-grid-action" in its template, else it won't work.. 
  public onCellClicked($event) {
    if ($event.event.target !== undefined) {
      let data = $event.data;
      let actionType = $event.event.target.getAttribute("danphe-grid-action");
      let emitObj = new GridEmitModel();
      emitObj.Action = actionType;
      emitObj.Data = $event.data;
      emitObj.RowIndex = $event.rowIndex;
      this.gridCellClicked.emit(emitObj);
    }
  }

  public onCellValueChanged($event) {
    //console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
  }

  public onCellDoubleClicked($event) {
    //console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  public onCellContextMenu($event) {
    //console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
  }

  public onCellFocused($event) {
    //console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
  }

  public onRowSelected($event) {
    // taking out, as when we 'select all', it prints to much to the console!!
    // console.log('onRowSelected: ' + $event.node.data.name);
  }

  public onSelectionChanged() {
    //console.log('selectionChanged');
  }

  public onBeforeFilterChanged() {
    //console.log('beforeFilterChanged');
  }

  public onAfterFilterChanged() {
    //console.log('afterFilterChanged');
  }

  public onFilterModified() {
    //console.log('onFilterModified');
  }

  public onBeforeSortChanged() {
    //console.log('onBeforeSortChanged');
  }

  public onAfterSortChanged() {
    //console.log('onAfterSortChanged');
  }

  public onVirtualRowRemoved($event) {
    // because this event gets fired LOTS of times, we don't print it to the
    // console. if you want to see it, just uncomment out this line
    // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
  }

  public onRowClicked($event) {
    //console.log('onRowClicked: ' + $event.node.data.name);
  }

  public onQuickFilterChanged($event) {
    this.dataSource = new MatTableDataSource(this.rowData);
    this.gridOptions.api.setQuickFilter($event.target.value);
    this.applyFilter($event.target.value);
  }
  applyFilter(filterValue: any) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches      
    this.dataSource.filter = filterValue;
    this.PrintRowData = this.dataSource.filteredData;
  }
  // Real time search data from api
  searchSeraverSide($event) {
    //  this.gridSearchTyped.emit($event.target.value);
    this.searchTerms.next($event.target.value);


  }
  loadRowData() {
    this.searchService.search(this.apiUrl, this.searchTerms)
      .subscribe(res => {
        this.rowData = res.Results;
        this.PrintRowData = res.Results;
        this.eventDate.emit({ fromDate: this.fromDate, toDate: this.toDate });
        this.resultData.emit(this.rowData);
      })

  }
  // here we use one generic event to handle all the column type events.
  // the method just prints the event name
  public onColumnEvent($event) {
    //console.log('onColumnEvent: ' + $event);
  }

  public onRowDataChanged($event) {
    //console.log("start--row data change.");
    //console.log($event);
    //console.log("end--row data change.");
  }

  //We couldn't add HeaderFormatting feature in this function.
  //try to add dynamic headers, cell/header formatting, grouping, etc later on : sudarshan 5June'17
  public ExportToExcel($event) {
    function formattingFunction(params) {
      let colDef = params.column.colDef;

      //let TextBoldSty = colDef.TextBoldFormate("style: fontSize: 22, bold: true")
      //colDef.cellStyle = { color: 'red', 'background-color': 'green'};
      return colDef.headerName.replace('<b>', '').replace('</b>', '');
    }

    //exportOptions: { fileName:'' displayColumns:[] };

    // ['EMPI', 'ShortName', 'Gender', 'MiddleName', 'DateOfBirth', 'PhoneNumber'],
    var params = {
      processHeaderCallback: formattingFunction,
      customHeader: this.exportOptions.customHeader,
      skipHeader: false,
      columnKeys: this.exportOptions.displayColumns,
      fileName: this.exportOptions.fileName
    };

    this.gridOptions.api.exportDataAsCsv(params);
  }

  ExportToExcel_New($event) {
    let emitObj = new GridEmitModel();
    emitObj.Action = "Dharam";
    this.onGridExport.emit(emitObj);
  }

}
