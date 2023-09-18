# Create an SES domain for use in all environments.
# Once these resources are created, the DNS verification records that
# are generated must be set in the domain's DNS configuration prior to use.

resource "aws_ses_domain_identity" "main" {
  count  = var.tf_env == "local" ? 1 : 0
  domain = var.domain
}

resource "aws_ses_domain_dkim" "main" {
  count  = var.tf_env == "local" ? 1 : 0
  domain = aws_ses_domain_identity.main[0].domain
}

resource "aws_ses_domain_mail_from" "main" {
  count            = var.tf_env == "local" ? 1 : 0
  domain           = aws_ses_domain_identity.main[0].domain
  mail_from_domain = "mail.${aws_ses_domain_identity.main[0].domain}"
}

resource "aws_ses_identity_notification_topic" "bounce" {
  count                    = var.tf_env == "local" ? 1 : 0
  topic_arn                = aws_sns_topic.aws_notifications[0].arn
  notification_type        = "Bounce"
  identity                 = aws_ses_domain_identity.main[0].domain
  include_original_headers = true
}

resource "aws_ses_identity_notification_topic" "complaint" {
  count                    = var.tf_env == "local" ? 1 : 0
  topic_arn                = aws_sns_topic.aws_notifications[0].arn
  notification_type        = "Complaint"
  identity                 = aws_ses_domain_identity.main[0].domain
  include_original_headers = true
}
