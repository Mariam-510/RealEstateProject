using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.ConversationDto
{
    public class CreateConversationDto
    {
        //public string? FirstAccountId { get; set; }

        public string? SecondAccountId { get; set; }
    }
}
