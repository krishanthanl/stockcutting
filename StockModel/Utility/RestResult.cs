using System;
using System.Collections.Generic;
using System.Text;

namespace StockModel.Utility
{
    public class RestResult
    {
        //public string StatusName { get; set; }
        //public int NumSolutions { get; set; }
        //public int NumUniqueSolutions { get; set; }
        //public int NumRollsUsed { get; set; }
        public List<double> Solutions { get; set; }
        public string BarName { get; set; }
        public double BarLength { get; set; }
        public double Remain { get; set; }

    }
}
