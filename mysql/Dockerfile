FROM ubuntu:latest

FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD xxxx

ENV MYSQL_DATABASE annotator

ENV MYSQL_USER user1

ENV MYSQL_PASSWORD 1234

ADD script.sql /docker-entrypoint-initdb.d

EXPOSE 3306

