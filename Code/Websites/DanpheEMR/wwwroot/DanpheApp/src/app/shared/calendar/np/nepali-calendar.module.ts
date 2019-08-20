import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { BrowserModule } from '@angular/platform-browser';
import { NepaliCalendarService } from './nepali-calendar.service';
import { NepaliCalendarComponent } from './nepali-calendar.component';
import { CommonModule } from '@angular/common';

@NgModule({
    providers: [NepaliCalendarService],
    imports: [FormsModule, CommonModule],
    declarations: [
        NepaliCalendarComponent],
    exports: [
        NepaliCalendarComponent
    ]
})
export class NepaliCalendarModule {

}
