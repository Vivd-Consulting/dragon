resource "aws_acm_certificate" "main" {
  count             = var.tf_env != "local" ? 1 : 0
  domain_name       = "*.${var.domain}"
  validation_method = "DNS"
}
