#!/bin/sh

apt-get update

#server

yes|apt-get install apache2 php5 php5-cli libapache2-mod-php5 curl php5-curl

#symlink

rm /var/www/index.html
ln -s /vagrant/public /var/www/consensus

#add vhost

cp /vagrant/consensus-vhost /etc/apache2/sites-available/consensus
a2dissite 000-default
a2ensite consensus
service apache2 reload

#enable mod-rewrite

a2enmod rewrite
service apache2 restart

#node.js

apt-get update
yes|apt-get install python-software-properties python g++ make
add-apt-repository ppa:chris-lea/node.js
apt-get update
yes|apt-get install nodejs

#mongo

cd /tmp
wget http://fastdl.mongodb.org/linux/mongodb-linux-x86_64-2.4.3.tgz
tar -xvzf mongodb-linux-x86_64-2.4.3.tgz
cd mongodb-linux-x86_64-2.4.3/
mv bin/* /usr/bin
chown vagrant:vagrant /usr/bin/mongo*
chown vagrant:vagrant /usr/bin/bsondump
mkdir -p /data/db
sudo chown -R vagrant:vagrant /data/db

#mongo php

cd /tmp
wget https://github.com/mongodb/mongo-php-driver/archive/master.zip
yes|apt-get install unzip php5-dev
unzip -e master.zip
cd mongo-php-driver-master/
phpize
./configure
make
make install
echo "extension=mongo.so" >> /etc/php5/apache2/php.ini
