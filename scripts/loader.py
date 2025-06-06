import subprocess
import threading
import sys
import os

BACKEND_DIR = "../backend"
FRONTEND_DIR = "../frontend"

BACKEND_COMMAND = [sys.executable, "server.py"]
IS_WINDOWS = sys.platform == "win32"
FRONTEND_COMMAND = ["npm.cmd" if IS_WINDOWS else "npm", "start"]

def stream_output(name, process):
    for line in iter(process.stdout.readline, b''):
        print(f"[{name}] {line.decode('utf-8').strip()}", flush=True)

def main():
    print("--- Starting Application (Backend + Frontend) ---")
    print("Press CTRL+C to stop all processes.")

    processes = []
    threads = []
    
    try:
        backend_process = subprocess.Popen(
            BACKEND_COMMAND,
            cwd=BACKEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        processes.append(backend_process)

        backend_thread = threading.Thread(target=stream_output, args=("BACKEND", backend_process))
        threads.append(backend_thread)

        frontend_process = subprocess.Popen(
            FRONTEND_COMMAND,
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=IS_WINDOWS
        )
        processes.append(frontend_process)
        
        frontend_thread = threading.Thread(target=stream_output, args=("FRONTEND", frontend_process))
        threads.append(frontend_thread)
        
        for t in threads:
            t.start()

        for p in processes:
            p.wait()

    except KeyboardInterrupt:
        print("\n--- CTRL+C detected. Shutting down... ---")
    
    finally:
        for p in processes:
            print(f"Terminating process PID: {p.pid}...")
            p.terminate()
        
        for t in threads:
            t.join()
            
        print("--- All processes stopped. Exiting. ---")

if __name__ == "__main__":
    main()