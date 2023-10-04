import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { SharedModule } from '../../shared/shared.module';
import { SettingsSharedModule } from '../settings-shared.module';
import { PriceCategoryListComponent } from './price-category-list/price-category-list.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { AddPriceCategoryComponent } from './add-price-category/add-price-category.component';


export const priceCategorySettingsRoutes =
    [
        {
            path: '', component: PriceCategoryListComponent
        }
    ]


@NgModule({
    providers: [

        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        RouterModule.forChild(priceCategorySettingsRoutes),
        SettingsSharedModule,
        DanpheAutoCompleteModule

    ],
    declarations: [
        PriceCategoryListComponent,
        AddPriceCategoryComponent

    ],
    bootstrap: []
})

export class PriceCategoryModule {

}
