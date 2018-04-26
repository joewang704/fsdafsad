# dabbington-backend
Backend for Yelp Data visualization application.

## Setup

### Flask
Steps below are from the [official Flask documentation](http://flask.pocoo.org/docs/0.12/installation/).
Setting up a virtual environment and using the requirements.txt is highly recommended. This prevents package confusion that frequently occurs with global packages
and will make it much easier to debug problems with pip on your computer.

`virtualenv venv`

On OS X, do the following

`. venv/bin/activate`

If you are a windows user,

`venv\Scripts\activate`

To deactivate the virtual environment:

`deactivate`

After activating the virtual environment, run the following commands:

`sudo easy_install pip`, if you do not already have pip (you usually should).

`pip install -r requirements.txt`
NOTE: when adding new packages, run `pip freeze > requirements.txt` after to add to requirements.

To run the server, run `python app.py` and go to `localhost:5000` in your browser.

### MySQL
For Mac users:
`brew install mysql`
`brew services start mysql`

For Windows users, taken from the [MySQL site](https://dev.mysql.com/doc/refman/5.7/en/windows-installation.html):
1. Download the [MySQL Installer](http://dev.mysql.com/downloads/installer/) and execute it.
2. Choose "Developer Default" as your Setup Type.
3. Follow the instructions and complete the installation.

The next instructions are for setting up the database and user account. If you are on Windows, the steps could be done through MySQL workbench (without running any commands). If you are on Mac, simply run the commands.

Set password for root account, `mysqladmin -u root password 'poloisbae'`

Connect to MySQL using username `root` and password `poloisbae`, `mysql -uroot -ppoloisbae`

Once connected to MySQL, create a database with the name "db" `create database db;`

To import the data, download the Yelp dataset from here: https://www.yelp.com/dataset/download

Once downloaded use this command to import the data into the database (may take 5-10 min to import):

`mysql -uroot -ppoloisbae db < yelp_db.sql`

### Recommendation Endpoint
Download the cosine.sql and index.sql here which contains the result of training on 10605 restaurants:

business_cosine: https://drive.google.com/file/d/1nyuksX9Ht942XfFJxM1gdNX24hUh2qCl/view?usp=sharing

business_index: https://drive.google.com/file/d/1paildYInWCSlbIIt4Uvq0c0uX1R09Iox/view?usp=sharing

Import the table business_cosine with mappings from business id to cosine vectors using:

`mysql -uroot -ppoloisbae  yelp_db < cosine.sql`

Import the table business_index using:

`mysql -uroot -ppoloisbae  yelp_db < index.sql`

This table is used to determine which indices in the cosine vectors map to which businesses.

Run `python app.py`

Use postman to try a sample query:

Use this post data as json for example:

{"sources": [{"id": "-01XupAWZEXbdNbxNg5mEg"}], "exclude":[]}

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/0c4b7492254bd553ac5a)
