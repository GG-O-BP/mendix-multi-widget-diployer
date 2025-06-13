# Mendix Multi Widget Deployer
Mendix Multi Widget Deployment Tool - A desktop application that allows you to build multiple Mendix widgets and deploy them to multiple apps simultaneously.

A Tauri-based desktop application designed to help Mendix developers efficiently manage and deploy multiple widgets.

## View in Other Languages
[**English**](./README.en.md), [한국어](./README.md), [日本語](./README.jp.md)

# Key Features
- ✅ Build multiple Mendix widgets simultaneously
- ✅ Automatic deployment to multiple Mendix apps
- ✅ Automatic .mpk file deployment
- ✅ Widget and app path management
- ✅ Intuitive GUI interface
- ✅ Real-time build status monitoring
- ✅ Korean text encoding support (EUC-KR, CP949)
- ✅ PowerShell-based build execution
- ✅ Selective widget build support
- ✅ Drag and drop to reorder widgets/apps
- ✅ Smooth animated UI

# Running the Release (General Users)
You can download and install the executable from the [latest release](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest).

## System Requirements
- Windows 10 or higher (PowerShell 5.1 or higher)
- Node.js 16 or higher
- pnpm package manager
- Mendix widget development environment

## Installation
1. Download the latest version from the [releases page](https://github.com/your-username/mendix-multi-widget-deployer/releases/latest)
2. Run the `.msi` file to install
3. Launch the program and configure widget paths

# Building from Source Code (Developers)

## Development Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-username/mendix-multi-widget-deployer.git
cd mendix-multi-widget-deployer

# Install dependencies
pnpm install

# Install Tauri CLI (globally)
cargo install tauri-cli --version "^2.0"
```

## Running in Development Mode
```bash
# Start development server
pnpm tauri dev
```

## Production Build
```bash
# Build for production
pnpm tauri build
```

# Usage

## 1. Widget Management
- **Add Widget**: Add new widgets using the "Add Widget" button
- **Edit Widget**: Modify names or paths of existing widgets
- **Delete Widget**: Remove unnecessary widgets
- **Select Widget**: Select/deselect widgets to build
- **Reorder**: Adjust widget order using ↑↓ buttons

## 2. App Management
- **Add App**: Add target Mendix apps using the "Add App" button
- **Edit App**: Modify names or paths of existing apps
- **Delete App**: Remove unnecessary apps
- **Select App**: Select/deselect target apps for deployment
- **Reorder**: Adjust app order using ↑↓ buttons

## 3. Build and Deploy
- Click "Build & Deploy Widgets" button for selected widgets
- Execute `pnpm run build` command for each widget
- Automatically copy generated .mpk files to widgets folder of all selected apps

# Technology Stack
- **Frontend**: React 18, Vite
- **Backend**: Rust (Tauri 2.0)
- **UI Framework**: CSS3 (custom styles)
- **Build System**: pnpm, Cargo
- **Shell Integration**: PowerShell (Windows)

# Project Structure
```
mendix-multi-widget-deployer/
├── src/                    # React frontend
│   ├── components/        # Reusable UI components
│   │   ├── AppList.jsx           # App list container component
│   │   ├── BuildSection.jsx      # Build button section component
│   │   ├── ConfirmationModal.jsx # General confirmation modal dialog
│   │   ├── ErrorScreen.jsx       # Error state screen component
│   │   ├── Header.jsx            # Application header component
│   │   ├── LoadingScreen.jsx     # Loading state screen component
│   │   ├── StatusSection.jsx     # Build status message display section
│   │   ├── WidgetForm.jsx        # Widget/App add/edit form (reusable)
│   │   ├── WidgetItem.jsx        # Individual widget/app item (reusable)
│   │   └── WidgetList.jsx        # Widget list container component
│   ├── hooks/            # Custom React hooks
│   │   ├── useAppManagement.js      # App CRUD operations and state management
│   │   ├── useBuildOperations.js    # Build process execution and state
│   │   ├── useForm.js               # Form state management (generic)
│   │   ├── useListAnimation.js      # List item move animation
│   │   ├── useModal.js              # Modal open/close state management
│   │   ├── useSettings.js           # Settings file load/save management
│   │   └── useWidgetManagement.js   # Widget CRUD operations and state management
│   ├── utils/            # Utility functions
│   │   ├── effects.js    # Side effect handlers
│   │   ├── fp.js         # Functional programming utilities
│   │   └── widgetLogic.js # Business logic
│   ├── App.jsx           # Main application (123 lines)
│   ├── App.css           # Stylesheet
│   └── main.jsx          # React entry point
├── src-tauri/            # Tauri backend
│   ├── src/
│   │   ├── lib.rs        # Main Rust logic
│   │   └── main.rs       # Tauri entry point
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── public/               # Static files
├── dist/                 # Build output
└── package.json          # Node.js dependencies
```

# Feature Implementation Status
- [x] Widget list management (add, edit, delete, reorder)
- [x] App list management (add, edit, delete, reorder)
- [x] Selective widget building
- [x] Multi-app simultaneous deployment
- [x] Automatic .mpk file deployment
- [x] Configuration save and load
- [x] Build status monitoring
- [x] Korean encoding support
- [x] PowerShell-based build execution
- [x] Error handling and user feedback
- [x] Smooth animated UI
- [x] Functional programming architecture
- [ ] Detailed build log viewer
- [ ] Widget template support
- [ ] Batch job scheduling
- [ ] Japanese encoding support

# Troubleshooting

## Common Issues
1. **Build Failure**: Verify that Node.js and pnpm are properly installed
2. **Path Error**: Ensure widget and app paths are correct
3. **Permission Issues**: Check PowerShell execution policy (`Get-ExecutionPolicy`)
4. **Encoding Issues**: Automatically handled in Korean Windows environment

## Log Verification
Application logs are stored in the following location:
- Windows: `%APPDATA%\com.sbt-global.mendix-multi-widget-diployer\`

# Contributing

## Development Guidelines
- Follow functional programming principles
- Write components as pure functions
- Handle side effects only in custom hooks
- Prepare for TypeScript migration

## How to Contribute
1. Register an issue or check existing issues
2. Create a development branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

# License
This program follows the [Mozilla Public License 2.0](/LICENSE).

Copyright © 2025 SBT Global. All rights reserved.

---

**Mendix Multi Widget Deployer** was developed to improve productivity for Mendix developers.
Please register questions or bug reports in [Issues](https://github.com/your-username/mendix-multi-widget-deployer/issues).