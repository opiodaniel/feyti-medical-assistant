from django.db import models
from django.contrib.postgres.fields import ArrayField # Use this for PostgreSQL

# Since we use SQLite (default Django), we'll store events as a comma-separated string
class Report(models.Model):
    drug = models.CharField(max_length=100)
    adverse_events_list = models.TextField() # Stores as "nausea,headache"
    severity = models.CharField(max_length=20)
    outcome = models.CharField(max_length=20)
    processed_at = models.DateTimeField(auto_now_add=True)

    def get_adverse_events(self):
        return [e.strip() for e in self.adverse_events_list.split(',') if e.strip()]

    def __str__(self):
        return f"{self.drug} - {self.outcome}"