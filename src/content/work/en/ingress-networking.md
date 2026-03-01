---
title: Edge Networking with Traefik & Cloudflare
publishDate: 2026-03-01 00:00:00
img: /assets/ingress-networking.png
img_alt: A high-end 3D visualization of digital traffic entering a secure gateway with glowing light trails
description: |
  Secure ingress traffic management combining Cloudflare Tunnels for edge security and Traefik for internal routing.
tags:
  - Networking
  - Ingress
  - Traefik
  - Cloudflare
  - DNS
---

> Orchestrating external traffic through a dual-layer security perimeter with automated certificate management and advanced routing.

## Project Overview

In a modern home lab, exposing services securely to the internet is a complex challenge. This project implemented a robust **Edge Networking** stack that eliminates the need for opening ports on the home router while providing enterprise-grade security and observability.

### Key Features

- **Cloudflare Tunnels**: Established an outbound-only connection to the Cloudflare edge, hiding the home IP address and providing built-in DDoS protection.
- **Traefik Ingress**: Acts as the internal traffic controller, handling dynamic routing based on hostnames, path-based routing, and middleware application.
- **Custom Middlewares**: Implementation of security headers, rate limiting, and CrowdSec integration to automatically block malicious IPs.
- **Automated TLS**: Seamless integration with **Cert-Manager** and Cloudflare DNS-01 validation to maintain valid wildcard certificates for all subdomains.

### Technologies Used

- Traefik Proxy
- Cloudflare Tunnel (cloudflared)
- Cert-Manager
- ExternalDNS
- CrowdSec (WAF)

By decoupling the ingress layer from the cluster nodes, this architecture provides a flexible and secure gateway that scales effortlessly with new services.
