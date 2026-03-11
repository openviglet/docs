---
sidebar_position: 4
title: Developer Guide
description: Viglet Turing ES Developer Guide
---

# Viglet Turing ES: Developer Guide

Viglet Turing ES ([https://viglet.com/turing](https://viglet.com/turing)) is an open source solution ([https://github.com/openviglet](https://github.com/openviglet)), which has Semantic Navigation and Chatbot as its main features. You can choose from several NLPs to enrich the data. All content is indexed in Solr as search engine.

## More Documentation

Technical documentation on Turing ES is available at [https://docs.viglet.com/turing](https://docs.viglet.com/docs/turing).

## Open Source Development

You can collaborate with Turing, participating in its development. Below are the steps to create your Turing environment.

### Development Structure

#### Frameworks

Turing ES was developed using [Spring Boot](https://spring.io/projects/spring-boot) for its backend.

The UI is currently using [AngularJS](https://angularjs.org), but a new UI is being developed using [Angular 12](https://angular.io) with [Primer CSS](https://primer.style/css).

In addition to Java, you also need to have [Git](https://git-scm.com/downloads) and [NodeJS](https://nodejs.org/en/download/) installed.

#### Databases

By default it uses the [H2 database](https://www.h2database.com), but can be changed to other databases using Spring Boot properties. It comes bundled with [OpenNLP](https://opennlp.apache.org/) in the same JVM.

#### Programming Language and Deploy

It uses [Java 17](https://adoptium.net/temurin/releases/?package=jdk&version=17) and its deployment is done with Gradle 7.5.1 and works on Unix and Windows.

#### Docker

To use Semantic Navigation and Chatbot you must have a [Solr](https://solr.apache.org) service available. If you prefer to work with all the services Turing depends on, you can use [docker-compose](https://docs.docker.com/compose/install) to start these services, we use the [Docker Desktop](https://www.docker.com/products/docker-desktop) installed on computer.

#### IDE

You can use [Spring Tools 4 for Eclipse](https://spring.io/tools) or [Eclipse](https://www.eclipse.org/downloads/) or [Visual Studio Code](https://code.visualstudio.com/) or [IntelliJ](https://www.jetbrains.com/pt-br/idea/) as IDEs.

### Download

Use the git command line to download the repository to your computer.

#### Turing Server and Connectors

```shell
git clone https://github.com/openviglet/turing.git
```

### Run during Development

To run Turing ES, execute the following lines:

#### Turing Server

##### Development

###### With UI

```shell
cd turing
./gradlew turing-app:bootrun
```

###### Without update UI

```shell
cd turing
./gradlew turing-app:bootrun -Pno-ui
```

##### New Turing UI

Start the Turing Server using dev-ui profile:

```shell
cd turing
./gradlew turing-app:bootrun --args='--spring.profiles.active=dev-ui' -Pno-ui
```

And start one of the components of turing-ui:

```shell
cd turing/turing-ui

## Console
ng serve console

## Search
ng serve sn

## Chatbot
ng serve converse

## Welcome
ng serve welcome
```

:::important
You need to start the Turing Server and Solr first.
:::

##### Build

```shell
cd turing
./gradlew turing-app:build
```

#### Java SDK

##### Development

```shell
cd turing-java-sdk
./gradlew build
java -cp build/libs/turing-java-sdk-all.jar com.viglet.turing.client.sn.sample.TurSNClientSample
```

:::important
You need to start the Turing Server and Solr first.
:::

##### Build

```shell
cd turing-java-sdk
./gradlew build
```

Or use jitpack in your project at [https://jitpack.io/#openviglet/turing-java-sdk](https://jitpack.io/#openviglet/turing-java-sdk)

#### WEM Listener

```shell
cd turing
./gradlew turing-wem:shadowJar
```

For development, copy the `turing-wem/build/libs/turing-wem-all.jar` into `WEM_DIR/libs` and test the listener using turing-wem command line.

#### Database Connector

```shell
cd turing
./gradlew turing-jdbc:shadowJar
```

#### Filesystem Connector

```shell
cd turing
./gradlew turing-filesystem:shadowJar
```

#### Nutch

##### Nutch 1.18

```shell
cd turing/
./gradlew turing-nuch:nutch1_18:packageDistribution
```

### URLs

#### Turing Server

- Administration Console: [http://localhost:2700](http://localhost:2700) (admin/admin)
- Semantic Navigation Sample: [http://localhost:2700/sn/Sample](http://localhost:2700/sn/Sample)

#### New Turing UI

- Welcome: [http://localhost:4200/welcome](http://localhost:4200/welcome)
- Console: [http://localhost:4200/console](http://localhost:4200/console)
- Search Page: [http://localhost:4200/sn/template?_setsite=Sample&_setlocale=en_US](http://localhost:4200/sn/template?_setsite=Sample&_setlocale=en_US)
- Converse: [http://localhost:4200/converse](http://localhost:4200/converse)

#### Docker Compose

- Administration Console: [http://localhost](http://localhost) (admin/admin)
- Semantic Navigation Sample: [http://localhost/sn/Sample](http://localhost/sn/Sample)
- Solr: [http://localhost:8983](http://localhost:8983)

### Code Quality

You can check the quality of Turing Code at:

- [SonarCloud](https://sonarcloud.io/organizations/viglet-turing/projects)
- [Github Actions](https://github.com/openviglet/turing/actions)
- [Github Security](https://github.com/openviglet/turing/security/code-scanning)
- [Codecov](https://app.codecov.io/gh/openviglet/turing)

