export class NepaliDate {
    public Day: number = null;
    public Month: number = null;
    public Year: number = null;
    public Hours: number = null;
    public Minutes: number = null;
    public AMPM: string = "";
    public npDate: string = "";
}

export class NepaliMonth {
    monthName: string;//बैशाख,जेष्ठ
    monthNumber: number;//1,2,3,4,
    monthDisplayNumber: string;//"01", "02"
    isEnabled: boolean = true;
    EngmonthSeq:number;
    static GetNepaliMonths(): Array<NepaliMonth> {
        let nepMonths: Array<NepaliMonth> = new Array<NepaliMonth>();
        nepMonths.push({ monthNumber: 1, monthDisplayNumber: "01", monthName: "बैशाख", isEnabled: true,EngmonthSeq: 5});
        nepMonths.push({ monthNumber: 2, monthDisplayNumber: "02", monthName: "जेष्ठ", isEnabled: true,EngmonthSeq:6 });
        nepMonths.push({ monthNumber: 3, monthDisplayNumber: "03", monthName: "असार", isEnabled: true ,EngmonthSeq:7});
        nepMonths.push({ monthNumber: 4, monthDisplayNumber: "04", monthName: "श्रावन", isEnabled: true ,EngmonthSeq:8});
        nepMonths.push({ monthNumber: 5, monthDisplayNumber: "05", monthName: "भाद्र", isEnabled: true ,EngmonthSeq:9});
        nepMonths.push({ monthNumber: 6, monthDisplayNumber: "06", monthName: "असोज", isEnabled: true ,EngmonthSeq:10});
        nepMonths.push({ monthNumber: 7, monthDisplayNumber: "07", monthName: "कार्तिक", isEnabled: true,EngmonthSeq:11 });
        nepMonths.push({ monthNumber: 8, monthDisplayNumber: "08", monthName: "मङ्सिर", isEnabled: true ,EngmonthSeq:12});
        nepMonths.push({ monthNumber: 9, monthDisplayNumber: "09", monthName: "पौष", isEnabled: true ,EngmonthSeq:1});
        nepMonths.push({ monthNumber: 10, monthDisplayNumber: "10", monthName: "माघ", isEnabled: true ,EngmonthSeq:2});
        nepMonths.push({ monthNumber: 11, monthDisplayNumber: "11", monthName: "फाल्गुन", isEnabled: true ,EngmonthSeq:3});
        nepMonths.push({ monthNumber: 12, monthDisplayNumber: "12", monthName: "चैत्र", isEnabled: true ,EngmonthSeq:4});
        return nepMonths;
    }
}

export class NepaliYear {
    //in english language: eg: 2000, 2001, 2002, etc..
    yearNumber: number;
    //in nepali language: eg: "२०००","२०८०", etc..
    yearNumberNep: string;

    isEnabled: boolean = true;

    //return all nepali years between min and max years. params are optional
    static GetAllNepaliYears(): Array<NepaliYear> {
        let nepYears: Array<NepaliYear> = new Array<NepaliYear>();
        //all from 1957 BS to 2080BS.
        //nepYears.push({ yearNumber: 1950, yearNumberNep: "१९५०", isEnabled: true });
        //nepYears.push({ yearNumber: 1951, yearNumberNep: "१९५१", isEnabled: true });
        //nepYears.push({ yearNumber: 1952, yearNumberNep: "१९५२", isEnabled: true });
        //nepYears.push({ yearNumber: 1953, yearNumberNep: "१९५३", isEnabled: true });
        //nepYears.push({ yearNumber: 1954, yearNumberNep: "१९५४", isEnabled: true });
        //nepYears.push({ yearNumber: 1955, yearNumberNep: "१९५५", isEnabled: true });
        //nepYears.push({ yearNumber: 1956, yearNumberNep: "१९५६", isEnabled: true });
        //nepYears.push({ yearNumber: 1957, yearNumberNep: "१९५७", isEnabled: true });
        nepYears.push({ yearNumber: 1958, yearNumberNep: "१९५८", isEnabled: true });
        nepYears.push({ yearNumber: 1959, yearNumberNep: "१९५९", isEnabled: true });
        nepYears.push({ yearNumber: 1960, yearNumberNep: "१९६०", isEnabled: true });
        nepYears.push({ yearNumber: 1961, yearNumberNep: "१९६१", isEnabled: true });
        nepYears.push({ yearNumber: 1962, yearNumberNep: "१९६२", isEnabled: true });
        nepYears.push({ yearNumber: 1963, yearNumberNep: "१९६३", isEnabled: true });
        nepYears.push({ yearNumber: 1964, yearNumberNep: "१९६४", isEnabled: true });
        nepYears.push({ yearNumber: 1965, yearNumberNep: "१९६५", isEnabled: true });
        nepYears.push({ yearNumber: 1966, yearNumberNep: "१९६६", isEnabled: true });
        nepYears.push({ yearNumber: 1967, yearNumberNep: "१९६७", isEnabled: true });
        nepYears.push({ yearNumber: 1968, yearNumberNep: "१९६८", isEnabled: true });
        nepYears.push({ yearNumber: 1969, yearNumberNep: "१९६९", isEnabled: true });
        nepYears.push({ yearNumber: 1970, yearNumberNep: "१९७०", isEnabled: true });
        nepYears.push({ yearNumber: 1971, yearNumberNep: "१९७१", isEnabled: true });
        nepYears.push({ yearNumber: 1972, yearNumberNep: "१९७२", isEnabled: true });
        nepYears.push({ yearNumber: 1973, yearNumberNep: "१९७३", isEnabled: true });
        nepYears.push({ yearNumber: 1974, yearNumberNep: "१९७४", isEnabled: true });
        nepYears.push({ yearNumber: 1975, yearNumberNep: "१९७५", isEnabled: true });
        nepYears.push({ yearNumber: 1976, yearNumberNep: "१९७६", isEnabled: true });
        nepYears.push({ yearNumber: 1977, yearNumberNep: "१९७७", isEnabled: true });
        nepYears.push({ yearNumber: 1978, yearNumberNep: "१९७८", isEnabled: true });
        nepYears.push({ yearNumber: 1979, yearNumberNep: "१९७९", isEnabled: true });
        nepYears.push({ yearNumber: 1980, yearNumberNep: "१९८०", isEnabled: true });
        nepYears.push({ yearNumber: 1981, yearNumberNep: "१९८१", isEnabled: true });
        nepYears.push({ yearNumber: 1982, yearNumberNep: "१९८२", isEnabled: true });
        nepYears.push({ yearNumber: 1983, yearNumberNep: "१९८३", isEnabled: true });
        nepYears.push({ yearNumber: 1984, yearNumberNep: "१९८४", isEnabled: true });
        nepYears.push({ yearNumber: 1985, yearNumberNep: "१९८५", isEnabled: true });
        nepYears.push({ yearNumber: 1986, yearNumberNep: "१९८६", isEnabled: true });
        nepYears.push({ yearNumber: 1987, yearNumberNep: "१९८७", isEnabled: true });
        nepYears.push({ yearNumber: 1988, yearNumberNep: "१९८८", isEnabled: true });
        nepYears.push({ yearNumber: 1989, yearNumberNep: "१९८९", isEnabled: true });
        nepYears.push({ yearNumber: 1990, yearNumberNep: "१९९०", isEnabled: true });
        nepYears.push({ yearNumber: 1991, yearNumberNep: "१९९१", isEnabled: true });
        nepYears.push({ yearNumber: 1992, yearNumberNep: "१९९२", isEnabled: true });
        nepYears.push({ yearNumber: 1993, yearNumberNep: "१९९३", isEnabled: true });
        nepYears.push({ yearNumber: 1994, yearNumberNep: "१९९४", isEnabled: true });
        nepYears.push({ yearNumber: 1995, yearNumberNep: "१९९५", isEnabled: true });
        nepYears.push({ yearNumber: 1996, yearNumberNep: "१९९६", isEnabled: true });
        nepYears.push({ yearNumber: 1997, yearNumberNep: "१९९७", isEnabled: true });
        nepYears.push({ yearNumber: 1998, yearNumberNep: "१९९८", isEnabled: true });
        nepYears.push({ yearNumber: 1999, yearNumberNep: "१९९९", isEnabled: true });
        ///actual mapping data in nepalicalendar service for years above are not verified: sud
        nepYears.push({ yearNumber: 2000, yearNumberNep: "२०००", isEnabled: true });
        nepYears.push({ yearNumber: 2001, yearNumberNep: "२००१", isEnabled: true });
        nepYears.push({ yearNumber: 2002, yearNumberNep: "२००२", isEnabled: true });
        nepYears.push({ yearNumber: 2003, yearNumberNep: "२००३", isEnabled: true });
        nepYears.push({ yearNumber: 2004, yearNumberNep: "२००४", isEnabled: true });
        nepYears.push({ yearNumber: 2005, yearNumberNep: "२००५", isEnabled: true });
        nepYears.push({ yearNumber: 2006, yearNumberNep: "२००६", isEnabled: true });
        nepYears.push({ yearNumber: 2007, yearNumberNep: "२००७", isEnabled: true });
        nepYears.push({ yearNumber: 2008, yearNumberNep: "२००८", isEnabled: true });
        nepYears.push({ yearNumber: 2009, yearNumberNep: "२००९", isEnabled: true });
        nepYears.push({ yearNumber: 2010, yearNumberNep: "२०१०", isEnabled: true });
        nepYears.push({ yearNumber: 2011, yearNumberNep: "२०११", isEnabled: true });
        nepYears.push({ yearNumber: 2012, yearNumberNep: "२०१२", isEnabled: true });
        nepYears.push({ yearNumber: 2013, yearNumberNep: "२०१३", isEnabled: true });
        nepYears.push({ yearNumber: 2014, yearNumberNep: "२०१४", isEnabled: true });
        nepYears.push({ yearNumber: 2015, yearNumberNep: "२०१५", isEnabled: true });
        nepYears.push({ yearNumber: 2016, yearNumberNep: "२०१६", isEnabled: true });
        nepYears.push({ yearNumber: 2017, yearNumberNep: "२०१७", isEnabled: true });
        nepYears.push({ yearNumber: 2018, yearNumberNep: "२०१८", isEnabled: true });
        nepYears.push({ yearNumber: 2019, yearNumberNep: "२०१९", isEnabled: true });
        nepYears.push({ yearNumber: 2020, yearNumberNep: "२०२०", isEnabled: true });
        nepYears.push({ yearNumber: 2021, yearNumberNep: "२०२१", isEnabled: true });
        nepYears.push({ yearNumber: 2022, yearNumberNep: "२०२२", isEnabled: true });
        nepYears.push({ yearNumber: 2023, yearNumberNep: "२०२३", isEnabled: true });
        nepYears.push({ yearNumber: 2024, yearNumberNep: "२०२४", isEnabled: true });
        nepYears.push({ yearNumber: 2025, yearNumberNep: "२०२५", isEnabled: true });
        nepYears.push({ yearNumber: 2026, yearNumberNep: "२०२६", isEnabled: true });
        nepYears.push({ yearNumber: 2027, yearNumberNep: "२०२७", isEnabled: true });
        nepYears.push({ yearNumber: 2028, yearNumberNep: "२०२८", isEnabled: true });
        nepYears.push({ yearNumber: 2029, yearNumberNep: "२०२९", isEnabled: true });
        nepYears.push({ yearNumber: 2030, yearNumberNep: "२०३०", isEnabled: true });
        nepYears.push({ yearNumber: 2031, yearNumberNep: "२०३१", isEnabled: true });
        nepYears.push({ yearNumber: 2032, yearNumberNep: "२०३२", isEnabled: true });
        nepYears.push({ yearNumber: 2033, yearNumberNep: "२०३३", isEnabled: true });
        nepYears.push({ yearNumber: 2034, yearNumberNep: "२०३४", isEnabled: true });
        nepYears.push({ yearNumber: 2035, yearNumberNep: "२०३५", isEnabled: true });
        nepYears.push({ yearNumber: 2036, yearNumberNep: "२०३६", isEnabled: true });
        nepYears.push({ yearNumber: 2037, yearNumberNep: "२०३७", isEnabled: true });
        nepYears.push({ yearNumber: 2038, yearNumberNep: "२०३८", isEnabled: true });
        nepYears.push({ yearNumber: 2039, yearNumberNep: "२०३९", isEnabled: true });
        nepYears.push({ yearNumber: 2040, yearNumberNep: "२०४०", isEnabled: true });
        nepYears.push({ yearNumber: 2041, yearNumberNep: "२०४१", isEnabled: true });
        nepYears.push({ yearNumber: 2042, yearNumberNep: "२०४२", isEnabled: true });
        nepYears.push({ yearNumber: 2043, yearNumberNep: "२०४३", isEnabled: true });
        nepYears.push({ yearNumber: 2044, yearNumberNep: "२०४४", isEnabled: true });
        nepYears.push({ yearNumber: 2045, yearNumberNep: "२०४५", isEnabled: true });
        nepYears.push({ yearNumber: 2046, yearNumberNep: "२०४६", isEnabled: true });
        nepYears.push({ yearNumber: 2047, yearNumberNep: "२०४७", isEnabled: true });
        nepYears.push({ yearNumber: 2048, yearNumberNep: "२०४८", isEnabled: true });
        nepYears.push({ yearNumber: 2049, yearNumberNep: "२०४९", isEnabled: true });
        nepYears.push({ yearNumber: 2050, yearNumberNep: "२०५०", isEnabled: true });
        nepYears.push({ yearNumber: 2051, yearNumberNep: "२०५१", isEnabled: true });
        nepYears.push({ yearNumber: 2052, yearNumberNep: "२०५२", isEnabled: true });
        nepYears.push({ yearNumber: 2053, yearNumberNep: "२०५३", isEnabled: true });
        nepYears.push({ yearNumber: 2054, yearNumberNep: "२०५४", isEnabled: true });
        nepYears.push({ yearNumber: 2055, yearNumberNep: "२०५५", isEnabled: true });
        nepYears.push({ yearNumber: 2056, yearNumberNep: "२०५६", isEnabled: true });
        nepYears.push({ yearNumber: 2057, yearNumberNep: "२०५७", isEnabled: true });
        nepYears.push({ yearNumber: 2058, yearNumberNep: "२०५८", isEnabled: true });
        nepYears.push({ yearNumber: 2059, yearNumberNep: "२०५९", isEnabled: true });
        nepYears.push({ yearNumber: 2060, yearNumberNep: "२०६०", isEnabled: true });
        nepYears.push({ yearNumber: 2061, yearNumberNep: "२०६१", isEnabled: true });
        nepYears.push({ yearNumber: 2062, yearNumberNep: "२०६२", isEnabled: true });
        nepYears.push({ yearNumber: 2063, yearNumberNep: "२०६३", isEnabled: true });
        nepYears.push({ yearNumber: 2064, yearNumberNep: "२०६४", isEnabled: true });
        nepYears.push({ yearNumber: 2065, yearNumberNep: "२०६५", isEnabled: true });
        nepYears.push({ yearNumber: 2066, yearNumberNep: "२०६६", isEnabled: true });
        nepYears.push({ yearNumber: 2067, yearNumberNep: "२०६७", isEnabled: true });
        nepYears.push({ yearNumber: 2068, yearNumberNep: "२०६८", isEnabled: true });
        nepYears.push({ yearNumber: 2069, yearNumberNep: "२०६९", isEnabled: true });
        nepYears.push({ yearNumber: 2070, yearNumberNep: "२०७०", isEnabled: true });
        nepYears.push({ yearNumber: 2071, yearNumberNep: "२०७१", isEnabled: true });
        nepYears.push({ yearNumber: 2072, yearNumberNep: "२०७२", isEnabled: true });
        nepYears.push({ yearNumber: 2073, yearNumberNep: "२०७३", isEnabled: true });
        nepYears.push({ yearNumber: 2074, yearNumberNep: "२०७४", isEnabled: true });
        nepYears.push({ yearNumber: 2075, yearNumberNep: "२०७५", isEnabled: true });
        nepYears.push({ yearNumber: 2076, yearNumberNep: "२०७६", isEnabled: true });
        nepYears.push({ yearNumber: 2077, yearNumberNep: "२०७७", isEnabled: true });
        nepYears.push({ yearNumber: 2078, yearNumberNep: "२०७८", isEnabled: true });
        nepYears.push({ yearNumber: 2079, yearNumberNep: "२०७९", isEnabled: true });
        nepYears.push({ yearNumber: 2080, yearNumberNep: "२०८०", isEnabled: true });
        nepYears.push({ yearNumber: 2081, yearNumberNep: "२०८१", isEnabled: true });
        nepYears.push({ yearNumber: 2082, yearNumberNep: "२०८२", isEnabled: true });
        nepYears.push({ yearNumber: 2083, yearNumberNep: "२०८३", isEnabled: true });
        nepYears.push({ yearNumber: 2084, yearNumberNep: "२०८४", isEnabled: true });
        nepYears.push({ yearNumber: 2085, yearNumberNep: "२०८५", isEnabled: true });
        nepYears.push({ yearNumber: 2086, yearNumberNep: "२०८६", isEnabled: true });
        nepYears.push({ yearNumber: 2087, yearNumberNep: "२०८७", isEnabled: true });
        nepYears.push({ yearNumber: 2088, yearNumberNep: "२०८८", isEnabled: true });
        nepYears.push({ yearNumber: 2089, yearNumberNep: "२०८९", isEnabled: true });
        nepYears.push({ yearNumber: 2090, yearNumberNep: "२०९०", isEnabled: true });

        return nepYears;
    }

}

export class NepaliDay {
    //in english
    dayNumber: number;
    //in nepali eg: "१","२","३"
    dayNumberNep: string;

    isEnabled: boolean = true;

    //maximum days in nepali months are 32.
    static GetAllNepaliDays(): Array<NepaliDay> {
        let nepDays: Array<NepaliDay> = new Array<NepaliDay>();
        //all from 1 to 32 १२३४५६७८९०
        nepDays.push({ dayNumber: 1, dayNumberNep: "१", isEnabled: true });
        nepDays.push({ dayNumber: 2, dayNumberNep: "२", isEnabled: true });
        nepDays.push({ dayNumber: 3, dayNumberNep: "३", isEnabled: true });
        nepDays.push({ dayNumber: 4, dayNumberNep: "४", isEnabled: true });
        nepDays.push({ dayNumber: 5, dayNumberNep: "५", isEnabled: true });
        nepDays.push({ dayNumber: 6, dayNumberNep: "६", isEnabled: true });
        nepDays.push({ dayNumber: 7, dayNumberNep: "७", isEnabled: true });
        nepDays.push({ dayNumber: 8, dayNumberNep: "८", isEnabled: true });
        nepDays.push({ dayNumber: 9, dayNumberNep: "९", isEnabled: true });
        nepDays.push({ dayNumber: 10, dayNumberNep: "१०", isEnabled: true });
        nepDays.push({ dayNumber: 11, dayNumberNep: "११", isEnabled: true });
        nepDays.push({ dayNumber: 12, dayNumberNep: "१२", isEnabled: true });
        nepDays.push({ dayNumber: 13, dayNumberNep: "१३", isEnabled: true });
        nepDays.push({ dayNumber: 14, dayNumberNep: "१४", isEnabled: true });
        nepDays.push({ dayNumber: 15, dayNumberNep: "१५", isEnabled: true });
        nepDays.push({ dayNumber: 16, dayNumberNep: "१६", isEnabled: true });
        nepDays.push({ dayNumber: 17, dayNumberNep: "१७", isEnabled: true });
        nepDays.push({ dayNumber: 18, dayNumberNep: "१८", isEnabled: true });
        nepDays.push({ dayNumber: 19, dayNumberNep: "१९", isEnabled: true });
        nepDays.push({ dayNumber: 20, dayNumberNep: "२०", isEnabled: true });
        nepDays.push({ dayNumber: 21, dayNumberNep: "२१", isEnabled: true });
        nepDays.push({ dayNumber: 22, dayNumberNep: "२२", isEnabled: true });
        nepDays.push({ dayNumber: 23, dayNumberNep: "२३", isEnabled: true });
        nepDays.push({ dayNumber: 24, dayNumberNep: "२४", isEnabled: true });
        nepDays.push({ dayNumber: 25, dayNumberNep: "२५", isEnabled: true });
        nepDays.push({ dayNumber: 26, dayNumberNep: "२६", isEnabled: true });
        nepDays.push({ dayNumber: 27, dayNumberNep: "२७", isEnabled: true });
        nepDays.push({ dayNumber: 28, dayNumberNep: "२८", isEnabled: true });
        nepDays.push({ dayNumber: 29, dayNumberNep: "२९", isEnabled: true });
        nepDays.push({ dayNumber: 30, dayNumberNep: "३०", isEnabled: true });
        nepDays.push({ dayNumber: 31, dayNumberNep: "३१", isEnabled: true });
        nepDays.push({ dayNumber: 32, dayNumberNep: "३२", isEnabled: true });
        return nepDays;
    }

}

export class NepaliHours {
    //in english
    hoursNumber: number;
    //in nepali eg: "१","२","३"
    hoursNumberNep: string;
    //maximum  12 hours
    static GetAllNepaliHours(): Array<NepaliHours> {
        let nepHoursList: Array<NepaliHours> = new Array<NepaliHours>();
        nepHoursList.push({ hoursNumber: 1, hoursNumberNep: "१" });
        nepHoursList.push({ hoursNumber: 2, hoursNumberNep: "२" });
        nepHoursList.push({ hoursNumber: 3, hoursNumberNep: "३" });
        nepHoursList.push({ hoursNumber: 4, hoursNumberNep: "४" });
        nepHoursList.push({ hoursNumber: 5, hoursNumberNep: "५" });
        nepHoursList.push({ hoursNumber: 6, hoursNumberNep: "६" });
        nepHoursList.push({ hoursNumber: 7, hoursNumberNep: "७" });
        nepHoursList.push({ hoursNumber: 8, hoursNumberNep: "८" });
        nepHoursList.push({ hoursNumber: 9, hoursNumberNep: "९" });
        nepHoursList.push({ hoursNumber: 10, hoursNumberNep: "१०" });
        nepHoursList.push({ hoursNumber: 11, hoursNumberNep: "११" });
        nepHoursList.push({ hoursNumber: 12, hoursNumberNep: "१२" });
        return nepHoursList;
    }
}
export class NepaliMinutes {
    //in english 
    minutesNumber: number;
    //in nepali : "१","२","३"
    minutesNumberNep: string;
    //maximum 60
    static GetAllNepaliMinutes(): Array<NepaliMinutes> {
        let nepMinutesList: Array<NepaliMinutes> = new Array<NepaliMinutes>();
        nepMinutesList.push({ minutesNumber: 0, minutesNumberNep: "00" });
        nepMinutesList.push({ minutesNumber: 1, minutesNumberNep: "01" });
        nepMinutesList.push({ minutesNumber: 2, minutesNumberNep: "02" });
        nepMinutesList.push({ minutesNumber: 3, minutesNumberNep: "03" });
        nepMinutesList.push({ minutesNumber: 4, minutesNumberNep: "04" });
        nepMinutesList.push({ minutesNumber: 5, minutesNumberNep: "05" });
        nepMinutesList.push({ minutesNumber: 6, minutesNumberNep: "06" });
        nepMinutesList.push({ minutesNumber: 7, minutesNumberNep: "07" });
        nepMinutesList.push({ minutesNumber: 8, minutesNumberNep: "08" });
        nepMinutesList.push({ minutesNumber: 9, minutesNumberNep: "09" });
        nepMinutesList.push({ minutesNumber: 10, minutesNumberNep: "10" });
        nepMinutesList.push({ minutesNumber: 11, minutesNumberNep: "11" });
        nepMinutesList.push({ minutesNumber: 12, minutesNumberNep: "12" });
        nepMinutesList.push({ minutesNumber: 13, minutesNumberNep: "13" });
        nepMinutesList.push({ minutesNumber: 14, minutesNumberNep: "14" });
        nepMinutesList.push({ minutesNumber: 15, minutesNumberNep: "15" });
        nepMinutesList.push({ minutesNumber: 16, minutesNumberNep: "16" });
        nepMinutesList.push({ minutesNumber: 17, minutesNumberNep: "17" });
        nepMinutesList.push({ minutesNumber: 18, minutesNumberNep: "18" });
        nepMinutesList.push({ minutesNumber: 19, minutesNumberNep: "19" });
        nepMinutesList.push({ minutesNumber: 20, minutesNumberNep: "20" });
        nepMinutesList.push({ minutesNumber: 21, minutesNumberNep: "21" });
        nepMinutesList.push({ minutesNumber: 22, minutesNumberNep: "22" });
        nepMinutesList.push({ minutesNumber: 23, minutesNumberNep: "23" });
        nepMinutesList.push({ minutesNumber: 24, minutesNumberNep: "24" });
        nepMinutesList.push({ minutesNumber: 25, minutesNumberNep: "25" });
        nepMinutesList.push({ minutesNumber: 26, minutesNumberNep: "26" });
        nepMinutesList.push({ minutesNumber: 27, minutesNumberNep: "27" });
        nepMinutesList.push({ minutesNumber: 28, minutesNumberNep: "28" });
        nepMinutesList.push({ minutesNumber: 29, minutesNumberNep: "29" });
        nepMinutesList.push({ minutesNumber: 30, minutesNumberNep: "30" });
        nepMinutesList.push({ minutesNumber: 31, minutesNumberNep: "31" });
        nepMinutesList.push({ minutesNumber: 32, minutesNumberNep: "32" });
        nepMinutesList.push({ minutesNumber: 33, minutesNumberNep: "33" });
        nepMinutesList.push({ minutesNumber: 34, minutesNumberNep: "34" });
        nepMinutesList.push({ minutesNumber: 35, minutesNumberNep: "35" });
        nepMinutesList.push({ minutesNumber: 36, minutesNumberNep: "36" });
        nepMinutesList.push({ minutesNumber: 37, minutesNumberNep: "37" });
        nepMinutesList.push({ minutesNumber: 38, minutesNumberNep: "38" });
        nepMinutesList.push({ minutesNumber: 39, minutesNumberNep: "39" });
        nepMinutesList.push({ minutesNumber: 40, minutesNumberNep: "40" });
        nepMinutesList.push({ minutesNumber: 41, minutesNumberNep: "41" });
        nepMinutesList.push({ minutesNumber: 42, minutesNumberNep: "42" });
        nepMinutesList.push({ minutesNumber: 43, minutesNumberNep: "43" });
        nepMinutesList.push({ minutesNumber: 44, minutesNumberNep: "44" });
        nepMinutesList.push({ minutesNumber: 45, minutesNumberNep: "45" });
        nepMinutesList.push({ minutesNumber: 46, minutesNumberNep: "46" });
        nepMinutesList.push({ minutesNumber: 47, minutesNumberNep: "47" });
        nepMinutesList.push({ minutesNumber: 48, minutesNumberNep: "48" });
        nepMinutesList.push({ minutesNumber: 49, minutesNumberNep: "49" });
        nepMinutesList.push({ minutesNumber: 50, minutesNumberNep: "50" });
        nepMinutesList.push({ minutesNumber: 51, minutesNumberNep: "51" });
        nepMinutesList.push({ minutesNumber: 52, minutesNumberNep: "52" });
        nepMinutesList.push({ minutesNumber: 53, minutesNumberNep: "53" });
        nepMinutesList.push({ minutesNumber: 54, minutesNumberNep: "54" });
        nepMinutesList.push({ minutesNumber: 55, minutesNumberNep: "55" });
        nepMinutesList.push({ minutesNumber: 56, minutesNumberNep: "56" });
        nepMinutesList.push({ minutesNumber: 57, minutesNumberNep: "57" });
        nepMinutesList.push({ minutesNumber: 58, minutesNumberNep: "58" });
        nepMinutesList.push({ minutesNumber: 59, minutesNumberNep: "59" });
        return nepMinutesList;
    }
}
//calendar time am and pm class
export class NepaliAMPM {
    title: string;
    static GetAMPM(): Array<NepaliAMPM> {
        let nepAMPMList: Array<NepaliAMPM> = new Array<NepaliAMPM>();
        nepAMPMList.push({ title: "AM" });
        nepAMPMList.push({ title: "PM" });
        return nepAMPMList;
    }
}
