using System;
using System.Collections.Generic;

namespace DanpheEMR.Utilities
{
    //class for convert English Date to Nepali Date and vice versa
    public class DanpheDateConvertor
    {
        public DanpheDateConvertor()
        {

        }
        //all Metadata contain by this class
        // private NepaliDateModel nepaliDateModel = new NepaliDateModel();
        //Model for Nepali Date
        private NepaliDateType nepaliDateType = new NepaliDateType();

        //Convert Nepali Date to English Date
        //Get Nepali Date(12 hours format)
        //Return English Date (DateTime format)24 hours format
        public static DateTime ConvertNepToEngDate(NepaliDateType nepaliDate)
        {
            try
            {
                DateTime returnEnglishDate = new DateTime();
                //if anything is empty then return null value.
                if (nepaliDate.Year > 0 && nepaliDate.Month > 0 && nepaliDate.Day > 0)
                {
                    DateTime calYearStartEng = DateTime.Parse(NepaliDateModel.calYear.Find(a => a.CYear == nepaliDate.Year).YearStart);
                    List<int> yrMth = NepaliDateModel.yr_mth[nepaliDate.Year];
                    int daysToAdd = 0;
                    for (int i = 0; i < nepaliDate.Month - 1; i++)
                    {
                        daysToAdd += yrMth[i];
                    }
                    daysToAdd += nepaliDate.Day - 1;
                    string retEngDate = calYearStartEng.AddDays(daysToAdd).ToShortDateString();
                    if (nepaliDate.AMPM == "AM")
                    {
                        if (nepaliDate.Hours == 12) { nepaliDate.Hours = 0; }
                    }
                    else
                    {
                        if (nepaliDate.Hours != 12)
                        {
                            nepaliDate.Hours = nepaliDate.Hours + 12;
                        }
                    }
                    string hrsStr = nepaliDate.Hours.ToString().Length == 1 ? "0" + nepaliDate.Hours.ToString() : nepaliDate.Hours.ToString();
                    string minStr = nepaliDate.Minutes.ToString().Length == 1 ? "0" + nepaliDate.Minutes.ToString() : nepaliDate.Minutes.ToString();
                    string hrsMNTStr = hrsStr + ":" + minStr;
                    returnEnglishDate = Convert.ToDateTime(retEngDate + " " + hrsMNTStr);

                }
                return returnEnglishDate;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        //Convert English Date to Nepali Date
        //Get Englis Date(24 hours format) and Return Nepali Date(12 hours format)
        //English Date -DateTime.Now- format
        public static NepaliDateType ConvertEngToNepDate(DateTime engDate)
        {
            // NepaliDateType nepaliDate = new NepaliDateType();
            NepaliDateType retNepDate = new NepaliDateType();
            try
            {
                if (engDate != null && engDate.Year > 1900 && engDate.Year < 2032)
                {
                    string AMPM = (engDate.Hour > 11) ? "PM" : "AM";
                    int hours = Convert.ToInt32(engDate.ToString("hh"));
                    string yrStartInBs = NepaliDateModel.engYearsHash.Find(a => a.engYear == engDate.Year).yStartInBS;
                    string[] bsDate = yrStartInBs.Split('-');
                    int bsYr = Convert.ToInt32(bsDate[0]);
                    int bsMth = Convert.ToInt32(bsDate[1]);
                    int bsDay = Convert.ToInt32(bsDate[2]);
                    string ipEngDate = engDate.Year.ToString() + "-" + engDate.Month + "-" + engDate.Day;
                    string ipEngYearStart = engDate.Year.ToString() + "-01-01";
                    DateTime ipEngdt = DateTime.Parse(ipEngDate);
                    DateTime ipEngYearStartDt = DateTime.Parse(ipEngYearStart);
                    TimeSpan diffDays = ipEngdt - ipEngYearStartDt;
                    int daysToAdd = diffDays.Days;
                    List<int> nepCalMth = NepaliDateModel.GetDaysInMonthOfNext13NepaliMonthsIncludingCurrentMth(bsYr);
                    //if days to add is lesser than remaining days in currentnepalimonth, that means days will be in current nepali month only.
                    //for which Just add the remaining days.
                    if (daysToAdd <= (nepCalMth[0] - bsDay))
                    {
                        bsDay = bsDay + daysToAdd;
                    }
                    else
                    {
                        //if daystoadd is going over current month's max days, increment Month, re-calculate daysToAdd and reset bsDays.
                        if ((bsDay + daysToAdd) > nepCalMth[0])
                        {
                            bsMth += 1;
                            daysToAdd = daysToAdd - (nepCalMth[0] - bsDay) - 1;
                            bsDay = 1;

                        }
                        //loop from nextmonth of nepalicalendar.
                        //LOOP FROM 1 to 12th Index (There are fixed 13items in nepCalMths Array)
                        for (var i = 1; i < 13; i++)
                        {
                            if (daysToAdd >= (nepCalMth[i]))
                            {
                                daysToAdd = daysToAdd - (nepCalMth[i]);
                                bsMth += 1;
                                //reset year and month once month goes above 12.
                                if (bsMth > 12)
                                {
                                    bsYr += 1;
                                    bsMth = 1;
                                }
                            }
                            else
                            {
                                bsDay = bsDay + daysToAdd;
                                break;
                            }
                        }

                    }
                    int bsHours = 0;
                    int bsMinutes = 0;
                    string bsAMPM = "";
                    if (hours > 0 && hours < 13)
                    {
                        bsHours = NepaliDateModel.NepaliHoursList.Find(a => a.HoursNumberEng == hours).HoursNumberEng;
                    }
                    if (engDate.Minute >= 0 && engDate.Minute <= 59)
                    {
                        bsMinutes = NepaliDateModel.NepaliMinutesList.Find(a => a.MinutesNumberEng == engDate.Minute).MinutesNumberEng;
                    }
                    if (AMPM.Length > 0)
                    {
                        bsAMPM = AMPM;
                    }
                    retNepDate.Day = bsDay;
                    retNepDate.Month = bsMth;
                    retNepDate.Year = bsYr;
                    retNepDate.Hours = bsHours;
                    retNepDate.Minutes = bsMinutes;
                    retNepDate.AMPM = bsAMPM;

                }
                else
                {

                }
                return retNepDate;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        //Return todays nepali date
        public static NepaliDateType GetTodaysNepDate()
        {
            try
            {
                DateTime engDateToday = DateTime.Now;
                NepaliDateType nepDateToday = DanpheDateConvertor.ConvertEngToNepDate(engDateToday);
                return nepDateToday;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
    public class NepaliDateType
    {
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public int Hours { get; set; }
        public int Minutes { get; set; }
        public string AMPM { get; set; }
    }
    public static class NepaliDateModel
    {
        //All data in list and properties
        public static List<NepaliYear> NepaliYearList = new List<NepaliYear>();
        public static List<NepaliMonth> NepaliMonthList = new List<NepaliMonth>();
        public static List<NepaliDay> NepaliDayList = new List<NepaliDay>();
        public static List<NepaliHours> NepaliHoursList = new List<NepaliHours>();
        public static List<NepaliMinutes> NepaliMinutesList = new List<NepaliMinutes>();
        public static List<NepaliAMPM> NepaliAMPMList = new List<NepaliAMPM>();
        public static IReadOnlyDictionary<int, List<int>> yr_mth = new Dictionary<int, List<int>>();

        //constructor for initialize all properties
        static NepaliDateModel()
        {
            NepaliYearList = NepaliYear.NepaliYears;
            NepaliMonthList = NepaliMonth.NepaliMonths;
            NepaliDayList = NepaliDay.NepaliDays;
            NepaliHoursList = NepaliHours.NepaliHoursList;
            NepaliMinutesList = NepaliMinutes.NepaliMinutesList;
            NepaliAMPMList = NepaliAMPM.NepaliAMPMList;
            yr_mth = LoadNepYear_MthHash();
        }

        //Nepali Year Month Hash dictionary data
        //LoadNepYear_MthHash()
        public static IReadOnlyDictionary<int, List<int>> LoadNepYear_MthHash()
        {
            //Dictionary now allowed duplicate KeyName
            //in below dictionary Year as KeyName
            IReadOnlyDictionary<int, List<int>> Localyr_mth = new Dictionary<int, List<int>>
            {
                  ///data from 1950 to 2000 are not verified: sudarshan15Jul2017
                  ///below Year is as KeyName- Unique
            {1950,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {1951,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1952,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1953,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {1954,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {1955,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1956,new List<int>{31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30} },
            {1957,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {1958,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {1959,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1960,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {1961,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {1962,new List<int>{30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31} },
            {1963,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1964,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {1965,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {1966,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31} },
            {1967,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1968,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {1969,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {1970,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {1971,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1972,new List<int>{31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {1973,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {1974,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1975,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1976,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {1977,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {1978,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1979,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {1980,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {1981,new List<int>{31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1982,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1983,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1984,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1985,new List<int>{31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {1986,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1987,new List<int>{31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30} },
            {1988,new List<int>{30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {1989,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1990,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1991,new List<int>{31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1992,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1993,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1994,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1995,new List<int>{31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {1996,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {1997,new List<int>{31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30} },
            {1998,new List<int>{30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {1999,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2000,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2001,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2002,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2003,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2004,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2005,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2006,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2007,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2008,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31} },
            {2009,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2010,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2011,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2012,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {2013,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2014,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2015,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2016,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {2017,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2018,new List<int>{31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2019,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2020,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2021,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2022,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {2023,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2024,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2025,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2026,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2027,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2028,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2029,new List<int>{31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30} },
            {2030,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2031,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2032,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2033,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2034,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2035,new List<int>{30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31} },
            {2036,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2037,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2038,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2039,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {2040,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2041,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2042,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2043,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {2044,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2045,new List<int>{31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2046,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2047,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2048,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2049,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {2050,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2051,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2052,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2053,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {2054,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2055,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2056,new List<int>{31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30} },
            {2057,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2058,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2059,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2060,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2061,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2062,new List<int>{30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31} },
            {2063,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2064,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2065,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2066,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31} },
            {2067,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2068,new List<int>{31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2069,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2070,new List<int>{31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30} },
            {2071,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2072,new List<int>{31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30} },
            {2073,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31} },
            {2074,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2075,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2076,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {2077,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31} },
            {2078,new List<int>{31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2079,new List<int>{31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30} },
            {2080,new List<int>{31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30} },
            {2081,new List<int>{31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2082,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2083,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2084,new List<int>{31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2085,new List<int>{31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {2086,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2087,new List<int>{31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30} },
            {2088,new List<int>{30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30} },
            {2089,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} },
            {2090,new List<int>{30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30} }
            };
            return Localyr_mth;
        }

        // private GetNepaliCalendarYearInfo(): Array<any> {

        public static List<calYearType> calYear = new List<calYearType> { 
                //Nepali calendar year data from 1950 BS to 2000 BS are not verified
                //CYear is BS Year
                new calYearType(){ CYear= 1950, YearStart= "Apr 13 1893", YearEnd= "Apr 13 1894" },
                new calYearType(){ CYear= 1951, YearStart= "Apr 14 1894", YearEnd= "Apr 13 1895" },
                new calYearType(){ CYear= 1952, YearStart= "Apr 14 1895", YearEnd= "Apr 12 1896" },
                new calYearType(){ CYear= 1953, YearStart= "Apr 13 1896", YearEnd= "Apr 12 1897" },
                new calYearType(){ CYear= 1954, YearStart= "Apr 13 1897", YearEnd= "Apr 13 1898" },
                new calYearType(){ CYear= 1955, YearStart= "Apr 14 1898", YearEnd= "Apr 13 1899" },
                new calYearType(){ CYear= 1956, YearStart= "Apr 14 1899", YearEnd= "Apr 12 1900" },
                new calYearType(){ CYear= 1957, YearStart= "Apr 13 1900", YearEnd= "Apr 13 1901" },
                new calYearType(){ CYear= 1958, YearStart= "Apr 14 1901", YearEnd= "Apr 13 1902" },
                new calYearType(){ CYear= 1959, YearStart= "Apr 14 1902", YearEnd= "Apr 13 1903" },
                new calYearType(){ CYear= 1960, YearStart= "Apr 14 1903", YearEnd= "Apr 12 1904" },
                new calYearType(){ CYear= 1961, YearStart= "Apr 13 1904", YearEnd= "Apr 13 1905" },
                new calYearType(){ CYear= 1962, YearStart= "Apr 14 1905", YearEnd= "Apr 13 1906" },
                new calYearType(){ CYear= 1963, YearStart= "Apr 14 1906", YearEnd= "Apr 13 1907" },
                new calYearType(){ CYear= 1964, YearStart= "Apr 14 1907", YearEnd= "Apr 12 1908" },
                new calYearType(){ CYear= 1965, YearStart= "Apr 13 1908", YearEnd= "Apr 13 1909" },
                new calYearType(){ CYear= 1966, YearStart= "Apr 14 1909", YearEnd= "Apr 13 1910" },
                new calYearType(){ CYear= 1967, YearStart= "Apr 14 1910", YearEnd= "Apr 13 1911" },
                new calYearType(){ CYear= 1968, YearStart= "Apr 14 1911", YearEnd= "Apr 12 1912" },
                new calYearType(){ CYear= 1969, YearStart= "Apr 13 1912", YearEnd= "Apr 13 1913" },
                new calYearType(){ CYear= 1970, YearStart= "Apr 14 1913", YearEnd= "Apr 13 1914" },
                new calYearType(){ CYear= 1971, YearStart= "Apr 14 1914", YearEnd= "Apr 13 1915" },
                new calYearType(){ CYear= 1972, YearStart= "Apr 14 1915", YearEnd= "Apr 12 1916" },
                new calYearType(){ CYear= 1973, YearStart= "Apr 13 1916", YearEnd= "Apr 13 1917" },
                new calYearType(){ CYear= 1974, YearStart= "Apr 14 1917", YearEnd= "Apr 13 1918" },
                new calYearType(){ CYear= 1975, YearStart= "Apr 14 1918", YearEnd= "Apr 13 1919" },
                new calYearType(){ CYear= 1976, YearStart= "Apr 14 1919", YearEnd= "Apr 12 1920" },
                new calYearType(){ CYear= 1977, YearStart= "Apr 13 1920", YearEnd= "Apr 13 1921" },
                new calYearType(){ CYear= 1978, YearStart= "Apr 14 1921", YearEnd= "Apr 13 1922" },
                new calYearType(){ CYear= 1979, YearStart= "Apr 14 1922", YearEnd= "Apr 13 1923" },
                new calYearType(){ CYear= 1980, YearStart= "Apr 14 1923", YearEnd= "Apr 12 1924" },
                new calYearType(){ CYear= 1981, YearStart= "Apr 13 1924", YearEnd= "Apr 13 1925" },
                new calYearType(){ CYear= 1982, YearStart= "Apr 14 1925", YearEnd= "Apr 13 1926" },
                new calYearType(){ CYear= 1983, YearStart= "Apr 14 1926", YearEnd= "Apr 13 1927" },
                new calYearType(){ CYear= 1984, YearStart= "Apr 14 1927", YearEnd= "Apr 12 1928" },
                new calYearType(){ CYear= 1985, YearStart= "Apr 13 1928", YearEnd= "Apr 13 1929" },
                new calYearType(){ CYear= 1986, YearStart= "Apr 14 1929", YearEnd= "Apr 13 1930" },
                new calYearType(){ CYear= 1987, YearStart= "Apr 14 1930", YearEnd= "Apr 14 1931" },
                new calYearType(){ CYear= 1988, YearStart= "Apr 15 1931", YearEnd= "Apr 13 1932" },
                new calYearType(){ CYear= 1989, YearStart= "Apr 14 1932", YearEnd= "Apr 13 1933" },
                new calYearType(){ CYear= 1990, YearStart= "Apr 14 1933", YearEnd= "Apr 13 1934" },
                new calYearType(){ CYear= 1991, YearStart= "Apr 14 1934", YearEnd= "Apr 14 1935" },
                new calYearType(){ CYear= 1992, YearStart= "Apr 15 1935", YearEnd= "Apr 13 1936" },
                new calYearType(){ CYear= 1993, YearStart= "Apr 14 1936", YearEnd= "Apr 13 1937" },
                new calYearType(){ CYear= 1994, YearStart= "Apr 14 1937", YearEnd= "Apr 13 1938" },
                new calYearType(){ CYear= 1995, YearStart= "Apr 14 1938", YearEnd= "Apr 14 1939" },
                new calYearType(){ CYear= 1996, YearStart= "Apr 15 1939", YearEnd= "Apr 12 1940" },
                new calYearType(){ CYear= 1997, YearStart= "Apr 13 1940", YearEnd= "Apr 13 1941" },
                new calYearType(){ CYear= 1998, YearStart= "Apr 14 1941", YearEnd= "Apr 13 1942" },
                new calYearType(){ CYear= 1999, YearStart= "Apr 14 1942", YearEnd= "Apr 13 1943" },
                new calYearType(){ CYear= 2000, YearStart= "Apr 14 1943", YearEnd= "Apr 12 1944" },  //VERY IMPORTANT---                       
                new calYearType(){ CYear= 2001, YearStart= "Apr 13 1944", YearEnd= "Apr 12 1945" },//Nepali calendar year data below thhis are verified, but above this are not
                new calYearType(){ CYear= 2002, YearStart= "Apr 13 1945", YearEnd= "Apr 12 1946" },
                new calYearType(){ CYear= 2003, YearStart= "Apr 13 1946", YearEnd= "Apr 13 1947" },
                new calYearType(){ CYear= 2004, YearStart= "Apr 14 1947", YearEnd= "Apr 12 1948" },
                new calYearType(){ CYear= 2005, YearStart= "Apr 13 1948", YearEnd= "Apr 12 1949" },
                new calYearType(){ CYear= 2006, YearStart= "Apr 13 1949", YearEnd= "Apr 12 1950" },
                new calYearType(){ CYear= 2007, YearStart= "Apr 13 1950", YearEnd= "Apr 13 1951" },
                new calYearType(){ CYear= 2008, YearStart= "Apr 14 1951", YearEnd= "Apr 12 1952" },
                new calYearType(){ CYear= 2009, YearStart= "Apr 13 1952", YearEnd= "Apr 12 1953" },
                new calYearType(){ CYear= 2010, YearStart= "Apr 13 1953", YearEnd= "Apr 12 1954" },
                new calYearType(){ CYear= 2011, YearStart= "Apr 13 1954", YearEnd= "Apr 13 1955" },
                new calYearType(){ CYear= 2012, YearStart= "Apr 14 1955", YearEnd= "Apr 12 1956" },
                new calYearType(){ CYear= 2013, YearStart= "Apr 13 1956", YearEnd= "Apr 12 1957" },
                new calYearType(){ CYear= 2014, YearStart= "Apr 13 1957", YearEnd= "Apr 12 1958" },
                new calYearType(){ CYear= 2015, YearStart= "Apr 13 1958", YearEnd= "Apr 13 1959" },
                new calYearType(){ CYear= 2016, YearStart= "Apr 14 1959", YearEnd= "Apr 12 1960" },
                new calYearType(){ CYear= 2017, YearStart= "Apr 13 1960", YearEnd= "Apr 12 1961" },
                new calYearType(){ CYear= 2018, YearStart= "Apr 13 1961", YearEnd= "Apr 12 1962" },
                new calYearType(){ CYear= 2019, YearStart= "Apr 13 1962", YearEnd= "Apr 13 1963" },
                new calYearType(){ CYear= 2020, YearStart= "Apr 14 1963", YearEnd= "Apr 12 1964" },
                new calYearType(){ CYear= 2021, YearStart= "Apr 13 1964", YearEnd= "Apr 12 1965" },
                new calYearType(){ CYear= 2022, YearStart= "Apr 13 1965", YearEnd= "Apr 12 1966" },
                new calYearType(){ CYear= 2023, YearStart= "Apr 13 1966", YearEnd= "Apr 13 1967" },
                new calYearType(){ CYear= 2024, YearStart= "Apr 14 1967", YearEnd= "Apr 12 1968" },
                new calYearType(){ CYear= 2025, YearStart= "Apr 13 1968", YearEnd= "Apr 12 1969" },
                new calYearType(){ CYear= 2026, YearStart= "Apr 13 1969", YearEnd= "Apr 13 1970" },
                new calYearType(){ CYear= 2027, YearStart= "Apr 14 1970", YearEnd= "Apr 13 1971" },
                new calYearType(){ CYear= 2028, YearStart= "Apr 14 1971", YearEnd= "Apr 12 1972" },
                new calYearType(){ CYear= 2029, YearStart= "Apr 13 1972", YearEnd= "Apr 12 1973" },
                new calYearType(){ CYear= 2030, YearStart= "Apr 13 1973", YearEnd= "Apr 13 1974" },
                new calYearType(){ CYear= 2031, YearStart= "Apr 14 1974", YearEnd= "Apr 13 1975" },
                new calYearType(){ CYear= 2032, YearStart= "Apr 14 1975", YearEnd= "Apr 12 1976" },
                new calYearType(){ CYear= 2033, YearStart= "Apr 13 1976", YearEnd= "Apr 12 1977" },
                new calYearType(){ CYear= 2034, YearStart= "Apr 13 1977", YearEnd= "Apr 13 1978" },
                new calYearType(){ CYear= 2035, YearStart= "Apr 14 1978", YearEnd= "Apr 13 1979" },
                new calYearType(){ CYear= 2036, YearStart= "Apr 14 1979", YearEnd= "Apr 12 1980" },
                new calYearType(){ CYear= 2037, YearStart= "Apr 13 1980", YearEnd= "Apr 12 1981" },
                new calYearType(){ CYear= 2038, YearStart= "Apr 13 1981", YearEnd= "Apr 13 1982" },
                new calYearType(){ CYear= 2039, YearStart= "Apr 14 1982", YearEnd= "Apr 13 1983" },
                new calYearType(){ CYear= 2040, YearStart= "Apr 14 1983", YearEnd= "Apr 12 1984" },
                new calYearType(){ CYear= 2041, YearStart= "Apr 13 1984", YearEnd= "Apr 12 1985" },
                new calYearType(){ CYear= 2042, YearStart= "Apr 13 1985", YearEnd= "Apr 13 1986" },
                new calYearType(){ CYear= 2043, YearStart= "Apr 14 1986", YearEnd= "Apr 13 1987" },
                new calYearType(){ CYear= 2044, YearStart= "Apr 14 1987", YearEnd= "Apr 12 1988" },
                new calYearType(){ CYear= 2045, YearStart= "Apr 13 1988", YearEnd= "Apr 12 1989" },
                new calYearType(){ CYear= 2046, YearStart= "Apr 13 1989", YearEnd= "Apr 13 1990" },
                new calYearType(){ CYear= 2047, YearStart= "Apr 14 1990", YearEnd= "Apr 13 1991" },
                new calYearType(){ CYear= 2048, YearStart= "Apr 14 1991", YearEnd= "Apr 12 1992" },
                new calYearType(){ CYear= 2049, YearStart= "Apr 13 1992", YearEnd= "Apr 12 1993" },
                new calYearType(){ CYear= 2050, YearStart= "Apr 13 1993", YearEnd= "Apr 13 1994" },
                new calYearType(){ CYear= 2051, YearStart= "Apr 14 1994", YearEnd= "Apr 13 1995" },
                new calYearType(){ CYear= 2052, YearStart= "Apr 14 1995", YearEnd= "Apr 12 1996" },
                new calYearType(){ CYear= 2053, YearStart= "Apr 13 1996", YearEnd= "Apr 12 1997" },
                new calYearType(){ CYear= 2054, YearStart= "Apr 13 1997", YearEnd= "Apr 13 1998" },
                new calYearType(){ CYear= 2055, YearStart= "Apr 14 1998", YearEnd= "Apr 13 1999" },
                new calYearType(){ CYear= 2056, YearStart= "Apr 14 1999", YearEnd= "Apr 12 2000" },
                new calYearType(){ CYear= 2057, YearStart= "Apr 13 2000", YearEnd= "Apr 13 2001" },
                new calYearType(){ CYear= 2058, YearStart= "Apr 14 2001", YearEnd= "Apr 13 2002" },
                new calYearType(){ CYear= 2059, YearStart= "Apr 14 2002", YearEnd= "Apr 13 2003" },
                new calYearType(){ CYear= 2060, YearStart= "Apr 14 2003", YearEnd= "Apr 12 2004" },
                new calYearType(){ CYear= 2061, YearStart= "Apr 13 2004", YearEnd= "Apr 13 2005" },
                new calYearType(){ CYear= 2062, YearStart= "Apr 14 2005", YearEnd= "Apr 13 2006" },
                new calYearType(){ CYear= 2063, YearStart= "Apr 14 2006", YearEnd= "Apr 13 2007" },
                new calYearType(){ CYear= 2064, YearStart= "Apr 14 2007", YearEnd= "Apr 12 2008" },
                new calYearType(){ CYear= 2065, YearStart= "Apr 13 2008", YearEnd= "Apr 13 2009" },
                new calYearType(){ CYear= 2066, YearStart= "Apr 14 2009", YearEnd= "Apr 13 2010" },
                new calYearType(){ CYear= 2067, YearStart= "Apr 14 2010", YearEnd= "Apr 13 2011" },
                new calYearType(){ CYear= 2068, YearStart= "Apr 14 2011", YearEnd= "Apr 12 2012" },
                new calYearType(){ CYear= 2069, YearStart= "Apr 13 2012", YearEnd= "Apr 13 2013" },
                new calYearType(){ CYear= 2070, YearStart= "Apr 14 2013", YearEnd= "Apr 13 2014" },
                new calYearType(){ CYear= 2071, YearStart= "Apr 14 2014", YearEnd= "Apr 13 2015" },
                new calYearType(){ CYear= 2072, YearStart= "Apr 14 2015", YearEnd= "Apr 12 2016" },
                new calYearType(){ CYear= 2073, YearStart= "Apr 13 2016", YearEnd= "Apr 13 2017" },
                new calYearType(){ CYear= 2074, YearStart= "Apr 14 2017", YearEnd= "Apr 13 2018" },
                new calYearType(){ CYear= 2075, YearStart= "Apr 14 2018", YearEnd= "Apr 13 2019" },
                new calYearType(){ CYear= 2076, YearStart= "Apr 14 2019", YearEnd= "Apr 12 2020" },
                new calYearType(){ CYear= 2077, YearStart= "Apr 13 2020", YearEnd= "Apr 13 2021" },
                new calYearType(){ CYear= 2078, YearStart= "Apr 14 2021", YearEnd= "Apr 13 2022" },
                new calYearType(){ CYear= 2079, YearStart= "Apr 14 2022", YearEnd= "Apr 13 2023" },
                new calYearType(){ CYear= 2080, YearStart= "Apr 14 2023", YearEnd= "Apr 12 2024" },
                new calYearType(){ CYear= 2081, YearStart= "Apr 13 2024", YearEnd= "Apr 13 2025" },
                new calYearType(){ CYear= 2082, YearStart= "Apr 14 2025", YearEnd= "Apr 13 2026" },
                new calYearType(){ CYear= 2083, YearStart= "Apr 14 2026", YearEnd= "Apr 13 2027" },
                new calYearType(){ CYear= 2084, YearStart= "Apr 14 2027", YearEnd= "Apr 12 2028" },
                new calYearType(){ CYear= 2085, YearStart= "Apr 13 2028", YearEnd= "Apr 13 2029" },
                new calYearType(){ CYear= 2086, YearStart= "Apr 14 2029", YearEnd= "Apr 13 1930" },
                new calYearType(){ CYear= 2087, YearStart= "Apr 14 2030", YearEnd= "Apr 14 1931" },
                new calYearType(){ CYear= 2088, YearStart= "Apr 15 2031", YearEnd= "Apr 13 1932" },
                new calYearType(){ CYear= 2089, YearStart= "Apr 14 2032", YearEnd= "Apr 13 1933" },
                new calYearType(){ CYear= 2090, YearStart= "Apr 14 2033", YearEnd= "Apr 13 1934" },
                new calYearType(){ CYear= 2091, YearStart= "Apr 14 2034", YearEnd= "Apr 14 1935" },
                new calYearType(){ CYear= 2092, YearStart= "Apr 15 2035", YearEnd= "Apr 13 1936" },
                new calYearType(){ CYear= 2093, YearStart= "Apr 14 2036", YearEnd= "Apr 13 1937" },
                new calYearType(){ CYear= 2094, YearStart= "Apr 14 2037", YearEnd= "Apr 13 1938" },
                new calYearType(){ CYear= 2095, YearStart= "Apr 14 2038", YearEnd= "Apr 14 1939" },
                new calYearType(){ CYear= 2096, YearStart= "Apr 15 2039", YearEnd= "Apr 12 1940" },
                new calYearType(){ CYear= 2097, YearStart= "Apr 13 2040", YearEnd= "Apr 13 1941" },
                new calYearType(){ CYear= 2098, YearStart= "Apr 14 2041", YearEnd= "Apr 13 1942" },
                new calYearType(){ CYear= 2099, YearStart= "Apr 14 2042", YearEnd= "Apr 13 1943" },
                new calYearType(){ CYear= 2100, YearStart= "Apr 14 2043", YearEnd= "Apr 12 1944" }
        };

        //private GetEngCalendarYearInfo(): Array<any> 

        public static List<engYearsHashType> engYearsHash = new List<engYearsHashType>
        {                 
            ////english calendar year data from 1900 to 1940 are not verified
            //data below are verified and are correct.., but above this are not..
           new engYearsHashType(){ engYear= 1900, yStartInBS= "1956-09-17", yEndInBS= "1957-09-17" },
           new engYearsHashType(){ engYear= 1901, yStartInBS= "1957-09-18", yEndInBS= "1958-09-17" },
           new engYearsHashType(){ engYear= 1902, yStartInBS= "1958-09-18", yEndInBS= "1959-09-16" },
           new engYearsHashType(){ engYear= 1903, yStartInBS= "1959-09-17", yEndInBS= "1960-09-16" },
           new engYearsHashType(){ engYear= 1904, yStartInBS= "1960-09-17", yEndInBS= "1961-09-17" },
           new engYearsHashType(){ engYear= 1905, yStartInBS= "1961-09-18", yEndInBS= "1962-09-17" },
           new engYearsHashType(){ engYear= 1906, yStartInBS= "1962-09-18", yEndInBS= "1963-09-16" },
           new engYearsHashType(){ engYear= 1908, yStartInBS= "1963-09-17", yEndInBS= "1964-09-17" },
           new engYearsHashType(){ engYear= 1909, yStartInBS= "1964-09-18", yEndInBS= "1965-09-17" },
           new engYearsHashType(){ engYear= 1910, yStartInBS= "1965-09-18", yEndInBS= "1966-09-16" },
           new engYearsHashType(){ engYear= 1911, yStartInBS= "1966-09-17", yEndInBS= "1967-09-16" },
           new engYearsHashType(){ engYear= 1912, yStartInBS= "1967-09-17", yEndInBS= "1968-09-17" },
           new engYearsHashType(){ engYear= 1913, yStartInBS= "1968-09-18", yEndInBS= "1969-09-17" },
           new engYearsHashType(){ engYear= 1914, yStartInBS= "1969-09-18", yEndInBS= "1970-09-16" },
           new engYearsHashType(){ engYear= 1915, yStartInBS= "1970-09-17", yEndInBS= "1971-09-16" },
           new engYearsHashType(){ engYear= 1916, yStartInBS= "1971-09-17", yEndInBS= "1972-09-17" },
           new engYearsHashType(){ engYear= 1917, yStartInBS= "1972-09-18", yEndInBS= "1973-09-17" },
           new engYearsHashType(){ engYear= 1918, yStartInBS= "1973-09-18", yEndInBS= "1974-09-16" },
           new engYearsHashType(){ engYear= 1919, yStartInBS= "1974-09-17", yEndInBS= "1975-09-16" },
           new engYearsHashType(){ engYear= 1920, yStartInBS= "1975-09-17", yEndInBS= "1976-09-17" },
           new engYearsHashType(){ engYear= 1921, yStartInBS= "1976-09-18", yEndInBS= "1977-09-17" },
           new engYearsHashType(){ engYear= 1922, yStartInBS= "1977-09-18", yEndInBS= "1978-09-16" },
           new engYearsHashType(){ engYear= 1923, yStartInBS= "1978-09-17", yEndInBS= "1979-09-16" },
           new engYearsHashType(){ engYear= 1924, yStartInBS= "1979-09-17", yEndInBS= "1980-09-17" },
           new engYearsHashType(){ engYear= 1925, yStartInBS= "1980-09-18", yEndInBS= "1981-09-16" },
           new engYearsHashType(){ engYear= 1926, yStartInBS= "1981-09-17", yEndInBS= "1982-09-16" },
           new engYearsHashType(){ engYear= 1927, yStartInBS= "1982-09-17", yEndInBS= "1983-09-16" },
           new engYearsHashType(){ engYear= 1928, yStartInBS= "1983-09-17", yEndInBS= "1984-09-17" },
           new engYearsHashType(){ engYear= 1929, yStartInBS= "1984-09-18", yEndInBS= "1985-09-16" },
           new engYearsHashType(){ engYear= 1930, yStartInBS= "1985-09-17", yEndInBS= "1986-09-16" },
           new engYearsHashType(){ engYear= 1931, yStartInBS= "1986-09-18", yEndInBS= "1987-09-17" },
           new engYearsHashType(){ engYear= 1932, yStartInBS= "1987-09-18", yEndInBS= "1988-09-16" },
           new engYearsHashType(){ engYear= 1933, yStartInBS= "1988-09-17", yEndInBS= "1989-09-16" },
           new engYearsHashType(){ engYear= 1934, yStartInBS= "1989-09-17", yEndInBS= "1990-09-17" },
           new engYearsHashType(){ engYear= 1935, yStartInBS= "1990-09-18", yEndInBS= "1991-09-16" },
           new engYearsHashType(){ engYear= 1936, yStartInBS= "1991-09-17", yEndInBS= "1992-09-16" },
           new engYearsHashType(){ engYear= 1937, yStartInBS= "1992-09-17", yEndInBS= "1993-09-16" },
           new engYearsHashType(){ engYear= 1938, yStartInBS= "1993-09-17", yEndInBS= "1994-09-17" },
           new engYearsHashType(){ engYear= 1939, yStartInBS= "1994-09-18", yEndInBS= "1995-09-16" },
           new engYearsHashType(){ engYear= 1930, yStartInBS= "1995-09-17", yEndInBS= "1996-09-16" },//data below are verified and are correct.., but above this are not..            
           new engYearsHashType(){ engYear= 1940, yStartInBS= "1996-09-17", yEndInBS= "1997-09-17" },
           new engYearsHashType(){ engYear= 1941, yStartInBS= "1997-09-18", yEndInBS= "1998-09-17" },
           new engYearsHashType(){ engYear= 1942, yStartInBS= "1998-09-18", yEndInBS= "1999-09-16" },
           new engYearsHashType(){ engYear= 1943, yStartInBS= "1999-09-17", yEndInBS= "2000-09-16" },
           new engYearsHashType(){ engYear= 1944, yStartInBS= "2000-09-17", yEndInBS= "2001-09-17" },
           new engYearsHashType(){ engYear= 1945, yStartInBS= "2001-09-18", yEndInBS= "2002-09-17" },
           new engYearsHashType(){ engYear= 1946, yStartInBS= "2002-09-18", yEndInBS= "2003-09-16" },
           new engYearsHashType(){ engYear= 1947, yStartInBS= "2003-09-17", yEndInBS= "2004-09-16" },
           new engYearsHashType(){ engYear= 1948, yStartInBS= "2004-09-17", yEndInBS= "2005-09-17" },
           new engYearsHashType(){ engYear= 1949, yStartInBS= "2005-09-18", yEndInBS= "2006-09-17" },
           new engYearsHashType(){ engYear= 1950, yStartInBS= "2006-09-18", yEndInBS= "2007-09-16" },
           new engYearsHashType(){ engYear= 1951, yStartInBS= "2007-09-17", yEndInBS= "2008-09-16" },
           new engYearsHashType(){ engYear= 1952, yStartInBS= "2008-09-17", yEndInBS= "2009-09-17" },
           new engYearsHashType(){ engYear= 1953, yStartInBS= "2009-09-18", yEndInBS= "2010-09-17" },
           new engYearsHashType(){ engYear= 1954, yStartInBS= "2010-09-18", yEndInBS= "2011-09-16" },
           new engYearsHashType(){ engYear= 1955, yStartInBS= "2011-09-17", yEndInBS= "2012-09-16" },
           new engYearsHashType(){ engYear= 1956, yStartInBS= "2012-09-17", yEndInBS= "2013-09-17" },
           new engYearsHashType(){ engYear= 1957, yStartInBS= "2013-09-18", yEndInBS= "2014-09-17" },
           new engYearsHashType(){ engYear= 1958, yStartInBS= "2014-09-18", yEndInBS= "2015-09-16" },
           new engYearsHashType(){ engYear= 1959, yStartInBS= "2015-09-17", yEndInBS= "2016-09-16" },
           new engYearsHashType(){ engYear= 1960, yStartInBS= "2016-09-17", yEndInBS= "2017-09-17" },
           new engYearsHashType(){ engYear= 1961, yStartInBS= "2017-09-18", yEndInBS= "2018-09-17" },
           new engYearsHashType(){ engYear= 1962, yStartInBS= "2018-09-18", yEndInBS= "2019-09-16" },
           new engYearsHashType(){ engYear= 1963, yStartInBS= "2019-09-17", yEndInBS= "2020-09-16" },
           new engYearsHashType(){ engYear= 1964, yStartInBS= "2020-09-17", yEndInBS= "2021-09-17" },
           new engYearsHashType(){ engYear= 1965, yStartInBS= "2021-09-18", yEndInBS= "2022-09-16" },
           new engYearsHashType(){ engYear= 1966, yStartInBS= "2022-09-17", yEndInBS= "2023-09-16" },
           new engYearsHashType(){ engYear= 1967, yStartInBS= "2023-09-17", yEndInBS= "2024-09-16" },
           new engYearsHashType(){ engYear= 1968, yStartInBS= "2024-09-17", yEndInBS= "2025-09-17" },
           new engYearsHashType(){ engYear= 1969, yStartInBS= "2025-09-18", yEndInBS= "2026-09-16" },
           new engYearsHashType(){ engYear= 1970, yStartInBS= "2026-09-17", yEndInBS= "2027-09-16" },
           new engYearsHashType(){ engYear= 1971, yStartInBS= "2027-09-17", yEndInBS= "2028-09-16" },
           new engYearsHashType(){ engYear= 1972, yStartInBS= "2028-09-17", yEndInBS= "2029-09-17" },
           new engYearsHashType(){ engYear= 1973, yStartInBS= "2029-09-18", yEndInBS= "2030-09-16" },
           new engYearsHashType(){ engYear= 1974, yStartInBS= "2030-09-17", yEndInBS= "2031-09-16" },
           new engYearsHashType(){ engYear= 1975, yStartInBS= "2031-09-17", yEndInBS= "2032-09-16" },
           new engYearsHashType(){ engYear= 1976, yStartInBS= "2032-09-17", yEndInBS= "2033-09-17" },
           new engYearsHashType(){ engYear= 1977, yStartInBS= "2033-09-18", yEndInBS= "2034-09-16" },
           new engYearsHashType(){ engYear= 1978, yStartInBS= "2034-09-17", yEndInBS= "2035-09-16" },
           new engYearsHashType(){ engYear= 1979, yStartInBS= "2035-09-17", yEndInBS= "2036-09-16" },
           new engYearsHashType(){ engYear= 1980, yStartInBS= "2036-09-17", yEndInBS= "2037-09-17" },
           new engYearsHashType(){ engYear= 1981, yStartInBS= "2037-09-18", yEndInBS= "2038-09-16" },
           new engYearsHashType(){ engYear= 1982, yStartInBS= "2038-09-17", yEndInBS= "2039-09-16" },
           new engYearsHashType(){ engYear= 1983, yStartInBS= "2039-09-17", yEndInBS= "2040-09-16" },
           new engYearsHashType(){ engYear= 1984, yStartInBS= "2040-09-17", yEndInBS= "2041-09-17" },
           new engYearsHashType(){ engYear= 1985, yStartInBS= "2041-09-18", yEndInBS= "2042-09-16" },
           new engYearsHashType(){ engYear= 1986, yStartInBS= "2042-09-17", yEndInBS= "2043-09-16" },
           new engYearsHashType(){ engYear= 1987, yStartInBS= "2043-09-17", yEndInBS= "2044-09-16" },
           new engYearsHashType(){ engYear= 1988, yStartInBS= "2044-09-17", yEndInBS= "2045-09-17" },
           new engYearsHashType(){ engYear= 1989, yStartInBS= "2045-09-18", yEndInBS= "2046-09-17" },
           new engYearsHashType(){ engYear= 1990, yStartInBS= "2046-09-17", yEndInBS= "2047-09-16" },
           new engYearsHashType(){ engYear= 1991, yStartInBS= "2047-09-17", yEndInBS= "2048-09-16" },
           new engYearsHashType(){ engYear= 1992, yStartInBS= "2048-09-17", yEndInBS= "2049-09-16" },
           new engYearsHashType(){ engYear= 1993, yStartInBS= "2049-09-17", yEndInBS= "2050-09-16" },
           new engYearsHashType(){ engYear= 1994, yStartInBS= "2050-09-17", yEndInBS= "2051-09-16" },
           new engYearsHashType(){ engYear= 1995, yStartInBS= "2051-09-17", yEndInBS= "2052-09-16" },
           new engYearsHashType(){ engYear= 1996, yStartInBS= "2052-09-17", yEndInBS= "2053-09-16" },
           new engYearsHashType(){ engYear= 1997, yStartInBS= "2053-09-17", yEndInBS= "2054-09-16" },
           new engYearsHashType(){ engYear= 1998, yStartInBS= "2054-09-17", yEndInBS= "2055-09-16" },
           new engYearsHashType(){ engYear= 1999, yStartInBS= "2055-09-17", yEndInBS= "2056-09-16" },
           new engYearsHashType(){ engYear= 2000, yStartInBS= "2056-09-17", yEndInBS= "2057-09-16" },
           new engYearsHashType(){ engYear= 2001, yStartInBS= "2057-09-17", yEndInBS= "2058-09-16" },
           new engYearsHashType(){ engYear= 2002, yStartInBS= "2058-09-17", yEndInBS= "2059-09-16" },
           new engYearsHashType(){ engYear= 2003, yStartInBS= "2059-09-17", yEndInBS= "2060-09-16" },
           new engYearsHashType(){ engYear= 2004, yStartInBS= "2060-09-17", yEndInBS= "2061-09-16" },
           new engYearsHashType(){ engYear= 2005, yStartInBS= "2061-09-17", yEndInBS= "2062-09-16" },
           new engYearsHashType(){ engYear= 2006, yStartInBS= "2062-09-17", yEndInBS= "2063-09-16" },
           new engYearsHashType(){ engYear= 2007, yStartInBS= "2063-09-17", yEndInBS= "2064-09-16" },
           new engYearsHashType(){ engYear= 2008, yStartInBS= "2064-09-17", yEndInBS= "2065-09-16" },
           new engYearsHashType(){ engYear= 2009, yStartInBS= "2065-09-17", yEndInBS= "2066-09-16" },
           new engYearsHashType(){ engYear= 2010, yStartInBS= "2066-09-17", yEndInBS= "2067-09-16" },
           new engYearsHashType(){ engYear= 2011, yStartInBS= "2067-09-17", yEndInBS= "2068-09-16" },
           new engYearsHashType(){ engYear= 2012, yStartInBS= "2068-09-17", yEndInBS= "2069-09-16" },
           new engYearsHashType(){ engYear= 2013, yStartInBS= "2069-09-17", yEndInBS= "2070-09-16" },
           new engYearsHashType(){ engYear= 2014, yStartInBS= "2070-09-17", yEndInBS= "2071-09-16" },
           new engYearsHashType(){ engYear= 2015, yStartInBS= "2071-09-17", yEndInBS= "2072-09-16" },
           new engYearsHashType(){ engYear= 2016, yStartInBS= "2072-09-17", yEndInBS= "2073-09-16" },
           new engYearsHashType(){ engYear= 2017, yStartInBS= "2073-09-17", yEndInBS= "2074-09-16" },
           new engYearsHashType(){ engYear= 2018, yStartInBS= "2074-09-17", yEndInBS= "2075-09-16" },
           new engYearsHashType(){ engYear= 2019, yStartInBS= "2075-09-17", yEndInBS= "2076-09-16" },
           new engYearsHashType(){ engYear= 2020, yStartInBS= "2076-09-17", yEndInBS= "2077-09-16" },
           new engYearsHashType(){ engYear= 2021, yStartInBS= "2077-09-17", yEndInBS= "2078-09-16" },
           new engYearsHashType(){ engYear= 2022, yStartInBS= "2078-09-17", yEndInBS= "2079-09-16" },
           new engYearsHashType(){ engYear= 2023, yStartInBS= "2079-09-17", yEndInBS= "2080-09-16" },
           new engYearsHashType(){ engYear= 2024, yStartInBS= "2080-09-17", yEndInBS= "2081-09-16" },
           new engYearsHashType(){ engYear= 2025, yStartInBS= "2081-09-17", yEndInBS= "2082-09-16" },
           new engYearsHashType(){ engYear= 2026, yStartInBS= "2082-09-17", yEndInBS= "2083-09-16" },
           new engYearsHashType(){ engYear= 2027, yStartInBS= "2083-09-17", yEndInBS= "2084-09-16" },
           new engYearsHashType(){ engYear= 2028, yStartInBS= "2084-09-17", yEndInBS= "2085-09-16" },
           new engYearsHashType(){ engYear= 2029, yStartInBS= "2085-09-17", yEndInBS= "2086-09-16" },
           new engYearsHashType(){ engYear= 2030, yStartInBS= "2086-09-17", yEndInBS= "2087-09-16" },
           new engYearsHashType(){ engYear= 2031, yStartInBS= "2087-09-17", yEndInBS= "2088-09-16" },
           new engYearsHashType(){ engYear= 2032, yStartInBS= "2088-09-17", yEndInBS= "2089-09-16" },
           new engYearsHashType(){ engYear= 2033, yStartInBS= "2089-09-17", yEndInBS= "2090-09-16" },
           new engYearsHashType(){ engYear= 2034, yStartInBS= "2090-09-17", yEndInBS= "2091-09-16" },
           new engYearsHashType(){ engYear= 2035, yStartInBS= "2091-09-17", yEndInBS= "2092-09-16" },
           new engYearsHashType(){ engYear= 2036, yStartInBS= "2092-09-17", yEndInBS= "2093-09-16" },
           new engYearsHashType(){ engYear= 2037, yStartInBS= "2093-09-17", yEndInBS= "2094-09-16" },
           new engYearsHashType(){ engYear= 2038, yStartInBS= "2094-09-17", yEndInBS= "2095-09-16" },
           new engYearsHashType(){ engYear= 2039, yStartInBS= "2095-09-17", yEndInBS= "2096-09-16" },
           new engYearsHashType(){ engYear= 2040, yStartInBS= "2096-09-17", yEndInBS= "2097-09-16" }


    };
        //gets 13month's days starting from Poush-XXXX BS to Poush-(XXX+1) BS
        //13months are needed since the english year starts from Poush and Ends on Poush of Nepali Year.
        //Poush to Poush (INCLUSIVE) becomes 13 months.
        public static List<int> GetDaysInMonthOfNext13NepaliMonthsIncludingCurrentMth(int bsYr)
        {
            List<int> nep13MonthsDays = new List<int>();
            //get month_days of currentYear.
            //every english year starts from 9th Nepali month: i.e. Poush so start from 9th i.e index=8.           
            List<int> currNepYrMonths = new List<int>();
            yr_mth = NepaliDateModel.LoadNepYear_MthHash();
            currNepYrMonths = yr_mth[bsYr];
            nep13MonthsDays.Add(currNepYrMonths[8]);
            nep13MonthsDays.Add(currNepYrMonths[9]);
            nep13MonthsDays.Add(currNepYrMonths[10]);
            nep13MonthsDays.Add(currNepYrMonths[11]);

            List<int> nextNepYrMonths = new List<int>();
            nextNepYrMonths = yr_mth[bsYr + 1];
            nep13MonthsDays.Add(nextNepYrMonths[0]);
            nep13MonthsDays.Add(nextNepYrMonths[1]);
            nep13MonthsDays.Add(nextNepYrMonths[2]);
            nep13MonthsDays.Add(nextNepYrMonths[3]);
            nep13MonthsDays.Add(nextNepYrMonths[4]);
            nep13MonthsDays.Add(nextNepYrMonths[5]);
            nep13MonthsDays.Add(nextNepYrMonths[6]);
            nep13MonthsDays.Add(nextNepYrMonths[7]);
            //add Poush of next year as well, since December month spans from around 15Mangshir to 16Poush of Nep-Calendar.
            nep13MonthsDays.Add(nextNepYrMonths[8]);
            return nep13MonthsDays;
        }
    }
    public class NepaliMonth
    {
        public string MonthName { get; set; }
        public int MonthNumber { get; set; }
        public static List<NepaliMonth> NepaliMonths = new List<NepaliMonth>
        {
            new NepaliMonth(){MonthNumber= 1, MonthName="बैशाख"},
            new NepaliMonth(){MonthNumber= 2, MonthName="जेष्ठ" },
            new NepaliMonth(){MonthNumber= 3, MonthName="असार"},
            new NepaliMonth(){MonthNumber= 4, MonthName="श्रावन"},
            new NepaliMonth(){MonthNumber= 5, MonthName="भाद्र" },
            new NepaliMonth(){MonthNumber= 6, MonthName="असोज"},
            new NepaliMonth(){MonthNumber= 7, MonthName="कार्तिक"},
            new NepaliMonth(){MonthNumber= 8, MonthName="मङ्सिर"},
            new NepaliMonth(){MonthNumber= 9, MonthName="पौष"},
            new NepaliMonth(){MonthNumber= 10,MonthName= "माघ"},
            new NepaliMonth(){MonthNumber= 11,MonthName="फाल्गुन"},
            new NepaliMonth(){ MonthNumber = 12,MonthName= "चैत्र"},
        };
    }
    public class NepaliYear
    {
        public int YearNumberEng { get; set; }
        public string YearNumberNep { get; set; }
        //all from 1950 BS to 2080BS.
        ///actual mapping data in nepalicalendar service for years above are not verified: sud
        public static List<NepaliYear> NepaliYears = new List<NepaliYear>
        {
                new NepaliYear(){ YearNumberEng =1950, YearNumberNep= "१९५०" },
                new NepaliYear(){ YearNumberEng =1951, YearNumberNep= "१९५१" },
                new NepaliYear(){ YearNumberEng =1952, YearNumberNep= "१९५२" },
                new NepaliYear(){ YearNumberEng =1953, YearNumberNep= "१९५३" },
                new NepaliYear(){ YearNumberEng =1954, YearNumberNep= "१९५४" },
                new NepaliYear(){ YearNumberEng =1955, YearNumberNep= "१९५५" },
                new NepaliYear(){ YearNumberEng =1956, YearNumberNep= "१९५६" },
                new NepaliYear(){ YearNumberEng =1957, YearNumberNep= "१९५७" },
                new NepaliYear(){ YearNumberEng =1958, YearNumberNep= "१९५८" },
                new NepaliYear(){ YearNumberEng =1959, YearNumberNep= "१९५९" },
                new NepaliYear(){ YearNumberEng =1960, YearNumberNep= "१९६०" },
                new NepaliYear(){ YearNumberEng =1961, YearNumberNep= "१९६१" },
                new NepaliYear(){ YearNumberEng =1962, YearNumberNep= "१९६२" },
                new NepaliYear(){ YearNumberEng =1963, YearNumberNep= "१९६३" },
                new NepaliYear(){ YearNumberEng =1964, YearNumberNep= "१९६४" },
                new NepaliYear(){ YearNumberEng =1965, YearNumberNep= "१९६५" },
                new NepaliYear(){ YearNumberEng =1966, YearNumberNep= "१९६६" },
                new NepaliYear(){ YearNumberEng =1967, YearNumberNep= "१९६७" },
                new NepaliYear(){ YearNumberEng =1968, YearNumberNep= "१९६८" },
                new NepaliYear(){ YearNumberEng =1969, YearNumberNep= "१९६९" },
                new NepaliYear(){ YearNumberEng =1970, YearNumberNep= "१९७०" },
                new NepaliYear(){ YearNumberEng =1971, YearNumberNep= "१९७१" },
                new NepaliYear(){ YearNumberEng =1972, YearNumberNep= "१९७२" },
                new NepaliYear(){ YearNumberEng =1973, YearNumberNep= "१९७३" },
                new NepaliYear(){ YearNumberEng =1974, YearNumberNep= "१९७४" },
                new NepaliYear(){ YearNumberEng =1975, YearNumberNep= "१९७५" },
                new NepaliYear(){ YearNumberEng =1976, YearNumberNep= "१९७६" },
                new NepaliYear(){ YearNumberEng =1977, YearNumberNep= "१९७७" },
                new NepaliYear(){ YearNumberEng =1978, YearNumberNep= "१९७८" },
                new NepaliYear(){ YearNumberEng =1979, YearNumberNep= "१९७९" },
                new NepaliYear(){ YearNumberEng =1900, YearNumberNep= "१९८०" },
                new NepaliYear(){ YearNumberEng =1981, YearNumberNep= "१९८१" },
                new NepaliYear(){ YearNumberEng =1982, YearNumberNep= "१९८२" },
                new NepaliYear(){ YearNumberEng =1983, YearNumberNep= "१९८३" },
                new NepaliYear(){ YearNumberEng =1984, YearNumberNep= "१९८४" },
                new NepaliYear(){ YearNumberEng =1985, YearNumberNep= "१९८५" },
                new NepaliYear(){ YearNumberEng =1986, YearNumberNep= "१९८६" },
                new NepaliYear(){ YearNumberEng =1987, YearNumberNep= "१९८७" },
                new NepaliYear(){ YearNumberEng =1988, YearNumberNep= "१९८८" },
                new NepaliYear(){ YearNumberEng =1989, YearNumberNep= "१९८९" },
                new NepaliYear(){ YearNumberEng =1990, YearNumberNep= "१९९०" },
                new NepaliYear(){ YearNumberEng =1991, YearNumberNep= "१९९१" },
                new NepaliYear(){ YearNumberEng =1992, YearNumberNep= "१९९२" },
                new NepaliYear(){ YearNumberEng =1993, YearNumberNep= "१९९३" },
                new NepaliYear(){ YearNumberEng =1994, YearNumberNep= "१९९४" },
                new NepaliYear(){ YearNumberEng =1995, YearNumberNep= "१९९५" },
                new NepaliYear(){ YearNumberEng =1996, YearNumberNep= "१९९६" },
                new NepaliYear(){ YearNumberEng =1997, YearNumberNep= "१९९७" },
                new NepaliYear(){ YearNumberEng =1998, YearNumberNep= "१९९८" },
                new NepaliYear(){ YearNumberEng =1999, YearNumberNep= "१९९९" },
                new NepaliYear(){ YearNumberEng =2000, YearNumberNep= "२०००" },
                new NepaliYear(){ YearNumberEng =2001, YearNumberNep= "२००१" },
                new NepaliYear(){ YearNumberEng =2002, YearNumberNep= "२००२" },
                new NepaliYear(){ YearNumberEng =2003, YearNumberNep= "२००३" },
                new NepaliYear(){ YearNumberEng =2004, YearNumberNep= "२००४" },
                new NepaliYear(){ YearNumberEng =2005, YearNumberNep= "२००५" },
                new NepaliYear(){ YearNumberEng =2006, YearNumberNep= "२००६" },
                new NepaliYear(){ YearNumberEng =2007, YearNumberNep= "२००७" },
                new NepaliYear(){ YearNumberEng =2008, YearNumberNep= "२००८" },
                new NepaliYear(){ YearNumberEng =2009, YearNumberNep= "२००९" },
                new NepaliYear(){ YearNumberEng =2000, YearNumberNep= "२०१०" },
                new NepaliYear(){ YearNumberEng =2011, YearNumberNep= "२०११" },
                new NepaliYear(){ YearNumberEng =2012, YearNumberNep= "२०१२" },
                new NepaliYear(){ YearNumberEng =2013, YearNumberNep= "२०१३" },
                new NepaliYear(){ YearNumberEng =2014, YearNumberNep= "२०१४" },
                new NepaliYear(){ YearNumberEng =2015, YearNumberNep= "२०१५" },
                new NepaliYear(){ YearNumberEng =2016, YearNumberNep= "२०१६" },
                new NepaliYear(){ YearNumberEng =2017, YearNumberNep= "२०१७" },
                new NepaliYear(){ YearNumberEng =2018, YearNumberNep= "२०१८" },
                new NepaliYear(){ YearNumberEng =2019, YearNumberNep= "२०१९" },
                new NepaliYear(){ YearNumberEng =2000, YearNumberNep= "२०२०" },
                new NepaliYear(){ YearNumberEng =2021, YearNumberNep= "२०२१" },
                new NepaliYear(){ YearNumberEng =2022, YearNumberNep= "२०२२" },
                new NepaliYear(){ YearNumberEng =2023, YearNumberNep= "२०२३" },
                new NepaliYear(){ YearNumberEng =2024, YearNumberNep= "२०२४" },
                new NepaliYear(){ YearNumberEng =2025, YearNumberNep= "२०२५" },
                new NepaliYear(){ YearNumberEng =2026, YearNumberNep= "२०२६" },
                new NepaliYear(){ YearNumberEng =2027, YearNumberNep= "२०२७" },
                new NepaliYear(){ YearNumberEng =2028, YearNumberNep= "२०२८" },
                new NepaliYear(){ YearNumberEng =2029, YearNumberNep= "२०२९" },
                new NepaliYear(){ YearNumberEng =2030, YearNumberNep= "२०३०" },
                new NepaliYear(){ YearNumberEng =2031, YearNumberNep= "२०३१" },
                new NepaliYear(){ YearNumberEng =2032, YearNumberNep= "२०३२" },
                new NepaliYear(){ YearNumberEng =2033, YearNumberNep= "२०३३" },
                new NepaliYear(){ YearNumberEng =2034, YearNumberNep= "२०३४" },
                new NepaliYear(){ YearNumberEng =2035, YearNumberNep= "२०३५" },
                new NepaliYear(){ YearNumberEng =2036, YearNumberNep= "२०३६" },
                new NepaliYear(){ YearNumberEng =2037, YearNumberNep= "२०३७" },
                new NepaliYear(){ YearNumberEng =2038, YearNumberNep= "२०३८" },
                new NepaliYear(){ YearNumberEng =2039, YearNumberNep= "२०३९" },
                new NepaliYear(){ YearNumberEng =2000, YearNumberNep= "२०४०" },
                new NepaliYear(){ YearNumberEng =2041, YearNumberNep= "२०४१" },
                new NepaliYear(){ YearNumberEng =2042, YearNumberNep= "२०४२" },
                new NepaliYear(){ YearNumberEng =2043, YearNumberNep= "२०४३" },
                new NepaliYear(){ YearNumberEng =2044, YearNumberNep= "२०४४" },
                new NepaliYear(){ YearNumberEng =2045, YearNumberNep= "२०४५" },
                new NepaliYear(){ YearNumberEng =2046, YearNumberNep= "२०४६" },
                new NepaliYear(){ YearNumberEng =2047, YearNumberNep= "२०४७" },
                new NepaliYear(){ YearNumberEng =2048, YearNumberNep= "२०४८" },
                new NepaliYear(){ YearNumberEng =2049, YearNumberNep= "२०४९" },
                new NepaliYear(){ YearNumberEng =2050, YearNumberNep= "२०५०" },
                new NepaliYear(){ YearNumberEng =2051, YearNumberNep= "२०५१" },
                new NepaliYear(){ YearNumberEng =2052, YearNumberNep= "२०५२" },
                new NepaliYear(){ YearNumberEng =2053, YearNumberNep= "२०५३" },
                new NepaliYear(){ YearNumberEng =2054, YearNumberNep= "२०५४" },
                new NepaliYear(){ YearNumberEng =2055, YearNumberNep= "२०५५" },
                new NepaliYear(){ YearNumberEng =2056, YearNumberNep= "२०५६" },
                new NepaliYear(){ YearNumberEng =2057, YearNumberNep= "२०५७" },
                new NepaliYear(){ YearNumberEng =2058, YearNumberNep= "२०५८" },
                new NepaliYear(){ YearNumberEng =2059, YearNumberNep= "२०५९" },
                new NepaliYear(){ YearNumberEng =2060, YearNumberNep= "२०६०" },
                new NepaliYear(){ YearNumberEng =2061, YearNumberNep= "२०६१" },
                new NepaliYear(){ YearNumberEng =2062, YearNumberNep= "२०६२" },
                new NepaliYear(){ YearNumberEng =2063, YearNumberNep= "२०६३" },
                new NepaliYear(){ YearNumberEng =2064, YearNumberNep= "२०६४" },
                new NepaliYear(){ YearNumberEng =2065, YearNumberNep= "२०६५" },
                new NepaliYear(){ YearNumberEng =2066, YearNumberNep= "२०६६" },
                new NepaliYear(){ YearNumberEng =2067, YearNumberNep= "२०६७" },
                new NepaliYear(){ YearNumberEng =2068, YearNumberNep= "२०६८" },
                new NepaliYear(){ YearNumberEng =2069, YearNumberNep= "२०६९" },
                new NepaliYear(){ YearNumberEng =2070, YearNumberNep= "२०७०" },
                new NepaliYear(){ YearNumberEng =2071, YearNumberNep= "२०७१" },
                new NepaliYear(){ YearNumberEng =2072, YearNumberNep= "२०७२" },
                new NepaliYear(){ YearNumberEng =2073, YearNumberNep= "२०७३" },
                new NepaliYear(){ YearNumberEng =2074, YearNumberNep= "२०७४" },
                new NepaliYear(){ YearNumberEng =2075, YearNumberNep= "२०७५" },
                new NepaliYear(){ YearNumberEng =2076, YearNumberNep= "२०७६" },
                new NepaliYear(){ YearNumberEng =2077, YearNumberNep= "२०७७" },
                new NepaliYear(){ YearNumberEng =2078, YearNumberNep= "२०७८" },
                new NepaliYear(){ YearNumberEng =2079, YearNumberNep= "२०७९" },
                new NepaliYear(){ YearNumberEng =2000, YearNumberNep= "२०८०" },
                new NepaliYear(){ YearNumberEng =2081, YearNumberNep= "२०८१" },
                new NepaliYear(){ YearNumberEng =2082, YearNumberNep= "२०८२" },
                new NepaliYear(){ YearNumberEng =2083, YearNumberNep= "२०८३" },
                new NepaliYear(){ YearNumberEng =2084, YearNumberNep= "२०८४" },
                new NepaliYear(){ YearNumberEng =2085, YearNumberNep= "२०८५" },
                new NepaliYear(){ YearNumberEng =2086, YearNumberNep= "२०८६" },
                new NepaliYear(){ YearNumberEng =2087, YearNumberNep= "२०८७" },
                new NepaliYear(){ YearNumberEng =2088, YearNumberNep= "२०८८" },
                new NepaliYear() { YearNumberEng = 2089, YearNumberNep= "२०८९" },
        };
    }
    public class NepaliDay
    {
        //maximum days in nepali months are 32.
        public int DayNumberEng { get; set; }//in english
        public string DayNumberNep { get; set; } //in nepali eg: "१","२","३"
        public static List<NepaliDay> NepaliDays = new List<NepaliDay>
        {
        new NepaliDay(){ DayNumberEng= 1, DayNumberNep= "१" },
        new NepaliDay(){ DayNumberEng= 2, DayNumberNep= "२" },
        new NepaliDay(){ DayNumberEng= 3, DayNumberNep= "३" },
        new NepaliDay(){ DayNumberEng= 4, DayNumberNep= "४" },
        new NepaliDay(){ DayNumberEng= 5, DayNumberNep= "५" },
        new NepaliDay(){ DayNumberEng= 6, DayNumberNep= "६" },
        new NepaliDay(){ DayNumberEng= 7, DayNumberNep= "७" },
        new NepaliDay(){ DayNumberEng= 8, DayNumberNep= "८" },
        new NepaliDay(){ DayNumberEng= 9, DayNumberNep= "९" },
        new NepaliDay(){ DayNumberEng= 10, DayNumberNep= "१०" },
        new NepaliDay(){ DayNumberEng= 11, DayNumberNep= "११" },
        new NepaliDay(){ DayNumberEng= 12, DayNumberNep= "१२" },
        new NepaliDay(){ DayNumberEng= 13, DayNumberNep= "१३" },
        new NepaliDay(){ DayNumberEng= 14, DayNumberNep= "१४" },
        new NepaliDay(){ DayNumberEng= 15, DayNumberNep= "१५" },
        new NepaliDay(){ DayNumberEng= 16, DayNumberNep= "१६" },
        new NepaliDay(){ DayNumberEng= 17, DayNumberNep= "१७" },
        new NepaliDay(){ DayNumberEng= 18, DayNumberNep= "१८" },
        new NepaliDay(){ DayNumberEng= 19, DayNumberNep= "१९" },
        new NepaliDay(){ DayNumberEng= 20, DayNumberNep= "२०" },
        new NepaliDay(){ DayNumberEng= 21, DayNumberNep= "२१" },
        new NepaliDay(){ DayNumberEng= 22, DayNumberNep= "२२" },
        new NepaliDay(){ DayNumberEng= 23, DayNumberNep= "२३" },
        new NepaliDay(){ DayNumberEng= 24, DayNumberNep= "२४" },
        new NepaliDay(){ DayNumberEng= 25, DayNumberNep= "२५" },
        new NepaliDay(){ DayNumberEng= 26, DayNumberNep= "२६" },
        new NepaliDay(){ DayNumberEng= 27, DayNumberNep= "२७" },
        new NepaliDay(){ DayNumberEng= 28, DayNumberNep= "२८" },
        new NepaliDay(){ DayNumberEng= 29, DayNumberNep= "२९" },
        new NepaliDay(){ DayNumberEng= 30, DayNumberNep= "३०" },
        new NepaliDay(){ DayNumberEng= 31, DayNumberNep= "३१" },
        new NepaliDay() { DayNumberEng= 32, DayNumberNep= "३२" }
     };
    }
    public class NepaliHours
    {
        //maximum  12 hours we are following 12 hours format for display
        public int HoursNumberEng { get; set; }//in english
        public string HoursNumberNep { get; set; }//in nepali eg: "१","२","३"
        public static List<NepaliHours> NepaliHoursList = new List<NepaliHours>
        {
                new NepaliHours(){ HoursNumberEng= 1, HoursNumberNep= "१" },
                new NepaliHours(){ HoursNumberEng= 2, HoursNumberNep= "२" },
                new NepaliHours(){ HoursNumberEng= 3, HoursNumberNep= "३" },
                new NepaliHours(){ HoursNumberEng= 4, HoursNumberNep= "४" },
                new NepaliHours(){ HoursNumberEng= 5, HoursNumberNep= "५" },
                new NepaliHours(){ HoursNumberEng= 6, HoursNumberNep= "६" },
                new NepaliHours(){ HoursNumberEng= 7, HoursNumberNep= "७" },
                new NepaliHours(){ HoursNumberEng= 8, HoursNumberNep= "८" },
                new NepaliHours(){ HoursNumberEng= 9, HoursNumberNep= "९" },
                new NepaliHours(){ HoursNumberEng= 10, HoursNumberNep= "१०" },
                new NepaliHours(){ HoursNumberEng= 11, HoursNumberNep= "११" },
                new NepaliHours(){ HoursNumberEng= 12, HoursNumberNep= "१२" }
         };
    }
    public class NepaliMinutes
    {
        public int MinutesNumberEng { get; set; }//in english 
        public string MinutesNumberNep { get; set; }//in nepali : "१","२","३"            
        public static List<NepaliMinutes> NepaliMinutesList = new List<NepaliMinutes>
        {
        new NepaliMinutes(){ MinutesNumberEng= 0, MinutesNumberNep= "00" },
        new NepaliMinutes(){ MinutesNumberEng= 1, MinutesNumberNep= "01" },
        new NepaliMinutes(){ MinutesNumberEng= 2, MinutesNumberNep= "02" },
        new NepaliMinutes(){ MinutesNumberEng= 3, MinutesNumberNep= "03" },
        new NepaliMinutes(){ MinutesNumberEng= 4, MinutesNumberNep= "04" },
        new NepaliMinutes(){ MinutesNumberEng= 5, MinutesNumberNep= "05" },
        new NepaliMinutes(){ MinutesNumberEng= 6, MinutesNumberNep= "06" },
        new NepaliMinutes(){ MinutesNumberEng= 7, MinutesNumberNep= "07" },
        new NepaliMinutes(){ MinutesNumberEng= 8, MinutesNumberNep= "08" },
        new NepaliMinutes(){ MinutesNumberEng= 9, MinutesNumberNep= "09" },
        new NepaliMinutes(){ MinutesNumberEng= 10, MinutesNumberNep= "10"},
        new NepaliMinutes(){ MinutesNumberEng= 11, MinutesNumberNep= "11"},
        new NepaliMinutes(){ MinutesNumberEng= 12, MinutesNumberNep= "12"},
        new NepaliMinutes(){ MinutesNumberEng= 13, MinutesNumberNep= "13"},
        new NepaliMinutes(){ MinutesNumberEng= 14, MinutesNumberNep= "14"},
        new NepaliMinutes(){ MinutesNumberEng= 15, MinutesNumberNep= "15"},
        new NepaliMinutes(){ MinutesNumberEng= 16, MinutesNumberNep= "16"},
        new NepaliMinutes(){ MinutesNumberEng= 17, MinutesNumberNep= "17"},
        new NepaliMinutes(){ MinutesNumberEng= 18, MinutesNumberNep= "18"},
        new NepaliMinutes(){ MinutesNumberEng= 19, MinutesNumberNep= "19"},
        new NepaliMinutes(){ MinutesNumberEng= 20, MinutesNumberNep= "20"},
        new NepaliMinutes(){ MinutesNumberEng= 21, MinutesNumberNep= "21"},
        new NepaliMinutes(){ MinutesNumberEng= 22, MinutesNumberNep= "22"},
        new NepaliMinutes(){ MinutesNumberEng= 23, MinutesNumberNep= "23"},
        new NepaliMinutes(){ MinutesNumberEng= 24, MinutesNumberNep= "24"},
        new NepaliMinutes(){ MinutesNumberEng= 25, MinutesNumberNep= "25"},
        new NepaliMinutes(){ MinutesNumberEng= 26, MinutesNumberNep= "26"},
        new NepaliMinutes(){ MinutesNumberEng= 27, MinutesNumberNep= "27"},
        new NepaliMinutes(){ MinutesNumberEng= 28, MinutesNumberNep= "28"},
        new NepaliMinutes(){ MinutesNumberEng= 29, MinutesNumberNep= "29"},
        new NepaliMinutes(){ MinutesNumberEng= 30, MinutesNumberNep= "30"},
        new NepaliMinutes(){ MinutesNumberEng= 31, MinutesNumberNep= "31"},
        new NepaliMinutes(){ MinutesNumberEng= 32, MinutesNumberNep= "32"},
        new NepaliMinutes(){ MinutesNumberEng= 33, MinutesNumberNep= "33"},
        new NepaliMinutes(){ MinutesNumberEng= 34, MinutesNumberNep= "34"},
        new NepaliMinutes(){ MinutesNumberEng= 35, MinutesNumberNep= "35"},
        new NepaliMinutes(){ MinutesNumberEng= 36, MinutesNumberNep= "36"},
        new NepaliMinutes(){ MinutesNumberEng= 37, MinutesNumberNep= "37"},
        new NepaliMinutes(){ MinutesNumberEng= 38, MinutesNumberNep= "38"},
        new NepaliMinutes(){ MinutesNumberEng= 39, MinutesNumberNep= "39"},
        new NepaliMinutes(){ MinutesNumberEng= 40, MinutesNumberNep= "40"},
        new NepaliMinutes(){ MinutesNumberEng= 41, MinutesNumberNep= "41"},
        new NepaliMinutes(){ MinutesNumberEng= 42, MinutesNumberNep= "42"},
        new NepaliMinutes(){ MinutesNumberEng= 43, MinutesNumberNep= "43"},
        new NepaliMinutes(){ MinutesNumberEng= 44, MinutesNumberNep= "44"},
        new NepaliMinutes(){ MinutesNumberEng= 45, MinutesNumberNep= "45"},
        new NepaliMinutes(){ MinutesNumberEng= 46, MinutesNumberNep= "46"},
        new NepaliMinutes(){ MinutesNumberEng= 47, MinutesNumberNep= "47"},
        new NepaliMinutes(){ MinutesNumberEng= 48, MinutesNumberNep= "48"},
        new NepaliMinutes(){ MinutesNumberEng= 49, MinutesNumberNep= "49"},
        new NepaliMinutes(){ MinutesNumberEng= 50, MinutesNumberNep= "50"},
        new NepaliMinutes(){ MinutesNumberEng= 51, MinutesNumberNep= "51"},
        new NepaliMinutes(){ MinutesNumberEng= 52, MinutesNumberNep= "52"},
        new NepaliMinutes(){ MinutesNumberEng= 53, MinutesNumberNep= "53"},
        new NepaliMinutes(){ MinutesNumberEng= 54, MinutesNumberNep= "54"},
        new NepaliMinutes(){ MinutesNumberEng= 55, MinutesNumberNep= "55"},
        new NepaliMinutes(){ MinutesNumberEng= 56, MinutesNumberNep= "56"},
        new NepaliMinutes(){ MinutesNumberEng= 57, MinutesNumberNep= "57"},
        new NepaliMinutes(){ MinutesNumberEng= 58, MinutesNumberNep= "58"},
        new NepaliMinutes(){ MinutesNumberEng= 59, MinutesNumberNep= "59" }
        };
    }
    public class NepaliAMPM
    {
        public string Title { get; set; }
        public static List<NepaliAMPM> NepaliAMPMList = new List<NepaliAMPM>
        {
            new NepaliAMPM(){ Title="AM"},
            new NepaliAMPM(){ Title="PM"}
        };
    }
    //class only for create English year list
    public class engYearsHashType
    {
        public int engYear { get; set; }
        public string yStartInBS { get; set; }
        public string yEndInBS { get; set; }
    }
    //class only for create calYear list , used for create dictionary or list
    public class calYearType
    {
        public int CYear { get; set; }
        public string YearStart { get; set; }
        public string YearEnd { get; set; }
    }

}
