"""Creates a desktop shortcut for UniversalDoc with custom icon."""
import os
import subprocess
import sys
import shutil

# Use the REAL desktop path (handles OneDrive redirection)
result = subprocess.run(
    ["powershell", "-NoProfile", "-Command", '[Environment]::GetFolderPath("Desktop")'],
    capture_output=True, text=True, timeout=10,
)
DESKTOP = result.stdout.strip() or os.path.join(os.environ["USERPROFILE"], "Desktop")
HOME = os.environ["USERPROFILE"]

# Auto-detect Python — prefer 3.10 (for pywebview/torch compat), fallback to any
PYTHON310W = os.path.join(HOME, r"AppData\Local\Programs\Python\Python310\pythonw.exe")
if not os.path.exists(PYTHON310W):
    PYTHON310W = shutil.which("pythonw") or shutil.which("python") or "pythonw.exe"

UDC_DIR = os.path.join(HOME, ".universaldoc")
LAUNCHER = os.path.join(UDC_DIR, "launcher.pyw")
ICON = os.path.join(UDC_DIR, "universaldoc.ico")
SHORTCUT = os.path.join(DESKTOP, "UniversalDoc.lnk")

# Create via PowerShell
ps_script = f'''
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("{SHORTCUT}")
$s.TargetPath = "{PYTHON310W}"
$s.Arguments = '"{LAUNCHER}"'
$s.WorkingDirectory = "{UDC_DIR}"
$s.Description = "UniversalDoc - AI Document Creator"
$s.IconLocation = "{ICON}, 0"
$s.Save()
Write-Output "OK"
'''

r = subprocess.run(
    ["powershell", "-NoProfile", "-Command", ps_script],
    capture_output=True, text=True, timeout=15,
)

if "OK" in r.stdout:
    print("Shortcut created:", SHORTCUT)
else:
    print("Error:", r.stderr or r.stdout)
    sys.exit(1)
