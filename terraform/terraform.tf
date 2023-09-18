terraform {
  cloud {
    organization = "Vivd"

    workspaces {
      tags = ["dragon"]
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.11.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.5.1"
    }
  }
}

provider "aws" {
  default_tags {
    tags = {
      "Terraform" = "true"
      "Project"   = var.project
      "Env"       = var.tf_env
    }
  }
}
