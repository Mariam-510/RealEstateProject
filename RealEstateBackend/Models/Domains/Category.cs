using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Length(1,50)]
        public string Name { get; set; }

        public bool IsDeleted { get; set; } = false;

        public virtual ICollection<Product>? Products { get; set; }
    }
}
