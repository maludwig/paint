#!/usr/bin/env bash

# Bomb out if things go wrong
set -e

# Non-interactive sessions lack basic variables
cd ~
export HOME="$(pwd)"
export USER="$(whoami)"

function setup_app() {
  yum update -y
  if ! which git; then
    yum install git python3 mariadb jq -y
  fi
  if ! which python3; then
    yum install git python3 mariadb jq -y
  fi
  if ! which mysql; then
    yum install git python3 mariadb jq -y
  fi
  if ! which jq; then
    yum install git python3 mariadb jq -y
  fi

  if ! [[ -d /root/bashrc.extensions ]]; then
    git clone https://github.com/maludwig/bashrc /tmp/bashrc
    /tmp/bashrc/install
  fi

  pip3 install ansible

}

setup_app | tee -a /var/log/setup_app.log
