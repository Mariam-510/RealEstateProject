using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AppointmentDto;
using RealEstate.Repositories;
using System;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentRepository _appointmentRepo;
        private readonly IMapper _mapper;
        private readonly IPropertyRepository _propertyRepo;
        public AppointmentController(IAppointmentRepository appointmentRepo, IPropertyRepository propertyRepo, IMapper mapper)
        {
            _appointmentRepo = appointmentRepo;
            _mapper = mapper;
            _propertyRepo= propertyRepo;
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


        [HttpGet("buyer/{buyerId}")]
        public async Task<IActionResult> GetAppointmentsByBuyer(int buyerId, [FromQuery] string sortOrder = "desc", [FromQuery] string status = null)
        {
            var appointments = await _appointmentRepo.GetByBuyerAsync(buyerId);
            if (appointments == null || appointments.Count == 0)
                return NotFound("No appointments found for this buyer.");
            if (!string.IsNullOrEmpty(status))
            {
                appointments = appointments.Where(a => a.Status.ToString().Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (sortOrder.ToLower() == "asc")
            {
                appointments = appointments.OrderBy(a => a.ScheduledTime).ToList(); 

            }
            else
            {
                appointments = appointments.OrderByDescending(a => a.ScheduledTime).ToList();

            }
            var dtoList = _mapper.Map<List<AppointmentDto>>(appointments);
            return Ok(dtoList);
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var property = await _propertyRepo.GetByIdAsync(createDto.PropertyId);  // Assuming a repository for Property
            var Buyer = await _appointmentRepo.GetByIdBuyerAsync(createDto.BuyerId);  // Assuming a repository for Property

            if ( property == null|| Buyer==null)
                return NotFound("Buyer or Property not found.");

            // Create appointment
            var appointment = _mapper.Map<Appointment>(createDto);
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
