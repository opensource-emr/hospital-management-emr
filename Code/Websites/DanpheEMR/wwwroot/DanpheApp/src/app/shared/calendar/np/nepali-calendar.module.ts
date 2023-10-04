import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { BrowserModule } from '@angular/platform-browser';
import { NepaliCalendarService } from './nepali-calendar.service';
import { NepaliCalendarComponent } from './nepali-calendar.component';
import { CommonModule } from '@angular/common';
import { NepaliCalendarBoardComponent } from '../np-calendar-board/NepaliCalendarBoard';

@NgModule({
    providers: [NepaliCalendarService],
    imports: [FormsModule, CommonModule],
    declarations: [
      NepaliCalendarComponent, NepaliCalendarBoardComponent],
    exports: [
      NepaliCalendarComponent, NepaliCalendarBoardComponent
    ]
})
export class NepaliCalendarModule {

}
