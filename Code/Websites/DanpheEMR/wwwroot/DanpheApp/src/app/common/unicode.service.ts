import { Injectable } from '@angular/core';

declare var pramukhIME: any;

@Injectable()
export class UnicodeService {

    constructor() {
        pramukhIME.addKeyboard("PramukhIndic");
        pramukhIME.enable();
    }  

    translate(language) {

        if (language == 'english')
            pramukhIME.setLanguage(language, "pramukhime");
        else
            pramukhIME.setLanguage(language, "pramukhindic");

    }

}
