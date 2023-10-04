import { Injectable, Directive } from '@angular/core';

//sud:5May'18--BackButtonDisable is not working as expected, correct and implement later
@Injectable()
export class BackButtonDisable {
    public _hash: any = "!";
    public _oldhash: any = "!";
    HashChange() {
        this._hash = "!";
        this._oldhash = window.location.hash.replace('#/', '/');
        this._hash = this._oldhash.replace('#', '');
        this._hash = this._oldhash.replace('!', ' ');
        if (window.location.hash !== this._hash) {
            window.location.hash = this._hash;
        }
    }
    constructor() {
    }

    public DisableBackButton() {
        window.location.href += "#";
        window.onhashchange = this.HashChange;
        window.setTimeout(function () {
            window.location.href += "!";
        }, 50);
        window.document.body.onkeydown = function (e: any) {
            var elm = e.target.nodeName.toLowerCase();
            if (e.which === 8 && (elm !== 'input' && elm !== 'textarea')) {
                e.preventDefault();
            }
            // stopping event bubbling up the DOM tree..
            e.stopPropagation();

        }
    }
}