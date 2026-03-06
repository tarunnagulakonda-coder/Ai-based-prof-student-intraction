#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Automatically load the AI History Data without needing a shell
python manage.py load_data

# Automatically create a Superuser without needing a shell (Render Free Tier Workaround)
export DJANGO_SUPERUSER_PASSWORD=admin
python manage.py createsuperuser --noinput --username admin --email admin@example.com || true
