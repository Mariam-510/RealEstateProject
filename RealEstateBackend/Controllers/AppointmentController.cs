using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AppointmentDto;
using RealEstate.Repositories;
using System;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IMapper _mapper;
        private readonly IPropertyRepository _propertyRepo;
        private readonly IBuyerRepository _buyerRepo;
        private readonly ISellerRepository _sellerRepo;
        private readonly IAgentRepository _agentRepo;
        public AppointmentController(IAppointmentRepository appointmentRepo, IPropertyRepository propertyRepo, IBuyerRepository buyerRepo,
            ISellerRepository sellerRepo, IAgentRepository agentRepo, IMapper mapper)
        {
            _appointmentRepo = appointmentRepo;
            _mapper = mapper;
            _propertyRepo= propertyRepo;
            _buyerRepo= buyerRepo;
            _sellerRepo= sellerRepo;
            _agentRepo =agentRepo;
        }



        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            // Get all appointments from the repository
            var appointments = await _appointmentRepo.GetAllAsync();

            // Map the appointments to DTOs
            var dtoList = _mapper.Map<List<AppointmentDto>>(appointments);

            return Ok(dtoList);
        }


        //[HttpGet]
        //[Authorize(Roles = "Buyer")]
        //public async Task<IActionResult> GetAppointmentsByBuyer( [FromQuery] string sortOrder = "desc", [FromQuery] string status = null)
        //{

        //    string buyerIdStr = User.FindFirst("userId")?.Value;
        //    Console.WriteLine(buyerIdStr);

        //    if (!int.TryParse(buyerIdStr, out int buyerId))
        //    {
        //        return Unauthorized("Buyer not found.");
        //    }
        //    var appointments = await _appointmentRepo.GetByBuyerAsync(buyerId);
        //    if (appointments == null || appointments.Count == 0)
        //        return NotFound("No appointments found for this buyer.");
        //    if (!string.IsNullOrEmpty(status))
        //    {
        //        appointments = appointments.Where(a => a.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
        //    }

        //    if (sortOrder.ToLower() == "asc")
        //    {
        //        appointments = appointments.OrderBy(a => a.ScheduledTime).ToList(); 

        //    }
        //    else
        //    {
        //        appointments = appointments.OrderByDescending(a => a.ScheduledTime).ToList();

        //    }
        //    var dtoList = _mapper.Map<List<AppointmentDto>>(appointments);
        //    return Ok(dtoList);
        //}
        [HttpGet]
        [Route("user/BuyerViewAllAppointment")]
        [Authorize(Roles = "Buyer,Seller,Agent")]
        public async Task<IActionResult> GetAppointmentsForUser([FromQuery] string sortOrder = "desc", [FromQuery] string status = null)
        {
            try
            {
                string userIdStr = User.FindFirst("userId")?.Value;
                if (!int.TryParse(userIdStr, out int userId))
                    return Unauthorized("User not found.");

                List<Appointment> appointments = new List<Appointment>();

                if (User.IsInRole("Buyer"))
                {
                    var buyer = await _buyerRepo.GetByIdAsync(userId);
                    if (buyer == null)
                        return NotFound("Buyer not found.");

                    appointments = (await _appointmentRepo.GetAppointmentsByBuyerIdAsync(buyer.Id)).ToList();
                }
                else if (User.IsInRole("Agent"))
                {
                    var agent = await _agentRepo.GetByIdAsync(userId);
                    if (agent == null)
                        return NotFound("Agent not found.");

                    appointments = (await _appointmentRepo.GetAppointmentsByAgentIdAsync(agent.Id)).ToList();
                }
                else if (User.IsInRole("Seller"))
                {
                    var seller = await _sellerRepo.GetByIdAsync(userId);
                    if (seller == null)
                        return NotFound("Seller not found.");

                    appointments = (await _appointmentRepo.GetAppointmentsBySellerIdAsync(seller.Id)).ToList();
                }
                else
                {
                    return Forbid();
                }

                //if (!appointments.Any())
                //    return NotFound("No appointments found for this user.");

                // Filter by status if provided
                if (!string.IsNullOrEmpty(status))
                {
                    appointments = appointments
                        .Where(a => a.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                // Sort by scheduled time
                appointments = sortOrder.ToLower() == "asc"
                    ? appointments.OrderBy(a => a.ScheduledTime).ToList()
                    : appointments.OrderByDescending(a => a.ScheduledTime).ToList();

                var result = appointments.Select(a => new AppointmentResponseDto
                {
                    Id = a.Id,
                    ScheduledTime = a.ScheduledTime,
                    Type = a.Type.ToString(),
                    Status = a.Status.ToString(),
                    buyerName = a.Buyer.FirstName + " " + a.Buyer.LastName,
                    buyerEmail = a.Buyer.Account.Email,
                    buyerImage=a.Buyer.Account.ImageUrl,
                    Property = new AppointmentPropertyDto
                    {
                        Id = a.Property.Id,
                        Title = a.Property.Title,
                        Location = a.Property.Location,
                        Price = a.Property.Price,
                        Type = a.Property.Type.ToString(),
                        Images = a.Property.Images.ToList(),
                        agentId = a.Property.AgentId,
                        sellerId = a.Property.SellerId,

                        userName = a.Property.Agent != null
                                ? a.Property.Agent.Name
                                : a.Property.Seller != null
                                    ? a.Property.Seller.FirstName + " " + a.Property.Seller.LastName
                                    : null,
                        userImage = a.Property.Agent != null
                            ? a.Property.Agent.Account?.ImageUrl
                            : a.Property.Seller != null
                                ? a.Property.Seller.Account?.ImageUrl
                                : null,
                        userType = a.Property.Agent != null ? "Agent"
                                : a.Property.Seller != null ? "Seller"
                                : null
                    }
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }

        }



        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _appointmentRepo.GetByIdAsync(id);
            if (appointment == null || appointment.IsDeleted)
                return NotFound();

            var dto = _mapper.Map<AppointmentDto>(appointment);
            return Ok(dto);
        }

        [HttpPost("book/{id}")]
        [Authorize(Roles ="Buyer")]
        public async Task<IActionResult> Create([FromRoute] int id, [FromBody] CreateAppointmentDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var property = await _propertyRepo.GetByIdAsync(id);
            if (property == null)
                return NotFound("Property not found.");
            if (property.Status == PropertyStatus.Sold)
                return NotFound("Property has been sold.");

            // Check if the buyer exists
            //var buyer = await _buyerRepo.GetByIdAsync(createDto.BuyerId);
            //if (buyer == null)
            //    return NotFound("Buyer not found.");
            string buyerIdStr = User.FindFirst("userId")?.Value;
            Console.WriteLine(buyerIdStr);

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            // Create appointment
            var appointment = _mapper.Map<Appointment>(createDto);
            appointment.PropertyId = id;  // From route
            appointment.BuyerId = buyerId;        // From token

            await _appointmentRepo.AddAsync(appointment);

            return CreatedAtAction(nameof(GetById),
                new { id = appointment.Id },
                _mapper.Map<AppointmentDto>(appointment));
        }


        [HttpPatch("{id}/status")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentDto dto)
        {
            if (dto == null)
                return BadRequest("The status DTO is required.");

            var appointment = await _appointmentRepo.GetByIdAsync(id);
            if (appointment == null || appointment.IsDeleted)
                return NotFound("Appointment not found.");

            // Try to parse the status string into the enum
            if (!Enum.TryParse<AppointmentStatus>(dto.Status, true, out var newStatus))
                return BadRequest("Invalid status value.");

            appointment.Status = newStatus;

            await _appointmentRepo.UpdateAsync(appointment);

            return Ok(_mapper.Map<AppointmentDto>(appointment));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var appointment = await _appointmentRepo.GetByIdAsync(id);
            if (appointment == null || appointment.IsDeleted) return NotFound();

            await _appointmentRepo.DeleteAsync(id);
            await _appointmentRepo.UpdateAsync(appointment);
            return Ok(new { message = "Appointment soft-deleted successfully." });
        }
    }

}
