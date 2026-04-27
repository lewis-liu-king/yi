using System;
using System.Collections.Generic;

namespace TreeChat.Models
{
    /// <summary>
    /// 聊天树节点，包含用户消息、AI回复、父节点和子节点等信息
    /// </summary>
    public class ChatTreeNode
    {
        public ChatTreeNode? ParentNode { get; private set; }
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

        /// <summary>
        /// 用于创建新节点的构造函数，自动分配 NodeID
        /// </summary>
        public ChatTreeNode(ChatTreeNode? parentNode, ChatMessage userMessage)
        {
            ParentNode = parentNode;
            UserMessage = userMessage;
            NodeID = _nextNodeID++;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
        }

        /// <summary>
        /// 用于从文件加载节点的构造函数，使用指定的 NodeID（不递增 _nextNodeID）
        /// </summary>
        public ChatTreeNode(ChatTreeNode? parentNode, ChatMessage userMessage, int nodeId)
        {
            ParentNode = parentNode;
            UserMessage = userMessage;
            NodeID = nodeId;
            CreatedAt = DateTime.Now;
            LastModifiedAt = DateTime.Now;
        }

        /// <summary>
        /// 重置 _nextNodeID 到指定值（用于从文件加载后）
        /// </summary>
        public static void ResetNextNodeId(int value)
        {
            _nextNodeID = value;
        }

        /// <summary>
        /// 获取当前的 nextNodeID
        /// </summary>
        public static int GetCurrentNextNodeId()
        {
            return _nextNodeID;
        }

        /// <summary>
        /// 得到完整上下文，包括从根节点到当前节点的所有用户消息和AI回复，按照时间顺序排列
        /// </summary>
        /// <returns></returns>
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

        /// <summary>
        /// 添加一个新的子节点，包含用户消息，并返回新创建的子节点
        /// </summary>
        /// <param name="userMessage"></param>
        /// <returns></returns>
        public ChatTreeNode AddChildNode(ChatMessage userMessage)
        {
            var childNode = new ChatTreeNode(this, userMessage);
            ChildNodes.Add(childNode);
            LastModifiedAt = DateTime.Now;
            return childNode;
        }

        /// <summary>
        /// 设置AI回复消息
        /// </summary>
        /// <param name="replyMessage"></param>
        public void SetAiReply(ChatMessage replyMessage)
        {
            ReplyMessage = replyMessage;
            LastModifiedAt = DateTime.Now;
        }

        /// <summary>
        /// 克隆节点
        /// </summary>
        /// <param name="newParent">新的父节点</param>
        /// <returns>克隆的节点</returns>
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

        /// <summary>
        /// 移动节点到新的父节点
        /// </summary>
        /// <param name="newParent">新的父节点</param>
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

        /// <summary>
        /// 删除节点
        /// </summary>
        /// <param name="recursive">是否递归删除子节点</param>
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

        /// <summary>
        /// 获取节点深度
        /// </summary>
        /// <returns>节点深度</returns>
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

        /// <summary>
        /// 获取子树大小
        /// </summary>
        /// <returns>子树大小</returns>
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