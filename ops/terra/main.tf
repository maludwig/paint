
provider "aws" {
  region = var.aws_region
}

module "paint_cluster" {
  source = "./modules/paint_cluster"
  idx = 4
}

