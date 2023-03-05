from django.shortcuts import render, HttpResponse

# Create your views here.

def index(request):
    return HttpResponse("this is home page")

def user(request):
    return HttpResponse("this is user")

def pratik(request):
    return HttpResponse("this is pratik")