data "aws_kms_key" "rds" {
  key_id = "alias/aws/rds"
}

module "database" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.1.1"

  identifier     = "${var.project}-${var.tf_env}"
  instance_class = "db.t4g.small"
  engine         = "postgres"
  engine_version = "15.4"
  family         = "postgres15"

  storage_type          = "gp3"
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  kms_key_id            = data.aws_kms_key.rds.arn

  username = "postgres"
  password = var.db_master_password
  db_name  = replace(var.project, "-", "")
  port     = 5432

  manage_master_user_password = false

  maintenance_window      = "Sun:08:00-Sun:09:00"
  backup_window           = "09:00-10:00"
  backup_retention_period = var.tf_env == "prd" ? 14 : 7
  apply_immediately       = true

  multi_az               = false
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.database.id]

  # Required for access from Vercel.
  publicly_accessible = true

  parameters = [
    {
      name  = "rds.force_ssl"
      value = "0"
    }
  ]

  deletion_protection = true
}

resource "aws_security_group" "database" {
  name        = "${var.project}-${var.tf_env}-database"
  description = "Allow database access. Managed by Terraform."
  vpc_id      = module.vpc.vpc_id

  egress = [
    {
      description      = "Egress"
      from_port        = 0
      to_port          = 0
      protocol         = "-1"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = ["::/0"]
      prefix_list_ids  = []
      security_groups  = []
      self             = false
    }
  ]
}

resource "aws_security_group_rule" "database_public_access" {
  type              = "ingress"
  to_port           = 5432
  from_port         = 5432
  protocol          = "tcp"
  description       = "Allow database access from the internet."
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
  security_group_id = aws_security_group.database.id
}

output "database_address" {
  value = module.database.db_instance_address
}
