# DevOps

## Prerequisites

You will need an AWS account, and the credentials should be configured in the AWS CLI.

```bash
pip3 install --user awscli
aws configure --profile ag
```

You will also need to install terraform locally:

- https://learn.hashicorp.com/terraform/getting-started/install

You will need an SSH client, an SSH keypair in EC2 and locally, and loaded to your ssh agent.

Update all of the variables in [variables.tf](ops\terra\modules\paint_cluster\variables.tf)

Create a star certificate in AWS Certificate Manager, ex "*.multiplayerpaint.com"

Manually create a Service-Linked Role for AutoScaling (or create an EC2 Auto Scaling Group to auto-generate the role)

Manually create an IAM Role named "tf_iam_role" with EC2 Read-Only Access

## Deployment

Initialize the terraform cluster:

```bash
cd ops/terra/
terraform init
terraform apply
```

Once the terraform cluster has been deployed, check the website to make sure it's up

## Teardown

To delete all AWS infrastructure, type this:

```bash
cd ops/terra
terraform destroy
```

This does leave the manually configured resources lingering, though they do not cost money to persist.
You will need to manually tear down the resources in the "Prerequisites" section.

## Design

The terraform template sets up 
