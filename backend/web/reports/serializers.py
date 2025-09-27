from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    adverse_events = serializers.SerializerMethodField()
    class Meta:
        model = Report
        fields = ['id', 'drug', 'adverse_events', 'severity', 'outcome', 'processed_at']

    def get_adverse_events(self, obj):
        return obj.get_adverse_events()

