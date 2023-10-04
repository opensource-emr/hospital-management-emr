using System;
using System.Collections.Generic;
using DanpheEMR.ServerModel;
using System.Linq;
using DanpheEMR.TestingPlayGroundConsole.ADT.Models;
using DanpheEMR.TestingPlayGroundConsole.ADT.MockDataProviders;

namespace DanpheEMR.TestingPlayGroundConsole.TestingClasses
{
    static class AdtBedCalculations
    {
       
        public static void RunTests()
        {
            List<PatientBedInfo> testCaseData = new List<PatientBedInfo>();
            Dictionary<int, int> testCaseResults = new Dictionary<int, int>();

            testCaseData = AdtBedCalculationsMock.GetTestData_LPH_AdmissionAndTranserOnDifferentDates();
            testCaseResults = CalculateBedCounts(testCaseData);


            testCaseData = AdtBedCalculationsMock.GetTestData_LPH_Admission();
            //Expected: General: 1 
            testCaseResults = CalculateBedCounts(testCaseData);

            //Expected: General:2, ICU:0
            testCaseData = AdtBedCalculationsMock.GetTestData_LPH_TransferBackToSameBedOnDay2();
            testCaseResults = CalculateBedCounts(testCaseData);

            //Expected: ICU:1
            testCaseData = AdtBedCalculationsMock.GetTestData_LPH_TwoTransfersOnToday();
            testCaseResults = CalculateBedCounts(testCaseData);


            //Expected: General:1
            testCaseData = AdtBedCalculationsMock.GetTestData_LPH_MultipleTransfersOnToday();
            testCaseResults = CalculateBedCounts(testCaseData);

            
        }

        //Returns BedCount for each BedFeatureIds. 
        static Dictionary<int, int> CalculateBedCounts(List<PatientBedInfo> bedInfos)
        {
            DateTime checkOnDate = DateTime.Now;//we need to check on Current Date.
            DateTime minStartDateForRange = (DateTime)bedInfos.Min(b => b.StartedOn);//start date for range is the day of Admission.

            //Maintain a Dictionary of BedType & Count from All the available Data. Initialize the BedCount to Zero
            Dictionary<int, int> bedTypeKeyValues = bedInfos.Select(s => s.BedFeatureId).Distinct().ToDictionary(k => k, v => 0);

            //Order all BedInfos By StartDate. our lo
            List<PatientBedInfo> bedInfoOrdered = bedInfos.OrderBy(a => a.StartedOn).ToList();


            List<DateTime> dayEnds = GetDayEndsOfEachDaysInGivenDateRange(minStartDateForRange, checkOnDate);


            //1.1: if there's only one row in BedInfo (i.e: No transfer)
            //     OR Patient stayed in only one BedType (eg: Transerred from Surgery's General Bed to Medicine's General Bed)
            if (bedInfoOrdered.Count() == 1 || bedTypeKeyValues.Count() == 1)
            {
                int bedFeatureId1 = bedInfoOrdered[0].BedFeatureId;

                DateTime minStartDate = (DateTime)bedInfoOrdered.Min(b => b.StartedOn);
                DateTime maxEndDate = (DateTime)bedInfoOrdered.Max(b => (b.EndedOn != null ? b.EndedOn : DateTime.Now));

                var bedcount = (maxEndDate.Date - minStartDate.Date).Days;
                if (bedcount == 0)
                {
                    bedcount = 1;//minimum day should be 1.
                }
                bedTypeKeyValues[bedFeatureId1] = bedcount;
            }
            else
            {
                //2.1: When there's bed transfer in between.
                //Loop through DayEnds, and ( Count that bed, which was valid at the time of DayChange).
                foreach (var dayEnd in dayEnds)
                {
                    PatientBedInfo bedOnDayEnd = bedInfoOrdered
                                      .Where(b => b.StartedOn <= dayEnd && dayEnd <= (b.EndedOn != null ? b.EndedOn.Value : DateTime.Now)).FirstOrDefault();
                    if (bedOnDayEnd != null)
                    {
                        bedTypeKeyValues[bedOnDayEnd.BedFeatureId]++;
                    }
                }


                //2.2 if transfer happened on today's date.
                //we need to add 1 day to the latest bed.
                List<PatientBedInfo> todaysTransfers = bedInfoOrdered.Where(b => b.StartedOn.Date == DateTime.Now.Date).ToList();
                if (todaysTransfers.Count > 0)
                {
                    PatientBedInfo latestTransfer = todaysTransfers.Where(b => b.EndedOn == null).FirstOrDefault();
                    //need to add only if patient was NOT in Same Bed Yeserday.
                    //When patient was on same bed then that count will already be taken from Section-2.1 logic.
                    if (latestTransfer != null && (!WasPatientOnSameBedYesterday(latestTransfer, bedInfoOrdered)))
                    {
                        bedTypeKeyValues[latestTransfer.BedFeatureId]++;
                    }
                }
            }

            return bedTypeKeyValues;
        }

        private static bool WasPatientOnSameBedYesterday(PatientBedInfo todaysLatestBed, List<PatientBedInfo> allBedInfos)
        {
            DateTime yesterdayDayEnd = DateTime.Now.Date.AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
            PatientBedInfo yesterdaysBedInfo = allBedInfos
                                      .Where(b => b.StartedOn <= yesterdayDayEnd && yesterdayDayEnd <= (b.EndedOn != null ? b.EndedOn.Value : DateTime.Now))
                                      .FirstOrDefault();

            if (yesterdaysBedInfo != null && todaysLatestBed.BedFeatureId == yesterdaysBedInfo.BedFeatureId)
            {
                return true;
            }
            return false;
        }


        /// <summary>
        /// Gets the day End of each given date range. 
        /// Day End is 23:59:59:999 (taking upto milliseconds)
        /// </summary>
        static List<DateTime> GetDayEndsOfEachDaysInGivenDateRange(DateTime startDate, DateTime endDate)
        {
            List<DateTime> dateTimes = new List<DateTime>();
            //without startdate.Date : 5PM of today minus 7PM of yesterday will give ZERO days. since 24 hrs have not passed.
            int dayDiff = (endDate.Date - startDate.Date).Days;
            //if start and end are same then use 23:59:59:999 of the start date as end date

            if (dayDiff == 0)
            {
                DateTime dayEnd = startDate.Date.AddDays(0).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
                dateTimes.Add(dayEnd);
            }
            else
            {     //otherwise calculate DayEnds of all the day in Ascending Date Order
                for (int i = 0; i < dayDiff; i++)
                {
                    DateTime dayEnd = startDate.Date.AddDays(i).AddHours(23).AddMinutes(59).AddSeconds(59).AddMilliseconds(999);
                    dateTimes.Add(dayEnd);
                }
            }

            return dateTimes;
        }

    }
}
