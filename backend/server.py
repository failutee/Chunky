import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/process', methods=['POST'])
def process_files():
    if 'files[]' not in request.files:
        return jsonify({"error": "No files in the request."}), 400

    files = request.files.getlist('files[]')
    combined_content = []
    
    sorted_files = sorted(files, key=lambda f: f.filename)

    for file in sorted_files:
        if file.filename == '':
            continue

        try:
            content = file.read().decode('utf-8')
            formatted_block = f"# /{file.filename}\n```\n{content.strip()}\n```"
            combined_content.append(formatted_block)
        except UnicodeDecodeError:
            error_block = f"# /{file.filename}\n```\n[ERROR: This file could not be read as text.]\n```"
            combined_content.append(error_block)
        except Exception as e:
            error_block = f"# /{file.filename}\n```\n[ERROR: {str(e)}]\n```"
            combined_content.append(error_block)

    if not combined_content:
        return jsonify({"error": "No processable files were provided."}), 400
    
    final_output = "\n\n".join(combined_content)
    
    return jsonify({"combined_text": final_output})

if __name__ == '__main__':
    app.run(debug=False, port=5000)