namespace RealEstate.Models.DTOs.Product
{
    public class ProductDTOShow
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public bool IsUsed { get; set; }
        public double AverageRating { get; set; }
        public bool IsDeleted { get; set; }
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public List<string> Productimage { get; set; }

    }
}
