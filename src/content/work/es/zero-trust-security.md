---
title: Seguridad Zero Trust e Identidad
publishDate: 2026-03-01 00:00:00
img: /assets/security-stack.png
img_alt: Representación 3D isométrica de un rack de servidores protegido por un escudo digital brillante
description: |
  Implementación de una arquitectura Zero Trust usando Authentik para identidad centralizada y Cilium para políticas de red L7.
tags:
  - Seguridad
  - Zero Trust
  - Cilium
  - Authentik
  - Kubernetes
---

> Robusteciendo el cluster con un enfoque de "Nunca Confiar, Siempre Verificar" mediante identidad centralizada e inspección profunda de paquetes.

## Resumen del Proyecto

La seguridad es un componente de primer nivel en la infraestructura de HomeLab. Este proyecto consistió en la implementación de un modelo de seguridad **Zero Trust** para proteger servicios internos y datos sensibles. Al combinar **Authentik** como proveedor de identidad (IdP) y **Cilium** como CNI de alto rendimiento, el cluster logra seguridad tanto a nivel de aplicación como de red.

### Características Clave

- **Identidad Centralizada (SSO)**: Authentik actúa como la única fuente de verdad para la autenticación, proporcionando soporte OIDC y SAML para todas las aplicaciones self-hosted.
- **Seguridad de Red L7**: Aprovechando las capacidades eBPF de Cilium para aplicar políticas de red granulares en la capa de aplicación (HTTP/gRPC) en lugar de solo IP/Puerto.
- **Forward Auth con Traefik**: Integración con el controlador de Ingress Traefik para proporcionar una capa de autenticación a aplicaciones legadas que no soportan OIDC nativamente.
- **Mutual TLS (mTLS)**: Encriptación automática de toda la comunicación entre pods usando el modo Ambient de Istio, garantizando que los datos en tránsito estén siempre seguros.

### Tecnologías Utilizadas

- Authentik (IdP)
- Cilium (eBPF CNI)
- Traefik (Ingress)
- Istio Ambient Mode
- Cloudflare Tunnel

Esta configuración garantiza que, incluso si un pod se ve comprometido, el radio de explosión se minimice mediante políticas estrictas de "Default Deny" y una verificación de identidad robusta.
