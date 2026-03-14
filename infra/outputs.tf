output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the site assets"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — needed to invalidate the cache after deploys"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "CloudFront-assigned domain. Point your DNS CNAME/ALIAS here if not using Route 53."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  description = "Live URL of the site"
  value       = "https://${var.domain_name}"
}

output "route53_zone_id" {
  description = "Zone ID of the existing Route 53 hosted zone"
  value       = data.aws_route53_zone.site.zone_id
}
