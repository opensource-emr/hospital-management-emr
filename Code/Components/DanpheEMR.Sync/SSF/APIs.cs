using DanpheEMR.ServerModel.SSFModels;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;

namespace DanpheEMR.Sync.SSF
{
    public class APIs
    {
        public static SSF_RealTimeBookingServiceResponse BookClaim(object claimBooking, SSFCredentials ssfCred)
        {
            var client = new HttpClient();
            var ISO_8859_1 = Encoding.GetEncoding("ISO-8859-1");
            var svcCredentials = Convert.ToBase64String(ISO_8859_1.GetBytes(ssfCred.SSFUsername + ":" + ssfCred.SSFPassword));
            client.DefaultRequestHeaders.Add("Authorization", "Basic " + svcCredentials);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Add(ssfCred.SSFRemotekey, ssfCred.SSFRemoteValue);
            client.BaseAddress = new Uri(ssfCred.SSFurl);
            var jsonContent = JsonConvert.SerializeObject(claimBooking);
            StringContent content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            var response = client.PostAsync($"BookingService", content).Result;
            SSF_RealTimeBookingServiceResponse realTimeBookingServiceResponse = new SSF_RealTimeBookingServiceResponse();
            if (response.IsSuccessStatusCode)
            {
                var message = response.Content.ReadAsStringAsync();
                realTimeBookingServiceResponse.ResponseData = message.Result;
                realTimeBookingServiceResponse.BookingStatus = true;
                return realTimeBookingServiceResponse;
            }
            else
            {
                if (response.Content.Headers.ContentType?.MediaType != "text/html")
                {
                    var errorString = response.Content.ReadAsStringAsync();
                    realTimeBookingServiceResponse.ResponseData = errorString.Result;
                    realTimeBookingServiceResponse.BookingStatus = false;
                    return realTimeBookingServiceResponse;
                }
                else
                {
                    var errorString = response.Content.ReadAsStringAsync();
                    realTimeBookingServiceResponse.ResponseData = errorString.Result;
                    realTimeBookingServiceResponse.BookingStatus = false;
                    return realTimeBookingServiceResponse;
                }
            }
        } 
    }
}
