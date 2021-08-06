@echo off
call asciidoctor-pdf --base-dir docs docs\shio-developer-guide.adoc -a imagesdir=/ -o shio\shio-getting-started.pdf
call asciidoctor-pdf --base-dir docs docs\shio-getting-started.adoc -a imagesdir=/ -o shio\shio-getting-started.pdf

call asciidoctor-pdf --base-dir docs docs\turing-administration-guide.adoc -a imagesdir=/ -o turing\turing-administration-guide.pdf
call asciidoctor-pdf --base-dir docs docs\turing-connectors.adoc -a imagesdir=/ -o turing\turing-connectors.pdf
call asciidoctor-pdf --base-dir docs docs\turing-installation-guide.adoc -a imagesdir=/ -o turing\turing-installation-guide.pdf

call asciidoctor-pdf --base-dir docs docs\vecchio-developer-guide.adoc -a imagesdir=/ -o vecchio\vecchio-getting-started.pdf
call asciidoctor-pdf --base-dir docs docs\vecchio-getting-started.adoc -a imagesdir=/ -o vecchio\vecchio-getting-started.pdf
