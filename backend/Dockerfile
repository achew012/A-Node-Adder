# Use an official Python runtime as a parent image
FROM python:3.6-slim

# Set the working directory to /app
WORKDIR /app

ENV CLEARML_CONFIG_FILE="/home/root/clearml.conf"

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --use-deprecated=legacy-resolver -r requirements.txt 

# Download Spacy Model
CMD ["python", "-m spacy download en"]

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Define environment variable
#ENV NAME World

# Run app.py when the container launches
CMD ["python", "main.py"]
