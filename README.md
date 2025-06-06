## ℹ️ Info
The project was created for personal use, but I'm sharing it in the hope that someone else will find it useful.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your system:
*   Python 3.8+
*   Node.js & npm

### Installation

1.  **Clone the repository to your local machine:**
    ```bash
    git clone https://github.com/failutee/Chunky.git
    cd Chunky
    ```

2.  **Install the necessary dependencies for both the backend and frontend:**
    ```bash
    # Install Python packages for the backend
    pip install -r backend/requirements.txt

    # Install Node.js packages for the frontend
    npm install --prefix frontend
    ```

### Running the Application

We provide two ways to run the application.

#### A) Recommended Method (Single Script)

We've included a convenient script to launch both the backend and frontend services simultaneously.

```bash
python scripts/loader.py
```

#### B) Manual Method (Separate Terminals)

If you prefer to manage the services individually or encounter issues with the loader script, you can run them in separate terminal sessions.

1.  **Start the Backend Server:**
    ```bash
    python backend/server.py
    ```

2.  **Start the Frontend Development Server:**
    ```bash
    npm start --prefix frontend
    ```

After starting the application, it should be available at **`http://localhost:3000`**.

# Showcase
https://github.com/user-attachments/assets/0c6f133b-b369-4580-93ab-163bb58532f1
