
CREATE TABLE classes
  (
     class_name        VARCHAR(30) NOT NULL UNIQUE,
     class_desc VARCHAR(50) NOT NULL,
     CONSTRAINT classes_pk PRIMARY KEY (class_name)
  ); 


CREATE TABLE projects
(
          project_name      VARCHAR(1200) NOT NULL UNIQUE,
          annotator_code      VARCHAR(100) NOT NULL UNIQUE,
          CONSTRAINT projects_pk PRIMARY KEY (project_name)
          CONSTRAINT projects_fk1 FOREIGN KEY (annotator_code) REFERENCES documents(annotator_code),
);


CREATE TABLE annotators
(
          annotator_code      VARCHAR(100) NOT NULL UNIQUE,
          CONSTRAINT annotators_pk PRIMARY KEY (annotator_code)
);

