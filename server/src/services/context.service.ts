class ContextService {
  // 提取关键信息
  extractKeyInfo(text: string): string {
    // 简单的关键词提取逻辑
    // 实际应用中可以使用更复杂的NLP技术
    const sentences = text.split('. ');
    const keySentences = sentences.filter(sentence => {
      const keywords = ['important', 'key', 'critical', 'main', 'essential'];
      return keywords.some(keyword => sentence.toLowerCase().includes(keyword));
    });

    if (keySentences.length > 0) {
      return keySentences.join('. ');
    }

    // 如果没有关键词，返回前几个句子
    return sentences.slice(0, 3).join('. ');
  }

  // 压缩上下文
  compressContext(messages: any[], maxTokens: number = 1000): any[] {
    let totalTokens = 0;
    const compressedMessages = [];

    // 从最新的消息开始，向前添加
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const messageTokens = this.countTokens(message.content);

      if (totalTokens + messageTokens <= maxTokens) {
        compressedMessages.unshift(message);
        totalTokens += messageTokens;
      } else {
        // 如果添加当前消息会超过限制，尝试提取关键信息
        const keyInfo = this.extractKeyInfo(message.content);
        const keyInfoTokens = this.countTokens(keyInfo);

        if (totalTokens + keyInfoTokens <= maxTokens) {
          compressedMessages.unshift({
            ...message,
            content: keyInfo,
            metadata: {
              ...message.metadata,
              compressed: true
            }
          });
          totalTokens += keyInfoTokens;
        }
        break;
      }
    }

    return compressedMessages;
  }

  // 计算 tokens 数量（简单估算）
  countTokens(text: string): number {
    // 简单估算：每个单词约1.3个token
    const words = text.split(/\s+/);
    return Math.ceil(words.length * 1.3);
  }

  // 构建AI对话上下文
  buildAIContent(messages: any[]): string {
    return messages.map(message => {
      const role = message.sender === 'user' ? 'User' : 'Assistant';
      return `${role}: ${message.content}`;
    }).join('\n\n');
  }

  // 优化上下文
  optimizeContext(messages: any[], maxTokens: number = 1000): { optimizedContext: any[], tokenCount: number } {
    const compressedMessages = this.compressContext(messages, maxTokens);
    const tokenCount = compressedMessages.reduce((total, message) => {
      return total + this.countTokens(message.content);
    }, 0);

    return { optimizedContext: compressedMessages, tokenCount };
  }
}

export default new ContextService();