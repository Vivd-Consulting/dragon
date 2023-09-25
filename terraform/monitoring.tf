locals {
  sns_topic_arn = var.tf_env == "stg" ? aws_sns_topic.aws_notifications[0].arn : data.aws_sns_topic.aws_notifications[0].arn
  ecs_services = toset([
    "${var.project}-${var.tf_env}-api",
    "${var.project}-${var.tf_env}-hasura"
  ])
}

# Monitor ECS services for OOM events.
resource "aws_cloudwatch_event_rule" "oom_ecs_task_state_change" {
  count       = var.tf_env == "stg" ? 1 : 0
  name        = "OOM_ECS_Task_State_Change_Rule"
  description = "Event rule for monitoring OOM ECS task state changes."

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail_type = ["ECS Task State Change"]
    detail = {
      lastStatus    = ["STOPPED"]
      stoppedReason = ["OutOfMemory"]
    }
  })
}

resource "aws_cloudwatch_event_target" "eventbridge_to_sns" {
  count     = var.tf_env == "stg" ? 1 : 0
  rule      = aws_cloudwatch_event_rule.oom_ecs_task_state_change[0].name
  target_id = "OOM_ECS_Task_State_Change_Target"

  arn = local.sns_topic_arn

  input_transformer {
    input_paths = {
      taskArn       = "$.detail.taskArn"
      containerName = "$.detail.containers.name"
      containerArn  = "$.detail.containers.containerArn"
    }
    input_template = <<EOT
{
  "taskArn": "<taskArn>",
  "containerName": "<containerName>",
  "containerArn": "<containerArn>",
  "customMessage": "The ECS task has exited with an OutOfMemory error."
}
EOT
  }
}

# Monitor ECS services for high CPU utilization.
resource "aws_cloudwatch_metric_alarm" "ecs_high_cpu_alarm" {
  for_each            = local.ecs_services
  alarm_name          = "ECS High CPU Utilization Alarm - ${each.key}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60" # 1 minute
  statistic           = "Average"
  threshold           = "80"

  alarm_description = "ECS service ${each.key} is experiencing high CPU utilization."
  alarm_actions     = [local.sns_topic_arn]
  ok_actions        = [local.sns_topic_arn]

  dimensions = {
    ServiceName = each.key
    ClusterName = aws_ecs_cluster.cluster.name
  }
}

# Monitor ECS services for high memory utilization.
resource "aws_cloudwatch_metric_alarm" "ecs_high_memory_alarm" {
  for_each            = local.ecs_services
  alarm_name          = "ECS High Memory Utilization Alarm - ${each.key}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "60" # 1 minute
  statistic           = "Average"
  threshold           = "80"

  alarm_description = "ECS service ${each.key} is experiencing high memory utilization."
  alarm_actions     = [local.sns_topic_arn]
  ok_actions        = [local.sns_topic_arn]

  dimensions = {
    ServiceName = each.key
    ClusterName = aws_ecs_cluster.cluster.name
  }
}

# Monitor RDS for low storage space.
resource "aws_cloudwatch_metric_alarm" "rds_free_disk_space_alarm" {
  alarm_name          = "RDS Low Free Disk Space Alarm - ${module.database.db_instance_identifier}"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300" # 5 minutes
  statistic           = "Average"
  threshold           = "2000000000" # 2 GB

  alarm_description = "RDS instance ${module.database.db_instance_identifier} has less than 2 GB of free disk space."
  alarm_actions     = [local.sns_topic_arn]
  ok_actions        = [local.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = module.database.db_instance_identifier
  }
}

# Monitor RDS for high CPU utilization.
resource "aws_cloudwatch_metric_alarm" "rds_cpu_utilization_alarm" {
  alarm_name          = "RDS High CPU Utilization Alarm - ${module.database.db_instance_identifier}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300" # 5 minutes
  statistic           = "Average"
  threshold           = "80"

  alarm_description = "RDS instance ${module.database.db_instance_identifier} is experiencing high CPU utilization."
  alarm_actions     = [local.sns_topic_arn]
  ok_actions        = [local.sns_topic_arn]

  dimensions = {
    DBInstanceIdentifier = module.database.db_instance_identifier
  }
}
