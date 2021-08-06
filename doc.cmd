@echo off
REM call asciidoctor -D docs index.html.adoc -o index.html 
REM call asciidoctor -D docs administration-guide.adoc 
REM call asciidoctor -D docs connectors.adoc 
REM call asciidoctor -D docs installation-guide.adoc

call asciidoctor-pdf --base-dir docs docs\turing-administration-guide.adoc -a imagesdir=/ -o turing\turing-administration-guide.pdf
call asciidoctor-pdf --base-dir docs docs\turing-connectors.adoc -a imagesdir=/ -o turing\turing-connectors.pdf
call asciidoctor-pdf --base-dir docs docs\turing-installation-guide.adoc -a imagesdir=/ -o turing\turing-installation-guide.pdf
