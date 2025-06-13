# Mendix Multi Widget Deployer
Mendix Multi Widget Deployment Tool - A desktop application that allows you to build and deploy multiple Mendix widgets at once.

A Tauri-based desktop application designed to help Mendix developers efficiently manage and deploy multiple widgets.

## View in Other Languages
[**English**](./README.en.md), [한국어](./README.md), [日本語](./README.jp.md)

# Key Features
- ✅ Build multiple Mendix widgets simultaneously
- ✅ Automatic .mpk file deployment
- ✅ Widget path and configuration management
- ✅ Intuitive GUI interface
- ✅ Real-time build status monitoring
- ✅ Korean text encoding support (EUC-KR, CP949)
- ✅ PowerShell-based build execution
- ✅ Selective widget build support

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

## 1. Basic Configuration
- **Base Path**: Set the base path where Mendix widgets are located (parent directory containing the packages folder)
- **Destination Path**: Set the target path where built .mpk files will be copied

## 2. Widget Management
- **Add Widget**: Add new widgets using the "Add Widget" button
- **Edit Widget**: Modify names or paths of existing widgets
- **Delete Widget**: Remove unnecessary widgets
- **Select Widget**: Select/deselect widgets to build

## 3. Build and Deploy
- Click "Build Selected Widgets" button for selected widgets
- Execute `pnpm run build` command for each widget
- Automatically copy generated .mpk files to the target path

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
│   ├── App.jsx            # Main application component
│   ├── App.css            # Stylesheet
│   └── main.jsx           # React entry point
├── src-tauri/             # Tauri backend
│   ├── src/
│   │   ├── lib.rs         # Main Rust logic
│   │   └── main.rs        # Tauri entry point
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static files
├── dist/                  # Build output
└── package.json           # Node.js dependencies
```

# Feature Implementation Status
- [x] Widget list management (add, edit, delete)
- [x] Selective widget building
- [x] Automatic .mpk file deployment
- [x] Configuration save and load
- [x] Build status monitoring
- [x] Korean encoding support
- [x] PowerShell-based build execution
- [x] Error handling and user feedback
- [ ] Detailed build log viewer
- [ ] Widget template support
- [ ] Batch job scheduling
- [ ] Japanese encoding support

# Troubleshooting

## Common Issues
1. **Build Failure**: Verify that Node.js and pnpm are properly installed
2. **Path Error**: Ensure Base Path points to the correct Mendix project structure
3. **Permission Issues**: Check PowerShell execution policy (`Get-ExecutionPolicy`)
4. **Encoding Issues**: Automatically handled in Korean Windows environment

## Log Verification
Application logs are stored in the following location:
- Windows: `%APPDATA%\com.sbt-global.mendix-multi-widget-diployer\`

# Contributing
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
