// Details about this component:
// This component used for change date english to nepali or nepali to english.
// This component needed 2 inputs array of data and coloumn name which columns need to convert date format.
// mostly this component needed for html table where user easily change date format for all values of date coloumns.
import { Directive, ElementRef, HostListener, Renderer2, Input, HostBinding, ChangeDetectorRef, Component } from "@angular/core";
import { CoreService } from "../core/shared/core.service";
import { NepaliCalendarService } from "./calendar/np/nepali-calendar.service";
import * as moment from 'moment/moment';
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
        if (this.dataArray.length>0 && this.dateColumn) {
            this.currentDateFormatValue = this.coreService.DatePreference;
            if (this.currentDateFormatValue == "en") {                     
                this.dataArray.forEach(b=>{
                    b[this.dateColumn] =  moment(b[this.dateColumn]).format('YYYY-MM-DD');
                })
            }
            else{
                this.dataArray.forEach(b=>{
                    b[this.dateColumn] =  this.nepaliCalendarServ.ConvertEngToNepDateString(b[this.dateColumn]);
                })
            }
        }
      }
    
    toggleSort: boolean = false;
    public currentDateFormatValue: string = "en";//en,np
    public currDateFormatLabel: string = "AD";
    public actionValue:string = "YYYY-MM-DD";
    public showAdBsButton:boolean =true;
    constructor(private coreService : CoreService,public nepaliCalendarServ: NepaliCalendarService) {
        this.showAdBsButton=this.coreService.showCalendarADBSButton;
    }

    ngOnInit() {
        // Here initial value will be set from the global service.
        this.currentDateFormatValue = this.coreService.DatePreference;
        this.currDateFormatLabel = this.currentDateFormatValue == "en" ? "AD" : "BS";

    }


    ChangeDate() {
        if (this.dataArray && this.dateColumn) {
            this.dataArray.forEach(a => {
                if (this.currentDateFormatValue == "en") {                     
                    a[this.dateColumn] = this.nepaliCalendarServ.ConvertEngToNepaliFormatted(a[this.dateColumn], this.actionValue);  
                }
                else {                    
                    a[this.dateColumn] = this.nepaliCalendarServ.ConvertNepStringToEngString(a[this.dateColumn]);          
                }
            });
            this.currentDateFormatValue = this.currentDateFormatValue == "en" ? "np" : "en";
            this.currDateFormatLabel = this.currentDateFormatValue == "en" ? "AD" : "BS";
        }
    } 

}



