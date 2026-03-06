from datetime import datetime, timedelta
from django.db.models import Count
from django.utils import timezone
from .models import Lecturer, ActivityLog

def get_availability_predictions():
    suggestions = []
    lecturers = Lecturer.objects.all()

    for lecturer in lecturers:
        # Find logs where status is 'Available'
        logs = ActivityLog.objects.filter(lecturer=lecturer, status__iexact='Available')
        if not logs.exists():
            continue
        
        # Analyze the most common hours
        hour_counts = {}
        for log in logs:
            hour = log.timestamp.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        if hour_counts:
            # Find the hour with the most 'Available' records
            best_hour = max(hour_counts, key=hour_counts.get)
            
            # Format time
            start_time = datetime.strptime(str(best_hour), "%H").strftime("%I %p")
            end_time = datetime.strptime(str((best_hour + 2) % 24), "%H").strftime("%I %p")
            
            suggestions.append(f"{lecturer.lecturer_name} is usually available around {start_time} - {end_time}")

    return suggestions

def get_crowd_predictions():
    suggestions = []
    
    # Simple logic: Group current lecturers by location where status is 'Busy' or 'In Class'
    busy_locations = Lecturer.objects.filter(status__in=['Busy', 'In Class', 'busy', 'in class']).values('location').annotate(count=Count('id')).order_by('-count')
    available_locations = Lecturer.objects.filter(status__in=['Available', 'available']).values('location').annotate(count=Count('id')).order_by('-count')

    if busy_locations:
        busiest = busy_locations[0]
        if busiest['count'] > 0:
            msg = f"{busiest['location']} is currently crowded."
            
            if available_locations and available_locations[0]['location'] != busiest['location']:
                alt_loc = available_locations[0]['location']
                msg += f" Try {alt_loc} instead."
                
            suggestions.append(msg)
            
    return suggestions

def generate_ai_suggestions():
    # Combine predictions
    suggestions = []
    
    availability = get_availability_predictions()
    crowd = get_crowd_predictions()
    
    suggestions.extend(availability)
    suggestions.extend(crowd)
    
    # If no data yet, provide fallback
    if len(suggestions) == 0:
        suggestions.append("Not enough data to generate patterns yet. Keep updating statuses!")
        
    return suggestions
