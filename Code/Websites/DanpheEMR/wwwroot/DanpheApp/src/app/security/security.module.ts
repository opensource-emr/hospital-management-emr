import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { SecurityBLService } from './shared/security.bl.service';
import { SecurityDLService } from './shared/security.dl.service';
import { SecurityService } from './shared/security.service';
import { AuthGuardService } from './shared/auth-guard.service';

@NgModule({
    providers: [SecurityService, SecurityBLService, SecurityDLService,AuthGuardService],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        HttpClientModule
    ],
    declarations: [
    ],
    bootstrap: []
})
export class SecurityModule { }