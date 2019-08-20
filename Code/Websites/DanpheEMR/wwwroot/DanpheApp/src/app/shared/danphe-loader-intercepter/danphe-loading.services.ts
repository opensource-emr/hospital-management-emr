
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpResponseBase } from '@angular/common/http';
import 'rxjs/add/observable/throw';
import { LoadingScreenService } from './danphe-loading-screen.services';

@Injectable()
export class DanpheLoadingInterceptor implements HttpInterceptor {

  private requests: HttpRequest<any>[] = [];
  //sud:23Jul'19--made skippUrls as array since multiple urls needed to be skipped..

  skippUrls = ['/api/Notification?reqType=GetData-For-NotificationDropDown'
    , '/api/BillInsurance?reqType=all-patients-for-insurance'];

  constructor(private loaderService: LoadingScreenService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.requests.push(req);

    //api/BillInsurance?reqType=all-patients-for-insurance&searchText=sud
    let urlWithParam = req.url;
    //if & is found in url then substring the url upto &, else take only url (eg: for notification dropdown)
    let urlOnly = urlWithParam.indexOf('&') > -1 ? urlWithParam.substr(0, urlWithParam.indexOf('&')) : urlWithParam;
    
    if (this.skippUrls.find(a => a == urlOnly))   // to exclude desired urls from interceptor.
    {
      this.loaderService.isLoading.next(false);
    } else {
      this.loaderService.isLoading.next(true);
    }
    //  create a new observable which return instead of the original
    return Observable.create(observer => {
      // And subscribe to the original observable to ensure the HttpRequest is made
      const subscription = next.handle(req).subscribe(event => {
        if (event instanceof HttpResponse) {
          this.removeRequest(req);
          observer.next(event);
        }
      },
        err => { this.removeRequest(req); observer.error(err); },
        () => { this.removeRequest(req); observer.complete(); });
      // return teardown logic in case of cancelled requests
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });

  }

  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    this.loaderService.isLoading.next(this.requests.length > 0);
  }
}
