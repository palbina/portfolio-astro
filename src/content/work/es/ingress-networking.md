---
title: Networking de Borde con Traefik y Cloudflare
publishDate: 2026-03-01 00:00:00
img: /assets/ingress-networking.png
img_alt: Visualización 3D de alta gama de tráfico digital entrando en una pasarela segura con estelas de luz brillantes
description: |
  Gestión segura de tráfico de entrada combinando Cloudflare Tunnels para seguridad de borde y Traefik para enrutamiento interno.
tags:
  - Networking
  - Ingress
  - Traefik
  - Cloudflare
  - DNS
---

> Orquestando el tráfico externo a través de un perímetro de seguridad de doble capa con gestión automatizada de certificados y enrutamiento avanzado.

## Resumen del Proyecto

En un laboratorio doméstico moderno, exponer servicios de forma segura a Internet es un desafío complejo. Este proyecto implementó un stack de **Networking de Borde** robusto que elimina la necesidad de abrir puertos en el router mientras proporciona seguridad y observabilidad de nivel empresarial.

### Características Clave

- **Cloudflare Tunnels**: Se estableció una conexión de salida única hacia el borde de Cloudflare, ocultando la dirección IP local y proporcionando protección DDoS integrada.
- **Traefik Ingress**: Actúa como el controlador de tráfico interno, manejando el enrutamiento dinámico basado en nombres de host, rutas y la aplicación de middlewares.
- **Middlewares Personalizados**: Implementación de headers de seguridad, limitación de tasa (rate limiting) e integración con CrowdSec para bloquear automáticamente IPs maliciosas.
- **TLS Automatizado**: Integración perfecta con **Cert-Manager** y validación Cloudflare DNS-01 para mantener certificados wildcard válidos para todos los subdominios.

### Tecnologías Utilizadas

- Traefik Proxy
- Cloudflare Tunnel (cloudflared)
- Cert-Manager
- ExternalDNS
- CrowdSec (WAF)

Al desacoplar la capa de ingress de los nodos del cluster, esta arquitectura proporciona una pasarela flexible y segura que escala sin esfuerzo con cada nuevo servicio.
