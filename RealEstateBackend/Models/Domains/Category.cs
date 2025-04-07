using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [Length(1,50)]
        public string Name { get; set; }
        public virtual ICollection<Product>? ProductList { get; set; }

    }
}
