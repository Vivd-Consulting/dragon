resource "aws_ecs_service" "api" {
  name            = "${var.project}-${var.tf_env}-api"
  cluster         = aws_ecs_cluster.cluster.arn
  task_definition = aws_ecs_task_definition.api.arn_without_revision
  desired_count   = 1
  propagate_tags  = "SERVICE"

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  health_check_grace_period_seconds  = 30

  capacity_provider_strategy {
    base              = 0
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ecs_ci.name
  }

  ordered_placement_strategy {
    field = "cpu"
    type  = "binpack"
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8080
    target_group_arn = aws_lb_target_group.api.arn
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8080
    target_group_arn = aws_lb_target_group.api_internal.arn
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8081
    target_group_arn = aws_lb_target_group.apollo.arn
  }

  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.api_ecs.id]
  }

  lifecycle {
    ignore_changes = [
      desired_count
    ]
  }
}

data "aws_ecs_container_definition" "api" {
  count           = var.bootstrap == false ? 1 : 0
  task_definition = "${var.project}-${var.tf_env}-api"
  container_name  = "api"
}

locals {
  current_api_image  = var.bootstrap == false ? split(":", data.aws_ecs_container_definition.api[0].image)[1] : "latest"
  api_repository_url = aws_ecr_repository.api[0].repository_url
}

resource "aws_ecs_task_definition" "api" {
  family        = "${var.project}-${var.tf_env}-api"
  task_role_arn = aws_iam_role.api_service.arn
  network_mode  = "awsvpc"

  container_definitions = jsonencode(
    [
      {
        name      = "api"
        image     = "${local.api_repository_url}:${local.current_api_image}"
        cpu       = 2048
        memory    = 512
        essential = true
        portMappings = [
          {
            containerPort = 8080
          },
          {
            containerPort = 8081
          }
        ]
        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-region        = data.aws_region.current.name
            awslogs-create-group  = "true"
            awslogs-group         = "ecs/${var.project}-${var.tf_env}-api"
            awslogs-stream-prefix = "${var.project}-${var.tf_env}-api"
          }
        }
        healthCheck = {
          retries     = 3
          command     = ["CMD-SHELL", "wget -qO /dev/null http://localhost:8080/status || exit 1"]
          timeout     = 5
          interval    = 10
          startPeriod = 30
        }
        environment = [
          {
            name  = "AWS_REGION"
            value = data.aws_region.current.name
          },
          {
            name  = "S3_BUCKET"
            value = aws_s3_bucket.api_media.id
          },
          {
            name  = "SES_SENDER"
            value = var.api_ses_sender_address
          },
          {
            name  = "SES_RECEIVER"
            value = var.api_ses_receiver_address
          },
          {
            name  = "REDIRECT_URL"
            value = "https://api.${var.domain}"
          },
          {
            name  = "AUTH0_CLIENT"
            value = var.api_auth0_client
          },
          {
            name  = "AUTH0_CLIENT_SECRET"
            value = var.api_auth0_client_secret
          },
          {
            name  = "AUTH0_AUD"
            value = var.api_auth0_audience
          },
          {
            name  = "AUTH0_URI"
            value = var.api_auth0_uri
          },
          {
            name  = "ADMIN_ROLE_ID"
            value = var.api_auth0_admin_role_id
          },
          {
            name  = "CLIENT_ROLE_ID"
            value = var.api_auth0_client_role_id
          },
          {
            name  = "CONTRACTOR_ROLE_ID"
            value = var.api_auth0_contractor_role_id
          },
          {
            name  = "DATABASE_URL"
            value = "postgres://${module.database.db_instance_username}:${var.db_master_password}@${module.database.db_instance_endpoint}/${module.database.db_instance_name}"
          },
          {
            name  = "HASURA_GRAPHQL_ADMIN_SECRET"
            value = var.hasura_admin_secret
          },
          {
            name  = "ACTION_SECRET"
            value = var.api_action_secret
          },
          {
            name  = "PLAID_CLIENT_ID"
            value = var.api_plaid_client_id
          },
          {
            name  = "PLAID_SECRET"
            value = var.api_plaid_secret
          },
          {
            name  = "PLAID_ENV"
            value = var.api_plaid_env
          },
          {
            name  = "PORT"
            value = "8080"
          },
          {
            name  = "APOLLO_PORT"
            value = "8081"
          }
        ]
      }
    ]
  )
}

resource "aws_security_group" "api_ecs" {
  name        = "${var.project}-${var.tf_env}-api-ecs"
  description = "Allow access to API containers. Managed by Terraform."
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

resource "aws_security_group_rule" "api_ecs_lb" {
  type                     = "ingress"
  to_port                  = 8080
  from_port                = 8080
  protocol                 = "tcp"
  description              = "Allow access to API from the external cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs.id
  source_security_group_id = aws_security_group.cluster_external_lb.id
}

resource "aws_security_group_rule" "api_ecs_lb_internal" {
  type                     = "ingress"
  to_port                  = 8080
  from_port                = 8080
  protocol                 = "tcp"
  description              = "Allow access to API from the internal cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs.id
  source_security_group_id = aws_security_group.cluster_internal_lb.id
}

resource "aws_security_group_rule" "apollo_ecs_lb" {
  type                     = "ingress"
  to_port                  = 8081
  from_port                = 8081
  protocol                 = "tcp"
  description              = "Allow access to Apollo from the internal cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs.id
  source_security_group_id = aws_security_group.cluster_internal_lb.id
}

resource "aws_lb_target_group" "api" {
  name                 = "${var.project}-${var.tf_env}-api"
  port                 = "8080"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc.vpc_id

  health_check {
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
    path                = "/status"
  }
}

resource "aws_lb_target_group" "api_internal" {
  name                 = "${var.project}-${var.tf_env}-api-internal"
  port                 = "8080"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc.vpc_id

  health_check {
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
    path                = "/status"
  }
}

resource "aws_lb_target_group" "apollo" {
  name                 = "${var.project}-${var.tf_env}-apollo"
  port                 = "8081"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc.vpc_id

  health_check {
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200"
    path                = "/status"
    port                = 8080
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.cluster_external_lb_https.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    host_header {
      values = ["api.${var.domain}"]
    }
  }
}

resource "aws_lb_listener_rule" "api_internal" {
  listener_arn = aws_lb_listener.cluster_internal_lb_https.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_internal.arn
  }

  condition {
    host_header {
      values = ["api.${var.domain}"]
    }
  }
}

resource "aws_lb_listener_rule" "apollo" {
  listener_arn = aws_lb_listener.cluster_internal_lb_https.arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.apollo.arn
  }

  condition {
    host_header {
      values = ["apollo.${var.domain}"]
    }
  }
}

# Service autoscaling.
resource "aws_appautoscaling_target" "api" {
  min_capacity       = 1
  max_capacity       = 4
  resource_id        = "service/${aws_ecs_cluster.cluster.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api" {
  name               = "${var.project}-${var.tf_env}-api"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value      = 70
    scale_in_cooldown = 300
  }
}
