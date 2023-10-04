using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.TestingPlayGroundConsole.ADT.Models
{
  
    static class Enum_DanpheBedFeatureIds
    {
        //these comes from LPH: BedFeatureIds
        public static int ICU = 3;
        public static int General = 2;
    }

    static class Enum_BedActions
    {
        public static string Admission = "admission";
        public static string Transfer = "transfer";
        public static string Discharge = "discharge";
        public static string Cancel = "cancel";
    }

}
