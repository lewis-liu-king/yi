using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.IO;
using Newtonsoft.Json;
using TreeChat.Models;

namespace TreeChat.Services
{
    public class ApiConfigService
    {
        private const string ConfigFile = "api_configs.json";
        private const string EncryptionKey = "ECNUChatTreeEncryptionKey";

        public List<ApiConfigPreset> Presets { get; private set; }
        public ApiConfigPreset CurrentPreset { get; set; }

        public ApiConfigService()
        {
            Presets = new List<ApiConfigPreset>();
            LoadConfigs();
        }

        public void SaveConfigSecurely()
        {
            var configData = new { Presets, CurrentPresetName = CurrentPreset?.Name };
            var json = JsonConvert.SerializeObject(configData);
            var encryptedJson = Encrypt(json);
            File.WriteAllText(ConfigFile, encryptedJson);
        }

        public void LoadConfigs()
        {
            if (File.Exists(ConfigFile))
            {
                var encryptedJson = File.ReadAllText(ConfigFile);
                var json = Decrypt(encryptedJson);
                var configData = JsonConvert.DeserializeObject<dynamic>(json);
                
                Presets = JsonConvert.DeserializeObject<List<ApiConfigPreset>>(
                    JsonConvert.SerializeObject(configData.Presets));
                
                if (configData.CurrentPresetName != null)
                {
                    CurrentPreset = Presets.Find(p => p.Name == configData.CurrentPresetName);
                }
            }
        }

        public List<string> GetSupportedProviders()
        {
            return new List<string> { "ECNU", "OpenAI", "Azure OpenAI", "Anthropic", "Custom" };
        }

        public ApiConfigPreset CreateConfigForProvider(string provider)
        {
            var preset = new ApiConfigPreset
            {
                Provider = provider,
                Temperature = 0.7,
                TopP = 0.8,
                TopK = 20
            };

            switch (provider)
            {
                case "ECNU":
                    preset.ApiEndpoint = "https://chat.ecnu.edu.cn/open/api/v1/chat/completions";
                    preset.ModelName = "ecnu-plus";
                    break;
                case "OpenAI":
                    preset.ApiEndpoint = "https://api.openai.com/v1/chat/completions";
                    preset.ModelName = "gpt-3.5-turbo";
                    break;
                case "Azure OpenAI":
                    preset.ApiEndpoint = "https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2024-02-01";
                    preset.ModelName = "gpt-35-turbo";
                    break;
                case "Anthropic":
                    preset.ApiEndpoint = "https://api.anthropic.com/v1/messages";
                    preset.ModelName = "claude-3-opus-20240229";
                    break;
                case "Custom":
                    preset.ApiEndpoint = "https://api.example.com/v1/chat/completions";
                    preset.ModelName = "custom-model";
                    break;
            }

            return preset;
        }

        private string Encrypt(string plainText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.PadRight(32).Substring(0, 32));
                aes.IV = new byte[16];
                
                using (var encryptor = aes.CreateEncryptor())
                using (var msEncrypt = new MemoryStream())
                {
                    using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (var swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(plainText);
                    }
                    return System.Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        private string Decrypt(string cipherText)
        {
            using (var aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(EncryptionKey.PadRight(32).Substring(0, 32));
                aes.IV = new byte[16];
                
                using (var decryptor = aes.CreateDecryptor())
                using (var msDecrypt = new MemoryStream(System.Convert.FromBase64String(cipherText)))
                using (var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (var srDecrypt = new StreamReader(csDecrypt))
                {
                    return srDecrypt.ReadToEnd();
                }
            }
        }
    }
}
