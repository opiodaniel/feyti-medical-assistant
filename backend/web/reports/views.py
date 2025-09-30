# reports/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .processor import extract_fields
from rest_framework import serializers
from .models import Report

from rest_framework.generics import ListAPIView
from .models import Report
from .serializers import ReportSerializer

from .processor import extract_fields, translate_outcome

class ReportListView(ListAPIView):
    """
    GET /reports to fetch all past reports.
    """
    queryset = Report.objects.all().order_by('-processed_at')
    serializer_class = ReportSerializer

# Update ProcessReportView to save the data:
class ProcessReportView(APIView):
    def post(self, request, *args, **kwargs):

        report_text = request.data.get('report')

        print('patient_report:  ', report_text)

        if not report_text:
            return Response({"error": "No 'report' field in input."},
                            status=status.HTTP_400_BAD_REQUEST)
        processed_data = extract_fields(report_text)

        # Save to DB (Bonus 4a)
        Report.objects.create(
            drug=processed_data['drug'],
            adverse_events_list=','.join(processed_data['adverse_events']),
            severity=processed_data['severity'],
            outcome=processed_data['outcome']
        )

        return Response(processed_data, status=status.HTTP_200_OK)


class TranslateView(APIView):
    """
    POST /translate to translate an outcome.
    Input: {"outcome": "recovered", "lang": "fr"}
    Output: {"translation": "récupéré"}
    """
    def post(self, request, *args, **kwargs):
        outcome = request.data.get('outcome')
        lang = request.data.get('lang')

        if not outcome or not lang:
            return Response({"error": "Missing 'outcome' or 'lang'"},
                            status=status.HTTP_400_BAD_REQUEST)

        translation = translate_outcome(outcome, lang.lower())

        return Response({"translation": translation}, status=status.HTTP_200_OK)