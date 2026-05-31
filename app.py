from flask import Flask, request, redirect, url_for

app = Flask(__name__)

@app.route('/submit', methods=['POST'])
def submit_form():
    # Use .get() to avoid KeyErrors if fields are missing
    name = request.form.get('name')
    email = request.form.get('email')
    message = request.form.get('message')
    
    # Basic validation
    if not name or not email or not message:
        return 'Error: Please fill out all required fields.', 400
    
    # TODO: Add logic to save to database, send email, or log the submission
    
    return 'Form submitted successfully!'

if __name__ == '__main__':
    app.run(debug=True)
