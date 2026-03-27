---
sidebar_position: 2
title: Configuration Reference
description: Complete reference for Viglet Shio CMS application.properties configuration.
---

# Configuration Reference

This document lists all configuration properties available in Shio CMS. Properties are set in `application.properties` (embedded) or in an external properties file loaded via `--spring.config.additional-location`.

---

## Shio CMS Properties

| Property | Default | Description |
|---|---|---|
| `shio.mgmt.enabled` | `true` | Enable the management interface |
| `shio.git.url` | — | Git repository URL for version control |
| `shio.git.token` | — | Authentication token for Git repository |
| `shio.website.nashorn` | `--persistent-code-cache,--optimistic-types=true,-pcc,--class-cache-size=50000` | Nashorn JavaScript engine options |
| `shio.website.javascript.engine` | `nashorn` | JavaScript engine: `nashorn` or `nodejs` |
| `shio.allowedOrigins` | `localhost` | CORS allowed origins |
| `shio.plugin.blogger` | `com.viglet.shio.plugin.ShImporterBloggerPlugin` | Blogger import plugin class |
| `shio.config.system` | `/system` | System configuration path |
| `shio.config.auth` | `/provider/auth/%s` | Auth provider path pattern |
| `shio.config.exchange` | `/provider/exchange/%s` | Exchange provider path pattern |

---

## Server Properties

| Property | Default | Description |
|---|---|---|
| `server.port` | `2710` | HTTP listening port (overridable via `PORT` env var) |
| `server.compression.enabled` | `true` | Enable HTTP response compression |
| `server.compression.mime-types` | `application/json,text/css,application/javascript` | MIME types to compress |
| `server.compression.min-response-size` | `2048` | Minimum response size (bytes) to compress |
| `server.tomcat.use-relative-redirects` | `true` | Use relative redirects in Tomcat |

---

## Database Properties

### H2 (Default — Development)

| Property | Default | Description |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:file:./store/db/turingDB` | H2 file-based database URL |
| `spring.datasource.username` | `sa` | Database username |
| `spring.datasource.password` | *(empty)* | Database password |
| `spring.datasource.driver-class-name` | `org.h2.Driver` | JDBC driver class |
| `spring.jpa.properties.hibernate.dialect` | `org.hibernate.dialect.H2Dialect` | Hibernate dialect |
| `spring.h2.console.enabled` | `false` | Enable H2 web console |
| `spring.h2.console.path` | `/h2` | H2 console URL path |

### MariaDB / MySQL (Production)

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
```

### PostgreSQL (Production)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL94Dialect
```

### Oracle (Enterprise)

```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/shio
spring.datasource.username=shio
spring.datasource.password=shio
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.Oracle10gDialect
```

---

## JPA Properties

| Property | Default | Description |
|---|---|---|
| `spring.jpa.hibernate.ddl-auto` | `update` | Schema management strategy: `update`, `validate`, `create`, `none` |
| `spring.jpa.show-sql` | `false` | Log SQL statements |
| `spring.jpa.properties.hibernate.format_sql` | `false` | Format logged SQL for readability |
| `spring.jpa.properties.hibernate.enable_lazy_load_no_trans` | `true` | Allow lazy loading outside transactions |
| `spring.jpa.properties.jakarta.persistence.sharedCache.mode` | `ALL` | JPA shared cache mode |
| `spring.jpa.properties.hibernate.generate_statistics` | `false` | Hibernate statistics |
| `spring.jpa.properties.hibernate.globally_quoted_identifiers` | `true` | Quote all identifiers in generated SQL |

---

## Logging Properties

| Property | Default | Description |
|---|---|---|
| `logging.level.org.springframework` | `INFO` | Spring Framework log level |
| `logging.level.com.viglet` | `INFO` | Viglet application log level |
| `logging.level.org.hibernate.stat` | `INFO` | Hibernate statistics log level |
| `logging.level.org.hibernate.SQL` | `INFO` | Hibernate SQL log level |
| `logging.file.name` | `store/logs/shio.log` | Log file path |
| `logging.logback.rollingpolicy.max-file-size` | `25MB` | Maximum log file size before rotation |
| `logging.logback.rollingpolicy.max-history` | `10` | Number of rotated log files to keep |

---

## File Upload Properties

| Property | Default | Description |
|---|---|---|
| `spring.servlet.multipart.max-file-size` | `1024MB` | Maximum file upload size |
| `spring.servlet.multipart.max-request-size` | `1024MB` | Maximum request size |
| `spring.mvc.async.request-timeout` | `3600000` | Async request timeout (ms) — 1 hour |

---

## UI Properties

| Property | Default | Description |
|---|---|---|
| `spring.web.resources.static-locations` | `classpath:/ui/public/` | Static resource locations |
| `spring.thymeleaf.prefix` | `classpath:/ui/templates/` | Thymeleaf template prefix |
| `spring.output.ansi.enabled` | `always` | ANSI color output in console |
| `spring.web.resources.chain.strategy.content.enabled` | `true` | Content-based versioning for static resources |
| `spring.web.resources.chain.strategy.content.paths` | `/js/**,/css/**,/img/**,/*.png` | Paths for content versioning |

---

## Mail Properties

| Property | Default | Description |
|---|---|---|
| `spring.mail.host` | `localhost` | SMTP server hostname |
| `spring.mail.port` | `587` | SMTP port |
| `spring.mail.username` | `localhost@localhost` | SMTP username |
| `spring.mail.password` | `password` | SMTP password |
| `spring.mail.properties.mail.smtp.auth` | `true` | Enable SMTP authentication |
| `spring.mail.properties.mail.smtp.starttls.enable` | `true` | Enable STARTTLS |
| `spring.mail.properties.mail.smtp.starttls.required` | `true` | Require STARTTLS |
| `spring.mail.properties.mail.smtp.ssl.enable` | `false` | Enable SSL |
| `spring.mail.test-connection` | `false` | Test mail connection on startup |

---

## Management Properties

| Property | Default | Description |
|---|---|---|
| `management.endpoints.web.exposure.include` | `*` | Exposed Spring Boot Actuator endpoints |

---

## Profiles

| Profile | Purpose |
|---|---|
| `production` | Default profile — optimized for production |
| `development` | Development mode with additional logging |
| `ui-dev` | Headless mode for frontend development with separate Vite dev server |

Set the active profile:

```properties
spring.profiles.active=production
```

---

## Related Pages

| Page | Description |
|---|---|
| [Installation Guide](./installation-guide.md) | Setup with Docker, JAR, or build from source |
| [Architecture Overview](./architecture-overview.md) | Component diagram and deployment topologies |
| [Developer Guide](./developer-guide.md) | Dev environment setup and contribution guide |

---
