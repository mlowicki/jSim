#!/bin/sh
yuidoc_home=./yuidoc
parser_in=./src/jsim
parser_out=./yuidoc/parser
generator_out=./yuidoc/out
template=$yuidoc_home/template
version=0.1
project=jSim
yuiversion=2

$yuidoc_home/bin/yuidoc.py $parser_in -p $parser_out -o $generator_out -t $template -v $version -m $project -Y $yuiversion
