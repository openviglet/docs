---
sidebar_position: 4
title: Developer Guide
description: Developer guide for Viglet Dumont DEP
---

# Viglet Dumont DEP: Developer Guide

This guide covers how to develop with and extend Dumont DEP.

## Building from Source

### Requirements

- Java 21
- Maven 3.9+
- Git

### Build

```bash
git clone https://github.com/openviglet/dumont.git
cd dumont
mvn clean install
```

### Running in Development Mode

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## REST API

Dumont DEP exposes a RESTful API for managing data exchanges.

### Base URL

```
http://localhost:2710/api/v1
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/exchanges` | List all data exchanges |
| POST | `/exchanges` | Create a new exchange |
| GET | `/exchanges/{id}` | Get exchange details |
| PUT | `/exchanges/{id}` | Update an exchange |
| DELETE | `/exchanges/{id}` | Delete an exchange |
| POST | `/exchanges/{id}/run` | Execute an exchange |
| GET | `/connectors` | List available connectors |
| GET | `/pipelines` | List configured pipelines |

### Example: Create an Exchange

```bash
curl -X POST http://localhost:2710/api/v1/exchanges \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-exchange",
    "source": "jdbc-connector",
    "target": "rest-connector",
    "pipeline": "transform-pipeline"
  }'
```

## Creating Custom Connectors

You can extend Dumont DEP by creating custom connectors:

```java
@Component
public class MyCustomConnector implements DumontConnector {

    @Override
    public String getName() {
        return "my-custom-connector";
    }

    @Override
    public DataSet read(ConnectorConfig config) {
        // Implementation
    }

    @Override
    public void write(DataSet data, ConnectorConfig config) {
        // Implementation
    }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

See the [GitHub repository](https://github.com/openviglet) for more details.
