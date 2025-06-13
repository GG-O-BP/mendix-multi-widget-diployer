use encoding_rs::EUC_KR;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Widget {
    key: String,
    name: String,
    path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AppSettings {
    widgets: Vec<Widget>,
    selected_widgets: std::collections::HashMap<String, bool>,
    destination_path: String,
    base_path: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            widgets: vec![],
            selected_widgets: std::collections::HashMap::new(),
            destination_path: String::new(),
            base_path: String::new(),
        }
    }
}

fn get_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app_handle
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get app config dir: {}", e))?;

    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create config dir: {}", e))?;
    }

    Ok(app_dir.join("settings.json"))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn load_settings(app_handle: tauri::AppHandle) -> Result<AppSettings, String> {
    let config_path = get_config_path(&app_handle)?;

    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;

        let settings: AppSettings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?;

        Ok(settings)
    } else {
        let default_settings = AppSettings::default();
        save_settings_internal(&app_handle, &default_settings)?;
        Ok(default_settings)
    }
}

#[tauri::command]
async fn save_settings(app_handle: tauri::AppHandle, settings: AppSettings) -> Result<(), String> {
    save_settings_internal(&app_handle, &settings)
}

fn save_settings_internal(
    app_handle: &tauri::AppHandle,
    settings: &AppSettings,
) -> Result<(), String> {
    let config_path = get_config_path(app_handle)?;

    let content = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn add_widget(
    app_handle: tauri::AppHandle,
    key: String,
    name: String,
    path: String,
) -> Result<AppSettings, String> {
    let mut settings = load_settings(app_handle.clone()).await?;

    // Check if widget key already exists
    if settings.widgets.iter().any(|w| w.key == key) {
        return Err(format!("Widget with key '{}' already exists", key));
    }

    let new_widget = Widget {
        key: key.clone(),
        name,
        path,
    };
    settings.widgets.push(new_widget);
    settings.selected_widgets.insert(key, true);

    save_settings_internal(&app_handle, &settings)?;
    Ok(settings)
}

#[tauri::command]
async fn remove_widget(app_handle: tauri::AppHandle, key: String) -> Result<AppSettings, String> {
    let mut settings = load_settings(app_handle.clone()).await?;

    settings.widgets.retain(|w| w.key != key);
    settings.selected_widgets.remove(&key);

    save_settings_internal(&app_handle, &settings)?;
    Ok(settings)
}

#[tauri::command]
async fn update_widget(
    app_handle: tauri::AppHandle,
    key: String,
    name: String,
    path: String,
) -> Result<AppSettings, String> {
    let mut settings = load_settings(app_handle.clone()).await?;

    if let Some(widget) = settings.widgets.iter_mut().find(|w| w.key == key) {
        widget.name = name;
        widget.path = path;
        save_settings_internal(&app_handle, &settings)?;
        Ok(settings)
    } else {
        Err(format!("Widget with key '{}' not found", key))
    }
}

#[tauri::command]
async fn build_widgets(
    widgets: Vec<String>,
    destination_path: String,
    base_path: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let base_path = Path::new(&base_path);
    let dest_path = Path::new(&destination_path);

    // Verify destination path exists
    if !dest_path.exists() {
        return Err(format!(
            "Destination path does not exist: {}",
            destination_path
        ));
    }

    let mut success_count = 0;
    let mut errors = Vec::new();

    for widget in &widgets {
        let widget_path = base_path.join(widget);

        if !widget_path.exists() {
            errors.push(format!(
                "Widget path does not exist: {}",
                widget_path.display()
            ));
            continue;
        }

        // Execute pnpm run build
        match execute_build(&widget_path, &app_handle).await {
            Ok(output) => {
                println!("Build output for {}: {}", widget, output);

                // Copy .mpk file
                match copy_mpk_file(&widget_path, dest_path, widget) {
                    Ok(copied_file) => {
                        success_count += 1;
                        println!("Successfully copied: {}", copied_file);
                    }
                    Err(e) => {
                        errors.push(format!("Failed to copy .mpk for {}: {}", widget, e));
                    }
                }
            }
            Err(e) => {
                errors.push(format!("Build failed for {}: {}", widget, e));
            }
        }
    }

    if errors.is_empty() {
        Ok(format!(
            "Successfully built and deployed {} widget(s)",
            success_count
        ))
    } else if success_count > 0 {
        Ok(format!(
            "Partially successful: {} widget(s) completed, {} failed:\n{}",
            success_count,
            errors.len(),
            errors.join("\n")
        ))
    } else {
        Err(format!("All builds failed:\n{}", errors.join("\n")))
    }
}

fn decode_korean_text(bytes: &[u8]) -> String {
    // Try UTF-8 first
    if let Ok(utf8_str) = String::from_utf8(bytes.to_vec()) {
        return utf8_str;
    }

    // Try EUC-KR (common Korean encoding on Windows)
    let (decoded, _, had_errors) = EUC_KR.decode(bytes);
    if !had_errors || decoded.chars().filter(|&c| c == '\u{FFFD}').count() < decoded.len() / 4 {
        return decoded.to_string();
    }

    // Try CP949 (Windows Korean codepage)
    if let Some(cp949_bytes) = try_cp949_decode(bytes) {
        return cp949_bytes;
    }

    // Fallback to UTF-8 lossy
    String::from_utf8_lossy(bytes).to_string()
}

fn try_cp949_decode(bytes: &[u8]) -> Option<String> {
    // Simple heuristic for CP949 decoding
    let mut result = String::new();
    let mut i = 0;

    while i < bytes.len() {
        let byte = bytes[i];
        if byte < 0x80 {
            // ASCII character
            result.push(byte as char);
            i += 1;
        } else if byte >= 0x81 && byte <= 0xFE && i + 1 < bytes.len() {
            // Potential multi-byte character
            let second_byte = bytes[i + 1];
            if (second_byte >= 0x41 && second_byte <= 0x5A)
                || (second_byte >= 0x61 && second_byte <= 0x7A)
                || (second_byte >= 0x81 && second_byte <= 0xFE)
            {
                // Use the bytes as-is and let the system handle it
                result.push_str(&format!("{}{}", byte as char, second_byte as char));
                i += 2;
            } else {
                result.push('\u{FFFD}');
                i += 1;
            }
        } else {
            result.push('\u{FFFD}');
            i += 1;
        }
    }

    if result.chars().filter(|&c| c == '\u{FFFD}').count() < result.len() / 4 {
        Some(result)
    } else {
        None
    }
}

async fn execute_build(
    widget_path: &Path,
    app_handle: &tauri::AppHandle,
) -> Result<String, String> {
    use tauri_plugin_shell::ShellExt;

    let shell = app_handle.shell();
    let output = shell
        .command("powershell.exe")
        .args(&[
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-Command",
            "$env:PYTHONIOENCODING='utf-8'; $env:LANG='ko_KR.UTF-8'; $OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::InputEncoding = [System.Text.Encoding]::UTF8; chcp 65001 > $null; $env:NODE_OPTIONS='--max_old_space_size=4096'; pnpm run build 2>&1"
        ])
        .current_dir(widget_path)
        .output()
        .await
        .map_err(|e| format!("Failed to execute powershell: {}", e))?;

    if output.status.success() {
        let stdout_str = decode_korean_text(&output.stdout);
        Ok(stdout_str)
    } else {
        let stderr = decode_korean_text(&output.stderr);
        let stdout = decode_korean_text(&output.stdout);
        Err(format!(
            "Build command failed:\nSTDOUT: {}\nSTDERR: {}",
            stdout, stderr
        ))
    }
}

fn copy_mpk_file(
    widget_path: &Path,
    dest_path: &Path,
    _widget_name: &str,
) -> Result<String, String> {
    let dist_path = widget_path.join("dist").join("1.0.0");

    if !dist_path.exists() {
        return Err(format!("Dist path does not exist: {}", dist_path.display()));
    }

    // Find .mpk file in the dist directory
    let mpk_files: Vec<PathBuf> = fs::read_dir(&dist_path)
        .map_err(|e| format!("Failed to read dist directory: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.extension()? == "mpk" {
                Some(path)
            } else {
                None
            }
        })
        .collect();

    if mpk_files.is_empty() {
        return Err(format!("No .mpk file found in {}", dist_path.display()));
    }

    if mpk_files.len() > 1 {
        return Err(format!(
            "Multiple .mpk files found in {}, expected exactly one",
            dist_path.display()
        ));
    }

    let source_mpk = &mpk_files[0];
    let mpk_filename = source_mpk
        .file_name()
        .ok_or("Invalid .mpk filename")?
        .to_string_lossy();

    let dest_mpk = dest_path.join(mpk_filename.as_ref());

    // Copy the file, overwriting if it exists
    fs::copy(source_mpk, &dest_mpk).map_err(|e| format!("Failed to copy .mpk file: {}", e))?;

    Ok(format!(
        "Copied {} to {}",
        source_mpk.display(),
        dest_mpk.display()
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            build_widgets,
            load_settings,
            save_settings,
            add_widget,
            remove_widget,
            update_widget
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
