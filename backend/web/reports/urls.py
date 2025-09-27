from django.urls import path
from .views import ProcessReportView, ReportListView, TranslateView # Added TranslateView

urlpatterns = [
    path('process-report', ProcessReportView.as_view(), name='process-report'),
    path('reports', ReportListView.as_view(), name='reports-list'),
    path('translate', TranslateView.as_view(), name='translate'), # New endpoint
]