import { Injectable } from '@angular/core';
import * as moment from 'moment/moment';
import {
  NepaliDate, NepaliMonth, NepaliDay, NepaliYear, NepaliHours, NepaliMinutes, NepaliAMPM
} from './nepali-dates';

@Injectable()
export class NepaliCalendarService {

  public nepaliDate: NepaliDate = new NepaliDate();
  //this array contains How many days were there in each months of Nepali Years
  public yr_mth_bs: Array<Array<number>>;
  public nep_mth_Dates: Array<number>;

  public minNepYear: number = 1958;
  public maxNepYear: number = 2089;

  public minEngYear: number = 1901;
  public maxEngYear: number = 2032;

  //sud:21Aug'19--this will be used by nepali-calendar.component.
  //when month changes, it doesn't re-load the UI for Days, so we'll be using this shared variable.
  public nepDaysInSelectedMonth: Array<NepaliDay> = [];

  //these below static variables with name static appended at last are used for static Calender Service which is needed in the
  //grid cell renderer function --Anish: 30 March, 2020
  static nepaliDate_static: NepaliDate = new NepaliDate();
  static yr_mth_bs_static: Array<Array<number>>;
  static nep_mth_Dates_static: Array<number>;
  static minNepYear_static: number = 1970;
  static maxNepYear_static: number = 2090;
  static minEngYear_static: number = 0;
  static maxEngYear_static: number = 0;
  public nepDaysInSelectedMonth_static: Array<NepaliDay> = [];



  constructor() {
    NepaliCalendarService.LoadNepYear_MthHash();
    this.AssignStaticMemberToPublic();
  }

  public AssignStaticMemberToPublic() {
    this.yr_mth_bs = new Array<any>();
    this.yr_mth_bs = NepaliCalendarService.yr_mth_bs_static;
  }

  static LoadNepYear_MthHash() {
    //this array contains How many days were there in each months of Nepali Years
    ///data from 1950 to 2000 are not verified: sudarshan15Jul2017
    NepaliCalendarService.yr_mth_bs_static = new Array<any>();
    //NepaliCalendarService.yr_mth_bs_static[1950] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    //NepaliCalendarService.yr_mth_bs_static[1951] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    //NepaliCalendarService.yr_mth_bs_static[1952] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    //NepaliCalendarService.yr_mth_bs_static[1953] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    //NepaliCalendarService.yr_mth_bs_static[1954] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    //NepaliCalendarService.yr_mth_bs_static[1955] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1956] = [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1957] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[1958] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[1959] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1960] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1961] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[1962] = [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[1963] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1964] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1965] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[1966] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[1967] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1968] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1969] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[1970] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1971] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1972] = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1973] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[1974] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1975] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1976] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1977] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[1978] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1979] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1980] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1981] = [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1982] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1983] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1984] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1985] = [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1986] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1987] = [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1988] = [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1989] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1990] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1991] = [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1992] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1993] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1994] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1995] = [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1996] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1997] = [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[1998] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];//days are corrected in this year: sud:15Mar'19
    NepaliCalendarService.yr_mth_bs_static[1999] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];//days are corrected in this year: sud:15Mar'19
    ///data below this are verified, but not above this.. 
    NepaliCalendarService.yr_mth_bs_static[2000] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2001] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2002] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2003] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2004] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2005] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2006] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2007] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2008] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2009] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2010] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2011] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2012] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2013] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2014] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2015] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2016] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2017] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2018] = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2019] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2020] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2021] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2022] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2023] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2024] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2025] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2026] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2027] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2028] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2029] = [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2030] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2031] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2032] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2033] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2034] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2035] = [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2036] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2037] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2038] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2039] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2040] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2041] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2042] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2043] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2044] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2045] = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2046] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2047] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2048] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2049] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2050] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2051] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2052] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2053] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2054] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2055] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2056] = [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2057] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2058] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2059] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2060] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2061] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2062] = [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2063] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2064] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2065] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2066] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2067] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2068] = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2069] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2070] = [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2071] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2072] = [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2073] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31];
    NepaliCalendarService.yr_mth_bs_static[2074] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2075] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2076] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2077] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31];
    NepaliCalendarService.yr_mth_bs_static[2078] = [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2079] = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2080] = [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2081] = [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2082] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2083] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2084] = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2085] = [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2086] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2087] = [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2088] = [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2089] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];
    NepaliCalendarService.yr_mth_bs_static[2090] = [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30];

  }

  GetDaysOfMonthBS(yrNoBS: number, mthNoBS: number): Array<NepaliDay> {
    //get current year's data from hash.
    let yrMonths = this.yr_mth_bs[yrNoBS];
    //get current month's day count (mth-1) since index starts from 0.
    let mthMaxDays = yrMonths[mthNoBS - 1];
    //filter and return only valid days of that month. 
    let retDays = NepaliDay.GetAllNepaliDays().filter(d => d.dayNumber <= mthMaxDays);
    return retDays;
  }

  IsValidNepaliDate(yyyy, mm, dd): boolean {
    if (this.minNepYear <= yyyy && yyyy <= this.maxNepYear) {
      if (0 < mm && mm < 13) {
        if (dd <= this.yr_mth_bs[yyyy][mm - 1]) {
          return true;
        }
      }
    }
    return false;
  }

  public ConvertNepStringToEngString(nepaliDate: string): string {

    // This function will get only nepali date string format must like below
    // format "2077-1-9"
    if (nepaliDate) {
      let newNepDate: NepaliDate = new NepaliDate();
      let strArr = nepaliDate.split('-');
      if (strArr.length == 3) {
        newNepDate.Year = parseInt(strArr[0]);
        newNepDate.Month = parseInt(strArr[1]);
        newNepDate.Day = parseInt(strArr[2]);
        newNepDate.Hours = 1;
        newNepDate.Minutes = 1;
        newNepDate.AMPM = 'AM';

        return moment(this.ConvertNepToEngDate(newNepDate)).format('YYYY-MM-DD');
      }
      else {
        return nepaliDate;
      }
    }
    else {
      return nepaliDate;
    }

  }

  public ConvertNepToEngDate(nepaliDate: NepaliDate): string {

    let nepDD = nepaliDate.Day;
    let nepMM = nepaliDate.Month;
    let nepYY = nepaliDate.Year;
    let nepHRS = nepaliDate.Hours;
    let nepMNT = nepaliDate.Minutes;
    let nepAMPM = nepaliDate.AMPM;


    let retEngDate: string = null;
    //if anything is empty then return null value.
    if (nepYY && nepMM && nepDD) {


      let calYear = this.GetNepaliCalendarYearInfo();
      let calYearStart = calYear.filter(a => a.CYear == nepYY)[0].YearStart;
      let calYearStartEng = moment(calYearStart);

      let yrMth = this.yr_mth_bs[nepYY];

      let daysToAdd = 0;
      for (var i = 0; i < nepMM - 1; i++) {
        daysToAdd += yrMth[i];
      }
      daysToAdd += nepDD - 1;

      retEngDate = calYearStartEng.add(daysToAdd, 'days').format('YYYY-MM-DD');
      if (nepAMPM == 'AM') {
        if (nepHRS == 12) { nepHRS = 0; }
      } else {
        if (nepHRS != 12) {
          nepHRS = nepHRS + 12;
        }
      }

      let hrsStr = nepHRS.toString().length == 1 ? "0" + nepHRS.toString() : nepHRS.toString();
      let minStr = nepMNT.toString().length == 1 ? "0" + nepMNT.toString() : nepMNT.toString();


      let timeStr = retEngDate.toString().concat('T', hrsStr, ':', minStr);
      //let timeFromStr = moment(timeStr).format('YYYY-MM-DDTHH:MM');                        
      retEngDate = timeStr;

    }
    return retEngDate;
  }

  public ConvertEngToNepDate(engDate: string): NepaliDate {
    ///extract and assign datetime parts to each variables.
    let dateObject = moment(engDate).toObject();
    let ampm = moment(engDate).format('A');
    dateObject.months = parseInt(moment(engDate).format('MM'));
    dateObject.hours = parseInt(moment(engDate).format('hh'));
    var engYY: number = moment().toObject().years;
    //this is english date: 1900. 
    if (dateObject.years > 1900 && dateObject.years < 2040) {
      engYY = dateObject.years;
    }


    let engMM: number = dateObject.months;
    let engDD: number = dateObject.date;
    let engHRS: number = dateObject.hours;
    let engMNT: number = dateObject.minutes;
    let engAMPM: string = ampm;


    let retNepDate: NepaliDate = new NepaliDate();

    let engCalYearInfo = NepaliCalendarService.GetEngCalendarYearInfo();

    //for current english year, get StartOfNepaliYear.

    let yrStartInBs = engCalYearInfo.filter(a => a.engYear == engYY)[0].yStartInBS;

    //get BS dates into 3 different variables.
    let bsDates = yrStartInBs.split('-');
    let bsYr = parseInt(bsDates[0]);
    let bsMth = parseInt(bsDates[1]);
    let bsDay = parseInt(bsDates[2]);


    //calculate total days to add from the begining of the given english year.
    let ipEngDate = engYY.toString() + '-' + engMM + '-' + engDD;
    let ipEngYearStart = engYY.toString() + '-01-01';
    let daysToAdd = moment(ipEngDate).diff(moment(ipEngYearStart), 'days');

    let nepCalMths = this.GetDaysInMonthOfNext13NepaliMonthsIncludingCurrentMth(bsYr);

    //if days to add is lesser than remaining days in currentnepalimonth, that means days will be in current nepali month only.
    //for which Just add the remaining days.
    if (daysToAdd <= (nepCalMths[0] - bsDay)) {
      bsDay = bsDay + daysToAdd;
    }
    else {
      //if daystoadd is going over current month's max days, increment Month, re-calculate daysToAdd and reset bsDays.
      if ((bsDay + daysToAdd) > nepCalMths[0]) {
        bsMth += 1;
        daysToAdd = daysToAdd - (nepCalMths[0] - bsDay) - 1;
        bsDay = 1;
      }

      //loop from nextmonth of nepalicalendar.
      //LOOP FROM 1 to 12th Index (There are fixed 13items in nepCalMths Array)
      for (var i = 1; i < 13; i++) {
        if (daysToAdd >= (nepCalMths[i])) {
          daysToAdd = daysToAdd - (nepCalMths[i]);
          bsMth += 1;
          //reset year and month once month goes above 12.
          if (bsMth > 12) {
            bsYr += 1;
            bsMth = 1;
          }
        }
        else {
          bsDay = bsDay + daysToAdd;
          break;
        }
      }
    }

    let bsHours: number = 0;
    let bsMinutes: number = 0;
    let bsAMPM: string = "";
    if (engHRS) {
      bsHours = NepaliHours.GetAllNepaliHours().find(a => a.hoursNumber == engHRS).hoursNumber;
    }
    if (engMNT) {
      bsMinutes = NepaliMinutes.GetAllNepaliMinutes().find(a => a.minutesNumber == engMNT).minutesNumber;
    }
    if (engAMPM) {
      bsAMPM = engAMPM;
    }
    retNepDate.Day = bsDay;
    retNepDate.Month = bsMth;
    retNepDate.Year = bsYr;
    retNepDate.Hours = bsHours;
    retNepDate.Minutes = bsMinutes;
    retNepDate.AMPM = bsAMPM;


    ////sud:21Aug'19-this will reload the nepali calendar's days in the month..
    //this.nepDaysInSelectedMonth = this.GetDaysOfMonthBS(retNepDate.Year, retNepDate.Month);

    return retNepDate;

  }

  public ConvertEngToNepDateString(engDate: string): string {
    let npDate: NepaliDate = this.ConvertEngToNepDate(engDate);
    //adding extra zero on Monty and Day if it's one digit
    let mthFormatted = npDate.Month < 10 ? "0" + npDate.Month : npDate.Month;
    let dayFormatted = npDate.Day < 10 ? "0" + npDate.Day : npDate.Day;

    return npDate.Year + "-" + mthFormatted + "-" + dayFormatted;
  }

  public ConvertEngToNepaliFormatted(engDate: string = null, format: string): string {
    let npDate: NepaliDate;
    if (engDate) {
      npDate = this.ConvertEngToNepDate(engDate);
    }
    else {
      this.GetTodaysNepDate();
    }

    if (npDate.AMPM == "PM" && npDate.Hours < 12) {
      npDate.Hours = npDate.Hours + 12;
    }

    let yearString = npDate.Year.toString();
    let mthString = npDate.Month < 10 ? "0" + npDate.Month : npDate.Month.toString();
    let dayString = npDate.Day < 10 ? "0" + npDate.Day : npDate.Day.toString();
    let hourString = npDate.Hours < 10 ? "0" + npDate.Hours : npDate.Hours.toString();
    let minuteString = npDate.Minutes < 10 ? "0" + npDate.Minutes : npDate.Minutes.toString();

    if (format == 'DD') {
      return dayString;
    }
    else if (format == 'MM') {
      return mthString;
    }
    else if (format == 'YYYY') {
      return yearString;
    }
    else if (format == 'YYYY-MM-DD hh:mm') {
      return yearString + "-" + mthString + "-" + dayString + " " + hourString + ":" + minuteString;
    }
    else if (format == 'YYYY-MM-DD HH:mm') {
      return yearString + "-" + mthString + "-" + dayString + " " + hourString + ":" + minuteString;
    }
    else {//this is default format: YYYY-MM-DD
      return yearString + "-" + mthString + "-" + dayString;
    }

  }

  public GetTodaysNepDate(): NepaliDate {
    let engDateToday = moment().format('YYYY-MM-DDTHH:mm');
    let nepDateToday = this.ConvertEngToNepDate(engDateToday);
    return nepDateToday;
  }

  public GetNepaliCalendarYearInfo(): Array<any> {
    let calYear = [
      //Nepali calendar year data from 1950 BS to 2000 BS are not verified
      //CYear is BS Year
      //{ CYear: 1950, YearStart: "Apr 13 1893", YearEnd: "Apr 13 1894" },
      //{ CYear: 1951, YearStart: "Apr 14 1894", YearEnd: "Apr 13 1895" },
      //{ CYear: 1952, YearStart: "Apr 14 1895", YearEnd: "Apr 12 1896" },
      //{ CYear: 1953, YearStart: "Apr 13 1896", YearEnd: "Apr 12 1897" },
      //{ CYear: 1954, YearStart: "Apr 13 1897", YearEnd: "Apr 13 1898" },
      //{ CYear: 1955, YearStart: "Apr 14 1898", YearEnd: "Apr 13 1899" },
      //{ CYear: 1956, YearStart: "Apr 14 1899", YearEnd: "Apr 12 1900" },
      { CYear: 1957, YearStart: "Apr 13 1900", YearEnd: "Apr 13 1901" },
      { CYear: 1958, YearStart: "Apr 14 1901", YearEnd: "Apr 13 1902" },
      { CYear: 1959, YearStart: "Apr 14 1902", YearEnd: "Apr 13 1903" },
      { CYear: 1960, YearStart: "Apr 14 1903", YearEnd: "Apr 12 1904" },
      { CYear: 1961, YearStart: "Apr 13 1904", YearEnd: "Apr 13 1905" },
      { CYear: 1962, YearStart: "Apr 14 1905", YearEnd: "Apr 13 1906" },
      { CYear: 1963, YearStart: "Apr 14 1906", YearEnd: "Apr 13 1907" },
      { CYear: 1964, YearStart: "Apr 14 1907", YearEnd: "Apr 12 1908" },
      { CYear: 1965, YearStart: "Apr 13 1908", YearEnd: "Apr 13 1909" },
      { CYear: 1966, YearStart: "Apr 14 1909", YearEnd: "Apr 13 1910" },
      { CYear: 1967, YearStart: "Apr 14 1910", YearEnd: "Apr 13 1911" },
      { CYear: 1968, YearStart: "Apr 14 1911", YearEnd: "Apr 12 1912" },
      { CYear: 1969, YearStart: "Apr 13 1912", YearEnd: "Apr 13 1913" },
      { CYear: 1970, YearStart: "Apr 14 1913", YearEnd: "Apr 13 1914" },
      { CYear: 1971, YearStart: "Apr 14 1914", YearEnd: "Apr 13 1915" },
      { CYear: 1972, YearStart: "Apr 14 1915", YearEnd: "Apr 12 1916" },
      { CYear: 1973, YearStart: "Apr 13 1916", YearEnd: "Apr 13 1917" },
      { CYear: 1974, YearStart: "Apr 14 1917", YearEnd: "Apr 13 1918" },
      { CYear: 1975, YearStart: "Apr 14 1918", YearEnd: "Apr 13 1919" },
      { CYear: 1976, YearStart: "Apr 14 1919", YearEnd: "Apr 12 1920" },
      { CYear: 1977, YearStart: "Apr 13 1920", YearEnd: "Apr 13 1921" },
      { CYear: 1978, YearStart: "Apr 14 1921", YearEnd: "Apr 13 1922" },
      { CYear: 1979, YearStart: "Apr 14 1922", YearEnd: "Apr 13 1923" },
      { CYear: 1980, YearStart: "Apr 14 1923", YearEnd: "Apr 12 1924" },
      { CYear: 1981, YearStart: "Apr 13 1924", YearEnd: "Apr 13 1925" },
      { CYear: 1982, YearStart: "Apr 14 1925", YearEnd: "Apr 13 1926" },
      { CYear: 1983, YearStart: "Apr 14 1926", YearEnd: "Apr 13 1927" },
      { CYear: 1984, YearStart: "Apr 14 1927", YearEnd: "Apr 12 1928" },
      { CYear: 1985, YearStart: "Apr 13 1928", YearEnd: "Apr 13 1929" },
      { CYear: 1986, YearStart: "Apr 14 1929", YearEnd: "Apr 13 1930" },
      { CYear: 1987, YearStart: "Apr 14 1930", YearEnd: "Apr 14 1931" },
      { CYear: 1988, YearStart: "Apr 15 1931", YearEnd: "Apr 13 1932" },
      { CYear: 1989, YearStart: "Apr 14 1932", YearEnd: "Apr 13 1933" },
      { CYear: 1990, YearStart: "Apr 14 1933", YearEnd: "Apr 13 1934" },
      { CYear: 1991, YearStart: "Apr 14 1934", YearEnd: "Apr 14 1935" },
      { CYear: 1992, YearStart: "Apr 15 1935", YearEnd: "Apr 13 1936" },
      { CYear: 1993, YearStart: "Apr 14 1936", YearEnd: "Apr 13 1937" },
      { CYear: 1994, YearStart: "Apr 14 1937", YearEnd: "Apr 13 1938" },
      { CYear: 1995, YearStart: "Apr 14 1938", YearEnd: "Apr 14 1939" },
      { CYear: 1996, YearStart: "Apr 15 1939", YearEnd: "Apr 12 1940" },
      { CYear: 1997, YearStart: "Apr 13 1940", YearEnd: "Apr 13 1941" },
      { CYear: 1998, YearStart: "Apr 14 1941", YearEnd: "Apr 13 1942" },
      { CYear: 1999, YearStart: "Apr 14 1942", YearEnd: "Apr 13 1943" },
      //VERY IMPORTANT---
      //Nepali calendar year data below thhis are verified, but above this are not
      { CYear: 2000, YearStart: "Apr 14 1943", YearEnd: "Apr 12 1944" },
      { CYear: 2001, YearStart: "Apr 13 1944", YearEnd: "Apr 12 1945" },
      { CYear: 2002, YearStart: "Apr 13 1945", YearEnd: "Apr 12 1946" },
      { CYear: 2003, YearStart: "Apr 13 1946", YearEnd: "Apr 13 1947" },
      { CYear: 2004, YearStart: "Apr 14 1947", YearEnd: "Apr 12 1948" },
      { CYear: 2005, YearStart: "Apr 13 1948", YearEnd: "Apr 12 1949" },
      { CYear: 2006, YearStart: "Apr 13 1949", YearEnd: "Apr 12 1950" },
      { CYear: 2007, YearStart: "Apr 13 1950", YearEnd: "Apr 13 1951" },
      { CYear: 2008, YearStart: "Apr 14 1951", YearEnd: "Apr 12 1952" },
      { CYear: 2009, YearStart: "Apr 13 1952", YearEnd: "Apr 12 1953" },
      { CYear: 2010, YearStart: "Apr 13 1953", YearEnd: "Apr 12 1954" },
      { CYear: 2011, YearStart: "Apr 13 1954", YearEnd: "Apr 13 1955" },
      { CYear: 2012, YearStart: "Apr 14 1955", YearEnd: "Apr 12 1956" },
      { CYear: 2013, YearStart: "Apr 13 1956", YearEnd: "Apr 12 1957" },
      { CYear: 2014, YearStart: "Apr 13 1957", YearEnd: "Apr 12 1958" },
      { CYear: 2015, YearStart: "Apr 13 1958", YearEnd: "Apr 13 1959" },
      { CYear: 2016, YearStart: "Apr 14 1959", YearEnd: "Apr 12 1960" },
      { CYear: 2017, YearStart: "Apr 13 1960", YearEnd: "Apr 12 1961" },
      { CYear: 2018, YearStart: "Apr 13 1961", YearEnd: "Apr 12 1962" },
      { CYear: 2019, YearStart: "Apr 13 1962", YearEnd: "Apr 13 1963" },
      { CYear: 2020, YearStart: "Apr 14 1963", YearEnd: "Apr 12 1964" },
      { CYear: 2021, YearStart: "Apr 13 1964", YearEnd: "Apr 12 1965" },
      { CYear: 2022, YearStart: "Apr 13 1965", YearEnd: "Apr 12 1966" },
      { CYear: 2023, YearStart: "Apr 13 1966", YearEnd: "Apr 13 1967" },
      { CYear: 2024, YearStart: "Apr 14 1967", YearEnd: "Apr 12 1968" },
      { CYear: 2025, YearStart: "Apr 13 1968", YearEnd: "Apr 12 1969" },
      { CYear: 2026, YearStart: "Apr 13 1969", YearEnd: "Apr 13 1970" },
      { CYear: 2027, YearStart: "Apr 14 1970", YearEnd: "Apr 13 1971" },
      { CYear: 2028, YearStart: "Apr 14 1971", YearEnd: "Apr 12 1972" },
      { CYear: 2029, YearStart: "Apr 13 1972", YearEnd: "Apr 12 1973" },
      { CYear: 2030, YearStart: "Apr 13 1973", YearEnd: "Apr 13 1974" },
      { CYear: 2031, YearStart: "Apr 14 1974", YearEnd: "Apr 13 1975" },
      { CYear: 2032, YearStart: "Apr 14 1975", YearEnd: "Apr 12 1976" },
      { CYear: 2033, YearStart: "Apr 13 1976", YearEnd: "Apr 12 1977" },
      { CYear: 2034, YearStart: "Apr 13 1977", YearEnd: "Apr 13 1978" },
      { CYear: 2035, YearStart: "Apr 14 1978", YearEnd: "Apr 13 1979" },
      { CYear: 2036, YearStart: "Apr 14 1979", YearEnd: "Apr 12 1980" },
      { CYear: 2037, YearStart: "Apr 13 1980", YearEnd: "Apr 12 1981" },
      { CYear: 2038, YearStart: "Apr 13 1981", YearEnd: "Apr 13 1982" },
      { CYear: 2039, YearStart: "Apr 14 1982", YearEnd: "Apr 13 1983" },
      { CYear: 2040, YearStart: "Apr 14 1983", YearEnd: "Apr 12 1984" },
      { CYear: 2041, YearStart: "Apr 13 1984", YearEnd: "Apr 12 1985" },
      { CYear: 2042, YearStart: "Apr 13 1985", YearEnd: "Apr 13 1986" },
      { CYear: 2043, YearStart: "Apr 14 1986", YearEnd: "Apr 13 1987" },
      { CYear: 2044, YearStart: "Apr 14 1987", YearEnd: "Apr 12 1988" },
      { CYear: 2045, YearStart: "Apr 13 1988", YearEnd: "Apr 12 1989" },
      { CYear: 2046, YearStart: "Apr 13 1989", YearEnd: "Apr 13 1990" },
      { CYear: 2047, YearStart: "Apr 14 1990", YearEnd: "Apr 13 1991" },
      { CYear: 2048, YearStart: "Apr 14 1991", YearEnd: "Apr 12 1992" },
      { CYear: 2049, YearStart: "Apr 13 1992", YearEnd: "Apr 12 1993" },
      { CYear: 2050, YearStart: "Apr 13 1993", YearEnd: "Apr 13 1994" },
      { CYear: 2051, YearStart: "Apr 14 1994", YearEnd: "Apr 13 1995" },
      { CYear: 2052, YearStart: "Apr 14 1995", YearEnd: "Apr 12 1996" },
      { CYear: 2053, YearStart: "Apr 13 1996", YearEnd: "Apr 12 1997" },
      { CYear: 2054, YearStart: "Apr 13 1997", YearEnd: "Apr 13 1998" },
      { CYear: 2055, YearStart: "Apr 14 1998", YearEnd: "Apr 13 1999" },
      { CYear: 2056, YearStart: "Apr 14 1999", YearEnd: "Apr 12 2000" },
      { CYear: 2057, YearStart: "Apr 13 2000", YearEnd: "Apr 13 2001" },
      { CYear: 2058, YearStart: "Apr 14 2001", YearEnd: "Apr 13 2002" },
      { CYear: 2059, YearStart: "Apr 14 2002", YearEnd: "Apr 13 2003" },
      { CYear: 2060, YearStart: "Apr 14 2003", YearEnd: "Apr 12 2004" },
      { CYear: 2061, YearStart: "Apr 13 2004", YearEnd: "Apr 13 2005" },
      { CYear: 2062, YearStart: "Apr 14 2005", YearEnd: "Apr 13 2006" },
      { CYear: 2063, YearStart: "Apr 14 2006", YearEnd: "Apr 13 2007" },
      { CYear: 2064, YearStart: "Apr 14 2007", YearEnd: "Apr 12 2008" },
      { CYear: 2065, YearStart: "Apr 13 2008", YearEnd: "Apr 13 2009" },
      { CYear: 2066, YearStart: "Apr 14 2009", YearEnd: "Apr 13 2010" },
      { CYear: 2067, YearStart: "Apr 14 2010", YearEnd: "Apr 13 2011" },
      { CYear: 2068, YearStart: "Apr 14 2011", YearEnd: "Apr 12 2012" },
      { CYear: 2069, YearStart: "Apr 13 2012", YearEnd: "Apr 13 2013" },
      { CYear: 2070, YearStart: "Apr 14 2013", YearEnd: "Apr 13 2014" },
      { CYear: 2071, YearStart: "Apr 14 2014", YearEnd: "Apr 13 2015" },
      { CYear: 2072, YearStart: "Apr 14 2015", YearEnd: "Apr 12 2016" },
      { CYear: 2073, YearStart: "Apr 13 2016", YearEnd: "Apr 13 2017" },
      { CYear: 2074, YearStart: "Apr 14 2017", YearEnd: "Apr 13 2018" },
      { CYear: 2075, YearStart: "Apr 14 2018", YearEnd: "Apr 13 2019" },
      { CYear: 2076, YearStart: "Apr 14 2019", YearEnd: "Apr 12 2020" },
      { CYear: 2077, YearStart: "Apr 13 2020", YearEnd: "Apr 13 2021" },
      { CYear: 2078, YearStart: "Apr 14 2021", YearEnd: "Apr 13 2022" },
      { CYear: 2079, YearStart: "Apr 14 2022", YearEnd: "Apr 13 2023" },
      { CYear: 2080, YearStart: "Apr 14 2023", YearEnd: "Apr 12 2024" },
      { CYear: 2081, YearStart: "Apr 13 2024", YearEnd: "Apr 13 2025" },
      { CYear: 2082, YearStart: "Apr 14 2025", YearEnd: "Apr 13 2026" },
      { CYear: 2083, YearStart: "Apr 14 2026", YearEnd: "Apr 13 2027" },
      { CYear: 2084, YearStart: "Apr 14 2027", YearEnd: "Apr 12 2028" },
      { CYear: 2085, YearStart: "Apr 13 2028", YearEnd: "Apr 13 2029" },
      { CYear: 2086, YearStart: "Apr 14 2029", YearEnd: "Apr 13 2030" },
      { CYear: 2087, YearStart: "Apr 14 2030", YearEnd: "Apr 14 2031" },
      { CYear: 2088, YearStart: "Apr 15 2031", YearEnd: "Apr 13 2032" },
      { CYear: 2089, YearStart: "Apr 14 2032", YearEnd: "Apr 13 2033" },
      { CYear: 2090, YearStart: "Apr 14 2033", YearEnd: "Apr 13 2034" },
      { CYear: 2091, YearStart: "Apr 14 2034", YearEnd: "Apr 14 2035" },
      { CYear: 2092, YearStart: "Apr 15 2035", YearEnd: "Apr 13 2036" },
      { CYear: 2093, YearStart: "Apr 14 2036", YearEnd: "Apr 13 2037" },
      { CYear: 2094, YearStart: "Apr 14 2037", YearEnd: "Apr 13 2038" },
      { CYear: 2095, YearStart: "Apr 14 2038", YearEnd: "Apr 14 2039" },
      { CYear: 2096, YearStart: "Apr 15 2039", YearEnd: "Apr 12 2040" },
      { CYear: 2097, YearStart: "Apr 13 2040", YearEnd: "Apr 13 2041" },
      { CYear: 2098, YearStart: "Apr 14 2041", YearEnd: "Apr 13 2042" },
      { CYear: 2099, YearStart: "Apr 14 2042", YearEnd: "Apr 14 2043" },
      { CYear: 2100, YearStart: "Apr 15 2043", YearEnd: "Apr 12 2044" } //this year is not verified
    ];
    return calYear;
  }

  static GetEngCalendarYearInfo(): Array<any> {
    let engYearsHash = [
      ////english calendar year data from 1900 to 1940 are not verified

      //data below are verified and are correct.., but above this are not..
      { engYear: 1900, yStartInBS: "1956-09-17", yEndInBS: "1957-09-17" },
      { engYear: 1901, yStartInBS: "1957-09-18", yEndInBS: "1958-09-17" },
      { engYear: 1902, yStartInBS: "1958-09-18", yEndInBS: "1959-09-16" },
      { engYear: 1903, yStartInBS: "1959-09-17", yEndInBS: "1960-09-16" },
      { engYear: 1904, yStartInBS: "1960-09-17", yEndInBS: "1961-09-17" },
      { engYear: 1905, yStartInBS: "1961-09-18", yEndInBS: "1962-09-17" },
      { engYear: 1906, yStartInBS: "1962-09-18", yEndInBS: "1963-09-16" },
      { engYear: 1907, yStartInBS: "1963-09-18", yEndInBS: "1963-09-17" },
      { engYear: 1908, yStartInBS: "1964-09-17", yEndInBS: "1964-09-17" },
      { engYear: 1909, yStartInBS: "1965-09-18", yEndInBS: "1965-09-17" },
      { engYear: 1910, yStartInBS: "1966-09-18", yEndInBS: "1966-09-16" },
      { engYear: 1911, yStartInBS: "1967-09-17", yEndInBS: "1967-09-16" },
      { engYear: 1912, yStartInBS: "1968-09-17", yEndInBS: "1968-09-17" },
      { engYear: 1913, yStartInBS: "1969-09-18", yEndInBS: "1969-09-17" },
      { engYear: 1914, yStartInBS: "1970-09-18", yEndInBS: "1970-09-16" },
      { engYear: 1915, yStartInBS: "1971-09-17", yEndInBS: "1971-09-16" },
      { engYear: 1916, yStartInBS: "1972-09-17", yEndInBS: "1972-09-17" },
      { engYear: 1917, yStartInBS: "1973-09-18", yEndInBS: "1973-09-17" },
      { engYear: 1918, yStartInBS: "1974-09-18", yEndInBS: "1974-09-16" },
      { engYear: 1919, yStartInBS: "1975-09-17", yEndInBS: "1975-09-16" },
      { engYear: 1920, yStartInBS: "1976-09-17", yEndInBS: "1976-09-17" },
      { engYear: 1921, yStartInBS: "1977-09-18", yEndInBS: "1977-09-17" },
      { engYear: 1922, yStartInBS: "1978-09-18", yEndInBS: "1978-09-16" },
      { engYear: 1923, yStartInBS: "1979-09-17", yEndInBS: "1979-09-16" },
      { engYear: 1924, yStartInBS: "1980-09-17", yEndInBS: "1980-09-17" },
      { engYear: 1925, yStartInBS: "1981-09-18", yEndInBS: "1981-09-16" },
      { engYear: 1926, yStartInBS: "1982-09-17", yEndInBS: "1982-09-16" },
      { engYear: 1927, yStartInBS: "1983-09-17", yEndInBS: "1983-09-16" },
      { engYear: 1928, yStartInBS: "1984-09-17", yEndInBS: "1984-09-17" },
      { engYear: 1929, yStartInBS: "1985-09-18", yEndInBS: "1985-09-16" },
      { engYear: 1930, yStartInBS: "1986-09-17", yEndInBS: "1986-09-16" },
      { engYear: 1931, yStartInBS: "1987-09-18", yEndInBS: "1987-09-17" },
      { engYear: 1932, yStartInBS: "1988-09-17", yEndInBS: "1989-09-16" },
      { engYear: 1933, yStartInBS: "1989-09-17", yEndInBS: "1990-09-17" },
      { engYear: 1934, yStartInBS: "1990-09-18", yEndInBS: "1991-09-16" },
      { engYear: 1935, yStartInBS: "1991-09-17", yEndInBS: "1992-09-16" },
      { engYear: 1936, yStartInBS: "1992-09-17", yEndInBS: "1993-09-16" },
      { engYear: 1937, yStartInBS: "1993-09-17", yEndInBS: "1994-09-17" },
      { engYear: 1938, yStartInBS: "1994-09-18", yEndInBS: "1995-09-16" },
      { engYear: 1939, yStartInBS: "1995-09-17", yEndInBS: "1996-09-16" },
      //data below are verified and are correct.., but above this are not..
      { engYear: 1940, yStartInBS: "1996-09-17", yEndInBS: "1997-09-17" },
      { engYear: 1941, yStartInBS: "1997-09-18", yEndInBS: "1998-09-17" },
      { engYear: 1942, yStartInBS: "1998-09-18", yEndInBS: "1999-09-16" },
      { engYear: 1943, yStartInBS: "1999-09-17", yEndInBS: "2000-09-16" },
      { engYear: 1944, yStartInBS: "2000-09-17", yEndInBS: "2001-09-17" },
      { engYear: 1945, yStartInBS: "2001-09-18", yEndInBS: "2002-09-17" },
      { engYear: 1946, yStartInBS: "2002-09-18", yEndInBS: "2003-09-16" },
      { engYear: 1947, yStartInBS: "2003-09-17", yEndInBS: "2004-09-16" },
      { engYear: 1948, yStartInBS: "2004-09-17", yEndInBS: "2005-09-17" },
      { engYear: 1949, yStartInBS: "2005-09-18", yEndInBS: "2006-09-17" },
      { engYear: 1950, yStartInBS: "2006-09-18", yEndInBS: "2007-09-16" },
      { engYear: 1951, yStartInBS: "2007-09-17", yEndInBS: "2008-09-16" },
      { engYear: 1952, yStartInBS: "2008-09-17", yEndInBS: "2009-09-17" },
      { engYear: 1953, yStartInBS: "2009-09-18", yEndInBS: "2010-09-17" },
      { engYear: 1954, yStartInBS: "2010-09-18", yEndInBS: "2011-09-16" },
      { engYear: 1955, yStartInBS: "2011-09-17", yEndInBS: "2012-09-16" },
      { engYear: 1956, yStartInBS: "2012-09-17", yEndInBS: "2013-09-17" },
      { engYear: 1957, yStartInBS: "2013-09-18", yEndInBS: "2014-09-17" },
      { engYear: 1958, yStartInBS: "2014-09-18", yEndInBS: "2015-09-16" },
      { engYear: 1959, yStartInBS: "2015-09-17", yEndInBS: "2016-09-16" },
      { engYear: 1960, yStartInBS: "2016-09-17", yEndInBS: "2017-09-17" },
      { engYear: 1961, yStartInBS: "2017-09-18", yEndInBS: "2018-09-17" },
      { engYear: 1962, yStartInBS: "2018-09-18", yEndInBS: "2019-09-16" },
      { engYear: 1963, yStartInBS: "2019-09-17", yEndInBS: "2020-09-16" },
      { engYear: 1964, yStartInBS: "2020-09-17", yEndInBS: "2021-09-17" },
      { engYear: 1965, yStartInBS: "2021-09-18", yEndInBS: "2022-09-16" },
      { engYear: 1966, yStartInBS: "2022-09-17", yEndInBS: "2023-09-16" },
      { engYear: 1967, yStartInBS: "2023-09-17", yEndInBS: "2024-09-16" },
      { engYear: 1968, yStartInBS: "2024-09-17", yEndInBS: "2025-09-17" },
      { engYear: 1969, yStartInBS: "2025-09-18", yEndInBS: "2026-09-16" },
      { engYear: 1970, yStartInBS: "2026-09-17", yEndInBS: "2027-09-16" },
      { engYear: 1971, yStartInBS: "2027-09-17", yEndInBS: "2028-09-16" },
      { engYear: 1972, yStartInBS: "2028-09-17", yEndInBS: "2029-09-17" },
      { engYear: 1973, yStartInBS: "2029-09-18", yEndInBS: "2030-09-16" },
      { engYear: 1974, yStartInBS: "2030-09-17", yEndInBS: "2031-09-16" },
      { engYear: 1975, yStartInBS: "2031-09-17", yEndInBS: "2032-09-16" },
      { engYear: 1976, yStartInBS: "2032-09-17", yEndInBS: "2033-09-17" },
      { engYear: 1977, yStartInBS: "2033-09-18", yEndInBS: "2034-09-16" },
      { engYear: 1978, yStartInBS: "2034-09-17", yEndInBS: "2035-09-16" },
      { engYear: 1979, yStartInBS: "2035-09-17", yEndInBS: "2036-09-16" },
      { engYear: 1980, yStartInBS: "2036-09-17", yEndInBS: "2037-09-17" },
      { engYear: 1981, yStartInBS: "2037-09-18", yEndInBS: "2038-09-16" },
      { engYear: 1982, yStartInBS: "2038-09-17", yEndInBS: "2039-09-16" },
      { engYear: 1983, yStartInBS: "2039-09-17", yEndInBS: "2040-09-16" },
      { engYear: 1984, yStartInBS: "2040-09-17", yEndInBS: "2041-09-17" },
      { engYear: 1985, yStartInBS: "2041-09-18", yEndInBS: "2042-09-16" },
      { engYear: 1986, yStartInBS: "2042-09-17", yEndInBS: "2043-09-16" },
      { engYear: 1987, yStartInBS: "2043-09-17", yEndInBS: "2044-09-16" },
      { engYear: 1988, yStartInBS: "2044-09-17", yEndInBS: "2045-09-17" },
      { engYear: 1989, yStartInBS: "2045-09-18", yEndInBS: "2046-09-17" },
      { engYear: 1990, yStartInBS: "2046-09-17", yEndInBS: "2047-09-16" },
      { engYear: 1991, yStartInBS: "2047-09-17", yEndInBS: "2048-09-16" },
      { engYear: 1992, yStartInBS: "2048-09-17", yEndInBS: "2049-09-16" },
      { engYear: 1993, yStartInBS: "2049-09-17", yEndInBS: "2050-09-16" },
      { engYear: 1994, yStartInBS: "2050-09-17", yEndInBS: "2051-09-16" },
      { engYear: 1995, yStartInBS: "2051-09-17", yEndInBS: "2052-09-16" },
      { engYear: 1996, yStartInBS: "2052-09-17", yEndInBS: "2053-09-16" },
      { engYear: 1997, yStartInBS: "2053-09-17", yEndInBS: "2054-09-16" },
      { engYear: 1998, yStartInBS: "2054-09-17", yEndInBS: "2055-09-16" },
      { engYear: 1999, yStartInBS: "2055-09-17", yEndInBS: "2056-09-16" },
      { engYear: 2000, yStartInBS: "2056-09-17", yEndInBS: "2057-09-16" },
      { engYear: 2001, yStartInBS: "2057-09-17", yEndInBS: "2058-09-16" },
      { engYear: 2002, yStartInBS: "2058-09-17", yEndInBS: "2059-09-16" },
      { engYear: 2003, yStartInBS: "2059-09-17", yEndInBS: "2060-09-16" },
      { engYear: 2004, yStartInBS: "2060-09-17", yEndInBS: "2061-09-16" },
      { engYear: 2005, yStartInBS: "2061-09-17", yEndInBS: "2062-09-16" },
      { engYear: 2006, yStartInBS: "2062-09-17", yEndInBS: "2063-09-16" },
      { engYear: 2007, yStartInBS: "2063-09-17", yEndInBS: "2064-09-16" },
      { engYear: 2008, yStartInBS: "2064-09-17", yEndInBS: "2065-09-16" },
      { engYear: 2009, yStartInBS: "2065-09-17", yEndInBS: "2066-09-16" },
      { engYear: 2010, yStartInBS: "2066-09-17", yEndInBS: "2067-09-16" },
      { engYear: 2011, yStartInBS: "2067-09-17", yEndInBS: "2068-09-16" },
      { engYear: 2012, yStartInBS: "2068-09-17", yEndInBS: "2069-09-16" },
      { engYear: 2013, yStartInBS: "2069-09-17", yEndInBS: "2070-09-16" },
      { engYear: 2014, yStartInBS: "2070-09-17", yEndInBS: "2071-09-16" },
      { engYear: 2015, yStartInBS: "2071-09-17", yEndInBS: "2072-09-16" },
      { engYear: 2016, yStartInBS: "2072-09-17", yEndInBS: "2073-09-16" },
      { engYear: 2017, yStartInBS: "2073-09-17", yEndInBS: "2074-09-16" },
      { engYear: 2018, yStartInBS: "2074-09-17", yEndInBS: "2075-09-16" },
      { engYear: 2019, yStartInBS: "2075-09-17", yEndInBS: "2076-09-15" },
      { engYear: 2020, yStartInBS: "2076-09-16", yEndInBS: "2077-09-16" },
      { engYear: 2021, yStartInBS: "2077-09-17", yEndInBS: "2078-09-16" },
      { engYear: 2022, yStartInBS: "2078-09-17", yEndInBS: "2079-09-16" },
      { engYear: 2023, yStartInBS: "2079-09-17", yEndInBS: "2080-09-15" },
      { engYear: 2024, yStartInBS: "2080-09-16", yEndInBS: "2081-09-16" },
      { engYear: 2025, yStartInBS: "2081-09-17", yEndInBS: "2082-09-16" },
      { engYear: 2026, yStartInBS: "2082-09-17", yEndInBS: "2083-09-16" },
      { engYear: 2027, yStartInBS: "2083-09-17", yEndInBS: "2084-09-16" },
      { engYear: 2028, yStartInBS: "2084-09-17", yEndInBS: "2085-09-16" },
      { engYear: 2029, yStartInBS: "2085-09-17", yEndInBS: "2086-09-16" },
      { engYear: 2030, yStartInBS: "2086-09-17", yEndInBS: "2087-09-15" },
      { engYear: 2031, yStartInBS: "2087-09-16", yEndInBS: "2088-09-15" },
      { engYear: 2032, yStartInBS: "2088-09-16", yEndInBS: "2089-09-16" },
      { engYear: 2033, yStartInBS: "2089-09-17", yEndInBS: "2090-09-16" },
      { engYear: 2034, yStartInBS: "2090-09-17", yEndInBS: "2091-09-15" },
      { engYear: 2035, yStartInBS: "2091-09-16", yEndInBS: "2092-09-15" },
      { engYear: 2036, yStartInBS: "2092-09-16", yEndInBS: "2093-09-16" },
      { engYear: 2037, yStartInBS: "2093-09-17", yEndInBS: "2094-09-16" },
      { engYear: 2038, yStartInBS: "2094-09-17", yEndInBS: "2095-09-16" },
      { engYear: 2039, yStartInBS: "2095-09-17", yEndInBS: "2096-09-16" },
      { engYear: 2040, yStartInBS: "2096-09-17", yEndInBS: "2097-09-16" }
    ];
    return engYearsHash;
  }

  //gets 13month's days starting from Poush-XXXX BS to Poush-(XXX+1) BS
  //13months are needed since the english year starts from Poush and Ends on Poush of Nepali Year.
  //Poush to Poush (INCLUSIVE) becomes 13 months.
  public GetDaysInMonthOfNext13NepaliMonthsIncludingCurrentMth(bsYr: number): Array<number> {
    let nep13MonthsDays = [];
    //get month_days of currentYear.
    //every english year starts from 9th Nepali month: i.e. Poush so start from 9th i.e index=8.
    let currNepYrMonths = this.yr_mth_bs[bsYr];
    nep13MonthsDays.push(currNepYrMonths[8]);
    nep13MonthsDays.push(currNepYrMonths[9]);
    nep13MonthsDays.push(currNepYrMonths[10]);
    nep13MonthsDays.push(currNepYrMonths[11]);

    let nextNepYrMonths = this.yr_mth_bs[bsYr + 1];
    nep13MonthsDays.push(nextNepYrMonths[0]);
    nep13MonthsDays.push(nextNepYrMonths[1]);
    nep13MonthsDays.push(nextNepYrMonths[2]);
    nep13MonthsDays.push(nextNepYrMonths[3]);
    nep13MonthsDays.push(nextNepYrMonths[4]);
    nep13MonthsDays.push(nextNepYrMonths[5]);
    nep13MonthsDays.push(nextNepYrMonths[6]);
    nep13MonthsDays.push(nextNepYrMonths[7]);
    //add Poush of next year as well, since December month spans from around 15Mangshir to 16Poush of Nep-Calendar.
    nep13MonthsDays.push(nextNepYrMonths[8]);
    return nep13MonthsDays;
  }
  ////Codes which might come into future use.
  //GetEngMonthsOfYear(engYear: number): Array<number> {
  //    let engMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  //    //make feb as 29days if it's leap year.
  //    if (this.IsLeapYear(engYear)) {
  //        engMonthDays[1] = 29;
  //    }
  //    return engMonthDays;
  //}
  //IsLeapYear(year: number): boolean {
  //    return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
  //}


  //Below are all the Static Functions for Static Use of this service
  static ConvertEngToNepaliFormatted_static(engDate: string = null, format: string): string {
    let npDate: NepaliDate;
    if (engDate) {
      npDate = this.ConvertEngToNepDate_static(engDate);
    }
    else {
      npDate = this.GetTodaysNepDate_static();
    }

    //adding extra zero on Monty and Day if it's one digit
    let mthString = npDate.Month < 10 ? "0" + npDate.Month : npDate.Month.toString();
    let dayString = npDate.Day < 10 ? "0" + npDate.Day : npDate.Day.toString();
    let hourString = npDate.Hours < 10 ? "0" + npDate.Hours : npDate.Hours.toString();
    let minuteString = npDate.Minutes < 10 ? "0" + npDate.Minutes : npDate.Minutes.toString();


    if (format == 'DD') {
      return dayString;
    }
    else if (format == 'MM') {
      return mthString;
    }
    else if (format == 'YYYY') {
      return npDate.Year.toString();
    }
    else if (format == 'YYYY-MM-DD hh:mm') {
      return npDate.Year + "-" + mthString + "-" + dayString + " " + hourString + ":" + minuteString;
    }
    else {
      return npDate.Year + "-" + mthString + "-" + dayString;
    }

  }

  static ConvertEngToNepDate_static(engDate: string): NepaliDate {
    ///extract and assign datetime parts to each variables.
    let dateObject = moment(engDate).toObject();
    let ampm = moment(engDate).format('A');
    dateObject.months = parseInt(moment(engDate).format('MM'));
    dateObject.hours = parseInt(moment(engDate).format('hh'));
    var engYY: number = moment().toObject().years;
    //this is english date: 1900. 
    if (dateObject.years > 1900 && dateObject.years < 2040) {
      engYY = dateObject.years;
    }


    let engMM: number = dateObject.months;
    let engDD: number = dateObject.date;
    let engHRS: number = dateObject.hours;
    let engMNT: number = dateObject.minutes;
    let engAMPM: string = ampm;


    let retNepDate: NepaliDate = new NepaliDate();

    let engCalYearInfo = this.GetEngCalendarYearInfo();

    //for current english year, get StartOfNepaliYear.

    let yrStartInBs = engCalYearInfo.filter(a => a.engYear == engYY)[0].yStartInBS;

    //get BS dates into 3 different variables.
    let bsDates = yrStartInBs.split('-');
    let bsYr = parseInt(bsDates[0]);
    let bsMth = parseInt(bsDates[1]);
    let bsDay = parseInt(bsDates[2]);


    //calculate total days to add from the begining of the given english year.
    let ipEngDate = engYY.toString() + '-' + engMM + '-' + engDD;
    let ipEngYearStart = engYY.toString() + '-01-01';
    let daysToAdd = moment(ipEngDate).diff(moment(ipEngYearStart), 'days');

    let nepCalMths = this.GetDaysInMonthOfNext13NepMonthsIncCurrentMth_static(bsYr);

    //if days to add is lesser than remaining days in currentnepalimonth, that means days will be in current nepali month only.
    //for which Just add the remaining days.
    if (daysToAdd <= (nepCalMths[0] - bsDay)) {
      bsDay = bsDay + daysToAdd;
    }
    else {
      //if daystoadd is going over current month's max days, increment Month, re-calculate daysToAdd and reset bsDays.
      if ((bsDay + daysToAdd) > nepCalMths[0]) {
        bsMth += 1;
        daysToAdd = daysToAdd - (nepCalMths[0] - bsDay) - 1;
        bsDay = 1;
      }

      //loop from nextmonth of nepalicalendar.
      //LOOP FROM 1 to 12th Index (There are fixed 13items in nepCalMths Array)
      for (var i = 1; i < 13; i++) {
        if (daysToAdd >= (nepCalMths[i])) {
          daysToAdd = daysToAdd - (nepCalMths[i]);
          bsMth += 1;
          //reset year and month once month goes above 12.
          if (bsMth > 12) {
            bsYr += 1;
            bsMth = 1;
          }
        }
        else {
          bsDay = bsDay + daysToAdd;
          break;
        }
      }
    }

    let bsHours: number = 0;
    let bsMinutes: number = 0;
    let bsAMPM: string = "";
    if (engHRS) {
      bsHours = NepaliHours.GetAllNepaliHours().find(a => a.hoursNumber == engHRS).hoursNumber;
    }
    if (engMNT) {
      bsMinutes = NepaliMinutes.GetAllNepaliMinutes().find(a => a.minutesNumber == engMNT).minutesNumber;
    }
    if (engAMPM) {
      bsAMPM = engAMPM;
    }
    retNepDate.Day = bsDay;
    retNepDate.Month = bsMth;
    retNepDate.Year = bsYr;
    retNepDate.Hours = bsHours;
    retNepDate.Minutes = bsMinutes;
    retNepDate.AMPM = bsAMPM;


    ////sud:21Aug'19-this will reload the nepali calendar's days in the month..
    //this.nepDaysInSelectedMonth = this.GetDaysOfMonthBS(retNepDate.Year, retNepDate.Month);

    return retNepDate;

  }

  static GetDaysInMonthOfNext13NepMonthsIncCurrentMth_static(bsYr: number): Array<number> {
    let nep13MonthsDays = [];
    //get month_days of currentYear.
    //every english year starts from 9th Nepali month: i.e. Poush so start from 9th i.e index=8.
    let currNepYrMonths = this.yr_mth_bs_static[bsYr];
    nep13MonthsDays.push(currNepYrMonths[8]);
    nep13MonthsDays.push(currNepYrMonths[9]);
    nep13MonthsDays.push(currNepYrMonths[10]);
    nep13MonthsDays.push(currNepYrMonths[11]);

    let nextNepYrMonths = this.yr_mth_bs_static[bsYr + 1];
    nep13MonthsDays.push(nextNepYrMonths[0]);
    nep13MonthsDays.push(nextNepYrMonths[1]);
    nep13MonthsDays.push(nextNepYrMonths[2]);
    nep13MonthsDays.push(nextNepYrMonths[3]);
    nep13MonthsDays.push(nextNepYrMonths[4]);
    nep13MonthsDays.push(nextNepYrMonths[5]);
    nep13MonthsDays.push(nextNepYrMonths[6]);
    nep13MonthsDays.push(nextNepYrMonths[7]);
    //add Poush of next year as well, since December month spans from around 15Mangshir to 16Poush of Nep-Calendar.
    nep13MonthsDays.push(nextNepYrMonths[8]);
    return nep13MonthsDays;
  }

  static GetTodaysNepDate_static(): NepaliDate {
    let engDateToday = moment().format('YYYY-MM-DDTHH:mm');
    let nepDateToday = this.ConvertEngToNepDate_static(engDateToday);
    return nepDateToday;
  }

  IsNepaliDateValid(engDate: string, minDateMoment, maxDateMoment) {
    let engMoment = moment(engDate);
    let isValid: boolean = moment(engMoment).isBetween(minDateMoment, maxDateMoment, undefined, '[]');
    return isValid;
  }

  //sud:19Sept'20--To ger Start date and end date (in AD) for current selected Nepali Month.
  //used in Accounting and other modules.
  //Usage Example: GetStartEndDatesOfNepaliMonth_InEngFormat(2077,4) to get Start/EndDate of 2077-Shrawan Month. 
  //Usage Example: GetStartEndDatesOfNepaliMonth_InEngFormat(2075,9) to get Start/EndDate of 2075-Poush Month. 
  public GetStartEndDatesOfNepaliMonth_InEngFormat(nepYearNo: number, nepMonthNo: number) {
    let mthIndex = nepMonthNo - 1;//index will be current-1
    let totalDaysInNepMonth = NepaliCalendarService.yr_mth_bs_static[nepYearNo][mthIndex];
    let mthStart_np = nepYearNo.toString() + "-" + nepMonthNo.toString() + "-1";//first date will always be 1
    let mthEnd_np = nepYearNo.toString() + "-" + nepMonthNo.toString() + "-" + totalDaysInNepMonth;//this gives us last date of the month.

    let mthStart_en = this.ConvertNepStringToEngString(mthStart_np);
    let mthEnd_en = this.ConvertNepStringToEngString(mthEnd_np);

    return { StartDate: mthStart_en, EndDate: mthEnd_en };
  }

}

