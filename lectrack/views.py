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