# Generic SNS topic to send notifications to related to AWS resources or alarms.

data "aws_sns_topic" "aws_notifications" {
  count = var.tf_env == "prd" ? 1 : 0
  name  = "aws_notifications"
}

resource "aws_sns_topic" "aws_notifications" {
  count = var.tf_env == "prd" ? 1 : 0
  name  = "aws_notifications"
}

resource "aws_sns_topic_subscription" "service_owner_email" {
  count     = var.tf_env == "prd" ? 1 : 0
  topic_arn = aws_sns_topic.aws_notifications[0].arn
  protocol  = "email"
  endpoint  = var.aws_notifications_email
}
