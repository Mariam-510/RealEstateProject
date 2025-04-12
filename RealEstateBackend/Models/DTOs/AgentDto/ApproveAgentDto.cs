using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AgentDto
{
    public class ApproveAgentDto
    {
        [Required]
        public bool IsApproved { get; set; }

    }
}
