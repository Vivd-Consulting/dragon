# API IAM Role
data "aws_ses_domain_identity" "main" {
  count  = var.tf_env == "prd" ? 1 : 0
  domain = "dragon.vivd.ca"
}

resource "aws_iam_role" "api_service" {
  name               = "${var.project}-${var.tf_env}-api"
  description        = "Allow the API service to access AWS resources."
  assume_role_policy = data.aws_iam_policy_document.api_service_assume.json

  inline_policy {
    name   = "APIAccess"
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
      aws_ses_domain_identity.main_dragon[0].arn
    ]
  }

  statement {
    sid = "SSMDescribe"
    actions = [
      "ssm:DescribeParameters"
    ]
    resources = ["*"]
  }

  statement {
    sid = "SSMAccess"
    actions = [
      "ssm:PutParameter",
      "ssm:LabelParameterVersion",
      "ssm:DeleteParameter",
      "ssm:UnlabelParameterVersion",
      "ssm:GetParameterHistory",
      "ssm:GetParametersByPath",
      "ssm:GetParameters",
      "ssm:GetParameter",
      "ssm:DeleteParameters"
    ]
    resources = [
      "arn:aws:ssm:*:467522471440:parameter/*"
    ]
  }

  statement {
    sid = "KMSAccess"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt"
    ]
    resources = [
      "arn:aws:kms:*:467522471440:key/*"
    ]
  }
}
