namespace TreeChat.Models
{
    public class ApiConfigPreset
    {
        public string Name { get; set; }
        public string Provider { get; set; }
        public string ApiKey { get; set; }
        public string ApiEndpoint { get; set; }
        public string ModelName { get; set; }
        public double Temperature { get; set; }
        public double TopP { get; set; }
        public int TopK { get; set; }
    }
}
