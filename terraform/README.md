# Terraform Infrastructure Operations

## Overview

This README outlines the infrastructure stack at a high level as well as common operations that developers may need to perform.

All infrastructure for this project is configured and managed by Terraform on Terraform Cloud. Any changes to infrastructure should be made via Terraform and not manually. We leverage Terraform Workspaces, which allow us to write a single configuration, and deploy it across multiple environments.

Supported Terraform Workspaces:

- `vms-stg` - Infrastructure for the Staging environment. Targets the `staging` branch.
- `vms-prd` - Infrastructure for the Production environment. Targets the `main` branch.

## Making Infrastructure Changes

If you are new to Terraform it is recommend to read through the following set of documentation to understand how to plan and apply changes.

- [Terraform Docs](https://www.terraform.io/docs)
- [Terraform Cloud Docs](https://developer.hashicorp.com/terraform/cloud-docs)

### Prerequisites

1. Install [terraform-docs](https://github.com/terraform-docs/terraform-docs)
2. Install [tfenv](https://github.com/tfutils/tfenv)
3. In a terminal, run `tfenv install 1.5.4` to install the Terraform CLI via tfenv.

### Process

1. In a terminal, run `cd terraform` to move into the terraform directory.
2. Run `Terraform workspace list` to list available workspaces.
3. Run `terraform workspace select <WORKSPACE>` to select the workspace you want to work with.
4. Make your changes as necessary, using `terraform validate` and `terraform plan` as you go to validate your changes.
5. Run `terraform fmt -recursive` to format.
6. Run `terraform-docs markdown . --output-file README.md` to update the README.md file.
7. Commit and push your changes.
8. Open a PR. This will trigger a Terraform Cloud plan run, wait for the plan results to be reported in the `Runs` section in the [Terraform Cloud UI](https://app.terraform.io/app/Vivd/workspaces) for the target branch's workspace.
9. If the plan looks good, merge the PR. This will trigger another plan operation.
10. If the new plan looks good, select the `Confirm & Apply` button at the bottom of the run.
11. The planned changes will be applied and the result will be reported in that run.

## Common Tasks

### Modifying Application Environment Variables

Some application environment variables are strictly set in the Terraform code and are not exposed as a variable in `variables.tf`. These variables are usually contructed from attributes of other resources in Terraform, and do not need to be exposed to the engineer to manage.

Other variables that do not meet the above description are exposed as variables in `variables.tf` and subsequently referenced elsewhere in the Terraform code. The values of these variables are set in the `Variables` section of each Workspace in the [Terraform Cloud UI](https://app.terraform.io/app/Vivd/workspaces).

If you are adding or removing either type of variable, or editing hard-set variables, use the [Making Infrastructure Changes](#making-infrastructure-changes) workflow above to make those changes.

If you are modifying an existing variable whos value is managed in the `Variables` section of the [Terraform Cloud UI](https://app.terraform.io/app/Vivd/workspaces), modify the variable there, and manually invoke a new run in the `Runs` section of the Workspace.

### Accessing Application Logs

#### Client

The client application is hosted in Vercel. Perform the following steps to access logs for a Vercel deployment.

1. Navigate to the list of Vercel [Deployments](https://vercel.com/vivd-consulting/Vivd/deployments)
2. Find the latest deployment for the branch you would like to review logs for, select it.
3. Navigate to the `Logs` tab.

#### Hasura, API/Apollo

Container logs for the Hasura and API/Apollo applications are stored in AWS CloudWatch Logs. Perform the following steps to access logs for these applications.

1. Sign into the AWS Management Console.
2. Navigate to the CloudWatch service.
3. Select `Logs groups` from the left sidebar.
4. Select the log group for the application you want to view logs for. Log groups are named `ecs/vms-<ENV>-<APP>`.
5. Select the newest log stream. One log stream is created for each application container.

### Accessing ECS Application Containers

In some troubleshooting cases, it can be helpful to access the underlying EC2 instance running ECS tasks (containers). Doing so allows you to run Docker commands on the host, and execute shell commands within any given container.

1. Sign into the AWS Management Console.
2. Navigate to the ECS service.
3. Select the ECS Cluster containing the application you want to access.
4. In the `Tasks` tab, select the task (container) you want to access.
5. In the `Configuration` section, select the ECS instance ID hyperlink in the `Launch type` field.
6. A new tab will open, select the EC2 instance shown, then select `Connect` in the top right.
7. In the `Session Manager` tab, select `Connect`.
8. A new tab will open with a shell session on that host, run `sudo su` to elevate your permissions.
9. Run `docker ps` to list the currently running containers.
10. Select the Container ID of the container you want to access.
11. Run `docker exec -it <CONTAINER_ID> /bin/sh` to open a shell session in the container.

## Terraform Docs

_This section is automatically generated by `terraform-docs`_ and should not be edited manually.

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | 5.17.0 |
| <a name="requirement_random"></a> [random](#requirement\_random) | 3.5.1 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 5.17.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_database"></a> [database](#module\_database) | terraform-aws-modules/rds/aws | 6.1.1 |
| <a name="module_vpc"></a> [vpc](#module\_vpc) | terraform-aws-modules/vpc/aws | 5.1.2 |

## Resources

| Name | Type |
|------|------|
| [aws_acm_certificate.main](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/acm_certificate) | resource |
| [aws_appautoscaling_policy.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_target.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/appautoscaling_target) | resource |
| [aws_appautoscaling_target.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/appautoscaling_target) | resource |
| [aws_autoscaling_group.ecs_ci](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/autoscaling_group) | resource |
| [aws_cloudwatch_event_rule.oom_ecs_task_state_change](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.eventbridge_to_sns](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_event_target) | resource |
| [aws_cloudwatch_metric_alarm.ecs_high_cpu_alarm](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.ecs_high_memory_alarm](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.rds_cpu_utilization_alarm](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.rds_free_disk_space_alarm](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_ecr_lifecycle_policy.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecr_lifecycle_policy) | resource |
| [aws_ecr_lifecycle_policy.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecr_lifecycle_policy) | resource |
| [aws_ecr_repository.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecr_repository) | resource |
| [aws_ecr_repository.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecr_repository) | resource |
| [aws_ecs_capacity_provider.ecs_ci](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_capacity_provider) | resource |
| [aws_ecs_cluster.cluster](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_cluster) | resource |
| [aws_ecs_cluster_capacity_providers.ecs_ci](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_cluster_capacity_providers) | resource |
| [aws_ecs_service.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_service) | resource |
| [aws_ecs_service.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_service) | resource |
| [aws_ecs_task_definition.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_task_definition) | resource |
| [aws_ecs_task_definition.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ecs_task_definition) | resource |
| [aws_iam_role.api_service](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/iam_role) | resource |
| [aws_launch_template.ecs_ci](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/launch_template) | resource |
| [aws_lb.cluster_external_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb) | resource |
| [aws_lb.cluster_internal_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb) | resource |
| [aws_lb_listener.cluster_external_lb_https](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener) | resource |
| [aws_lb_listener.cluster_internal_lb_https](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener) | resource |
| [aws_lb_listener_rule.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener_rule) | resource |
| [aws_lb_listener_rule.api_internal](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener_rule) | resource |
| [aws_lb_listener_rule.apollo](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener_rule) | resource |
| [aws_lb_listener_rule.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_listener_rule) | resource |
| [aws_lb_target_group.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_target_group) | resource |
| [aws_lb_target_group.api_internal](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_target_group) | resource |
| [aws_lb_target_group.apollo](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_target_group) | resource |
| [aws_lb_target_group.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/lb_target_group) | resource |
| [aws_route53_record.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/route53_record) | resource |
| [aws_route53_record.apollo](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/route53_record) | resource |
| [aws_route53_zone.private](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/route53_zone) | resource |
| [aws_s3_bucket.api_media](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/s3_bucket) | resource |
| [aws_s3_bucket_acl.api_media_acl](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/s3_bucket_acl) | resource |
| [aws_s3_bucket_ownership_controls.api_media](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/s3_bucket_ownership_controls) | resource |
| [aws_security_group.api_ecs](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group.cluster_external_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group.cluster_internal_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group.database](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group.ecs_ci](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group.hasura_ecs](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group) | resource |
| [aws_security_group_rule.api_ecs_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.api_ecs_lb_internal](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.apollo_ecs_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.cluster_external_lb_ingress](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.cluster_internal_lb_ingress](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.database_public_access](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_security_group_rule.hasura_ecs_lb](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/security_group_rule) | resource |
| [aws_ses_domain_dkim.main](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ses_domain_dkim) | resource |
| [aws_ses_domain_identity.main](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ses_domain_identity) | resource |
| [aws_ses_domain_mail_from.main](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ses_domain_mail_from) | resource |
| [aws_ses_identity_notification_topic.bounce](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ses_identity_notification_topic) | resource |
| [aws_ses_identity_notification_topic.complaint](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/ses_identity_notification_topic) | resource |
| [aws_sns_topic.aws_notifications](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/sns_topic) | resource |
| [aws_sns_topic_subscription.service_owner_email](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/resources/sns_topic_subscription) | resource |
| [aws_ami.ecs_optimized](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ami) | data source |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/caller_identity) | data source |
| [aws_ecr_repository.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ecr_repository) | data source |
| [aws_ecr_repository.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ecr_repository) | data source |
| [aws_ecs_container_definition.api](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ecs_container_definition) | data source |
| [aws_ecs_container_definition.hasura](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ecs_container_definition) | data source |
| [aws_iam_policy_document.api_service](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.api_service_assume](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/iam_policy_document) | data source |
| [aws_kms_key.ebs](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/kms_key) | data source |
| [aws_kms_key.rds](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/kms_key) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/region) | data source |
| [aws_ses_domain_identity.main](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/ses_domain_identity) | data source |
| [aws_sns_topic.aws_notifications](https://registry.terraform.io/providers/hashicorp/aws/5.17.0/docs/data-sources/sns_topic) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_api_action_secret"></a> [api\_action\_secret](#input\_api\_action\_secret) | Secret string used when interacting with the action API. | `string` | n/a | yes |
| <a name="input_api_auth0_admin_role_id"></a> [api\_auth0\_admin\_role\_id](#input\_api\_auth0\_admin\_role\_id) | Auth0 role ID for the admin role. | `string` | n/a | yes |
| <a name="input_api_auth0_audience"></a> [api\_auth0\_audience](#input\_api\_auth0\_audience) | API Auth0 audience. | `string` | n/a | yes |
| <a name="input_api_auth0_client"></a> [api\_auth0\_client](#input\_api\_auth0\_client) | API Auth0 client. | `string` | n/a | yes |
| <a name="input_api_auth0_client_role_id"></a> [api\_auth0\_client\_role\_id](#input\_api\_auth0\_client\_role\_id) | Auth0 role ID for the client role. | `string` | n/a | yes |
| <a name="input_api_auth0_client_secret"></a> [api\_auth0\_client\_secret](#input\_api\_auth0\_client\_secret) | API Auth0 client secret. | `string` | n/a | yes |
| <a name="input_api_auth0_contractor_role_id"></a> [api\_auth0\_contractor\_role\_id](#input\_api\_auth0\_contractor\_role\_id) | Auth0 role ID for the contractor role. | `string` | n/a | yes |
| <a name="input_api_auth0_uri"></a> [api\_auth0\_uri](#input\_api\_auth0\_uri) | API Auth0 domain URI. | `string` | n/a | yes |
| <a name="input_api_ses_receiver_address"></a> [api\_ses\_receiver\_address](#input\_api\_ses\_receiver\_address) | Email address to use as the SES receiver. | `string` | n/a | yes |
| <a name="input_api_ses_sender_address"></a> [api\_ses\_sender\_address](#input\_api\_ses\_sender\_address) | Email address to use as the SES sender. | `string` | n/a | yes |
| <a name="input_aws_notifications_email"></a> [aws\_notifications\_email](#input\_aws\_notifications\_email) | Email address to send AWS notifications to. | `string` | n/a | yes |
| <a name="input_bootstrap"></a> [bootstrap](#input\_bootstrap) | Set to true if this is the first time applying. | `bool` | n/a | yes |
| <a name="input_db_master_password"></a> [db\_master\_password](#input\_db\_master\_password) | Master password for the database. | `string` | n/a | yes |
| <a name="input_domain"></a> [domain](#input\_domain) | Root domain name. | `string` | n/a | yes |
| <a name="input_hasura_admin_secret"></a> [hasura\_admin\_secret](#input\_hasura\_admin\_secret) | Secret key required to access the Hasura instance. | `string` | n/a | yes |
| <a name="input_hasura_jwt_secret"></a> [hasura\_jwt\_secret](#input\_hasura\_jwt\_secret) | JWT Secret variable is set equal to a JSON string containing a type property set equal to the method of encryption and the JWK (key) used for verifying a JWT. | `string` | n/a | yes |
| <a name="input_project"></a> [project](#input\_project) | Project name. | `string` | n/a | yes |
| <a name="input_tf_env"></a> [tf\_env](#input\_tf\_env) | Terraform environment name. (stg/prd) | `string` | n/a | yes |
| <a name="input_vpc_azs"></a> [vpc\_azs](#input\_vpc\_azs) | List of Availability Zones to create subnets in. | `list(string)` | n/a | yes |
| <a name="input_vpc_cidr"></a> [vpc\_cidr](#input\_vpc\_cidr) | The IPv4 CIDR to use for the VPC. | `string` | n/a | yes |
| <a name="input_vpc_database_subnets"></a> [vpc\_database\_subnets](#input\_vpc\_database\_subnets) | List of IPv4 CIDRs to use for private database subnets. | `list(string)` | n/a | yes |
| <a name="input_vpc_private_subnets"></a> [vpc\_private\_subnets](#input\_vpc\_private\_subnets) | List of IPv4 CIDRs to use for private subnets. | `list(string)` | n/a | yes |
| <a name="input_vpc_public_subnets"></a> [vpc\_public\_subnets](#input\_vpc\_public\_subnets) | List of IPv4 CIDRs to use for public subnets. | `list(string)` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_cluster_external_lb_dns_name"></a> [cluster\_external\_lb\_dns\_name](#output\_cluster\_external\_lb\_dns\_name) | n/a |
| <a name="output_cluster_internal_lb_dns_name"></a> [cluster\_internal\_lb\_dns\_name](#output\_cluster\_internal\_lb\_dns\_name) | n/a |
| <a name="output_database_address"></a> [database\_address](#output\_database\_address) | n/a |
<!-- END_TF_DOCS -->
