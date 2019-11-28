﻿using System;

namespace HlidacStatu.NasiPolitici.ExternalApiData.Dto
{
    public sealed class Donation
    {
        public string Party { get; set; }
        public string Origin { get; set; }
        public decimal Value { get; set; }
        public DateTime Date { get; set; }
    }
}