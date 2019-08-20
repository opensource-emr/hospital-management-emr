import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {

  // A BehaviorSubject is an Observable with a default value
  public isLoading = new BehaviorSubject(false);
  constructor() {}
}