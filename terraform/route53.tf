# Private Route53 Hosted Zone for services that are internally routable only.
# Records in this zone are only resolvable by other services within the associated VPC.

resource "aws_route53_zone" "private" {
  name = var.domain

  vpc {
    vpc_id = module.vpc.vpc_id
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "api.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.cluster_internal_lb.dns_name]
}

resource "aws_route53_record" "apollo" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "apollo.${var.domain}"
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.cluster_internal_lb.dns_name]
}
