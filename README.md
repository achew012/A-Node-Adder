# A-Node-Adder

A custom document annotator that can annotate on different tasks at the same time.

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation

Create your own .env file inside /frontend/ and add the following configuration with your own credentials: (>5 characters for key and > 8 for secret)
   ```
   AWS_ACCESS_KEY_ID=xxxxx 
   AWS_SECRET_ACCESS_KEY=xxxxxxxx
   MINIO_ROOT_USER=xxxxx
   MINIO_ROOT_PASSWORD=xxxxxxxx
   REACT_APP_SERVER_URL={ip address or domain}:{port}

Create a folder call ./config

copy your clearml.conf into the ./config folder

   ```
## TO RUN


Run 
```
   $ docker-compose up --build
```
at the root path to build project.

Run 
```sh
   $ docker-compose up -d
```
at the root path to run the server.


Access the annotator on the browser: 0.0.0.0<br/>

Data can be uploaded in the same format as specified in backend/news.jsonl  

<!-- <br/>Default Layer1 user:
<br/>Default Layer1 password: 
<br/>
<br/>Default Layer2 user: &nbsp;
<br/>Default Layer2 password: &nbsp; -->

## System Architecture

### Frontend 
![](/documents/Annotator_Architecture_frontend.png)

<br/>

### Backend

![](/documents/Annotator_Architecture_backend.png)

<br/>

### Data Store
![](/documents/Annotator_Architecture_db.png)

<br/>

