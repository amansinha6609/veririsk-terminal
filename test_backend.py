import time
import subprocess
import os

print("Starting backend server with mock...")
os.environ["USE_MOCK_GEMINI"] = "true"
os.environ["GEMINI_API_KEY"] = "not-needed"
proc = subprocess.Popen(["python", "main.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
time.sleep(5) # Wait for server to start

# Print the stderr and stdout of the process to see if it failed
proc.poll()
if proc.returncode is not None:
    print(f"Process died with code {proc.returncode}")
    print("STDOUT:", proc.stdout.read().decode())
    print("STDERR:", proc.stderr.read().decode())
else:
    print("Process is running.")

    print("Testing /api/v1/health...")
    health_check = subprocess.run(["curl", "-s", "http://localhost:8008/api/v1/health"], capture_output=True, text=True)
    print(health_check.stdout)
    assert "ok" in health_check.stdout
    print("Health check passed.")

    proc.terminate()
