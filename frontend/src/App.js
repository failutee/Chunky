import React, { useState, useCallback } from 'react';
import axios from 'axios';
import GridBackground from './GridBackground';
import './App.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const traverseDirectory = async (entry) => {
    const reader = entry.createReader();
    return new Promise((resolve) => {
      const allEntries = [];
      const readEntries = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) {
            const allFiles = await Promise.all(allEntries);
            resolve(allFiles.flat());
            return;
          }
          for (const subEntry of entries) {
            if (subEntry.isFile) {
              allEntries.push(new Promise(res => subEntry.file(res)));
            } else if (subEntry.isDirectory) {
              allEntries.push(traverseDirectory(subEntry));
            }
          }
          readEntries();
        });
      };
      readEntries();
    });
  };

  const updateSelectedFiles = (fileList) => {
    const newFiles = Array.from(fileList);

    setSelectedFiles(prevFiles => {
      const combinedFiles = [...prevFiles, ...newFiles];
      const uniqueFilesMap = new Map();
      combinedFiles.forEach(file => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!uniqueFilesMap.has(key)) {
          uniqueFilesMap.set(key, file);
        }
      });
      return Array.from(uniqueFilesMap.values());
    });

    setOutput('');
    setError('');
    setIsCopied(false);
  };
  
  const handleFileChange = (event) => {
    if (event.target.files) {
      updateSelectedFiles(event.target.files);
    }
    event.target.value = null;
  };

  const handleDragEvents = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event) => {
    handleDragEvents(event);
    setIsDragActive(true);
  };
  
  const handleDragLeave = (event) => {
    handleDragEvents(event);
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    setIsDragActive(false);
  };

  const handleDrop = useCallback(async (event) => {
    handleDragEvents(event);
    setIsDragActive(false);

    const items = [...event.dataTransfer.items];
    const promises = [];

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        if (entry.isFile) {
          promises.push(new Promise(resolve => entry.file(resolve)));
        } else if (entry.isDirectory) {
          promises.push(traverseDirectory(entry));
        }
      }
    }
    
    const results = await Promise.all(promises);
    updateSelectedFiles(results.flat());
  }, []); 

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [output]);

  const handleSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select files or a folder.');
      return;
    }
    setIsLoading(true);
    setError('');
    setOutput('');
    setIsCopied(false);

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files[]', selectedFiles[i]);
    }
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/process', formData);
      setOutput(response.data.combined_text);
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = useCallback(() => {
    setSelectedFiles([]);
    setOutput('');
    setError('');
    setIsCopied(false);
  }, []);

  return (
    <div 
      className={`App ${isDragActive ? 'drag-active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragEvents}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <GridBackground />
      
      {isDragActive && (
        <div className="dropzone-overlay">
          <h3>Drop anywhere to process</h3>
        </div>
      )}

      <div className="content-wrapper">
        <header className="App-header">
          <h1>Chunky</h1>
          <p>Combine the contents of multiple text files into one coherent block to help the AI understand your project more effectively</p>
        </header>
        
        <main className="App-main">
          <div className="visible-drop-area">
            <p>Drag & drop files or folders</p>
            <span className="or-divider">or</span>
          </div>

          <div className="controls">
            <input type="file" multiple onChange={handleFileChange} id="file-upload" className="file-input" />
            <label htmlFor="file-upload" className="file-label">Select Files</label>

            <input type="file" multiple webkitdirectory="" directory="" onChange={handleFileChange} id="folder-upload" className="file-input" />
            <label htmlFor="folder-upload" className="file-label">Select Folder</label>

            <button onClick={handleSubmit} disabled={isLoading || selectedFiles.length === 0}>
              {isLoading ? 'Processing...' : 'Process'}
            </button>
            
            <button 
              onClick={handleClear} 
              className="clear-button"
              disabled={selectedFiles.length === 0 && !output && !error}
            >
              Clear
            </button>
          </div>
          
          {selectedFiles && selectedFiles.length > 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
              {selectedFiles.length} file(s) selected.
            </div>
          )}

          {isLoading && (
            <div className="loader-container"><div className="spinner"></div></div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className={`output-wrapper ${output ? 'show' : ''}`}>
            <div className="output-header">
              <h3>Output</h3>
              <button onClick={handleCopy} className="copy-button" disabled={!output}>{isCopied ? 'Copied!' : 'Copy'}</button>
            </div>
            <div className="output-container">
              <pre><code>{output}</code></pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;