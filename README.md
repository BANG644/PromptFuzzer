# PromptFuzzer

<div align="center">

![PromptFuzzer](https://img.shields.io/badge/PromptFuzzer-v2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-61DAFB?logo=react)

**🛡️ AI Security Testing Platform with Multi-Provider API Support**

[Live Demo](https://pinme.eth.limo/#/preview/U2FsdGVkX19YhJ61xuFoRJclyp20yyKM4HXRqoBiltfSbubWnD6A-Hm_WzCSSyerp6vAmvMPZp9nJMNcJGuIzESryoB4HQBfN9nt) | [Documentation](#features) | [Quick Start](#quick-start) | [Report Issue](https://github.com/BANG644/PromptFuzzer/issues)

</div>

## 📖 Overview

**PromptFuzzer** is a comprehensive security testing platform designed to identify vulnerabilities in Large Language Models (LLMs). It supports múltiple AI providers and implements various attack vectors to test prompt injection, jailbreaking, information leakage, and other security risks.

### ✨ Key Features

- 🌐 **Multi-Provider Support** - Seamlessly switch between Gemini, OpenAI, Anthropic, Azure, Alibaba Cloud, DeepSeek, and custom APIs
- 🔍 **Comprehensive Attack Vectors** - Test for injection, leakage, jailbreak, obfuscation, and multi-turn attacks
- 🤖 **AI-Powered Mutation** - Automatically generate attack variations to bypass simple filters
- 🛡️ **Defense Testing** - Evaluate different defense strategies (system prompts, XML tagging, sandwich defense)
-  **Real-time Monitoring** - Live dashboard with progress tracking and detailed logging
- 📊 **Detailed Reporting** - Export comprehensive security assessment reports
- 🎨 **Modern UI** - Professional, dark-mode-ready interface with smooth animations

## 🚀 Quick Start

### Option 1: Use Deployed Version (Recommended)

Visit the live deployment: **[https://pinme.eth.limo/#/preview/U2FsdGVkX19YhJ61xuFoRJclyp20yyKM4HXRqoBiltfSbubWnD6A-Hm_WzCSSyerp6vAmvMPZp9nJMNcJGuIzESryoB4HQBfN9nt](https://pinme.eth.limo/#/preview/U2FsdGVkX19YhJ61xuFoRJclyp20yyKM4HXRqoBiltfSbubWnD6A-Hm_WzCSSyerp6vAmvMPZp9nJMNcJGuIzESryoB4HQBfN9nt)**

1. Navigate to the **Configuration** tab
2. Expand the **API Configuration** panel
3. Select your preferred AI provider
4. Enter your API key
5. Click **Test Connection** to verify
6. Start security testing!

### Option 2: Run Locally

#### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm or yarn package manager
- API key from your chosen provider

#### Installation

```bash
# Clone the repository
git clone https://github.com/BANG644/PromptFuzzer.git
cd PromptFuzzer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

#### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🔧 Technology Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### API Integration
- **@google/genai** - Google Gemini SDK
- **Fetch API** - HTTP client for other providers
- **Custom Adapters** - Unified interface for all AI providers

### State Management
- **React Hooks** - useState, useEffect for local state
- **LocalStorage** - API key persistence (client-side only)

### Testing & Security
- **Attack Templates** - Pre-defined security test cases
- **AI-Powered Mutation** - Dynamic attack generation
- **Defense Evaluation** - Multi-strategy protection testing

## 📋 Supported AI Providers

| Provider | Models | Latest Update |
|----------|--------|---------------|
| **Google Gemini** | gemini-2.0-flash-exp, gemini-2.0-flash-thinking-exp, gemini-1.5-pro | Dec 2024 |
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4o-realtime-preview, gpt-4-turbo | Dec 2024 |
| **Anthropic** | claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022 | Oct 2024 |
| **Azure OpenAI** | gpt-4o, gpt-4, gpt-35-turbo | - |
| **Alibaba Cloud** | qwen-max, qwen2.5-72b-instruct, qwen-plus | Dec 2024 |
| **DeepSeek** | deepseek-chat, deepseek-coder, deepseek-reasoner | Dec 2024 |
| **Custom API** | Any OpenAI-compatible endpoint | - |

## ⚡ Features

### Attack Types

1. **Prompt Injection** - Attempts to override system instructions
2. **Information Leakage** - Tries to extract system prompts or internal configurations
3. **Jailbreaking** - Tests DAN mode and developer mode bypasses
4. **Obfuscation** - Uses encoding (Base64) to hide malicious instructions
5. **Multi-turn Attacks** - Builds trust over multiple conversation rounds
6. **Manual Testing** - Interactive chat interface with risk assessment

### Defense Strategies

- **None** - Baseline testing without defenses
- **System Prompt Hardening** - Enhanced security instructions
- **XML Tagging** - Treats user input as data, not instructions
- **Sandwich Defense** - Pre and post-instruction reinforcement

### Reporting & Analytics

- Real-time dashboard with vulnerability statistics
- Color-coded risk levels (Critical, High, Medium, Low, Safe)
- Detailed evidence and remediation recommendations
- Export capabilities for security audits
- Conversation history tracking

## 🔐 Privacy & Security

> **IMPORTANT**: Your API keys are stored **locally in your browser only** and are never sent to any third-party servers. All API calls are made directly to your chosen AI provider.

- ✅ Local-only storage (browser localStorage)
- ✅ No server-side data collection
- ✅ Direct API calls to providers
- ✅ Full user control over credentials
- ✅ Open-source and transparent

## 📚 Usage Guide

### 1. Configure API

1. Open the application
2. Navigate to **Configuration** tab
3. Click to expand **API Configuration**
4. Select your provider from the grid
5. Enter your API key (get it from provider's website)
6. Choose a model from the dropdown
7. Click **Test Connection** to verify

### 2. Set Up Target System

1. Define your **Target System Prompt** (or use the demo)
2. Select a **Defense Strategy** to test
3. Choose **Attack Types** to include in the scan

### 3. Run Security Audit

1. Click **Start Audit** to begin automated testing
2. Monitor progress in the **Live Dashboard**
3. View real-time logs and results
4. Review detailed findings in the **Report** tab

### 4. Manual Testing

1. Go to **Manual Test** tab
2. Have interactive conversations with the AI
3. Each response is automatically risk-assessed
4. Save session reports for review

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React and TypeScript
- Icons by [Lucide](https://lucide.dev)
- Inspired by AI security research community
- Special thanks to all contributors

## 📮 Contact

**Project Link**: [https://github.com/BANG644/PromptFuzzer](https://github.com/BANG644/PromptFuzzer)

**Issues**: [https://github.com/BANG644/PromptFuzzer/issues](https://github.com/BANG644/PromptFuzzer/issues)

---

<div align="center">

**Made with 🛡️ for AI Security**

© 2025 PromptFuzzer | [GitHub](https://github.com/BANG644/PromptFuzzer)

</div>
