using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using RealEstate.Repositories;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    private readonly IProductRepository productRepository;
    private readonly IHttpClientFactory httpClientFactory;
    private readonly IConfiguration configuration;

    public ChatbotController(IProductRepository productRepository, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        this.productRepository = productRepository;
        this.httpClientFactory = httpClientFactory;
        this.configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> ChatWithBot([FromBody] ChatRequestDto dto)
    {
        var product = await productRepository.GetByIdAsync(dto.ProductId);
        if (product == null)
            return NotFound("Product not found.");

        var systemMessage = new
        {
            role = "system",
            content = $"You are a product assistant. The user is viewing a product: {product.Name}. Description: {product.Description}. Price: {product.Price}. Use this info to help answer questions."
        };

        var userMessage = new
        {
            role = "user",
            content = dto.Message
        };

        var payload = new
        {
            model = "gpt-3.5-turbo-0613", // or gpt-3.5-turbo
            messages = new[] { systemMessage, userMessage },
            temperature = 0.7
        };

        var client = httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        request.Headers.Add("Authorization", $"Bearer {configuration["OpenAI:ApiKey"]}");
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var reply = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        return Ok(new { reply });
    }
}

public class ChatRequestDto
{
    public int ProductId { get; set; }
    public string Message { get; set; } = string.Empty;
}
