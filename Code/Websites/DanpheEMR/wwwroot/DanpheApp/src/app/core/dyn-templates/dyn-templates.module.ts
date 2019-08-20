import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DynamicTemplateEditComponent } from "./settings/dyn-template-edit.component"
import { QuestionAddComponent } from "./settings/question-add.component";
import { QuestionEditComponent } from "./settings/question-edit.component";
import { JsonTableComponent } from './controls/json-table.component';
import { QuestionComponent } from './controls/question.component';
import { QuestionHrcComponent } from './controls/question-hrc.component';
import { DynamicTemplateService } from './shared/dynamic-template-service';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';

@NgModule({
    providers: [DynamicTemplateService],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        //Ng2AutoCompleteModule
        DanpheAutoCompleteModule
    ],
    declarations: [
        QuestionEditComponent,
        QuestionAddComponent,
        DynamicTemplateEditComponent,
        JsonTableComponent,
        QuestionComponent,
        QuestionHrcComponent
    ],
    exports: [
        QuestionEditComponent,
        QuestionAddComponent,
        DynamicTemplateEditComponent,
        JsonTableComponent,
        QuestionComponent,
        QuestionHrcComponent
    ],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class DynTemplateModule {

}