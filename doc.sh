#!/bin/bash
#asciidoctor -D docs index.html.adoc -o index.html 
#asciidoctor -D docs administration-guide.adoc 
#asciidoctor -D docs connectors.adoc 
#asciidoctor -D docs installation-guide.adoc
asciidoctor-pdf --base-dir docs docs/turing-administration-guide.adoc -a imagesdir=/ -o turing/turing-administration-guide.pdf
asciidoctor-pdf --base-dir docs docs/turing-connectors.adoc -a imagesdir=/ -o turing/turing-connectors.pdf
asciidoctor-pdf --base-dir docs docs/turing-installation-guide.adoc -a imagesdir=/ -o turing/turing-installation-guide.pdf