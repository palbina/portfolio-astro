---
title: "Git Server & CI/CD Privado: Forgejo"
publishDate: 2026-03-01 00:00:00
img: /assets/forgejo-ci.png
img_alt: Una representación isométrica 3D altamente detallada de un repositorio central alojando integraciones
description: |
  Implementación de una forja de software propia al 100% (Forgejo) con integración nativa de máquinas virtuales interconectadas para realizar pipelines CI/CD distribuidos.
tags:
  - Servidor Git
  - Runners CI/CD
  - Forgejo
  - Self-Hosted
  - Pipelines
---

> Ejecutar una suite soberana bajo llave para el control de versiones, empoderando el desarrollo y liberándose por completo de cuotas y limitaciones de proveedores SaaS externos.

## Visión General

Para preservar absoluta soberanía digital, tener privacidad total en código privado y manejar volúmenes irrestrictos de integración continua, el núcleo tecnológico fue abstraído hacia **Forgejo** (la ramificación comunitaria de Gitea).

### Características Clave

- **Runners CI/CD Descentralizados**: A diferencia de GitHub Actions, Forgejo Actions emplea de manera nativa nodos satélite en Golang instanciados en pods dinámicos de Kubernetes. Se activan cuando comiteas, corren los steps programados, y mueren de inmediato de manera efímera.
- **Latencia de Artefactos Mínima**: Las imágenes Docker, al compilarse dentro del propio anillo de Kubernetes, no requieren transitar la Internet púbica en cada build, por tanto los artefactos pesados viajan fugazmente minimizando el tiempo de espera casi a cero antes de subirse con un empuje ultrarrápido a tu Registry local o GHCR.
- **Soberanía y RBAC Eficaz**: Todo interactúa localmente. Sus configuraciones están blindadas desde un OIDC gestionado por tu panel Authentik a través de tokenización segura.
- **Cero Interacciones Externas**: Su núcleo, escrito en lenguaje Go, usa PostgreSQL y responde con una ligereza inaudita con bajo estrés de RAM o recuros IOPS.
- **Docker in Docker (DinD)**: Ejecución y evaluación asíncrona robusta.

### Tecnologías Empleadas

- Forgejo + Base de datos PostgreSQL
- Nodos Runner API-driven
- Charts de Kubernetes en Helm
- Proveedor de SSO OIDC (Authentik)
- Patrones CI Docker in Docker (DinD)

Desplegar Forgejo en el datacenter permite a los desarrolladores correr pipelines concurrentes costosos 24/7 de manera libre, consolidando todos los flujos GitOps asincrónicamente.
