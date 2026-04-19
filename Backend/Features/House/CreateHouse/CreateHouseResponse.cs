namespace ClubSys.Features.House.CreateHouse
{
    /// <summary>
    /// Response model for the house creation process.
    /// </summary>
    public class CreateHouseResponse
    {
        public Guid HouseId { get; set; }
        public string HouseName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
