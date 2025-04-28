using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAllAsync();
        Task<List<Appointment>> GetByBuyerAsync(int buyerId);
        Task<Appointment?> GetByIdAsync(int id);
        Task AddAsync(Appointment appointment);
        Task UpdateAsync(Appointment appointment);
        Task DeleteAsync(int id);
        Task<IEnumerable<Appointment>> GetAppointmentsByBuyerIdAsync(int buyerId);

    }
}
