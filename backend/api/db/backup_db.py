import os
import glob
import schedule
import time
import subprocess
from dotenv import load_dotenv
import datetime

load_dotenv()


# Environment variables for PostgreSQL connection and backup paths
DB_NAME = os.getenv('POSTGRES_DB')
DB_USER = os.getenv('POSTGRES_USER')
DB_PASSWORD = os.getenv('POSTGRES_PASSWORD')
BACKUP_PATH = os.getenv('BACKUP_PATH')

backup_age_days = 7

def backup_database():
    os.makedirs(BACKUP_PATH, exist_ok=True)

    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"backup_{timestamp}.sql"
    backup_path = os.path.join(BACKUP_PATH, backup_filename)

    # Command to backup the PostgreSQL database
    pg_dump_command = [
        'pg_dump',
        '-U', DB_USER,
        '-F', 'c',  # Custom format
        '--no-password',  # Skip password prompt
        '-f', backup_path,
        DB_NAME
    ]

    # Set environment variable for password
    os.environ['PGPASSWORD'] = DB_PASSWORD

    # Execute the pg_dump command
    try:
        subprocess.run(pg_dump_command, check=True)
        print(f"Backup created at: {backup_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error during backup: {e}")

    # Remove old backups
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=backup_age_days)
    for backup_file in glob.glob(os.path.join(BACKUP_PATH, 'backup_*.sql')):
        file_mtime = datetime.datetime.fromtimestamp(os.path.getmtime(backup_file))
        if file_mtime < cutoff_date:
            os.remove(backup_file)
            print(f"Removed old backup: {backup_file}")

# Schedule the backup to run daily at midnight
schedule.every().day.at("00:00").do(backup_database)

# Main loop to run scheduled tasks
while True:
    schedule.run_pending()
    time.sleep(60)
