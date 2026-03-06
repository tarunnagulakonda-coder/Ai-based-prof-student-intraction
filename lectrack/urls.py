from django.urls import path

from . import views

urlpatterns =[
    path('',views.home,name='home'),
    path('api/lecturers/', views.api_lecturers, name='api_lecturers'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/update_status/', views.api_update_status, name='api_update_status'),
    path('api/suggestions/', views.api_suggestions, name='api_suggestions'),
]