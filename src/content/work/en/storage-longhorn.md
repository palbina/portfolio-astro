---
title: "Distributed Storage: Longhorn"
publishDate: 2026-03-01 00:00:00
img: /assets/storage-longhorn.png
img_alt: A highly detailed 3D isometric representation of highly available distributed storage nodes
description: |
  Implementation of Longhorn as a cloud-native distributed block storage system providing high availability and persistent volumes for stateful applications.
tags:
  - Distributed Storage
  - Longhorn
  - High Availability
  - Stateful Workloads
  - Persistent Volumes
---

> Ensuring stateful data survives catastrophic node failures by synchronizing block-level storage across multiple disconnected hardware devices.

## Project Overview

State in Kubernetes is notoriously difficult to manage securely and consistently across multiple commodity hardware nodes. To solve this in the current HomeLab environment, Longhorn was deployed as the primary distributed block storage provisioner.

By abstracting the local NVMe storage of individual worker nodes into a unified pool, stateful sets like PostgreSQL and Qdrant databases can freely schedule across the cluster without being pinned to specific hardware failure domains.

### Key Features

- **Block-Level Replication**: Data written to any PersistentVolumeClaim (PVC) is automatically, synchronously replicated to up to 3 distinct nodes.
- **Microservices Architecture**: The storage controller itself runs in user space as a robust set of microservices within Kubernetes, eliminating the need for complex kernel-module dependencies.
- **Node Reconstruction**: If a worker node burns down to the bare metal, a replacement node can join the cluster and seamlessly rebuild the data replica without manual intervention.
- **Backup & Snapshots**: Automated, recurring snapshots of active databases are pushed directly to an external AWS S3 bucket.

### Technologies Used

- CNCF Longhorn
- CRDs for Volume Management
- AWS S3 Integration
- Talos Linux NVMe integration

This project highlights a modern, open-source approach to distributed computing that rivals enterprise SAN solutions, operating securely entirely within Kubernetes.
