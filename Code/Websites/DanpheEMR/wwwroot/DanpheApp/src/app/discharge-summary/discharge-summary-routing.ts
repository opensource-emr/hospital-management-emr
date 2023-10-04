import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                
          }, { path: "**", component: PageNotFound },
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class DischargeSummaryRoutingModule { }
