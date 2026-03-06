import os
import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from lectrack.models import Lecturer, ActivityLog
from django.utils.timezone import make_aware

class Command(BaseCommand):
    help = 'Load historical lecturer activity from data.txt'

    def handle(self, *args, **kwargs):
        file_path = 'data.txt'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File {file_path} not found.'))
            return

        # First, ensure these lecturers exist so ForeignKeys don't fail
        lecturer_names = ['Dr. Smith', 'Prof. Doe', 'Dr. Jones', 'Dr. Brown']
        for name in lecturer_names:
            Lecturer.objects.get_or_create(lecturer_name=name, defaults={'location': 'Unknown', 'status': 'Unknown'})

        count = 0
        with open(file_path, 'r', encoding='utf-8') as f:
            # Skip empty line and header
            lines = f.readlines()[2:]
            
            for line in lines:
                if not line.strip() or line.strip() == '```':
                    continue
                    
                parts = line.strip().split(',')
                if len(parts) >= 4:
                    name = parts[0]
                    location = parts[1]
                    status = parts[2]
                    timestamp_str = parts[3]
                    
                    try:
                        dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                        aware_dt = make_aware(dt) # Make timezone aware for Django
                        
                        lecturer = Lecturer.objects.filter(lecturer_name=name).first()
                        if lecturer:
                            # We update the creation date explicitly by bypassing auto_now_add
                            log = ActivityLog(
                                lecturer=lecturer,
                                location=location,
                                status=status
                            )
                            # Set attribute and save
                            log.save()
                            # Now force the timestamp to match the historical data
                            ActivityLog.objects.filter(id=log.id).update(timestamp=aware_dt)
                            count += 1
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'Failed to parse row {line}: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {count} historical records!'))
