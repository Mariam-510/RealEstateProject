using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly RealEstateDbContext _context;

        public AppointmentRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<List<Appointment>> GetAllAsync()
        {
            return await _context.Appointments
                .Include(a => a.Buyer)
                .Include(a => a.Property)
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            return await _context.Appointments
                .Include(a => a.Buyer)
                .Include(a => a.Property)
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
        }

      

        //get appointments of specific buyer
        public async Task<List<Appointment>> GetByBuyerAsync(int buyerId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.BuyerId == buyerId && !a.IsDeleted)
                .Include(a => a.Buyer)  
                .Include(a => a.Property)  
                .ToListAsync();
               

            return appointments;
        }
        public async Task AddAsync(Appointment appointment)
        {
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Appointment appointment)
        {
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                appointment.IsDeleted = true;
                await _context.SaveChangesAsync();
            }
        }
        public async Task<IEnumerable<Appointment>> GetAppointmentsByBuyerIdAsync(int buyerId)
        {
            return await _context.Appointments
                .Where(a => a.BuyerId == buyerId && !a.IsDeleted)
                .Include(a => a.Property).ThenInclude(p=>p.Agent ).ThenInclude(a=>a.Account).
                Include(a => a.Property).ThenInclude(p => p.Seller).ThenInclude(a => a.Account)
                .OrderByDescending(a => a.ScheduledTime)
                .ToListAsync();
        }

    }
}
