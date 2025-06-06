import React, { useState, useCallback } from 'react';
import './Dropzone.css';

const Dropzone = ({ children, onFilesDropped }) => {
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

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
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
    onFilesDropped(results.flat());

  }, [onFilesDropped]);

  const handleDragEvents = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event) => {
    handleDragEvents(event);
    setIsDragActive(true);
  }, [handleDragEvents]);

  const handleDragLeave = useCallback((event) => {
    handleDragEvents(event);
    setIsDragActive(false);
  }, [handleDragEvents]);


  return (
    <div 
      className={`dropzone-container ${isDragActive ? 'active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragEvents}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {isDragActive && (
        <div className="dropzone-overlay">
          <h3>Drop files or folders here</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Dropzone;