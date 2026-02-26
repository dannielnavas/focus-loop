#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use std::sync::Mutex;
use tauri::{
  menu::{MenuBuilder, SubmenuBuilder},
  AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Size, State, Window,
};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

const ADMIN_SUBSCRIPTION_PLAN_ID: &str = "2";
const ROLE_ADMIN: &str = "admin";

#[derive(Default)]
struct UserContextState(Mutex<Option<Value>>);

fn is_admin_user(user: Option<&Value>) -> bool {
  let Some(user) = user else {
    return false;
  };

  if user
    .get("role")
    .and_then(|v| v.as_str())
    .is_some_and(|r| r == ROLE_ADMIN)
  {
    return true;
  }

  // subscriptionPlan.subscription_plan_id can be string or number
  let plan_id = user
    .get("subscriptionPlan")
    .and_then(|sp| sp.get("subscription_plan_id"))
    .and_then(|id| {
      if let Some(s) = id.as_str() {
        Some(s.to_string())
      } else if let Some(n) = id.as_i64() {
        Some(n.to_string())
      } else {
        None
      }
    });

  plan_id.is_some_and(|id| id == ADMIN_SUBSCRIPTION_PLAN_ID)
}

fn is_role_admin(user: Option<&Value>) -> bool {
  user
    .and_then(|u| u.get("role"))
    .and_then(|v| v.as_str())
    .is_some_and(|r| r == ROLE_ADMIN)
}

fn apply_app_menu(app: &AppHandle, user: Option<&Value>) -> tauri::Result<()> {
  let is_admin = is_admin_user(user);
  println!("is_admin: {:?}", is_admin);
  let is_admin_role = is_role_admin(user);
  println!("is_admin_role: {:?}", is_admin_role);
  let is_logged_in = user.is_some();
  println!("is_logged_in: {:?}", is_logged_in);

  let mut focus_loop = SubmenuBuilder::new(app, "Focus Loop")
    .text("about", "About Focus Loop")
    .separator();


    focus_loop = focus_loop.text("generate_daily", "Generate Daily");


  if is_admin_role {
    focus_loop = focus_loop.text("profile", "Profile");
  }

  if is_logged_in {
    focus_loop = focus_loop.separator().text("logout", "Logout");
  }

  focus_loop = focus_loop.separator().text("quit", "Quit");

  let focus_loop = focus_loop.build()?;
  let menu = MenuBuilder::new(app).items(&[&focus_loop]).build()?;
  app.set_menu(menu)?;
  Ok(())
}

#[tauri::command]
fn set_user_context(
  app: AppHandle,
  state: State<UserContextState>,
  user_context: Option<Value>,
) -> Result<bool, String> {
  *state
    .0
    .lock()
    .map_err(|_| "Failed to lock user context".to_string())? = user_context;

  let user = state
    .0
    .lock()
    .map_err(|_| "Failed to lock user context".to_string())?
    .clone();

  apply_app_menu(&app, user.as_ref()).map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn resize_window(window: Window, width: u32, height: u32) -> Result<bool, String> {
  window
    .set_size(Size::Logical(LogicalSize {
      width: width as f64,
      height: height as f64,
    }))
    .map_err(|e| e.to_string())?;
  let _ = window.center();
  Ok(true)
}

#[tauri::command]
fn reset_window_size(window: Window) -> Result<bool, String> {
  window
    .set_size(Size::Logical(LogicalSize {
      width: 1200.0,
      height: 800.0,
    }))
    .map_err(|e| e.to_string())?;
  let _ = window.set_always_on_top(false);
  let _ = window.set_resizable(true);
  let _ = window.center();
  Ok(true)
}

#[tauri::command]
fn make_window_floating(window: Window, width: u32, height: u32) -> Result<bool, String> {
  let _ = window.set_always_on_top(true);
  let _ = window.set_resizable(false);
  window
    .set_size(Size::Logical(LogicalSize {
      width: width as f64,
      height: height as f64,
    }))
    .map_err(|e| e.to_string())?;
  let _ = window.center();
  Ok(true)
}

#[tauri::command]
fn reset_window_floating(window: Window) -> Result<bool, String> {
  let _ = window.set_always_on_top(false);
  let _ = window.set_resizable(true);
  window
    .set_size(Size::Logical(LogicalSize {
      width: 1200.0,
      height: 800.0,
    }))
    .map_err(|e| e.to_string())?;
  let _ = window.center();
  Ok(true)
}

#[tauri::command]
fn move_window(window: Window, x: i32, y: i32) -> Result<bool, String> {
  window
    .set_position(tauri::Position::Logical(LogicalPosition {
      x: x as f64,
      y: y as f64,
    }))
    .map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn hide_titlebar(window: Window) -> Result<bool, String> {
  window
    .set_decorations(false)
    .map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn show_titlebar(window: Window) -> Result<bool, String> {
  window
    .set_decorations(true)
    .map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn hide_menu(app: AppHandle) -> Result<bool, String> {
  app.hide_menu().map_err(|e| e.to_string())?;
  Ok(true)
}

#[tauri::command]
fn show_menu(app: AppHandle, state: State<UserContextState>) -> Result<bool, String> {
  let user = state
    .0
    .lock()
    .map_err(|_| "Failed to lock user context".to_string())?
    .clone();
  apply_app_menu(&app, user.as_ref()).map_err(|e| e.to_string())?;
  app.show_menu().map_err(|e| e.to_string())?;
  Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      app.manage(UserContextState::default());
      let handle = app.handle().clone();

      apply_app_menu(&handle, None)?;

      handle.on_menu_event(move |app_handle, event| {
        let id = event.id().0.as_str();
        match id {
          "generate_daily" => {
            let _ = app_handle.emit("menu:generateDaily", ());
          }
          "profile" => {
            let _ = app_handle.emit("menu:profile", ());
          }
          "logout" => {
            let _ = app_handle.emit("menu:logout", ());
          }
          "about" => {
            app_handle
              .dialog()
              .message("Focus Loop\n\nVersión 0.0.3\n\nDeveloped by Danniel Navas. Focus Loop is a task management and productivity application.")
              .title("Focus Loop")
              .kind(MessageDialogKind::Info)
              .show(|_| {});
          }
          _ => {}
        }
      });

      Ok(())
    })
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_notification::init())
    .invoke_handler(tauri::generate_handler![
      resize_window,
      reset_window_size,
      make_window_floating,
      reset_window_floating,
      move_window,
      hide_titlebar,
      show_titlebar,
      hide_menu,
      show_menu,
      set_user_context
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
