/*
 File: SessionExtensions.cs
 created: 4Mar'17-sudarshan
 description: this class is needed to serialize session variables inside Controllers, 
             by using extension methods, you can set and get serializable objects to Session:

 remarks: check the website: https://docs.microsoft.com/en-us/aspnet/core/fundamentals/app-state for reference.
 -------------------------------------------------------------------
 change history:
 -------------------------------------------------------------------
 S.No     UpdatedBy/Date             description           remarks
 -------------------------------------------------------------------
 1.       sudarshan/4Mar'17          created

 -------------------------------------------------------------------
 */


using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace DanpheEMR.Utilities
{
    public static class SessionExtensions
    {
        //adds extension/overload to Session.Set method, which by default is not available on its own.
        public static void Set<T>(this ISession session, string key, T value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value));
        }
        //adds extension/overload to Session.Get method, which by default is not available on its own
        public static T Get<T>(this ISession session, string key)
        {
            var value = session.GetString(key);
            return value == null ? default(T) : JsonConvert.DeserializeObject<T>(value);
        }
    }
}



