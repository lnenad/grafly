terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure to store state remotely (recommended for production)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "grafly/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

# Primary provider — used for S3 and most resources
provider "aws" {
  region = var.aws_region
}

# CloudFront ACM certificates must live in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
