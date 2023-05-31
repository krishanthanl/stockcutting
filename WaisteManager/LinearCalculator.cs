using StockModel.Calculations;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;
using System.Linq;

namespace WaisteManager
{
    public class LinearCalculator
    {
        double[] drop_length;
        int[] drop_qty;
        int drop_ctr = 0;
        int No_Of_Planks = 0;
        double saw_width = 0;
        double plankLength = 0;

        private List<CutPease> count_ins(List<double> a, double sawwidth)
        {
            int count = 0;
            double[] arr = a.ToArray();
            List<CutPease> CutPeases = new List<CutPease>();

            for (int i = 0; i < arr.Length; i++)
            {
                arr[i] = arr[i] - sawwidth;
            }

            for (int i = 0; i < arr.Length; i++)
            {
                double initial = arr[i];
                if (initial > 0)
                {
                    for (int j = i; j < arr.Length; j++)
                    {
                        if (initial == arr[j])
                        {
                            arr[j] = 0;
                            count++;
                        }
                    }
                    var item = new CutPease
                    {
                        CutLength = initial,
                        NumberOfPeases = count
                    };
                    CutPeases.Add(item);
                    //final += "\nCut Length: " + initial + "\" Number cut from each stock piece: " + (count) + "\n";
                    count = 0;
                }
            }

            return CutPeases;
        }

        private void fix_arrays()
        {
            int arraySize = drop_qty.Length;
            double[] temp_drop_length = new double[arraySize];
            int[] temp_drop_qty = new int[arraySize];

            int temp_ctr = 0;
            int count = 0;
            double get_first = 0;
            int qty = 0;

            for (int i = 0; i < drop_ctr; i++)
            {
                get_first = drop_length[i];
                for (int xy = i; xy < drop_ctr; xy++)
                {
                    if (get_first > 0 && get_first == drop_length[xy])
                    {
                        count++;
                        qty += drop_qty[xy];
                        drop_length[xy] = 0;
                        drop_qty[xy] = 0;
                    }
                }
                if (count >= 1)
                {
                    temp_drop_length[temp_ctr] = get_first;
                    temp_drop_qty[temp_ctr] = qty;
                    temp_ctr++;
                    count = 0;
                    qty = 0;
                }
            }

            drop_ctr = temp_ctr;
            drop_length = new Double[drop_ctr];
            drop_qty = new int[drop_ctr];

            for (int i = 0; i < temp_ctr; i++)
            {
                drop_length[i] = temp_drop_length[i];
                drop_qty[i] = temp_drop_qty[i];
            }

        }

        private List<Plank> CalculateCuts(List<double> desired, double plank_len)
        {
            List<double> PossibleLengths = new List<double> { };

            double Olength = plank_len;
            PossibleLengths.Add(Olength);
            var planks = new List<Plank>(); //Buffer list
                                            //go through cuts

            foreach (var i in desired)
            {
                //if no eligible planks can be found
                if (!planks.Any(plank => plank.lengthRem() >= i))
                {
                    //make a plank
                    planks.Add(new Plank(PossibleLengths.Max()));
                    No_Of_Planks++;
                }

                //cut where possible
                foreach (var plank in planks.Where(plank => plank.lengthRem() >= i))
                {
                    plank.Cut(i);
                    break;
                }

            }

            //cut down on waste by minimising length of plank
            foreach (var plank in planks)
            {
                double newLength = plank.plankLength;
                foreach (double possibleLength in PossibleLengths)
                {
                    if (possibleLength != plank.plankLength && plank.plankLength - plank.lengthRem() <= possibleLength)
                    {
                        newLength = possibleLength;
                        break;
                    }
                }
                plank.plankLength = newLength;
            }
            
            return planks;
        }

        private List<Plank> calculate_planks()
        {
            List<SolutionItem> solution = new List<SolutionItem>();
            DataTable dt = new DataTable();

            int dt_rows = 0;
            dt.Columns.Add();
            dt.Columns.Add();

            for (int i = 0; i < drop_ctr; i++)
            {
                if (drop_length[i] > 0)
                {
                    DataRow dr = dt.NewRow();
                    dt.Rows.Add(dr);
                    dt.Rows[dt_rows][0] = drop_length[i];
                    dt.Rows[dt_rows][1] = drop_qty[i];
                    dt_rows++;
                }
            }

            No_Of_Planks = 0;

            int d = dt.Rows.Count;
            List<double> DesiredLengths = new List<double> { };

            double[] size_req = new double[d];
            double[] rods_req = new double[d];

            for (int f = 0; f < d; f++)
            {
                size_req[f] = Convert.ToDouble(dt.Rows[f][1]);
                rods_req[f] = Convert.ToDouble(dt.Rows[f][0]);

                //The cuts to be made
                for (int j = 0; j < size_req[f]; j++)
                {
                    DesiredLengths.Add(rods_req[f]);
                }
            }

            //Perform some basic optimisations
            DesiredLengths.Sort();
            DesiredLengths.Reverse();

            //Cut!
            var planks = CalculateCuts(DesiredLengths, plankLength);

            return planks;
        }

        public List<Plank> GetStockCuttingValue(int barLenght, int sawWaiste, double[] dropLenght, int[] dropQty)
        {
            drop_length = dropLenght;
            drop_qty = dropQty;
            saw_width = sawWaiste;
            plankLength = barLenght;
            drop_ctr = dropLenght.Length;
            fix_arrays();
            return calculate_planks();
        }
    }
}
