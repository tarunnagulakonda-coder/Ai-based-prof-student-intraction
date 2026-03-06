from django.db import models

# Create your models here.

class Lecturer(models.Model):
    lecturer_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=100, default='busy')
    password = models.CharField(max_length=100, default='password123')

class ActivityLog(models.Model):
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE)
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lecturer.lecturer_name} - {self.status} at {self.location} ({self.timestamp})"
