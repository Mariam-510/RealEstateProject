using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using RealEstate.Models.DTOs.EmailDto;

namespace RealEstate.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public bool SendEmail(EmailDto request)
        {
            try
            {
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_config["EmailUsername"]));
                email.To.Add(MailboxAddress.Parse(request.To));
                email.Subject = request.Subject;
                email.Body = new TextPart(TextFormat.Html) { Text = request.Body };

                using var smtp = new SmtpClient();
                int port = _config.GetValue<int>("Port");

                smtp.Connect(_config["EmailHost"], port, SecureSocketOptions.StartTls);
                smtp.Authenticate(_config["EmailUsername"], _config["EmailPassword"]);

                var response = smtp.Send(email);

                smtp.Disconnect(true);

                return !string.IsNullOrEmpty(response);
            }
            catch (Exception ex)
            {
                return false;
            }
        }
    }
}

