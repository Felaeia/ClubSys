namespace ClubSys.Features.House.UpdateHouse
{
    /// <summary>
    /// Response model for the house update process.
    /// </summary>
    public class UpdateHouseResponse
    {
        public Guid HouseId { get; set; }
        public string HouseName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTimeOffset UpdatedOn { get; set; }
    }
}
