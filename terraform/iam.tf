# This set of service_access resources should only exist for the local environment.
# Service access to AWS services is managed via an IAM Role in higher environments.

resource "aws_iam_user" "service_access" {
  count = var.tf_env == "local" ? 1 : 0
  name  = "${var.project}-${var.tf_env}-service-access"
}

resource "aws_iam_access_key" "service_access" {
  count = var.tf_env == "local" ? 1 : 0
  user  = aws_iam_user.service_access[0].name
}

resource "aws_iam_user_policy" "service_access" {
  count  = var.tf_env == "local" ? 1 : 0
  user   = aws_iam_user.service_access[0].name
  policy = data.aws_iam_policy_document.service_access[0].json
}

data "aws_iam_policy_document" "service_access" {
  count = var.tf_env == "local" ? 1 : 0

  statement {
    sid = "S3Access"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject",
      "s3:GetObjectAcl",
      "s3:PutObjectAcl"
    ]
    resources = [
      aws_s3_bucket.api_media.arn,
      "${aws_s3_bucket.api_media.arn}/*"
    ]
  }

  statement {
    sid = "SESAccess"
    actions = [
      "ses:SendRawEmail",
      "ses:SendEmail"
    ]
    resources = [
      aws_ses_domain_identity.main[0].arn
    ]
  }

  # TODO - Refine SNS permissions once use case is defined.
  statement {
    sid = "SNSAccess"
    actions = [
      "sns:*"
    ]
    resources = ["*"]
  }
}

# API IAM Role

data "aws_ses_domain_identity" "main" {
  count  = var.tf_env != "local" ? 1 : 0
  domain = trimprefix(var.domain, "${var.tf_env}.")
}

resource "aws_iam_role" "api_service" {
  count              = var.tf_env != "local" ? 1 : 0
  name               = "${var.project}-${var.tf_env}-api"
  description        = "Allow the API service to access AWS resources."
  assume_role_policy = data.aws_iam_policy_document.api_service_assume[0].json

  inline_policy {
    name   = "S3Access"
    policy = data.aws_iam_policy_document.api_service[0].json
  }
}

data "aws_iam_policy_document" "api_service_assume" {
  count = var.tf_env != "local" ? 1 : 0

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    condition {
      variable = "aws:SourceArn"
      test     = "ArnLike"
      values   = ["arn:aws:ecs:${data.aws_region.current[0].name}:${data.aws_caller_identity.current[0].account_id}:*"]
    }
    condition {
      variable = "aws:SourceAccount"
      test     = "StringEquals"
      values   = [data.aws_caller_identity.current[0].account_id]
    }
  }
}

data "aws_iam_policy_document" "api_service" {
  count = var.tf_env != "local" ? 1 : 0

  statement {
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:DeleteObject",
      "s3:GetObjectAcl",
      "s3:PutObjectAcl"
    ]
    resources = [
      aws_s3_bucket.api_media.arn,
      "${aws_s3_bucket.api_media.arn}/*"
    ]
  }

  statement {
    sid = "SESAccess"
    actions = [
      "ses:SendRawEmail",
      "ses:SendEmail"
    ]
    resources = [
      data.aws_ses_domain_identity.main[0].arn
    ]
  }

  # TODO - Refine SNS permissions once use case is defined.
  statement {
    sid = "SNSAccess"
    actions = [
      "sns:*"
    ]
    resources = ["*"]
  }
}
