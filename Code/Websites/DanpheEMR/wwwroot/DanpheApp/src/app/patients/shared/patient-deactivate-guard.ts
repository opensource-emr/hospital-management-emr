import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { PatientService } from './patient.service';

import { IRouteGuard } from '../../shared/route-guard.interface';

export class PatientDeactivateGuard implements CanDeactivate<IRouteGuard> {

    canDeactivate(target: IRouteGuard) {
        if (!target.CanRouteLeave()) {
            return window.confirm('This page contains unsaved changes. Do you want to continue ? Changes will be discarded.');
        }
        return true;
    }
}