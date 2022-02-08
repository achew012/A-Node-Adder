from flask import Flask, render_template, request, jsonify, flash, url_for
from flask_cors import CORS, cross_origin
import threading
import queue
import webbrowser
import docx

from werkzeug.utils import redirect, secure_filename
import mysql.connector
from minio import Minio
import jsonlines
import os, sys, shutil, re, json
import io
import traceback

from dataset_git import annotator_controller, load_jsonl, to_jsonl

access_key = os.environ['AWS_ACCESS_KEY_ID']
secret_key = os.environ['AWS_SECRET_ACCESS_KEY']
minio_client = Minio(
    "s3:9000",
    access_key=access_key,
    secret_key=secret_key,
    region="sg",
    secure=False,
)    

project_name = "default"

def put_json(bucket_name, object_name, d):
    """
    jsonify a dict and write it as object to the bucket
    """
    # prepare data and corresponding data stream
    data = json.dumps(d).encode("utf-8")
    data_stream = io.BytesIO(data)
    data_stream.seek(0)

    # put data as object into the bucket
    minio_client.put_object(
        bucket_name=bucket_name,
        object_name=object_name,
        data=data_stream, length=len(data),
        content_type="application/json"
    )

def get_json(bucket_name, object_name):
    """
    get stored json object from the bucket
    """
    data = minio_client.get_object(bucket_name, object_name)
    return json.load(io.BytesIO(data.data))

def list_buckets():
    buckets = minio_client.list_buckets()
    return [bucket.name for bucket in buckets]

def list_objects(bucket_name, path):
    objects = minio_client.list_objects(
        bucket_name, prefix=path, recursive=True,
    )
    return objects

def delete_object(bucket_name, prefix, filename, recursive=False):
    if recursive==False:
        minio_client.remove_object(bucket_name, "{}/{}".format(prefix, filename))
    else:
        objects_to_delete = minio_client.list_objects(bucket_name, prefix=prefix, recursive=True)
        for obj in objects_to_delete:
            minio_client.remove_object(bucket_name, obj.object_name)
    print('Delete Successful')

################### INITIALISE VARIABLES ##########################

app = Flask(__name__)
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}
#CORS(app, resources={r"/login": {"origins": "*"}, "/projectslist": {"origins": "*"}, "/project": {"origins": "*"}, "/classes": {"origins": "*"}, "/projectslist": {"origins": "*"}, "/annotate": {"origins": "*"}}) 
CORS(app, resources=r'/*', supports_credentials=True) 
users_dict={'admin': 'test'}


def read_file(filetype, file_obj):
    if 'doc' in filetype:
        print('DOCX ',filetype)
        doc = docx.Document(file_obj)
        fullText = []
        for para in doc.paragraphs:
            fullText.append(para.text)
        return '\n'.join(fullText)
    if 'txt' in filetype:
        return str(file_obj.read().decode())
    if 'json' in filetype:
        reader=jsonlines.Reader(file_obj)        
        data = []
        for row in reader:
            # TODO change tokenization here
            sentences = row["sentences"].split(" ")
            data.append(sentences)
        return data

def add_user(username, hashstring):
    global users_dict
    users_dict[username] = hashstring
    return username

def get_user_hash(username, users_dict):
    if username in list(users_dict.keys()):
        hashstring=users_dict[username] 
    else:
        hashstring=None
    return hashstring

from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/login', methods =['POST']) 
def login():
    try:
        package = json.loads(request.data.decode())['valueHolder']
        operation_type = package['type']
        user = package['user']
        hashstring = package['hash']
        print(hashstring)

        if operation_type=='login':
            registered_hash = get_user_hash(user, users_dict)
            print(hashstring)
            if True:
                result = 'login success'
            else:
                result = 'login failure'
        elif operation_type=='create':
            add_user(user, hashstring)
            result='create success'
        
        response = jsonify({'answer': result})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        result = 'File format error: {}'.format(e)
        response =  jsonify({'answer' : str(e)})        

    print("Access Control is allowed")
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response    

@app.route('/file', methods =['POST']) 
def fileupload():
    global project_name

    path = list(request.files.keys())[-1]
    raw_string = path.split('///')
    project_name = raw_string[0]
    annotator_type = raw_string[1]
    filename = raw_string[2]
    filetype = filename.split('.')[-1]
    data_controller = annotator_controller(project_name)

    print("Uploading File...")

    try:
        if os.path.exists(data_controller.raw_source_path)==False:
            # shutil.rmtree(annotator_controller.source_raw_path)
            os.mkdir(data_controller.raw_source_path)
        if os.path.exists(data_controller.raw_target_path)==False:
            os.mkdir(data_controller.raw_target_path)

        if annotator_type=="Source":
            result = read_file(filetype, request.files[path])
            to_jsonl("{}/dataset.jsonl".format(data_controller.raw_source_path), result)
            data_controller.init_source_raw(project_name=project_name)
        elif annotator_type=="Target":
            result = read_file(filetype, request.files[path])
            to_jsonl("{}/dataset.jsonl".format(data_controller.raw_target_path), result)
            data_controller.init_target_raw(project_name=project_name)

        result = "200 - file uploaded"

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        result = 'File format error: {}'.format(e)

    response = jsonify({"answer": result})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 

# Manage CRUD operations of projects
@app.route('/projectslist', methods =['POST']) 
def projectlist():
    try:
        package = json.loads(request.data.decode())['valueHolder']
        operation_type = package['type']
        project_name = package['project_name']

        project_list=[]

        if operation_type=='listprojects':
            project_list = list_buckets()     
        elif operation_type == 'create':
            user_name = package['user']
            minio_client.make_bucket(project_name)
            project_list = list_buckets()
            
            #put_json(project_name, "{}/{}".format("annotations", 'annotated_obj'), [])
            #put_json(project_name, "{}/{}".format("annotators", 'current_annotators'), [])

        elif operation_type=='delete':
            delete_object(project_name, '', '', recursive=True)
            minio_client.remove_bucket(project_name)
            project_list = list_buckets()
            
        response = jsonify({'answer': project_list})    

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        result = 'File format error: {}'.format(e)
        response = jsonify({'error' : str(e)})
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 
    
# Manage CRUD operations of a project
@app.route('/project', methods =['POST']) 
def projectinfo():
    global project_name
    try:
        package = json.loads(request.data.decode())        
        operation_type = package['type']
        project_name = package['projectname']
        data_controller = annotator_controller(project_name)

        if operation_type=="Source":        
            response =jsonify({'answer': [data_controller.get_source_raw().id]})
        elif operation_type=="Target":
            response =jsonify({'answer': [data_controller.get_target_raw().id]})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        response = jsonify({'error' : str(e)})

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 


@app.route('/annotateRaw', methods =['POST']) 
def annotate_raw():
    try:
        package = json.loads(request.data.decode())['valueHolder']
        operation_type = package['type']
        project_name = package['projectname']
        modality = package['modality']
        data_controller = annotator_controller(project_name)

        if operation_type=="getSource":
            dataset_path = data_controller.get_source_raw().get_local_copy()
            dataset = load_jsonl(load_path="{}/dataset.jsonl".format(dataset_path))
        elif operation_type=="getTarget":
            dataset_path = data_controller.get_target_raw().get_local_copy()
            dataset = load_jsonl(load_path="{}/dataset.jsonl".format(dataset_path))
        
        response =  jsonify({'data': dataset, 'annotations': []})   

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        response = jsonify({'error' : str(e)})

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 

@app.route('/annotateMentions', methods =['POST']) 
def annotate_mention():
    try:
        package = json.loads(request.data.decode())['valueHolder']
        project_name = package['projectname']
        operation_type = package['type']
        mentions = package['mentions']
        data_controller = annotator_controller(project_name)

        if operation_type=="Source":
            if os.path.exists(data_controller.mentions_source_path)==False:
                os.mkdir(data_controller.mentions_source_path)
            data_controller.set_source_mentions(mentions)
            response =  jsonify({'mentions': mentions, 'type': operation_type})   
        elif operation_type=="Target":
            if os.path.exists(data_controller.mentions_target_path)==False:
                os.mkdir(data_controller.mentions_target_path)
            data_controller.set_target_mentions(mentions)
            response =  jsonify({'mentions': mentions, 'type': operation_type})   

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
        response = jsonify({'error' : str(e)})

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 


#app.run("0.0.0.0", debug=False)





