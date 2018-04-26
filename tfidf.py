# -*- coding: utf-8 -*-

# source: http://blog.christianperone.com/2013/09/machine-learning-cosine-similarity-for-vector-space-models-part-iii/
from sklearn.feature_extraction.text import TfidfVectorizer


# TODO:
# - connect to sql
# - grab reviews for each restaurant
# - concatenate reviews for each restaurant
# - push them into reviews array below
# - keep track of the restaurantId -> index mapping
# - run the algorithm below and save the tfidf_matrix somewhere

reviews = [
# reviews for restaurant1,
# reviews for restaurant2,
# reviews for restaurant3,
# reviews for restaurant4
        ]

tfidf_vectorizer = TfidfVectorizer()
tfidf_matrix = tfidf_vectorizer.fit_transform(reviews)
print tfidf_matrix
