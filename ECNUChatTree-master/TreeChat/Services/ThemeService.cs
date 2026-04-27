using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using System.Windows;
using System.Windows.Media;
using TreeChat.Models;

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
