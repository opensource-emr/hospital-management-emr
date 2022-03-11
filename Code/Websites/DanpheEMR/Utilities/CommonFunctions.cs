using DanpheEMR.Core;
using DanpheEMR.Core.Parameters;
using DanpheEMR.ServerModel;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DanpheEMR.Utilities
{
    public class CommonFunctions
    {
        public static List<LabTestComponentResult> MapMachineResultsToComponentResults(List<MachineResultsVM> machineData)
        {
            List<LabTestComponentResult> data = new List<LabTestComponentResult>();
            foreach (var item in machineData)
            {
                var singleItem = new LabTestComponentResult();
                singleItem.RequisitionId = item.RequisitionId;
                singleItem.LabTestId = item.LabTestId;
                singleItem.Value = item.Value;
                singleItem.Unit = item.Component.Unit;
                singleItem.Range = item.Component.Range;
                singleItem.RangeDescription = item.Component.RangeDescription;
                singleItem.ComponentName = item.Component.ComponentName;
                singleItem.Method = item.Component.Method;
                singleItem.IsAbnormal = item.IsAbnormal;
                singleItem.TemplateId = item.TemplateId;
                singleItem.CreatedBy = item.CreatedBy;
                singleItem.CreatedOn = item.CreatedOn;
                singleItem.ComponentId = item.LISComponentId;
                singleItem.IsActive = true;
                singleItem.ResultGroup = 1;

                data.Add(singleItem);
            }
            return data;
        }
        public static List<DoseNumber> GetDosesNumberArray()
        {
            var data = new List<DoseNumber>();
            data.Add(new DoseNumber { Id = 1, NumberInfo = "1st" });
            data.Add(new DoseNumber { Id = 2, NumberInfo = "2nd" });
            data.Add(new DoseNumber { Id = 3, NumberInfo = "3rd" });
            data.Add(new DoseNumber { Id = 4, NumberInfo = "4th" });
            data.Add(new DoseNumber { Id = 5, NumberInfo = "5th" });
            data.Add(new DoseNumber { Id = 6, NumberInfo = "6th" });
            data.Add(new DoseNumber { Id = 7, NumberInfo = "7th" });
            data.Add(new DoseNumber { Id = 8, NumberInfo = "8th" });
            data.Add(new DoseNumber { Id = 9, NumberInfo = "9th" });
            data.Add(new DoseNumber { Id = 10, NumberInfo = "10th" });
            return data;
        }

        public static int GetCoreParameterIntValue(CoreDbContext coreDbContext, string groupName, string paramterName)
        {
            var paraValue = coreDbContext.Parameters.Where(a => a.ParameterGroupName == groupName && a.ParameterName == paramterName).FirstOrDefault().ParameterValue;
            return (paraValue == null) ? 0 : Convert.ToInt32(paraValue);
        }

        public static string GetCoreParameterStringValue(CoreDbContext coreDbContext, string groupName, string paramterName)
        {
            var paraValue = coreDbContext.Parameters.Where(a => a.ParameterGroupName == groupName && a.ParameterName == paramterName).FirstOrDefault().ParameterValue;
            return (paraValue == null) ? "" : paraValue;
        }

        public static bool GetCoreParameterBoolValue(CoreDbContext coreDbContext, string groupName, string paramterName)
        {
            var paraValue = coreDbContext.Parameters.Where(a => a.ParameterGroupName == groupName && a.ParameterName == paramterName).FirstOrDefault().ParameterValue;
            return (paraValue == null) ? false : Convert.ToBoolean(paraValue);
        }

        [Obsolete("")]
        public static bool GetCoreParameterBoolValue(CoreDbContext coreDbContext, string groupName, string paramterName, string keyName)
        {
            var paraValue = coreDbContext.Parameters.Where(a => a.ParameterGroupName == groupName && a.ParameterName == paramterName).FirstOrDefault().ParameterValue;
            var data = DanpheJSONConvert.DeserializeObject<JObject>(paraValue);
            return (data == null) ? false : ((data[keyName].Value<string>()) == null) ? false : Convert.ToBoolean(data[keyName].Value<string>());
        }


        //Sud: 30Apr'20--For reusability across modules..
        //Returns the 'string' value of Key inside a JsonObject.. Note: Works only for FirstLevel Keys, not for the keys inside two or more level..
        //default return value is null
        public static string GetCoreParameterValueByKeyName_String(CoreDbContext coreDbContext, string paramGroup, string paramName, string keyNameOfJsonObj)
        {
            string retValue = null;

            ParameterModel param = coreDbContext.Parameters.Where(a => a.ParameterGroupName == paramGroup && a.ParameterName == paramName).FirstOrDefault();
            if(param != null)
            {
                string paramValueStr = param.ParameterValue;
                var data = DanpheJSONConvert.DeserializeObject<JObject>(paramValueStr);
                if (data != null)
                {
                    return data[keyNameOfJsonObj].Value<string>();
                }
            }

            return retValue;
        }


        //Sud: 30Apr'20--For reusability across modules..
        //Returns the 'boolean' value of Key inside a JsonObject.. Note: Works only for FirstLevel Keys, not for the keys inside two or more level..
        //default return value is false..
        public static bool GetCoreParameterValueByKeyName_Boolean(CoreDbContext coreDbContext, string paramGroup, string paramName, string keyNameOfJsonObj)
        {
            bool retValue = false;//this is default.
            //we have to consider condition like parameter not found, parametervalue not found, KeyNotFound.. etc.. 
            ParameterModel param = coreDbContext.Parameters.Where(a => a.ParameterGroupName == paramGroup && a.ParameterName == paramName).FirstOrDefault();
            if (param != null)
            {
                string paramValueStr = param.ParameterValue;
                JObject paramvalueJson = DanpheJSONConvert.DeserializeObject<JObject>(paramValueStr);
                if (paramvalueJson != null)
                {
                    string strValueOfKey = paramvalueJson[keyNameOfJsonObj].Value<string>();
                    if (!string.IsNullOrEmpty(strValueOfKey))
                    {
                        retValue = Convert.ToBoolean(strValueOfKey);
                    }
                }
            }

            return retValue;
        }


        //Sud: 30Apr'20--For reusability across modules..
        //Returns the 'boolean' value of Key inside a JsonObject.. Note: Works only for FirstLevel Keys, not for the keys inside two or more level..
        //default return value is false..
        public static int GetCoreParameterValueByKeyName_Int(CoreDbContext coreDbContext, string paramGroup, string paramName, string keyNameOfJsonObj)
        {
            int retValue = 0;//default is zero
            //we have to consider condition like parameter not found, parametervalue not found, KeyNotFound.. etc.. 
            ParameterModel param = coreDbContext.Parameters.Where(a => a.ParameterGroupName == paramGroup && a.ParameterName == paramName).FirstOrDefault();
            if (param != null)
            {
                string paramValueStr = param.ParameterValue;
                JObject paramvalueJson = DanpheJSONConvert.DeserializeObject<JObject>(paramValueStr);
                if (paramvalueJson != null)
                {
                    string strValueOfKey = paramvalueJson[keyNameOfJsonObj].Value<string>();
                    if (!string.IsNullOrEmpty(strValueOfKey))
                    {
                        retValue = Convert.ToInt32(strValueOfKey);
                    }
                }
            }

            return retValue;
        }

        //inprogress..
        public static int GetCoreParameterValueByKeyName_IntArray(CoreDbContext coreDbContext, string paramGroup, string paramName, string keyNameOfJsonObj)
        {
            int retValue = 0;//default is zero
            //we have to consider condition like parameter not found, parametervalue not found, KeyNotFound.. etc.. 
            ParameterModel param = coreDbContext.Parameters.Where(a => a.ParameterGroupName == paramGroup && a.ParameterName == paramName).FirstOrDefault();
            if (param != null)
            {
                string paramValueStr = param.ParameterValue;
                JObject paramvalueJson = DanpheJSONConvert.DeserializeObject<JObject>(paramValueStr);
                if (paramvalueJson != null)
                {
                    string strValueOfKey = paramvalueJson[keyNameOfJsonObj].Value<string>();
                    if (!string.IsNullOrEmpty(strValueOfKey))
                    {
                        retValue = Convert.ToInt32(strValueOfKey);
                    }
                }
            }

            return retValue;
        }


    }
}
