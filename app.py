# I HAVE CLAIMED THIS CODE IN THE NAME OF BEME!
# SURRENDER AND PLACE YOUR COMPUTER ON YOUR CHIN MUAHAHAHAHA
from flask import Flask, render_template, request
from flask_mysqldb import MySQL
from flask import jsonify
import numpy as np
from urllib import unquote

import os

app = Flask(__name__)
# Allows us to connect to local database server
app.config.update(
  DEBUG=True,
  TEMPLATES_AUTO_RELOAD=True,
  MYSQL_USER='root',
  MYSQL_PASSWORD='poloisbae',
  MYSQL_DB='yelp_db'
)
mysql = MySQL(app)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/testDbConn')
def testDbConn():
    cur = mysql.connection.cursor()
    return 'success!'


@app.route('/search', methods=['GET'])
def search():
    # TODO: return a suggested restaurant id based on a partial query
    # below from
    # https://stackoverflow.com/questions/24892035/python-flask-how-to-get-parameters-from-a-url
    partial_name = unquote(request.args.get('name'))
    print(partial_name)
    cur = mysql.connection.cursor()
    query = "select business.id, business.name, business.stars, business.city, business.state from business join category on business.id = category.business_id where business.name like '%" + mysql.connection.escape_string(partial_name) + "%' and category.category='Restaurants' and business.state='AZ' limit 20"; print query
    cur.execute(query)
    data = cur.fetchall()
    result = map(lambda x: { "id": x[0], "name": x[1], "stars": x[2], "city": x[3], "state": x[4] }, data)
    # result = get_recommendation(business_ids, exclude_business_ids)
    return jsonify(result)

# Request data format:
# {sources: [{"id": business_id,...},{"id": business_id,...}, ] exclude:[{"id": business_id,...}]}
@app.route('/recommendation', methods=['POST'])
def recommendation():
    cur = mysql.connection.cursor()
    data = request.get_json()
    sources = data['sources']
    exclude = data['exclude']
    business_ids = map(lambda x: x['id'].encode("ascii"), sources)
    exclude_business_ids = map(lambda x: x['id'].encode("ascii"), exclude)
    # Check for SQL injection. Currently makes sure that input has no spaces
    # (any SQL query would have spaces)
    # TODO: put into separate function and perhaps expand on it
    for id in business_ids:
        if (' ' in id):
            raise ValueError('SQL injection may have been attempted.');

    result = get_recommendation(business_ids, exclude_business_ids)
    return jsonify(result)

def get_recommendation(source_ids, exclude_ids):
    cur = mysql.connection.cursor()
    # get cosine vector
    query = "select cosine from business_cosine where business_id in ('" + "','".join(map(str, source_ids)) + "')"
    cur.execute(query)
    cosine_vector_str = cur.fetchall()
    cosine_vectors = map(lambda x: np.loads(x[0]), cosine_vector_str)
    cosine_vector = np.sum(cosine_vectors, axis=0)

    # filter out seen businesses and get top 10
    res = np.argsort(cosine_vector).flatten()
    remove_ids = source_ids + exclude_ids
    query = "select m_index from business_index where business_id in ('" + "','".join(map(str, remove_ids)) + "')"
    cur.execute(query)
    remove_indices = cur.fetchall()
    remove_indices = np.array(remove_indices).flatten()
    remove_idx = map(lambda x: np.where(res == x), remove_indices)
    res = np.delete(res, remove_idx, axis=0)
    top_indices = res[::-1][0:10]

    # return data
    query = "select business.name, business.id from business join business_index on business.id = business_index.business_id where m_index in " + str(tuple(top_indices)) #idk if this works
    cur.execute(query)
    data = cur.fetchall()
    data = map(lambda x: { "id": x[1], "name": x[0] }, data)
    return data



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
