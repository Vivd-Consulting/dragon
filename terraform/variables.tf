##### General #####

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

variable "tf_env" {
  description = "Terraform environment name."
  type        = string
}

variable "project" {
  description = "Project name."
  type        = string
}

variable "domain" {
  description = "Root domain name."
  type        = string
}

variable "aws_notifications_email" {
  description = "Email address to send AWS notifications to."
  type        = string
}

variable "bootstrap" {
  description = "Set to true if this is the first time applying."
  type        = bool
}

##### VPC #####

variable "vpc_cidr" {
  description = "The IPv4 CIDR to use for the VPC."
  type        = string
}

variable "vpc_azs" {
  description = "List of Availability Zones to create subnets in."
  type        = list(string)
}

variable "vpc_private_subnets" {
  description = "List of IPv4 CIDRs to use for private subnets."
  type        = list(string)
}

variable "vpc_public_subnets" {
  description = "List of IPv4 CIDRs to use for public subnets."
  type        = list(string)
}

variable "vpc_database_subnets" {
  description = "List of IPv4 CIDRs to use for private database subnets."
  type        = list(string)
}

##### Database #####

variable "db_master_password" {
  description = "Master password for the database."
  type        = string
}

##### Hasura #####

variable "hasura_admin_secret" {
  description = "Secret key required to access the Hasura instance."
  type        = string
}

variable "hasura_jwt_secret" {
  description = "JWT Secret variable is set equal to a JSON string containing a type property set equal to the method of encryption and the JWK (key) used for verifying a JWT."
  type        = string
}

##### API/Apollo #####

variable "api_action_secret" {
  description = "Secret string used when interacting with the action API."
  type        = string
}

variable "api_ses_sender_address" {
  description = "Email address to use as the SES sender."
  type        = string
}

variable "api_ses_receiver_address" {
  description = "Email address to use as the SES receiver."
  type        = string
}

variable "api_auth0_client" {
  description = "API Auth0 client."
  type        = string
}

variable "api_auth0_client_secret" {
  description = "API Auth0 client secret."
  type        = string
}

variable "api_auth0_audience" {
  description = "API Auth0 audience."
  type        = string
}

variable "api_auth0_uri" {
  description = "API Auth0 domain URI."
  type        = string
}

variable "api_auth0_admin_role_id" {
  description = "Auth0 role ID for the admin role."
  type        = string
}

variable "api_auth0_client_role_id" {
  description = "Auth0 role ID for the client role."
  type        = string
}

variable "api_auth0_contractor_role_id" {
  description = "Auth0 role ID for the contractor role."
  type        = string
}

variable "api_plaid_client_id" {
  description = "Plaid client ID."
  type        = string
}

variable "api_plaid_secret" {
  description = "Plaid secret."
  type        = string
}

variable "api_plaid_env" {
  description = "Plaid env."
  type        = string
}
