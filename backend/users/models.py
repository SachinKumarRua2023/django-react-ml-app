from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    department = models.CharField(max_length=100)
    salary = models.FloatField()

    class Meta:
        db_table = "employees"
        managed = True  # Django can handle migrations now

    def __str__(self):
        return self.name
