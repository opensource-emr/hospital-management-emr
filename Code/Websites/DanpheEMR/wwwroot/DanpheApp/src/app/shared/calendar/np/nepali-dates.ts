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
    monthName: string;
    monthNumber: number;
    static GetNepaliMonths(): Array<NepaliMonth> {
        let nepMonths: Array<NepaliMonth> = new Array<NepaliMonth>();
        nepMonths.push({ monthNumber: 1, monthName: "बैशाख" });
        nepMonths.push({ monthNumber: 2, monthName: "जेष्ठ" });
        nepMonths.push({ monthNumber: 3, monthName: "असार" });
        nepMonths.push({ monthNumber: 4, monthName: "श्रावन" });
        nepMonths.push({ monthNumber: 5, monthName: "भाद्र" });
        nepMonths.push({ monthNumber: 6, monthName: "असोज" });
        nepMonths.push({ monthNumber: 7, monthName: "कार्तिक" });
        nepMonths.push({ monthNumber: 8, monthName: "मङ्सिर" });
        nepMonths.push({ monthNumber: 9, monthName: "पौष" });
        nepMonths.push({ monthNumber: 10, monthName: "माघ" });
        nepMonths.push({ monthNumber: 11, monthName: "फाल्गुन" });
        nepMonths.push({ monthNumber: 12, monthName: "चैत्र" });
        return nepMonths;
    }
}

export class NepaliYear {
    //in english language: eg: 2000, 2001, 2002, etc..
    yearNumber: number;
    //in nepali language: eg: "२०००","२०८०", etc..
    yearNumberNep: string;


    static GetAllNepaliYears(): Array<NepaliYear> {
        let nepYears: Array<NepaliYear> = new Array<NepaliYear>();
        //all from 1950 BS to 2080BS.
        nepYears.push({ yearNumber: 1950, yearNumberNep: "१९५०" });
        nepYears.push({ yearNumber: 1951, yearNumberNep: "१९५१" });
        nepYears.push({ yearNumber: 1952, yearNumberNep: "१९५२" });
        nepYears.push({ yearNumber: 1953, yearNumberNep: "१९५३" });
        nepYears.push({ yearNumber: 1954, yearNumberNep: "१९५४" });
        nepYears.push({ yearNumber: 1955, yearNumberNep: "१९५५" });
        nepYears.push({ yearNumber: 1956, yearNumberNep: "१९५६" });
        nepYears.push({ yearNumber: 1957, yearNumberNep: "१९५७" });
        nepYears.push({ yearNumber: 1958, yearNumberNep: "१९५८" });
        nepYears.push({ yearNumber: 1959, yearNumberNep: "१९५९" });
        nepYears.push({ yearNumber: 1960, yearNumberNep: "१९६०" });
        nepYears.push({ yearNumber: 1961, yearNumberNep: "१९६१" });
        nepYears.push({ yearNumber: 1962, yearNumberNep: "१९६२" });
        nepYears.push({ yearNumber: 1963, yearNumberNep: "१९६३" });
        nepYears.push({ yearNumber: 1964, yearNumberNep: "१९६४" });
        nepYears.push({ yearNumber: 1965, yearNumberNep: "१९६५" });
        nepYears.push({ yearNumber: 1966, yearNumberNep: "१९६६" });
        nepYears.push({ yearNumber: 1967, yearNumberNep: "१९६७" });
        nepYears.push({ yearNumber: 1968, yearNumberNep: "१९६८" });
        nepYears.push({ yearNumber: 1969, yearNumberNep: "१९६९" });
        nepYears.push({ yearNumber: 1970, yearNumberNep: "१९७०" });
        nepYears.push({ yearNumber: 1971, yearNumberNep: "१९७१" });
        nepYears.push({ yearNumber: 1972, yearNumberNep: "१९७२" });
        nepYears.push({ yearNumber: 1973, yearNumberNep: "१९७३" });
        nepYears.push({ yearNumber: 1974, yearNumberNep: "१९७४" });
        nepYears.push({ yearNumber: 1975, yearNumberNep: "१९७५" });
        nepYears.push({ yearNumber: 1976, yearNumberNep: "१९७६" });
        nepYears.push({ yearNumber: 1977, yearNumberNep: "१९७७" });
        nepYears.push({ yearNumber: 1978, yearNumberNep: "१९७८" });
        nepYears.push({ yearNumber: 1979, yearNumberNep: "१९७९" });
        nepYears.push({ yearNumber: 1980, yearNumberNep: "१९८०" });
        nepYears.push({ yearNumber: 1981, yearNumberNep: "१९८१" });
        nepYears.push({ yearNumber: 1982, yearNumberNep: "१९८२" });
        nepYears.push({ yearNumber: 1983, yearNumberNep: "१९८३" });
        nepYears.push({ yearNumber: 1984, yearNumberNep: "१९८४" });
        nepYears.push({ yearNumber: 1985, yearNumberNep: "१९८५" });
        nepYears.push({ yearNumber: 1986, yearNumberNep: "१९८६" });
        nepYears.push({ yearNumber: 1987, yearNumberNep: "१९८७" });
        nepYears.push({ yearNumber: 1988, yearNumberNep: "१९८८" });
        nepYears.push({ yearNumber: 1989, yearNumberNep: "१९८९" });
        nepYears.push({ yearNumber: 1990, yearNumberNep: "१९९०" });
        nepYears.push({ yearNumber: 1991, yearNumberNep: "१९९१" });
        nepYears.push({ yearNumber: 1992, yearNumberNep: "१९९२" });
        nepYears.push({ yearNumber: 1993, yearNumberNep: "१९९३" });
        nepYears.push({ yearNumber: 1994, yearNumberNep: "१९९४" });
        nepYears.push({ yearNumber: 1995, yearNumberNep: "१९९५" });
        nepYears.push({ yearNumber: 1996, yearNumberNep: "१९९६" });
        nepYears.push({ yearNumber: 1997, yearNumberNep: "१९९७" });
        nepYears.push({ yearNumber: 1998, yearNumberNep: "१९९८" });
        nepYears.push({ yearNumber: 1999, yearNumberNep: "१९९९" });
        ///actual mapping data in nepalicalendar service for years above are not verified: sud
        nepYears.push({ yearNumber: 2000, yearNumberNep: "२०००" });
        nepYears.push({ yearNumber: 2001, yearNumberNep: "२००१" });
        nepYears.push({ yearNumber: 2002, yearNumberNep: "२००२" });
        nepYears.push({ yearNumber: 2003, yearNumberNep: "२००३" });
        nepYears.push({ yearNumber: 2004, yearNumberNep: "२००४" });
        nepYears.push({ yearNumber: 2005, yearNumberNep: "२००५" });
        nepYears.push({ yearNumber: 2006, yearNumberNep: "२००६" });
        nepYears.push({ yearNumber: 2007, yearNumberNep: "२००७" });
        nepYears.push({ yearNumber: 2008, yearNumberNep: "२००८" });
        nepYears.push({ yearNumber: 2009, yearNumberNep: "२००९" });
        nepYears.push({ yearNumber: 2010, yearNumberNep: "२०१०" });
        nepYears.push({ yearNumber: 2011, yearNumberNep: "२०११" });
        nepYears.push({ yearNumber: 2012, yearNumberNep: "२०१२" });
        nepYears.push({ yearNumber: 2013, yearNumberNep: "२०१३" });
        nepYears.push({ yearNumber: 2014, yearNumberNep: "२०१४" });
        nepYears.push({ yearNumber: 2015, yearNumberNep: "२०१५" });
        nepYears.push({ yearNumber: 2016, yearNumberNep: "२०१६" });
        nepYears.push({ yearNumber: 2017, yearNumberNep: "२०१७" });
        nepYears.push({ yearNumber: 2018, yearNumberNep: "२०१८" });
        nepYears.push({ yearNumber: 2019, yearNumberNep: "२०१९" });
        nepYears.push({ yearNumber: 2020, yearNumberNep: "२०२०" });
        nepYears.push({ yearNumber: 2021, yearNumberNep: "२०२१" });
        nepYears.push({ yearNumber: 2022, yearNumberNep: "२०२२" });
        nepYears.push({ yearNumber: 2023, yearNumberNep: "२०२३" });
        nepYears.push({ yearNumber: 2024, yearNumberNep: "२०२४" });
        nepYears.push({ yearNumber: 2025, yearNumberNep: "२०२५" });
        nepYears.push({ yearNumber: 2026, yearNumberNep: "२०२६" });
        nepYears.push({ yearNumber: 2027, yearNumberNep: "२०२७" });
        nepYears.push({ yearNumber: 2028, yearNumberNep: "२०२८" });
        nepYears.push({ yearNumber: 2029, yearNumberNep: "२०२९" });
        nepYears.push({ yearNumber: 2030, yearNumberNep: "२०३०" });
        nepYears.push({ yearNumber: 2031, yearNumberNep: "२०३१" });
        nepYears.push({ yearNumber: 2032, yearNumberNep: "२०३२" });
        nepYears.push({ yearNumber: 2033, yearNumberNep: "२०३३" });
        nepYears.push({ yearNumber: 2034, yearNumberNep: "२०३४" });
        nepYears.push({ yearNumber: 2035, yearNumberNep: "२०३५" });
        nepYears.push({ yearNumber: 2036, yearNumberNep: "२०३६" });
        nepYears.push({ yearNumber: 2037, yearNumberNep: "२०३७" });
        nepYears.push({ yearNumber: 2038, yearNumberNep: "२०३८" });
        nepYears.push({ yearNumber: 2039, yearNumberNep: "२०३९" });
        nepYears.push({ yearNumber: 2040, yearNumberNep: "२०४०" });
        nepYears.push({ yearNumber: 2041, yearNumberNep: "२०४१" });
        nepYears.push({ yearNumber: 2042, yearNumberNep: "२०४२" });
        nepYears.push({ yearNumber: 2043, yearNumberNep: "२०४३" });
        nepYears.push({ yearNumber: 2044, yearNumberNep: "२०४४" });
        nepYears.push({ yearNumber: 2045, yearNumberNep: "२०४५" });
        nepYears.push({ yearNumber: 2046, yearNumberNep: "२०४६" });
        nepYears.push({ yearNumber: 2047, yearNumberNep: "२०४७" });
        nepYears.push({ yearNumber: 2048, yearNumberNep: "२०४८" });
        nepYears.push({ yearNumber: 2049, yearNumberNep: "२०४९" });
        nepYears.push({ yearNumber: 2050, yearNumberNep: "२०५०" });
        nepYears.push({ yearNumber: 2051, yearNumberNep: "२०५१" });
        nepYears.push({ yearNumber: 2052, yearNumberNep: "२०५२" });
        nepYears.push({ yearNumber: 2053, yearNumberNep: "२०५३" });
        nepYears.push({ yearNumber: 2054, yearNumberNep: "२०५४" });
        nepYears.push({ yearNumber: 2055, yearNumberNep: "२०५५" });
        nepYears.push({ yearNumber: 2056, yearNumberNep: "२०५६" });
        nepYears.push({ yearNumber: 2057, yearNumberNep: "२०५७" });
        nepYears.push({ yearNumber: 2058, yearNumberNep: "२०५८" });
        nepYears.push({ yearNumber: 2059, yearNumberNep: "२०५९" });
        nepYears.push({ yearNumber: 2060, yearNumberNep: "२०६०" });
        nepYears.push({ yearNumber: 2061, yearNumberNep: "२०६१" });
        nepYears.push({ yearNumber: 2062, yearNumberNep: "२०६२" });
        nepYears.push({ yearNumber: 2063, yearNumberNep: "२०६३" });
        nepYears.push({ yearNumber: 2064, yearNumberNep: "२०६४" });
        nepYears.push({ yearNumber: 2065, yearNumberNep: "२०६५" });
        nepYears.push({ yearNumber: 2066, yearNumberNep: "२०६६" });
        nepYears.push({ yearNumber: 2067, yearNumberNep: "२०६७" });
        nepYears.push({ yearNumber: 2068, yearNumberNep: "२०६८" });
        nepYears.push({ yearNumber: 2069, yearNumberNep: "२०६९" });
        nepYears.push({ yearNumber: 2070, yearNumberNep: "२०७०" });
        nepYears.push({ yearNumber: 2071, yearNumberNep: "२०७१" });
        nepYears.push({ yearNumber: 2072, yearNumberNep: "२०७२" });
        nepYears.push({ yearNumber: 2073, yearNumberNep: "२०७३" });
        nepYears.push({ yearNumber: 2074, yearNumberNep: "२०७४" });
        nepYears.push({ yearNumber: 2075, yearNumberNep: "२०७५" });
        nepYears.push({ yearNumber: 2076, yearNumberNep: "२०७६" });
        nepYears.push({ yearNumber: 2077, yearNumberNep: "२०७७" });
        nepYears.push({ yearNumber: 2078, yearNumberNep: "२०७८" });
        nepYears.push({ yearNumber: 2079, yearNumberNep: "२०७९" });
        nepYears.push({ yearNumber: 2080, yearNumberNep: "२०८०" });
        nepYears.push({ yearNumber: 2081, yearNumberNep: "२०८१" });
        nepYears.push({ yearNumber: 2082, yearNumberNep: "२०८२" });
        nepYears.push({ yearNumber: 2083, yearNumberNep: "२०८३" });
        nepYears.push({ yearNumber: 2084, yearNumberNep: "२०८४" });
        nepYears.push({ yearNumber: 2085, yearNumberNep: "२०८५" });
        nepYears.push({ yearNumber: 2086, yearNumberNep: "२०८६" });
        nepYears.push({ yearNumber: 2087, yearNumberNep: "२०८७" });
        nepYears.push({ yearNumber: 2088, yearNumberNep: "२०८८" });
        nepYears.push({ yearNumber: 2089, yearNumberNep: "२०८९" });
        return nepYears;
    }

}

export class NepaliDay {
    //in english
    dayNumber: number;
    //in nepali eg: "१","२","३"
    dayNumberNep: string;
    //maximum days in nepali months are 32.
    static GetAllNepaliDays(): Array<NepaliDay> {
        let nepDays: Array<NepaliDay> = new Array<NepaliDay>();
        //all from 1 to 32 १२३४५६७८९०
        nepDays.push({ dayNumber: 1, dayNumberNep: "१" });
        nepDays.push({ dayNumber: 2, dayNumberNep: "२" });
        nepDays.push({ dayNumber: 3, dayNumberNep: "३" });
        nepDays.push({ dayNumber: 4, dayNumberNep: "४" });
        nepDays.push({ dayNumber: 5, dayNumberNep: "५" });
        nepDays.push({ dayNumber: 6, dayNumberNep: "६" });
        nepDays.push({ dayNumber: 7, dayNumberNep: "७" });
        nepDays.push({ dayNumber: 8, dayNumberNep: "८" });
        nepDays.push({ dayNumber: 9, dayNumberNep: "९" });
        nepDays.push({ dayNumber: 10, dayNumberNep: "१०" });
        nepDays.push({ dayNumber: 11, dayNumberNep: "११" });
        nepDays.push({ dayNumber: 12, dayNumberNep: "१२" });
        nepDays.push({ dayNumber: 13, dayNumberNep: "१३" });
        nepDays.push({ dayNumber: 14, dayNumberNep: "१४" });
        nepDays.push({ dayNumber: 15, dayNumberNep: "१५" });
        nepDays.push({ dayNumber: 16, dayNumberNep: "१६" });
        nepDays.push({ dayNumber: 17, dayNumberNep: "१७" });
        nepDays.push({ dayNumber: 18, dayNumberNep: "१८" });
        nepDays.push({ dayNumber: 19, dayNumberNep: "१९" });
        nepDays.push({ dayNumber: 20, dayNumberNep: "२०" });
        nepDays.push({ dayNumber: 21, dayNumberNep: "२१" });
        nepDays.push({ dayNumber: 22, dayNumberNep: "२२" });
        nepDays.push({ dayNumber: 23, dayNumberNep: "२३" });
        nepDays.push({ dayNumber: 24, dayNumberNep: "२४" });
        nepDays.push({ dayNumber: 25, dayNumberNep: "२५" });
        nepDays.push({ dayNumber: 26, dayNumberNep: "२६" });
        nepDays.push({ dayNumber: 27, dayNumberNep: "२७" });
        nepDays.push({ dayNumber: 28, dayNumberNep: "२८" });
        nepDays.push({ dayNumber: 29, dayNumberNep: "२९" });
        nepDays.push({ dayNumber: 30, dayNumberNep: "३०" });
        nepDays.push({ dayNumber: 31, dayNumberNep: "३१" });
        nepDays.push({ dayNumber: 32, dayNumberNep: "३२" });
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