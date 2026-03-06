import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Lecturer

# Create your views here.
def home(request):
    return render(request,'index.html')

def api_lecturers(request):
    lecturers = Lecturer.objects.all().order_by('id')
    data = []
    for lec in lecturers:
        data.append({
            'id': str(lec.id),
            'name': lec.lecturer_name,
            'cabin': lec.location,
            'status': lec.status
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            username = body.get('username')
            password = body.get('password')
            
            # Simple credentials check
            user = Lecturer.objects.filter(lecturer_name=username, password=password).first()
            if not user and password:
                # Also try matching by exact ID if they typed ID instead of name
                try:
                    user = Lecturer.objects.filter(id=int(username), password=password).first()
                except ValueError:
                    pass

            if user:
                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': str(user.id),
                        'name': user.lecturer_name,
                        'cabin': user.location,
                        'status': user.status
                    }
                })
            else:
                return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=401)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    
    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_update_status(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            lecturer_id = body.get('id')
            new_status = body.get('status')
            new_location = body.get('cabin')

            lecturer = Lecturer.objects.filter(id=lecturer_id).first()
            if not lecturer:
                return JsonResponse({'success': False, 'error': 'Lecturer not found'}, status=404)

            # Update Lecturer
            lecturer.status = new_status
            lecturer.location = new_location
            lecturer.save()

            # Create Activity Log
            from .models import ActivityLog
            ActivityLog.objects.create(
                lecturer=lecturer,
                location=new_location,
                status=new_status
            )

            return JsonResponse({'success': True, 'message': 'Status updated successfully'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)


def api_suggestions(request):
    try:
        from .analytics import generate_ai_suggestions
        suggestions = generate_ai_suggestions()
        return JsonResponse({'suggestions': suggestions})
    except Exception as e:
        return JsonResponse({'suggestions': ["Error generating AI suggestions.", str(e)]})