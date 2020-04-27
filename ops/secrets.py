#!/usr/bin/env python3
import json
import os

import arrow
import boto3
import base64

import botocore
from botocore.exceptions import ClientError
from os.path import dirname, join

from argparse import ArgumentParser
from jinja2 import Template

TFSTATE_PATH = join(dirname(__file__), 'terra', 'terraform.tfstate')
ENV_PATH = join(dirname(dirname(__file__)), '.env')
ENV_TEMPLATE_PATH = join(dirname(dirname(__file__)), '.env.template.j2')

region_name = "us-west-2"

# Create a Secrets Manager client
session = boto3.session.Session()
client = session.client(
    service_name='secretsmanager',
    region_name=region_name
)


def load_env_app_key():
    with open(ENV_PATH) as env_file:
        for line in env_file:
            if line.startswith("APP_KEY"):
                return line[8:].strip()
    raise Exception("APP_KEY not found in env file")



def load_local_secrets():
    secret = {
        "username": "homestead",
        "engine": "mariadb",
    }
    secret_name = ""
    with open(TFSTATE_PATH) as tfstate_file:
        tfstate = json.load(tfstate_file)
        for resource in tfstate['resources']:
            if resource["name"] == "tf_rds_homestead_pass":
                secret['password'] = resource['instances'][0]['attributes']['result']
            elif resource['name'] == 'tf_rds_instance':
                secret['host'] = resource['instances'][0]['attributes']['address']
                secret['port'] = resource['instances'][0]['attributes']['port']
                secret['dbInstanceIdentifier'] = resource['instances'][0]['attributes']['identifier']
                name_prefix = "-".join(secret['dbInstanceIdentifier'].split('-')[0:2])
                secret_name = f"{name_prefix}-db-secret"
    for required_param in ["password", "host", "port", "dbInstanceIdentifier"]:
        if required_param not in secret:
            raise Exception(f"Could not find {required_param} in tfstate")
    if secret_name == "":
        raise Exception("Could not find name prefix for secret name")
    secret['app_key'] = load_env_app_key()
    return secret_name, secret


def create_secret(secret_name, secret):
    secret_string = json.dumps(secret)
    try:
        response = client.create_secret(
            Name=secret_name,
            SecretString=secret_string,
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceExistsException':
            response = client.update_secret(
                SecretId=secret_name,
                SecretString=secret_string
            )
        else:
            raise e
    return response


def get_secret(secret_name):
    # In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
    # See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    # We rethrow the exception by default.

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        if e.response['Error']['Code'] == 'DecryptionFailureException':
            # Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InternalServiceErrorException':
            # An error occurred on the server side.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            # You provided an invalid value for a parameter.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            # You provided a parameter value that is not valid for the current state of the resource.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
        elif e.response['Error']['Code'] == 'ResourceNotFoundException':
            # We can't find the resource that you asked for.
            # Deal with the exception here, and/or rethrow at your discretion.
            raise e
    else:
        # Decrypts secret using the associated KMS CMK.
        # Depending on whether the secret is a string or binary, one of these fields will be populated.
        if 'SecretString' in get_secret_value_response:
            secret_string = get_secret_value_response['SecretString']
            secret = json.loads(secret_string)
            return secret


def template_env(sm_secrets):
    timestamp = arrow.get().format("YYYY-MM-DD_HH-mm-ss")
    backup_path = ENV_PATH + ".backup-" + timestamp
    os.rename(ENV_PATH, backup_path)
    with open(ENV_PATH, 'w') as env_file:
        with open(ENV_TEMPLATE_PATH) as env_template_file:
            template = Template(env_template_file.read())
            env_file_content = template.render(secrets=sm_secrets)
            env_file.write(env_file_content)


def main():
    parser = ArgumentParser(usage="Work with AWS Secret Manager for templating env files")
    parser.add_argument('--refresh', help="Refreshes the secrets, based on the tfstate file", action="store_true")
    parser.add_argument('--show', help="Shows the secrets, from AWS Secret Manager", action="store_true")
    parser.add_argument('--template-env', help="Templates the .env file from the secrets", action="store_true")
    args = parser.parse_args()
    secret_name, tf_secrets = load_local_secrets()
    if args.refresh:
        create_secret(secret_name, tf_secrets)
    sm_secrets = get_secret(secret_name)
    if args.show:
        print(sm_secrets)
        print(f"""
            -- Create user for the first time
            CREATE USER 'homestead'@'%' IDENTIFIED BY '{sm_secrets["password"]}';
            GRANT USAGE ON *.* TO 'homestead'@'%' REQUIRE NONE
              WITH MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0;
            CREATE DATABASE IF NOT EXISTS `homestead`;
            GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, PROCESS, REFERENCES, INDEX, ALTER, SHOW DATABASES, 
              CREATE TEMPORARY TABLES, LOCK TABLES, EXECUTE, REPLICATION SLAVE, REPLICATION CLIENT, CREATE VIEW, SHOW VIEW, 
              CREATE ROUTINE, ALTER ROUTINE, CREATE USER, EVENT, TRIGGER 
              ON *.* TO 'homestead'@'%';
            
            -- Change password
            ALTER USER 'homestead'@'%' IDENTIFIED BY '{sm_secrets["password"]}';
        """)
    if args.template_env:
        template_env(sm_secrets)


if __name__ == '__main__':
    main()

# open(dirna)
# {"username":"homestead","password":"kqP19y09qCju7i8n","engine":"mariadb","host":"tf-4-mpdb01.c0igugvvgdom.us-west-2.rds.amazonaws.com","port":3306,"dbInstanceIdentifier":"tf-4-mpdb01"}
