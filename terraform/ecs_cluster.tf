locals {
  ordered_placement_strategies = var.tf_env == "prd" ? [
    {
      "type"  = "spread"
      "field" = "attribute:ecs.availability-zone"
    },
    {
      "field" = "cpu"
      "type"  = "binpack"
    },
    ] : [
    {
      "field" = "cpu"
      "type"  = "binpack"
    },
  ]
}

data "aws_kms_key" "ebs" {
  key_id = "alias/aws/ebs"
}

data "aws_ami" "ecs_optimized" {
  owners      = ["amazon"]
  most_recent = true

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

resource "aws_ecs_cluster" "cluster" {
  name = "${var.project}-${var.tf_env}"
}

resource "aws_ecs_cluster_capacity_providers" "ecs_ci" {
  cluster_name = aws_ecs_cluster.cluster.name

  capacity_providers = [
    aws_ecs_capacity_provider.ecs_ci.name
  ]

  default_capacity_provider_strategy {
    base              = 0
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ecs_ci.name
  }
}

resource "aws_ecs_capacity_provider" "ecs_ci" {
  name = "${var.project}-${var.tf_env}"

  auto_scaling_group_provider {
    managed_termination_protection = "ENABLED"
    auto_scaling_group_arn         = aws_autoscaling_group.ecs_ci.arn

    managed_scaling {
      maximum_scaling_step_size = 2
      minimum_scaling_step_size = 1
      target_capacity           = 100
      instance_warmup_period    = 30
      status                    = "ENABLED"
    }
  }
}

resource "aws_launch_template" "ecs_ci" {
  name                   = "${var.project}-${var.tf_env}"
  instance_type          = "t3.small"
  image_id               = data.aws_ami.ecs_optimized.id
  vpc_security_group_ids = [aws_security_group.ecs_ci.id]

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = 30
      volume_type           = "gp3"
      delete_on_termination = true
      encrypted             = true
      kms_key_id            = data.aws_kms_key.ebs.arn
    }
  }

  iam_instance_profile {
    name = "ecsInstanceRole-profile"
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name    = "${var.project}-${var.tf_env}-ecs-ci"
      Project = var.project
      Env     = var.tf_env
    }
  }

  user_data = base64encode(
    <<EOT
#!/bin/bash
echo "ECS_CLUSTER=${var.project}-${var.tf_env}" >> /etc/ecs/ecs.config
EOT
  )
}

resource "aws_autoscaling_group" "ecs_ci" {
  name                  = "${var.project}-${var.tf_env}"
  max_size              = 24
  min_size              = var.tf_env == "prd" ? 3 : 1
  protect_from_scale_in = true
  vpc_zone_identifier   = module.vpc.private_subnets

  launch_template {
    id      = aws_launch_template.ecs_ci.id
    version = "$Latest"
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = true
    propagate_at_launch = true
  }
}

resource "aws_security_group" "ecs_ci" {
  name        = "${var.project}-${var.tf_env}-ecs-ci"
  description = "Allow access to ECS container instances. Managed by Terraform."
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

# External Load Balancer
resource "aws_lb" "cluster_external_lb" {
  name                       = "${var.project}-${var.tf_env}-external"
  internal                   = false
  load_balancer_type         = "application"
  subnets                    = module.vpc.public_subnets
  security_groups            = [aws_security_group.cluster_external_lb.id]
  enable_deletion_protection = true
}

resource "aws_lb_listener" "cluster_external_lb_https" {
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  load_balancer_arn = aws_lb.cluster_external_lb.arn
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      status_code  = "404"
    }
  }
}

resource "aws_security_group" "cluster_external_lb" {
  name        = "${var.project}-${var.tf_env}-external-lb"
  description = "Allow cluster access. Managed by Terraform."
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

resource "aws_security_group_rule" "cluster_external_lb_ingress" {
  type              = "ingress"
  to_port           = 443
  from_port         = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
  description       = "Allow cluster access from the internet. Managed by Terraform."
  security_group_id = aws_security_group.cluster_external_lb.id
}

output "cluster_external_lb_dns_name" {
  value = aws_lb.cluster_external_lb.dns_name
}

# Internal Load Balancer
resource "aws_lb" "cluster_internal_lb" {
  name                       = "${var.project}-${var.tf_env}-internal"
  internal                   = true
  load_balancer_type         = "application"
  subnets                    = module.vpc.public_subnets
  security_groups            = [aws_security_group.cluster_internal_lb.id]
  enable_deletion_protection = true
}

resource "aws_lb_listener" "cluster_internal_lb_https" {
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  load_balancer_arn = aws_lb.cluster_internal_lb.arn
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      status_code  = "404"
    }
  }
}

resource "aws_security_group" "cluster_internal_lb" {
  name        = "${var.project}-${var.tf_env}-internal-lb"
  description = "Allow internal cluster access. Managed by Terraform."
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

resource "aws_security_group_rule" "cluster_internal_lb_ingress" {
  type              = "ingress"
  to_port           = 443
  from_port         = 443
  protocol          = "tcp"
  cidr_blocks       = [var.vpc_cidr]
  description       = "Allow internal cluster access from VPC. Managed by Terraform."
  security_group_id = aws_security_group.cluster_internal_lb.id
}

output "cluster_internal_lb_dns_name" {
  value = aws_lb.cluster_internal_lb.dns_name
}
