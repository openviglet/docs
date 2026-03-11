---
sidebar_position: 2
title: Getting Started
description: Getting started with Viglet Dumont DEP
---

# Viglet Dumont DEP: Getting Started

This guide will help you get up and running with **Viglet Dumont DEP**.

## Prerequisites

- Java 21 or higher
- Maven 3.9+
- Docker (optional, for containerized deployment)

## Installation

### Using Docker

```bash
docker pull openviglet/dumont:latest
docker run -p 2710:2710 openviglet/dumont:latest
```

### From Source

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont
mvn spring-boot:run
```

After starting, access the Dumont DEP console at `http://localhost:2710`.

## Configuration

Dumont DEP uses Spring Boot configuration. You can configure it using `application.properties` or environment variables.

```properties
# Server configuration
server.port=2710

# Database configuration
spring.datasource.url=jdbc:h2:file:./dumont-db
spring.datasource.driver-class-name=org.h2.Driver
```

## Next Steps

- Read the [Architecture Guide](/dumont/architecture) to understand the system design
- Check the [Developer Guide](/dumont/developer-guide) for API and extension development
