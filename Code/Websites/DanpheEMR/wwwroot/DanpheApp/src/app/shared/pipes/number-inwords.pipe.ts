import { Pipe, PipeTransform } from '@angular/core';
/*
Converts amount in number to words.
Optionally can add also the currency values eg: dollars, rupees etc [Commented out for now]
created by: sudarshan:31dec'16
Remarks: 
*/
@Pipe({ name: 'NumberInWords' })
export class NumberInWordsPipe implements PipeTransform {
    transform(value: number, currencyArgs: any[]): string {
        //return empty if the value is null or empty..
        if (value)
            return this.GetValue(value, currencyArgs);
        else
            return "";

    }

    GetValue(ipNumber, currencyArgs) {

        var th = ['', 'thousand', 'million', 'billion', 'trillion'];
        var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        return toWords(ipNumber);

        function toWords(s) {
            s = s.toString();
            s = s.replace(/[\, ]/g, '');
            if (s != parseFloat(s)) return 'not a number';
            let x: number = s.indexOf('.');
            if (x == -1) x = s.length;
            if (x > 15) return 'too big';
            var n = s.split('');
            var str = '';
            var sk = 0;
            for (var i = 0; i < x; i++) {
                //Ajay19Feb'19 for less negative values getting minus
                if (n[i] == '-') {
                    str += 'minus ';
                } else {
                    if ((x - i) % 3 == 2) {
                        if (n[i] == '1') {
                            str += tn[Number(n[i + 1])] + ' ';
                            i++;
                            sk = 1;
                        }
                        else if (n[i] != 0) {
                            str += tw[n[i] - 2] + ' ';
                            sk = 1;
                        }
                    }
                    else if (n[i] != 0) {
                        str += dg[n[i]] + ' ';
                        if ((x - i) % 3 == 0) str += 'hundred ';
                        sk = 1;
                    }


                    if ((x - i) % 3 == 1) {
                        if (sk) str += th[(x - i - 1) / 3] + ' ';
                        sk = 0;
                    }
                }
            }

            //if (currencyArgs && currencyArgs.length > 0) {
            //    str += ' ' + currencyArgs[0]+' ';
            //}

            if (x != s.length) {
                var y = s.length;
                str += 'point ';
                // str += 'point ';
                for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';

                //if (currencyArgs && currencyArgs.length > 0) {
                //    str += ' ' + currencyArgs[1];
                //}

            }
            //ajay 30jan'19 removed point zero zero at the end of string
            if (str.endsWith('point zero zero ')) {
                str = str.replace('point zero zero ', ' ');
            }
            return str.replace(/\s+/g, ' ');
        }

    }
}
