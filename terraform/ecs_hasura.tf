resource "aws_ecs_service" "hasura" {
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-hasura"

  cluster         = aws_ecs_cluster.cluster[0].arn
  task_definition = aws_ecs_task_definition.hasura[0].arn_without_revision
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

  ordered_placement_strategy {
    type  = "binpack"
    field = "cpu"
  }

  load_balancer {
    container_name   = "hasura"
    container_port   = 8080
    target_group_arn = aws_lb_target_group.hasura[0].arn
  }

  network_configuration {
    subnets         = module.vpc[0].private_subnets
    security_groups = [aws_security_group.hasura_ecs[0].id]
  }

  lifecycle {
    ignore_changes = [
      desired_count
    ]
  }
}

data "aws_ecs_container_definition" "hasura" {
  count           = var.tf_env != "local" && var.bootstrap == false ? 1 : 0
  task_definition = "${var.project}-${var.tf_env}-hasura"
  container_name  = "hasura"
}

locals {
  current_hasura_image  = var.bootstrap == false && var.tf_env != "local" ? split(":", data.aws_ecs_container_definition.hasura[0].image)[1] : "latest"
  hasura_repository_url = var.tf_env == "prd" ? data.aws_ecr_repository.hasura[0].repository_url : var.tf_env == "stg" ? aws_ecr_repository.hasura[0].repository_url : ""
}
resource "aws_ecs_task_definition" "hasura" {
  count        = var.tf_env != "local" ? 1 : 0
  family       = "${var.project}-${var.tf_env}-hasura"
  network_mode = "awsvpc"

  container_definitions = jsonencode(
    [
      {
        name      = "hasura"
        image     = "${local.hasura_repository_url}:${local.current_hasura_image}"
        cpu       = 1024
        memory    = 1024
        essential = true
        portMappings = [
          {
            containerPort = 8080
          }
        ]
        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-region        = data.aws_region.current[0].name
            awslogs-create-group  = "true"
            awslogs-group         = "ecs/${var.project}-${var.tf_env}-hasura"
            awslogs-stream-prefix = "${var.project}-${var.tf_env}-hasura"
          }
        }
        healthCheck = {
          retries     = 3
          command     = ["CMD-SHELL", "curl -f http://localhost:8080/healthz || exit 1"]
          timeout     = 5
          interval    = 10
          startPeriod = 30
        }
        environment = [
          {
            name  = "HASURA_GRAPHQL_SERVER_PORT"
            value = "8080"
          },
          {
            name  = "HASURA_GRAPHQL_DATABASE_URL"
            value = "postgres://${module.database[0].db_instance_username}:${var.db_master_password}@${module.database[0].db_instance_endpoint}/${module.database[0].db_instance_name}"
          },
          {
            name  = "HASURA_GRAPHQL_METADATA_DATABASE_URL"
            value = "postgres://${module.database[0].db_instance_username}:${var.db_master_password}@${module.database[0].db_instance_endpoint}/${module.database[0].db_instance_name}"
          },
          {
            name  = "HASURA_GRAPHQL_ENABLE_CONSOLE"
            value = "false"
          },
          {
            name  = "HASURA_GRAPHQL_ENABLED_APIS"
            value = "graphql, metadata, config"
          },
          {
            name  = "HASURA_GRAPHQL_DEV_MODE"
            value = "false"
          },
          {
            name  = "HASURA_GRAPHQL_ENABLED_LOG_TYPES"
            value = "startup, http-log, webhook-log, websocket-log, query-log"
          },
          {
            name  = "HASURA_GRAPHQL_ADMIN_SECRET"
            value = var.hasura_admin_secret
          },
          {
            name  = "HASURA_GRAPHQL_JWT_SECRET"
            value = var.hasura_jwt_secret
          },
          {
            name  = "REMOTE_SCHEMA"
            value = "https://apollo.${var.domain}"
          },
          {
            name  = "ACTION_API"
            value = "https://api.${var.domain}"
          },
          {
            name  = "ACTION_SECRET"
            value = var.api_action_secret
          }
        ]
      }
    ]
  )
}

resource "aws_security_group" "hasura_ecs" {
  count       = var.tf_env != "local" ? 1 : 0
  name        = "${var.project}-${var.tf_env}-hasura-ecs"
  description = "Allow access to Hasura containers. Managed by Terraform."
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

resource "aws_security_group_rule" "hasura_ecs_lb" {
  count                    = var.tf_env != "local" ? 1 : 0
  type                     = "ingress"
  to_port                  = 8080
  from_port                = 8080
  protocol                 = "tcp"
  description              = "Allow access to Hasura from the cluster lb. Managed by Terraform."
  security_group_id        = aws_security_group.hasura_ecs[0].id
  source_security_group_id = aws_security_group.cluster_external_lb[0].id
}

resource "aws_lb_target_group" "hasura" {
  count = var.tf_env != "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-hasura"

  port                 = "8080"
  protocol             = "HTTP"
  protocol_version     = "HTTP2"
  target_type          = "ip"
  deregistration_delay = 60
  vpc_id               = module.vpc[0].vpc_id

  health_check {
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = 200
    path                = "/healthz"
  }
}

resource "aws_lb_listener_rule" "hasura" {
  count        = var.tf_env != "local" ? 1 : 0
  listener_arn = aws_lb_listener.cluster_external_lb_https[0].arn

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.hasura[0].arn
  }

  condition {
    host_header {
      values = ["backend.${var.domain}"]
    }
  }
}

# Service autoscaling.
resource "aws_appautoscaling_target" "hasura" {
  count              = var.tf_env != "local" ? 1 : 0
  min_capacity       = var.tf_env == "prd" ? 2 : 1
  max_capacity       = 4
  resource_id        = "service/${aws_ecs_cluster.cluster[0].name}/${aws_ecs_service.hasura[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "hasura" {
  count              = var.tf_env != "local" ? 1 : 0
  name               = "${var.project}-${var.tf_env}-hasura"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.hasura[0].resource_id
  scalable_dimension = aws_appautoscaling_target.hasura[0].scalable_dimension
  service_namespace  = aws_appautoscaling_target.hasura[0].service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value      = 70
    scale_in_cooldown = 300
  }
}
