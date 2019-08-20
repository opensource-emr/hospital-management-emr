import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailEndPoint } from './email.endpoint';

@Injectable()
export class EmailService {

    public _Id: number = null;

    get Id(): number {
        return this._Id;
    }
    set Id(Id: number) {
        this._Id = Id;
    }

    constructor(public emailEndPoint: EmailEndPoint) {

    }

    public SendEmail(content) {

        let data = JSON.stringify(content);
        return this.emailEndPoint.SendEmail(content)
            .map(res => { return res })
    }

}