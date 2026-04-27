# ECNUChatTree 增强设计规范

## 1. 项目背景

ECNUChatTree 是一个基于树形结构的聊天工具，旨在解决传统线性聊天中难以分支探索和上下文冗余的问题。现有的实现已经具备基本的树状聊天功能，但需要进一步增强以提供更丰富的功能和更好的用户体验。

## 2. 设计目标

- **功能丰富**：添加高级API配置、用户界面优化、数据管理增强、高级树操作等功能
- **多模型支持**：支持多种AI模型和API提供商
- **高性能**：优化大型对话树的性能，实现异步加载和虚拟渲染
- **美观大气**：提升用户界面的视觉效果和交互体验
- **扩展性**：为未来可能的VSCode插件开发做准备

## 3. 核心功能增强

### 3.1 高级API配置管理

#### 3.1.1 多模型支持
- 支持OpenAI、Azure OpenAI、Anthropic、ECNU等多种API提供商
- 每种模型类型具有特定的配置选项
- 支持自定义模型端点

#### 3.1.2 配置预设管理
- 保存和加载多个配置预设
- 为不同场景创建专用配置
- 配置预设的导入/导出

#### 3.1.3 安全存储
- API密钥加密存储
- 配置文件权限保护
- 敏感信息隐藏显示

### 3.2 用户界面优化

#### 3.2.1 主题系统
- 浅色/深色主题切换
- 自定义主题支持
- 系统主题自动跟随

#### 3.2.2 布局增强
- 可调整的面板大小
- 可拖拽的面板布局
- 全屏模式

#### 3.2.3 交互优化
- 键盘快捷键支持
- 右键菜单增强
- 拖拽操作支持
- 动画效果

### 3.3 数据管理增强

#### 3.3.1 导入/导出
- 导出为Markdown、JSON、纯文本等格式
- 导入历史对话
- 批量操作支持

#### 3.3.2 备份与恢复
- 自动备份功能
- 备份文件管理
- 恢复到特定版本

#### 3.3.3 搜索功能
- 全文搜索对话内容
- 按日期、标签等筛选
- 搜索结果高亮

### 3.4 高级树操作

#### 3.4.1 节点操作
- 节点拖拽重排
- 分支复制和移动
- 节点合并功能
- 批量删除和编辑

#### 3.4.2 树可视化增强
- 多种布局算法（层次、径向、力导向等）
- 节点大小和样式自定义
- 缩放和平移操作
- 展开/折叠功能

### 3.5 性能优化

#### 3.5.1 大型树支持
- 虚拟渲染技术
- 异步树加载
- 树节点缓存

#### 3.5.2 响应式设计
- 后台线程处理
- 进度指示
- 取消操作支持

## 4. 系统架构设计

### 4.1 整体架构

保持现有的MVVM架构，但进行以下增强：

```
┌─────────────────────────────────────────────────────────────┐
│                         View层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ChatManage-  │  │ TreeVisu-    │  │ ChatInformation  │  │
│  │ mentPanel    │  │ alization    │  │ View             │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  ConfigView      │  │      ThemeManager            │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       ViewModel层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ChatManage-  │  │ TreeVisu-    │  │ ChatInformation  │  │
│  │ mentPanelVM  │  │ alizationVM  │  │ VM               │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  MainWindowVM                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  ConfigVM        │  │      ThemeManagerVM          │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Model层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  ChatTree    │  │ChatTreeNode  │  │   ChatMessage    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  ApiConfigModel  │  │      ThemeConfig            │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Service层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  FileService │  │OpenAIChat    │  │TreeLayoutService │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │JsonSerialization  │  │         ApiConfig            │    │
│  │Service            │  │                              │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │  ThemeService     │  │     PerformanceService       │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 核心组件设计

#### 4.2.1 API配置系统

```csharp
public class ApiConfigService
{
    // 配置预设管理
    public List<ApiConfigPreset> Presets { get; }
    
    // 当前配置
    public ApiConfig CurrentConfig { get; set; }
    
    // 加密存储
    public void SaveConfigSecurely();
    public void LoadConfigSecurely();
    
    // 模型类型管理
    public List<ModelProvider> GetSupportedProviders();
    public ApiConfig CreateConfigForProvider(ModelProvider provider);
}

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
    // 其他提供商特定配置
}
```

#### 4.2.2 主题系统

```csharp
public class ThemeService
{
    public List<Theme> AvailableThemes { get; }
    public Theme CurrentTheme { get; set; }
    
    public void ApplyTheme(Theme theme);
    public void SaveThemePreferences();
    public void LoadThemePreferences();
}

public class Theme
{
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public bool IsDark { get; set; }
    public Dictionary<string, string> Colors { get; set; }
    public Dictionary<string, string> Fonts { get; set; }
}
```

#### 4.2.3 性能优化服务

```csharp
public class PerformanceService
{
    // 虚拟渲染
    public bool EnableVirtualRendering { get; set; }
    
    // 缓存管理
    public void ClearCache();
    public void OptimizeMemory();
    
    // 异步操作
    public Task<T> RunAsync<T>(Func<T> function);
    
    // 性能监控
    public PerformanceMetrics GetMetrics();
}
```

### 4.3 数据模型增强

#### 4.3.1 ChatTree 增强

```csharp
public class ChatTree : INotifyPropertyChanged
{
    // 现有属性...
    
    // 新增属性
    public DateTime CreatedAt { get; }
    public DateTime LastModifiedAt { get; set; }
    public List<string> Tags { get; set; }
    public int NodeCount { get; }
    
    // 新增方法
    public void Merge(ChatTree otherTree);
    public ChatTree Clone();
    public void PruneEmptyBranches();
    public IEnumerable<ChatTreeNode> FindNodes(Func<ChatTreeNode, bool> predicate);
}
```

#### 4.3.2 ChatTreeNode 增强

```csharp
public class ChatTreeNode
{
    // 现有属性...
    
    // 新增属性
    public DateTime CreatedAt { get; }
    public DateTime LastModifiedAt { get; set; }
    public List<string> Tags { get; set; }
    public bool IsExpanded { get; set; }
    
    // 新增方法
    public ChatTreeNode Clone(ChatTreeNode? newParent = null);
    public void MoveTo(ChatTreeNode newParent);
    public void Delete(bool recursive = true);
    public int GetDepth();
    public int GetSubtreeSize();
}
```

## 5. 界面设计

### 5.1 主窗口布局

```
┌───────────────────────────────────────────────────────────────────┐
│ [菜单栏] File Edit View Settings Help                            │
│ [工具栏] New Load Save Export Theme Search                      │
├──────────────┬──────────────────────────────────┬──────────────────┤
│              │                                  │                  │
│  对话管理    │         树可视化区域              │   对话信息区     │
│   面板       │                                  │                  │
│              │                                  │                  │
│ - 对话1      │   ● Node 1                       │ ┌─────────────┐ │
│ - 对话2 *    │    │                             │ │ 用户消息    │ │
│ - 对话3      │    ● Node 2                      │ └─────────────┘ │
│              │   ╱│╲                            │ ┌─────────────┐ │
│ [新建]       │  ● ● ●                          │ │ AI回复      │ │
│ [加载]       │       ● Node 3                  │ └─────────────┘ │
│ [保存]       │                                  │                  │
│              │                                  │ ┌─────────────┐ │
│              │                                  │ │ 输入框      │ │
│              │                                  │ [发送]        │ │
│              │                                  └─────────────┘ │
└──────────────┴──────────────────────────────────┴──────────────────┘
```

### 5.2 配置对话框

增强的配置对话框应包含：
- 模型提供商选择
- API密钥安全输入
- 高级参数配置
- 配置预设管理
- 测试连接功能

### 5.3 主题选择器

- 内置主题预览
- 自定义主题创建
- 主题导入/导出
- 实时主题预览

## 6. 实现路径

### 6.1 阶段一：核心功能增强

1. **API配置系统**
   - 实现多模型支持
   - 配置预设管理
   - 安全存储

2. **数据模型增强**
   - 添加元数据字段
   - 实现高级树操作
   - 优化性能

3. **界面优化**
   - 主题系统
   - 布局增强
   - 交互优化

### 6.2 阶段二：高级功能

1. **数据管理**
   - 导入/导出功能
   - 备份与恢复
   - 搜索功能

2. **性能优化**
   - 虚拟渲染
   - 异步加载
   - 缓存优化

3. **扩展性**
   - 模块化设计
   - 插件系统准备
   - API设计

### 6.3 阶段三：完善与测试

1. **功能测试**
   - 单元测试
   - 集成测试
   - 性能测试

2. **用户体验优化**
   - 界面美化
   - 交互流畅度
   - 错误处理

3. **文档与部署**
   - 用户文档
   - 开发文档
   - 部署指南

## 7. 技术栈与依赖

### 7.1 现有依赖
- .NET 8.0
- WPF
- Newtonsoft.Json

### 7.2 新增依赖
- **加密库**：用于API密钥加密
- **主题库**：用于主题管理
- **性能库**：用于虚拟渲染和异步操作
- **测试库**：用于单元测试

### 7.3 技术选择
- **MVVM框架**：保持现有实现
- **DI容器**：可选添加，用于更好的依赖管理
- **异步编程**：使用async/await模式
- **响应式UI**：使用INotifyPropertyChanged

## 8. 风险与应对

### 8.1 风险分析

1. **性能风险**：大型对话树可能导致性能问题
2. **安全风险**：API密钥存储安全
3. **兼容性风险**：不同API提供商的兼容性
4. **复杂度风险**：功能增加导致代码复杂度增加

### 8.2 应对策略

1. **性能优化**：实现虚拟渲染和异步加载
2. **安全措施**：使用加密存储和权限保护
3. **抽象设计**：使用适配器模式处理不同API
4. **模块化**：保持代码模块化，避免紧耦合

## 9. 结论

本设计规范为ECNUChatTree提供了全面的功能增强方案，包括高级API配置、用户界面优化、数据管理增强和性能优化。通过保持现有的MVVM架构并进行有针对性的增强，可以在不破坏现有功能的情况下，为用户提供更丰富、更高效、更美观的树状聊天体验。

该设计还为未来的VSCode插件开发奠定了基础，通过模块化设计和良好的API抽象，使得核心功能可以更容易地移植到其他平台。