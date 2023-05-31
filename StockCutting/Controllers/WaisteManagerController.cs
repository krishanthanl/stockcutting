using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StockModel.Calculations;
using StockModel.Utility;
using System;
using System.Collections.Generic;
using System.Linq;

using WaisteManager;
using System.Threading.Tasks;

namespace StockCutting.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    public class WaisteManagerController : ControllerBase
    {

        //https://localhost:44311/api/WaisteManager
        [HttpGet]
        [Obsolete]
        public string Get()
        {
            TimeZone localZone = TimeZone.CurrentTimeZone;
            var rng = "Current Date : " + DateTime.Now.ToLongDateString() + "\r\n" +
                        "Current Time : " + DateTime.Now.ToLongTimeString() + "\n\r" +
                        "Standard time name : " + localZone.StandardName + "\r\n" +
                        "Daylight saving time name : " + localZone.DaylightName;
            return rng;
        }


        [HttpGet]
        [Route("gettime")]
        [Obsolete]
        public string GetTime()
        {
            TimeZone localZone = TimeZone.CurrentTimeZone;
            var rng = "Current Date : " + DateTime.Now.ToLongDateString() + "\r\n" +
                        "Current Time : " + DateTime.Now.ToLongTimeString() + "\n\r" +
                        "Standard time name : " + localZone.StandardName + "\r\n" +
                        "Daylight saving time name : " + localZone.DaylightName;
            return rng;
        }

        [HttpPost]
        [Route("getstock")]
        public List<RestResult> GetStock(WaisteManagePostParameter para)
        {
            //WaisteManagePostParameter
            //List<ItemList> items, int wasteQty
            var items = para.CuttingItems;
            var wasteQty = para.CuttingWaiste;

            var grouped = items.GroupBy(
                    p => p.ItemName,
                    p => p.MainBarLength
                );
            List<RestResult> FullResult = new List<RestResult>();

            var calculator = new WaisteManager.LinearCalculator();

            foreach (var groupedItems in grouped)
            {
                string gropName = groupedItems.Key;
                var fullLength = groupedItems.Distinct().ToList();

                foreach (var item in fullLength)
                {
                    var lstitm = items.Select(x => x).Where(y => y.ItemName == groupedItems.Key && y.MainBarLength == item).ToList<ItemList>();
                    double[] cuttingLengths = new double[lstitm.Count];
                    int[] cuttingQty = new int[lstitm.Count];

                    for (int i = 0; i < lstitm.Count; i++)
                    {
                        cuttingLengths[i] = (double)lstitm[i].ItemLength + wasteQty;
                        cuttingQty[i] = lstitm[i].ItemQty;
                    }

                    var sol = calculator.GetStockCuttingValue(lstitm[0].MainBarLength, wasteQty, cuttingLengths, cuttingQty);

                    

                    foreach (var planItem in sol)
                    {
                        var resultItem = new RestResult
                        {
                            BarLength = planItem.plankLength,
                            BarName = groupedItems.Key,
                            Solutions = planItem.Cuts,
                            Remain = planItem.lengthRem()
                        };
                        FullResult.Add(resultItem);
                    }

                    foreach(var resItem in FullResult)
                    {
                        for(int i = 0; i < resItem.Solutions.Count; i++)
                        {
                            resItem.Solutions[i] = resItem.Solutions[i] - wasteQty;
                        }
                    }

                    
                }
            }
            return FullResult;
        }
    }
}
