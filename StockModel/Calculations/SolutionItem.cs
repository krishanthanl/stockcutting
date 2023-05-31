using System;
using System.Collections.Generic;
using System.Text;

namespace StockModel.Calculations
{
    public class SolutionItem
    {
        public double BarLength { get; set; }
        public int Remaining { get; set; }
        public List<CutPease> BarPeases { get; set; }
        public int Index { get; set; }
    }
}
