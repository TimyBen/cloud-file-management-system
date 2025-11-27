#!/usr/bin/env bash
set -e
OUT_DIR=./certs
mkdir -p $OUT_DIR

# 1) Private key (PEM)
openssl genrsa -out $OUT_DIR/service_account.key.pem 4096

# 2) Public key (PEM)
openssl rsa -in $OUT_DIR/service_account.key.pem -pubout -out $OUT_DIR/service_account.pub.pem

echo "Generated keys in $OUT_DIR"
