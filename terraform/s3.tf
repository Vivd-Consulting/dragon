# API media
resource "aws_s3_bucket" "api_media" {
  bucket = "${var.project}-${var.tf_env}-media"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_ownership_controls" "api_media" {
  bucket = aws_s3_bucket.api_media.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "api_media_acl" {
  bucket = aws_s3_bucket.api_media.id
  acl    = "private"

  depends_on = [
    aws_s3_bucket_ownership_controls.api_media
  ]
}
