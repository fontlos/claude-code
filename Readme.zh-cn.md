# Claude Code

<p align="right"><a href="./Readme.md">English</a> | <strong>中文</strong></p>

基于 [NanmiCoder/claude-code-haha](https://github.com/NanmiCoder/claude-code-haha) 修复的**本地可运行版本**, 支持接入任意 Anthropic 兼容 API

## 功能

- 完整的 Ink TUI 交互界面
- `--print` 无头模式（脚本/CI 场景）
- 支持 MCP 服务器, 插件, Skills
- 支持自定义 API 端点和模型, 移除登录验证
- 降级 Recovery CLI 模式

---

## 快速开始

### 1. 安装 [Bun](https://bun.sh)

```bash
# MacOS / Linux
curl -fsSL https://bun.sh/install | bash
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

bun --version
```

### 2. 克隆项目并安装项目依赖

```bash
git clone https://github.com/fontlos/claude-code.git
cd claude-code
bun install
```

### 3. 配置环境变量

复制示例文件并编辑

```bash
cp .env.example .env
```

```env
# API 认证（二选一）
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_AUTH_TOKEN=sk-xxx

# API 端点 (可选, 默认为 Anthropic)
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic

# 模型配置
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_SONNET_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_HAIKU_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_OPUS_MODEL=MiniMax-M2.7-highspeed

# 超时（毫秒）
API_TIMEOUT_MS=3000000

# 禁用遥测和非必要网络请求
DISABLE_TELEMETRY=1
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

可接入其他模型, 附上一个 DeepSeek 可用示例

```env
ANTHROPIC_API_KEY=sk-xxx
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-chat
ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-chat
ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-chat
ANTHROPIC_MODEL=deepseek-chat
API_TIMEOUT_MS=3000000
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
DISABLE_TELEMETRY=1
```

### 4. 运行

> Windows 环境需要 Bash 运行命令, 因此需要安装 [Git for Windows](https://git-scm.com/download/win) 或其他 Bash
> 部分功能 (语音输入, Computer Use, Sandbox 隔离等) 在 Windows 上不可用, 不影响核心 TUI 交互

```bash
# 基本使用
# MacOS / Linux
./bin/claude
# Windows
./bin/claude.bat

# 其他命令

# 交互 TUI 模式 (完整界面)
./bin/claude
# 无头模式 (单次问答)
./bin/claude -p "your prompt here"
# 管道输入
echo "explain this code" | ./bin/claude -p
# 查看所有选项
./bin/claude --help
```

### 5. 全局安装 (推荐)

```bash
bun link

# 配置环境变量
# (创建 ~/.claude/.env (MacOS / Linux) 或 %USERPROFILE%\.claude\.env (Windows))
# 内容参考 .env.example

# 验证安装
claude --help
```

After global installation, use `claude` command in any directory

## 泄露源码的修复

泄露的源码无法直接运行，主要修复了以下问题：

| 问题 | 根因 | 修复 |
|------|------|------|
| TUI 不启动 | 入口脚本把无参数启动路由到了 recovery CLI | 恢复走 `cli.tsx` 完整入口 |
| 启动卡死 | `verify` skill 导入缺失的 `.md` 文件，Bun text loader 无限挂起 | 创建 stub `.md` 文件 |
| `--print` 卡死 | `filePersistence/types.ts` 缺失 | 创建类型桩文件 |
| `--print` 卡死 | `ultraplan/prompt.txt` 缺失 | 创建资源桩文件 |
| Enter 键无响应 | `modifiers-napi` native 包缺失, `isModifierPressed()` 抛异常导致 `handleEnter` 中断，`onSubmit` 永远不执行 | 加 try-catch 容错 |
| setup 被跳过 | `preload.ts` 自动设置 `LOCAL_RECOVERY=1` 跳过全部初始化 | 移除默认设置 |

---

## 项目结构

```
bin/claude                 # 入口脚本
preload.ts                 # Bun preload (设置 MACRO 全局变量)
.env.example               # 环境变量模板
src/
├── entrypoints/cli.tsx  # CLI 主入口
├── main.tsx             # TUI 主逻辑 (Commander.js + React/Ink)
├── localRecoveryCli.ts  # 降级 Recovery CLI
├── setup.ts             # 启动初始化
├── screens/REPL.tsx     # 交互 REPL 界面
├── ink/                 # Ink 终端渲染引擎
├── components/          # UI 组件
├── tools/               # Agent 工具 (Bash, Edit, Grep 等)
├── commands/            # 斜杠命令 (/commit, /review 等)
├── skills/              # Skill 系统
├── services/            # 服务层 (API, MCP, OAuth 等)
├── hooks/               # React hooks
└── utils/               # 工具函数
```

---

## Disclaimer

本仓库基于 2026-03-31 从 Anthropic npm registry 泄露的 Claude Code 源码. 所有原始源码版权归 [Anthropic](https://www.anthropic.com) 所有. 仅供学习和研究用途.
