// Details about this component:
// This component used for change date english to nepali or nepali to english.
// This component needed 2 inputs array of data and coloumn name which columns need to convert date format.
// mostly this component needed for html table where user easily change date format for all values of date coloumns.
import { Component, Input } from "@angular/core";
import * as moment from 'moment/moment';
import { CoreService } from "../core/shared/core.service";
import { NepaliCalendarService } from "./calendar/np/nepali-calendar.service";
import { ENUM_AD_BS, ENUM_CalanderType, ENUM_DateFormats } from "./shared-enums";
@Component({
    selector: 'danphe-date-change',
    template: `<button *ngIf="showAdBsButton" class="no-print hidden-print" (click)="ChangeDate()" title="Click to change Date Format." 
    style="cursor: pointer;
    background: #9fdf7e;
    color: white;
    border: none;
    border: 1px solid;">
               {{currDateFormatLabel}}               
               <i class="fa fa-refresh" style="margin-left:5px;"></i>
               </button>`
})

export class DanpheDateChangeComponent {
    @Input('datecolumn') dateColumn: string = null;
    dataArray = [];
    @Input("dataArr")
    set set_dataArray(val) {
        this.dataArray = val;
        if (this.dataArray && this.dataArray.length > 0 && this.dateColumn) {
            this.currentDateFormatValue = this.coreService.DatePreference;
            if (this.currentDateFormatValue === ENUM_CalanderType.EN) {
                this.dataArray.forEach(b => {
                    b[this.dateColumn] = moment(b[this.dateColumn]).format(ENUM_DateFormats.Year_Month_Day);
                })
            }
            else {
                this.dataArray.forEach(b => {
                    b[this.dateColumn] = b[this.dateColumn] ? this.nepaliCalendarServ.ConvertEngToNepDateString(b[this.dateColumn]) : null;
                })
            }
        }
    }

    toggleSort: boolean = false;
    public currentDateFormatValue: string = ENUM_CalanderType.EN;//en,np
    public currDateFormatLabel: string = ENUM_AD_BS.AD;
    public actionValue: string = ENUM_DateFormats.Year_Month_Day;
    public showAdBsButton: boolean = true;
    constructor(private coreService: CoreService, public nepaliCalendarServ: NepaliCalendarService) {
        this.showAdBsButton = this.coreService.showCalendarADBSButton;
    }

    ngOnInit() {
        // Here initial value will be set from the global service.
        this.currentDateFormatValue = this.coreService.DatePreference;
        this.currDateFormatLabel = this.currentDateFormatValue === ENUM_CalanderType.EN ? ENUM_AD_BS.AD : ENUM_AD_BS.BS;

    }


    ChangeDate() {
        if (this.dataArray && this.dateColumn) {
            this.dataArray.forEach(a => {
                if (this.currentDateFormatValue === ENUM_CalanderType.EN) {
                    a[this.dateColumn] = a[this.dateColumn] ? this.nepaliCalendarServ.ConvertEngToNepaliFormatted(a[this.dateColumn], this.actionValue) : null;
                }
                else {
                    a[this.dateColumn] = a[this.dateColumn] ? this.nepaliCalendarServ.ConvertNepStringToEngString(a[this.dateColumn]) : null;
                }
            });
            this.currentDateFormatValue = this.currentDateFormatValue === ENUM_CalanderType.EN ? ENUM_CalanderType.NP : ENUM_CalanderType.EN;
            this.currDateFormatLabel = this.currentDateFormatValue === ENUM_CalanderType.EN ? ENUM_AD_BS.AD : ENUM_AD_BS.BS;
        }
    }

}



