#!/usr/bin/env bash
gunicorn tests.wsgi:application
