using System.Windows;
using TreeChat.Services;
using TreeChat.Models;

namespace TreeChat.Views
{
    /// <summary>
    /// ConfigDialog.xaml 的交互逻辑
    /// </summary>
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