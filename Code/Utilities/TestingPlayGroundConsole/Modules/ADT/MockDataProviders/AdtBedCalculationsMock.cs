using DanpheEMR.ServerModel;
using DanpheEMR.TestingPlayGroundConsole.ADT.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.TestingPlayGroundConsole.ADT.MockDataProviders
{
    static class AdtBedCalculationsMock
    {
        //expected: Expected:  General: 1, 
        //PatientVisitId: 517538 :  Tested onDate: 20th Jan 2023--1:00 AM -- PASSED
        internal static List<PatientBedInfo> GetTestData_LPH_Admission()
        {
            List<PatientBedInfo> retData = new List<PatientBedInfo>();
            PatientBedInfo data1 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Admission,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-20 01:07:00.000"),
                EndedOn = null
            };


            retData.Add(data1);
            return retData;
        }




        //expected: General (bedfeatureId: 2) :16+7+7+1 (31)  ICU (BedfeatureId:3) : 8+2+1 (11)  : STATUS: PASSED
        //PatientVisitId: 479985, Tested onDate: 20th Jan 2023--1:00 AM
        internal static List<PatientBedInfo> GetTestData_LPH_AdmissionAndTranserOnDifferentDates()
        {
            List<PatientBedInfo> retData = new List<PatientBedInfo>();
            PatientBedInfo data1 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Admission,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2022-12-10 21:30:00.000"),
                EndedOn = Convert.ToDateTime("2022-12-26 19:45:00.000")
            };
            PatientBedInfo data2 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2022-12-26 19:45:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-03 11:26:00.000")
            };

            PatientBedInfo data3 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-03 11:26:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-10 16:48:00.000")
            };

            PatientBedInfo data4 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-10 16:48:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-12 13:49:00.000")
            };

            PatientBedInfo data5 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-12 13:49:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-19 10:25:00.000")
            };
            PatientBedInfo data6 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = null,
                StartedOn = Convert.ToDateTime("2023-01-19 10:25:00.000"),
                EndedOn = null
            };

            retData.Add(data1);
            retData.Add(data2);
            retData.Add(data3);
            retData.Add(data4);
            retData.Add(data5);
            retData.Add(data6);
            return retData;
        }

        internal static List<PatientBedInfo> GetTestData_LPH_TransferBackToSameBedOnDay2()
        {
            List<PatientBedInfo> retData = new List<PatientBedInfo>();
            PatientBedInfo data1 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Admission,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-18 21:15:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-20 01:50:00.000")
            };
            PatientBedInfo data2 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = Convert.ToDateTime("2023-01-20 01:50:00.000"),
                EndedOn = Convert.ToDateTime("2023-01-20 01:52:00.000")
            };

            PatientBedInfo data3 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Transfer,
                OutAction = null,
                StartedOn = Convert.ToDateTime("2023-01-20 01:52:00.000"),
                EndedOn = null
            };



            retData.Add(data1);
            retData.Add(data2);
            retData.Add(data3);
            return retData;
        }

        internal static List<PatientBedInfo> GetTestData_LPH_TwoTransfersOnToday()
        {
            List<PatientBedInfo> retData = new List<PatientBedInfo>();
            PatientBedInfo data1 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Admission,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = DateTime.Now.Date.AddHours(5),
                EndedOn = DateTime.Now.Date.AddHours(8)
            };
            PatientBedInfo data2 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = DateTime.Now.Date.AddHours(8),
                EndedOn = null
            };


            retData.Add(data1);
            retData.Add(data2);
            return retData;
        }


        internal static List<PatientBedInfo> GetTestData_LPH_MultipleTransfersOnToday()
        {
            List<PatientBedInfo> retData = new List<PatientBedInfo>();
            PatientBedInfo data1 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Admission,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = DateTime.Now.Date.AddHours(5),
                EndedOn = DateTime.Now.Date.AddHours(8)
            };
            PatientBedInfo data2 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.ICU,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = DateTime.Now.Date.AddHours(8),
                EndedOn = DateTime.Now.Date.AddHours(10)
            };
            PatientBedInfo data3 = new PatientBedInfo()
            {
                BedFeatureId = Enum_DanpheBedFeatureIds.General,
                Action = Enum_BedActions.Transfer,
                OutAction = Enum_BedActions.Transfer,
                StartedOn = DateTime.Now.Date.AddHours(10),
                EndedOn = null
            };



            retData.Add(data1);
            retData.Add(data2);
            retData.Add(data3);
            return retData;
        }

    }
}
