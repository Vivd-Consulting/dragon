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

resource "aws_ecs_service" "api" {
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-api"

  cluster         = aws_ecs_cluster.cluster[0].arn
  task_definition = aws_ecs_task_definition.api[0].arn_without_revision
  desired_count   = 1
  propagate_tags  = "SERVICE"

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  health_check_grace_period_seconds  = 30

  capacity_provider_strategy {
    base              = 0
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.ecs_ci[0].name
  }

  dynamic "ordered_placement_strategy" {
    for_each = local.ordered_placement_strategies
    content {
      type  = ordered_placement_strategy.value["type"]
      field = ordered_placement_strategy.value["field"]
    }
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8080
    target_group_arn = aws_lb_target_group.api[0].arn
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8080
    target_group_arn = aws_lb_target_group.api_internal[0].arn
  }

  load_balancer {
    container_name   = "api"
    container_port   = 8081
    target_group_arn = aws_lb_target_group.apollo[0].arn
  }

  network_configuration {
    subnets         = module.vpc[0].private_subnets
    security_groups = [aws_security_group.api_ecs[0].id]
  }

  lifecycle {
    ignore_changes = [
      desired_count
    ]
  }
}

data "aws_ecs_container_definition" "api" {
  count           = var.tf_env != "local" && var.bootstrap == false ? 1 : 0
  task_definition = "${var.project}-${var.tf_env}-api"
  container_name  = "api"
}

locals {
  current_api_image  = var.bootstrap == false && var.tf_env != "local" ? split(":", data.aws_ecs_container_definition.api[0].image)[1] : "latest"
  api_repository_url = var.tf_env == "prd" ? data.aws_ecr_repository.api[0].repository_url : var.tf_env == "stg" ? aws_ecr_repository.api[0].repository_url : ""
}

resource "aws_ecs_task_definition" "api" {
  count         = var.tf_env != "local" ? 1 : 0
  family        = "${var.project}-${var.tf_env}-api"
  task_role_arn = aws_iam_role.api_service[0].arn
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
            awslogs-region        = data.aws_region.current[0].name
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
            value = data.aws_region.current[0].name
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
            name  = "USER_ROLE_ID"
            value = var.api_auth0_user_role_id
          },
          {
            name  = "DATABASE_URL"
            value = "postgres://${module.database[0].db_instance_username}:${var.db_master_password}@${module.database[0].db_instance_endpoint}/${module.database[0].db_instance_name}"
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
            name  = "FB_APP_ID"
            value = var.api_fb_app_id
          },
          {
            name  = "FB_APP_SECRET"
            value = var.api_fb_app_secret
          },
          {
            name  = "ADMIN_BM"
            value = var.api_fb_admin_bm
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
  count       = var.tf_env != "local" ? 1 : 0
  name        = "${var.project}-${var.tf_env}-api-ecs"
  description = "Allow access to API containers. Managed by Terraform."
  vpc_id      = module.vpc[0].vpc_id

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
  count                    = var.tf_env != "local" ? 1 : 0
  type                     = "ingress"
  to_port                  = 8080
  from_port                = 8080
  protocol                 = "tcp"
  description              = "Allow access to API from the external cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs[0].id
  source_security_group_id = aws_security_group.cluster_external_lb[0].id
}

resource "aws_security_group_rule" "api_ecs_lb_internal" {
  count                    = var.tf_env != "local" ? 1 : 0
  type                     = "ingress"
  to_port                  = 8080
  from_port                = 8080
  protocol                 = "tcp"
  description              = "Allow access to API from the internal cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs[0].id
  source_security_group_id = aws_security_group.cluster_internal_lb[0].id
}

resource "aws_security_group_rule" "apollo_ecs_lb" {
  count                    = var.tf_env != "local" ? 1 : 0
  type                     = "ingress"
  to_port                  = 8081
  from_port                = 8081
  protocol                 = "tcp"
  description              = "Allow access to Apollo from the internal cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.api_ecs[0].id
  source_security_group_id = aws_security_group.cluster_internal_lb[0].id
}

resource "aws_lb_target_group" "api" {
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-api"

  port                 = "8080"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc[0].vpc_id

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
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-api-internal"

  port                 = "8080"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc[0].vpc_id

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
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-apollo"

  port                 = "8081"
  protocol             = "HTTP"
  protocol_version     = "HTTP1"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc[0].vpc_id

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
  count        = var.tf_env != "local" ? 1 : 0
  listener_arn = aws_lb_listener.cluster_external_lb_https[0].arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api[0].arn
  }

  condition {
    host_header {
      values = ["api.${var.domain}"]
    }
  }
}

resource "aws_lb_listener_rule" "api_internal" {
  count        = var.tf_env != "local" ? 1 : 0
  listener_arn = aws_lb_listener.cluster_internal_lb_https[0].arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_internal[0].arn
  }

  condition {
    host_header {
      values = ["api.${var.domain}"]
    }
  }
}

resource "aws_lb_listener_rule" "apollo" {
  count        = var.tf_env != "local" ? 1 : 0
  listener_arn = aws_lb_listener.cluster_internal_lb_https[0].arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.apollo[0].arn
  }

  condition {
    host_header {
      values = ["apollo.${var.domain}"]
    }
  }
}

# Service autoscaling.
resource "aws_appautoscaling_target" "api" {
  count              = var.tf_env != "local" ? 1 : 0
  min_capacity       = var.tf_env == "prd" ? 2 : 1
  max_capacity       = 4
  resource_id        = "service/${aws_ecs_cluster.cluster[0].name}/${aws_ecs_service.api[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api" {
  count              = var.tf_env != "local" ? 1 : 0
  name               = "${var.project}-${var.tf_env}-api"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api[0].resource_id
  scalable_dimension = aws_appautoscaling_target.api[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.api[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value      = 70
    scale_in_cooldown = 300
  }
}
