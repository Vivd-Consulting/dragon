# API IAM Role
data "aws_ses_domain_identity" "main" {
  count  = var.tf_env == "prd" ? 1 : 0
  domain = trimprefix(var.domain, "${var.tf_env}.")
}

resource "aws_iam_role" "api_service" {
  name               = "${var.project}-${var.tf_env}-api"
  description        = "Allow the API service to access AWS resources."
  assume_role_policy = data.aws_iam_policy_document.api_service_assume.json

  inline_policy {
    name   = "S3Access"
    policy = data.aws_iam_policy_document.api_service.json
  }
}

data "aws_iam_policy_document" "api_service_assume" {
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
      values   = ["arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:*"]
    }
    condition {
      variable = "aws:SourceAccount"
      test     = "StringEquals"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

data "aws_iam_policy_document" "api_service" {
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
      var.tf_env == "stg" ? aws_ses_domain_identity.main[0].arn : data.aws_ses_domain_identity.main[0].arn
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
