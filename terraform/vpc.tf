module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "${var.project}-${var.tf_env}"
  cidr = var.vpc_cidr

  azs              = var.vpc_azs
  private_subnets  = var.vpc_private_subnets
  public_subnets   = var.vpc_public_subnets
  database_subnets = var.vpc_database_subnets

  create_database_subnet_route_table     = true
  create_database_internet_gateway_route = true

  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
}
