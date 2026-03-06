from django.urls import path

from . import views

urlpatterns =[
    path('',views.home,name='home'),
    path('api/lecturers/', views.api_lecturers, name='api_lecturers'),
    path('api/login/', views.api_login, name='api_login'),
]