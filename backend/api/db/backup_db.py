import shutil
import datetime
import os
import glob
import schedule
import time
from dotenv import load_dotenv

load_dotenv()

DATABASE_PATH = os.getenv('DATABASE_PATH')
BACKUP_PATH = os.getenv('BACKUP_PATH')

backup_age_days = 7

def backup_database():
    os.makedirs(BACKUP_PATH, exist_ok=True)

    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"backup_{timestamp}.db"
    backup_path = os.path.join(BACKUP_PATH, backup_filename)

    shutil.copy2(DATABASE_PATH, backup_path)
    print(f"Backup created at: {backup_path}")

    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=backup_age_days)
    for backup_file in glob.glob(os.path.join(BACKUP_PATH, 'backup_*.db')):
        file_mtime = datetime.datetime.fromtimestamp(os.path.getmtime(backup_file))
        if file_mtime < cutoff_date:
            os.remove(backup_file)
            print(f"Removed old backup: {backup_file}")

schedule.every().day.at("00:00").do(backup_database)

while True:
    schedule.run_pending()
    time.sleep(60) 
