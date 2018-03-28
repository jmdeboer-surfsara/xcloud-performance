# Xcloud performance testing

This project strives to create a reproducable setup with which to test different [OwnCloud](https://owncloud.org/) and [Nextcloud](https://nextcloud.com/) version next to one another using [Apache JMeter](https://jmeter.apache.org/).

The test does the following:

- Start off with a clean database
- Create an X number of users, usernames are user1, user2, etcetera
- Password is equal to username
- Do an X number of uploads for each user
- user1 shares a number of files with user2
- Propfinds are done for user2 with different number of shares

# Setup after cloning

After cloning the project, you need to copy two .dist files, and edit them to your needs:
- vars/main.yml.dist -> vars/main.yml
- roles/jmeter/files/xcloud-performance.properties.dist -> roles/jmeter/files/xcloud-performance.properties


## OwnCloud/NextCloud sources

To make sure the downloading of sources works without problems, it is advisible to create your own mirror; downloading from the vendors gave me some trouble. All sources are expected to be in zip format.

You can enter the location of sources in vars/main.yml

## Using in combination with Vagrant

Install [Ansible >=2.4](https://www.ansible.com/), [Vagrant](https://www.vagrantup.com/) and [VirtualBox](https://www.virtualbox.org/)

Note: You need the guest additions, you can install these with

`vagrant plugin install vagrant-vbguest`

- Make a clone of this project
- Enter the project directory
- Copy roles/jmeter/files/xcloud-performance.properties.dist to roles/jmeter/filesxcloud-performance.properties and edit
- Copy vars/main.yml.dist to vars/main.yml, edit if required
- Execute `vagrant up`
- Have some tea
- Execute `vagrant ssh` to log into the VM
- You can browse to the different installations on http://localhost:8080/*vendor*-*version*, i.e. http://localhost:8080/owncloud-10.0.7
- Current Owncloud versions are 8.2.11, 9.1.8, 10.0.3 and 10.0.7
- Current Nextcloud versions are 10.0.6, 11.0.4, 12.0.2 and 13.0.1
- Log on to the webinterface with admin/admin
- Send changes to the VM with `vagrant provision`

### Running the tests

To run the tests:

- Log into the VM with `vagrant ssh`
- `sudo /opt/apache-jmeter-*/run.sh *vendor* *versie*` to test a specific version
- `sudo /opt/apache-jmeter-*/all.sh` to test all versions

The tests run on a clean database, so all data is written by the test. You can also do an extra run with additional data applied. To do so, put a sql file in roles/jmeter/files/dumps, named *vendor*-*version*-extra.sql.

### Log MySQL queries

By passing a command line option, all queries are logged and written to the output directory:
- `sudo /opt/apache-jmeter-4.0/all.sh log-mysql`

or
- `sudo /opt/apache-jmeter-4.0/run.sh *vendor* *versie* log-mysql`

### Checking the results

When a test has run, a HTML report is written to *vagrant-dir*/data/jmeter/*vendor*-*versie*/html
(JMeter writes it to the shared folder)

The data of the optional second run are in *vagrant-dir*/data/jmeter/*vendor*-*versie*/html-extra

### Viewing/editting the tests

It's easiest if you log into the vagrant VM using X forwarding.

Start jmeter: /opt/apache-jmeter-*/bin/jmeter.sh

Open the file /vagrant/xcloud-performance.jmx. Now you can run the tests in the GUI. Changes can be committed to git on the Vagrant host.

### Running playbooks `vagrant provision`

You can also run the playbook directly, which is handy if you want to run certain tags only:

In the project directory:
`ansible-playbook provision.yml`


## Adding new versions

It is advisable to first set up the project in a working state. In this example we will add OwnCloud 10.0.7.

Add the new version to:
- vars/main.yml (use a random instanceid)

Now do a  `vagrant provision`. This will lead to an error.

- In a browser, navigate to the environment, http://localhost:8080/owncloud-10.0.7/
- Create an admin account with password 'admin'
- Configure the database, databasename, user and password similar to the other installation, in this case *owncloud-1007*
- Finish setup
- Log in using `vagrant ssh`
- Copy config.php of the new installation to the Vagrant host:
  `sudo cp /var/www/html/owncloud-10.0.7/config/config.php /vagrant/roles/xcloud/files/owncloud/config-10.0.7.php`
- Dump the database to the vagrant host:
  `mysqldump -u root owncloud-1007 | bzip2 > /vagrant/roles/jmeter/files/dumps/owncloud-1007.sql.bz2`
- Copy the instanceid from config.php to vars/main.yml
- Optional: Copy the contents of 'appdata_*instanceid*' naar xcloud/files/data/*vendor*_*version* (see for instance nextcloud-12.0.2)
- Add the new files to git.

### Testing the newly added version:

- Log in using `vagrant ssh`
- `sudo rm -rf /var/www/html/owncloud-10.0.7`
- `mysqladmin -u root drop owncloud-1007`
- Log off
- `vagrant provision`

This should now run without errors.


## TODO:

 - Check settings of the different daemons
 - Expand JMeter tests
 - ...


## Known issues:

- Downloading the JMeter zip file fails sometimes. A workaround is to download in manually on the VM and place it in /opt
