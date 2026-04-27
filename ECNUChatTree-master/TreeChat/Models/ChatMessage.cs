using System;

namespace TreeChat.Models
{
    /// <summary>
    /// 聊天消息单元(包含角色和一条消息)
    /// </summary>
    public class ChatMessage
    {
        /// <summary>
        /// 消息角色
        /// </summary>
        public string Role { get; }

        /// <summary>
        /// 信息内容
        /// </summary>
        public string Content { get; }
        
        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; }
        
        /// <summary>
        /// 消息ID
        /// </summary>
        public string MessageId { get; }

        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="role"></param>
        /// <param name="content"></param>
        public ChatMessage(string role, string content)
        {
            Role = role;
            Content = content;
            Timestamp = DateTime.Now;
            MessageId = Guid.NewGuid().ToString();
        }
    }
}
