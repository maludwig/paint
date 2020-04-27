
locals {
  # Common tags to be assigned to all resources
  name_prefix = "tf_${var.idx}"

  common_tags = {
    Idx = var.idx
    Provider = "terraform"
    Owner   = "mitchell"
  }
  cidr_prefix = "10.1"
  cidr_vpc = "${local.cidr_prefix}.0.0/16"
  cidr_subnet = "${local.cidr_prefix}.${var.idx}.0/24"

  vpc_name = "tf_vpc_1"
  subnet_name = "${local.name_prefix}_subnet"

  bucket_name = "multiplayerpaint-tf-logs"
  alb_log_prefix = "alb-logs"
}

resource "aws_vpc" "tf_vpc" {
  cidr_block           = local.cidr_vpc
  enable_dns_hostnames = true
  tags = merge(local.common_tags, map("Name",local.vpc_name))
}


resource "aws_subnet" "tf_subnet_a" {
  vpc_id                  = aws_vpc.tf_vpc.id
  cidr_block              = "10.1.${var.idx + 10}.0/24"
  map_public_ip_on_launch = true
  availability_zone = "us-west-2a"
  tags = merge(local.common_tags, map("Name",local.subnet_name))
}

resource "aws_subnet" "tf_subnet_b" {
  vpc_id                  = aws_vpc.tf_vpc.id
  cidr_block              = "10.1.${var.idx}.0/24"
  map_public_ip_on_launch = true
  availability_zone = "us-west-2b"
  tags = merge(local.common_tags, map("Name",local.subnet_name))
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.tf_vpc.id
  tags = merge(local.common_tags, map("Name","tf_test_ig"))
}

resource "aws_route_table" "r" {
  vpc_id = aws_vpc.tf_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = merge(local.common_tags, map("Name","tf_route_table"))
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.tf_subnet_a.id
  route_table_id = aws_route_table.r.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.tf_subnet_b.id
  route_table_id = aws_route_table.r.id
}

# Bastion host security group to access
# sebastion over SSH
resource "aws_security_group" "tf_bastion_sg" {
  name        = "tf_bastion_sg"
  description = "Used in the terraform bastion host"
  vpc_id      = aws_vpc.tf_vpc.id

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = merge(local.common_tags, map("Name","tf_bastion_sg"))
}

resource "aws_instance" "tf_sebastion" {
  ami           = lookup(var.aws_amis, var.aws_region)
  instance_type = "t2.micro"
  iam_instance_profile = "tf_iam_role"
  instance_initiated_shutdown_behavior = "stop"
  root_block_device {
    volume_size           = 8
    volume_type           = "gp2"
    delete_on_termination = true
  }
  vpc_security_group_ids = [aws_security_group.tf_bastion_sg.id]
  subnet_id = aws_subnet.tf_subnet_a.id
  tags = merge(local.common_tags, map("Name","tf_sebastion"))
  user_data = base64encode(file("${path.module}/userdata_sebastion.sh"))
  key_name = var.key_name
}

# Our default security group to access
# the webserver instances over SSH and HTTP
resource "aws_security_group" "tf_webserver_sg" {
  name        = "tf_webserver_sg"
  description = "Used in the terraform webservers"
  vpc_id      = aws_vpc.tf_vpc.id

  # SSH access from anywhere
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = merge(local.common_tags, map("Name","tf_webserver_sg"))

}

# Our RDS security group to access
# MySQL from the webservers and sebastion
resource "aws_security_group" "tf_rds_sg" {
  name        = "tf_rds_sg"
  description = "Used in the terraform RDS instance"
  vpc_id      = aws_vpc.tf_vpc.id

  # MySQL from the webservers and sebastion
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.tf_webserver_sg.id, aws_security_group.tf_bastion_sg.id]
  }

  # MySQL to the webservers and sebastion
  egress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    security_groups = [aws_security_group.tf_webserver_sg.id, aws_security_group.tf_bastion_sg.id]
  }
  tags = merge(local.common_tags, map("Name","tf_rds_sg"))

}

# Our elb security group to access
# the ELB over HTTP
resource "aws_security_group" "tf_elb_sg" {
  name        = "tf_elb_sg"
  description = "Used by the terraform ELB"

  vpc_id = aws_vpc.tf_vpc.id

  # HTTP access from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # HTTPS access from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
  # outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  # ensure the VPC has an Internet gateway or this step will fail
  depends_on = [aws_internet_gateway.gw]
  tags = merge(local.common_tags, map("Name","tf_elb_sg"))

}

resource "aws_s3_bucket" "tf_logs" {
  bucket = local.bucket_name
  acl    = "private"
  tags = merge(local.common_tags, map("Name","tf-logs"))
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_policy" "tf_logs_policy" {
  bucket = aws_s3_bucket.tf_logs.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::${var.elb_account_id}:root"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${local.bucket_name}/${local.alb_log_prefix}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "delivery.logs.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${local.bucket_name}/${local.alb_log_prefix}/AWSLogs/${data.aws_caller_identity.current.account_id}/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "bucket-owner-full-control"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "delivery.logs.amazonaws.com"
      },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::${local.bucket_name}"
    }
  ]
}
POLICY
}

resource "aws_launch_template" "tf_launch_template" {
  name = "tf_launch_template"

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size = 8
    }
  }

  iam_instance_profile {
    name = "tf_iam_role"
  }

  image_id = lookup(var.aws_amis, var.aws_region)

  instance_initiated_shutdown_behavior = "terminate"

  instance_type = "t2.micro"

  key_name = var.key_name

  vpc_security_group_ids = [aws_security_group.tf_webserver_sg.id]

  tag_specifications {
    resource_type = "instance"

    tags = merge(local.common_tags, map("Name","tf_instance"))

  }

  user_data = base64encode(file("${path.module}/userdata_web.sh"))
}


resource "aws_lb_target_group" "tf_alb_tg" {
  name = "tf-alb-tg"
  deregistration_delay = 300
  health_check {
    healthy_threshold = 5
    interval = 30
    matcher = 200
    path = "/"
    port = "traffic-port"
    protocol = "HTTP"
    timeout = 5
    unhealthy_threshold = 2
  }
  port = 80
  protocol = "HTTP"
  slow_start = 0
  stickiness {
    cookie_duration = 86400
    enabled = false
    type = "lb_cookie"
  }
  target_type = "instance"
  vpc_id = aws_vpc.tf_vpc.id
  tags = merge(local.common_tags, map("Name","tf-alb-tg"))
}

resource "aws_autoscaling_group" "tf_asg" {
  name = "tf-asg"

  max_size = 1
  min_size = 1
  availability_zones = [ aws_subnet.tf_subnet_a.availability_zone, aws_subnet.tf_subnet_b.availability_zone ]
  default_cooldown = 300
  desired_capacity = 1
  health_check_grace_period = 300
  health_check_type = "EC2"
  launch_template {
    id = aws_launch_template.tf_launch_template.id
    version = "$Latest"
  }
  service_linked_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/autoscaling.amazonaws.com/AWSServiceRoleForAutoScaling"
  target_group_arns = [aws_lb_target_group.tf_alb_tg.arn]
  vpc_zone_identifier = [aws_subnet.tf_subnet_a.id, aws_subnet.tf_subnet_b.id]
  termination_policies = ["OldestInstance"]
//  tags = "${merge(local.common_tags, map("Name","tf-asg"))}"

}

resource "aws_lb" "tf_alb" {
  name               = "tf-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.tf_elb_sg.id]
  subnets = [aws_subnet.tf_subnet_a.id, aws_subnet.tf_subnet_b.id]
  access_logs {
    bucket  = aws_s3_bucket.tf_logs.bucket
    prefix  = local.alb_log_prefix
    enabled = true
  }
  idle_timeout                = 400
  tags = merge(local.common_tags, map("Name","tf-alb"))
}

data "aws_acm_certificate" "tf_certificate" {
  domain      = "*.${var.domain_name}"
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

resource "aws_lb_listener" "tf_alb_listener" {
  load_balancer_arn = aws_lb.tf_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.tf_certificate.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tf_alb_tg.arn
  }
}


resource "aws_route53_record" "tf_alb_dns_record" {
  zone_id = var.zone_id
  name = "${var.domain_prefix}.${var.domain_name}"
  alias {
    evaluate_target_health = false
    name = aws_lb.tf_alb.dns_name
    zone_id = aws_lb.tf_alb.zone_id
  }
  type = "A"
}


resource "aws_route53_record" "tf_site_dns_record" {
  zone_id = var.zone_id
  name = var.domain_name
  alias {
    evaluate_target_health = false
    name = aws_lb.tf_alb.dns_name
    zone_id = aws_lb.tf_alb.zone_id
  }
  type = "A"
}

resource "random_string" "tf_rds_pass" {
  length = 20
  special = false
}

resource "random_string" "tf_rds_homestead_pass" {
  length = 20
  special = false
}

resource "aws_db_subnet_group" "tf_rds_subnet_group" {
  name       = "tf_rds_subnet_group"
  subnet_ids = [aws_subnet.tf_subnet_a.id, aws_subnet.tf_subnet_b.id]

  tags = merge(local.common_tags, map("Name","tf_rds_subnet_group"))
}

resource "aws_db_instance" "tf_rds_instance" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "mariadb"
  engine_version       = "10.4.8"
  instance_class       = "db.t2.micro"
  identifier           = "tf-${var.idx}-mpdb01"
  username             = "mpadmin"
  password             = random_string.tf_rds_pass.result
  parameter_group_name = "default.mariadb10.4"
  vpc_security_group_ids = [aws_security_group.tf_rds_sg.id]
  db_subnet_group_name = aws_db_subnet_group.tf_rds_subnet_group.name
  final_snapshot_identifier = "tf-${var.idx}-mpdb01-final"
}
