from django.db import models

# Create your models here.

class Lecturer(models.Model):
    lecturer_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=100, default='busy')
    password = models.CharField(max_length=100, default='password123')
