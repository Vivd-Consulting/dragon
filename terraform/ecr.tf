locals {
  ecr_policy_json = <<EOT
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Retain the newest 60 images.",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 60
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOT
}

resource "aws_ecr_repository" "api" {
  count = var.tf_env == "prd" ? 1 : 0
  name  = "${var.project}-api"
}

resource "aws_ecr_lifecycle_policy" "api" {
  count      = var.tf_env == "prd" ? 1 : 0
  repository = aws_ecr_repository.api[0].name
  policy     = local.ecr_policy_json
}

resource "aws_ecr_repository" "hasura" {
  count = var.tf_env == "prd" ? 1 : 0
  name  = "${var.project}-hasura"
}

resource "aws_ecr_lifecycle_policy" "hasura" {
  count      = var.tf_env == "prd" ? 1 : 0
  repository = aws_ecr_repository.hasura[0].name
  policy     = local.ecr_policy_json
}
