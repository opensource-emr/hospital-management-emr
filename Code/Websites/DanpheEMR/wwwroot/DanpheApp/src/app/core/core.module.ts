import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { CoreDLService } from './shared/core.dl.service';
import { CoreBLService } from './shared/core.bl.service';
import { CoreService } from './shared/core.service';
//import { BackButtonDisable } from './shared/backbutton-disable.service'

@NgModule({
    providers: [CoreDLService, CoreBLService, CoreService],
    imports: [
        CommonModule,
        //BackButtonDisable,
        HttpClientModule
    ],
    declarations: [
       
    ],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class CoreModule {

}