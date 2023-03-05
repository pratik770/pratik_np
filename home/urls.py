from django.contrib import admin
from django.urls import path, include
from home import views


urlpatterns = [
    path("", views.index, name='home'),
    path("user", views.user, name='user'),    
    path("pratik", views.pratik, name='pratik'),    
    
]
