using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DanpheEMR.ServerModel.SSFModels
{
    internal class SSFPatientEligibility
    {
    }
    public class EligibilityPatientData
    {
        public string reference { get; set; }
    }

    public class EligibilityRequest
    {
        public string resourceType { get; set; }
        public EligibilityPatientData patient { get; set; }
        public List<EligibilityExtension> extension { get; set; }
    }


    public class EligibilityResponse
    {
        public string SsfSchemeName { get; set; }
        public decimal AccidentBalance { get; set; }
        public decimal UsedMoney { get; set; }
        public decimal OpdBalance { get; set; }
        public decimal IPBalance { get; set; }
        public string SsfEligibilityType { get; set; }
        public bool Inforce { get; set; }


    }
    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class EligibilityAllowedMoney
    {
        public decimal value { get; set; }
    }

    public class EligibilityBenefit
    {
        public EligibilityAllowedMoney allowedMoney { get; set; }
        public EligibilityUsedMoney usedMoney { get; set; }
    }

    public class EligibilityCategory
    {
        public string text { get; set; }
    }

    public class EligibilityExtension
    {
        public string url { get; set; }
        public double valueDecimal { get; set; }
        public string valueString { get; set; }
    }

    public class EligibilityInsurance
    {
        public List<EligibilityExtension> extension { get; set; }
        public bool inforce { get; set; }
        public List<EligibilityItem> item { get; set; }
    }

    public class EligibilityItem
    {
        public List<EligibilityBenefit> benefit { get; set; }
        public EligibilityCategory category { get; set; }
    }

    public class EligibilityRoot
    {
        public string resourceType { get; set; }
        public List<EligibilityInsurance> insurance { get; set; }
    }

    public class EligibilityUsedMoney
    {
        public decimal value { get; set; }
    }
}
