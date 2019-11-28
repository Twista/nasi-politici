﻿using System;

namespace HlidacStatu.NasiPolitici.ExternalApiData.Dto
{
    public sealed class PersonSummary
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Description { get; set; }

        public DateTime BirthDate { get; set; }

        public string PhotoUrl { get; set; }
    }
}
