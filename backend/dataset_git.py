#!/usr/bin/env python
# coding: utf-8

from pickle import NONE
from clearml import Task, StorageManager, Dataset
import sys
import json
import os
import jsonlines
import ipdb
import shutil


def load_jsonl(load_path: str):
    data = []
    with open(load_path, "r") as file:
        for doc in file:
            data.append(json.loads(doc))
    return data


def to_jsonl(filename: str, file_obj):
    resultfile = open(filename, "wb")
    writer = jsonlines.Writer(resultfile)
    writer.write_all(file_obj)


class Dataset_Git:
    @staticmethod
    def create_project(project_name: str) -> None:
        existing_tasks = Task.get_tasks(project_name=project_name)
        if len(existing_tasks) > 0:
            print("Existing task detected. Not creating new task.")
            return None
        else:
            print("Creating new task...")
            task = Task.init(project_name=project_name)
            task.close()

    @staticmethod
    def create_root(dataset_name: str, dataset_project: str, upload_path: str) -> None:
        dataset = Dataset.create(
            dataset_name=dataset_name,
            dataset_project=dataset_project,
            dataset_tags=["original"],
            parent_datasets=None,
            use_current_task=False,
        )
        default_storage = dataset.get_default_storage()
        dataset.add_files(upload_path, recursive=True, verbose=False)
        dataset.upload(output_url=default_storage)
        dataset.finalize()
        # dataset.publish()
        return dataset.id

    def __init__(self, pull_dataset_project: str, root_path="datasets/annotations"):
        self.pull_dataset_project = "{}/{}".format(
            root_path, pull_dataset_project)
        self.version_ids = [
            version["id"]
            for version in Dataset.list_datasets(
                [self.pull_dataset_project], only_completed=True
            )
        ]
        if len(self.version_ids) > 0:
            self.latest_dataset = Dataset.get(dataset_id=self.version_ids[-1])
            self.default_storage = self.latest_dataset.get_default_storage()
        else:
            print("Creating new task...")
            self.create_project(self.pull_dataset_project)

    def get_current_version_id(self) -> str:
        return self.latest_dataset.id

    def get_parent(self) -> str:
        dependency = self.latest_dataset.get_dependency_graph()
        return dependency[self.latest_dataset.id]

    def get_root(self) -> str:
        # self.version_ids = [version["id"] for version in Dataset.list_datasets([self.pull_dataset_project], only_completed=True)]
        root = [
            item
            for item, value in self.latest_dataset.get_dependency_graph().items()
            if value == []
        ]
        return root[0]

    def create_empty_dataset_task(self, dataset_name, parents=[]):
        dataset = Dataset.create(
            dataset_name=dataset_name,
            dataset_project=self.pull_dataset_project,
            parent_datasets=parents,
        )
        return dataset

    def get_dataset(
        self,
        dataset_name: str,
        auto_create=False,
        writable_copy=False,
        only_completed=False,
    ) -> Dataset:
        try:
            dataset_obj = Dataset.get(
                dataset_project=self.pull_dataset_project,
                dataset_name=dataset_name,
                auto_create=auto_create,
                writable_copy=writable_copy,
                only_completed=only_completed,
            )
            return dataset_obj
        except Exception as e:
            return None

    def delete_dataset(self, dataset_name: str = None, dataset_id: str = None) -> None:
        try:
            Dataset.delete(
                dataset_project=self.pull_dataset_project,
                dataset_name=dataset_name,
                dataset_id=dataset_id,
            )
            return None
        except Exception as e:
            return e

    def get_latest_dataset(self, target_folder_path: str) -> Dataset:
        """
        returns a local path of a dataset copy of the project
        """
        if os.path.exists(target_folder_path):
            shutil.rmtree(target_folder_path)

        return self.latest_dataset.get_mutable_local_copy(
            target_folder_path, overwrite=True
        )

    def sync_folder2dataset(self, local_data_path: str) -> None:
        new_dataset = Dataset.create(
            dataset_name="child_of_" + self.latest_dataset.id,
            dataset_project=self.pull_dataset_project,
            parent_datasets=[self.latest_dataset.id],
        )
        modifications = self.latest_dataset.verify_dataset_hash(
            local_copy_path=local_data_path
        )
        print("Files modified: {}".format(modifications))
        if len(modifications) > 0:
            print("Syncing files...")
            new_dataset.sync_folder(local_data_path, verbose=False)
            new_dataset.upload(output_url=self.default_storage)
            new_dataset.finalize()
            self.latest_dataset = new_dataset
            self.version_ids = [
                version["id"]
                for version in Dataset.list_datasets(
                    [self.pull_dataset_project], only_completed=True
                )
            ]
            print("Success! Files synced and updated.")
        else:
            print("No files to update")

    def squash_datasets(self, new_dataset_name, dataset_ids: list) -> None:
        return Dataset.squash(new_dataset_name, dataset_ids=dataset_ids)


class Annotator_Controller(Dataset_Git):
    def __init__(self, pull_dataset_project: str):
        self.raw_source_path = "/tmp/source_raw"
        self.raw_target_path = "/tmp/target_raw"
        self.mentions_source_path = "/tmp/source_mentions"
        self.mentions_target_path = "/tmp/target_mentions"
        self.triples_dataset_path = "/tmp/triples_dataset"
        super(Annotator_Controller, self).__init__(pull_dataset_project)

    def get_source_raw(self) -> Dataset:
        return self.get_dataset("source_raw")

    def get_target_raw(self) -> Dataset:
        return self.get_dataset("target_raw")

    def init_source_raw(self, project_name: str) -> None:
        deletion_error = self.delete_dataset(dataset_name="source_raw")
        self.source_raw_id = self.create_root(
            dataset_name="source_raw",
            dataset_project=self.pull_dataset_project,
            upload_path="./source_raw",
        )

    def init_target_raw(self, project_name: str) -> None:
        deletion_error = self.delete_dataset(dataset_name="target_raw")
        self.target_raw_id = self.create_root(
            dataset_name="target_raw",
            dataset_project=self.pull_dataset_project,
            upload_path="./target_raw",
        )

    def get_source_mentions(self) -> Dataset:
        return self.get_dataset("source_mentions")

    def get_target_mentions(self) -> Dataset:
        return self.get_dataset("target_mentions")

    def set_source_mentions(self, source_mentions) -> None:
        source_mentions_dataset = self.get_source_mentions()
        if source_mentions_dataset is None:
            source_mentions_dataset = self.create_empty_dataset_task(
                "source_mentions", parents=[self.get_source_raw().id]
            )
            source_mentions_dataset.finalize()
        source_mentions_dataset.get_mutable_local_copy(
            self.mentions_source_path, overwrite=True
        )
        json.dump(
            source_mentions,
            open("{}/source_mentions.json".format(self.mentions_source_path), "w"),
        )

        new_source_mentions_dataset = self.create_empty_dataset_task(
            "new_source_mentions", parents=[source_mentions_dataset.id]
        )
        new_source_mentions_dataset.sync_folder(
            self.mentions_source_path, verbose=True)
        new_source_mentions_dataset.upload()
        new_source_mentions_dataset.finalize()

        self.squash_datasets(
            "source_mentions",
            [source_mentions_dataset.id, new_source_mentions_dataset.id],
        )
        Dataset.delete(dataset_id=new_source_mentions_dataset.id)
        Dataset.delete(dataset_id=source_mentions_dataset.id)
        return None

    def set_target_mentions(self, target_mentions) -> None:
        target_mentions_dataset = self.get_target_mentions()
        if target_mentions_dataset is None:
            target_mentions_dataset = self.create_empty_dataset_task(
                "target_mentions", parents=[self.get_target_raw().id]
            )
            target_mentions_dataset.finalize()
        target_mentions_dataset.get_mutable_local_copy(
            self.mentions_target_path, overwrite=True
        )
        json.dump(
            target_mentions,
            open("{}/target_mentions.json".format(self.mentions_target_path), "w"),
        )

        new_target_mentions_dataset = self.create_empty_dataset_task(
            "new_target_mentions", parents=[target_mentions_dataset.id]
        )
        new_target_mentions_dataset.sync_folder(
            self.mentions_target_path, verbose=True)
        new_target_mentions_dataset.upload()
        new_target_mentions_dataset.finalize()

        self.squash_datasets(
            "target_mentions",
            [target_mentions_dataset.id, new_target_mentions_dataset.id],
        )
        Dataset.delete(dataset_id=new_target_mentions_dataset.id)
        Dataset.delete(dataset_id=target_mentions_dataset.id)
        return None

    def get_triples_annotations(self) -> Dataset:
        return self.get_dataset("triples_dataset")

    def set_triples_annotations(self, triples) -> None:
        triples_dataset = self.get_triples_annotations()
        if triples_dataset == None:
            triples_dataset = self.create_empty_dataset_task(
                "triples_dataset",
                parents=[self.get_target_mentions(
                ).id, self.get_source_mentions().id],
            )
            triples_dataset.finalize()
        triples_dataset.get_mutable_local_copy(
            self.triples_dataset_path, overwrite=True
        )
        to_jsonl("{}/triples.jsonl".format(self.triples_dataset_path), triples)

        new_triples_dataset = self.create_empty_dataset_task(
            "new_triples_dataset", parents=[triples_dataset.id]
        )
        new_triples_dataset.sync_folder(
            self.triples_dataset_path, verbose=True)
        new_triples_dataset.upload()
        new_triples_dataset.finalize()

        self.squash_datasets(
            "triples_dataset", [triples_dataset.id, new_triples_dataset.id]
        )
        Dataset.delete(dataset_id=new_triples_dataset.id)
        Dataset.delete(dataset_id=triples_dataset.id)
        return None


# nsc.file_entries_dict[nsc.list_files()[0]]
# nsc.list_files()
# int(nsc.file_entries_dict["audio/004710178.wav"].artifact_name.replace("data_", ""))

# #Initialize
# git = dataset_git("datasets/test")

# # git.get_current_version_id()
# # git.get_parent()
# # git.get_root()

# #get local copy
# folder_path = git.get_latest_dataset("./data")
# train_file = os.path.join(folder_path, "news.jsonl")

# #Save to directory
# train_data = load_jsonl(train_file)[:5]
# to_jsonl(train_file, train_data)
# git.sync_folder2dataset("./data")
