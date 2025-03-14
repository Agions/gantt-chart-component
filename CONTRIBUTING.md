# 贡献指南

感谢您对甘特图组件的关注和支持！我们非常欢迎社区成员参与项目的开发和改进。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提出新功能](#提出新功能)
  - [改进文档](#改进文档)
  - [提交代码](#提交代码)
- [开发流程](#开发流程)
  - [环境设置](#环境设置)
  - [代码规范](#代码规范)
  - [提交规范](#提交规范)
  - [测试](#测试)
- [版本发布流程](#版本发布流程)
- [沟通与讨论](#沟通与讨论)

## 行为准则

我们希望所有参与者都能遵循以下准则：

- 尊重所有项目贡献者和用户
- 保持专业和建设性的交流
- 专注于项目改进和用户体验
- 欢迎不同观点和解决方案
- 避免人身攻击和无意义的讨论

## 如何贡献

### 报告 Bug

如果您发现了 Bug，请按照以下步骤提交问题：

1. 确认该 Bug 尚未在 [Issues](https://github.com/Agions/gantt-chart-component/issues) 中报告
2. 使用 Bug 报告模板创建新 Issue
3. 详细描述如何复现该问题
4. 提供环境信息（浏览器版本、操作系统等）
5. 如果可能，附上截图或最小复现示例

### 提出新功能

对于新功能建议：

1. 使用功能请求模板创建新 Issue
2. 清晰描述该功能解决的问题和潜在实现方法
3. 如果可能，提供使用示例或 UI 设计草图

### 改进文档

文档改进是非常有价值的贡献：

1. 修正文档中的错别字或语法错误
2. 添加缺失的文档说明或示例
3. 改进文档结构和可读性
4. 添加多语言支持

### 提交代码

如果您想提交代码，请按照以下流程：

1. Fork 项目仓库
2. 创建功能分支（`feature/your-feature-name`）或修复分支（`fix/issue-number`）
3. 开发您的功能或修复
4. 确保通过所有测试
5. 提交 Pull Request 并链接相关 Issue
6. 等待代码审查和合并

## 开发流程

### 环境设置

```bash
# 克隆仓库
git clone https://github.com/Agions/gantt-chart-component.git
cd gantt-chart-component

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

### 代码规范

- 遵循项目中的 TypeScript 和 ESLint 规则
- 保持代码简洁清晰，避免不必要的复杂度
- 为复杂逻辑添加注释
- 保持一致的代码风格
- 组件和函数应该是纯粹的，避免副作用

### 提交规范

提交消息应遵循以下格式：

```
<类型>: <简短描述>

<详细描述>

<关闭的问题>
```

类型包括：

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档变更
- `style`: 格式变更（不影响代码功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变更

示例：

```
feat: 添加任务拖拽时的吸附功能

实现了任务拖拽时自动吸附到网格线或其他任务的功能，提高了用户体验。

Closes #123
```

### 测试

- 为新功能和 Bug 修复添加测试用例
- 确保所有测试通过
- 测试应覆盖正常和边界情况
- 组件测试应关注功能而非实现细节

## 版本发布流程

我们使用语义化版本控制：

- 主版本号（x.0.0）：不兼容的 API 变更
- 次版本号（0.x.0）：向后兼容的功能性新增
- 修订号（0.0.x）：向后兼容的问题修正

每个版本发布都会更新 [CHANGELOG.md](./CHANGELOG.md)。

## 沟通与讨论

- 使用 GitHub Issues 提交 Bug 和功能请求
- 重大设计决策在 GitHub Discussions 中讨论
- 技术讨论可在相关 Pull Request 下进行

---

再次感谢您的贡献！我们期待与您一起让这个项目变得更好。
