from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, render_template, request, jsonify, flash, url_for, send_from_directory
from flask_cors import CORS, cross_origin
import threading
import queue
import webbrowser
import docx

from werkzeug.utils import redirect, secure_filename
import mysql.connector
from minio import Minio
import jsonlines
import os
import sys
import shutil
import re
import json
import io
import traceback
import zipfile

from dataset_git import Annotator_Controller, load_jsonl, to_jsonl

access_key = os.environ["AWS_ACCESS_KEY_ID"]
secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]

minio_client = Minio(
    "s3:9000",
    access_key=access_key,
    secret_key=secret_key,
    region="sg",
    secure=False,
)

# project_name = "default"


def put_json(bucket_name: str, object_name: str, d: object) -> None:
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
        data=data_stream,
        length=len(data),
        content_type="application/json",
    )


def get_json(bucket_name: str, object_name: str) -> dict:
    """
    get stored json object from the bucket
    """
    data = minio_client.get_object(bucket_name, object_name)
    return json.load(io.BytesIO(data.data))


def list_buckets() -> list:
    buckets = minio_client.list_buckets()
    return [bucket.name for bucket in buckets]


def list_objects(bucket_name, path):
    objects = minio_client.list_objects(
        bucket_name,
        prefix=path,
        recursive=True,
    )
    return objects


def delete_object(bucket_name, prefix, filename, recursive=False):
    if recursive == False:
        minio_client.remove_object(
            bucket_name, "{}/{}".format(prefix, filename))
    else:
        objects_to_delete = minio_client.list_objects(
            bucket_name, prefix=prefix, recursive=True
        )
        for obj in objects_to_delete:
            minio_client.remove_object(bucket_name, obj.object_name)
    print("Delete Successful")


################### INITIALISE VARIABLES ##########################

app = Flask(__name__)
ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg", "jpeg", "gif"}
# CORS(app, resources={r"/login": {"origins": "*"}, "/projectslist": {"origins": "*"}, "/project": {"origins": "*"}, "/classes": {"origins": "*"}, "/projectslist": {"origins": "*"}, "/annotate": {"origins": "*"}})
CORS(app, resources=r"/*", supports_credentials=True)
users_dict = {"admin": "test"}


def handle_zip(zip_file_obj, write_path):
    with zipfile.ZipFile(zip_file_obj, 'r') as zip_ref:
        zip_ref.extractall(write_path)
    return None


def read_file(filetype: str, file_obj: object):
    if "doc" in filetype:
        print("DOCX ", filetype)
        doc = docx.Document(file_obj)
        fullText = []
        for para in doc.paragraphs:
            fullText.append(para.text)
        return "\n".join(fullText)
    if "txt" in filetype:
        return str(file_obj.read().decode())
    if "json" in filetype:
        reader = jsonlines.Reader(file_obj)
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
        hashstring = users_dict[username]
    else:
        hashstring = None
    return hashstring


@app.route("/login", methods=["POST"])
def login():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        operation_type = package["type"]
        user = package["user"]
        hashstring = package["hash"]
        print(hashstring)

        if operation_type == "login":
            registered_hash = get_user_hash(user, users_dict)
            print(hashstring)
            if True:
                result = "login success"
            else:
                result = "login failure"
        elif operation_type == "create":
            add_user(user, hashstring)
            result = "create success"

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        result = traceback.format_exception(exc_type, exc_value, exc_traceback)

    response = jsonify({"answer": result})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/fileUpload", methods=["POST"])
def fileupload():
    global project_name

    path = list(request.files.keys())[-1]
    raw_string = path.split("///")
    project_name = raw_string[0]
    annotator_type = raw_string[1]
    filename = raw_string[2]
    filetype = filename.split(".")[-1]
    data_controller = Annotator_Controller(project_name)

    print("Uploading File...")

    try:
        if os.path.exists(data_controller.raw_source_path) == False:
            # shutil.rmtree(Annotator_Controller.source_raw_path)
            os.mkdir(data_controller.raw_source_path)
        if os.path.exists(data_controller.raw_target_path) == False:
            os.mkdir(data_controller.raw_target_path)

        if annotator_type == "Source":

            if "zip" in filetype:
                handle_zip(request.files[path],
                           data_controller.raw_source_path)
                result = []
            else:
                result = read_file(filetype, request.files[path])
                to_jsonl(
                    "{}/dataset.jsonl".format(data_controller.raw_source_path), result)

            data_controller.init_source_raw(project_name=project_name)

        elif annotator_type == "Target":

            if "zip" in filetype:
                handle_zip(request.files[path],
                           data_controller.raw_target_path)
                result = []
            else:
                result = read_file(filetype, request.files[path])
                to_jsonl(
                    "{}/dataset.jsonl".format(data_controller.raw_target_path), result)

            data_controller.init_target_raw(project_name=project_name)

        result = "200 - file uploaded"

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        result = traceback.format_exception(exc_type, exc_value, exc_traceback)

    response = jsonify({"answer": result})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# Manage CRUD operations of projects
@app.route("/projectslist", methods=["POST"])
def projectlist():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        operation_type = package["type"]
        project_name = package["project_name"]

        project_list = []

        if operation_type == "listprojects":
            project_list = list_buckets()
        elif operation_type == "create":
            user_name = package["user"]
            project_list = list_buckets()
            if project_name not in project_list:
                minio_client.make_bucket(project_name)

            put_json(
                project_name, "annotators", {
                    "Source": "", "Target": "", "Relation": []}
            )
            put_json(
                project_name, "classes", {
                    "Source": [], "Target": [], "Relation": []}
            )

        elif operation_type == "delete":
            delete_object(project_name, "", "", recursive=True)
            minio_client.remove_bucket(project_name)
            project_list = list_buckets()

        response = jsonify({"answer": project_list})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# Manage CRUD operations of a project
@app.route("/project", methods=["POST"])
def projectinfo():
    global project_name
    try:
        package = json.loads(request.data.decode())
        operation_type = package["type"]
        project_name = package["projectname"]
        data_controller = Annotator_Controller(project_name)

        if operation_type == "Source":
            response = jsonify(
                {"answer": [data_controller.get_source_raw().id]})
        elif operation_type == "Target":
            response = jsonify(
                {"answer": [data_controller.get_target_raw().id]})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/existingAnnotations", methods=["POST"])
def existing_annotations():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        operation_type = package["type"]
        project_name = package["projectname"]
        data_controller = Annotator_Controller(project_name)
        result = []

        if operation_type == "getSource":
            existing_source_mentions = data_controller.get_source_mentions()
            if existing_source_mentions != None:
                result = json.load(
                    open(
                        "{}/source_mentions.json".format(
                            existing_source_mentions.get_local_copy()
                        )
                    )
                )
            else:
                result = {}

        elif operation_type == "getTarget":
            existing_target_mentions = data_controller.get_target_mentions()
            if existing_target_mentions != None:
                result = json.load(
                    open(
                        "{}/target_mentions.json".format(
                            existing_target_mentions.get_local_copy()
                        )
                    )
                )
            else:
                result = {}

        elif operation_type == "getTriple":
            existing_triples = data_controller.get_triples_annotations()
            if existing_triples != None:
                result = load_jsonl(
                    load_path="{}/triples.jsonl".format(
                        existing_triples.get_local_copy()
                    )
                )
            else:
                result = []

        response = jsonify({"annotations": result})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/annotateRaw", methods=["POST"])
def annotate_raw():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        operation_type = package["type"]
        project_name = package["projectname"]
        modality = package["modality"]
        data_controller = Annotator_Controller(project_name)
        part_num = 0

        if operation_type == "getSource":
            if modality in ["Audio", "Images"]:
                #num_parts = data_controller.get_source_raw().get_num_chunks()
                dataset = data_controller.get_source_raw().list_files()
            else:
                dataset_path = data_controller.get_source_raw().get_local_copy()
                dataset = load_jsonl(
                    load_path="{}/dataset.jsonl".format(dataset_path))
        elif operation_type == "getTarget":
            if modality in ["Audio", "Images"]:
                dataset = data_controller.get_target_raw().list_files()
            else:
                dataset_path = data_controller.get_target_raw().get_local_copy()
                dataset = load_jsonl(
                    load_path="{}/dataset.jsonl".format(dataset_path))

        response = jsonify({"data": dataset})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/annotateMentions", methods=["POST"])
def annotate_mention():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        project_name = package["projectname"]
        operation_type = package["type"]
        mentions = package["mentions"]
        data_controller = Annotator_Controller(project_name)

        if operation_type == "Source":
            if os.path.exists(data_controller.mentions_source_path) == False:
                os.mkdir(data_controller.mentions_source_path)
            data_controller.set_source_mentions(mentions)
            response = jsonify({"mentions": mentions, "type": operation_type})
        elif operation_type == "Target":
            if os.path.exists(data_controller.mentions_target_path) == False:
                os.mkdir(data_controller.mentions_target_path)
            data_controller.set_target_mentions(mentions)
            response = jsonify({"mentions": mentions, "type": operation_type})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/annotateTriples", methods=["POST"])
def annotate_triples():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        project_name = package["projectname"]
        triples = package["triples"]
        data_controller = Annotator_Controller(project_name)

        if os.path.exists(data_controller.triples_dataset_path) == False:
            os.mkdir(data_controller.triples_dataset_path)

        data_controller.set_triples_annotations(triples)
        response = jsonify({"triples": triples})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/cacheClasses", methods=["POST"])
def cache_classes():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        project_name = package["projectname"]
        classes = package["classes"]
        annotators = package["annotators"]

        put_json(project_name, "classes", classes)
        put_json(project_name, "annotators", annotators)

        response = jsonify({})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify({"error": traceback.format_exception(
            exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/getClasses", methods=["POST"])
def get_classes():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        project_name = package["projectname"]

        print(project_name)

        annotators = get_json(project_name, "annotators")
        classes = get_json(project_name, "classes")
        if annotators is None:
            annotators = {"Source": "", "Target": "", "Relation": []}
        if classes is None:
            classes = {"Source": [], "Target": [], "Relation": []}

        response = jsonify({"annotators": annotators, "classes": classes})

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify(
            {"error": traceback.format_exception(exc_type, exc_value, exc_traceback)})

    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/getDataSlice", methods=["POST"])
def get_data_slice():
    try:
        package = json.loads(request.data.decode())["valueHolder"]
        project_name = package["projectname"]
        annotator_type = package["annotatortype"]
        file_name = package["filename"]
        data_controller = Annotator_Controller(project_name)

        if annotator_type == "Source":
            raw_dataset = data_controller.get_source_raw()
            artifact_name = raw_dataset.file_entries_dict[file_name].artifact_name
            if artifact_name == "data":
                part_num = 0
            else:
                part_num = int(artifact_name.replace(
                    "data_", ""))
            raw_dataset_path = raw_dataset.get_local_copy(part=part_num)
            return send_from_directory(directory=raw_dataset_path, filename=file_name, as_attachment=False)
        elif annotator_type == "Target":
            raw_dataset = data_controller.get_target_raw()
            artifact_name = raw_dataset.file_entries_dict[file_name].artifact_name
            if artifact_name == "data":
                part_num = 0
            else:
                part_num = int(artifact_name.replace(
                    "data_", ""))
            raw_dataset_path = raw_dataset.get_local_copy(part=part_num)
            return send_from_directory(directory=raw_dataset_path, filename=file_name, as_attachment=False)
        else:
            return {"error": "invalid annotator type"}

    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        response = jsonify(
            {"error": traceback.format_exception(exc_type, exc_value, exc_traceback)})
        return response

    # response.headers.add("Access-Control-Allow-Origin", "*")
    # return response


# app.run("0.0.0.0", debug=False)
