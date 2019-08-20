/*
File: DanpheChartsService
description: 
created: 29June'17 Sudarshan
Remarks: 
Change History:
------------------------------------------------------------
s.no.     user/date             changes          description/remarks
------------------------------------------------------------
1.     sudarshan/29June'17      created             NA
------------------------------------------------------------
*/

import { Injectable } from '@angular/core';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { CoreService } from "../../core/shared/core.service";
//DON't Import Jquery In here, it brings un-necessary issues like : node_modules coming inside compiled-js, CompileOnSave stops working, etc..
//if needed, jquery should be included from systemjs in similar manner to that of 'lodash'


@Injectable()
export class DanpheChartsService {
    colorSets = ["#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#40E0D0", "#48D1CC", "#00CED1", "#00FFFF", "#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#DEB887", "#D2B48C", "#BC8F8F"];

    colorSetsTrend = ["#5F9EA0", "#4682B4", "#B0C4DE", "#ADD8E6", "#B0E0E6", "#87CEFA", "#87CEEB", "#6495ED", "#00BFFF", "#1E90FF", "#4169E1", "#0000FF", "#0000CD", "#00008B", "#000080", "#191970"]

    
    //this class is a wrapper on AmCharts
    constructor(public AmCharts: AmChartsService,public coreService:CoreService) {
       
    }

    //to set the colors of the columns after plotting is done. 
    public setAutoColorsToColumns(chart) {
        for (var i = 0; i < chart.graphs.length; i++) {
            var graph = chart.graphs[i];
            if (graph.autoColor !== true)
                continue;
            var colorKey = "autoColor-" + i;
            graph.lineColorField = colorKey;
            graph.fillColorsField = colorKey;
            for (var x = 0; x < chart.dataProvider.length; x++) {
                var color = chart.colors[x]
                //var color = this.colorSetsTrend[x];
                chart.dataProvider[x][colorKey] = color;
            }
        }
    }



    public Home_Map_PatientDistributionByZone(target: string, areas: any[]) {
        this.AmCharts.makeChart(target, {
            "type": "map",
            "theme": "light",
            "colorSteps": 10,
            "dataProvider": {
                "map": "nepalLow",
                "areas": areas
            },

            "areasSettings": {
                "autoZoom": false,

                "balloonText": "[[title]]: <strong>[[value]]</strong>"
            },

            "valueLegend": {
                "right": 10,
                "minValue": "low",
                "maxValue": "high"
            },

            "export": {
                "enabled": true
            }

        });
    }
    public Home_Pie_DepartmentWiseAppointmentCount(target: string, data: any[]) {
        let graphOpts: DanpheChartOptions = { fieldX: "department", fieldY: "apptCount" };

        //let data = [{ "department": "Internal Medicine", "apptCount": 501 },
        //{ "department": "Radiology", "apptCount": 301 },
        //{ "department": "Laboratory", "apptCount": 201 },
        //{ "department": "Orthopedics", "apptCount": 165 },
        //{ "department": "Neurology", "apptCount": 139 },
        //{ "department": "Surgery", "apptCount": 128 },
        //{ "department": "ENT", "apptCount": 99 },
        //{ "department": "Pediatrics", "apptCount": 60 }];

        this.AmCharts.makeChart(target, {
            "type": "pie",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": '#888',
            "dataProvider": data,
            "valueField": graphOpts.fieldY,
            "titleField": graphOpts.fieldX,
            labelsEnabled: true,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            pullOutRadius: 10,
            "balloonText": "<span style='font-size:13px;'>[[title]]:<b>[[value]]</b></span>",
            labelText: "[[title]]:[[value]]"
        });
    }

    public Lab_Bar_TestCompleted(target: string, data: any[]) {
        this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": ['#888888'],
            "dataProvider": data,
            "rotate": false,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Count"
                }],
            "graphs": [{
                "balloonText": "[[ReportTemplateName]]:[[Counts]]",
                "fillAlphas": 1,
                "type": "column",
                autoColor: true,
                "valueField": "Counts",
                "fixedColumnWidth": 20
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },
            "categoryField": "ReportTemplateName"
        });
    }
    public Lab_Bar_TestTrends(target: string, data: any[]) {
        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": ['#888888'],
            "dataProvider": data,
            "rotate": true,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "count (last 30 days)"
                }],
            "graphs": [{
                "balloonText": "[[LabTestName]]:[[Counts]]",
                "fillAlphas": 1,
                "type": "column",
                autoColor: true,
                "valueField": "Counts",
                "fixedColumnWidth": 15,
                "lineColor": "#5F9EA0"
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelFunction": function (label, item, axis) {
                    var chart = axis.chart;
                    if ((chart.realWidth <= 300) && (label.length > 5))
                        return label.substr(0, 5) + '...';
                    if ((chart.realWidth <= 500) && (label.length > 10))
                        return label.substr(0, 10) + '...';
                    return label;
                }
            },
            "categoryField": "LabTestName"
        });
    }

    public Patient_Pie_GenderWise(target: string, data: any[]) {
        let graphOpts: DanpheChartOptions = { fieldX: "Gender", fieldY: "Count" };

        //let data = [{ "gender": "Male", "count": 2087 }, { "gender": "Female", "count": 2254 }, { "gender": "Others", "count": 84 }];

        this.AmCharts.makeChart(target, {
            "type": "pie",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": '#888',
            "dataProvider": data,
            "valueField": graphOpts.fieldY,
            "titleField": graphOpts.fieldX,
            labelsEnabled: true,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 10,
            marginRight: 0,
            pullOutRadius: 10,
            "balloonText": "<span style='font-size:13px;'>[[title]]:<b>[[value]]</b></span>",
            labelText: "[[title]]:[[value]]"
        });

    }
    public Patient_Bar_AgeWise(target: string, data: any[]) {
        var chart = this.AmCharts.makeChart("dvPatientsAgeWise", {
            "type": "serial",
            "theme": "light",
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 10,
                "valueWidth": 50
            },
            "dataProvider": data,
            "valueAxes": [{
                "stackType": "regular",
                "axisAlpha": 0.3,
                "gridAlpha": 0
            }],
            "graphs": [{
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "Male",
                "type": "column",
                "color": "#000000",
                "valueField": "Male"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "Female",
                "type": "column",
                "color": "#000000",
                "valueField": "Female"
            }, {
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "labelText": "[[value]]",
                "lineAlpha": 0.3,
                "title": "Others",
                "type": "column",
                "color": "#000000",
                "valueField": "Others"
            }],
            "categoryField": "AgeRange",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left"
            }

        });
    }

    public Pharmacy_Line_DailyStockValue(target: string, data: any[]) {

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "marginTop": 0,
            "marginRight": 0,
            "dataProvider": data,
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left"
            }],
            "graphs": [{
                "id": "g1",
                "balloonText": "[[Date]]<br><b><span style='font-size:14px;'>[[Quantity]]</span></b>",
                "bullet": "round",
                "bulletSize": 8,
                "lineColor": "#d1655d",
                "lineThickness": 2,
                "negativeLineColor": "#637bb6",              
                "valueField": "Quantity",
                "legendValueText": "Quantity",
            }],
            "chartCursor": {
                "categoryBalloonDateFormat": "YYYY",
                "cursorAlpha": 0,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "valueLineAlpha": 0.5,
                "fullWidth": true
            },
            "dataDateFormat": "YYYY",
            "categoryField": "Date",
            "categoryAxis": {
                "labelRotation": 30
            },
            "legend": {
                enabled: true,
                "position": "bottom",
                "useGraphSettings": true,
                title: "Quantity"
             }
        });
    }

    public Pharmacy_Bar_Top10ItemsbyPurchase(target: string) {

        let graphData = [{ "ItemName": "Dicolgem", "Value": 75451 },
        { "ItemName": "Pepto-Bismol", "Value": 73985 },
        { "ItemName": "Paracetamol", "Value": 71523 },
        { "ItemName": "Pedialyte", "Value": 68241 },
        { "ItemName": "Hyland’s Cough Syrup", "Value": 68111 },
        { "ItemName": "rivaroxaban", "Value": 42457 },
        { "ItemName": "aflibercept", "Value": 38562 },
        { "ItemName": "pregabalin", "Value": 27459 },
        { "ItemName": "pegfilgrastim", "Value": 25215 },
        { "ItemName": "salmeterol", "Value": 23918 }];

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",

            "fontFamily": 'Open Sans',
            "color": ['#888888'],

            "dataProvider": graphData,
            "rotate": true,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Amount"
                }],
            "graphs": [{
                "balloonText": "[[ItemName]]:[[Value]]",
                "fillAlphas": 1,
                "type": "column",
                autoColor: true,
                "valueField": "Value",
                "fixedColumnWidth": 15,
                "lineColor": "#5F9EA0"
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },
            "categoryField": "ItemName"
        });
    }

    public Pharmacy_MultiLine_RedZoneItems(target: string) {

        let graphData = [{ "ItemName": "Dicolgem", "AvailQuantity": 10, "MinQuantity": 12 },
        { "ItemName": " Tenglyn M", "AvailQuantity": 34, "MinQuantity": 44 },
        { "ItemName": "Paracetamol", "AvailQuantity": 26, "MinQuantity": 35 },
        { "ItemName": "Panacea", "AvailQuantity": 21, "MinQuantity": 25 },
        { "ItemName": "albuterol", "AvailQuantity": 38, "MinQuantity": 50 },
        { "ItemName": "insulin glargine", "AvailQuantity": 28, "MinQuantity": 35 },
        { "ItemName": "pregabalin", "AvailQuantity": 29, "MinQuantity": 40 },
        { "ItemName": "tiotropium", "AvailQuantity": 35, "MinQuantity": 42 },
        { "ItemName": "lisdexamfetamine", "AvailQuantity": 16, "MinQuantity": 25 },
        { "ItemName": "aripiprazole", "AvailQuantity": 15, "MinQuantity": 20 },];

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": ['#888888'],
            "dataProvider": graphData,
            "rotate": false,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Amount"
                }],
            "graphs": [{
                "valueAxis": "v1",
                "balloonText": "[[ItemName]]:[[AvailQuantity]]",
                //"lineAlpha": 0,
                "bullet": "diamond",
                "bulletSize": 15,
                "title": "AvailQuantity",
                "type": "line",
                "valueField": "AvailQuantity"
            },
            {
                "valueAxis": "v1",
                "balloonText": "[[ItemName]]:[[MinQuantity]]",
                //"lineAlpha": 0,
                "bullet": "diamond",
                "bulletSize": 15,
                "title": "MinQuantity",
                "type": "line",
                "valueField": "MinQuantity"
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },
            "categoryField": "ItemName",
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 15,
                "valueWidth": 25
            }
        });
    }

    
    public Pharmacy_Bar_Top10ItemsbySale(target: string) {

        let graphData = [{ "ItemName": "Dicolgem", "Value": 85451 },
        { "ItemName": "adalimumab", "Value": 78985 },
        { "ItemName": "etanercept", "Value": 71523 },
        { "ItemName": "rituximab", "Value": 68241 },
        { "ItemName": "lenalidomide", "Value": 68111 },
        { "ItemName": "infliximab", "Value": 52457 },
        { "ItemName": "bevacizumab", "Value": 38562 },
        { "ItemName": "trastuzumab", "Value": 37459 },
        { "ItemName": "insulin glargine", "Value": 34215 },
        { "ItemName": "Diphtheria ", "Value": 30918 }];

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",

            "fontFamily": 'Open Sans',
            "color": ['#888888'],

            "dataProvider": graphData,
            "rotate": true,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Amount"
                }],
            "graphs": [{
                "balloonText": "[[ItemName]]:[[Value]]",
                "fillAlphas": 1,
                "type": "column",
                autoColor: true,
                "valueField": "Value",
                "fixedColumnWidth": 15,
                "lineColor": "#5F9EA0"
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },
            "categoryField": "ItemName"
        });
    }

    public Billing_Line_DailyRevTrend(target: string, data: any[]) {

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "marginTop": 0,
            "marginRight": 0,
            "dataProvider": data,
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left"
            }],
            "graphs": [{
                "id": "g1",
                "balloonText": "[[Date]]<br><b><span style='font-size:14px;'>[[Revenue]]</span></b>",
                "bullet": "round",
                "bulletSize": 8,
                "lineColor": "#d1655d",
                "lineThickness": 2,
                "negativeLineColor": "#637bb6",
                //"type": "smoothedLine",
                "valueField": "Revenue",
                "legendValueText": "Revenue",
            }],

            "chartCursor": {
                "categoryBalloonDateFormat": "YYYY",
                "cursorAlpha": 0,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "valueLineAlpha": 0.5,
                "fullWidth": true
            },
            "dataDateFormat": "YYYY",
            "categoryField": "Date",
            "categoryAxis": {
                "labelRotation": 30
                //"minPeriod": "YYYY",
                //"parseDates": true,
                //"minorGridAlpha": 0.1,
                //"minorGridEnabled": true
            },
            "legend": {
                //"horizontalGap": 5,
                //"maxColumns": 4,
                enabled: true,
                "position": "bottom",
                "useGraphSettings": true,
                title: "Revenue"
                //"markerSize": 10,
                // "valueWidth": 100
            }

        });

        //chart.addListener("rendered", zoomChart);
        //if (chart.zoomChart) {
        //    chart.zoomChart();
        //}

        //function zoomChart() {
        //    chart.zoomToIndexes(Math.round(chart.dataProvider.length * 0.4), Math.round(chart.dataProvider.length * 0.55));
        //}
    }

    public Billing_Mix_MonthlyBilling(target: string, data: any[]) {

        this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "marginRight": 0,
            "marginLeft": 0,
            //"rotate": true,
            "dataProvider": data,
            "valueAxes": [{
                "id": "v1",
                "stackType": "regular",
                //"integersOnly": true,
                //"maximum": 40,
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                "position": "bottom",
                "title": "Amount in Thousands"
            }],
            "graphs": [{
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b> (Thousands)</span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Paid",
                "type": "column",
                "valueField": "Paid",
                //"fixedColumnWidth": 20
            }, {
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b> (Thousands)</span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Unpaid",
                "type": "column",
                "valueField": "Unpaid",
                //"fixedColumnWidth": 20
            }, {
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b> (Thousands)</span>",
                //"lineAlpha": 0,
                "bullet": "diamond",
                "bulletSize": 15,
                "title": this.coreService.taxLabel,
                "type": "line",
                "valueField": "Tax"
            }],
            "categoryField": "month",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left",
                "labelRotation": 30
            },
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 10,
                "valueWidth": 50
            }

        });

    }
    public Billing_Mix_IncomeSegregation(target: string, data: any[]) {

        this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "marginRight": 0,
            "marginLeft": 0,
            dataProvider: data,
            "valueAxes": [{
                "id": "v1",
                //"stackType": "regular",
                //"integersOnly": true,
                //"maximum": 40,
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                "position": "bottom",
                "title": "Amount"
            }],
            "graphs": [{
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Collection",
                "type": "column",
                "valueField": "collection",
                //"fixedColumnWidth": 20
            }, {
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Discount",
                "type": "column",
                "valueField": "DISCNTAMT",
                //"fixedColumnWidth": 20
            }, {
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": this.coreService.taxLabel,
                "type": "column",
                "valueField": "Tax",
                //"fixedColumnWidth": 20
            }],
            "categoryField": "srvDeptName",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left",
                "labelRotation": 30
            },
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 10,
                "valueWidth": 50
            }

        });

    }


    public Inventory_Pie_CatWiseCurrStockValue(target: string) {

        let graphOpts: DanpheChartOptions = { fieldX: "category", fieldY: "value" };

        //value is in thousands.
        let data = [{ "category": "Stationery", "value": 235 },
        { "category": "Electronic", "value": 501 },
        { "category": "HouseKeeping", "value": 820 },
        { "category": "Lab Equipments", "value": 1233 },
        { "category": "Other", "value": 648 }];

        this.AmCharts.makeChart(target, {
            "type": "pie",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": '#888',
            "dataProvider": data,
            "valueField": graphOpts.fieldY,
            "titleField": graphOpts.fieldX,
            labelsEnabled: true,
            autoMargins: false,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            pullOutRadius: 10,
            "balloonText": "<span style='font-size:13px;'>[[title]]:<b>[[value]]</b>(thousands)</span>",
            labelText: "[[title]]:[[value]]"
        });

    }

    public Inventory_BarH_TrendingItems(target: string) {

        let graphData = [{ "ItemName": "Dicolgem", "Value": 85451 },
        { "ItemName": "NotePad", "Value": 78985 },
        { "ItemName": "Paracetamol", "Value": 71523 },
        { "ItemName": "Paper Adding Roll", "Value": 68241 },
        { "ItemName": "Tape-Brown", "Value": 68111 },
        { "ItemName": "Diclofenac", "Value": 52457 },
        { "ItemName": "Sale-Sheet", "Value": 38562 },
        { "ItemName": "Kitotifen", "Value": 37459 },
        { "ItemName": "Pen-Highlighter", "Value": 34215 },
        { "ItemName": "Print-Paper", "Value": 30918 }];



        //graphData.sort(function (a, b) {
        //    return a.last_nom > b.last_nom;
        //});

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",

            "fontFamily": 'Open Sans',
            "color": ['#888888'],

            //"legend": {
            //    //"enabled": false,
            //    //"equalWidths": false,
            //    "useGraphSettings": false,
            //    "valueWidth": 120
            //},
            "dataProvider": graphData,
            "rotate": true,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Amount"
                }],
            "graphs": [{
                "balloonText": "[[ItemName]]:[[Value]]",
                "fillAlphas": 1,
                //"legendPeriodValueText": "today's total count: [[value.sum]]",
                // "legendValueText": "[[value]] mi",
                //"title": "today's total count: [[value.sum]]",
                "type": "column",
                autoColor: true,
                "valueField": "Value",
                "fixedColumnWidth": 15,
                "lineColor": "#5F9EA0"
            }],
            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },

            "categoryField": "ItemName"
        });


    }

    //gets random value between 100,000 and 200,000
    public GetRandomValue(): number {
        let randVal = 100000 * (1 + Math.random());
        return Math.round(randVal);
    }

    public Inventory_BarV_PurchaseVsConsumption(target: string) {


        this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "marginRight": 0,
            "marginLeft": 0,
            //"rotate": true,
            "dataProvider": [{ "Month": "2017-Jul", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-Jun", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-May", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-Apr", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-Mar", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-Feb", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2017-Jan", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2016-Dec", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2016-Nov", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2016-Oct", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2016-Sep", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() },
            { "Month": "2016-Aug", "PurchaseValue": this.GetRandomValue(), ConsumptionValue: this.GetRandomValue() }],
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0.3,
                "gridAlpha": 0,
                "position": "bottom",
                "title": "Amount"
            }],
            "graphs": [{
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Purchase Value",
                "type": "column",
                "valueField": "PurchaseValue",
                "lineColor": "#8B4513"
            }, {
                "valueAxis": "v1",
                "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                "fillAlphas": 0.8,
                "lineAlpha": 0.3,
                "title": "Consumption Value",
                "type": "column",
                "valueField": "ConsumptionValue",
                "lineColor": "#00BFFF"
            }],
            "categoryField": "Month",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "gridAlpha": 0,
                "position": "left",
                "labelRotation": 30
            },
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 10,
                "valueWidth": 50
            }

        });

    }



    ///Sales Purchase Trained Graph Function 
    public Pharmacy_MultiLine_RedZoneItems_SalesPurchaseGraph(target: string, data: any[], ItemNameArr: any[]) {
        ///Common Function to Get Graph Item Axix based on ItemList
        let graphs = this.Pharmacy_GetFormattedGraphs(ItemNameArr);

        let chart = this.AmCharts.makeChart(target, {
            "type": "serial",
            "theme": "light",
            "fontFamily": 'Open Sans',
            "color": ['#888888'],
            "dataProvider": data, ///assign data 
            "rotate": false,
            "valueAxes": [
                {
                    "position": "left",
                    "title": "Quantity"
                }],
            "graphs": graphs,

            "categoryAxis": {
                // ... other category axis settings
                "labelRotation": 30
            },
            "categoryField": "Date",
            "legend": {
                "horizontalGap": 5,
                "maxColumns": 4,
                "position": "bottom",
                "useGraphSettings": true,
                "markerSize": 15,
                "valueWidth": 25
            }
        });




    }
    public Pharmacy_GetFormattedGraphs(itemsArr: Array<string>): Array<any> {
        ///variable to return GraphItemList 
        let retGraphList = [];
        ////loop througth all ItemNameList and Push to retGraphList Variable
        for (var i = 0; i < itemsArr.length; i++) {
            let newGraph = {
                "valueAxis": "v1",
                "balloonText": itemsArr[i] + ":[[" + itemsArr[i] + "]]",
                "bullet": "diamond",
                "bulletSize": 15,
                "title": itemsArr[i],
                "type": "line",
                "valueField": itemsArr[i]
            }
            retGraphList.push(newGraph);
        }

        return retGraphList;
    }

    public RemoveIt() {

        ////modulename is kept as a parameter for some time. to show all the graphs from service only.
        ////remove it and let the modules draw their own graphs with own data.
        //public draw(moduleName: string, target: string, graphType: string) {

        //    if (graphType == "bar") {

        //        this.DrawBarchart(moduleName, target, null);

        //    }
        //    else if (graphType == "pie") {
        //        let graphData: Array<any> = [];
        //        let graphOpts: DanpheChartOptions;

        //        if (moduleName == "home") {
        //            graphData = this.GetPieData_Common();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }
        //        else if (moduleName == "lab") {
        //            graphData = this.GetPieData_Lab();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }
        //        else if (moduleName == "radilogy") {
        //            graphData = this.GetPieData_Radiology();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }
        //        else if (moduleName == "billing") {
        //            graphData = this.GetPieData_Billing();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }
        //        else if (moduleName == "patient") {
        //            graphData = this.GetPieData_Patient();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }
        //        else if (moduleName == "appointment") {
        //            graphData = this.GetPieData_Appointnment();
        //            graphOpts = { fieldX: "department", fieldY: "apptCount" };
        //        }

        //        this.DrawPiechart(target, graphData, graphOpts);
        //    }

        //}

        //public DrawBarchart(moduleName: string, target: string, data: any) {
        //    let graphData: Array<any> = [];
        //    let graphOptions: any;
        //    if (moduleName == "home") {
        //        graphData = this.GetBarData_Common();
        //    }
        //    else if (moduleName == "lab") {
        //        graphData = this.GetBarData_Lab();
        //        graphOptions = this.GetBarProperties_Lab(graphData);
        //    }
        //    else if (moduleName == "radilogy") {
        //        graphData = this.GetBarData_Radiology();
        //    }
        //    else if (moduleName == "billing") {
        //        graphData = this.GetBarData_Billing();
        //    }
        //    else if (moduleName == "patient") {
        //        graphData = this.GetBarData_Patient();
        //    }
        //    else if (moduleName == "appointment") {
        //        graphData = this.GetBarData_Appointnment();
        //    }

        //    let retChart = this.AmCharts.makeChart(target, graphOptions);
        //    this.setAutoColorsToColumns(retChart);

        //}

        //public DrawPiechart(target: string, data: any, options: DanpheChartOptions) {
        //}
    }


}


export class DanpheChartOptions {
    fieldX: string = null;
    fieldY: string = null;
}

