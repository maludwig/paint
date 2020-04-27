#!/usr/bin/env bash

# Bomb out if things go wrong
set -e

# Non-interactive sessions lack basic variables
cd ~
export HOME="$(pwd)"
export USER="$(whoami)"

APP_HOME='/opt/mp'
APP_DIR="$APP_HOME/paint"
VENV_DIR="$APP_HOME/venv"

VHOST_CONF='
<VirtualHost *:80>
  DocumentRoot "/opt/mp/paint/public"
  ServerAdmin multiplayerpaint.com
  <Directory "/opt/mp/paint">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
'

function setup_php() {
  if ! which php; then
    amazon-linux-extras install -y php7.4
    yum install -y php-mbstring php-xml
  else
    echo "PHP is already installed"
    php --version
  fi
  if ! which composer; then
    cd "$APP_DIR"
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php -r "if (hash_file('sha384', 'composer-setup.php') === 'e0012edf3e80b6978849f5eff0d4b4e4c79ff1609dd1e613307e16318854d24ae64f26d17af3ef0bf7cfb710ca74755a') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
    php composer-setup.php
    php -r "unlink('composer-setup.php');"
    mv "$APP_DIR/composer.phar" /usr/local/bin/composer
  fi
  echo "$VHOST_CONF" >  /etc/httpd/conf.d/mp-vhost.conf
}
function setup_node() {
  if ! which node; then
    yum install -y httpd gcc-c++ make
    curl -sL https://rpm.nodesource.com/setup_12.x | sudo -E bash -
    yum install -y nodejs
  else
    echo "node is already installed"
    node --version
  fi
}

function setup_app() {
  yum update -y
  if ! which git; then
    yum install git python3 jq -y
  fi
  if ! which python3; then
    yum install git python3 jq -y
  fi
  if ! which jq; then
    yum install git python3 jq -y
  fi

  if ! [[ -d /root/bashrc.extensions ]]; then
    git clone https://github.com/maludwig/bashrc /tmp/bashrc
    /tmp/bashrc/install
  fi

  if ! [[ -d "$APP_HOME" ]]; then
    useradd --home-dir "$APP_HOME" --create-home paint
  fi

  # Setup app
  if ! [[ -d "$APP_DIR" ]]; then
    git clone https://github.com/maludwig/paint.git "$APP_DIR"
  fi
  cd "$APP_DIR"
  git pull origin master

  # Create python venv
  python3 -m venv "$VENV_DIR"
  source "$VENV_DIR/bin/activate"
  pip install -r "$APP_DIR/ops/requirements.txt"
  python "$APP_HOME/paint/ops/secrets.py" --template-env

  setup_node
  setup_php

  cd "$APP_DIR"
  npm install
  composer install

  chown -R apache:apache "$APP_HOME"
  systemctl restart httpd
}

setup_app | tee -a /var/log/setup_app.log
