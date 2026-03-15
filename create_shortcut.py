"""Creates a desktop shortcut for UniversalDoc with custom icon."""
import os
import subprocess
import sys

# Use the REAL desktop path (handles OneDrive redirection)
result = subprocess.run(
    ["powershell", "-NoProfile", "-Command", '[Environment]::GetFolderPath("Desktop")'],
    capture_output=True, text=True, timeout=10,
)
DESKTOP = result.stdout.strip() or os.path.join(os.environ["USERPROFILE"], "Desktop")

PYTHON310W = r"C:\Users\bombo\AppData\Local\Programs\Python\Python310\pythonw.exe"
LAUNCHER = r"C:\Users\bombo\.universaldoc\launcher.pyw"
ICON = r"C:\Users\bombo\.universaldoc\universaldoc.ico"
WORK_DIR = r"C:\Users\bombo\.universaldoc"
SHORTCUT = os.path.join(DESKTOP, "UniversalDoc.lnk")

# Create via PowerShell
ps_script = f'''
$ws = New-Object -ComObject WScript.Shell
$s = $ws.CreateShortcut("{SHORTCUT}")
$s.TargetPath = "{PYTHON310W}"
$s.Arguments = '"{LAUNCHER}"'
$s.WorkingDirectory = "{WORK_DIR}"
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
