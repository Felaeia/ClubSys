namespace ClubSys.Features.House.DeleteHouse
{
    /// <summary>
    /// Response model for the house soft deletion process.
    /// </summary>
    public class DeleteHouseResponse
    {
        public Guid HouseId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset DeletedOn { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
