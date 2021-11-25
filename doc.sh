#!/bin/bash

asciidoctor-pdf --base-dir docs docs/shio-developer-guide.adoc -a imagesdir=/ -o shio/shio-getting-started.pdf
asciidoctor-pdf --base-dir docs docs/shio-installation-guide.adoc -a imagesdir=/ -o shio/shio-installation-guide.pdf

asciidoctor-pdf --base-dir docs docs/turing-administration-guide.adoc -a imagesdir=/ -o turing/turing-administration-guide.pdf
asciidoctor-pdf --base-dir docs docs/turing-connectors.adoc -a imagesdir=/ -o turing/turing-connectors.pdf
asciidoctor-pdf --base-dir docs docs/turing-installation-guide.adoc -a imagesdir=/ -o turing/turing-installation-guide.pdf
asciidoctor-pdf --base-dir docs docs/turing-developer-guide.adoc -a imagesdir=/ -o turing/turing-developer-guide.pdf

asciidoctor-pdf --base-dir docs docs/vecchio-developer-guide.adoc -a imagesdir=/ -o vecchio/vecchio-getting-started.pdf
asciidoctor-pdf --base-dir docs docs/vecchio-getting-started.adoc -a imagesdir=/ -o vecchio/vecchio-getting-started.pdf