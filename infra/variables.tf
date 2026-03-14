variable "domain_name" {
  description = "Root domain name (e.g. grafly.io)"
  type        = string
  default     = "grafly.io"
}

variable "aws_region" {
  description = "AWS region for the S3 bucket"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment tag"
  type        = string
  default     = "prod"
}

variable "price_class" {
  description = "CloudFront price class. Use PriceClass_100 (US/EU only) to save cost, or PriceClass_All for global."
  type        = string
  default     = "PriceClass_100"
  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "Must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

