---
title: "Self-Hosted Git & CI/CD: Forgejo"
publishDate: 2026-03-01 00:00:00
img: /assets/forgejo-ci.png
img_alt: A highly detailed 3D isometric representation of a Git repository hosting CI runners
description: |
  Implementation of a fully self-hosted, lightweight software forge (Forgejo) featuring native, distributed CI/CD runner capabilities through Forgejo Actions.
tags:
  - Git Server
  - CI/CD Runners
  - Forgejo
  - Self-Hosted
  - Pipelines
---

> Running a fully sovereign software forge securely in-house, enabling total data ownership and limitless pipeline execution times without relying on SaaS providers.

## Project Overview

To maintain complete digital sovereignty and to support unlimited minutes for continuous integration workloads, the entire version control and CI/CD backbone of the HomeLab ecosystem was moved to **Forgejo** (a community-driven fork of Gitea).

### Key Features

- **Decentralized CI/CD Runners**: Instead of relying on GitHub Actions or GitLab CI, Forgejo Actions are executed via independent Go-based runner nodes deployed directly onto the Kubernetes cluster. These dynamic pods spin up to execute jobs and instantly decompose.
- **Fast Build Artifacts**: Container images can be rapidly generated, tested via caching layers, and deployed out to private registries with extreme locality, slashing external bandwidth out.
- **Data Sovereignty**: The entirety of the codebase, project wiki, API keys, package repositories, and user interactions remain strictly under the admin's physical constraint.
- **Extremely Lightweight Form Factor**: Built entirely in Go, it features an incredibly lean runtime and fast loading times while retaining massive Git scaling capabilities compared to bulkier Java or Ruby alternatives.
- **Full OIDC Support**: It connects out-of-the-box natively into Authentik for single-sign-on (SSO) and robust RBAC token management.

### Technologies Used

- Forgejo + PostgreSQL DB
- API-driven Actions runners
- Kubernetes Helm Charts
- Authentik SSO Provider
- Docker inside Docker (DinD) pipelines

By implementing an on-premise software forge, the CI/CD velocity dramatically increases by leveraging internal cluster speeds, while eliminating third-party reliance or costly tier upgrades.
