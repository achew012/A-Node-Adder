from minio import Minio
import jsonlines
import io
import json

access_key='minio'
secret_key='minio123'

minio_client = Minio(
    "172.21.0.5:9000",
    access_key=access_key,
    secret_key=secret_key,
    region="sg",
    secure=False,
)  

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


file_obj = open('news.jsonl', 'rb')
reader=jsonlines.Reader(file_obj)        
data = []
for row in reader:
    data.append(row)

put_json("annotations", "annotations/{}/{}.jsonl".format('test', 'news.jsonl'), data)
