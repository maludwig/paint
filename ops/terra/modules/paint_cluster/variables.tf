variable "key_name" {
  description = "Name of the SSH keypair to use in AWS."
  default = "turiy-2020-04-25"
}
variable "idx" {
  description = "Unique name common to the resource set"
  default = "1"
}

variable "aws_region" {
  description = "AWS region to launch servers."
  default     = "us-west-2"
}

# Amazon Linux 2 AMI (x64)
variable "aws_amis" {
  type = map(string)
  default = {
    "us-west-2" = "ami-0d6621c01e8c2de2c"
  }
}

variable "domain_name" {
  description = "Primary domain name"
  default     = "multiplayerpaint.com"
}

variable "domain_prefix" {
  description = "Domain name prefix"
  default     = "learnterra"
}


variable "zone_id" {
  description = "AWS Route53 Zone ID"
  default     = "Z0180389UO5425CVO2A4"
}

variable "elb_account_id" {
  description = "ELB Account ID, see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html"
  default     = "797873946194"
}
