using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly RealEstateDbContext _context;

        public PaymentRepository(RealEstateDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Payment> GetByIdAsync(int id)
        {
            return await _context.Payments.FindAsync(id);
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Payments.ToListAsync();
        }

        public async Task<Payment> AddAsync(Payment payment)
        {
            if (payment == null)
            {
                throw new ArgumentNullException(nameof(payment));
            }

            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();

            return payment;
        }

        public async Task UpdateAsync(Payment payment)
        {
            if (payment == null)
            {
                throw new ArgumentNullException(nameof(payment));
            }

            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var payment = await GetByIdAsync(id);
            if (payment != null)
            {
                _context.Payments.Remove(payment);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> PaymentExists(int id)
        {
            return await _context.Payments.AnyAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByMethod(PaymentMethod method)
        {
            return await _context.Payments
                .Where(p => p.PaymentMethod == method)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>> GetPaymentsInDateRange(DateTime startDate, DateTime endDate)
        {
            return await _context.Payments
                .Where(p => p.PaidAt >= startDate && p.PaidAt <= endDate)
                .OrderBy(p => p.PaidAt)
                .ToListAsync();
        }
    }
}
