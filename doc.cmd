@echo off
call asciidoctor-pdf --base-dir docs docs\shio-developer-guide.adoc -a imagesdir=/ -o shio\shio-developer-guide.pdf
call asciidoctor-pdf --base-dir docs docs\shio-installation-guide.adoc -a imagesdir=/ -o shio\shio-installation-guide.pdf

call asciidoctor-pdf --base-dir docs docs\turing\0.3.5\turing-administration-guide.adoc -a imagesdir=/ -o turing\turing-administration-guide-0.3.5.pdf
call asciidoctor-pdf --base-dir docs docs\turing\0.3.5\turing-connectors.adoc -a imagesdir=/ -o turing\turing-connectors-0.3.5.pdf
call asciidoctor-pdf --base-dir docs docs\turing\0.3.5\turing-installation-guide.adoc -a imagesdir=/ -o turing\turing-installation-guide-0.3.5.pdf
call asciidoctor-pdf --base-dir docs docs\turing\0.3.5\turing-developer-guide.adoc -a imagesdir=/ -o turing\turing-developer-guide-0.3.5.pdf

call asciidoctor-pdf --base-dir docs docs\vecchio-developer-guide.adoc -a imagesdir=/ -o vecchio\vecchio-getting-started.pdf
call asciidoctor-pdf --base-dir docs docs\vecchio-getting-started.adoc -a imagesdir=/ -o vecchio\vecchio-getting-started.pdf
