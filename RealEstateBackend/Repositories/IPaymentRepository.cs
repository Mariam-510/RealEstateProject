using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IPaymentRepository
    {
        Task<Payment> GetByIdAsync(int id);
        Task<IEnumerable<Payment>> GetAllAsync();
        Task<Payment> AddAsync(Payment payment);
        Task UpdateAsync(Payment payment);
        Task DeleteAsync(int id);
        Task<bool> PaymentExists(int id);
        Task<IEnumerable<Payment>> GetPaymentsByMethod(PaymentMethod method);
        Task<IEnumerable<Payment>> GetPaymentsInDateRange(DateTime startDate, DateTime endDate);
    }
}
