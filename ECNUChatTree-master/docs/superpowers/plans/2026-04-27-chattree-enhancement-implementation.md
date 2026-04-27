# ECNUChatTree 增强功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现ECNUChatTree的全面功能增强，包括高级API配置、用户界面优化、数据管理增强、高级树操作和性能优化。

**Architecture:** 保持现有的MVVM架构，通过模块化增强实现新功能，确保代码的可维护性和扩展性。

**Tech Stack:** .NET 8.0, WPF, Newtonsoft.Json, 新增加密库和主题管理库。

---

## 阶段一：核心功能增强

### 任务1：API配置系统增强

**Files:**
- Create: `/workspace/ECNUChatTree-master/TreeChat/Models/ApiConfigPreset.cs`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Services/ApiConfigService.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Services/ApiConfig.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Views/ConfigDialog.xaml`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Views/ConfigDialog.xaml.cs`

- [ ] **Step 1: 创建ApiConfigPreset模型**

```csharp
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
```

- [ ] **Step 2: 创建ApiConfigService**

```csharp
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.IO;
using Newtonsoft.Json;

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

        public void LoadConfigSecurely()
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
```

- [ ] **Step 3: 修改ApiConfig**

```csharp
namespace TreeChat.Services
{
    public class ApiConfig
    {
        public static string ApiKey = "";
        public static string ApiEndpoint = "https://chat.ecnu.edu.cn/open/api/v1/chat/completions";
        public static string ModelName = "ecnu-plus";
        public static double Temperature = 0.7;
        public static double TopP = 0.8;
        public static int TopK = 20;
    }
}
```

- [ ] **Step 4: 修改ConfigDialog.xaml**

```xaml
<Window x:Class="TreeChat.Views.ConfigDialog"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:d="http://schemas.microsoft.com/expression/blend/2008"
        xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
        mc:Ignorable="d"
        Title="AI配置"
        Width="550"
        Height="450"
        WindowStartupLocation="CenterOwner">
    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <TextBlock Grid.Row="0" Text="AI参数配置" FontSize="16" FontWeight="Bold" Margin="0,0,0,20"/>
        
        <StackPanel Grid.Row="1">
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="模型提供商:" Width="120" VerticalAlignment="Center"/>
                <ComboBox x:Name="ProviderComboBox" Width="250" SelectedValuePath="Content">
                    <ComboBoxItem Content="ECNU"/>
                    <ComboBoxItem Content="OpenAI"/>
                    <ComboBoxItem Content="Azure OpenAI"/>
                    <ComboBoxItem Content="Anthropic"/>
                    <ComboBoxItem Content="Custom"/>
                </ComboBox>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="API Key:" Width="120" VerticalAlignment="Center"/>
                <PasswordBox x:Name="ApiKeyPasswordBox" Width="250"/>
                <Button x:Name="TestConnectionButton" Content="测试连接" Width="100" Margin="10,0,0,0"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="API端点:" Width="120" VerticalAlignment="Center"/>
                <TextBox x:Name="ApiEndpointTextBox" Text="{Binding ApiEndpoint}" Width="350"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="模型名称:" Width="120" VerticalAlignment="Center"/>
                <TextBox x:Name="ModelNameTextBox" Text="{Binding ModelName}" Width="350"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="随机性:" Width="120" VerticalAlignment="Center"/>
                <TextBlock Text="0" Width="20" VerticalAlignment="Center" HorizontalAlignment="Left"/>
                <Slider x:Name="TemperatureSlider" Minimum="0" Maximum="2" Value="{Binding Temperature}" Width="150" Margin="0,0,0,0"/>
                <TextBlock Text="2" Width="20" VerticalAlignment="Center" HorizontalAlignment="Right"/>
                <TextBlock x:Name="TemperatureValue" Text="{Binding TemperatureDisplay}" Width="80" HorizontalAlignment="Right" VerticalAlignment="Center"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="核采样:" Width="120" VerticalAlignment="Center"/>
                <TextBlock Text="0" Width="20" VerticalAlignment="Center" HorizontalAlignment="Left"/>
                <Slider x:Name="TopPSlider" Minimum="0" Maximum="1" Value="{Binding TopP}" Width="150" Margin="0,0,0,0"/>
                <TextBlock Text="1" Width="20" VerticalAlignment="Center" HorizontalAlignment="Right"/>
                <TextBlock x:Name="TopPValue" Text="{Binding TopPDisplay}" Width="80" HorizontalAlignment="Right" VerticalAlignment="Center"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,0,0,15">
                <TextBlock Text="候选词数量:" Width="120" VerticalAlignment="Center"/>
                <TextBlock Text="0" Width="20" VerticalAlignment="Center" HorizontalAlignment="Left"/>
                <Slider x:Name="TopKSlider" Minimum="0" Maximum="40" Value="{Binding TopK}" Width="150" Margin="0,0,0,0" IsSnapToTickEnabled="True" TickFrequency="1"/>
                <TextBlock Text="40" Width="20" VerticalAlignment="Center" HorizontalAlignment="Right"/>
                <TextBlock x:Name="TopKValue" Text="{Binding TopKDisplay}" Width="80" HorizontalAlignment="Right" VerticalAlignment="Center"/>
            </StackPanel>
            
            <StackPanel Orientation="Horizontal" VerticalAlignment="Center" Margin="0,20,0,15">
                <TextBlock Text="配置预设:" Width="120" VerticalAlignment="Center"/>
                <ComboBox x:Name="PresetComboBox" Width="250"/>
                <Button x:Name="SavePresetButton" Content="保存预设" Width="100" Margin="10,0,0,0"/>
                <Button x:Name="DeletePresetButton" Content="删除预设" Width="100" Margin="10,0,0,0"/>
            </StackPanel>
        </StackPanel>
        
        <StackPanel Grid.Row="2" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,30,0,0">
            <Button x:Name="CancelButton" Content="取消" Width="80" Click="CancelButton_Click" Margin="0,0,10,0"/>
            <Button x:Name="OKButton" Content="确定" Width="80" Click="OKButton_Click"/>
        </StackPanel>
    </Grid>
</Window>
```

- [ ] **Step 5: 修改ConfigDialog.xaml.cs**

```csharp
using System.Windows;
using TreeChat.Services;
using TreeChat.Models;

namespace TreeChat.Views
{
    public partial class ConfigDialog : Window
    {
        private ApiConfigService _apiConfigService;
        
        public string ApiKey { get; set; }
        public string ApiEndpoint { get; set; }
        public string ModelName { get; set; }
        public double Temperature { get; set; }
        public double TopP { get; set; }
        public int TopK { get; set; }
        public string Provider { get; set; }

        public string TemperatureDisplay => $"（{Temperature:F1}）";
        public string TopPDisplay => $"（{TopP:F1}）";
        public string TopKDisplay => $"（{TopK}）";

        public ConfigDialog()
        {
            InitializeComponent();
            
            _apiConfigService = new ApiConfigService();
            
            // 初始化提供商列表
            ProviderComboBox.SelectedIndex = 0;
            Provider = "ECNU";
            
            // 设置默认值
            ApiKey = "";
            ApiEndpoint = ApiConfig.ApiEndpoint;
            ModelName = ApiConfig.ModelName;
            Temperature = ApiConfig.Temperature;
            TopP = ApiConfig.TopP;
            TopK = ApiConfig.TopK;
            
            // 加载预设
            LoadPresets();
            
            // 绑定事件
            ProviderComboBox.SelectionChanged += ProviderComboBox_SelectionChanged;
            TestConnectionButton.Click += TestConnectionButton_Click;
            SavePresetButton.Click += SavePresetButton_Click;
            DeletePresetButton.Click += DeletePresetButton_Click;
            
            DataContext = this;
        }

        private void ProviderComboBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            if (ProviderComboBox.SelectedItem is System.Windows.Controls.ComboBoxItem item)
            {
                Provider = item.Content.ToString();
                var preset = _apiConfigService.CreateConfigForProvider(Provider);
                ApiEndpoint = preset.ApiEndpoint;
                ModelName = preset.ModelName;
                Temperature = preset.Temperature;
                TopP = preset.TopP;
                TopK = preset.TopK;
                
                // 触发属性变更
                OnPropertyChanged(nameof(ApiEndpoint));
                OnPropertyChanged(nameof(ModelName));
                OnPropertyChanged(nameof(Temperature));
                OnPropertyChanged(nameof(TopP));
                OnPropertyChanged(nameof(TopK));
            }
        }

        private void TestConnectionButton_Click(object sender, RoutedEventArgs e)
        {
            // 实现测试连接功能
            MessageBox.Show("测试连接功能待实现", "提示", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void SavePresetButton_Click(object sender, RoutedEventArgs e)
        {
            var presetName = Microsoft.VisualBasic.Interaction.InputBox("请输入预设名称:", "保存预设", "");
            if (!string.IsNullOrWhiteSpace(presetName))
            {
                var preset = new ApiConfigPreset
                {
                    Name = presetName,
                    Provider = Provider,
                    ApiKey = ApiKeyPasswordBox.Password,
                    ApiEndpoint = ApiEndpoint,
                    ModelName = ModelName,
                    Temperature = Temperature,
                    TopP = TopP,
                    TopK = TopK
                };
                
                _apiConfigService.Presets.Add(preset);
                _apiConfigService.SaveConfigSecurely();
                LoadPresets();
                
                MessageBox.Show("预设保存成功", "提示", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void DeletePresetButton_Click(object sender, RoutedEventArgs e)
        {
            if (PresetComboBox.SelectedItem is ApiConfigPreset preset)
            {
                if (MessageBox.Show("确定要删除此预设吗?", "确认", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    _apiConfigService.Presets.Remove(preset);
                    _apiConfigService.SaveConfigSecurely();
                    LoadPresets();
                }
            }
        }

        private void LoadPresets()
        {
            PresetComboBox.Items.Clear();
            foreach (var preset in _apiConfigService.Presets)
            {
                PresetComboBox.Items.Add(preset);
            }
            PresetComboBox.DisplayMemberPath = "Name";
        }

        private void OKButton_Click(object sender, RoutedEventArgs e)
        {
            ApiKey = ApiKeyPasswordBox.Password;
            DialogResult = true;
            Close();
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        // 实现INotifyPropertyChanged
        public event System.ComponentModel.PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
        }
    }
}
```

- [ ] **Step 6: 测试API配置功能**

运行应用，打开配置对话框，测试：
- 不同模型提供商的切换
- API密钥的输入
- 配置预设的保存和加载
- 测试连接功能

- [ ] **Step 7: 提交代码**

```bash
git add TreeChat/Models/ApiConfigPreset.cs TreeChat/Services/ApiConfigService.cs TreeChat/Services/ApiConfig.cs TreeChat/Views/ConfigDialog.xaml TreeChat/Views/ConfigDialog.xaml.cs
git commit -m "feat: 增强API配置系统，支持多模型和配置预设"
```

### 任务2：数据模型增强

**Files:**
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Models/ChatTree.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Models/ChatTreeNode.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Models/ChatMessage.cs`

- [ ] **Step 1: 修改ChatMessage**

```csharp
namespace TreeChat.Models
{
    public class ChatMessage
    {
        public string Role { get; }
        public string Content { get; }
        public DateTime Timestamp { get; }
        public string MessageId { get; }

        public ChatMessage(string role, string content)
        {
            Role = role;
            Content = content;
            Timestamp = DateTime.Now;
            MessageId = Guid.NewGuid().ToString();
        }
    }
}
```

- [ ] **Step 2: 修改ChatTreeNode**

```csharp
namespace TreeChat.Models
{
    public class ChatTreeNode
    {
        public ChatTreeNode? ParentNode { get; }
        public List<ChatTreeNode> ChildNodes { get; } = new List<ChatTreeNode>();
        public ChatMessage UserMessage { get; }
        public ChatMessage? ReplyMessage { get; private set; }
        public int NodeID { get; }
        public string? Name { get; set; }
        public DateTime CreatedAt { get; }
        public DateTime LastModifiedAt { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public bool IsExpanded { get; set; } = true;

        private static int _nextNodeID = 1;

        public ChatTreeNode(ChatTreeNode? parentNode, ChatMessage userMessage)
        {
            ParentNode = parentNode;
            UserMessage = userMessage;
            NodeID = _nextNodeID++;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
        }

        public ChatTreeNode(ChatTreeNode? parentNode, ChatMessage userMessage, int nodeId)
        {
            ParentNode = parentNode;
            UserMessage = userMessage;
            NodeID = nodeId;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
        }

        public static void ResetNextNodeId(int value)
        {
            _nextNodeID = value;
        }

        public static int GetCurrentNextNodeId()
        {
            return _nextNodeID;
        }

        public List<ChatMessage> GetFullContext()
        {
            var context = new List<ChatMessage>();
            var currentNode = this;

            while (currentNode != null)
            {
                if (currentNode.ReplyMessage != null && !string.IsNullOrEmpty(currentNode.ReplyMessage.Content))
                    context.Add(currentNode.ReplyMessage);

                if (!string.IsNullOrEmpty(currentNode.UserMessage.Content))
                    context.Add(currentNode.UserMessage);

                currentNode = currentNode.ParentNode;
            }

            context.Reverse();
            return context;
        }

        public ChatTreeNode AddChildNode(ChatMessage userMessage)
        {
            var childNode = new ChatTreeNode(this, userMessage);
            ChildNodes.Add(childNode);
            LastModifiedAt = DateTime.Now;
            return childNode;
        }

        public void SetAiReply(ChatMessage replyMessage)
        {
            ReplyMessage = replyMessage;
            LastModifiedAt = DateTime.Now;
        }

        public ChatTreeNode Clone(ChatTreeNode? newParent = null)
        {
            var clonedNode = new ChatTreeNode(newParent, UserMessage, NodeID);
            clonedNode.Name = Name;
            clonedNode.Tags = new List<string>(Tags);
            clonedNode.IsExpanded = IsExpanded;
            
            if (ReplyMessage != null)
            {
                clonedNode.SetAiReply(ReplyMessage);
            }
            
            foreach (var child in ChildNodes)
            {
                child.Clone(clonedNode);
            }
            
            return clonedNode;
        }

        public void MoveTo(ChatTreeNode newParent)
        {
            if (ParentNode != null)
            {
                ParentNode.ChildNodes.Remove(this);
                ParentNode.LastModifiedAt = DateTime.Now;
            }
            
            ParentNode = newParent;
            newParent.ChildNodes.Add(this);
            newParent.LastModifiedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
        }

        public void Delete(bool recursive = true)
        {
            if (recursive)
            {
                foreach (var child in ChildNodes.ToList())
                {
                    child.Delete(true);
                }
            }
            
            if (ParentNode != null)
            {
                ParentNode.ChildNodes.Remove(this);
                ParentNode.LastModifiedAt = DateTime.Now;
            }
        }

        public int GetDepth()
        {
            int depth = 0;
            var current = ParentNode;
            while (current != null)
            {
                depth++;
                current = current.ParentNode;
            }
            return depth;
        }

        public int GetSubtreeSize()
        {
            int size = 1;
            foreach (var child in ChildNodes)
            {
                size += child.GetSubtreeSize();
            }
            return size;
        }
    }
}
```

- [ ] **Step 3: 修改ChatTree**

```csharp
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Collections.Generic;
using TreeChat.Services;

namespace TreeChat.Models
{
    public class ChatTree : INotifyPropertyChanged
    {
        private string _treeTitle = "新对话";

        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value))
                return false;

            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        public ChatTreeNode RootNode { get; private set; }
        public ChatTreeNode CurrentNode { get; private set; }

        public string TreeTitle
        {
            get => _treeTitle;
            set => SetProperty(ref _treeTitle, value);
        }

        public string ApiKey { get; set; }
        public string ApiEndpoint { get; set; }
        public string ModelName { get; set; }
        public double Temperature { get; set; }
        public double TopP { get; set; }
        public int TopK { get; set; }
        public DateTime CreatedAt { get; }
        public DateTime LastModifiedAt { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public int NodeCount => RootNode.GetSubtreeSize();

        public ChatTree()
        {
            RootNode = new ChatTreeNode(null, new ChatMessage("system", "你是一个有帮助的AI助手。"));
            CurrentNode = RootNode;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
            
            ApiKey = ApiConfig.ApiKey;
            ApiEndpoint = ApiConfig.ApiEndpoint;
            ModelName = ApiConfig.ModelName;
            Temperature = ApiConfig.Temperature;
            TopP = ApiConfig.TopP;
            TopK = ApiConfig.TopK;
        }

        public ChatTree(string? systemPrompt = null, string? apiKey = null, string? apiEndpoint = null, string? modelName = null, double? temperature = null, double? topP = null, int? topK = null)
        {
            if (!string.IsNullOrWhiteSpace(systemPrompt))
            {
                RootNode = new ChatTreeNode(null, new ChatMessage("system", systemPrompt));
            }
            else
            {
                RootNode = new ChatTreeNode(null, new ChatMessage("system", "你是一个有帮助的AI助手。"));
            }
            CurrentNode = RootNode;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
            
            ApiKey = apiKey ?? ApiConfig.ApiKey;
            ApiEndpoint = apiEndpoint ?? ApiConfig.ApiEndpoint;
            ModelName = modelName ?? ApiConfig.ModelName;
            Temperature = temperature ?? ApiConfig.Temperature;
            TopP = topP ?? ApiConfig.TopP;
            TopK = topK ?? ApiConfig.TopK;
        }

        public void SetRootNode(ChatTreeNode rootNode)
        {
            RootNode = rootNode;
            CurrentNode = rootNode;
            LastModifiedAt = DateTime.Now;
        }

        public void SetCurrentNode(ChatTreeNode node)
        {
            CurrentNode = node;
            LastModifiedAt = DateTime.Now;
        }

        private ChatTreeNode? FindNodeById(ChatTreeNode startNode, int nodeID)
        {
            if (startNode.NodeID == nodeID)
                return startNode;
            foreach (var child in startNode.ChildNodes)
            {
                var found = FindNodeById(child, nodeID);
                if (found != null)
                    return found;
            }
            return null;
        }

        public ChatTreeNode? FindNodeById(int nodeID)
        {
            return FindNodeById(RootNode, nodeID);
        }

        public void Merge(ChatTree otherTree)
        {
            var clonedRoot = otherTree.RootNode.Clone(RootNode);
            LastModifiedAt = DateTime.Now;
        }

        public ChatTree Clone()
        {
            var clonedTree = new ChatTree
            {
                TreeTitle = TreeTitle + " (副本)",
                ApiKey = ApiKey,
                ApiEndpoint = ApiEndpoint,
                ModelName = ModelName,
                Temperature = Temperature,
                TopP = TopP,
                TopK = TopK,
                Tags = new List<string>(Tags)
            };
            
            var clonedRoot = RootNode.Clone();
            clonedTree.SetRootNode(clonedRoot);
            
            return clonedTree;
        }

        public void PruneEmptyBranches()
        {
            PruneNode(RootNode);
            LastModifiedAt = DateTime.Now;
        }

        private void PruneNode(ChatTreeNode node)
        {
            for (int i = node.ChildNodes.Count - 1; i >= 0; i--)
            {
                var child = node.ChildNodes[i];
                if (child.ReplyMessage == null && child.ChildNodes.Count == 0)
                {
                    node.ChildNodes.RemoveAt(i);
                }
                else
                {
                    PruneNode(child);
                }
            }
        }

        public IEnumerable<ChatTreeNode> FindNodes(Func<ChatTreeNode, bool> predicate)
        {
            var results = new List<ChatTreeNode>();
            FindNodesRecursive(RootNode, predicate, results);
            return results;
        }

        private void FindNodesRecursive(ChatTreeNode node, Func<ChatTreeNode, bool> predicate, List<ChatTreeNode> results)
        {
            if (predicate(node))
            {
                results.Add(node);
            }
            foreach (var child in node.ChildNodes)
            {
                FindNodesRecursive(child, predicate, results);
            }
        }
    }
}
```

- [ ] **Step 4: 测试数据模型增强**

运行应用，测试：
- 节点的创建和删除
- 树的克隆和合并
- 空分支的修剪
- 节点查找功能

- [ ] **Step 5: 提交代码**

```bash
git add TreeChat/Models/ChatTree.cs TreeChat/Models/ChatTreeNode.cs TreeChat/Models/ChatMessage.cs
git commit -m "feat: 增强数据模型，添加元数据和高级操作"
```

### 任务3：主题系统实现

**Files:**
- Create: `/workspace/ECNUChatTree-master/TreeChat/Models/Theme.cs`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Services/ThemeService.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/Views/MainWindow.xaml`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Views/ThemeSelector.xaml`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Views/ThemeSelector.xaml.cs`

- [ ] **Step 1: 创建Theme模型**

```csharp
namespace TreeChat.Models
{
    public class Theme
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public bool IsDark { get; set; }
        public Dictionary<string, string> Colors { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> Fonts { get; set; } = new Dictionary<string, string>();

        public Theme() { }

        public Theme(string name, string displayName, bool isDark)
        {
            Name = name;
            DisplayName = displayName;
            IsDark = isDark;
        }
    }
}
```

- [ ] **Step 2: 创建ThemeService**

```csharp
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using System.Windows;
using System.Windows.Media;

namespace TreeChat.Services
{
    public class ThemeService
    {
        private const string ThemesFile = "themes.json";
        private const string CurrentThemeKey = "CurrentTheme";

        public List<Theme> AvailableThemes { get; private set; }
        public Theme CurrentTheme { get; set; }

        public ThemeService()
        {
            AvailableThemes = new List<Theme>();
            LoadThemes();
            LoadThemePreferences();
        }

        public void ApplyTheme(Theme theme)
        {
            CurrentTheme = theme;
            
            // 应用颜色
            foreach (var color in theme.Colors)
            {
                Application.Current.Resources[color.Key] = (Color)ColorConverter.ConvertFromString(color.Value);
            }
            
            // 应用字体
            foreach (var font in theme.Fonts)
            {
                Application.Current.Resources[font.Key] = new FontFamily(font.Value);
            }
            
            SaveThemePreferences();
        }

        public void SaveThemePreferences()
        {
            var config = new { CurrentTheme = CurrentTheme?.Name };
            var json = JsonConvert.SerializeObject(config);
            File.WriteAllText("theme_preferences.json", json);
        }

        public void LoadThemePreferences()
        {
            if (File.Exists("theme_preferences.json"))
            {
                var json = File.ReadAllText("theme_preferences.json");
                var config = JsonConvert.DeserializeObject<dynamic>(json);
                
                if (config.CurrentTheme != null)
                {
                    var theme = AvailableThemes.Find(t => t.Name == config.CurrentTheme);
                    if (theme != null)
                    {
                        ApplyTheme(theme);
                    }
                }
            }
        }

        private void LoadThemes()
        {
            // 内置主题
            var lightTheme = new Theme("light", "浅色主题", false)
            {
                Colors = new Dictionary<string, string>
                {
                    { "BackgroundBrush", "#FFFFFF" },
                    { "CardBrush", "#F8F9FA" },
                    { "TextBrush", "#000000" },
                    { "AccentBrush", "#0078D4" },
                    { "BorderBrush", "#E1E4E8" },
                    { "NodeBrush", "#E3F2FD" },
                    { "SelectedNodeBrush", "#BBDEFB" }
                },
                Fonts = new Dictionary<string, string>
                {
                    { "DefaultFont", "Segoe UI" }
                }
            };

            var darkTheme = new Theme("dark", "深色主题", true)
            {
                Colors = new Dictionary<string, string>
                {
                    { "BackgroundBrush", "#1E1E1E" },
                    { "CardBrush", "#252526" },
                    { "TextBrush", "#E1E1E1" },
                    { "AccentBrush", "#0E639C" },
                    { "BorderBrush", "#3E3E42" },
                    { "NodeBrush", "#2D3748" },
                    { "SelectedNodeBrush", "#4A5568" }
                },
                Fonts = new Dictionary<string, string>
                {
                    { "DefaultFont", "Segoe UI" }
                }
            };

            AvailableThemes.Add(lightTheme);
            AvailableThemes.Add(darkTheme);

            // 加载自定义主题
            if (File.Exists(ThemesFile))
            {
                var json = File.ReadAllText(ThemesFile);
                var customThemes = JsonConvert.DeserializeObject<List<Theme>>(json);
                if (customThemes != null)
                {
                    AvailableThemes.AddRange(customThemes);
                }
            }

            // 默认使用浅色主题
            if (CurrentTheme == null)
            {
                CurrentTheme = lightTheme;
            }
        }

        public void SaveTheme(Theme theme)
        {
            var existingTheme = AvailableThemes.Find(t => t.Name == theme.Name);
            if (existingTheme != null)
            {
                AvailableThemes.Remove(existingTheme);
            }
            AvailableThemes.Add(theme);

            var json = JsonConvert.SerializeObject(AvailableThemes.FindAll(t => !t.Name.Equals("light") && !t.Name.Equals("dark")));
            File.WriteAllText(ThemesFile, json);
        }

        public void DeleteTheme(Theme theme)
        {
            if (!theme.Name.Equals("light") && !theme.Name.Equals("dark"))
            {
                AvailableThemes.Remove(theme);
                var json = JsonConvert.SerializeObject(AvailableThemes.FindAll(t => !t.Name.Equals("light") && !t.Name.Equals("dark")));
                File.WriteAllText(ThemesFile, json);
            }
        }
    }
}
```

- [ ] **Step 3: 修改MainWindow.xaml**

```xaml
<Window x:Class="TreeChat.Views.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:vm="clr-namespace:TreeChat.ViewModels"
        xmlns:local="clr-namespace:TreeChat.Views"
        Title="树形AI聊天工具"
        Height="600"
        Width="1000">
    <Window.Resources>
        <SolidColorBrush x:Key="BackgroundBrush" Color="#FFFFFF"/>
        <SolidColorBrush x:Key="CardBrush" Color="#F8F9FA"/>
        <SolidColorBrush x:Key="TextBrush" Color="#000000"/>
        <SolidColorBrush x:Key="AccentBrush" Color="#0078D4"/>
        <SolidColorBrush x:Key="BorderBrush" Color="#E1E4E8"/>
        <SolidColorBrush x:Key="NodeBrush" Color="#E3F2FD"/>
        <SolidColorBrush x:Key="SelectedNodeBrush" Color="#BBDEFB"/>
        <Style x:Key="GridSplitterStyle" TargetType="GridSplitter">
            <Setter Property="Background" Value="{StaticResource BorderBrush}"/>
            <Setter Property="Width" Value="5"/>
            <Setter Property="Cursor" Value="SizeWE"/>
        </Style>
    </Window.Resources>
    
    <DockPanel>
        <Menu DockPanel.Dock="Top">
            <MenuItem Header="文件">
                <MenuItem Header="新建对话"/>
                <MenuItem Header="加载对话"/>
                <MenuItem Header="保存对话"/>
                <MenuItem Header="导出"/>
                <Separator/>
                <MenuItem Header="退出"/>
            </MenuItem>
            <MenuItem Header="编辑">
                <MenuItem Header="复制"/>
                <MenuItem Header="粘贴"/>
                <Separator/>
                <MenuItem Header="删除节点"/>
            </MenuItem>
            <MenuItem Header="视图">
                <MenuItem Header="主题" x:Name="ThemeMenuItem"/>
                <MenuItem Header="全屏"/>
                <MenuItem Header="重置布局"/>
            </MenuItem>
            <MenuItem Header="设置">
                <MenuItem Header="API配置"/>
                <MenuItem Header="应用设置"/>
            </MenuItem>
            <MenuItem Header="帮助">
                <MenuItem Header="关于"/>
                <MenuItem Header="使用帮助"/>
            </MenuItem>
        </Menu>
        
        <ToolBar DockPanel.Dock="Top">
            <Button Content="新建"/>
            <Button Content="加载"/>
            <Button Content="保存"/>
            <Button Content="导出"/>
            <Separator/>
            <Button Content="主题" x:Name="ThemeButton"/>
            <Button Content="搜索"/>
        </ToolBar>
        
        <Grid>
            <Grid.RowDefinitions>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>

            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="300" MinWidth="300"/>
                <ColumnDefinition Width="Auto"/>
                <ColumnDefinition Width="600" MinWidth="600"/>
                <ColumnDefinition Width="Auto"/>
                <ColumnDefinition Width="*" MinWidth="200"/>
            </Grid.ColumnDefinitions>

            <local:ChatManagementPanel Grid.Row="0" Grid.Column="0"
                                       DataContext="{Binding ChatManagementPanelVM}"/>

            <GridSplitter Grid.Column="1"
                          Style="{StaticResource GridSplitterStyle}"/>

            <Border Grid.Row="0" Grid.Column="2"
                    Background="{StaticResource CardBrush}"
                    CornerRadius="4"
                    Margin="4">
                <local:TreeVisualizationView x:Name="treeView"
                                             DataContext="{Binding TreeVisualizationVM}"
                                             SelectedNode="{Binding SelectedNode, Mode=TwoWay}"/>
            </Border>

            <GridSplitter Grid.Column="3"
                          Style="{StaticResource GridSplitterStyle}"/>

            <local:ChatInformationView Grid.Row="0" Grid.Column="4"
                                       DataContext="{Binding ChatInformationVM}"/>
        </Grid>
    </DockPanel>
</Window>
```

- [ ] **Step 4: 创建ThemeSelector.xaml**

```xaml
<Window x:Class="TreeChat.Views.ThemeSelector"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="主题选择器"
        Width="400"
        Height="300"
        WindowStartupLocation="CenterOwner">
    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <TextBlock Grid.Row="0" Text="选择主题" FontSize="16" FontWeight="Bold" Margin="0,0,0,20"/>
        
        <ListBox x:Name="ThemeListBox" Grid.Row="1" DisplayMemberPath="DisplayName">
            <ListBox.ItemTemplate>
                <DataTemplate>
                    <StackPanel Orientation="Horizontal" Margin="5">
                        <Border Width="20" Height="20" Margin="0,0,10,0">
                            <Border.Background>
                                <SolidColorBrush Color="{Binding Colors[BackgroundBrush], Converter={StaticResource StringToColorConverter}}"/>
                            </Border.Background>
                        </Border>
                        <TextBlock Text="{Binding DisplayName}"/>
                    </StackPanel>
                </DataTemplate>
            </ListBox.ItemTemplate>
        </ListBox>
        
        <StackPanel Grid.Row="2" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,20,0,0">
            <Button x:Name="CreateThemeButton" Content="创建主题" Width="100" Margin="0,0,10,0"/>
            <Button x:Name="DeleteThemeButton" Content="删除主题" Width="100" Margin="0,0,10,0"/>
            <Button x:Name="OKButton" Content="确定" Width="80"/>
        </StackPanel>
    </Grid>
</Window>
```

- [ ] **Step 5: 创建ThemeSelector.xaml.cs**

```csharp
using System.Windows;
using TreeChat.Services;
using TreeChat.Models;

namespace TreeChat.Views
{
    public partial class ThemeSelector : Window
    {
        private ThemeService _themeService;
        
        public ThemeSelector(ThemeService themeService)
        {
            InitializeComponent();
            _themeService = themeService;
            
            ThemeListBox.ItemsSource = _themeService.AvailableThemes;
            ThemeListBox.SelectedItem = _themeService.CurrentTheme;
            
            CreateThemeButton.Click += CreateThemeButton_Click;
            DeleteThemeButton.Click += DeleteThemeButton_Click;
            OKButton.Click += OKButton_Click;
        }

        private void CreateThemeButton_Click(object sender, RoutedEventArgs e)
        {
            // 实现创建主题功能
            MessageBox.Show("创建主题功能待实现", "提示", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void DeleteThemeButton_Click(object sender, RoutedEventArgs e)
        {
            if (ThemeListBox.SelectedItem is Theme theme && !theme.Name.Equals("light") && !theme.Name.Equals("dark"))
            {
                if (MessageBox.Show("确定要删除此主题吗?", "确认", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    _themeService.DeleteTheme(theme);
                    ThemeListBox.ItemsSource = null;
                    ThemeListBox.ItemsSource = _themeService.AvailableThemes;
                }
            }
        }

        private void OKButton_Click(object sender, RoutedEventArgs e)
        {
            if (ThemeListBox.SelectedItem is Theme theme)
            {
                _themeService.ApplyTheme(theme);
                DialogResult = true;
                Close();
            }
        }
    }
}
```

- [ ] **Step 6: 创建StringToColorConverter**

```csharp
using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace TreeChat.Converters
{
    public class StringToColorConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is string colorString)
            {
                return (Color)ColorConverter.ConvertFromString(colorString);
            }
            return Colors.Transparent;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is Color color)
            {
                return color.ToString();
            }
            return string.Empty;
        }
    }
}
```

- [ ] **Step 7: 修改App.xaml**

```xaml
<Application x:Class="TreeChat.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             xmlns:local="clr-namespace:TreeChat"
             xmlns:converters="clr-namespace:TreeChat.Converters"
             StartupUri="Views/MainWindow.xaml">
    <Application.Resources>
        <converters:StringToColorConverter x:Key="StringToColorConverter"/>
    </Application.Resources>
</Application>
```

- [ ] **Step 8: 测试主题系统**

运行应用，测试：
- 主题切换功能
- 主题保存和加载
- 界面元素的颜色变化

- [ ] **Step 9: 提交代码**

```bash
git add TreeChat/Models/Theme.cs TreeChat/Services/ThemeService.cs TreeChat/Views/MainWindow.xaml TreeChat/Views/ThemeSelector.xaml TreeChat/Views/ThemeSelector.xaml.cs TreeChat/Converters/StringToColorConverter.cs TreeChat/App.xaml
git commit -m "feat: 实现主题系统，支持浅色/深色主题"
```

---

## 阶段二：高级功能

### 任务4：数据管理增强

**Files:**
- Create: `/workspace/ECNUChatTree-master/TreeChat/Services/ExportService.cs`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Services/BackupService.cs`
- Create: `/workspace/ECNUChatTree-master/TreeChat/Services/SearchService.cs`
- Modify: `/workspace/ECNUChatTree-master/TreeChat/ViewModels/ChatManagementPanelVM.cs`

- [ ] **Step 1: 创建ExportService**

```csharp
using System.IO;
using System.Text;
using TreeChat.Models;

namespace TreeChat.Services
{
    public class ExportService
    {
        public bool ExportToMarkdown(ChatTree chatTree, string filePath)
        {
            try
            {
                var sb = new StringBuilder();
                sb.AppendLine($"# {chatTree.TreeTitle}");
                sb.AppendLine();
                sb.AppendLine($"创建时间: {chatTree.CreatedAt}");
                sb.AppendLine($"最后修改: {chatTree.LastModifiedAt}");
                sb.AppendLine();
                
                if (chatTree.Tags.Count > 0)
                {
                    sb.AppendLine("## 标签");
                    sb.AppendLine(string.Join(", ", chatTree.Tags));
                    sb.AppendLine();
                }
                
                sb.AppendLine("## 对话内容");
                sb.AppendLine();
                
                ExportNodeToMarkdown(chatTree.RootNode, sb, 1);
                
                File.WriteAllText(filePath, sb.ToString());
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool ExportToJson(ChatTree chatTree, string filePath)
        {
            try
            {
                var jsonService = new JsonSerializationService();
                var json = jsonService.SerializeChatTree(chatTree);
                File.WriteAllText(filePath, json);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool ExportToText(ChatTree chatTree, string filePath)
        {
            try
            {
                var sb = new StringBuilder();
                sb.AppendLine($"对话: {chatTree.TreeTitle}");
                sb.AppendLine($"创建时间: {chatTree.CreatedAt}");
                sb.AppendLine($"最后修改: {chatTree.LastModifiedAt}");
                sb.AppendLine(new string('-', 80));
                sb.AppendLine();
                
                ExportNodeToText(chatTree.RootNode, sb, 0);
                
                File.WriteAllText(filePath, sb.ToString());
                return true;
            }
            catch
            {
                return false;
            }
        }

        private void ExportNodeToMarkdown(ChatTreeNode node, StringBuilder sb, int level)
        {
            if (node.UserMessage.Role != "system" || level == 1)
            {
                sb.AppendLine($"{(new string('#', level + 1))} {(node.Name ?? $"节点 {node.NodeID}")}");
                sb.AppendLine();
                
                if (node.UserMessage.Role != "system")
                {
                    sb.AppendLine($"**用户:** {node.UserMessage.Content}");
                    sb.AppendLine();
                }
                else
                {
                    sb.AppendLine($"**系统提示:** {node.UserMessage.Content}");
                    sb.AppendLine();
                }
                
                if (node.ReplyMessage != null)
                {
                    sb.AppendLine($"**AI:** {node.ReplyMessage.Content}");
                    sb.AppendLine();
                }
            }
            
            foreach (var child in node.ChildNodes)
            {
                ExportNodeToMarkdown(child, sb, level + 1);
            }
        }

        private void ExportNodeToText(ChatTreeNode node, StringBuilder sb, int indent)
        {
            var indentStr = new string(' ', indent * 2);
            
            if (node.UserMessage.Role != "system")
            {
                sb.AppendLine($"{indentStr}用户: {node.UserMessage.Content}");
                sb.AppendLine();
            }
            else if (indent == 0)
            {
                sb.AppendLine($"{indentStr}系统提示: {node.UserMessage.Content}");
                sb.AppendLine();
            }
            
            if (node.ReplyMessage != null)
            {
                sb.AppendLine($"{indentStr}AI: {node.ReplyMessage.Content}");
                sb.AppendLine();
            }
            
            foreach (var child in node.ChildNodes)
            {
                ExportNodeToText(child, sb, indent + 1);
            }
        }
    }
}
```

- [ ] **Step 2: 创建BackupService**

```csharp
using System.IO;
using System.Collections.Generic;
using TreeChat.Models;

namespace TreeChat.Services
{
    public class BackupService
    {
        private const string BackupFolder = "backups";
        private const int MaxBackups = 10;

        public BackupService()
        {
            if (!Directory.Exists(BackupFolder))
            {
                Directory.CreateDirectory(BackupFolder);
            }
        }

        public bool CreateBackup(ChatTree chatTree)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var fileName = $"{chatTree.TreeTitle.Replace(' ', '_')}_{timestamp}.chat";
                var filePath = Path.Combine(BackupFolder, fileName);
                
                var fileService = new FileService();
                return fileService.SaveChatTree(chatTree, filePath);
            }
            catch
            {
                return false;
            }
        }

        public List<string> GetBackups()
        {
            try
            {
                var backups = new List<string>();
                var files = Directory.GetFiles(BackupFolder, "*.chat");
                
                foreach (var file in files.OrderByDescending(f => new FileInfo(f).LastWriteTime))
                {
                    backups.Add(file);
                }
                
                return backups;
            }
            catch
            {
                return new List<string>();
            }
        }

        public ChatTree? RestoreFromBackup(string backupPath)
        {
            try
            {
                var fileService = new FileService();
                return fileService.LoadChatTree(backupPath);
            }
            catch
            {
                return null;
            }
        }

        public void CleanupOldBackups()
        {
            try
            {
                var backups = GetBackups();
                if (backups.Count > MaxBackups)
                {
                    for (int i = MaxBackups; i < backups.Count; i++)
                    {
                        File.Delete(backups[i]);
                    }
                }
            }
            catch { }
        }
    }
}
```

- [ ] **Step 3: 创建SearchService**

```csharp
using System.Collections.Generic;
using System.Linq;
using TreeChat.Models;

namespace TreeChat.Services
{
    public class SearchService
    {
        public List<ChatTreeNode> Search(ChatTree chatTree, string query)
        {
            var results = new List<ChatTreeNode>();
            SearchNode(chatTree.RootNode, query, results);
            return results;
        }

        private void SearchNode(ChatTreeNode node, string query, List<ChatTreeNode> results)
        {
            if (node.UserMessage.Content.Contains(query, System.StringComparison.OrdinalIgnoreCase) ||
                (node.ReplyMessage != null && node.ReplyMessage.Content.Contains(query, System.StringComparison.OrdinalIgnoreCase)))
            {
                results.Add(node);
            }
            
            foreach (var child in node.ChildNodes)
            {
                SearchNode(child, query, results);
            }
        }

        public List<ChatTreeNode> SearchByTag(ChatTree chatTree, string tag)
        {
            return chatTree.FindNodes(node => node.Tags.Contains(tag)).ToList();
        }

        public List<ChatTreeNode> SearchByDate(ChatTree chatTree, System.DateTime startDate, System.DateTime endDate)
        {
            return chatTree.FindNodes(node => 
                node.CreatedAt >= startDate && node.CreatedAt <= endDate).ToList();
        }
    }
}
```

- [ ] **Step 4: 修改ChatManagementPanelVM**

```csharp
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using TreeChat.Commands;
using TreeChat.Models;
using TreeChat.Services;

namespace TreeChat.ViewModels
{
    public class ChatManagementPanelVM : BaseViewModel
    {
        private ObservableCollection<ChatTree> _chatList;
        private ChatTree? _selectedChat;
        private readonly IFileService _fileService;
        private readonly ExportService _exportService;
        private readonly BackupService _backupService;
        private readonly SearchService _searchService;

        public ObservableCollection<ChatTree> ChatList
        {
            get => _chatList;
        }

        public ChatTree? SelectedChat
        {
            get => _selectedChat;
            set
            {
                SetProperty(ref _selectedChat, value);
                if (value != null)
                    SelectedChatChanged?.Invoke(value);

                SaveChat.OnCanExecuteChanged();
                RenameChat.OnCanExecuteChanged();
                ExportChat.OnCanExecuteChanged();
                DeleteChat.OnCanExecuteChanged();
            }
        }

        public RelayCommand CreateNewChat { get; }
        public RelayCommand SaveChat { get; }
        public RelayCommand LoadChat { get; }
        public RelayCommand RenameChat { get; }
        public RelayCommand ExportChat { get; }
        public RelayCommand DeleteChat { get; }
        public RelayCommand BackupChat { get; }
        public RelayCommand RestoreBackup { get; }

        public event Action<ChatTree>? SelectedChatChanged;

        public ChatManagementPanelVM()
        {
            _chatList = new ObservableCollection<ChatTree>();
            _fileService = new FileService();
            _exportService = new ExportService();
            _backupService = new BackupService();
            _searchService = new SearchService();

            CreateNewChat = new RelayCommand(ExecuteCreateNewChat);
            SaveChat = new RelayCommand(ExecuteSaveChat, CanExecuteSaveChat);
            LoadChat = new RelayCommand(ExecuteLoadChat);
            RenameChat = new RelayCommand(ExecuteRenameChat, CanExecuteRenameChat);
            ExportChat = new RelayCommand(ExecuteExportChat, CanExecuteExportChat);
            DeleteChat = new RelayCommand(ExecuteDeleteChat, CanExecuteDeleteChat);
            BackupChat = new RelayCommand(ExecuteBackupChat, CanExecuteBackupChat);
            RestoreBackup = new RelayCommand(ExecuteRestoreBackup);
        }

        private void ExecuteCreateNewChat(object? parameter)
        {
            var configDialog = new Views.ConfigDialog();
            if (configDialog.ShowDialog() == true)
            {
                ChatTree newTree = new ChatTree(
                    apiKey: configDialog.ApiKey,
                    apiEndpoint: configDialog.ApiEndpoint,
                    modelName: configDialog.ModelName,
                    temperature: configDialog.Temperature,
                    topP: configDialog.TopP,
                    topK: configDialog.TopK
                );
                ChatList.Add(newTree);
                SelectedChat = newTree;
            }
        }

        private bool CanExecuteSaveChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteSaveChat(object? parameter)
        {
            if (SelectedChat == null) return;

            bool success = _fileService.SaveChatTree(SelectedChat);
            if (success)
            {
                MessageBox.Show("保存成功！", "提示",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void ExecuteLoadChat(object? parameter)
        {
            var loadedTree = _fileService.LoadChatTree();
            if (loadedTree != null)
            {
                ChatList.Add(loadedTree);
                SelectedChat = loadedTree;
            }
        }

        public void LoadChatFromPath(string filePath)
        {
            var loadedTree = _fileService.LoadChatTree(filePath);
            if (loadedTree != null)
            {
                ChatList.Add(loadedTree);
                SelectedChat = loadedTree;
            }
        }

        private bool CanExecuteRenameChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteRenameChat(object? parameter)
        {
            if (SelectedChat == null) return;

            var dialog = new Views.RenameDialog(SelectedChat.TreeTitle);
            if (dialog.ShowDialog() == true)
            {
                string newName = dialog.NewName;
                if (!string.IsNullOrWhiteSpace(newName))
                {
                    SelectedChat.TreeTitle = newName;

                    int index = ChatList.IndexOf(SelectedChat);
                    if (index >= 0)
                    {
                        ChatList[index] = SelectedChat;
                    }
                }
            }
        }

        private bool CanExecuteExportChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteExportChat(object? parameter)
        {
            if (SelectedChat == null) return;

            var saveDialog = new Microsoft.Win32.SaveFileDialog
            {
                Filter = "Markdown文件 (*.md)|*.md|JSON文件 (*.json)|*.json|文本文件 (*.txt)|*.txt",
                Title = "导出对话"
            };

            if (saveDialog.ShowDialog() == true)
            {
                bool success = false;
                
                switch (System.IO.Path.GetExtension(saveDialog.FileName))
                {
                    case ".md":
                        success = _exportService.ExportToMarkdown(SelectedChat, saveDialog.FileName);
                        break;
                    case ".json":
                        success = _exportService.ExportToJson(SelectedChat, saveDialog.FileName);
                        break;
                    case ".txt":
                        success = _exportService.ExportToText(SelectedChat, saveDialog.FileName);
                        break;
                }
                
                if (success)
                {
                    MessageBox.Show("导出成功！", "提示",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show("导出失败！", "错误",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private bool CanExecuteDeleteChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteDeleteChat(object? parameter)
        {
            if (SelectedChat == null) return;

            if (MessageBox.Show("确定要删除此对话吗?", "确认",
                MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                ChatList.Remove(SelectedChat);
                SelectedChat = null;
            }
        }

        private bool CanExecuteBackupChat(object? parameter)
        {
            return SelectedChat != null;
        }

        private void ExecuteBackupChat(object? parameter)
        {
            if (SelectedChat == null) return;

            bool success = _backupService.CreateBackup(SelectedChat);
            if (success)
            {
                _backupService.CleanupOldBackups();
                MessageBox.Show("备份成功！", "提示",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            else
            {
                MessageBox.Show("备份失败！", "错误",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExecuteRestoreBackup(object? parameter)
        {
            var backups = _backupService.GetBackups();
            if (backups.Count == 0)
            {
                MessageBox.Show("没有找到备份文件！", "提示",
                    MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var backupDialog = new Views.BackupRestoreDialog(backups);
            if (backupDialog.ShowDialog() == true && !string.IsNullOrEmpty(backupDialog.SelectedBackup))
            {
                var restoredTree = _backupService.RestoreFromBackup(backupDialog.SelectedBackup);
                if (restoredTree != null)
                {
                    ChatList.Add(rest