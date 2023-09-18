# Private Route53 Hosted Zone for services that are internally routable only.
# Records in this zone are only resolvable by other services within the associated VPC.

resource "aws_route53_zone" "private" {
  count = var.tf_env != "local" ? 1 : 0
  name  = var.domain

  vpc {
    vpc_id = module.vpc[0].vpc_id
  }
}

resource "aws_route53_record" "api" {
  count   = var.tf_env != "local" ? 1 : 0
  zone_id = aws_route53_zone.private[0].zone_id
  name    = "api.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.cluster_internal_lb[0].dns_name]
}

resource "aws_route53_record" "apollo" {
  count   = var.tf_env != "local" ? 1 : 0
  zone_id = aws_route53_zone.private[0].zone_id
  name    = "apollo.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.cluster_internal_lb[0].dns_name]
}
