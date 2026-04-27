using System.Collections.Generic;

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
