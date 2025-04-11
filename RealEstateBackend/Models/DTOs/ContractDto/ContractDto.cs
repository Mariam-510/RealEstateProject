using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.ContractDto
{
    public class ContractDto
    {
        [Key]
        public int Id { get; set; }

        public bool IsDeleted { get; set; }

        public string ImageUrl { get; set; }

        public int? SellerId { get; set; }

        public int? PropertyId { get; set; }
    }
}
